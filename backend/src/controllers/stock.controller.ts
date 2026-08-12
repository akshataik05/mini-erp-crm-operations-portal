import { Request, Response, NextFunction } from 'express';
import { StockService } from '../services/stock.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class StockController {
  static async createMovement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { productId, quantity, movementType, reason } = req.body;
      const userId = req.user!.id;

      const result = await StockService.createStockMovement(
        productId,
        quantity,
        movementType,
        reason,
        userId
      );

      return sendSuccess(res, result, 'Stock movement recorded successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getMovements(req: Request, res: Response, next: NextFunction) {
    try {
      const { movements, meta } = await StockService.getStockMovements(req.query as any);
      return sendSuccess(res, movements, 'Stock movements retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }
}
