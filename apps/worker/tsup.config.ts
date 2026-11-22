import { defineConfig } from "tsup";

// Bundle everything (including workspace packages) into self-contained files
// so the container image needs no node_modules.
export default defineConfig({
  entry: ["src/index.ts", "src/migrate.ts"],
  format: ["esm"],
  platform: "node",
  target: "node22",
  noExternal: [/.*/],
  external: ["pg-native"],
  banner: {
    // Some bundled CommonJS dependencies call require(); provide it in ESM output.
    js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
  },
  clean: true,
  sourcemap: true,
});
