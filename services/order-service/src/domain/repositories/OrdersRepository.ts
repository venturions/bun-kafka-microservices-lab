import type { Order } from "../Order";

export interface OrdersRepository {
  create(data: Omit<Order, "createdAt">): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  list(): Promise<Order[]>;
}
