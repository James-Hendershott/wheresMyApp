import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // WHY: Use jsdom for DOM testing (React components)
    environment: "jsdom",
    // WHY: Setup file for test utilities
    setupFiles: ["./src/test/setup.ts"],
    // WHY: Include src files in coverage
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/test/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
