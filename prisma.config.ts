import path from "node:path";
import { defineConfig } from "prisma/config";

// Load .env only in local dev (Vercel injects env vars directly)
if (process.env.NODE_ENV !== "production") {
  const { config } = await import("dotenv");
  config({ path: path.join(process.cwd(), ".env") });
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
