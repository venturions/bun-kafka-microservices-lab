import express from "express";
import { registerOrderRoutes } from "./infra/http/routes/orders";
import { errorHandler } from "./infra/http/middlewares/errorHandler";
import { orderServiceClient } from "./infra/clients/orderServiceClient";
import { SubmitOrderUseCase } from "./app/use-cases/SubmitOrder";

const app = express();
app.use(express.json());

const submitOrderUseCase = new SubmitOrderUseCase({
  orderServiceClient,
});

const router = express.Router();
registerOrderRoutes(router, { submitOrderUseCase });
app.use(router);

app.use(errorHandler);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`API Gateway rodando em http://localhost:${port}`);
});
