import { defineConfig } from "vite";
import { resolve } from "path";
//import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  define: { "process.env": {} },
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        axios: resolve(__dirname, "src/axios.ts"),
      },
      // name: "vq-vuetify",
      fileName: (format, entryName) => `${entryName}.js`,
      formats: ["es"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ["axios", "vue"],
      output: {
        //format: 'esm',
        // Provide global variables to use in the UMD build
        // for externalized deps
      },
    },
  },
  //@ts-ignore
  test: {
    /* for example, use global to avoid globals imports (describe, test, expect): */
    globals: true,
  },
  /* remove the need to specify .vue files https://vitejs.dev/config/#resolve-extensions
  resolve: {
    extensions: [
      '.js',
      '.json',
      '.jsx',
      '.mjs',
      '.ts',
      '.tsx',
      '.vue',
    ]
  },
  */
});
