import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => ({
  plugins: [tailwindcss()],
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
