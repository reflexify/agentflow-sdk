import { defineConfig } from 'vitest/config';
import { useTempRoot } from '../../test-support/temp-root.ts';

useTempRoot();

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    env: { TZ: 'Asia/Ho_Chi_Minh' },
    include: ['test/**/*.test.ts'],
    globalSetup: ['../../test-support/temp-root.ts'],
  },
});
