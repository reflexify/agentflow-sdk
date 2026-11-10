import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The UI module for the package's ui/: one ES entry exporting `mount`, its chunks beside it, the stylesheet inside
// the script and the elements bundled, since a host shares nothing with a module but plain data and functions.
// `agentflow-app build` writes it into package/ui/.
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  // Library mode leaves process.env.NODE_ENV for a consumer's bundler to replace; a browser importing the file has no `process`.
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'package/ui',
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
