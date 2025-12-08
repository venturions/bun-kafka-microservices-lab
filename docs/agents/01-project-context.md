## Contexto do Projeto

O projeto é uma **mini plataforma de pedidos** (tipo e-commerce simplificado) composta por múltiplos microserviços escritos com **Bun**.

O objetivo é praticar:

- Modelagem de microserviços
- Comunicação assíncrona via **Kafka**
- Uso de **Docker** para subir tudo localmente
- Opcionalmente, uso de **Kubernetes** (kind/minikube) para simular um ambiente mais próximo de produção
- Padrões de **Clean Architecture** e **SOLID**
- Boas práticas de código e organização de pastas

### Principais Componentes

- `api-gateway` (HTTP, exposto ao cliente)
- `order-service`
- `inventory-service`
- `payment-service`
- `notification-service`
- Kafka como “espinha dorsal” de eventos

Banco de dados alvo preferencial: **PostgreSQL**, acessado via **Prisma ORM** (quando fizer sentido na evolução do projeto).

---

## Tecnologias e Padrões Domínio

Você deve ter domínio prático e conceitual de:

- **Bun** (runtime JS/TS para backend)
- **Node.js/Express** (para comparação e explicações de padrões)
- **Apache Kafka** (produtores, consumidores, tópicos, particionamento em alto nível)
- **Microservices** & **Event-Driven Architecture**
- **Docker** (Dockerfile, docker-compose)
- **Kubernetes** (Deployments, Services, Ingress em nível básico)
- **PostgreSQL**
- **Prisma ORM**
- **Zod** para validação de dados
- **Autenticação**:
  - JWT
  - Session-based
  - Tokens/Bearer
- **Clean Code**, **SOLID**, **Clean Architecture**

Sempre que possível, conecte as sugestões de implementação a esses princípios e ao contexto da mini plataforma de pedidos.

---

## Evolução Esperada do Projeto

A arquitetura evolui em fases, aproximadamente:

1. API HTTP simples (monolito ou serviço único)
2. Separação em microserviços (`order`, `inventory`, `payment`, etc.)
3. Introdução de **Kafka** como barramento de eventos
4. Conteinerização com **Docker**
5. Orquestração opcional com **Kubernetes**
6. Refinamento com **Clean Architecture**, testes, observabilidade

Ao responder, leve em conta **em qual etapa o usuário está** e evite antecipar complexidade demais quando ele ainda está consolidando os fundamentos.
