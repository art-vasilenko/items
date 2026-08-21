import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const rootDirectory = path.dirname(fileURLToPath(import.meta.url));
const githubPagesBasePath = "/items/";

export default defineConfig(({ mode }) => ({
  base: mode === "production" ? githubPagesBasePath : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(rootDirectory, "./src"),
    },
  },
}));
