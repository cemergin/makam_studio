// Smoke test for every registered voice. Trigger a 440Hz note in an
// OfflineAudioContext, render 100ms, verify non-silent and non-clipping.
//
// Skips when OfflineAudioContext is unavailable.

import { describe, expect, it } from 'vitest';
import { triggerVoice, VOICES } from '../voices';

const HAS_OAC = typeof globalThis.OfflineAudioContext !== 'undefined';

if (!HAS_OAC) {
  // eslint-disable-next-line no-console
  console.log('[voices.test] OfflineAudioContext not available — skipping engine-level tests.');
}

describe('triggerVoice — every registered voice', () => {
  for (const v of VOICES) {
    it.skipIf(!HAS_OAC)(`${v.id}: produces non-silent, non-clipping output`, async () => {
      const sampleRate = 44_100;
      // 100ms is too short for the dream-pad's 2s attack to reach
      // appreciable level — give pads more headroom (300ms still under
      // their attack but enough to register some signal).
      const duration = v.id === 'dream-pad' ? 0.3 : 0.1;
      const ctx = new OfflineAudioContext(1, Math.floor(duration * sampleRate), sampleRate);

      triggerVoice(v.id, {
        audioContext: ctx as unknown as AudioContext,
        destination: ctx.destination,
        frequencyHz: 440,
        velocity: 1.0,
        brightness: 0.6,
        decay: 0.7,
        body: 0.3,
      });
      const buf = await ctx.startRendering();
      const data = buf.getChannelData(0);

      let peak = 0;
      let sumSq = 0;
      for (let i = 0; i < data.length; i++) {
        const a = Math.abs(data[i]);
        if (a > peak) peak = a;
        sumSq += data[i] * data[i];
      }
      const rms = Math.sqrt(sumSq / data.length);
      expect(rms, `voice ${v.id} rms`).toBeGreaterThan(0.0001);
      expect(peak, `voice ${v.id} peak`).toBeLessThanOrEqual(1.0);
    });
  }
});
