import path from "node:path";
import { defineConfig } from "prisma/config";
import { loadEnvConfig } from "@next/env";

// Prisma CLI doesn't load .env.local automatically — Next.js does, but the
// CLI runs outside Next.js. This ensures DATABASE_URL / DIRECT_URL are set.
loadEnvConfig(process.cwd());

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx ./prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
