import { Module } from "@nestjs/common";
import { OrdersController } from "./infra/http/nest/orders.controller";
import { HttpOrderServiceClient } from "./infra/clients/orderServiceClient";
import { SubmitOrderUseCase } from "./app/use-cases/SubmitOrder";

@Module({
  controllers: [OrdersController],
  providers: [HttpOrderServiceClient, SubmitOrderUseCase],
})
export class AppModule {}
