import { defineConfig } from 'vite';

// `dist/chat.js`: one classic script a site loads with a plain `<script src async>`, so nothing in it may import.
export default defineConfig({
  build: {
    lib: { entry: 'src/chat/index.ts', formats: ['iife'], name: 'AgentFlowChat', fileName: () => 'chat.js' },
    target: 'es2022',
    emptyOutDir: false,
    rolldownOptions: { output: { codeSplitting: false } },
  },
});
