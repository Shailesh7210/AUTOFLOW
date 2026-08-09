export async function executeNotifyStep(
  config: { channel?: string; recipient?: string; message?: string },
  inputPayload: any
) {
  const channel = config.channel || 'webhook';
  const recipient = config.recipient || 'admin@organization.com';
  const message = config.message || `Workflow execution step notification: ${JSON.stringify(inputPayload)}`;

  return {
    delivered: true,
    channel,
    recipient,
    message,
    sent_at: new Date().toISOString(),
  };
}
