// Voices barrel — pure-synth one-shot triggers.
//
// All voices share the `VoiceTrigger`-like contract: pass an
// AudioContext, a destination node, an optional time + velocity, plus
// per-voice tuning knobs. Voices schedule their own oscillators /
// noise sources and self-stop. They do NOT own a destination chain —
// hosts connect them downstream of whatever mixer / FX they like.
//
// These are the basics for a test-kit. BeatForge has a much wider
// catalog (clap, cowbell, tom, FM, formant, modal, …) — those stay
// in BeatForge until a second consumer needs them.

export { triggerKick, type KickTrigger } from './kick';
export { triggerSnare, type SnareTrigger } from './snare';
export { triggerHatClosed, type HatTrigger } from './hat-closed';
export { triggerHatOpen } from './hat-open';
export { triggerSine, type SineTrigger } from './sine';
