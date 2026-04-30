// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.

export type {
  AudioModule,
  ControllableModule,
  ParamSpec,
  SetOptions,
} from './types';
export { chain, parallel, sink, tap, wrap } from './compose';
export {
  bandpass,
  delay,
  gain,
  highpass,
  lowpass,
  panner,
  shaper,
  SHAPER_CURVES,
} from './primitives';
export type { ShaperCurveBuilder } from './primitives';
