import prisma from '../prisma/client';
import { PaginationParams } from '../types';
import { BadRequestError, NotFoundError } from '../utils/errors';

export interface ProductFilterParams extends PaginationParams {
  category?: string;
  lowStock?: boolean | string;
}

export class ProductService {
  static async createProduct(data: any) {
    const existingSku = await prisma.product.findUnique({
      where: { sku: data.sku }
    });
    if (existingSku) {
      throw new BadRequestError(`Product with SKU '${data.sku}' already exists.`, 'DUPLICATE_SKU');
    }

    return prisma.product.create({
      data
    });
  }

  static async getProducts(params: ProductFilterParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const query = params.search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { sku: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (params.category) {
      where.category = { equals: params.category, mode: 'insensitive' };
    }

    const isLowStockFilter = params.lowStock === true || params.lowStock === 'true';

    // Fetch all records matching search and category if lowStock filter is applied, or use database query
    let total = 0;
    let products: any[] = [];

    if (isLowStockFilter) {
      // Prisma raw or in-memory comparison for currentStock <= minimumStock
      const allMatching = await prisma.product.findMany({
        where,
        orderBy: { name: 'asc' }
      });
      const lowStockItems = allMatching.filter(p => p.currentStock <= p.minimumStock);
      total = lowStockItems.length;
      products = lowStockItems.slice(skip, skip + limit);
    } else {
      [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' }
        })
      ]);
    }

    return {
      products,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        stockMovements: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, role: true }
            }
          }
        }
      }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  static async updateProduct(id: string, data: any) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    if (data.sku && data.sku !== existing.sku) {
      const duplicateSku = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (duplicateSku) {
        throw new BadRequestError(`Product SKU '${data.sku}' is already taken.`, 'DUPLICATE_SKU');
      }
    }

    return prisma.product.update({
      where: { id },
      data
    });
  }

  static async deleteProduct(id: string) {
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Product not found');
    }

    return prisma.product.delete({
      where: { id }
    });
  }
}
