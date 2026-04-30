// Sine voice — pure-sine melodic test tone with ADSR-ish envelope.
//
// Default melodic voice for piano-roll-style UIs. Generates one sine
// oscillator at `pitch` Hz, gated through a linear-attack /
// exponential-decay envelope. Defaults are tuned for short, percussive
// notes that sit cleanly in a 16-step grid; tweak `decay` for longer
// pad-style sustain.

import { ampEnvelope, createOsc } from '../machines/shared/audio';

export interface SineTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  velocity?: number;
  time?: number;
  /** Pitch in Hz. Default 440 (A4). */
  pitch?: number;
  /** Attack time in seconds. Default 0.005. */
  attack?: number;
  /** Decay/release time in seconds. Default 0.25. */
  decay?: number;
  /** Oscillator type. Default 'sine'. */
  type?: OscillatorType;
}

export function triggerSine(t: SineTrigger): void {
  const ctx = t.audioContext;
  const destination = t.destination;
  const when = t.time ?? ctx.currentTime;
  const amp = t.velocity ?? 1;

  const pitch  = t.pitch  ?? 440;
  const attack = t.attack ?? 0.005;
  const decay  = t.decay  ?? 0.25;
  const type   = t.type   ?? 'sine';

  const osc = createOsc(ctx);
  osc.type = type;
  osc.frequency.value = pitch;
  const env = ampEnvelope(ctx, when, amp * 0.4, attack, decay);
  osc.connect(env);
  env.connect(destination);
  osc.start(when);
  osc.stop(when + attack + decay + 0.05);
}
