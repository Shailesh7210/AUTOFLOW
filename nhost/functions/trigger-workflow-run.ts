import { Request, Response } from 'express';
import { hasuraRequest } from './lib/hasuraClient';
import { checkAndIncrementQuota } from './lib/quota';
import { getUserOrgRole } from './lib/permissions';
import { executeLlmCallStep } from './lib/steps/llmCall';
import { executeHttpRequestStep } from './lib/steps/httpRequest';
import { executeDbWriteStep } from './lib/steps/dbWrite';
import { executeNotifyStep } from './lib/steps/notify';
import { executeConditionalBranchStep } from './lib/steps/conditionalBranch';
import { executeApprovalGateStep } from './lib/steps/approvalGate';

export default async function handleTriggerWorkflowRun(req: Request, res: Response) {
  try {
    const { workflow_id } = req.body.input || {};
    const sessionUserId = req.headers['x-hasura-user-id'] as string || '00000000-0000-0000-0000-000000000001';

    if (!workflow_id) {
      return res.status(400).json({ message: 'Missing workflow_id input parameter' });
    }

    // 1. Query workflow details & steps
    const getWorkflowQuery = `
      query GetWorkflowDetails($id: uuid!) {
        workflows_by_pk(id: $id) {
          id
          name
          org_id
          steps(order_by: { step_order: asc }) {
            id
            name
            step_order
            type
            config
            type_role
          }
        }
      }
    `;

    const workflowData = await hasuraRequest(getWorkflowQuery, { id: workflow_id });
    const workflow = workflowData.workflows_by_pk;

    if (!workflow) {
      return res.status(404).json({ message: 'Workflow not found' });
    }

    // 2. Verify Caller Role in Org (Layer 1 check)
    const userRole = await getUserOrgRole(sessionUserId, workflow.org_id);
    if (!userRole || (userRole !== 'owner' && userRole !== 'editor')) {
      return res.status(403).json({ message: 'Unauthorized: Viewer role cannot trigger workflow runs' });
    }

    // 3. Verify Org Quota
    const quotaCheck = await checkAndIncrementQuota(workflow.org_id);
    if (!quotaCheck.allowed) {
      return res.status(429).json({ message: quotaCheck.reason });
    }

    // 4. Create workflow_run row
    const createRunMutation = `
      mutation CreateWorkflowRun($workflowId: uuid!, $orgId: uuid!, $startedBy: uuid!) {
        insert_workflow_runs_one(object: {
          workflow_id: $workflowId,
          org_id: $orgId,
          started_by: $startedBy,
          status: "running"
        }) {
          id
          status
        }
      }
    `;

    const runData = await hasuraRequest(createRunMutation, {
      workflowId: workflow.id,
      orgId: workflow.org_id,
      startedBy: sessionUserId,
    });
    const runId = runData.insert_workflow_runs_one.id;

    // 5. Create initial step_runs rows in pending state
    for (const step of workflow.steps) {
      const createStepRunMutation = `
        mutation CreateStepRun($runId: uuid!, $stepId: uuid!) {
          insert_step_runs_one(object: {
            workflow_run_id: $runId,
            step_id: $stepId,
            status: "pending"
          }) {
            id
          }
        }
      `;
      await hasuraRequest(createStepRunMutation, { runId, stepId: step.id });
    }

    // 6. Execute step loop asynchronously / sequentially
    executeStepsLoop(runId, workflow.steps).catch((err) =>
      console.error('Error executing step loop:', err)
    );

    return res.status(200).json({
      success: true,
      workflow_run_id: runId,
      status: 'running',
      message: 'Workflow execution initiated successfully.',
    });
  } catch (error: any) {
    console.error('triggerWorkflowRun Action error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}

export async function executeStepsLoop(runId: string, steps: any[], startFromIndex: number = 0) {
  let previousOutput: any = null;

  // Query existing step_runs for this run
  const getStepRunsQuery = `
    query GetStepRuns($runId: uuid!) {
      step_runs(where: { workflow_run_id: { _eq: $runId } }) {
        id
        step_id
        status
        output
      }
    }
  `;
  const stepRunsData = await hasuraRequest(getStepRunsQuery, { runId });
  const stepRunsMap = new Map(stepRunsData.step_runs.map((sr: any) => [sr.step_id, sr]));

  for (let i = startFromIndex; i < steps.length; i++) {
    const step = steps[i];
    const stepRun: any = stepRunsMap.get(step.id);
    if (!stepRun) continue;

    const stepRunId = stepRun.id;

    // Update status to running
    await updateStepRun(stepRunId, { status: 'running', started_at: new Date().toISOString() });

    let result: any = null;
    let isPaused = false;
    let hasError = false;
    let errorMessage = '';

    try {
      if (step.type === 'llm_call') {
        const res = await executeLlmCallStep(step.config, previousOutput);
        result = res.result;
        if (res.error) {
          hasError = true;
          errorMessage = res.error;
        }
      } else if (step.type === 'http_request') {
        const res = await executeHttpRequestStep(step.config, previousOutput);
        result = res.result;
        if (res.error) {
          hasError = true;
          errorMessage = res.error;
        }
      } else if (step.type === 'db_write') {
        result = await executeDbWriteStep(step.config, previousOutput);
      } else if (step.type === 'notify') {
        result = await executeNotifyStep(step.config, previousOutput);
      } else if (step.type === 'conditional_branch') {
        result = await executeConditionalBranchStep(step.config, previousOutput);
      } else if (step.type === 'approval_gate') {
        result = await executeApprovalGateStep(step.config);
        isPaused = true;
      }
    } catch (err: any) {
      hasError = true;
      errorMessage = err.message || 'Step execution failed';
    }

    if (isPaused) {
      // Pause step run and workflow run
      await updateStepRun(stepRunId, { status: 'paused', output: result });
      await updateWorkflowRun(runId, { status: 'paused' });
      return; // Stop execution until approved
    }

    if (hasError) {
      await updateStepRun(stepRunId, {
        status: 'failed',
        error: errorMessage,
        completed_at: new Date().toISOString(),
      });
      await updateWorkflowRun(runId, {
        status: 'failed',
        error_message: `Failed at step "${step.name}": ${errorMessage}`,
        completed_at: new Date().toISOString(),
      });
      return;
    }

    // Step completed successfully
    previousOutput = result;
    await updateStepRun(stepRunId, {
      status: 'completed',
      output: result,
      completed_at: new Date().toISOString(),
    });
  }

  // All steps completed
  await updateWorkflowRun(runId, {
    status: 'completed',
    completed_at: new Date().toISOString(),
  });
}

async function updateStepRun(id: string, payload: Record<string, any>) {
  const mutation = `
    mutation UpdateStepRun($id: uuid!, $changes: step_runs_set_input!) {
      update_step_runs_by_pk(pk_columns: { id: $id }, _set: $changes) {
        id
        status
      }
    }
  `;
  await hasuraRequest(mutation, { id, changes: payload });
}

async function updateWorkflowRun(id: string, payload: Record<string, any>) {
  const mutation = `
    mutation UpdateWorkflowRun($id: uuid!, $changes: workflow_runs_set_input!) {
      update_workflow_runs_by_pk(pk_columns: { id: $id }, _set: $changes) {
        id
        status
      }
    }
  `;
  await hasuraRequest(mutation, { id, changes: payload });
}
