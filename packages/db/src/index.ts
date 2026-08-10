import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient(): PrismaClient {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getClient(): PrismaClient {
  globalForPrisma.prisma ??= createClient();
  return globalForPrisma.prisma;
}

/**
 * Lazily-initialized singleton: the client (and its pg pool) is created on the
 * first query, so it also works in Cloudflare Workers where env bindings are
 * copied into process.env before the first request runs.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop, receiver) {
    const value = Reflect.get(getClient(), prop, receiver);
    return typeof value === "function" ? value.bind(getClient()) : value;
  },
  set(target, prop, value) {
    Reflect.set(getClient(), prop, value);
    return true;
  },
});

export * from "@prisma/client";
