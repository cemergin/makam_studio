// master-bus topology verification.
//
// The CRITICAL guarantee: when reverb wet, delay wet, and reverb feedback
// are all maxed and we drive the bus with a steady tone, the output must
// NOT grow unboundedly (the pre-a329f7e topology had a feedback loop that
// did exactly that — almost blew the user's ears out).
//
// These tests rely on OfflineAudioContext. happy-dom doesn't polyfill it
// and Node 20 doesn't expose it, so the whole suite is gated behind
// `it.skipIf(!globalThis.OfflineAudioContext)` for now. Browser-mode
// Vitest tests will run these for real in v2.

import { describe, expect, it } from 'vitest';
import { createMasterBus } from '../master-bus';

const HAS_OAC = typeof globalThis.OfflineAudioContext !== 'undefined';

if (!HAS_OAC) {
  // eslint-disable-next-line no-console
  console.log(
    '[master-bus.test] OfflineAudioContext not available in this env — skipping engine-level tests. Run in browser-mode Vitest for full coverage.',
  );
}

interface RenderResult {
  peakAbs: number;
  rms: number;
}

async function renderAt(
  setup: (ctx: OfflineAudioContext) => void,
  durationSec = 1.0,
  sampleRate = 44_100,
): Promise<RenderResult> {
  // Cast: TS DOM lib expects (numChannels, length, sampleRate)
  const ctx = new OfflineAudioContext(1, Math.floor(durationSec * sampleRate), sampleRate);
  setup(ctx);
  const buf = await ctx.startRendering();
  const data = buf.getChannelData(0);
  let peak = 0;
  let sumSq = 0;
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
    sumSq += data[i] * data[i];
  }
  return { peakAbs: peak, rms: Math.sqrt(sumSq / data.length) };
}

describe('createMasterBus', () => {
  it.skipIf(!HAS_OAC)('returns the expected public shape', () => {
    const ctx = new OfflineAudioContext(1, 256, 44_100);
    const bus = createMasterBus(ctx as unknown as AudioContext);
    expect(bus.input).toBeDefined();
    expect(bus.effects.filter).toBeDefined();
    expect(bus.effects.overdrive).toBeDefined();
    expect(bus.effects.reverb).toBeDefined();
    expect(bus.effects.delay).toBeDefined();
    expect(typeof bus.setFxParam).toBe('function');
    expect(typeof bus.setFxBypass).toBe('function');
    expect(typeof bus.setRoutingMode).toBe('function');
    expect(typeof bus.setMasterVolume).toBe('function');
    expect(bus.analyser).toBeDefined();
    bus.dispose();
  });

  it.skipIf(!HAS_OAC)('does not produce unbounded output with reverb + delay both fully wet', async () => {
    // Drive a constant 0.5-amplitude sine through a master bus that has
    // both reverb and delay engaged at wet=1, with delay feedback high.
    // With the pre-a329f7e topology, returns mixed back into the send
    // input and the convolver's tail accumulated unbounded; with the
    // current topology, the brick-wall limiter pins the peak at most
    // a hair above the limiter threshold (~0.71 lin = -3 dBFS).
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

    // The brick-wall limiter sets threshold at -3 dBFS (~0.708 lin) with
    // 20:1 ratio. Some overshoot during attack is expected, but never
    // unbounded — assert peak well below 1.0 absolute.
    expect(result.peakAbs).toBeLessThan(1.0);
  });

  it.skipIf(!HAS_OAC)('series mode: delay output reaches the master', async () => {
    const result = await renderAt((ctx) => {
      const bus = createMasterBus(ctx as unknown as AudioContext);
      bus.setRoutingMode('series');
      bus.setFxBypass('filter', true);
      bus.setFxBypass('overdrive', true);
      bus.setFxBypass('reverb', false);
      bus.setFxBypass('delay', false);
      bus.setFxParam('reverb', 'wet', 1);
      bus.setFxParam('delay', 'wet', 1);
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
    // After the source stops at 0.5s, the delay+reverb tail must still
    // be audible if the series chain is live.
    expect(result.rms).toBeGreaterThan(0.001);
    expect(result.peakAbs).toBeLessThan(1.0);
  });

  it.skipIf(!HAS_OAC)('parallel mode: bypassing delay still lets reverb tap preFx', async () => {
    const result = await renderAt((ctx) => {
      const bus = createMasterBus(ctx as unknown as AudioContext);
      bus.setRoutingMode('parallel');
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
    expect(result.rms).toBeGreaterThan(0.001);
    expect(result.peakAbs).toBeLessThan(1.0);
  });

  it.skipIf(!HAS_OAC)('filter bypass + overdrive bypass routes signal through unchanged', async () => {
    // With both inserts bypassed and reverb/delay off, the master output
    // is a level-scaled passthrough. Dry signal should hit the master.
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
});
