import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { supportDeskDevServer } from './server/vite-plugin.js';

export default defineConfig({
  plugins: [react(), supportDeskDevServer()],
  server: { port: 5174, strictPort: true, host: 'localhost' },
});
