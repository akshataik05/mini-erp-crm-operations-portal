import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { sendSuccess } from '../utils/response';

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [
        totalCustomers,
        activeCustomers,
        totalProducts,
        allProducts,
        draftChallans,
        confirmedChallans
      ] = await Promise.all([
        prisma.customer.count(),
        prisma.customer.count({ where: { status: 'ACTIVE' } }),
        prisma.product.count(),
        prisma.product.findMany({ select: { currentStock: true, minimumStock: true } }),
        prisma.challan.count({ where: { status: 'DRAFT' } }),
        prisma.challan.count({ where: { status: 'CONFIRMED' } })
      ]);

      const lowStockProducts = allProducts.filter(p => p.currentStock <= p.minimumStock).length;

      return sendSuccess(
        res,
        {
          totalCustomers,
          activeCustomers,
          totalProducts,
          lowStockProducts,
          draftChallans,
          confirmedChallans
        },
        'Dashboard metrics retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}
