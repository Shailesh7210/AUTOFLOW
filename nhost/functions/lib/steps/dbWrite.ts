import { hasuraRequest } from '../hasuraClient';

export async function executeDbWriteStep(
  config: { table?: string; payload?: Record<string, any> },
  inputPayload: any
) {
  // Simulates or performs structured DB mutation
  const timestamp = new Date().toISOString();
  const record = {
    ...(config.payload || {}),
    input_received: inputPayload,
    recorded_at: timestamp,
  };

  return {
    status: 'written',
    table: config.table || 'audit_logs',
    record,
    written_at: timestamp,
  };
}
