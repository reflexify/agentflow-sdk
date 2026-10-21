import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// The Projects module, for a package's ui/: one ES entry exporting `mount`, its chunks beside it, the stylesheet
// inside the script and React bundled, since a host shares nothing with a module but plain data and functions.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react()],
  // Library mode leaves process.env.NODE_ENV for a consumer's bundler to replace; a browser importing the file has no `process`.
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    // Not under dist/: the page build empties that directory each time it runs.
    outDir: 'ui-dist',
    emptyOutDir: true,
    copyPublicDir: false,
    lib: {
      entry: fileURLToPath(new URL('./src/module.ts', import.meta.url)),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rolldownOptions: { output: { chunkFileNames: 'chunks/[name]-[hash].js' } },
  },
});
