import { OrderStatus } from "../../domain/OrderStatus";

export type CreateOrderResponse = {
  id: string;
  customerId: string;
  items: Array<{ sku: string; quantity: number }>;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
};
