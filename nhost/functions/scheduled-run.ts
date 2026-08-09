import { Request, Response } from 'express';
import handleTriggerWorkflowRun from './trigger-workflow-run';

export default async function handleScheduledRun(req: Request, res: Response) {
  const { workflow_id } = req.body?.payload || req.body || {};
  if (!workflow_id) {
    return res.status(400).json({ message: 'Missing workflow_id in scheduled trigger payload' });
  }

  req.body = { input: { workflow_id } };
  return handleTriggerWorkflowRun(req, res);
}
