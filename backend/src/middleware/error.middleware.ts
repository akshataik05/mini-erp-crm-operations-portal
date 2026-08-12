import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError } from '../utils/response';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(`[Error Handler] ${err.name}: ${err.message}`, err.stack);

  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorCode);
  }

  // Handle Prisma unique constraint violation error
  if ((err as any).code === 'P2002') {
    const target = (err as any).meta?.target || 'field';
    return sendError(res, `A record with this ${target} already exists.`, 400, 'DUPLICATE_ENTRY');
  }

  // Handle Prisma record not found error
  if ((err as any).code === 'P2025') {
    return sendError(res, 'Requested database record was not found.', 404, 'NOT_FOUND');
  }

  return sendError(
    res,
    process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    500,
    'INTERNAL_SERVER_ERROR'
  );
};
