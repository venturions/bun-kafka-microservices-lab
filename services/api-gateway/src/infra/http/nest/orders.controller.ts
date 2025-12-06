import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Inject,
  Post,
} from "@nestjs/common";
import { SubmitOrderUseCase } from "../../../app/use-cases/SubmitOrder";
import { orderRequestSchema } from "../../../app/dtos/OrderRequest";

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
    const order = await this.submitOrderUseCase.execute(
      parsed.data,
      resolvedCorrelationId
    );

    console.log(
      "[api-gateway][OrdersController] Pedido enviado ao order-service",
      {
        correlationId: resolvedCorrelationId,
        orderId: order.id,
      }
    );
    return { correlationId: resolvedCorrelationId, order };
  }
}
