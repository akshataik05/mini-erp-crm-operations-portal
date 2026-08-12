import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().min(2, 'SKU is required'),
  category: z.string().min(2, 'Category is required'),
  unitPrice: z.number().positive('Unit price must be positive'),
  currentStock: z.number().int().nonnegative('Current stock cannot be negative').default(0),
  minimumStock: z.number().int().nonnegative('Minimum stock cannot be negative').default(0),
  warehouseLocation: z.string().min(1, 'Warehouse location is required')
});

export const updateProductSchema = createProductSchema.partial();
