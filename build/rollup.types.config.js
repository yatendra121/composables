import dts from "rollup-plugin-dts";
import fg from "fast-glob";
import mm from "micromatch";

const externalsPlugin = () => ({
  resolveId(source, importer) {
    if (importer && (source.endsWith(".sass") || source.endsWith(".scss"))) {
      return {
        id: source,
        external: true,
        moduleSideEffects: false,
      };
    }
  },
});

function createTypesConfig(input, output, renderChunk, filter) {
  input = "temp-types/" + input;
  let files = fg.sync(input);

  if (filter) files = filter(files);
  console.log({ files, input, output, renderChunk, filter });

  return files.map((file) => {
    const outputFile = output.replace("*", mm.capture(input, file)[0]);
    return {
      input: file,
      output: [{ file: outputFile, format: "es" }],
      plugins: [
        dts(),
        externalsPlugin(),

        {
          async renderChunk(code) {
            if (renderChunk) code = await renderChunk(code);
            return code.replaceAll(/import([^;])*?from 'vue-router'/gm, "// @ts-ignore\n$&");
          },
        },
      ],
    };
  });
}

export default [
  createTypesConfig("index.d.ts", "dist/index.d.ts", async (code) => {
    return code;
  }),
  createTypesConfig("axios.d.ts", "dist/axios.d.ts"),
].flat();
