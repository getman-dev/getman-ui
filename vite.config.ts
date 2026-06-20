import {defineConfig} from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(({mode}) => ({
    plugins: [tailwindcss(), react()],
    build: {
        sourcemap: true,
        ...(mode === "lib" && {
            lib: {
                entry: "src/loader.ts",
                name: "GetMan",
                fileName: "getman-ui",
                formats: ["iife"],
            },
            rollupOptions: {
                output: {
                    entryFileNames: "getman-ui.js",
                },
            },
        }),
    },
    ...(mode === "lib" && {
        define: {
            "process.env.NODE_ENV": '"production"',
        },
    }),
}));
