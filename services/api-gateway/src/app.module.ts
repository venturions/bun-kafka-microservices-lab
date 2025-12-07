import { Module } from "@nestjs/common";
import { SubmitOrderUseCase } from "./application/use-cases/SubmitOrder";
import { KafkaProducerService } from "./infrastructure/kafka/kafka.producer";
import { OrdersController } from "./interface/http/orders.controller";

@Module({
  controllers: [OrdersController],
  providers: [KafkaProducerService, SubmitOrderUseCase],
})
export class AppModule {}
