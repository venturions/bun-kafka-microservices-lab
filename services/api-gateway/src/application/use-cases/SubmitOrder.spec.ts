import { describe, expect, it, vi } from "vitest";
import type { OrderRequest } from "../dtos/OrderRequest";
import type {
  KafkaProducerService,
  OrderCreatedEvent,
} from "../../infrastructure/kafka/kafka.producer";
import { SubmitOrderUseCase } from "./SubmitOrder";

const payload: OrderRequest = {
  customerId: crypto.randomUUID(),
  items: [{ sku: "SKU-1", quantity: 1 }],
  totalAmount: 120,
};

describe("SubmitOrderUseCase", () => {
  it("publishes event with correlation id and returns payload", async () => {
    // Arrange
    const publishOrderCreated = vi.fn(
      async (_event: OrderCreatedEvent): Promise<void> => {}
    );
    const useCase = new SubmitOrderUseCase(
      { publishOrderCreated } as unknown as KafkaProducerService
    );

    // Act
    const result = await useCase.execute(payload, "corr-123");

    // Assert
    expect(publishOrderCreated).toHaveBeenCalledOnce();
    const firstCall = publishOrderCreated.mock.calls.at(0);
    expect(firstCall).toBeDefined();
    const [sentEvent] = firstCall ?? [];
    if (!sentEvent) {
      throw new Error("publishOrderCreated was not called with payload");
    }
    expect(sentEvent.correlationId).toBe("corr-123");
    expect(sentEvent.items).toEqual(payload.items);
    expect(sentEvent.customerId).toBe(payload.customerId);
    expect(typeof sentEvent.createdAt).toBe("string");
    expect(result).toEqual(sentEvent);
  });
});
