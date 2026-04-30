// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Audio core barrel — re-exports the framework-free control plane
// (events/router/audio-graph), shared low-level helpers, the
// master-bus FX modules, the generic sequencer + tempo math, the
// React metronome hook, and the basic synth voice catalog.
//
//   import { makeEventBus, makeRouter, gain, createReverb,
//            makeSequencer, useMetronome,
//            triggerKick, triggerSine } from 'musical-core/audio';

export * from './events';
export * from './router';
export * from './audio-graph';
export * from './effects';
export * from './sequencer';
export * from './tempo';
export * from './use-metronome';
export * as machines from './machines/shared';
export * as voices from './voices';
