# Testes automatizados

Guia rapido para rodar e entender a suite de testes do laboratorio com Bun + Vitest.

## Como rodar
- Order Service: `cd services/order-service && bun test`
- API Gateway: `cd services/api-gateway && bun test`
- Os scripts usam Vitest (`bun test` roda `vitest run`) e nao dependem de Docker ou Kafka.

## Order Service: SQLite in-memory com Prisma
- O schema Prisma fica em `services/order-service/prisma/schema.prisma` e o client e gerado via `bunx prisma generate`.
- Durante os testes o helper `tests/utils/prisma-test-client.ts` seta `DATABASE_URL=file:memdb1?mode=memory&cache=shared`, roda `bunx prisma db push --skip-generate` para criar o schema em memoria e limpa a tabela `Order` entre os casos.
- Se quiser persistir em arquivo local, exporte `DATABASE_URL=file:./dev.db` antes de rodar `bun test`.
- O repositorio `PrismaOrdersRepository` segue a interface `OrdersRepository`, permitindo trocar a implementacao por memoria ou Prisma conforme o ambiente.

## API Gateway
- Os testes sao totalmente unitarios: o `SubmitOrderUseCase` usa um producer Kafka mockado e o `OrdersController` e instanciado sem Nest (injeção manual de dependencias).
- Validacao de payload e feita via Zod no controller; o correlation id e reutilizado quando enviado no header ou gerado automaticamente.

## Notas gerais
- `vitest.config.ts` em cada servico define ambiente Node, variaveis de teste e inclui apenas os arquivos em `tests/**/*.test.ts`.
- Para manter o estado limpo, evite rodar `prisma db push` com `DATABASE_URL` apontando para um arquivo real se nao precisar persistir dados.
- Se editar o schema Prisma, rode `bun run prisma:generate` dentro do `order-service` antes dos testes.
