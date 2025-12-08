import { PrismaClient } from "@prisma/client";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..", "..", "..");

export async function createTestPrismaClient() {
  const databaseUrl =
    process.env.DATABASE_URL ?? "file:memdb1?mode=memory&cache=shared";
  process.env.DATABASE_URL = databaseUrl;

  execSync("bunx prisma db push --skip-generate", {
    cwd: projectRoot,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });

  const prisma = new PrismaClient();
  await prisma.$connect();
  await prisma.order.deleteMany();
  return prisma;
}

export async function resetDatabase(prisma: PrismaClient | undefined) {
  if (!prisma) {
    return;
  }

  await prisma.order.deleteMany();
}

export async function disconnectPrisma(prisma: PrismaClient | undefined) {
  if (!prisma) {
    return;
  }

  await prisma.$disconnect();
}
