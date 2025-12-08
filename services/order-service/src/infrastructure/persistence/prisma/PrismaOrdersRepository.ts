import { Injectable } from "@nestjs/common";
import { Prisma, PrismaClient, type Order as PrismaOrder } from "@prisma/client";
import type { Order } from "../../../domain/entities/Order";
import { OrderFactory } from "../../../domain/factories/OrderFactory";
import { OrdersRepository } from "../../../domain/repositories/OrdersRepository";

@Injectable()
export class PrismaOrdersRepository extends OrdersRepository {
  constructor(private readonly prisma: PrismaClient) {
    super();
  }

  private mapToDomain(order: PrismaOrder): Order {
    return OrderFactory.fromPersistence({
      id: order.id,
      customerId: order.customerId,
      items: order.items,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      createdAt: order.createdAt,
    });
  }

  async create(order: Order): Promise<Order> {
    const data = OrderFactory.toPersistence(order);
    const created = await this.prisma.order.create({
      data: {
        id: data.id,
        customerId: data.customerId,
        items: data.items,
        totalAmount: new Prisma.Decimal(data.totalAmount),
        status: data.status,
        createdAt: data.createdAt,
      },
    });

    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      return null;
    }

    return this.mapToDomain(order);
  }

  async list(): Promise<Order[]> {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    return orders.map((order) => this.mapToDomain(order));
  }
}
