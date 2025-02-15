import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/*.{test,spec}.ts'],
    environment: 'node',
    exclude: ['build', 'node_modules', 'dist', '.turbo'],
    maxConcurrency: 7,
    // Setup could take some time, so I'm increasing default timeout
    testTimeout: 10000,
  },
});
