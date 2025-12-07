# Arquitetura v2 – Fluxo Event-Driven com Kafka

Esta fase descreve a migração do fluxo de criação de pedidos de HTTP síncrono para **event-driven com Kafka** (KRaft mode). O objetivo é desacoplar gateway e order-service via mensageria assíncrona.

```
Cliente → API Gateway ──Kafka──> Order Service (consumer)
              │
              └──> Tópico: order_created
```

---

## Componentes

### API Gateway (`services/api-gateway`)

- **Endpoint público**: `POST /orders`
- **Validação**: Zod (`OrderRequest`) garante `customerId` UUID, itens e `totalAmount`.
- **CorrelationId**: lê `x-correlation-id` ou gera via `crypto.randomUUID()`.
- **Publicação Kafka**: `KafkaProducerService` publica evento `order_created` no tópico configurado.
- **Resposta**: retorna `202 Accepted` com `correlationId` e resumo do evento (não aguarda processamento).
- **Camadas**:
  - `interface/http/nest/OrdersController` recebe requisição, valida (Zod) e chama o use case.
  - `application/use-cases/SubmitOrder` orquestra a publicação do evento.
  - `infrastructure/kafka/KafkaProducerService` conecta ao Kafka e envia mensagens.

### Order Service (`services/order-service`)

- **Consumidor Kafka**: `KafkaConsumerService` assina o tópico `order_created`.
- **GroupId**: `order-service-group` (permite escalar horizontalmente com partições).
- **Processamento**:
  - Parse JSON do evento.
  - Validação Zod (`CreateOrderRequest`).
  - Chamada ao `CreateOrderUseCase` para persistir pedido.
- **Camadas**:
  - `interface/kafka/KafkaConsumerService` recebe eventos, valida (Zod) e delega ao use case.
  - `application/use-cases/CreateOrder` cria pedidos com status inicial `pending`.
  - `infrastructure/persistence/InMemoryOrdersRepository` persiste em `Map`, preenchendo `createdAt`.
  - `domain/` contém entidade e contratos (Order, OrdersRepository).
- **Logs**: cada etapa loga `[order-service][...]` com `correlationId`.

---

## Contrato do Evento `order_created`

```json
{
  "correlationId": "4d93d58a-4f0b-4d7c-9b3d-5dc2f44f9f92",
  "customerId": "06f3bbf9-24ad-4d18-9d0d-7fad5b5f5cbf",
  "items": [{ "sku": "SKU-1", "quantity": 2 }],
  "totalAmount": 150,
  "createdAt": "2025-12-05T21:15:00.000Z"
}
```

- **Tópico**: `order_created` (configurável via `KAFKA_TOPIC_ORDER_CREATED`)
- **Key**: `correlationId` (garante ordenação por pedido)
- **Value**: JSON conforme schema acima

---

## Infraestrutura Kafka (KRaft)

O cluster roda em modo KRaft (sem Zookeeper), definido em `docker-compose.yml`:

- **Kafka** (single node): broker + controller em `kafka:9092`.
- **Schema Registry**: disponível em `schema-registry:8081` (para uso futuro com Avro/JSON Schema).
- **Kafka UI**: interface web em `localhost:8080` para inspecionar tópicos e mensagens.

### Variáveis de ambiente (services)

| Variável                      | Default                | Descrição                              |
|-------------------------------|------------------------|----------------------------------------|
| `KAFKA_BROKER` / `KAFKA_BROKERS` | `localhost:9094`     | Lista de brokers (separados por `,`)   |
| `KAFKA_CLIENT_ID`             | `api-gateway` / `order-service` | Identificador do cliente Kafka |
| `KAFKA_TOPIC_ORDER_CREATED`   | `order_created`        | Tópico para eventos de pedido          |
| `KAFKA_GROUP_ID`              | `order-service-group`  | Group ID do consumer                   |

---

## Decisões-chave

- **Event-driven**: gateway não espera resposta do order-service; publica evento e retorna `202 Accepted`. Isso desacopla os serviços e permite escalar consumidores independentemente.
- **KafkaJS**: cliente leve, puro JS, compatível com Bun. Lifecycle gerenciado via hooks Nest (`onModuleInit`, `onModuleDestroy`).
- **CorrelationId como key**: garante que mensagens do mesmo pedido vão para a mesma partição, mantendo ordem de processamento.
- **JSON simples**: nesta fase não usamos Schema Registry para serialização; contratos validados via Zod em ambos os lados.
- **Clean Architecture mantida**: use cases permanecem agnósticos de transporte (HTTP ou Kafka); apenas a camada `infra` conhece detalhes de producer/consumer.

---

## Limitações identificadas

- Sem Schema Registry ativo: contratos dependem de alinhamento manual entre producer e consumer.
- Persistência em memória: reinícios perdem dados.
- Sem retries/DLQ: erros de processamento são logados mas não reprocessados automaticamente.
- Observabilidade básica: logs estruturados, mas ainda sem traces/métricas centralizados (OTel pendente).

---

## Fluxo completo

1. Cliente envia `POST /orders` ao API Gateway.
2. Gateway valida payload, gera `correlationId`, publica `order_created` no Kafka.
3. Gateway retorna `202 Accepted` com `correlationId` e evento publicado.
4. Order Service (consumer) recebe evento do tópico `order_created`.
5. Consumer valida payload, chama `CreateOrderUseCase`, persiste pedido em memória.
6. Logs em ambos os serviços rastreiam o fluxo via `correlationId`.

---

## Próximos passos

1. **Schema Registry**: registrar schema do evento e integrar serialização/desserialização.
2. **Observabilidade (OTel)**: instrumentar producer/consumer, propagar trace headers via Kafka.
3. **Persistência**: migrar para Postgres + Prisma no Order Service.
4. **Novos serviços**: inventory, payment, notification consumindo eventos downstream.
5. **Retries e DLQ**: implementar reprocessamento de mensagens com falha.

Este documento serve como referência da arquitetura event-driven antes de adicionar Schema Registry e observabilidade.
