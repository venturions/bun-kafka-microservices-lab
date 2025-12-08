import type { Order } from "../Order";

export abstract class OrdersRepository {
  abstract create(data: Omit<Order, "createdAt">): Promise<Order>;
  abstract findById(id: string): Promise<Order | null>;
  abstract list(): Promise<Order[]>;
}
