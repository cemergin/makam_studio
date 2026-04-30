// Synthwave Saw — supersaw lead with bite.
//
// Reference flavor: Carpenter Brut, Kavinsky. The bite comes from the
// soft-clip stage post-filter — the lowpass picks the harmonic content,
// the tanh wave-shaper bends the peaks for that "compressed-into-tape"
// character, then the AD envelope shapes the contour.
//
// Topology:
//   3 saw oscillators (target freq ±3¢, ±0¢, -3¢) summed →
//      AD env (3ms attack, 1.2s decay) →
//      biquad lowpass (cutoff = 2×freq + brightness × 6kHz, Q 1.5) →
//      soft-clip via tanhCurve (sharpness 5) →
//      output gain (peak v × 0.18)
//
// The detune of just ±3¢ (not the broad ±15¢ of trance supersaws) gives
// the tighter, more punchy character of synthwave — closer to a pulse
// width than a chord.

import { tanhCurve } from '../../_core/audio';

export interface SynthwaveSawTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  frequencyHz: number;
  velocity?: number;
  time?: number;
  brightness?: number;
  decay?: number;
  body?: number; // unused for synthwave-saw
}

export function triggerSynthwaveSaw(t: SynthwaveSawTrigger): void {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const brightness = Math.max(0, Math.min(1, t.brightness ?? 0.6));
  const decay = Math.max(0, Math.min(1, t.decay ?? 0.7));
  const f = Math.max(20, t.frequencyHz);

  const envDecay = 0.6 + decay * 1.4; // 0.6s..2.0s
  const stopAt = when + envDecay + 0.2;

  // ---- 3 saws at -3¢, 0¢, +3¢ ------------------------------------------
  const detunes = [-3, 0, 3];
  const oscs: OscillatorNode[] = [];
  const sumGain = ctx.createGain();
  sumGain.gain.value = 1 / 3;

  for (const cents of detunes) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = f;
    osc.detune.value = cents;
    osc.connect(sumGain);
    osc.start(when);
    osc.stop(stopAt);
    oscs.push(osc);
  }

  // ---- AD envelope (3ms attack, decay scales with `decay`) -------------
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.linearRampToValueAtTime(1.0, when + 0.003);
  env.gain.exponentialRampToValueAtTime(0.0001, when + envDecay);
  sumGain.connect(env);

  // ---- Lowpass (cutoff = 2×freq + brightness × 6kHz) -------------------
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  // Stay below Nyquist with margin — clamp at 18kHz.
  const cutoff = Math.min(18000, 2 * f + brightness * 6000);
  lp.frequency.value = cutoff;
  lp.Q.value = 1.5;
  env.connect(lp);

  // ---- Soft-clip ("bite") via tanh curve --------------------------------
  const shaper = ctx.createWaveShaper();
  shaper.curve = tanhCurve(4096, 5);
  shaper.oversample = '4x';
  // Boost into the curve so the saw actually saturates.
  const driveBoost = ctx.createGain();
  driveBoost.gain.value = 1.6;
  lp.connect(driveBoost);
  driveBoost.connect(shaper);

  // ---- Output gain (peak v × 0.18) --------------------------------------
  const outGain = ctx.createGain();
  outGain.gain.value = v * 0.18;
  shaper.connect(outGain);
  outGain.connect(dest);

  // Cleanup.
  const stopAtMs = (stopAt + 0.1 - ctx.currentTime) * 1000;
  setTimeout(() => {
    for (const o of oscs) {
      try { o.disconnect(); } catch { /* idempotent */ }
    }
    try { sumGain.disconnect(); } catch { /* idempotent */ }
    try { env.disconnect(); } catch { /* idempotent */ }
    try { lp.disconnect(); } catch { /* idempotent */ }
    try { driveBoost.disconnect(); } catch { /* idempotent */ }
    try { shaper.disconnect(); } catch { /* idempotent */ }
    try { outGain.disconnect(); } catch { /* idempotent */ }
  }, Math.max(100, stopAtMs + 50));
}
