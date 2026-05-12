import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/**/*.spec.{ts,tsx}',
        'src/test/**',
        'src/vite-env.d.ts',
        'src/**/__test__/**',
      ],
    },
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: [
      'src/components/board/__test__/**/*.test.{ts,tsx}',
      'src/stores/**/*.test.{ts,tsx}',
      'src/features/**/__tests__/**/*.test.{ts,tsx}',
    ],
    css: {
      modules: {
        classNameStrategy: 'non-scoped',
      },
    },
  },
});