import { z } from "zod";

export const createOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(
    z.object({
      sku: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  totalAmount: z.number().positive(),
});

export type CreateOrderRequest = z.infer<typeof createOrderSchema>;
