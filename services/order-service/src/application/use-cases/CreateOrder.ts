import { Inject, Injectable } from "@nestjs/common";
import { OrderFactory } from "../../domain/factories/OrderFactory";
import { OrdersRepository } from "../../domain/repositories/OrdersRepository";
import { createOrderSchema, type CreateOrderRequest } from "../dtos/CreateOrderRequest";
import type { CreateOrderResponse } from "../dtos/CreateOrderResponse";

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(OrdersRepository)
    private readonly ordersRepository: OrdersRepository
  ) {}

  async execute(payload: CreateOrderRequest): Promise<CreateOrderResponse> {
    const parsed = createOrderSchema.parse(payload);
    console.log("[order-service][CreateOrderUseCase] Starting order creation", {
      customerId: parsed.customerId,
      items: parsed.items.length,
      totalAmount: parsed.totalAmount,
    });
    const orderEntity = OrderFactory.fromDTO({
      id: crypto.randomUUID(),
      customerId: parsed.customerId,
      items: parsed.items,
      totalAmount: parsed.totalAmount,
    });

    const order = await this.ordersRepository.create(orderEntity);

    console.log("[order-service][CreateOrderUseCase] Order persisted", {
      orderId: order.id,
      status: order.status,
    });
    return OrderFactory.toResponse(order);
  }
}
