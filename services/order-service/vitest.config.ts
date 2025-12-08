import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.spec.ts"],
    env: {
      DATABASE_URL: "file:memdb1?mode=memory&cache=shared",
      NODE_ENV: "test",
    },
  },
});
