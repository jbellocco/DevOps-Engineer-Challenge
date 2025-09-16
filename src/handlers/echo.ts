import { Request, Response } from 'express';
import { z } from 'zod';

// Schema for validating JSON payload
const echoSchema = z.any(); // Accept any valid JSON

export const createEchoHandler = () => {
  return (req: Request, res: Response) => {
    try {
      // Check if content-type is application/json
      if (!req.is('application/json')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Content-Type must be application/json'
        });
      }
      
      // Validate the payload
      const validatedData = echoSchema.parse(req.body);
      
      return res.status(200).json({
        data: validatedData
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Invalid JSON payload',
          details: error.errors
        });
      }
      
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid request payload'
      });
    }
  };
};
