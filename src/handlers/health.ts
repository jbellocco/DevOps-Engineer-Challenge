import { Request, Response } from 'express';

const startTime = Date.now();

export const createHealthHandler = () => {
  return (_req: Request, res: Response) => {
    const now = Date.now();
    const uptimeMs = now - startTime;
    
    res.status(200).json({
      status: 'ok',
      uptimeMs,
      timestamp: new Date(now).toISOString()
    });
  };
};
