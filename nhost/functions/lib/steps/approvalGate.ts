export async function executeApprovalGateStep(
  config: { prompt?: string; required_role?: string }
) {
  return {
    action: 'pause_required',
    prompt: config.prompt || 'Human approval required to proceed with workflow execution.',
    requiredRole: config.required_role || 'editor',
    pausedAt: new Date().toISOString(),
  };
}
