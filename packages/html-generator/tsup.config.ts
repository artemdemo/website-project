import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  splitting: true,
  format: ['esm'],
  target: 'es2020',
  external: ['os', 'path'],
  dts: true,
  sourcemap: true,
  clean: true,
});
