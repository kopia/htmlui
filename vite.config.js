import { defineConfig } from "vite";
import { coverageConfigDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

export default defineConfig(() => {
  return {
    build: {
      outDir: "build",
      chunkSizeWarningLimit: 1000,
    },
    plugins: [react(), eslint()],
    test: {
      globals: true,
      environment: "jsdom",
      coverage: {
        exclude: [
          "**/build/**",
          "src/setupProxy.js",
          ...coverageConfigDefaults.exclude,
        ],
      },
    },
    server: {
      port: 3000,
      host: "localhost",
      https: false,
      strictPort: true,
      open: true,
      proxy: {
        "/api": {
          target: "http://localhost:51515",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
