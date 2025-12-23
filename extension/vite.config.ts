import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
    },
    // Chrome extension specific settings
    target: "esnext",
    minify: "esbuild",
    cssMinify: true,
  },
  // Ensure assets are relative for extension context
  base: "./",
});
