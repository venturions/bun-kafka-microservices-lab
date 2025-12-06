export type OrderStatus = "pending" | "confirmed" | "canceled" | "failed";

export interface Order {
  id: string;
  customerId: string;
  items: Array<{
    sku: string;
    quantity: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  createdAt: Date;
}
