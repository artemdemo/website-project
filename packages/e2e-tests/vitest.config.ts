import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['**/*.{test,spec}.ts?(x)'],
    environment: 'node',
    exclude: ['build', 'node_modules', 'dist', '.turbo'],
    maxConcurrency: 7,
  },
});
