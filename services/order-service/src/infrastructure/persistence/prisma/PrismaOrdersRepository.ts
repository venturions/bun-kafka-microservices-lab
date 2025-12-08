import { Injectable } from "@nestjs/common";
import { Prisma, PrismaClient, type Order as PrismaOrder } from "@prisma/client";
import { createOrderSchema } from "../../../application/dtos/CreateOrderRequest";
import type { Order } from "../../../domain/Order";
import { OrdersRepository } from "../../../domain/repositories/OrdersRepository";

const orderItemsSchema = createOrderSchema.shape.items;

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private mapToDomain(order: PrismaOrder): Order {
    const parsedItems = orderItemsSchema.parse(JSON.parse(order.items));

    return {
      id: order.id,
      customerId: order.customerId,
      items: parsedItems,
      totalAmount: Number(order.totalAmount),
      status: order.status as Order["status"],
      createdAt: order.createdAt,
    };
  }

  async create(data: Omit<Order, "createdAt">): Promise<Order> {
    const created = await this.prisma.order.create({
      data: {
        id: data.id,
        customerId: data.customerId,
        items: JSON.stringify(orderItemsSchema.parse(data.items)),
        totalAmount: new Prisma.Decimal(data.totalAmount),
        status: data.status,
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
