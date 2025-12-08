import { Module } from "@nestjs/common";

// Placeholder para futura persistencia (ex.: PostgreSQL/Redis).
// Mantem padrao consistente entre servicos e facilita evolucao.
@Module({
  providers: [],
  exports: [],
})
export class DatabaseModule {}
