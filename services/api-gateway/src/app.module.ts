import { Module } from "@nestjs/common";
import { OrdersController } from "./infra/http/nest/orders.controller";
import { SubmitOrderUseCase } from "./app/use-cases/SubmitOrder";
import { KafkaProducerService } from "./infra/kafka/kafka.producer";

@Module({
  controllers: [OrdersController],
  providers: [KafkaProducerService, SubmitOrderUseCase],
})
export class AppModule {}
