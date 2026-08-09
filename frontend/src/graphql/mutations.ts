import { gql } from '@apollo/client';

export const TRIGGER_WORKFLOW_RUN_ACTION = gql`
  mutation TriggerWorkflowRun($workflow_id: uuid!) {
    triggerWorkflowRun(workflow_id: $workflow_id) {
      success
      workflow_run_id
      status
      message
    }
  }
`;

export const APPROVE_STEP_ACTION = gql`
  mutation ApproveStep($step_run_id: uuid!) {
    approveStep(step_run_id: $step_run_id) {
      success
      step_run_id
      workflow_run_id
      status
      message
    }
  }
`;
