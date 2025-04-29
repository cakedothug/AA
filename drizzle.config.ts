
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./shared/schema.ts",
  driver: "mysql2",
  dialect: "mysql",
  dbCredentials: {
    host: "0.0.0.0",
    user: "root",
    password: "123123",
    database: "thuglife",
    port: 3306
  },
  out: "./drizzle"
});
