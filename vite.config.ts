import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({ mode }) => ({
  plugins: [tailwindcss(), svelte()],
  ...(mode === "lib" && {
    build: {
      lib: {
        entry: "src/loader.ts",
        name: "ApiExplorer",
        fileName: "loader",
        formats: ["iife"],
      },
      rollupOptions: {
        output: {
          entryFileNames: "[name].js",
        },
      },
    },
  }),
}));
