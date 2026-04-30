// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Kick drum voice — pitch sweep + optional click transient.
//
// Synthesis recipe (faithful 808/909/707 family):
//   1. Sine osc pitched at `pitch`, exp-ramped to `pitchEnd` over `pitchDecay`s.
//   2. Linear-attack / exp-decay amp envelope with `decay` s tail.
//   3. Optional `click` (0..1): short 2.4 kHz square burst layered under
//      the body. 0 = pure 808 sine, 1 = aggressive 909 transient.
//
// Sourced from BeatForge `audio/machines/voice/kick.ts`, stripped of
// Zod schema, knob/preset metadata, mod-values plumbing, and the
// VoiceMachine wrapper. The result is a single trigger function that
// any sequencer / playground / scratch app can call.

import { ampEnvelope, createGain, createOsc } from '../machines/shared/audio';

export interface KickTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  /** Linear gain multiplier 0..1. Default 1. */
  velocity?: number;
  /** AudioContext.currentTime to schedule at. Default = currentTime. */
  time?: number;
  /** Start pitch in Hz. Default 150. */
  pitch?: number;
  /** End pitch in Hz (after the sweep). Default 40. */
  pitchEnd?: number;
  /** Pitch sweep duration in seconds. Default 0.08. */
  pitchDecay?: number;
  /** Amp envelope decay in seconds. Default 0.6. */
  decay?: number;
  /** Click amount 0..1. Default 0. */
  click?: number;
}

export function triggerKick(t: KickTrigger): void {
  const ctx = t.audioContext;
  const destination = t.destination;
  const when = t.time ?? ctx.currentTime;
  const amp = t.velocity ?? 1;

  const pitch      = t.pitch      ?? 150;
  const pitchEnd   = t.pitchEnd   ?? 40;
  const pitchDecay = t.pitchDecay ?? 0.08;
  const decay      = t.decay      ?? 0.6;
  const click      = t.click      ?? 0;

  // Body: sine sweep + amp envelope.
  const osc = createOsc(ctx);
  osc.frequency.setValueAtTime(pitch, when);
  osc.frequency.exponentialRampToValueAtTime(
    Math.max(0.0001, pitchEnd),
    when + pitchDecay,
  );
  const env = ampEnvelope(ctx, when, amp * 1.1, 0.003, decay);
  osc.connect(env);
  env.connect(destination);
  osc.start(when);
  osc.stop(when + decay + 0.05);

  // Click: optional 2.4 kHz square burst.
  if (click > 0) {
    const tick = createOsc(ctx);
    tick.type = 'square';
    tick.frequency.value = 2400;
    const cg = createGain(ctx);
    cg.gain.setValueAtTime(amp * 0.5 * click, when);
    cg.gain.exponentialRampToValueAtTime(0.0001, when + 0.01);
    tick.connect(cg);
    cg.connect(destination);
    tick.start(when);
    tick.stop(when + 0.02);
  }
}
