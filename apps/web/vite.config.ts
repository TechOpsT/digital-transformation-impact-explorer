import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  preview: {
    host: "0.0.0.0",
    port: 4173,
    proxy: {
      "/api/content": { target: process.env.CONTENT_PROXY_TARGET ?? "http://localhost:8001", rewrite: (path) => path.replace(/^\/api\/content/, "/api/v1") },
      "/api/assessments": { target: process.env.ASSESSMENT_PROXY_TARGET ?? "http://localhost:8002", rewrite: (path) => path.replace(/^\/api\/assessments/, "/api/v1/assessments") }
    }
  },
  server: {
    port: 5173,
    proxy: {
      "/api/content": { target: "http://localhost:8001", rewrite: (path) => path.replace(/^\/api\/content/, "/api/v1") },
      "/api/assessments": { target: "http://localhost:8002", rewrite: (path) => path.replace(/^\/api\/assessments/, "/api/v1/assessments") }
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true
  }
});
