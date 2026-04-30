// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// FX machine catalog — every effect lives here as a
// ControllableModule factory so anything that consumes an audio
// graph (channel strip, master bus, future user-FX rack) speaks the
// same language.
//
// All exports return ControllableModules so the router dispatches
// to them through the same set(name, value) call no matter what
// produced the param event (UI knob, MIDI CC, automation lane).
//
// NOTE (parameterized): BeatForge's original `index.ts` also exposed
// a `buildColorFxModule(cfg, ctx)` helper that switched on a
// BeatForge-specific `ColorFx` discriminated union (sourced from
// `patterns/types-sound`). That helper is intentionally NOT ported —
// it's per-app schema, not shared infrastructure. Consuming apps
// reproduce the dispatch in their own kit/channel layer.

export { createBitcrush, type BitcrushInit } from './bitcrush';
export { createDelayFx, type DelayInit } from './delay';
export { createFilter, type FilterInit } from './filter';
export { createOverdrive, type OverdriveInit } from './overdrive';
export { createReverb, type ReverbInit } from './reverb';

export {
  bitcrushCurve,
  curveBuffer,
  makeReverbImpulse,
  rampParam,
  tanhCurve,
} from './_shared';
