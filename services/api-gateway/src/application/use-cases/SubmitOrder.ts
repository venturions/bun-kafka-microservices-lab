import { Inject, Injectable } from "@nestjs/common";
import { OrderEvents, type OrderCreatedPayload } from "@lab/contracts";
import type { OrderRequest } from "../dtos/OrderRequest";
import { KafkaProducerService } from "../../infrastructure/kafka/kafka.producer";

@Injectable()
export class SubmitOrderUseCase {
  constructor(
    @Inject(KafkaProducerService)
    private readonly kafkaProducer: KafkaProducerService
  ) {}

  async execute(payload: OrderRequest, correlationId: string) {
    console.log(
      "[api-gateway][SubmitOrderUseCase] Publishing order_created event",
      {
        correlationId,
        customerId: payload.customerId,
        items: payload.items.length,
        totalAmount: payload.totalAmount,
      }
    );

    const event: OrderCreatedPayload = {
      ...payload,
      correlationId,
      createdAt: new Date().toISOString(),
    };

    await this.kafkaProducer.publishOrderCreated(event);

    console.log("[api-gateway][SubmitOrderUseCase] Event published", {
      correlationId,
      topic: process.env.KAFKA_TOPIC_ORDER_CREATED ?? OrderEvents.OrderCreated,
    });

    return event;
  }
}
