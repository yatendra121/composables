/// <reference types="vitest" />

import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src")
        }
    },
    plugins: [
        dts({
            tsconfigPath: "./tsconfig.json",
            include: ["src/**/*.ts"],
            compilerOptions: { noEmit: false, declaration: true },
            bundleTypes: true
        })
    ],
    define: { "process.env": {} },
    build: {
        target: "esnext",
        lib: {
            entry: {
                index: resolve(__dirname, "src/index.ts"),
                axios: resolve(__dirname, "src/axios.ts")
            },
            fileName: (format, entryName) =>
                format === "es" ? `${entryName}.js` : `${entryName}.${format}`,
            formats: ["es", "cjs"]
        },
        rolldownOptions: {
            external: ["axios", "vue", "@qnx/composables"]
        }
    },
    test: {
        globals: true,
        environment: "jsdom"
    }
});
