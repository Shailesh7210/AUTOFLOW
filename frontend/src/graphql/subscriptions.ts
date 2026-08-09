import { gql } from '@apollo/client';

export const SUBSCRIBE_STEP_RUNS = gql`
  subscription SubscribeStepRuns($workflow_run_id: uuid!) {
    step_runs(
      where: { workflow_run_id: { _eq: $workflow_run_id } }
      order_by: { step: { step_order: asc } }
    ) {
      id
      workflow_run_id
      step_id
      status
      input
      output
      error
      attempt_count
      approved_by
      approved_at
      started_at
      completed_at
      step {
        id
        name
        type
        step_order
      }
    }
  }
`;
