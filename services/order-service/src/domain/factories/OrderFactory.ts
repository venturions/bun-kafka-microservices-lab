import type { OrderCreatedPayload } from "@lab/contracts";
import { OrderStatus } from "../OrderStatus";
import { Order } from "../entities/Order";
import { Money } from "../value-objects/Money";
import { OrderItem } from "../value-objects/OrderItem";

export interface OrderCreateInput {
  id: string;
  customerId: string;
  items: Array<{ sku: string; quantity: number }>;
  totalAmount: number;
  status?: OrderStatus;
  createdAt?: Date;
}

export class OrderFactory {
  static fromDTO(input: OrderCreateInput): Order {
    const items = input.items.map((item) =>
      OrderItem.create(item.sku, item.quantity)
    );
    const total = Money.create(input.totalAmount);
    return Order.create({
      id: input.id,
      customerId: input.customerId,
      items,
      totalAmount: total,
      status: input.status,
      createdAt: input.createdAt,
    });
  }

  static fromEvent(payload: OrderCreatedPayload): Order {
    return OrderFactory.fromDTO({
      id: crypto.randomUUID(),
      customerId: payload.customerId,
      items: payload.items,
      totalAmount: payload.totalAmount,
      createdAt: new Date(payload.createdAt),
      status: OrderStatus.Pending,
    });
  }

  static fromPersistence(record: {
    id: string;
    customerId: string;
    items: string;
    totalAmount: number;
    status: string;
    createdAt: Date;
  }): Order {
    const parsedItems = JSON.parse(record.items) as Array<{
      sku: string;
      quantity: number;
    }>;
    return OrderFactory.fromDTO({
      id: record.id,
      customerId: record.customerId,
      items: parsedItems,
      totalAmount: Number(record.totalAmount),
      status: record.status as OrderStatus,
      createdAt: record.createdAt,
    });
  }

  static toPersistence(order: Order) {
    return {
      id: order.id,
      customerId: order.customerId,
      items: JSON.stringify(order.items),
      totalAmount: order.totalAmount.amount,
      status: order.status,
      createdAt: order.createdAt,
    };
  }
}
