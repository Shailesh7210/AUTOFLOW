import { Request, Response } from 'express';
import { hasuraRequest } from './lib/hasuraClient';
import { getUserOrgRole } from './lib/permissions';
import { executeStepsLoop } from './trigger-workflow-run';

export default async function handleApproveStep(req: Request, res: Response) {
  try {
    const { step_run_id } = req.body.input || {};
    const sessionUserId = req.headers['x-hasura-user-id'] as string || '00000000-0000-0000-0000-000000000001';

    if (!step_run_id) {
      return res.status(400).json({ message: 'Missing step_run_id input parameter' });
    }

    // 1. Fetch step_run, workflow_run, and workflow steps details
    const getStepRunQuery = `
      query GetStepRunForApproval($id: uuid!) {
        step_runs_by_pk(id: $id) {
          id
          status
          step_id
          workflow_run_id
          workflow_run {
            id
            org_id
            status
            workflow {
              id
              steps(order_by: { step_order: asc }) {
                id
                name
                step_order
                type
                config
              }
            }
          }
        }
      }
    `;

    const data = await hasuraRequest(getStepRunQuery, { id: step_run_id });
    const stepRun = data.step_runs_by_pk;

    if (!stepRun) {
      return res.status(404).json({ message: 'Step run record not found' });
    }

    if (stepRun.status !== 'paused') {
      return res.status(400).json({ message: `Step run is not paused (Current status: ${stepRun.status})` });
    }

    const orgId = stepRun.workflow_run.org_id;

    // 2. Verify Approver Role (Owner or Editor in targeted org)
    const userRole = await getUserOrgRole(sessionUserId, orgId);
    if (!userRole || (userRole !== 'owner' && userRole !== 'editor')) {
      return res.status(403).json({ message: 'Unauthorized: Only Organization Owners or Editors can approve execution gates.' });
    }

    // 3. Mark step_run as completed and store audit fields approved_by & approved_at
    const now = new Date().toISOString();
    const approveMutation = `
      mutation ApproveStepRun($id: uuid!, $approvedBy: uuid!, $approvedAt: timestamptz!) {
        update_step_runs_by_pk(
          pk_columns: { id: $id },
          _set: {
            status: "completed",
            approved_by: $approvedBy,
            approved_at: $approvedAt,
            completed_at: $approvedAt
          }
        ) {
          id
          status
          approved_by
          approved_at
        }
      }
    `;

    await hasuraRequest(approveMutation, {
      id: step_run_id,
      approvedBy: sessionUserId,
      approvedAt: now,
    });

    // 4. Update workflow_run status back to running
    const resumeRunMutation = `
      mutation ResumeWorkflowRun($runId: uuid!) {
        update_workflow_runs_by_pk(
          pk_columns: { id: $runId },
          _set: { status: "running" }
        ) {
          id
          status
        }
      }
    `;
    await hasuraRequest(resumeRunMutation, { runId: stepRun.workflow_run_id });

    // 5. Resume execution loop from the next step index
    const steps = stepRun.workflow_run.workflow.steps;
    const currentStepIndex = steps.findIndex((s: any) => s.id === stepRun.step_id);
    const nextStepIndex = currentStepIndex !== -1 ? currentStepIndex + 1 : 0;

    executeStepsLoop(stepRun.workflow_run_id, steps, nextStepIndex).catch((err) =>
      console.error('Error resuming step loop:', err)
    );

    return res.status(200).json({
      success: true,
      step_run_id: step_run_id,
      workflow_run_id: stepRun.workflow_run_id,
      status: 'running',
      message: 'Step approved successfully. Workflow execution resumed.',
    });
  } catch (error: any) {
    console.error('approveStep Action error:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
}
