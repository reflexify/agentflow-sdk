import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { useTempRoot } from '../../test-support/temp-root.ts';

if (process.env.VITEST) useTempRoot();

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: { entry: { 'agentflow-elements': 'src/index.ts', kit: 'src/kit/index.ts', escape: 'src/kit/escape.ts' }, formats: ['es'], fileName: (_f, name) => `${name}.js` },
    target: 'es2022',
    emptyOutDir: true,
    rolldownOptions: { output: { chunkFileNames: 'chunks/[name]-[hash].js' } },
  },
  // The gallery (`pnpm gallery`): `playwright.config.ts` reads the same variable. `strictPort` refuses to start on a neighbour's port, so the tests
  // never talk to another server.
  server: { port: Number(process.env.KIT_GALLERY_PORT) || 5182, strictPort: true },
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
    env: { TZ: 'Asia/Ho_Chi_Minh' },
    setupFiles: ['test/kit/setup.ts'],
    globalSetup: ['../../test-support/temp-root.ts'],
    css: { include: [/\/src\/kit\/kit\.css(?:$|\?)/] },
  },
});
