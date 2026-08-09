# Architecture & Design Write-Up — AI Agent Workflow Builder

## 1. Schema Reasoning & Data Model

The backend data model is structured to enforce strong multi-tenant boundaries while providing flexible, real-time workflow orchestration.

### Core Tables & Relationships
- `organizations`: Root container for tenant isolation. Contains quota controls (`quota_limit`, `quota_used`, `quota_period_start`).
- `org_members`: Relates `user_id` to an `org_id` with a designated role (`owner`, `editor`, `viewer`).
- `workflows`: Parent metadata for workflow definitions tied to an `organization`.
- `workflow_steps`: Ordered execution nodes belonging to a workflow. Supports 6 step types: `llm_call`, `http_request`, `db_write`, `notify`, `conditional_branch`, and `approval_gate`.
- `workflow_triggers`: Activation mechanisms (`manual`, `webhook`, `scheduled`).
- `workflow_runs`: Execution state records tracking overall execution status (`running`, `completed`, `failed`, `paused`).
- `step_runs`: Fine-grained per-step logs recording execution state (`pending`, `running`, `completed`, `failed`, `paused`), input/output payloads, error logs, attempt counters, and Human-in-the-Loop audit fields (`approved_by`, `approved_at`).
- `org_usage_summary` (View): Aggregates monthly step execution volume and average run durations per organization.

---

## 2. Two-Layer Permission Enforcement

Security and access control are implemented using a strict defense-in-depth approach across two independent layers.

```
       Incoming GraphQL / API Request
                    │
   ┌────────────────┴────────────────┐
   │ Layer 1: Hasura Row/Col Rules   │ ➔ Multi-Tenant Org & Role Scoping
   └────────────────┬────────────────┘   (Declarative SQL session checks)
                    │
   ┌────────────────┴────────────────┐
   │ Layer 2: Action & Gating Rules  │ ➔ Sensitive Step Creation &
   └─────────────────────────────────┘   Mid-Execution Approvals (Code & Metadata)
```

### Layer 1: Declarative Org & Role Scoping (Hasura Metadata)
Row-level security (RLS) is configured in Hasura metadata (`nhost/metadata/databases/default/tables/*.yaml`).
- Every query, mutation, and subscription filters rows by inspecting `X-Hasura-User-Id` against `org_members`.
- **Role Permissions**:
  - `viewer`: Read-only access to workflows, steps, and runs within their organization. Cannot create, mutate, or trigger executions.
  - `editor`: Select, insert, and update access for workflows and steps within their organization. Blocked from managing organization members or quotas.
  - `owner`: Full administrative permissions across all organization resources and memberships.

### Layer 2: Step-Level Gating & Mid-Execution Approvals
- **Creation-Time Gating (Declarative Metadata)**: Restricted step types (`db_write`, `webhook`, `notify`) include Hasura permission checks requiring the caller to hold the `owner` role in the targeted organization. `editor` users attempting to insert these step types receive permission rejection errors.
- **Approval-Time Gating (Action Code)**: Mid-execution resume actions (`approveStep`) bypass static database permissions by executing inside an Nhost serverless function (`approve-step.ts`). The function verifies the caller's JWT, verifies their role in `org_members` is `owner` or `editor`, and validates that the step run is currently in `paused` state before mutating database records.

---

## 3. Orchestration Engine & Approval Gate Pause/Resume

### Execution State Machine (`triggerWorkflowRun`)
When a workflow is triggered (`trigger-workflow-run.ts`):
1. **Quota Check**: Verifies `quota_used < quota_limit` for the organization.
2. **Run Initialization**: Inserts a `workflow_runs` row with status `running` and creates `step_runs` rows marked as `pending`.
3. **Step Loop**: Iterates through steps in `step_order`:
   - Updates `step_runs` status to `running`.
   - Executes step handler (`llmCall`, `httpRequest`, `dbWrite`, `notify`, `conditionalBranch`).
   - For `llm_call` and `http_request`, retries with exponential backoff on transient errors up to 3 attempts.
   - On step completion, updates step output and sets status to `completed`.

### Human-in-the-Loop Pause & Resume Mechanism
- **Pause Trigger**: When the step loop encounters an `approval_gate` step:
  - The step run status is updated to `paused`.
  - The overall `workflow_runs` status is set to `paused`.
  - Execution stops, leaving remaining downstream steps in `pending` state.
  - A GraphQL subscription notifies the frontend, surfacing the live Approval Panel.
- **Resume Execution**:
  - An Authorized user (`owner` or `editor`) invokes `approveStep(step_run_id)`.
  - `approve-step.ts` records `approved_by` (user ID) and `approved_at` (timestamp), sets the step status to `completed`, updates the workflow run status to `running`, and resumes the step loop for remaining steps.
