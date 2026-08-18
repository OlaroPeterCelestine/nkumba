import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import pg from "pg";

const globalForPrisma = globalThis as unknown as {
  prismaClient?: PrismaClient;
  prismaPool?: pg.Pool;
};

function withoutSslMode(connectionString: string) {
  try {
    const url = new URL(connectionString);
    url.searchParams.delete("sslmode");
    return url.toString();
  } catch {
    return connectionString.replace(/[?&]sslmode=[^&]+/i, "");
  }
}

function isLocalDatabase(connectionString: string) {
  return (
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1")
  );
}

export function isDatabaseConnectionError(error: unknown) {
  const codes = new Set<string>();
  let current: unknown = error;

  for (let i = 0; i < 5 && current && typeof current === "object"; i += 1) {
    if ("code" in current && typeof current.code === "string") {
      codes.add(current.code);
    }

    if ("message" in current && typeof current.message === "string") {
      const message = current.message.toLowerCase();
      if (
        message.includes("tls") ||
        message.includes("ssl") ||
        message.includes("self-signed") ||
        message.includes("certificate")
      ) {
        return true;
      }
    }

    current = "cause" in current ? current.cause : undefined;
  }

  return (
    codes.has("P1011") ||
    codes.has("P1001") ||
    codes.has("ECONNRESET") ||
    codes.has("ETIMEDOUT")
  );
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const local = isLocalDatabase(connectionString);
  const pool = new pg.Pool({
    connectionString: local ? connectionString : withoutSslMode(connectionString),
    ssl: local ? undefined : { rejectUnauthorized: false },
    max: 1,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

  globalForPrisma.prismaPool = pool;
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

export function getPrisma() {
  globalForPrisma.prismaClient ??= createPrismaClient();
  return globalForPrisma.prismaClient;
}

export async function resetPrisma() {
  const pool = globalForPrisma.prismaPool;
  globalForPrisma.prismaClient = undefined;
  globalForPrisma.prismaPool = undefined;

  if (pool) {
    try {
      await pool.end();
    } catch {
      // The next request creates a fresh pool.
    }
  }
}

const prisma = getPrisma();

export default prisma;
