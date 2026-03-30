import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@kyoutsu/shared": new URL("../../packages/shared/src", import.meta.url).pathname,
    },
  },
});
