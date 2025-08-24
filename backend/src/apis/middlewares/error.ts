import { Request, Response, NextFunction } from 'express';
import{ logger} from '@/apis/middlewares/logger';

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
};
