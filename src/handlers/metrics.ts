import { Request, Response } from 'express';
import { register } from 'prom-client';

export const createMetricsHandler = () => {
  return async (_req: Request, res: Response) => {
    try {
      res.set('Content-Type', register.contentType);
      res.end(await register.metrics());
    } catch (error) {
      res.status(500).end('Error collecting metrics');
    }
  };
};
