import { Inject, Injectable } from "@nestjs/common";
import type { OrderRequest } from "../dtos/OrderRequest";
import {
  KafkaProducerService,
  type OrderCreatedEvent,
} from "../../infra/kafka/kafka.producer";

@Injectable()
export class SubmitOrderUseCase {
  constructor(
    @Inject(KafkaProducerService)
    private readonly kafkaProducer: KafkaProducerService
  ) {}

  async execute(payload: OrderRequest, correlationId: string) {
    console.log(
      "[api-gateway][SubmitOrderUseCase] Publicando evento order_created",
      {
        correlationId,
        customerId: payload.customerId,
        items: payload.items.length,
        totalAmount: payload.totalAmount,
      }
    );

    const event: OrderCreatedEvent = {
      ...payload,
      correlationId,
      createdAt: new Date().toISOString(),
    };

    await this.kafkaProducer.publishOrderCreated(event);

    console.log("[api-gateway][SubmitOrderUseCase] Evento publicado", {
      correlationId,
      topic: process.env.KAFKA_TOPIC_ORDER_CREATED ?? "order_created",
    });

    return event;
  }
}
