// Sequencer barrel — generic step-grid scheduler.
//
// Generic over voice/pattern shape. Wire onStep to your own voice
// catalog; the sequencer owns timing only. See ./types.ts for the
// pattern schema and parameterization rationale.

export type {
  Sequencer,
  SequencerOptions,
  SequencerPattern,
  SequencerStep,
  SequencerTrack,
  StepCallback,
} from './types';
export { makeSequencer } from './sequencer';
