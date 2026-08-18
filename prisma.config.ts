import "dotenv/config";
import { defineConfig } from "prisma/config";

// `prisma generate` loads this file and does not connect to the database.
// Use a placeholder so install/build can run when DATABASE_URL is not injected yet
// (Vercel postinstall). Runtime still requires a real DATABASE_URL.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/postgres",
  },
});
