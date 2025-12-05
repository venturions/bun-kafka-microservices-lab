import type { Router } from "express";
import { orderRequestSchema } from "../../../app/dtos/OrderRequest";
import { SubmitOrderUseCase } from "../../../app/use-cases/SubmitOrder";

type Dependencies = {
  submitOrderUseCase: SubmitOrderUseCase;
};

export function registerOrderRoutes(router: Router, deps: Dependencies) {
  router.post("/orders", async (req, res, next) => {
    try {
      const correlationId =
        req.header("x-correlation-id") ?? crypto.randomUUID();

      const payload = orderRequestSchema.parse(req.body);
      const result = await deps.submitOrderUseCase.execute(
        payload,
        correlationId
      );

      res.status(201).json({ correlationId, order: result });
    } catch (error) {
      next(error);
    }
  });
}
