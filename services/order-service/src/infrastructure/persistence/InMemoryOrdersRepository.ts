import { Injectable } from "@nestjs/common";
import type { Order } from "../../domain/entities/Order";
import { OrdersRepository } from "../../domain/repositories/OrdersRepository";

@Injectable()
export class InMemoryOrdersRepository extends OrdersRepository {
  private readonly items = new Map<string, Order>();

  async create(order: Order): Promise<Order> {
    console.log("[order-service][InMemoryOrdersRepository] Persisting order in memory", {
      orderId: order.id,
      createdAt: order.createdAt.toISOString(),
    });
    this.items.set(order.id, order);
    return order;
  }

  async findById(id: string): Promise<Order | null> {
    return this.items.get(id) ?? null;
  }

  async list(): Promise<Order[]> {
    return Array.from(this.items.values());
  }
}
