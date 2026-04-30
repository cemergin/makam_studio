// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.

export type {
  BindInputOptions,
  MidiAccessLike,
  MidiByte,
  MidiChannel,
  MidiInputLike,
  MidiInputMap,
  MidiModule,
  MidiOutputLike,
  ParamMap,
  TriggerMap,
} from './types';
export { clampMidiByte, clampMidiChannel } from './types';
export { makeMidiModule } from './midi';
export {
  attachMidiSink,
  DEFAULT_CHANNEL_OUT,
  type ChannelOutConfig,
  type SinkSpec,
} from './sink';
export {
  attachClockListener,
  CLOCK_CONTINUE,
  CLOCK_START,
  CLOCK_STOP,
  CLOCK_TICK,
  makeClockSender,
  type ClockListenerCallbacks,
  type ClockSenderHandle,
} from './clock';
export { loadMidiMappings, saveMidiMappings } from './midi-mappings';
export { loadChannelOuts, saveChannelOuts } from './midi-channel-out';
export {
  defaultSessionAdapter,
  useMidiBridge,
  type EngineLike,
  type MidiBridge,
  type SentListener,
  type SentLogEntry,
  type SessionAdapter,
  type UseMidiBridgeOptions,
} from './use-midi-bridge';
export { MidiPanel, type ChannelLabel } from './midi-panel';
