import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
    root: resolve(__dirname, "pages/diggers4u"),
    publicDir: false,
    build: {
        outDir: resolve(__dirname, "dist/diggers4u"),
        emptyOutDir: true,
        target: "es2022",
        rollupOptions: {
            input: {
                main: resolve(__dirname, "pages/diggers4u/index.html"),
            },
        },
    },
});
