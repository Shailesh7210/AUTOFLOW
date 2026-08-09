'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'owner' | 'editor' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  quota_limit: number;
  quota_used: number;
  role: UserRole;
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  name: string;
  type: 'llm_call' | 'http_request' | 'db_write' | 'notify' | 'conditional_branch' | 'approval_gate';
  config: Record<string, any>;
  type_role: 'owner' | 'editor';
}

export interface WorkflowTrigger {
  id: string;
  workflow_id: string;
  type: 'manual' | 'webhook' | 'scheduled';
  config: Record<string, any>;
  is_enabled: boolean;
}

export interface Workflow {
  id: string;
  org_id: string;
  name: string;
  description: string;
  is_active: boolean;
  steps: WorkflowStep[];
  triggers: WorkflowTrigger[];
  created_at: string;
}

export interface StepRun {
  id: string;
  workflow_run_id: string;
  step_id: string;
  status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
  input?: any;
  output?: any;
  error?: string;
  attempt_count: number;
  approved_by?: string;
  approved_at?: string;
  started_at?: string;
  completed_at?: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  org_id: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  started_by: string;
  trigger_type: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  step_runs: StepRun[];
}

interface OrgContextType {
  organizations: Organization[];
  activeOrg: Organization;
  activeRole: UserRole;
  setActiveOrgId: (id: string) => void;
  setActiveRole: (role: UserRole) => void;
  workflows: Workflow[];
  addWorkflow: (wf: Partial<Workflow>) => Workflow;
  updateWorkflowSteps: (workflowId: string, steps: WorkflowStep[]) => void;
  updateWorkflowTriggers: (workflowId: string, triggers: WorkflowTrigger[]) => void;
  activeRuns: Record<string, WorkflowRun>;
  triggerRun: (workflowId: string) => { success: boolean; runId?: string; error?: string };
  approveStepRun: (stepRunId: string) => { success: boolean; error?: string };
}

const DEFAULT_ORGS: Organization[] = [
  {
    id: 'org-a-1111-4111-8111-111111111111',
    name: 'Acme AI Systems',
    slug: 'acme-corp',
    quota_limit: 1000,
    quota_used: 142,
    role: 'owner',
  },
  {
    id: 'org-b-2222-4222-8222-222222222222',
    name: 'Nexus Analytics Ltd',
    slug: 'nexus-labs',
    quota_limit: 500,
    quota_used: 498,
    role: 'editor',
  },
];

const SAMPLE_WORKFLOWS: Workflow[] = [
  {
    id: 'wf-101',
    org_id: 'org-a-1111-4111-8111-111111111111',
    name: 'Customer Feedback Sentiment & Alert Pipeline',
    description: 'Processes customer reviews with LLM sentiment analysis, routes via conditional logic, and gates external DB writes through approval.',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    triggers: [
      { id: 'trig-1', workflow_id: 'wf-101', type: 'webhook', config: { endpoint: '/api/webhooks/feedback' }, is_enabled: true },
    ],
    steps: [
      {
        id: 'st-1',
        workflow_id: 'wf-101',
        step_order: 1,
        name: 'LLM Sentiment & Escalation Analysis',
        type: 'llm_call',
        type_role: 'editor',
        config: { prompt: 'Analyze incoming customer review for sentiment score (0-1) and urgency category.', model: 'gpt-3.5-turbo' },
      },
      {
        id: 'st-2',
        workflow_id: 'wf-101',
        step_order: 2,
        name: 'Check Escalation Threshold',
        type: 'conditional_branch',
        type_role: 'editor',
        config: { field: 'completion', condition: 'contains', target_value: 'proceed' },
      },
      {
        id: 'st-3',
        workflow_id: 'wf-101',
        step_order: 3,
        name: 'Manager Approval Gate for DB Sync',
        type: 'approval_gate',
        type_role: 'editor',
        config: { prompt: 'Verify negative sentiment analysis before committing audit log record.', required_role: 'editor' },
      },
      {
        id: 'st-4',
        workflow_id: 'wf-101',
        step_order: 4,
        name: 'Database Write Audit Record',
        type: 'db_write',
        type_role: 'owner',
        config: { table: 'customer_escalations', payload: { priority: 'HIGH' } },
      },
      {
        id: 'st-5',
        workflow_id: 'wf-101',
        step_order: 5,
        name: 'Send Slack Incident Notification',
        type: 'notify',
        type_role: 'owner',
        config: { channel: 'slack_webhook', recipient: '#support-alerts', message: 'Escalated review audit recorded.' },
      },
    ],
  },
  {
    id: 'wf-102',
    org_id: 'org-a-1111-4111-8111-111111111111',
    name: 'Scheduled External HTTP Health Checker',
    description: 'Polls external endpoints on a timer and alerts on non-200 responses.',
    is_active: true,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    triggers: [
      { id: 'trig-2', workflow_id: 'wf-102', type: 'scheduled', config: { cron: '*/15 * * * *' }, is_enabled: true },
    ],
    steps: [
      {
        id: 'st-201',
        workflow_id: 'wf-102',
        step_order: 1,
        name: 'Ping Production API Endpoint',
        type: 'http_request',
        type_role: 'editor',
        config: { url: 'https://httpbin.org/post', method: 'POST' },
      },
      {
        id: 'st-202',
        workflow_id: 'wf-102',
        step_order: 2,
        name: 'Notify Devops Team',
        type: 'notify',
        type_role: 'owner',
        config: { channel: 'email', recipient: 'devops@acme.ai' },
      },
    ],
  },
];

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [organizations, setOrganizations] = useState<Organization[]>(DEFAULT_ORGS);
  const [activeOrgId, setActiveOrgIdState] = useState<string>(DEFAULT_ORGS[0].id);
  const [activeRole, setActiveRoleState] = useState<UserRole>('owner');
  const [workflows, setWorkflows] = useState<Workflow[]>(SAMPLE_WORKFLOWS);
  const [activeRuns, setActiveRuns] = useState<Record<string, WorkflowRun>>({});

  const activeOrg = organizations.find((o) => o.id === activeOrgId) || organizations[0];

  const setActiveOrgId = (id: string) => {
    setActiveOrgIdState(id);
    const org = organizations.find((o) => o.id === id);
    if (org) {
      setActiveRoleState(org.role);
    }
  };

  const setActiveRole = (role: UserRole) => {
    setActiveRoleState(role);
    setOrganizations((prev) =>
      prev.map((o) => (o.id === activeOrgId ? { ...o, role } : o))
    );
  };

  const addWorkflow = (wf: Partial<Workflow>): Workflow => {
    const newWf: Workflow = {
      id: `wf-${Date.now()}`,
      org_id: activeOrgId,
      name: wf.name || 'New AI Workflow',
      description: wf.description || '',
      is_active: true,
      created_at: new Date().toISOString(),
      triggers: wf.triggers || [
        { id: `trig-${Date.now()}`, workflow_id: '', type: 'manual', config: {}, is_enabled: true },
      ],
      steps: wf.steps || [],
    };
    setWorkflows((prev) => [newWf, ...prev]);
    return newWf;
  };

  const updateWorkflowSteps = (workflowId: string, steps: WorkflowStep[]) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflowId ? { ...w, steps } : w))
    );
  };

  const updateWorkflowTriggers = (workflowId: string, triggers: WorkflowTrigger[]) => {
    setWorkflows((prev) =>
      prev.map((w) => (w.id === workflowId ? { ...w, triggers } : w))
    );
  };

  // Trigger workflow run (Supports live simulation + local engine)
  const triggerRun = (workflowId: string) => {
    const wf = workflows.find((w) => w.id === workflowId);
    if (!wf) return { success: false, error: 'Workflow not found' };

    // Role check
    if (activeRole === 'viewer') {
      return { success: false, error: 'Viewer role is blocked from triggering workflow runs' };
    }

    // Quota check
    if (activeOrg.quota_used >= activeOrg.quota_limit) {
      return { success: false, error: `Organization quota limit reached (${activeOrg.quota_used}/${activeOrg.quota_limit})` };
    }

    // Increment quota used
    setOrganizations((prev) =>
      prev.map((o) => (o.id === activeOrgId ? { ...o, quota_used: o.quota_used + 1 } : o))
    );

    const runId = `run-${Date.now()}`;
    const initialStepRuns: StepRun[] = wf.steps.map((st) => ({
      id: `sr-${st.id}-${runId}`,
      workflow_run_id: runId,
      step_id: st.id,
      status: 'pending',
      attempt_count: 0,
    }));

    const newRun: WorkflowRun = {
      id: runId,
      workflow_id: workflowId,
      org_id: activeOrgId,
      status: 'running',
      started_by: '00000000-0000-0000-0000-000000000001',
      trigger_type: 'manual',
      started_at: new Date().toISOString(),
      step_runs: initialStepRuns,
    };

    setActiveRuns((prev) => ({ ...prev, [runId]: newRun }));

    // Simulate step loop execution
    simulateExecutionLoop(runId, wf, initialStepRuns, 0);

    return { success: true, runId };
  };

  const simulateExecutionLoop = (
    runId: string,
    wf: Workflow,
    currentStepRuns: StepRun[],
    startIndex: number
  ) => {
    let delay = 600;

    for (let i = startIndex; i < wf.steps.length; i++) {
      const step = wf.steps[i];
      const stepRunIndex = i;

      setTimeout(() => {
        // Mark step running
        setActiveRuns((prev) => {
          const run = prev[runId];
          if (!run || run.status === 'paused' || run.status === 'failed') return prev;

          const updatedStepRuns = [...run.step_runs];
          updatedStepRuns[stepRunIndex] = {
            ...updatedStepRuns[stepRunIndex],
            status: 'running',
            attempt_count: 1,
            started_at: new Date().toISOString(),
          };

          return { ...prev, [runId]: { ...run, step_runs: updatedStepRuns } };
        });

        // Resolve step output after delay
        setTimeout(() => {
          setActiveRuns((prev) => {
            const run = prev[runId];
            if (!run) return prev;

            const updatedStepRuns = [...run.step_runs];

            if (step.type === 'approval_gate') {
              // Pause execution
              updatedStepRuns[stepRunIndex] = {
                ...updatedStepRuns[stepRunIndex],
                status: 'paused',
                output: {
                  action: 'pause_required',
                  prompt: step.config.prompt || 'Human approval required.',
                  pausedAt: new Date().toISOString(),
                },
              };
              return {
                ...prev,
                [runId]: { ...run, status: 'paused', step_runs: updatedStepRuns },
              };
            }

            // Normal completion
            let output: any = {};
            if (step.type === 'llm_call') {
              output = { completion: 'Analyzed prompt successfully. Decision score 0.94. Recommended path: proceed.', model: step.config.model || 'gpt-3.5-turbo' };
            } else if (step.type === 'http_request') {
              output = { status: 200, data: { success: true, payloadReceived: true } };
            } else if (step.type === 'db_write') {
              output = { status: 'written', table: step.config.table || 'audit_logs', timestamp: new Date().toISOString() };
            } else if (step.type === 'notify') {
              output = { delivered: true, recipient: step.config.recipient || 'devops@acme.ai' };
            } else if (step.type === 'conditional_branch') {
              output = { evaluated: true, selectedPath: 'true_branch' };
            }

            updatedStepRuns[stepRunIndex] = {
              ...updatedStepRuns[stepRunIndex],
              status: 'completed',
              output,
              completed_at: new Date().toISOString(),
            };

            const isLastStep = stepRunIndex === wf.steps.length - 1;
            const newRunStatus = isLastStep ? 'completed' : 'running';

            return {
              ...prev,
              [runId]: {
                ...run,
                status: newRunStatus,
                completed_at: isLastStep ? new Date().toISOString() : undefined,
                step_runs: updatedStepRuns,
              },
            };
          });
        }, 800);
      }, delay);

      delay += 1600;

      // Break loop if step is approval_gate
      if (step.type === 'approval_gate') break;
    }
  };

  const approveStepRun = (stepRunId: string) => {
    if (activeRole === 'viewer') {
      return { success: false, error: 'Viewer role is blocked from approving execution gates' };
    }

    let targetRunId: string | null = null;
    let targetWfId: string | null = null;
    let pausedStepIndex = -1;

    for (const [runId, run] of Object.entries(activeRuns)) {
      const idx = run.step_runs.findIndex((sr) => sr.id === stepRunId);
      if (idx !== -1) {
        targetRunId = runId;
        targetWfId = run.workflow_id;
        pausedStepIndex = idx;
        break;
      }
    }

    if (!targetRunId || !targetWfId || pausedStepIndex === -1) {
      return { success: false, error: 'Step run record not found in active runs' };
    }

    const wf = workflows.find((w) => w.id === targetWfId);
    if (!wf) return { success: false, error: 'Workflow metadata missing' };

    // Update step run to approved & completed
    setActiveRuns((prev) => {
      const run = prev[targetRunId!];
      if (!run) return prev;

      const updatedStepRuns = [...run.step_runs];
      updatedStepRuns[pausedStepIndex] = {
        ...updatedStepRuns[pausedStepIndex],
        status: 'completed',
        approved_by: '00000000-0000-0000-0000-000000000001',
        approved_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      };

      return {
        ...prev,
        [targetRunId!]: {
          ...run,
          status: 'running',
          step_runs: updatedStepRuns,
        },
      };
    });

    // Resume remaining steps loop
    if (pausedStepIndex + 1 < wf.steps.length) {
      simulateExecutionLoop(targetRunId, wf, activeRuns[targetRunId].step_runs, pausedStepIndex + 1);
    } else {
      setActiveRuns((prev) => ({
        ...prev,
        [targetRunId!]: {
          ...prev[targetRunId!],
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
      }));
    }

    return { success: true };
  };

  return (
    <OrgContext.Provider
      value={{
        organizations,
        activeOrg,
        activeRole,
        setActiveOrgId,
        setActiveRole,
        workflows: workflows.filter((w) => w.org_id === activeOrgId),
        addWorkflow,
        updateWorkflowSteps,
        updateWorkflowTriggers,
        activeRuns,
        triggerRun,
        approveStepRun,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (!context) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
};
