import type { Order } from "../entities/Order";

export abstract class OrdersRepository {
  abstract create(order: Order): Promise<Order>;
  abstract findById(id: string): Promise<Order | null>;
  abstract list(): Promise<Order[]>;
}
