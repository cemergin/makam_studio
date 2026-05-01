// Smoke test for LFO modulation. Drive each sustained machine with a
// 4 Hz LFO routed to amp at depth=1; render 1s; the RMS computed in
// 100ms windows must vary across the second (tremolo creates a
// time-varying envelope). If the LFO is dangling, RMS is constant.

import { describe, expect, it } from 'vitest';
import { triggerMachineSustained, MACHINES, type LfoConfig } from '../index';

const HAS_OAC = typeof globalThis.OfflineAudioContext !== 'undefined';
const TREMOLO_LFO: LfoConfig = { rate: 4, shape: 'sine', depth: 1, destination: 'amp' };

function rmsWindows(data: Float32Array, windowMs: number, sampleRate: number): number[] {
  const n = Math.floor((windowMs / 1000) * sampleRate);
  const out: number[] = [];
  for (let i = 0; i + n <= data.length; i += n) {
    let sumSq = 0;
    for (let j = 0; j < n; j++) sumSq += data[i + j] * data[i + j];
    out.push(Math.sqrt(sumSq / n));
  }
  return out;
}

describe('LFO routing — amp destination causes tremolo', () => {
  for (const m of MACHINES) {
    it.skipIf(!HAS_OAC)(`${m.id}: amp LFO produces time-varying RMS`, async () => {
      const sampleRate = 44_100;
      const ctx = new OfflineAudioContext(1, sampleRate, sampleRate);
      const handle = triggerMachineSustained(m.id, {
        audioContext: ctx as unknown as AudioContext,
        destination: ctx.destination,
        frequencyHz: 440,
        velocity: 1.0,
        brightness: 0.6,
        body: 0.3,
        adsr: { a: 0.005, d: 0.05, s: 0.9, r: 0.2 },
        lfo1: TREMOLO_LFO,
      });
      const buf = await ctx.startRendering();
      handle.release();
      const data = buf.getChannelData(0);
      const windows = rmsWindows(data, 100, sampleRate);
      const min = Math.min(...windows);
      const max = Math.max(...windows);
      // 4 Hz tremolo at depth 1 should make windowed RMS vary by at least 20%.
      expect(max - min, `${m.id} tremolo range`).toBeGreaterThan(min * 0.2);
    });
  }
});
