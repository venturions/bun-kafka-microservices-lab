# Roadmap – Mini Plataforma de Pedidos (Bun + Kafka + Microservices)

## 1. Visão Geral

Este projeto é uma **mini plataforma de pedidos** (tipo e-commerce simplificado) construída para estudar:

- Arquitetura de **microserviços**
- **Event-Driven Architecture** com Kafka
- **Bun** como runtime
- **PostgreSQL** + **Prisma ORM**
- **Docker** e noções de **Kubernetes**
- Boas práticas: **Clean Code**, **SOLID**, **Clean Architecture**
- Validação com **Zod**
- Conceitos básicos de **autenticação**

O objetivo não é ter um produto perfeito, e sim um **laboratório de arquitetura**.

---

## 2. Escopo do Sistema

Microserviços principais:

- `api-gateway`
- `order-service`
- `inventory-service`
- `payment-service`
- `notification-service`

Infra e tecnologias:

- Runtime: **Bun** (JS/TS)
- Mensageria: **Kafka**
- Banco: **PostgreSQL** (via Prisma, em fases mais avançadas)
- Containerização: **Docker**
- Orquestração (opcional): **Kubernetes** (kind/minikube)

---

## 3. Fases do Roadmap

As fases abaixo podem ser feitas aos poucos (ex.: um pouco por dia).

---

### Estrutura de Pastas Recomendada

Para seguir Clean Architecture + Event-Driven, use dois níveis: raiz do monorepo e estrutura interna de cada serviço.

```
bun-kafka-microservices-lab/
  docker/                    # docker-compose, overrides, scripts
  infra/                     # manifests Kubernetes, diagramas, docs
  libs/
    event-contracts/         # schemas Zod/Avro dos eventos
    shared-kafka/            # wrappers de producer/consumer (Bun)
    shared-auth/             # helpers JWT, middlewares
  services/
    api-gateway/
    order-service/
    inventory-service/
    payment-service/
    notification-service/
  tools/                     # scripts Bun para migrations, seeds, smoke tests
  README.md
```

E dentro de cada `services/<nome>/`:

```
services/order-service/
  src/
    app/                     # use cases, DTOs, validadores Zod
      use-cases/
      dtos/
      validators/
    domain/                  # entidades e regras puras
      entities/
      events/
      repositories/          # contratos de persistência
      services/              # domain services específicos
    infra/                   # adaptações externas
      http/
        routes/
        controllers/
        middlewares/
      kafka/
        consumers/
        producers/
      persistence/
        prisma/
          schema.prisma
          migrations/
        repositories/        # implementações concretas
      config/                # env loader, providers
    shared/                  # utilidades locais (logger, helpers)
    main.ts                  # composição e injeção das dependências
  tests/
    unit/
    integration/
    contract/                # testes contra Kafka topics/schemas
  package.json
  Dockerfile
```

Essa base facilita evoluir o laboratório, mantendo separação clara entre domínio (agnóstico de frameworks), aplicação (use cases) e infraestrutura (HTTP, Kafka, Prisma).

---

### Fase 0 – Setup Inicial

**Objetivo:** preparar ambiente e contexto do projeto.

- [ ] Criar repositório (ex.: `bun-kafka-microservices-lab`).
- [ ] Instalar e configurar **Bun**.
- [ ] Criar estrutura inicial de pastas:
  - `services/`
  - `docs/`
- [ ] Criar um serviço simples (ex.: `playground-service`) com:
  - `GET /health` retornando `{ status: 'ok' }`.
- [ ] Criar `docs/domain.md` com:
  - Descrição da ideia de “plataforma de pedidos”.
  - Entidade básica `Order` (id, items, total, status etc.).

---

### Fase 1 – API Gateway + Order Service (HTTP)

**Objetivo:** primeiro fluxo simples, ainda sem Kafka.

- [ ] Criar `services/api-gateway`:
  - Servidor HTTP com Bun.
  - Endpoint `POST /orders` com validação básica (pode usar Zod depois).
- [ ] Criar `services/order-service`:
  - Servidor HTTP interno.
  - Endpoint `POST /internal/orders` que:
    - Cria um pedido em memória.
    - Retorna o pedido criado.
- [ ] Ajustar o `api-gateway` para:
  - Receber o pedido via HTTP.
  - Chamar `order-service` via HTTP interno.
- [ ] Criar `docs/architecture-v1-http.md` explicando:
  - Como o fluxo funciona hoje (gateway → order-service).
  - Limitações desse modelo síncrono e acoplado.

---

### Fase 2 – Introdução do Kafka (migração para eventos)

**Objetivo:** migrar de comunicação direta HTTP para comunicação baseada em eventos com Kafka.

- [ ] Adicionar `docker-compose.yml` para subir:
  - `zookeeper`
  - `kafka`
- [ ] Subir Kafka local com `docker-compose up`.
- [ ] Criar `docs/events.md` com:
  - Lista de tópicos (ex.: `orders`, `inventory`, `payments`, `notifications`).
  - Estrutura dos eventos (JSON) com:
    - `eventType`, `orderId`, `timestamp`, `correlationId`, etc.
- [ ] Alterar `api-gateway` para:
  - Em vez de chamar `order-service` via HTTP, publicar evento `order_created` no tópico `orders`.
- [ ] Alterar `order-service` para:
  - Consumir `order_created`.
  - Criar o pedido em memória ao receber o evento.
- [ ] Criar `docs/architecture-v2-kafka.md` explicando:
  - Como ficou o fluxo baseado em eventos.
  - Benefícios (menos acoplamento, assíncrono, etc.).

---

### Fase 3 – Inventory, Payment e Notification

**Objetivo:** completar o fluxo de negócio ponta-a-ponta usando vários serviços.

#### 3.1 Inventory Service

- [ ] Criar `services/inventory-service`.
- [ ] Consumir eventos de pedido (ex.: `order_created` ou `order_confirmed`).
- [ ] Simular estoque (map em memória).
- [ ] Publicar:
  - `inventory_reserved` quando houver estoque.
  - `inventory_failed` quando não houver.

#### 3.2 Integração Order + Inventory

- [ ] Ajustar `order-service` para:
  - Atualizar status do pedido com base em `inventory_reserved` / `inventory_failed`.
  - Publicar algo como `order_ready_for_payment` quando estoque estiver reservado.
  - Cancelar pedido quando estoque falhar.

#### 3.3 Payment Service

- [ ] Criar `services/payment-service`.
- [ ] Consumir `order_ready_for_payment`.
- [ ] Simular pagamento (ex.: 70% aprovado / 30% recusado).
- [ ] Publicar:
  - `payment_approved`
  - `payment_declined`.

#### 3.4 Notification Service

- [ ] Criar `services/notification-service`.
- [ ] Consumir eventos de:
  - `payment_approved`
  - `payment_declined`
  - (opcional) `order_canceled`.
- [ ] Logar algo como:
  - `"Notificação: pedido X aprovado/recusado/cancelado"`.
- [ ] (Opcional) Guardar notificações em memória + criar `GET /notifications` para consulta.

#### 3.5 CorrelationId + Healthchecks

- [ ] Padronizar uso de `correlationId` em todos os eventos.
- [ ] Adicionar `GET /health` em todos os serviços.
- [ ] Criar `docs/flows.md` com:
  - Fluxo de um pedido aprovado.
  - Fluxo de um pedido recusado ou com falha de estoque.

---

### Fase 4 – Persistência com PostgreSQL + Prisma (opcional mas recomendado)

**Objetivo:** sair de dados em memória e salvar pedidos em banco.

- [ ] Subir **PostgreSQL** via Docker (pode ser junto do Kafka no `docker-compose`).
- [ ] Configurar **Prisma ORM** em pelo menos um serviço (inicialmente `order-service`):
  - Criar schema Prisma (`schema.prisma`).
  - Modelo `Order` e tabelas auxiliares.
- [ ] Migrar lógica de persistência do `order-service`:
  - De memória → banco PostgreSQL.
- [ ] Ajustar consultas (se tiver endpoint de listar pedidos).
- [ ] Documentar em `docs/persistence.md`:
  - Como o banco está sendo usado.
  - Quais serviços acessam o PostgreSQL.

---

### Fase 5 – Dockerização dos Serviços

**Objetivo:** rodar tudo em containers.

- [ ] Criar `Dockerfile` para:
  - `api-gateway`
  - `order-service`
  - `inventory-service`
  - `payment-service`
  - `notification-service`
- [ ] Atualizar (ou criar outro) `docker-compose` para:
  - Kafka
  - PostgreSQL
  - Todos os serviços Bun
- [ ] Validar que o fluxo completo funciona com:
  - `docker-compose up` (ou comandos equivalentes).

---

### Fase 6 – Kubernetes (Opcional / Avançado)

**Objetivo:** ter uma versão simples rodando em Kubernetes.

- [ ] Subir cluster local (kind/minikube).
- [ ] Criar manifests para:
  - `Deployment` + `Service` para cada microserviço.
- [ ] Configurar um `Ingress` ou `NodePort` para o `api-gateway`.
- [ ] Conectar serviços ao Kafka e PostgreSQL:
  - Como serviços internos ou externos ao cluster.
- [ ] Testar fluxo básico de criação de pedido dentro do cluster.

---

## 4. Boas Práticas e Padrões a Reforçar

Durante todo o projeto, procurar aplicar:

- **Clean Code**
  - Nomes claros para variáveis, funções e arquivos.
  - Funções pequenas e focadas.
- **SOLID**
  - Especialmente Single Responsibility e Dependency Inversion.
- **Clean Architecture**
  - Separar camadas de domínio, aplicação e infraestrutura (quando fizer sentido).
- **Validação com Zod**
  - Em endpoints HTTP, validar payloads de entrada.
- **Autenticação (em fases futuras)**
  - Tokens/Bearer ou JWT para proteger certos endpoints (ex.: criação de pedido em nome de um usuário).
- **Logs estruturados**
  - Incluir `correlationId` nos logs para rastrear um pedido entre serviços.

---

## 5. Retrospectiva (para o futuro)

Ao final das fases, criar um arquivo `docs/retrospective.md` com:

- O que foi aprendido em cada fase.
- Dificuldades encontradas.
- Pontos que seriam feitos diferente numa segunda versão.
- Ideias de evolução:
  - Observabilidade real (Prometheus/Grafana/Jaeger).
  - Requisições idempotentes.
  - Retries e Dead Letter Queues no Kafka.
  - Autenticação completa e autorização por serviço.

---
