import { defineConfig } from "vite";
import { resolve } from "path";

// https://vitejs.dev/config/
/// <reference types="vitest" />
export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "./src")
        }
    },
    define: { "process.env": {} },
    build: {
        target: "esnext", //esnext/modules
        lib: {
            entry: {
                index: resolve(__dirname, "src/index.ts"),
                axios: resolve(__dirname, "src/axios.ts")
            },
            fileName: (format, entryName) =>
                format === "es" ? `${entryName}.js` : `${entryName}.${format}`,
            formats: ["es", "cjs"]
        },
        rollupOptions: {
            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ["axios", "vue"],
            output: {
                //format: 'esm',
                // Provide global variables to use in the UMD build
                // for externalized deps
            }
        }
    },
    test: {
        globals: true,
        environment: "jsdom"
    }
});
