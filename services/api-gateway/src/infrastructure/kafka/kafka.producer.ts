import { Injectable } from "@nestjs/common";
import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Kafka, type Producer } from "kafkajs";
import { OrderEvents, type OrderCreatedPayload } from "@lab/contracts";
import type { OrderRequest } from "../../application/dtos/OrderRequest";

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private readonly topic =
    process.env.KAFKA_TOPIC_ORDER_CREATED ?? OrderEvents.OrderCreated;
  private readonly producer: Producer;

  constructor() {
    const brokers = (
      process.env.KAFKA_BROKERS ??
      process.env.KAFKA_BROKER ??
      "localhost:9094"
    )
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? "api-gateway",
      brokers,
    });

    this.producer = kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async publishOrderCreated(event: OrderCreatedPayload) {
    await this.producer.send({
      topic: this.topic,
      messages: [
        {
          key: event.correlationId,
          value: JSON.stringify(event),
        },
      ],
    });
  }
}
