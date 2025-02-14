import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts'],
    environment: 'node',
    exclude: ['build', 'node_modules', 'dist', '.turbo'],
    maxConcurrency: 7,
  },
});
