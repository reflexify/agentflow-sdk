import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [svelte()],
  build: {
    lib: { entry: { 'agentflow-elements': 'src/index.ts', kit: 'src/kit/index.ts' }, formats: ['es'], fileName: (_f, name) => `${name}.js` },
    target: 'es2022',
    emptyOutDir: true,
    rolldownOptions: { output: { chunkFileNames: 'chunks/[name]-[hash].js' } },
  },
  resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
  test: {
    environment: 'jsdom',
    include: ['test/**/*.test.ts'],
    env: { TZ: 'Asia/Ho_Chi_Minh' },
    setupFiles: ['test/kit/setup.ts'],
    css: { include: [/\/src\/kit\/kit\.css(?:$|\?)/] },
  },
});
