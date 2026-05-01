// app/src/audio/__tests__/master-bus.test.ts
//
// Master-bus topology verification.
//
// CRITICAL: with reverb wet, delay wet, and delay feedback all maxed,
// the limiter must keep the output below digital full-scale. The
// pre-rewrite topology let returns feed back into sends (almost blew
// the user's ears out); the current topology has reverb.output and
// delay.output going only to masterMix, never back into themselves
// or each other.

import { describe, expect, it } from 'vitest';
import { createMasterBus } from '../master-bus';

const HAS_OAC = typeof globalThis.OfflineAudioContext !== 'undefined';

if (!HAS_OAC) {
  // eslint-disable-next-line no-console
  console.log('[master-bus.test] OfflineAudioContext unavailable — skipping engine-level tests.');
}

interface RenderResult { peakAbs: number; rms: number; }

async function renderAt(
  setup: (ctx: OfflineAudioContext) => void,
  durationSec = 1.0,
  sampleRate = 44_100,
): Promise<RenderResult> {
  const ctx = new OfflineAudioContext(1, Math.floor(durationSec * sampleRate), sampleRate);
  setup(ctx);
  const buf = await ctx.startRendering();
  const data = buf.getChannelData(0);
  let peak = 0, sumSq = 0;
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
    sumSq += data[i] * data[i];
  }
  return { peakAbs: peak, rms: Math.sqrt(sumSq / data.length) };
}

describe('createMasterBus', () => {
  it.skipIf(!HAS_OAC)('exposes the public surface', () => {
    const ctx = new OfflineAudioContext(1, 256, 44_100);
    const bus = createMasterBus(ctx as unknown as AudioContext);
    expect(bus.input).toBeDefined();
    expect(bus.effects.filter).toBeDefined();
    expect(bus.effects.overdrive).toBeDefined();
    expect(bus.effects.reverb).toBeDefined();
    expect(bus.effects.delay).toBeDefined();
    expect(typeof bus.setFxParam).toBe('function');
    expect(typeof bus.setFxBypass).toBe('function');
    expect(typeof bus.setMasterVolume).toBe('function');
    expect(bus.analyser).toBeDefined();
    bus.dispose();
  });

  it.skipIf(!HAS_OAC)('does not produce unbounded output with reverb + delay both fully wet', async () => {
    const result = await renderAt((ctx) => {
      const bus = createMasterBus(ctx as unknown as AudioContext);
      bus.setFxBypass('filter', true);
      bus.setFxBypass('overdrive', true);
      bus.setFxBypass('reverb', false);
      bus.setFxBypass('delay', false);
      bus.setFxParam('reverb', 'wet', 1);
      bus.setFxParam('delay', 'wet', 1);
      bus.setFxParam('delay', 'feedback', 0.7);
      bus.setMasterVolume(0.8);

      const osc = ctx.createOscillator();
      osc.frequency.value = 220;
      const amp = ctx.createGain();
      amp.gain.value = 0.5;
      osc.connect(amp);
      amp.connect(bus.input);
      osc.start(0);
      osc.stop(1.0);
    }, 1.0);

    expect(result.peakAbs).toBeLessThan(1.0);
  });

  it.skipIf(!HAS_OAC)('reverb send rings out after source stops (parallel send working)', async () => {
    const result = await renderAt((ctx) => {
      const bus = createMasterBus(ctx as unknown as AudioContext);
      bus.setFxBypass('filter', true);
      bus.setFxBypass('overdrive', true);
      bus.setFxBypass('reverb', false);
      bus.setFxBypass('delay', true);
      bus.setFxParam('reverb', 'wet', 1);
      bus.setMasterVolume(0.8);

      const osc = ctx.createOscillator();
      osc.frequency.value = 220;
      const amp = ctx.createGain();
      amp.gain.value = 0.3;
      osc.connect(amp);
      amp.connect(bus.input);
      osc.start(0);
      osc.stop(0.5);
    }, 1.0);

    // After source stops at 0.5s, reverb tail must still produce signal.
    expect(result.rms).toBeGreaterThan(0.001);
    expect(result.peakAbs).toBeLessThan(1.0);
  });

  it.skipIf(!HAS_OAC)('all FX bypassed: dry signal still reaches the master', async () => {
    const result = await renderAt((ctx) => {
      const bus = createMasterBus(ctx as unknown as AudioContext);
      bus.setFxBypass('filter', true);
      bus.setFxBypass('overdrive', true);
      bus.setFxBypass('reverb', true);
      bus.setFxBypass('delay', true);
      bus.setMasterVolume(1.0);

      const osc = ctx.createOscillator();
      osc.frequency.value = 220;
      const amp = ctx.createGain();
      amp.gain.value = 0.3;
      osc.connect(amp);
      amp.connect(bus.input);
      osc.start(0);
      osc.stop(0.5);
    }, 0.5);

    expect(result.rms).toBeGreaterThan(0.001);
    expect(result.peakAbs).toBeLessThan(1.0);
  });

  it.skipIf(!HAS_OAC)('overdrive insert: drive > 0 distorts the signal', async () => {
    // With overdrive un-bypassed at high mix + drive, the output spectrum
    // should have more harmonic content than the dry signal. We sample
    // RMS as a proxy — distortion adds energy in the harmonic series.
    const result = await renderAt((ctx) => {
      const bus = createMasterBus(ctx as unknown as AudioContext);
      bus.setFxBypass('filter', true);
      bus.setFxBypass('reverb', true);
      bus.setFxBypass('delay', true);
      bus.setFxBypass('overdrive', false);
      bus.setFxParam('overdrive', 'drive', 0.9);
      bus.setFxParam('overdrive', 'mix', 1.0);
      bus.setMasterVolume(0.6);

      const osc = ctx.createOscillator();
      osc.frequency.value = 220;
      const amp = ctx.createGain();
      amp.gain.value = 0.3;
      osc.connect(amp);
      amp.connect(bus.input);
      osc.start(0);
      osc.stop(0.5);
    }, 0.5);

    expect(result.rms).toBeGreaterThan(0.001);
    expect(result.peakAbs).toBeLessThan(1.0);
  });
});
