import { Request, Response } from 'express';
import { config } from '../config';

export const createVersionHandler = () => {
  return (_req: Request, res: Response) => {
    const response: { version: string; commit?: string } = {
      version: config.appVersion
    };
    
    if (config.gitCommit) {
      response.commit = config.gitCommit;
    }
    
    res.status(200).json(response);
  };
};
