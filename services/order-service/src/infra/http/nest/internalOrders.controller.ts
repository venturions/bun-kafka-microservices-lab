import { Body, Controller, Headers, Inject, Post } from "@nestjs/common";
import { CreateOrderUseCase } from "../../../app/use-cases/CreateOrder";
import {
  createOrderSchema,
  type CreateOrderRequest,
} from "../../../app/dtos/CreateOrderRequest";

@Controller("internal/orders")
export class InternalOrdersController {
  constructor(
    @Inject(CreateOrderUseCase)
    private readonly createOrderUseCase: CreateOrderUseCase
  ) {}

  @Post()
  async create(
    @Body() body: unknown,
    @Headers("x-correlation-id") correlationId: string | undefined
  ) {
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      // Simples: pode lançar BadRequestException se quiser detalhar
      throw new Error("Payload inválido");
    }

    const payload = parsed.data as CreateOrderRequest;
    console.log("[order-service][InternalOrdersController] Recebendo comando", {
      correlationId,
      customerId: payload.customerId,
      items: payload.items.length,
      totalAmount: payload.totalAmount,
    });
    const order = await this.createOrderUseCase.execute(payload);

    console.log("[order-service][InternalOrdersController] Pedido criado", {
      correlationId,
      orderId: order.id,
      status: order.status,
    });
    return order;
  }
}
