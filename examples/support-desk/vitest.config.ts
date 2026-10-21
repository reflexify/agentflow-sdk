import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  // Node by default; a test that needs a DOM says so with a `// @vitest-environment jsdom` first line.
  test: {
    include: ['test/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    environment: 'node',
    // Generous for the same loaded runner: a long multi-step test there outlasts the 5-second default.
    testTimeout: 20_000,
    // Vitest runs without globals, so Testing Library can't register its own cleanup between tests.
    setupFiles: ['test/support/setup.ts'],
    // The desk injects its stylesheet itself (`desk.css?inline`), and Vitest turns CSS into nothing unless told.
    css: { include: [/\/src\/styles\/desk\.css(?:$|\?)/] },
  },
});
