import { Module } from "@nestjs/common";
import { InternalOrdersController } from "./infra/http/nest/internalOrders.controller";
import { InMemoryOrdersRepository } from "./infra/persistence/InMemoryOrdersRepository";
import { CreateOrderUseCase } from "./app/use-cases/CreateOrder";

@Module({
  controllers: [InternalOrdersController],
  providers: [InMemoryOrdersRepository, CreateOrderUseCase],
})
export class AppModule {}
