import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { projectsDevServer } from './server/vite-plugin.js';

export default defineConfig({
  plugins: [react(), projectsDevServer()],
  server: { port: 5175, strictPort: true, host: 'localhost' },
});
