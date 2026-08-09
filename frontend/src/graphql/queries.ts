import { gql } from '@apollo/client';

export const GET_ORG_WORKFLOWS = gql`
  query GetOrgWorkflows($org_id: uuid!) {
    workflows(where: { org_id: { _eq: $org_id } }, order_by: { created_at: desc }) {
      id
      org_id
      name
      description
      is_active
      created_at
      steps(order_by: { step_order: asc }) {
        id
        step_order
        name
        type
        config
        type_role
      }
      triggers {
        id
        type
        config
        is_enabled
      }
    }
  }
`;

export const GET_ORG_USAGE_SUMMARY = gql`
  query GetOrgUsageSummary($org_id: uuid!) {
    org_usage_summary(where: { org_id: { _eq: $org_id } }) {
      org_id
      org_name
      quota_limit
      quota_used
      total_workflows
      total_runs
      total_step_executions
      avg_run_duration_seconds
    }
  }
`;
