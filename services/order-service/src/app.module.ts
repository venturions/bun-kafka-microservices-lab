import { Module } from "@nestjs/common";
import { CreateOrderUseCase } from "./application/use-cases/CreateOrder";
import { KafkaConsumerService } from "./interface/kafka/kafka.consumer";
import { DatabaseModule } from "./infrastructure/database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [CreateOrderUseCase, KafkaConsumerService],
})
export class AppModule {}
