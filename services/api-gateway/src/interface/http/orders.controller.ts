import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Inject,
  Post,
} from "@nestjs/common";
import { orderRequestSchema } from "../../application/dtos/OrderRequest";
import { SubmitOrderUseCase } from "../../application/use-cases/SubmitOrder";

@Controller()
export class OrdersController {
  constructor(
    @Inject(SubmitOrderUseCase)
    private readonly submitOrderUseCase: SubmitOrderUseCase
  ) {}

  @Post("orders")
  async create(
    @Headers("x-correlation-id") correlationId: string | undefined,
    @Body() body: unknown
  ) {
    const parsed = orderRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new BadRequestException({
        message: "Payload inválido",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      });
    }

    const resolvedCorrelationId = correlationId ?? crypto.randomUUID();
    console.log("[api-gateway][OrdersController] Recebendo requisição", {
      correlationId: resolvedCorrelationId,
      customerId: parsed.data.customerId,
      items: parsed.data.items.length,
      totalAmount: parsed.data.totalAmount,
    });
    const event = await this.submitOrderUseCase.execute(
      parsed.data,
      resolvedCorrelationId
    );

    console.log(
      "[api-gateway][OrdersController] Evento order_created enviado",
      {
        correlationId: resolvedCorrelationId,
        topic: process.env.KAFKA_TOPIC_ORDER_CREATED ?? "order_created",
      }
    );
    return { correlationId: resolvedCorrelationId, status: "accepted", event };
  }
}
