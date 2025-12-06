import { Injectable } from "@nestjs/common";
import type { OrderRequest } from "../../app/dtos/OrderRequest";

export interface OrderResponse extends OrderRequest {
  id: string;
  status: string;
  createdAt: string;
}

export interface OrderServiceClient {
  createOrder(
    payload: OrderRequest,
    correlationId: string
  ): Promise<OrderResponse>;
}

@Injectable()
export class HttpOrderServiceClient implements OrderServiceClient {
  private readonly orderServiceUrl =
    process.env.ORDER_SERVICE_URL ?? "http://localhost:3002/internal/orders";

  async createOrder(
    payload: OrderRequest,
    correlationId: string
  ): Promise<OrderResponse> {
    console.log(
      "[api-gateway][HttpOrderServiceClient] Chamando order-service",
      {
        url: this.orderServiceUrl,
        correlationId,
      }
    );
    const response = await fetch(this.orderServiceUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": correlationId,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(
        "[api-gateway][HttpOrderServiceClient] order-service retornou erro",
        {
          correlationId,
          status: response.status,
          body,
        }
      );
      throw new Error(
        `order-service respondeu ${response.status}: ${body || "sem corpo"}`
      );
    }

    const data = (await response.json()) as OrderResponse;
    console.log(
      "[api-gateway][HttpOrderServiceClient] order-service respondeu com sucesso",
      {
        correlationId,
        orderId: data.id,
      }
    );
    return data;
  }
}
