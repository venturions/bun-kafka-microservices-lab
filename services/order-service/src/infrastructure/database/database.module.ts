import { Module } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { OrdersRepository } from "../../domain/repositories/OrdersRepository";
import { InMemoryOrdersRepository } from "../persistence/InMemoryOrdersRepository";
import { PrismaOrdersRepository } from "../persistence/prisma/PrismaOrdersRepository";

@Module({
  providers: [
    {
      provide: OrdersRepository,
      useFactory: () => {
        const useInMemory =
          process.env.USE_IN_MEMORY_DB === "true" || !process.env.DATABASE_URL;

        if (!process.env.DATABASE_URL && process.env.USE_IN_MEMORY_DB !== "true") {
          console.warn(
            "[order-service][DatabaseModule] DATABASE_URL not set, falling back to in-memory repository"
          );
        }

        if (useInMemory) {
          return new InMemoryOrdersRepository();
        }

        const prisma = new PrismaClient();
        return new PrismaOrdersRepository(prisma);
      },
    },
  ],
  exports: [OrdersRepository],
})
export class DatabaseModule {}
