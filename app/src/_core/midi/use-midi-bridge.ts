// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// MIDI bridge — single React-side owner for everything MIDI-related
// in the running app. Lives at the app's root shell so the bridge
// survives tab switches: a controller's CC mapping keeps driving
// audio while the user is in a different mode; sequencer MIDI-out
// keeps flowing while they're editing.
//
// PARAMETERIZATION NOTES
// ----------------------
// The BeatForge original imported a concrete `SoundEngine` and a
// concrete `useSession()` hook with pattern/bpm/playing fields. To
// keep this module brand-neutral musical-core takes those couplings
// as inputs:
//
//   - `engine: { getEventBus: () => EventBus }` — the consuming app
//     passes whatever object owns the bus. BeatForge passes its
//     SoundEngine; makam_studio would pass the qanun runtime.
//   - `session: SessionAdapter` — a small interface providing the
//     fields the clock-listen / clock-send effects read. Defaults are
//     supplied so apps that don't sequence (e.g. a hand-played
//     melodic instrument) can pass `defaultSessionAdapter()`.
//   - `storageKeyPrefix: string` — namespaces every localStorage key
//     this bridge writes. BeatForge uses `'bf_midi_'` (the original
//     value); makam_studio would use `'ms_midi_'` to avoid collisions
//     when both run on the same origin during dev.
//
// TODO: parameterize for consuming app — the consuming app must
// decide:
//   1. The `SessionAdapter` shape — how to read BPM, playing state,
//      and step duration. For a non-sequenced app, return a constant
//      step duration and `playing: false`; the clock-send effect
//      then never fires automatically.
//   2. The `storageKeyPrefix` — string prefix for all persistence keys
//      written here.
//
// The hook returns a `MidiBridge` value — pass it down to the panel
// component (`midi-panel.tsx`) or whatever UI you build on top.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EventBus } from '../audio/events';
import { attachClockListener, makeClockSender, type ClockSenderHandle } from './clock';
import { makeMidiModule } from './midi';
import { attachMidiSink, type ChannelOutConfig } from './sink';
import type {
  MidiAccessLike,
  MidiInputLike,
  MidiInputMap,
  MidiModule,
  MidiOutputLike,
} from './types';
import { loadChannelOuts, saveChannelOuts } from './midi-channel-out';
import { loadMidiMappings, saveMidiMappings } from './midi-mappings';
import { logError } from '../lib/log';

export interface SentLogEntry {
  outputId: string;
  data: number[];
}

export type SentListener = (entry: SentLogEntry) => void;

/** Minimum surface a consuming app's "session" object must expose for
 *  this bridge to drive clock-listen + clock-send. Apps without a
 *  sequencer can supply a `defaultSessionAdapter()` instance whose
 *  start/stop are no-ops and whose `getStepDurationMs` returns a
 *  sensible constant (e.g. 120ms for a hand-played instrument). */
export interface SessionAdapter {
  /** Latest BPM. Used by the clock sender's setBpm and by anyone
   *  computing step durations. */
  bpm: number;
  /** Whether the consuming app's transport is currently playing.
   *  Mirrors to 0xFA / 0xFC on the clock sender. */
  playing: boolean;
  /** Push BPM coming in from an external clock source. */
  setBpm: (bpm: number) => void;
  /** Push start coming from external clock. */
  start: () => void;
  /** Push stop coming from external clock. */
  stop: () => void;
  /** Step duration in milliseconds — used by the MIDI sink to
   *  schedule note-off after a note-on. Apps without a step grid
   *  return a constant (e.g. 120). */
  getStepDurationMs: () => number;
}

/** A no-op SessionAdapter — pass to `useMidiBridge` if your app does
 *  not have a sequenced transport. Clock send/listen effects will
 *  not fire automatically; outgoing notes use the supplied
 *  default-step-duration. */
export function defaultSessionAdapter(stepDurationMs = 120): SessionAdapter {
  return {
    bpm: 120,
    playing: false,
    setBpm: () => {},
    start: () => {},
    stop: () => {},
    getStepDurationMs: () => stepDurationMs,
  };
}

/** Engine-like object the bridge needs — only `.getEventBus()`. The
 *  consuming app's runtime passes its bus owner here. */
export interface EngineLike {
  getEventBus: () => EventBus;
}

export interface UseMidiBridgeOptions {
  /** Engine that owns the event bus the bridge subscribes/emits on. */
  engine: EngineLike;
  /** How many channel-out rows to maintain. Should match the
   *  consuming app's audio channel count. */
  channelCount: number;
  /** Adapter exposing BPM/playing/step state. */
  session: SessionAdapter;
  /** Prefix for every localStorage key this bridge writes. Default
   *  matches BeatForge's historical namespace; apps should override. */
  storageKeyPrefix?: string;
}

export interface MidiBridge {
  midi: MidiModule;
  access: MidiAccessLike | null;
  enable: () => Promise<void>;
  enableError: string | null;

  inputs: MidiInputLike[];
  outputs: MidiOutputLike[];

  /** Per-channel out routing (length matches channelCount). */
  channelOuts: ChannelOutConfig[];
  /** Patch one row in place. Length-safe — callers can't accidentally
   *  shorten the array or pass a wrong-shape replacement. */
  updateChannelOut: (idx: number, patch: Partial<ChannelOutConfig>) => void;

  inputMappings: MidiInputMap[];
  setInputMappings: (next: MidiInputMap[]) => void;

  activeInputIds: Set<string>;
  setActiveInputIds: (next: Set<string>) => void;

  /** Subscribe to outgoing sink emissions so the MIDI panel's monitor
   *  can show outbound traffic. Returns an unsubscribe. */
  subscribeSent: (fn: SentListener) => () => void;

  /** Wipe every persisted MIDI setting (mappings, channel-out routing,
   *  clock toggles, active inputs, auto-enable flag) and reset the
   *  in-memory bridge state. The Web MIDI access itself is left
   *  alone — the browser's permission grant survives the reset, so
   *  the next enable() call still skips the prompt. */
  resetSettings: () => void;

  // ── Clock I/O ───────────────────────────────────────────────────
  clockListenEnabled: boolean;
  setClockListenEnabled: (b: boolean) => void;

  clockSendEnabled: boolean;
  setClockSendEnabled: (b: boolean) => void;
  clockSendOutputId: string;
  setClockSendOutputId: (id: string) => void;
}

export function useMidiBridge(opts: UseMidiBridgeOptions): MidiBridge {
  const { engine, channelCount, session } = opts;
  const prefix = opts.storageKeyPrefix ?? 'bf_midi_';

  // Storage keys — all derived from prefix.
  const KEY_MAPPINGS = `${prefix}mappings_v1`;
  const KEY_CHANNEL_OUT = `${prefix}channel_out_v1`;
  const KEY_CLOCK_LISTEN = `${prefix}clock_listen`;
  const KEY_CLOCK_SEND = `${prefix}clock_send`;
  const KEY_CLOCK_OUT = `${prefix}clock_out`;
  const KEY_ACTIVE_INPUTS = `${prefix}active_inputs`;
  const KEY_AUTO_ENABLE = `${prefix}auto_enable`;

  const midi = useMemo<MidiModule>(() => makeMidiModule(engine.getEventBus()), [engine]);

  const [access, setAccess] = useState<MidiAccessLike | null>(null);
  const [enableError, setEnableError] = useState<string | null>(null);
  const [inputs, setInputs] = useState<MidiInputLike[]>([]);
  const [outputs, setOutputs] = useState<MidiOutputLike[]>([]);

  const [channelOuts, setChannelOuts] = useState<ChannelOutConfig[]>(
    () => loadChannelOuts(channelCount, KEY_CHANNEL_OUT),
  );
  const updateChannelOut = useCallback((idx: number, patch: Partial<ChannelOutConfig>) => {
    setChannelOuts((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
  }, []);
  const [inputMappings, setInputMappings] = useState<MidiInputMap[]>(
    () => loadMidiMappings(KEY_MAPPINGS),
  );
  const [activeInputIds, setActiveInputIds] = useState<Set<string>>(
    () => new Set(loadStringArray(KEY_ACTIVE_INPUTS)),
  );

  // Clock toggles — off by default on first run. Once a user has
  // enabled them, the choice sticks across reloads so a long
  // session-or-restart doesn't drop the rig out of sync.
  const [clockListenEnabled, setClockListenEnabled] = useState(
    () => readBool(KEY_CLOCK_LISTEN, false),
  );
  const [clockSendEnabled, setClockSendEnabled] = useState(
    () => readBool(KEY_CLOCK_SEND, false),
  );
  const [clockSendOutputId, setClockSendOutputId] = useState(
    () => readString(KEY_CLOCK_OUT, ''),
  );

  useEffect(() => { writeBool(KEY_CLOCK_LISTEN, clockListenEnabled); }, [KEY_CLOCK_LISTEN, clockListenEnabled]);
  useEffect(() => { writeBool(KEY_CLOCK_SEND, clockSendEnabled); }, [KEY_CLOCK_SEND, clockSendEnabled]);
  useEffect(() => { writeString(KEY_CLOCK_OUT, clockSendOutputId); }, [KEY_CLOCK_OUT, clockSendOutputId]);
  useEffect(() => { writeStringArray(KEY_ACTIVE_INPUTS, [...activeInputIds]); }, [KEY_ACTIVE_INPUTS, activeInputIds]);

  // Persist mutations.
  useEffect(() => { saveChannelOuts(channelOuts, KEY_CHANNEL_OUT); }, [KEY_CHANNEL_OUT, channelOuts]);
  useEffect(() => { saveMidiMappings(inputMappings, KEY_MAPPINGS); }, [KEY_MAPPINGS, inputMappings]);

  // Grow / trim the channel-out config when the channel count changes
  // (e.g. a saved kit with a different layout).
  useEffect(() => {
    setChannelOuts((prev) => {
      if (prev.length === channelCount) return prev;
      const next = prev.slice(0, channelCount);
      while (next.length < channelCount) {
        next.push({ enabled: false, outputId: null, midiChannel: 0, note: 36, velocityScale: 1 });
      }
      return next;
    });
  }, [channelCount]);

  const enable = useCallback(async () => {
    setEnableError(null);
    try {
      const a = await midi.enable();
      midi.attach(a);
      setAccess(a);
      setInputs(midi.inputs());
      setOutputs(midi.outputs());
      // Sticky flag — once the user has enabled MIDI in this browser,
      // re-acquire access automatically on subsequent loads.
      try { localStorage.setItem(KEY_AUTO_ENABLE, '1'); } catch { /* ignore */ }
    } catch (e) {
      setEnableError(e instanceof Error ? e.message : String(e));
      logError('MIDI enable failed', e);
    }
  }, [KEY_AUTO_ENABLE, midi]);

  // Auto-enable on mount if the user has previously enabled MIDI.
  // We only attempt this once per bridge instance to avoid retry
  // storms when the browser revokes permission.
  const autoEnableTriedRef = useRef(false);
  useEffect(() => {
    if (autoEnableTriedRef.current) return;
    autoEnableTriedRef.current = true;
    let prev: string | null = null;
    try { prev = localStorage.getItem(KEY_AUTO_ENABLE); } catch { /* ignore */ }
    if (prev !== '1') return;
    void enable();
  }, [KEY_AUTO_ENABLE, enable]);

  // Refs the sink reads at trigger time. Ref-then-effect-mirror
  // keeps the sink registration stable (no re-attach per knob) while
  // letting the closure see fresh state.
  const channelOutsRef = useRef(channelOuts);
  useEffect(() => { channelOutsRef.current = channelOuts; }, [channelOuts]);
  const outputsRef = useRef(outputs);
  useEffect(() => { outputsRef.current = outputs; }, [outputs]);
  const sessionRef = useRef(session);
  useEffect(() => { sessionRef.current = session; }, [session]);

  // Outgoing-message subscribers.
  const sentListenersRef = useRef<Set<SentListener>>(new Set());
  const subscribeSent = useCallback((fn: SentListener): (() => void) => {
    sentListenersRef.current.add(fn);
    return () => { sentListenersRef.current.delete(fn); };
  }, []);

  // Sink lifecycle — only attach once access is granted. The sink
  // closure reads channelOuts/outputs/session from refs so re-attach
  // isn't needed when those mutate.
  useEffect(() => {
    if (!access) return;
    const off = attachMidiSink(engine.getEventBus(), {
      getConfigs: () => channelOutsRef.current,
      resolveOutput: (id) => outputsRef.current.find((o) => o.id === id) ?? null,
      getStepDurationMs: () => sessionRef.current.getStepDurationMs(),
      onSent: (entry) => {
        for (const l of sentListenersRef.current) l(entry);
      },
    });
    return off;
  }, [access, engine]);

  // Input bindings — re-attach when the user toggles inputs or edits
  // the mapping table.
  useEffect(() => {
    if (!access) return;
    const offs: Array<() => void> = [];
    for (const input of inputs) {
      if (!activeInputIds.has(input.id)) continue;
      offs.push(midi.bindInput(input, inputMappings));
    }
    return () => { for (const off of offs) off(); };
  }, [access, inputs, activeInputIds, inputMappings, midi]);

  // Clock LISTEN — attach to the FIRST active input. The listener
  // input is the FIRST active monitored input; multiple clock sources
  // produce flapping BPM (each smooths on its own window) and double
  // start/stop fires per transport message. Off by default.
  const sessionStartRef = useRef(session.start);
  useEffect(() => { sessionStartRef.current = session.start; }, [session.start]);
  const sessionStopRef = useRef(session.stop);
  useEffect(() => { sessionStopRef.current = session.stop; }, [session.stop]);
  const sessionSetBpmRef = useRef(session.setBpm);
  useEffect(() => { sessionSetBpmRef.current = session.setBpm; }, [session.setBpm]);

  useEffect(() => {
    if (!access || !clockListenEnabled) return;
    const first = inputs.find((input) => activeInputIds.has(input.id));
    if (!first) return;
    return attachClockListener(first, {
      onBpm: (bpm) => sessionSetBpmRef.current(bpm),
      onStart: () => sessionStartRef.current(),
      onContinue: () => sessionStartRef.current(),
      onStop: () => sessionStopRef.current(),
    });
  }, [access, clockListenEnabled, inputs, activeInputIds]);

  // Clock SEND — drives 24 PPQN to the chosen output. Tracks
  // session.playing so 0xFA / 0xFC fire automatically when the user
  // hits play / stop in any tab; tracks session.bpm so tempo changes
  // re-arm the interval. Off by default.
  const senderRef = useRef<ClockSenderHandle | null>(null);
  useEffect(() => {
    if (!access || !clockSendEnabled || !clockSendOutputId) return;
    const out = outputs.find((o) => o.id === clockSendOutputId);
    if (!out) return;
    const handle = makeClockSender(out, session.bpm, (data) => {
      for (const l of sentListenersRef.current) l({ outputId: out.id, data });
    });
    senderRef.current = handle;
    return () => {
      handle.dispose();
      senderRef.current = null;
    };
    // outputs/session.bpm/session.playing intentionally NOT in deps —
    // we react to those via subsequent effects so the sender survives
    // tempo automation without re-allocating its interval.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access, clockSendEnabled, clockSendOutputId]);

  // Push BPM updates to the active sender.
  useEffect(() => {
    senderRef.current?.setBpm(session.bpm);
  }, [session.bpm]);

  // Mirror session.playing → 0xFA / 0xFC.
  const wasPlayingRef = useRef(false);
  useEffect(() => {
    if (!senderRef.current) { wasPlayingRef.current = session.playing; return; }
    if (session.playing && !wasPlayingRef.current) senderRef.current.start();
    else if (!session.playing && wasPlayingRef.current) senderRef.current.stop();
    wasPlayingRef.current = session.playing;
  }, [session.playing]);

  const resetSettings = useCallback(() => {
    // Clear every key the bridge writes. We don't touch the WebMIDI
    // access — the browser's permission grant is independent of our
    // local state.
    for (const key of [
      KEY_MAPPINGS,
      KEY_CHANNEL_OUT,
      KEY_CLOCK_LISTEN,
      KEY_CLOCK_SEND,
      KEY_CLOCK_OUT,
      KEY_ACTIVE_INPUTS,
      KEY_AUTO_ENABLE,
    ]) {
      try { localStorage.removeItem(key); } catch { /* ignore */ }
    }
    setInputMappings([]);
    setChannelOuts(loadChannelOuts(channelCount, KEY_CHANNEL_OUT));
    setClockListenEnabled(false);
    setClockSendEnabled(false);
    setClockSendOutputId('');
    setActiveInputIds(new Set());
  }, [
    KEY_MAPPINGS, KEY_CHANNEL_OUT, KEY_CLOCK_LISTEN, KEY_CLOCK_SEND,
    KEY_CLOCK_OUT, KEY_ACTIVE_INPUTS, KEY_AUTO_ENABLE, channelCount,
  ]);

  return {
    midi, access, enable, enableError,
    inputs, outputs,
    channelOuts, updateChannelOut,
    inputMappings, setInputMappings,
    activeInputIds, setActiveInputIds,
    subscribeSent,
    clockListenEnabled, setClockListenEnabled,
    clockSendEnabled, setClockSendEnabled,
    clockSendOutputId, setClockSendOutputId,
    resetSettings,
  };
}

// ── localStorage helpers ─────────────────────────────────────────
// Tiny shims so the bridge persists toggles + selected device ids
// across reloads without dragging in a serialization library. Each
// helper swallows storage errors silently.

function readBool(key: string, fallback: boolean): boolean {
  try { return localStorage.getItem(key) === '1'; } catch { return fallback; }
}
function writeBool(key: string, value: boolean): void {
  try { localStorage.setItem(key, value ? '1' : '0'); } catch { /* ignore */ }
}
function readString(key: string, fallback: string): string {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function writeString(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* ignore */ }
}
function loadStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch { return []; }
}
function writeStringArray(key: string, value: string[]): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}
