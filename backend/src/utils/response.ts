import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data?: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): Response => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta && { meta })
  };
  return res.status(statusCode).json(response);
};

export const sendError = (
  res: Response,
  message: string = 'An error occurred',
  statusCode: number = 400,
  errorCode?: string,
  details?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(errorCode && { error: errorCode }),
    ...(details && { data: details })
  };
  return res.status(statusCode).json(response);
};
