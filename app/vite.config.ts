// Adapted from ~/lab/musical-core/templates/vite.config.ts.template
// (originally forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2).
//
// makam_studio Vite config.
//   - Port 5176 (BeatForge owns 5174, musical-core playground owns 5175).
//   - GitHub Pages base path: '/makam_studio/'.
//   - PWA registerType: 'prompt' — v1 is alpha, no silent updates.
//   - Manifest lives in public/manifest.webmanifest; the plugin does not
//     inject one.

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2,webmanifest}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
      includeAssets: ['manifest.webmanifest'],
      devOptions: {
        enabled: false,
      },
    }),
  ],
  base: command === 'build' ? '/makam_studio/' : '/',
  server: {
    port: 5176,
    host: true,
    strictPort: true,
  },
  optimizeDeps: {
    include: ['dexie'],
  },
}));
