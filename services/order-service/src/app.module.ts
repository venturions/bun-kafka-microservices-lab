import { Module } from "@nestjs/common";
import { InMemoryOrdersRepository } from "./infra/persistence/InMemoryOrdersRepository";
import { CreateOrderUseCase } from "./app/use-cases/CreateOrder";
import { KafkaConsumerService } from "./infra/kafka/kafka.consumer";

@Module({
  providers: [
    InMemoryOrdersRepository,
    CreateOrderUseCase,
    KafkaConsumerService,
  ],
})
export class AppModule {}
