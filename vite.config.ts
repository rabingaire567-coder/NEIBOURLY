import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// GitHub Pages serves from a sub-path, so every asset URL must be relative.
// `200.html` / `404.html` are SPA entry copies generated after the build so
// that deep links survive a hard refresh on the static host.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    cssTarget: 'chrome111',
    assetsDir: 'assets',
    sourcemap: false,
    // The administrative dataset is the bulk of the bundle and never changes
    // between deploys, so it gets its own long-lived chunk instead of
    // invalidating the app chunk on every release.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          geo: ['@/data/nepal-geo'],
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Optional backend (npm run server) proxies Gemini so no key is needed in
      // the browser. Everything works without it - see README "AI setup".
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
  preview: { port: 4173 },
});