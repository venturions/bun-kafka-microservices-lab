import type { OrderRequest } from "../../app/dtos/OrderRequest";

export type OrderServiceClient = {
  createOrder: (payload: OrderRequest, correlationId: string) => Promise<any>;
};

const ORDER_SERVICE_URL =
  process.env.ORDER_SERVICE_URL ?? "http://localhost:3002/internal/orders";

export const orderServiceClient: OrderServiceClient = {
  async createOrder(payload, correlationId) {
    const response = await fetch(ORDER_SERVICE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-correlation-id": correlationId,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `order-service respondeu ${response.status}: ${body || "sem corpo"}`
      );
    }

    return response.json();
  },
};
