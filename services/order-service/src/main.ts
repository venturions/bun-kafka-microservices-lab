import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  await app.listen({
    port: Number(process.env.PORT ?? 3002),
    host: "0.0.0.0",
  });

  console.log(`Order Service rodando em ${await app.getUrl()}`);
}

bootstrap();
