import { z } from "zod";

export enum OrderEvents {
  OrderCreated = "order_created",
}

export const orderItemSchema = z.object({
  sku: z.string(),
  quantity: z.number().int().positive(),
});

export const orderCreatedSchema = z.object({
  correlationId: z.string(),
  createdAt: z.string(),
  customerId: z.string().uuid(),
  items: z.array(orderItemSchema).min(1, "Order must have at least one item"),
  totalAmount: z.number().positive(),
});

export type OrderCreatedPayload = z.infer<typeof orderCreatedSchema>;
