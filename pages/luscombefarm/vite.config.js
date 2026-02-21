import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
    watch: {
      usePolling: true,
      interval: 120
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true
  }
});
