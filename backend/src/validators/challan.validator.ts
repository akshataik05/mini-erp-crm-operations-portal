import { z } from 'zod';

export const challanItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID format'),
  quantity: z.number().int().positive('Item quantity must be a positive integer')
});

export const createChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format'),
  items: z.array(challanItemSchema).min(1, 'Challan must contain at least one item')
});

export const updateChallanSchema = z.object({
  customerId: z.string().uuid('Invalid customer ID format').optional(),
  items: z.array(challanItemSchema).min(1, 'Challan must contain at least one item').optional()
});
