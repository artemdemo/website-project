import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/exports/types.ts'],
  splitting: true,
  format: ['esm'],
  target: 'es2020',
  dts: true,
  sourcemap: true,
  clean: true,
  injectStyle: true,
});
