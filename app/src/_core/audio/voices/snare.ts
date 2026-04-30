// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Snare drum voice — 2-osc tonal body + bandpass-filtered noise.
//
// Body uses two oscillators at `pitch` and `pitch * bodyRatio(pitch)`,
// where the ratio is interpolated between the legacy 808 and 909
// formant pairs (see `bodyRatio`). The noise burst is bandpass-filtered
// at `snap` Hz for the characteristic snare crack.
//
// Sourced from BeatForge `audio/machines/voice/snare.ts`, stripped of
// Zod schema and the VoiceMachine wrapper.

import {
  ampEnvelope,
  createBiquad,
  createGain,
  createNoise,
  createOsc,
} from '../machines/shared/audio';

export interface SnareTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  velocity?: number;
  time?: number;
  /** Body fundamental in Hz. Default 200. */
  pitch?: number;
  /** Bandpass center for the noise crack in Hz. Default 1800. */
  snap?: number;
  /** Body envelope decay in seconds. Default 0.15. */
  decay?: number;
  /** Tone balance 0..1 (0 = pure tonal body, 1 = pure noise). Default 0.5. */
  tone?: number;
  /** Noise envelope decay in seconds. Default 0.15. */
  noiseDecay?: number;
}

/** Body-osc ratio curve. Anchors:
 *  - pitch 185 → ratio 1.886 (legacy 808 absolute: 185, 349)
 *  - pitch 220 → ratio 1.727 (legacy 909 absolute: 220, 380)
 *  Linear interpolate / extrapolate; clamped to [1.5, 2.1]. */
function bodyRatio(pitch: number): number {
  const t = (pitch - 185) / (220 - 185);
  const r = 1.886 + t * (1.727 - 1.886);
  return Math.max(1.5, Math.min(2.1, r));
}

export function triggerSnare(t: SnareTrigger): void {
  const ctx = t.audioContext;
  const destination = t.destination;
  const when = t.time ?? ctx.currentTime;
  const amp = t.velocity ?? 1;

  const pitch      = t.pitch      ?? 200;
  const snap       = t.snap       ?? 1800;
  const decay      = t.decay      ?? 0.15;
  const tone       = t.tone       ?? 0.5;
  const noiseDecay = t.noiseDecay ?? 0.15;

  // Tonal body: 2 oscillators (fundamental + pitch-locked formant ratio).
  const o1 = createOsc(ctx); o1.frequency.value = pitch;
  const o2 = createOsc(ctx); o2.frequency.value = pitch * bodyRatio(pitch);
  const oscEnv = ampEnvelope(ctx, when, amp * 0.5 * (1 - tone), 0.002, decay * 0.6);
  o1.connect(oscEnv); o2.connect(oscEnv);
  oscEnv.connect(destination);
  o1.start(when); o2.start(when);
  o1.stop(when + decay + 0.05); o2.stop(when + decay + 0.05);

  // Noise: bandpass-filtered for "snap."
  const noise = createNoise(ctx, noiseDecay + 0.05);
  const filt = createBiquad(ctx);
  filt.type = 'bandpass';
  filt.frequency.value = snap;
  filt.Q.value = 0.6;
  const noiseEnv = createGain(ctx);
  noiseEnv.gain.setValueAtTime(0, when);
  noiseEnv.gain.linearRampToValueAtTime(amp * 0.7 * tone, when + 0.002);
  noiseEnv.gain.exponentialRampToValueAtTime(0.0001, when + noiseDecay);
  noise.connect(filt).connect(noiseEnv);
  noiseEnv.connect(destination);
  noise.start(when);
  noise.stop(when + noiseDecay + 0.02);
}
