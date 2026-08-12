import prisma from '../prisma/client';
import { ChallanStatus, PaginationParams } from '../types';
import { BadRequestError, InsufficientStockError, NotFoundError } from '../utils/errors';
import { generateChallanNumber } from '../utils/challanNumber';

export interface ChallanFilterParams extends PaginationParams {
  status?: ChallanStatus;
  customerId?: string;
}

export interface CreateChallanInput {
  customerId: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export class ChallanService {
  static async createChallan(input: CreateChallanInput, userId: string) {
    const customer = await prisma.customer.findUnique({
      where: { id: input.customerId }
    });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    const productIds = input.items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    const productMap = new Map(products.map(p => [p.id, p]));

    let totalQuantity = 0;
    let totalAmount = 0;

    const preparedItems = input.items.map(item => {
      const product = productMap.get(item.productId);
      if (!product) {
        throw new NotFoundError(`Product with ID '${item.productId}' not found`);
      }

      totalQuantity += item.quantity;
      const lineTotal = product.unitPrice * item.quantity;
      totalAmount += lineTotal;

      return {
        productId: product.id,
        productNameSnapshot: product.name,
        skuSnapshot: product.sku,
        unitPriceSnapshot: product.unitPrice,
        quantity: item.quantity
      };
    });

    const count = await prisma.challan.count();
    const challanNumber = generateChallanNumber(count + 1);

    const challan = await prisma.challan.create({
      data: {
        challanNumber,
        customerId: input.customerId,
        totalQuantity,
        totalAmount,
        status: 'DRAFT',
        createdBy: userId,
        items: {
          create: preparedItems
        }
      },
      include: {
        customer: { select: { id: true, name: true, businessName: true, mobile: true, email: true } },
        items: true,
        user: { select: { id: true, name: true, role: true } }
      }
    });

    return challan;
  }

  static async getChallans(params: ChallanFilterParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerId) {
      where.customerId = params.customerId;
    }

    if (params.search) {
      const query = params.search.trim();
      where.OR = [
        { challanNumber: { contains: query, mode: 'insensitive' } },
        { customer: { name: { contains: query, mode: 'insensitive' } } },
        { customer: { businessName: { contains: query, mode: 'insensitive' } } }
      ];
    }

    const [total, challans] = await Promise.all([
      prisma.challan.count({ where }),
      prisma.challan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true, businessName: true, mobile: true } },
          user: { select: { id: true, name: true, role: true } },
          _count: { select: { items: true } }
        }
      })
    ]);

    return {
      challans,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getChallanById(id: string) {
    const challan = await prisma.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, sku: true, currentStock: true }
            }
          }
        },
        user: { select: { id: true, name: true, role: true, email: true } }
      }
    });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    return challan;
  }

  static async updateChallan(id: string, input: Partial<CreateChallanInput>) {
    const existing = await prisma.challan.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!existing) {
      throw new NotFoundError('Challan not found');
    }

    if (existing.status !== 'DRAFT') {
      throw new BadRequestError(
        `Cannot edit a challan with status '${existing.status}'. Only DRAFT challans can be modified.`,
        'CHALLAN_NOT_DRAFT'
      );
    }

    let customerId = existing.customerId;
    if (input.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
      if (!customer) {
        throw new NotFoundError('Customer not found');
      }
      customerId = input.customerId;
    }

    let totalQuantity = existing.totalQuantity;
    let totalAmount = existing.totalAmount;
    let updatedItemsData: any[] | null = null;

    if (input.items && input.items.length > 0) {
      const productIds = input.items.map(item => item.productId);
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } }
      });
      const productMap = new Map(products.map(p => [p.id, p]));

      totalQuantity = 0;
      totalAmount = 0;

      updatedItemsData = input.items.map(item => {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new NotFoundError(`Product with ID '${item.productId}' not found`);
        }

        totalQuantity += item.quantity;
        totalAmount += product.unitPrice * item.quantity;

        return {
          productId: product.id,
          productNameSnapshot: product.name,
          skuSnapshot: product.sku,
          unitPriceSnapshot: product.unitPrice,
          quantity: item.quantity
        };
      });
    }

    if (updatedItemsData) {
      await prisma.challanItem.deleteMany({ where: { challanId: id } });
    }

    const updatedChallan = await prisma.challan.update({
      where: { id },
      data: {
        customerId,
        totalQuantity,
        totalAmount,
        ...(updatedItemsData && {
          items: {
            create: updatedItemsData
          }
        })
      },
      include: {
        customer: { select: { id: true, name: true, businessName: true } },
        items: true
      }
    });

    return updatedChallan;
  }

  /**
   * ATOMIC CONCURRENCY-SAFE POSTGRESQL TRANSACTION FOR CHALLAN CONFIRMATION
   * SQL Executed per item:
   * UPDATE "products" SET "currentStock" = "currentStock" - $quantity
   * WHERE "id" = $productId AND "currentStock" >= $quantity;
   *
   * If updateResult.count === 0 => insufficient stock or race condition -> ROLLBACK
   */
  static async confirmChallan(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!challan) {
        throw new NotFoundError('Challan not found');
      }

      if (challan.status === 'CONFIRMED') {
        throw new BadRequestError('Challan is already confirmed', 'CHALLAN_ALREADY_CONFIRMED');
      }

      if (challan.status === 'CANCELLED') {
        throw new BadRequestError('Cannot confirm a cancelled challan', 'CANNOT_CONFIRM_CANCELLED_CHALLAN');
      }

      // Concurrency-Safe Atomic Stock Check & Decrement
      for (const item of challan.items) {
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.productId,
            currentStock: { gte: item.quantity }
          },
          data: {
            currentStock: { decrement: item.quantity }
          }
        });

        if (updateResult.count === 0) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          const availableStock = product ? product.currentStock : 0;
          const productName = product ? product.name : item.productNameSnapshot;

          throw new InsufficientStockError(
            `Insufficient stock for product '${productName}' (SKU: ${item.skuSnapshot}). Requested: ${item.quantity}, Available: ${availableStock}`
          );
        }

        // Log OUT stock movement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: 'OUT',
            reason: `Sales Challan Confirmation: ${challan.challanNumber}`,
            createdBy: userId
          }
        });
      }

      // Mark Challan as CONFIRMED
      const confirmedChallan = await tx.challan.update({
        where: { id },
        data: { status: 'CONFIRMED' },
        include: {
          customer: { select: { id: true, name: true, businessName: true } },
          items: true,
          user: { select: { id: true, name: true, role: true } }
        }
      });

      return confirmedChallan;
    });
  }

  static async cancelChallan(id: string) {
    const challan = await prisma.challan.findUnique({ where: { id } });

    if (!challan) {
      throw new NotFoundError('Challan not found');
    }

    if (challan.status === 'CONFIRMED') {
      throw new BadRequestError('Cannot cancel an already confirmed sales challan', 'CANNOT_CANCEL_CONFIRMED_CHALLAN');
    }

    if (challan.status === 'CANCELLED') {
      throw new BadRequestError('Challan is already cancelled', 'CHALLAN_ALREADY_CANCELLED');
    }

    return prisma.challan.update({
      where: { id },
      data: { status: 'CANCELLED' },
      include: {
        customer: { select: { id: true, name: true, businessName: true } },
        items: true
      }
    });
  }
}
