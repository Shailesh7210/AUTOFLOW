-- Create Org Usage Summary aggregation view
CREATE OR REPLACE VIEW public.org_usage_summary AS
SELECT 
    o.id AS org_id,
    o.name AS org_name,
    o.quota_limit,
    o.quota_used,
    o.quota_period_start,
    COUNT(DISTINCT w.id) AS total_workflows,
    COUNT(DISTINCT wr.id) AS total_runs,
    COUNT(DISTINCT sr.id) AS total_step_executions,
    COALESCE(AVG(EXTRACT(EPOCH FROM (wr.completed_at - wr.started_at))), 0) AS avg_run_duration_seconds
FROM public.organizations o
LEFT JOIN public.workflows w ON w.org_id = o.id
LEFT JOIN public.workflow_runs wr ON wr.org_id = o.id
LEFT JOIN public.step_runs sr ON sr.workflow_run_id = wr.id
GROUP BY o.id, o.name, o.quota_limit, o.quota_used, o.quota_period_start;
