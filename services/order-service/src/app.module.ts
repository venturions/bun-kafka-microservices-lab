import { Module } from "@nestjs/common";
import { InMemoryOrdersRepository } from "./infrastructure/persistence/InMemoryOrdersRepository";
import { CreateOrderUseCase } from "./application/use-cases/CreateOrder";
import { KafkaConsumerService } from "./interface/kafka/kafka.consumer";

@Module({
  providers: [
    InMemoryOrdersRepository,
    CreateOrderUseCase,
    KafkaConsumerService,
  ],
})
export class AppModule {}
