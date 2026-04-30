// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// musical-core top-level barrel.
//
// Three subtrees, each with its own deeper barrel:
//   - audio/  — events bus, address router, audio-graph contracts +
//               composition helpers, master-bus FX modules,
//               low-level Web Audio helpers, scheduler-worker.
//   - midi/   — Web MIDI bridge (input mapping, output sink, clock),
//               React lifecycle owner, reference panel UI.
//   - lib/    — log + url-state + errors + pwa + storage + db
//               vendor-copy helpers.
//
// Importers can pull from this top-level entry or from any subtree
// directly, e.g.:
//
//   import { makeEventBus } from 'musical-core';
//   import { makeEventBus } from 'musical-core/audio/events';
//
// (The latter form requires whatever subpath-resolution mechanism
// the consuming app's bundler is configured with — for vendor-copy
// usage it's just relative paths through src/.)

export * as audio from './audio';
export * as midi from './midi';
export * as lib from './lib';

// Also re-export the most commonly used names directly for convenience.
export {
  makeEventBus,
  makeRouter,
  channelAddress,
  channelSubAddress,
  masterAddress,
  makeSequencer,
  useMetronome,
  parseTimeSigDenom,
  stepToNaturalBpm,
  naturalToStepBpm,
  stepSecondsAt,
  barSecondsAt,
} from './audio';

export {
  makeMidiModule,
  attachMidiSink,
  attachClockListener,
  makeClockSender,
  useMidiBridge,
  defaultSessionAdapter,
  MidiPanel,
} from './midi';

export {
  logError,
  logWarn,
  setLogPrefix,
  ErrorBoundary,
  ErrorToasts,
  PWAStatus,
  readUrlState,
  makeDatabase,
  safeLoadAll,
} from './lib';
