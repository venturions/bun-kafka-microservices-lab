import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import type { OrderRequest } from "../../application/dtos/OrderRequest";
import type { SubmitOrderUseCase } from "../../application/use-cases/SubmitOrder";
import { OrdersController } from "./orders.controller";

const validBody: OrderRequest = {
  customerId: crypto.randomUUID(),
  items: [{ sku: "SKU-9", quantity: 3 }],
  totalAmount: 89.5,
};

function buildController(executeMock = vi.fn()) {
  const useCase = { execute: executeMock } as unknown as SubmitOrderUseCase;
  return { controller: new OrdersController(useCase), executeMock };
}

describe("OrdersController", () => {
  it("validates payload and forwards to use case using header correlation id", async () => {
    // Arrange
    const { controller, executeMock } = buildController(
      vi.fn().mockResolvedValue({ status: "accepted" })
    );
    const correlationId = "cid-123";

    // Act
    const response = await controller.create(correlationId, validBody);

    // Assert
    expect(executeMock).toHaveBeenCalledWith(validBody, correlationId);
    expect(response.correlationId).toBe(correlationId);
  });

  it("generates correlation id when missing and returns it", async () => {
    // Arrange
    const executeMock = vi.fn(async (_payload: OrderRequest, cid: string) => ({
      status: "accepted",
      correlationId: cid,
    }));
    const { controller } = buildController(executeMock);

    // Act
    const response = await controller.create(undefined, validBody);

    // Assert
    expect(executeMock).toHaveBeenCalledOnce();
    const [firstCall] = executeMock.mock.calls;
    expect(firstCall).toBeDefined();
    const [, calledCid] = firstCall ?? [];
    expect(calledCid).toBeDefined();
    expect(response.correlationId).toBe(calledCid);
    expect(response.correlationId).toBeTruthy();
  });

  it("throws BadRequestException for invalid payload", async () => {
    // Arrange
    const { controller } = buildController();

    // Act & Assert
    await expect(
      controller.create("cid-456", { ...validBody, items: [] } as any)
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
