import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Proxies /api and /uploads to the backend during local dev so the
// frontend can simply call relative paths like "/api/recipes" without
// hardcoding a port, and without running into CORS in the browser.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:5000', changeOrigin: true },
      '/uploads': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },
});
