import prisma from '../prisma/client';
import { CustomerStatus, CustomerType, PaginationParams } from '../types';
import { NotFoundError } from '../utils/errors';

export interface CustomerFilterParams extends PaginationParams {
  status?: CustomerStatus;
  customerType?: CustomerType;
}

export class CustomerService {
  static async createCustomer(data: any) {
    return prisma.customer.create({
      data
    });
  }

  static async getCustomers(params: CustomerFilterParams) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const query = params.search.trim();
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { mobile: { contains: query, mode: 'insensitive' } },
        { businessName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.customerType) {
      where.customerType = params.customerType;
    }

    const [total, customers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return {
      customers,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getCustomerById(id: string) {
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        challans: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            challanNumber: true,
            totalAmount: true,
            totalQuantity: true,
            status: true,
            createdAt: true
          }
        }
      }
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return customer;
  }

  static async updateCustomer(id: string, data: any) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Customer not found');
    }

    return prisma.customer.update({
      where: { id },
      data
    });
  }

  static async deleteCustomer(id: string) {
    const existing = await prisma.customer.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError('Customer not found');
    }

    return prisma.customer.delete({
      where: { id }
    });
  }
}
