import { Money } from "../value-objects/Money";
import { OrderItem } from "../value-objects/OrderItem";
import { OrderStatus } from "../OrderStatus";

export class Order {
  private constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: Money,
    public readonly status: OrderStatus,
    public readonly createdAt: Date
  ) {}

  static create(params: {
    id: string;
    customerId: string;
    items: OrderItem[];
    totalAmount: Money;
    status?: OrderStatus;
    createdAt?: Date;
  }): Order {
    if (!params.id) {
      throw new Error("Order id is required");
    }
    if (!params.customerId) {
      throw new Error("Customer id is required");
    }
    if (!params.items || params.items.length === 0) {
      throw new Error("Order must have at least one item");
    }
    const status = params.status ?? OrderStatus.Pending;
    const createdAt = params.createdAt ?? new Date();
    return new Order(
      params.id,
      params.customerId,
      params.items,
      params.totalAmount,
      status,
      createdAt
    );
  }
}
