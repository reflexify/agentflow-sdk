import { defineConfig } from 'vitest/config';

export default defineConfig({ test: { include: ['e2e/**/*.sandbox.test.ts'], environment: 'node', testTimeout: 300_000 } });
