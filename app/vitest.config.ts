import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// Pure-function / schema-level test harness for makam_studio.
// happy-dom covers incidental browser globals; OfflineAudioContext is
// NOT polyfilled — engine-level audio tests gate themselves with
// `it.skipIf(!globalThis.OfflineAudioContext)` and skip cleanly here.
// The "real" engine tests will run in Vitest browser mode (v2).
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
});
