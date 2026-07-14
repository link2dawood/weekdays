import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  build: {
    // Modern browsers only -> less transpilation, smaller output.
    // Minification is on by default (oxc) in Vite 8 / rolldown.
    target: "es2020",
    reportCompressedSize: false,
    chunkSizeWarningLimit: 900,
    // Split framework code into stable, long-cacheable vendor chunks.
    // Skipped for the SSR build (prerendering), which is a single bundle.
    rollupOptions: isSsrBuild
      ? {}
      : {
          output: {
            // rolldown (Vite 8) requires the function form of manualChunks.
            manualChunks(id) {
              if (!id.includes("node_modules")) return;
              if (id.includes("react-router")) return "router";
              if (
                id.includes("/react-dom/") ||
                id.includes("/react/") ||
                id.includes("/scheduler/")
              ) {
                return "react";
              }
              return "vendor";
            },
          },
        },
  },
}));
