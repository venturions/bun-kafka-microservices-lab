import { z } from "zod";

export const orderRequestSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(
    z.object({
      sku: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  totalAmount: z.number().positive(),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;
