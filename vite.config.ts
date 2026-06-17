import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

const resolve = (p: string) => path.resolve(__dirname, p);

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      "@": resolve("src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: {
      entry: resolve("src/index.ts"),
      formats: ["es"],
      fileName: () => "index.js",
    },
    rollupOptions: {
      external: ["siyuan"],
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === "style.css") return "index.css";
          return assetInfo.name ?? "assets/[name].[ext]";
        },
      },
    },
    cssCodeSplit: false,
    minify: true,
    sourcemap: false,
  },
  server: {
    port: 6699,
  },
});
