import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/components/**/*.tsx', 'src/utils/**/*.ts', 'src/hooks/**/*.ts'],
      exclude: ['**/*.stories.tsx', '**/*.test.tsx', '**/*.test.ts', '**/index.ts', '**/*.types.ts'],
    },
  },
});
