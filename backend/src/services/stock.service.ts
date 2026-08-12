import prisma from '../prisma/client';
import { MovementType, PaginationParams } from '../types';
import { BadRequestError, InsufficientStockError, NotFoundError } from '../utils/errors';

export interface StockMovementFilterParams extends PaginationParams {
  productId?: string;
  movementType?: MovementType;
}

export class StockService {
  /**
   * Records a manual or system stock movement and updates the product's currentStock atomically.
   */
  static async createStockMovement(
    productId: string,
    quantity: number,
    movementType: MovementType,
    reason: string,
    userId: string
  ) {
    if (quantity <= 0) {
      throw new BadRequestError('Movement quantity must be greater than zero');
    }

    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      let newStock = product.currentStock;

      if (movementType === 'IN') {
        newStock += quantity;
      } else if (movementType === 'OUT') {
        if (product.currentStock < quantity) {
          throw new InsufficientStockError(
            `Insufficient stock for product '${product.name}' (SKU: ${product.sku}). Current stock: ${product.currentStock}, requested reduction: ${quantity}`
          );
        }
        newStock -= quantity;
      }

      // Update product current stock
      const updatedProduct = await tx.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      });

      // Create stock movement record
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          movementType,
          reason,
          createdBy: userId
        },
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true, role: true } }
        }
      });

      return {
        movement,
        product: updatedProduct
      };
    });
  }

  static async getStockMovements(params: StockMovementFilterParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 15;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.productId) {
      where.productId = params.productId;
    }

    if (params.movementType) {
      where.movementType = params.movementType;
    }

    if (params.search) {
      const query = params.search.trim();
      where.OR = [
        { reason: { contains: query, mode: 'insensitive' } },
        { product: { name: { contains: query, mode: 'insensitive' } } },
        { product: { sku: { contains: query, mode: 'insensitive' } } }
      ];
    }

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            select: { id: true, name: true, sku: true, unitPrice: true, currentStock: true }
          },
          user: {
            select: { id: true, name: true, role: true }
          }
        }
      })
    ]);

    return {
      movements,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }
}
