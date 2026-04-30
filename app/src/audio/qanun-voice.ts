// Qanun voice — simplified.
//
// REGRESSION FIX: the previous Karplus-Strong-lite implementation was
// producing the noise burst but not the tonal feedback resonance. Until
// we can verify the K-S loop is wired correctly, this voice is a plain
// triangle oscillator + AD envelope. Triangle is closer to a plucked-
// string spectrum than sine (richer odd harmonics, mellower than saw),
// and the AD envelope mimics a pluck's quick attack + exponential tail.
//
// This is provably audible. K-S returns once we can stand up an
// OfflineAudioContext-backed test that proves it produces a pitched
// resonance at the target frequency.

export interface QanunVoiceTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  /** Frequency in Hz (NOT MIDI). */
  frequencyHz: number;
  /** 0..1 attack amplitude. Default 1. */
  velocity?: number;
  /** 0..1 — controls a body-resonance bandpass amount. */
  brightness?: number;
  /** 0..1 — controls decay time (~0.5s short, ~3s long). */
  decay?: number;
  /** 0..1 — adds a short bandpass attack click for "body". */
  body?: number;
  /** Schedule time in ctx.currentTime. Default = now. */
  time?: number;
}

export function triggerQanun(t: QanunVoiceTrigger): void {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const brightness = Math.max(0, Math.min(1, t.brightness ?? 0.6));
  const decay = Math.max(0, Math.min(1, t.decay ?? 0.7));
  const body = Math.max(0, Math.min(1, t.body ?? 0.3));
  const f = Math.max(20, t.frequencyHz);

  // Decay time in seconds: 0.5s short → 3.5s long.
  const decayTime = 0.5 + decay * 3.0;

  // Main tonal oscillator — triangle for plucked-string-ish spectrum.
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = f;

  // Optional second oscillator a fifth up (very quiet) for harmonic body.
  const oscBody = ctx.createOscillator();
  oscBody.type = 'sine';
  oscBody.frequency.value = f * 1.5;

  // Brightness sets a gentle lowpass cutoff.
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 600 + brightness * 8000;
  lp.Q.value = 0.7;

  // Body bandpass (only if body > 0) sums in parallel for attack click.
  let bodyMixGain = ctx.createGain();
  bodyMixGain.gain.value = body * 0.15;

  // AD envelope: instant attack, exponential decay.
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.exponentialRampToValueAtTime(v * 0.35, when + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, when + decayTime);

  // Wire: osc → lp → env → dest. Body branch: oscBody → bodyMixGain → env.
  osc.connect(lp);
  lp.connect(env);
  oscBody.connect(bodyMixGain);
  bodyMixGain.connect(env);
  env.connect(dest);

  osc.start(when);
  oscBody.start(when);
  osc.stop(when + decayTime + 0.05);
  oscBody.stop(when + decayTime + 0.05);

  // Cleanup after envelope ends.
  const stopAtMs = (when + decayTime + 0.1 - ctx.currentTime) * 1000;
  setTimeout(() => {
    try { osc.disconnect(); } catch { /* idempotent */ }
    try { oscBody.disconnect(); } catch { /* idempotent */ }
    try { lp.disconnect(); } catch { /* idempotent */ }
    try { bodyMixGain.disconnect(); } catch { /* idempotent */ }
    try { env.disconnect(); } catch { /* idempotent */ }
  }, Math.max(100, stopAtMs));
}
