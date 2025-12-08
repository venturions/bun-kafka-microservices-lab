import { z } from "zod";

export const orderRequestSchema = z.object({
  customerId: z.string().uuid(),
  items: z
    .array(
      z.object({
        sku: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Order must have at least one item"),
  totalAmount: z.number().positive(),
});

export type OrderRequest = z.infer<typeof orderRequestSchema>;
