import type { PrismaClient } from "@prisma/client";
import { beforeAll, afterAll, beforeEach, describe, expect, it } from "vitest";
import { CreateOrderUseCase } from "../../application/use-cases/CreateOrder";
import {
  createTestPrismaClient,
  disconnectPrisma,
  resetDatabase,
} from "../../infrastructure/database/test-utils/prisma-test-client";
import { PrismaOrdersRepository } from "../../infrastructure/persistence/prisma/PrismaOrdersRepository";
import { KafkaConsumerService } from "./kafka.consumer";

let prisma: PrismaClient;
let consumer: KafkaConsumerService;

beforeAll(async () => {
  prisma = await createTestPrismaClient();
  const repository = new PrismaOrdersRepository(prisma);
  const useCase = new CreateOrderUseCase(repository);
  consumer = new KafkaConsumerService(useCase);
});

afterAll(async () => {
  await disconnectPrisma(prisma);
});

beforeEach(async () => {
  await resetDatabase(prisma);
});

describe("KafkaConsumerService.handleMessage", () => {
  it("persists order from valid payload", async () => {
    // Arrange
    const payload = {
      customerId: crypto.randomUUID(),
      items: [{ sku: "ITEM-1", quantity: 1 }],
      totalAmount: 50,
      correlationId: "corr-1",
      createdAt: new Date().toISOString(),
    };

    // Act
    await consumer.handleMessage({
      value: Buffer.from(JSON.stringify(payload)),
    });

    // Assert
    const stored = await prisma.order.findFirst({
      where: { customerId: payload.customerId },
    });

    expect(stored).not.toBeNull();
    expect(stored?.status).toBe("pending");
    expect(JSON.parse(stored!.items)).toHaveLength(1);
  });

  it("ignores invalid payload without creating record", async () => {
    // Arrange
    const invalidPayload = {
      customerId: "invalid-uuid",
      items: [],
      totalAmount: -10,
      correlationId: "corr-2",
      createdAt: "invalid-date",
    };

    // Act
    await consumer.handleMessage({
      value: Buffer.from(JSON.stringify(invalidPayload)),
    });

    // Assert
    const orders = await prisma.order.findMany();
    expect(orders).toHaveLength(0);
  });
});
