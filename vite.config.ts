/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["src/domain/**", "src/data/**"],
      exclude: [
        // Type-only file: no executable code to cover.
        "src/domain/types.ts",
        // Test files and fixtures are not production code.
        "**/*.test.{ts,tsx}",
        "**/__fixtures__/**",
      ],
    },
  },
});
