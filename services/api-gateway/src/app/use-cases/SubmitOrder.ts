import { Inject, Injectable } from "@nestjs/common";
import type { OrderRequest } from "../dtos/OrderRequest";
import {
  HttpOrderServiceClient,
  type OrderResponse,
} from "../../infra/clients/orderServiceClient";

@Injectable()
export class SubmitOrderUseCase {
  constructor(
    @Inject(HttpOrderServiceClient)
    private readonly orderServiceClient: HttpOrderServiceClient
  ) {}

  async execute(payload: OrderRequest, correlationId: string) {
    console.log(
      "[api-gateway][SubmitOrderUseCase] Preparando envio ao order-service",
      {
        correlationId,
        customerId: payload.customerId,
        items: payload.items.length,
        totalAmount: payload.totalAmount,
      }
    );

    const order: OrderResponse = await this.orderServiceClient.createOrder(
      payload,
      correlationId
    );

    console.log("[api-gateway][SubmitOrderUseCase] order-service respondeu", {
      correlationId,
      orderId: order.id,
      status: order.status,
    });

    return order;
  }
}
