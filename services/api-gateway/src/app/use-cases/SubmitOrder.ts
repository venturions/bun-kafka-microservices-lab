import type { OrderRequest } from "../dtos/OrderRequest";
import type { OrderServiceClient } from "../../infra/clients/orderServiceClient";

type Dependencies = {
  orderServiceClient: OrderServiceClient;
};

export class SubmitOrderUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(payload: OrderRequest, correlationId: string) {
    // Aqui poderíamos enriquecer o comando (ex.: adicionar metadata)
    const response = await this.deps.orderServiceClient.createOrder(
      payload,
      correlationId
    );

    return response;
  }
}
