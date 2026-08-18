import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaClient: PrismaClient | undefined;
};

function remoteConnection(connectionString: string) {
  try {
    const url = new URL(connectionString);
    url.searchParams.set("sslmode", "no-verify");
    return url.toString();
  } catch {
    const withoutMode = connectionString.replace(/[?&]sslmode=[^&]+/i, "");
    const join = withoutMode.includes("?") ? "&" : "?";
    return `${withoutMode}${join}sslmode=no-verify`;
  }
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const isLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  const adapter = new PrismaPg({
    connectionString: isLocal
      ? connectionString
      : remoteConnection(connectionString),
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
  });
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prismaClient ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaClient = prisma;
}

export default prisma;
