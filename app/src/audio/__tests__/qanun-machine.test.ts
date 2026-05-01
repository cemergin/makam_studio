// Smoke test for the qanun machine. Pluck a 220Hz string for 200ms in
// an OfflineAudioContext, verify the output is non-silent, peak ≤ 1.0,
// and the spectral peak sits near 220Hz.
//
// Skips gracefully when OfflineAudioContext isn't available (Node 20,
// happy-dom). Browser-mode Vitest will run this for real in v2.

import { describe, expect, it } from 'vitest';
import { triggerQanun } from '../qanun-machine';

const HAS_OAC = typeof globalThis.OfflineAudioContext !== 'undefined';

if (!HAS_OAC) {
  // eslint-disable-next-line no-console
  console.log('[qanun-machine.test] OfflineAudioContext not available — skipping engine-level tests.');
}

describe('triggerQanun', () => {
  it.skipIf(!HAS_OAC)('produces a non-silent, non-clipping signal at the target pitch', async () => {
    const sampleRate = 44_100;
    const duration = 0.2; // 200ms
    const ctx = new OfflineAudioContext(1, Math.floor(duration * sampleRate), sampleRate);
    triggerQanun({
      audioContext: ctx as unknown as AudioContext,
      destination: ctx.destination,
      frequencyHz: 220,
      velocity: 1.0,
      brightness: 0.7,
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
    expect(rms).toBeGreaterThan(0.001);
    expect(peak).toBeLessThanOrEqual(1.0);

    // Crude DFT — sweep candidate frequencies and find the peak. We
    // expect it within ±50Hz of 220Hz given the K-S excitation noise +
    // integer-sample period rounding.
    const N = data.length;
    let bestFreq = 0;
    let bestMag = 0;
    for (let f = 80; f <= 800; f += 2) {
      let re = 0;
      let im = 0;
      const w = (2 * Math.PI * f) / sampleRate;
      for (let i = 0; i < N; i++) {
        re += data[i] * Math.cos(w * i);
        im -= data[i] * Math.sin(w * i);
      }
      const mag = Math.sqrt(re * re + im * im);
      if (mag > bestMag) {
        bestMag = mag;
        bestFreq = f;
      }
    }
    expect(Math.abs(bestFreq - 220)).toBeLessThan(50);
  });
});
