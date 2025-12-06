## Arquitetura v1 – Fluxo HTTP síncrono

Esta fase descreve o primeiro marco do laboratório: um fluxo **100% síncrono via HTTP** entre o `api-gateway` (exposto ao cliente) e o `order-service` (serviço interno). O objetivo é consolidar validações, correlação de requisições e separação de camadas antes da migração para Kafka.

```
Cliente → API Gateway ──HTTP──> Order Service → Resposta → Cliente
```

---

## Componentes

### API Gateway (`services/api-gateway`)

- **Endpoint público**: `POST /orders`
- **Validação**: Zod (`OrderRequest`) garante `customerId` UUID, itens e `totalAmount`.
- **CorrelationId**: lê `x-correlation-id` ou gera via `crypto.randomUUID()`; valor propagado em headers/logs.
- **Camadas**:
  - `OrdersController` (infra) recebe requisição, valida e chama o use case.
  - `SubmitOrderUseCase` (app) orquestra a chamada downstream.
  - `HttpOrderServiceClient` (infra) faz `fetch` para o serviço interno e trata erros.
- **Logs**: cada etapa loga `[api-gateway][...]` com `correlationId`, IDs e totais.

### Order Service (`services/order-service`)

- **Endpoint interno**: `POST /internal/orders`
- **Validação**: usa o mesmo schema (adaptado) para defesa em profundidade.
- **Camadas**:
  - `InternalOrdersController` (infra) recebe comando interno e gera logs.
  - `CreateOrderUseCase` (app) cria pedidos com status inicial `pending`.
  - `InMemoryOrdersRepository` (infra) persiste em um `Map`, preenchendo `createdAt`.
- **Resposta**: retorna o objeto `Order` criado (id, customerId, items, status, timestamps).

---

## Contratos

### Requisição (cliente → gateway)
```json
{
  "customerId": "06f3bbf9-24ad-4d18-9d0d-7fad5b5f5cbf",
  "items": [{ "sku": "SKU-1", "quantity": 2 }],
  "totalAmount": 150
}
```

### Resposta (gateway → cliente)
```json
{
  "correlationId": "4d93d58a-4f0b-4d7c-9b3d-5dc2f44f9f92",
  "order": {
    "id": "99f3c983-5c7c-4d48-8411-347b5f8c6d22",
    "customerId": "06f3bbf9-24ad-4d18-9d0d-7fad5b5f5cbf",
    "items": [{ "sku": "SKU-1", "quantity": 2 }],
    "totalAmount": 150,
    "status": "pending",
    "createdAt": "2025-12-05T21:15:00.000Z"
  }
}
```

---

## Decisões-chave

- **Clean Architecture light**: `app/` (use cases, DTOs) desacoplado de `infra/` (Nest controllers, HTTP clients, repositórios). Facilita trocar transporte (Kafka) ou persistência (Prisma) sem quebrar domínio.
- **Validação redundante**: gateway valida para proteger borda, serviço valida para garantir contratos internos e preparar terreno para múltiplos produtores (no futuro, eventos).
- **CorrelationId universal**: adotado antes de Kafka para simplificar rastreabilidade, logs e futura instrumentação (OpenTelemetry).
- **Bun + NestJS + Fastify**: mesmo runtime/framework nos dois serviços para compartilhar padrões (DI, logs, pipes) e facilitar implantação com Bun.

---

## Limitações identificadas

- Acoplamento direto: gateway depende de um endpoint HTTP específico (`/internal/orders`).
- Latência síncrona: cliente precisa esperar o order-service responder; não há filas nem retries.
- Persistência em memória: reinícios perdem dados; não há consultas ou idempotência.
- Observabilidade básica: logs estruturados, mas ainda sem traces/métricas centralizados.

---

## Próximos passos

1. **Fase 2 – Kafka**: gateway passa a publicar `order_created` em um tópico; order-service consome eventos ao invés de HTTP. Outros serviços (inventory, payment, notification) entram como consumidores independentes.
2. **Fase 2.5 – Observabilidade + Schema Registry**: instrumentar os serviços com OpenTelemetry, subir otel-collector + Jaeger, adicionar Schema Registry e versionar os contratos de eventos.
3. **Fase 3+**: adicionar inventory/payment/notification, persistência real (Postgres + Prisma) e, por fim, migrar para Kubernetes com todos os componentes (serviços + Kafka + observabilidade).

Este documento serve como referência da base síncrona antes da evolução para arquitetura event-driven.
