import { defineConfig } from 'vitest/config';
import { useTempRoot } from '../../test-support/temp-root.ts';

useTempRoot();

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['test/**/*.test.ts'],
    globalSetup: ['../../test-support/temp-root.ts', './test/copy-starter-setup.ts'],
  },
});
