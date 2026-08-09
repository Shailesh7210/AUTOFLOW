import { Request, Response } from 'express';
import handleTriggerWorkflowRun from './trigger-workflow-run';

export default async function handleInboundWebhook(req: Request, res: Response) {
  // Extract workflow_id from body or path query
  const workflow_id = req.body?.workflow_id || req.query?.workflow_id;
  if (!workflow_id) {
    return res.status(400).json({ message: 'Missing workflow_id in webhook request' });
  }

  // Forward to standard trigger logic
  req.body = { input: { workflow_id } };
  return handleTriggerWorkflowRun(req, res);
}
