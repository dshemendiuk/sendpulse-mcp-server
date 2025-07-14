import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication for /api endpoint
  if (req.path === '/api') {
    return next();
  }

  const apiKey = req.headers['x-api-key'] as string | undefined;
  const apiSecret = req.headers['x-api-secret'] as string | undefined;

  if (!apiKey || !apiSecret) {
    return res.status(401).json({ 
      success: false, 
      message: 'API Key and API Secret are required in headers' 
    });
  }

  // Store credentials in request for later use
  (req as any).credentials = { apiKey, apiSecret };
  next();
};
