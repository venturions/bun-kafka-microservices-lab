import { Inject, Injectable } from "@nestjs/common";
import type { OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { Kafka, type Consumer } from "kafkajs";
import { createOrderSchema } from "../../app/dtos/CreateOrderRequest";
import { CreateOrderUseCase } from "../../app/use-cases/CreateOrder";

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly topic =
    process.env.KAFKA_TOPIC_ORDER_CREATED ?? "order_created";
  private readonly consumer: Consumer;

  constructor(
    @Inject(CreateOrderUseCase)
    private readonly createOrderUseCase: CreateOrderUseCase
  ) {
    const brokers = (
      process.env.KAFKA_BROKERS ??
      process.env.KAFKA_BROKER ??
      "localhost:9092"
    )
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    const kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID ?? "order-service",
      brokers,
    });

    this.consumer = kafka.consumer({
      groupId: process.env.KAFKA_GROUP_ID ?? "order-service-group",
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: this.topic, fromBeginning: false });

    console.log(
      `[order-service][KafkaConsumer] Conectado e assinando tópico: ${this.topic}`
    );

    await this.consumer.run({
      eachMessage: async ({ message }) => {
        await this.handleMessage(message);
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async handleMessage(message: {
    key?: Buffer | null;
    value: Buffer | null;
  }) {
    const rawValue = message.value?.toString();
    if (!rawValue) {
      console.warn("[order-service][KafkaConsumer] Mensagem vazia recebida");
      return;
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawValue);
    } catch {
      console.error("[order-service][KafkaConsumer] JSON inválido", {
        rawValue,
      });
      return;
    }

    const correlationId =
      (payload as { correlationId?: string }).correlationId ?? "unknown";

    console.log("[order-service][KafkaConsumer] Evento recebido", {
      correlationId,
      topic: this.topic,
    });

    // Permite campos extras vindos do producer (correlationId, createdAt, etc.)
    const parsed = createOrderSchema.passthrough().safeParse(payload);
    if (!parsed.success) {
      console.error("[order-service][KafkaConsumer] Payload inválido", {
        correlationId,
        issues: parsed.error.issues,
      });
      return;
    }

    try {
      const order = await this.createOrderUseCase.execute(parsed.data);
      console.log("[order-service][KafkaConsumer] Pedido criado com sucesso", {
        correlationId,
        orderId: order.id,
        status: order.status,
      });
    } catch (err) {
      console.error("[order-service][KafkaConsumer] Erro ao criar pedido", {
        correlationId,
        error: err instanceof Error ? err.message : err,
      });
    }
  }
}
