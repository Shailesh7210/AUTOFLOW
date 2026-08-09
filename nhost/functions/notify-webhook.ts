import { Request, Response } from 'express';

export default async function handleNotifyWebhook(req: Request, res: Response) {
  const event = req.body?.event;
  console.log('Hasura Event Trigger `notify` received:', event);

  return res.status(200).json({
    received: true,
    event_id: req.body?.id,
    timestamp: new Date().toISOString(),
  });
}
