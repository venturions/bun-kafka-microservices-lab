import { Inject, Injectable } from "@nestjs/common";
import type { OrdersRepository } from "../../domain/repositories/OrdersRepository";
import type { CreateOrderRequest } from "../dtos/CreateOrderRequest";
import { InMemoryOrdersRepository } from "../../infra/persistence/InMemoryOrdersRepository";

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject(InMemoryOrdersRepository)
    private readonly ordersRepository: OrdersRepository
  ) {}

  async execute(payload: CreateOrderRequest) {
    console.log(
      "[order-service][CreateOrderUseCase] Iniciando criação do pedido",
      {
        customerId: payload.customerId,
        items: payload.items.length,
        totalAmount: payload.totalAmount,
      }
    );
    const order = await this.ordersRepository.create({
      id: crypto.randomUUID(),
      customerId: payload.customerId,
      items: payload.items,
      totalAmount: payload.totalAmount,
      status: "pending",
    });

    console.log("[order-service][CreateOrderUseCase] Pedido persistido", {
      orderId: order.id,
      status: order.status,
    });
    return order;
  }
}
