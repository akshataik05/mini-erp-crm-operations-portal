import { Request, Response, NextFunction } from 'express';
import { ChallanService } from '../services/challan.service';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export class ChallanController {
  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const challan = await ChallanService.createChallan(req.body, userId);
      return sendSuccess(res, challan, 'Draft sales challan created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { challans, meta } = await ChallanService.getChallans(req.query as any);
      return sendSuccess(res, challans, 'Sales challans retrieved successfully', 200, meta);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.getChallanById(req.params.id);
      return sendSuccess(res, challan, 'Sales challan retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const challan = await ChallanService.updateChallan(req.params.id, req.body);
      return sendSuccess(res, challan, 'Sales challan updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async confirm(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const confirmedChallan = await ChallanService.confirmChallan(req.params.id, userId);
      return sendSuccess(res, confirmedChallan, 'Sales challan confirmed successfully');
    } catch (error) {
      next(error);
    }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const cancelledChallan = await ChallanService.cancelChallan(req.params.id);
      return sendSuccess(res, cancelledChallan, 'Sales challan cancelled successfully');
    } catch (error) {
      next(error);
    }
  }
}
