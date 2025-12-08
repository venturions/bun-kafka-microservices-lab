import type { PrismaClient } from "@prisma/client";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { PrismaOrdersRepository } from "../../infrastructure/persistence/prisma/PrismaOrdersRepository";
import {
  createTestPrismaClient,
  disconnectPrisma,
  resetDatabase,
} from "../../infrastructure/database/test-utils/prisma-test-client";
import { CreateOrderUseCase } from "./CreateOrder";

let prisma: PrismaClient;
let useCase: CreateOrderUseCase;

const basePayload = {
  customerId: crypto.randomUUID(),
  items: [{ sku: "SKU-123", quantity: 2 }],
  totalAmount: 199.9,
};

beforeAll(async () => {
  prisma = await createTestPrismaClient();
  const repository = new PrismaOrdersRepository(prisma);
  useCase = new CreateOrderUseCase(repository);
});

afterAll(async () => {
  await disconnectPrisma(prisma);
});

beforeEach(async () => {
  await resetDatabase(prisma);
});

describe("CreateOrderUseCase", () => {
  it("persists order in sqlite in-memory", async () => {
    // Arrange
    const payload = { ...basePayload };

    // Act
    const order = await useCase.execute(payload);

    // Assert
    expect(order.id).toBeDefined();
    expect(order.status).toBe("pending");
    expect(order.items).toHaveLength(1);
    expect(order.createdAt).toBeInstanceOf(Date);

    const stored = await prisma.order.findUnique({ where: { id: order.id } });
    expect(stored).not.toBeNull();
    expect(stored?.customerId).toBe(payload.customerId);
    expect(Number(stored?.totalAmount)).toBe(payload.totalAmount);
  });

  it("rejects invalid payload", async () => {
    // Arrange
    const payload = { ...basePayload, items: [] } as any;

    // Act & Assert
    await expect(useCase.execute(payload)).rejects.toThrow(/at least one item/i);
  });
});
