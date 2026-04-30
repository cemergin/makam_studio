// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Closed hi-hat voice — short filtered noise burst (HP→BP cascade).
//
// Sourced from BeatForge `audio/machines/voice/hat.ts` with the
// `closed` preset values inlined as defaults. For an open hat, use
// `triggerHatOpen` (same recipe, longer decay).

import { ampEnvelope, createBiquad, createNoise } from '../machines/shared/audio';

export interface HatTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  velocity?: number;
  time?: number;
  /** Highpass cutoff in Hz. Default 7000. */
  cutoff?: number;
  /** Filter Q. Default 0.7. */
  q?: number;
  /** Envelope decay in seconds. Default 0.05 (closed) / 0.32 (open). */
  decay?: number;
  /** Bandpass-center boost amount 0..1. Default 0.75. */
  pitch?: number;
}

export function triggerHatClosed(t: HatTrigger): void {
  renderHat(t, 0.05);
}

function renderHat(t: HatTrigger, defaultDecay: number): void {
  const ctx = t.audioContext;
  const destination = t.destination;
  const when = t.time ?? ctx.currentTime;
  const amp = t.velocity ?? 1;

  const cutoff = t.cutoff ?? 7000;
  const q      = t.q      ?? 0.7;
  const decay  = t.decay  ?? defaultDecay;
  const pitch  = t.pitch  ?? 0.75;

  const noise = createNoise(ctx, decay + 0.05);

  // HP→BP cascade — matches the legacy 808/909/707 closed/open hat.
  const hp = createBiquad(ctx);
  hp.type = 'highpass';
  hp.frequency.value = cutoff;
  hp.Q.value = q;
  const bp = createBiquad(ctx);
  bp.type = 'bandpass';
  bp.frequency.value = cutoff + pitch * 4000;
  bp.Q.value = q * 1.5;

  const env = ampEnvelope(ctx, when, amp * 0.5, 0.002, decay);
  noise.connect(hp).connect(bp).connect(env);
  env.connect(destination);
  noise.start(when);
  noise.stop(when + decay + 0.02);
}

// Internal helper exposed so hat-open can share the same renderer.
export const _renderHat = renderHat;
