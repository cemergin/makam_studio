// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// REFERENCE COMPONENT — INTENDED FOR FORKING.
// ============================================================
// This is the BeatForge MIDI panel ported as a working reference.
// It exists to show how to wire `useMidiBridge` into a UI. Consuming
// apps SHOULD copy this file into their own component tree and
// rebrand it (CSS classes, microcopy, button shapes) to match their
// design system. Do NOT import this directly into a production
// surface — the markup uses BeatForge's `bf-*` CSS class names which
// will not exist in your stylesheet, and the strings are
// English-only (the original used an `i18n` system that has been
// stripped here for portability).
//
// Five sections, mirroring the BeatForge original:
//   1. Enable Web MIDI + list inputs/outputs.
//   2. Edit input mappings (CC / note → bus address).
//   3. Per-channel MIDI-out routing.
//   4. Clock I/O toggles.
//   5. Test send + live monitor.
//
// State + lifecycle live in `useMidiBridge`. This panel is just the
// control surface.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChannelOutConfig } from './sink';
import type { MidiInputMap, MidiOutputLike } from './types';
import type { MidiBridge } from './use-midi-bridge';

/** A consuming app supplies one of these per channel — typically the
 *  human-readable name shown in the channel-out routing table. */
export interface ChannelLabel {
  /** Display string. e.g. 'Kick', 'Snare' for BeatForge; 'String 1',
   *  'String 2' for makam_studio. */
  label: string;
}

interface Props {
  bridge: MidiBridge;
  /** One label per channel. Length should match `channelCount` passed
   *  to `useMidiBridge`. */
  channels: readonly ChannelLabel[];
}

interface LogEntry {
  id: number;
  ts: number;
  dir: 'in' | 'out';
  source: string;
  raw: number[];
  decoded: string;
}

const MAX_LOG = 200;

const COMMON_ADDRESSES: readonly string[] = [
  'master.gain.value',
  'master.dry.value',
  'master.reverb.wet',
  'master.delay.wet',
  'channel.0',
  'channel.0.level',
  'channel.0.pan',
  'channel.0.reverbSend',
  'channel.0.delaySend',
  'channel.1',
  'channel.2',
  'channel.3',
  'channel.4',
];

export function MidiPanel({ bridge, channels }: Props) {
  const {
    access, enable, enableError,
    inputs, outputs,
    channelOuts, updateChannelOut,
    inputMappings, setInputMappings,
    activeInputIds, setActiveInputIds,
    subscribeSent,
    clockListenEnabled, setClockListenEnabled,
    clockSendEnabled, setClockSendEnabled,
    clockSendOutputId, setClockSendOutputId,
    resetSettings,
  } = bridge;

  const onResetClick = useCallback(() => {
    if (window.confirm('Reset all MIDI settings? This wipes mappings, channel routing, and clock toggles.')) {
      resetSettings();
    }
  }, [resetSettings]);

  const [log, setLog] = useState<LogEntry[]>([]);
  const logIdRef = useRef(0);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(paused);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const [testOutputId, setTestOutputId] = useState<string>('');
  const [sendChannel, setSendChannel] = useState(0);
  const [sendNote, setSendNote] = useState(36);
  const [sendVel, setSendVel] = useState(99);
  const [sendCc, setSendCc] = useState(74);
  const [sendCcVal, setSendCcVal] = useState(64);

  const pushLog = useCallback((entry: Omit<LogEntry, 'id'>) => {
    if (pausedRef.current) return;
    setLog((prev) => {
      const next: LogEntry = { ...entry, id: ++logIdRef.current };
      const out = prev.length >= MAX_LOG ? prev.slice(prev.length - MAX_LOG + 1) : prev;
      return [...out, next];
    });
  }, []);

  // Raw monitor — attaches a 'midimessage' listener to every active
  // input, in addition to the bridge's mapping bridge.
  useEffect(() => {
    if (!access) return;
    const offs: Array<() => void> = [];
    for (const input of inputs) {
      if (!activeInputIds.has(input.id)) continue;
      const monitor = (event: { data: Uint8Array }) => {
        const data = Array.from(event.data);
        pushLog({
          ts: performance.now(),
          dir: 'in',
          source: input.name ?? input.id,
          raw: data,
          decoded: decodeMidi(data),
        });
      };
      input.addEventListener('midimessage', monitor);
      offs.push(() => input.removeEventListener('midimessage', monitor));
    }
    return () => { for (const off of offs) off(); };
  }, [access, inputs, activeInputIds, pushLog]);

  // Subscribe to outgoing messages emitted by the sequencer sink so
  // the monitor shows out-traffic alongside in-traffic.
  useEffect(() => {
    return subscribeSent((entry) => {
      const out = outputs.find((o) => o.id === entry.outputId);
      pushLog({
        ts: performance.now(),
        dir: 'out',
        source: out?.name ?? entry.outputId,
        raw: entry.data,
        decoded: decodeMidi(entry.data),
      });
    });
  }, [subscribeSent, outputs, pushLog]);

  const addMapping = useCallback((kind: 'note' | 'cc') => {
    const next: MidiInputMap[] = inputMappings.concat(
      kind === 'note'
        ? { kind: 'note', toAddress: 'channel.0' }
        : { kind: 'cc', cc: 74, toAddress: 'channel.0.color.cutoff', scale: 'linear' },
    );
    setInputMappings(next);
  }, [inputMappings, setInputMappings]);

  const updateMapping = useCallback((idx: number, patch: Partial<MidiInputMap>) => {
    const next = inputMappings.map((m, i) => (i === idx ? { ...m, ...patch } as MidiInputMap : m));
    setInputMappings(next);
  }, [inputMappings, setInputMappings]);

  const removeMapping = useCallback((idx: number) => {
    setInputMappings(inputMappings.filter((_, i) => i !== idx));
  }, [inputMappings, setInputMappings]);

  const pendingNoteOffsRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  useEffect(() => {
    const pending = pendingNoteOffsRef.current;
    return () => {
      for (const id of pending) clearTimeout(id);
      pending.clear();
    };
  }, []);
  const testChannelOut = useCallback((idx: number) => {
    const cfg = channelOuts[idx];
    if (!cfg || !cfg.outputId) return;
    const out = outputs.find((o) => o.id === cfg.outputId);
    if (!out) return;
    const velByte = Math.max(1, Math.min(127, Math.round(99 * cfg.velocityScale)));
    const status = 0x90 | (cfg.midiChannel & 0x0f);
    const onData = [status, cfg.note & 0x7f, velByte];
    out.send(onData);
    pushLog({ ts: performance.now(), dir: 'out', source: out.name ?? out.id, raw: onData, decoded: decodeMidi(onData) });
    const offData = [0x80 | (cfg.midiChannel & 0x0f), cfg.note & 0x7f, 0];
    const id = setTimeout(() => {
      pendingNoteOffsRef.current.delete(id);
      out.send(offData);
      pushLog({ ts: performance.now(), dir: 'out', source: out.name ?? out.id, raw: offData, decoded: decodeMidi(offData) });
    }, 150);
    pendingNoteOffsRef.current.add(id);
  }, [channelOuts, outputs, pushLog]);

  const clearLog = useCallback(() => setLog([]), []);

  const findOutput = useCallback((): MidiOutputLike | null => {
    if (!testOutputId) return null;
    return outputs.find((o) => o.id === testOutputId) ?? null;
  }, [testOutputId, outputs]);

  const sendNoteOn = useCallback(() => {
    const out = findOutput();
    if (!out) return;
    const data = [0x90 | (sendChannel & 0x0f), sendNote & 0x7f, sendVel & 0x7f];
    out.send(data);
    pushLog({ ts: performance.now(), dir: 'out', source: out.name ?? out.id, raw: data, decoded: decodeMidi(data) });
  }, [findOutput, sendChannel, sendNote, sendVel, pushLog]);

  const sendNoteOff = useCallback(() => {
    const out = findOutput();
    if (!out) return;
    const data = [0x80 | (sendChannel & 0x0f), sendNote & 0x7f, 0];
    out.send(data);
    pushLog({ ts: performance.now(), dir: 'out', source: out.name ?? out.id, raw: data, decoded: decodeMidi(data) });
  }, [findOutput, sendChannel, sendNote, pushLog]);

  const sendCcMsg = useCallback(() => {
    const out = findOutput();
    if (!out) return;
    const data = [0xb0 | (sendChannel & 0x0f), sendCc & 0x7f, sendCcVal & 0x7f];
    out.send(data);
    pushLog({ ts: performance.now(), dir: 'out', source: out.name ?? out.id, raw: data, decoded: decodeMidi(data) });
  }, [findOutput, sendChannel, sendCc, sendCcVal, pushLog]);

  const toggleInput = useCallback((id: string) => {
    const next = new Set(activeInputIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setActiveInputIds(next);
  }, [activeInputIds, setActiveInputIds]);

  return (
    <main>
      <header>
        <div>
          <h1>MIDI <span>(reference panel — fork into your own UI)</span></h1>
          <p>
            Bind controllers, route channels, and monitor traffic. Mappings persist to localStorage.
          </p>
          <div>
            {!access
              ? <button onClick={() => { void enable(); }} type="button">Enable MIDI</button>
              : <span>{`MIDI: ${inputs.length} inputs, ${outputs.length} outputs`}</span>}
            <button type="button" onClick={onResetClick} title="Wipe every persisted MIDI setting">
              Reset all
            </button>
          </div>
          {enableError && <div role="alert">{enableError}</div>}
        </div>
      </header>

      {access && (
        <>
          <section>
            <h2>Inputs</h2>
            <span>Toggle which devices feed the mapping engine.</span>
            {inputs.length === 0 ? (
              <div>No MIDI inputs detected.</div>
            ) : (
              <div>
                {inputs.map((i) => (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => toggleInput(i.id)}
                    aria-pressed={activeInputIds.has(i.id)}
                  >
                    {i.name ?? i.id}
                  </button>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2>Input mappings</h2>
            <span>Translate incoming MIDI to bus events.</span>
            <div>
              {inputMappings.map((m, idx) => (
                <MappingRow
                  key={idx}
                  map={m}
                  onChange={(patch) => updateMapping(idx, patch)}
                  onRemove={() => removeMapping(idx)}
                />
              ))}
              <div>
                <button type="button" onClick={() => addMapping('note')}>+ Add note mapping</button>
                <button type="button" onClick={() => addMapping('cc')}>+ Add CC mapping</button>
                {inputMappings.length > 0 && (
                  <button type="button" onClick={() => setInputMappings([])}>Clear all</button>
                )}
              </div>
            </div>
          </section>

          <section>
            <h2>Channel out</h2>
            <span>Route each app channel to a MIDI output device + channel + note.</span>
            <div>
              {channelOuts.map((cfg, idx) => (
                <ChannelOutRow
                  key={idx}
                  idx={idx}
                  label={channels[idx]?.label ?? `ch${idx + 1}`}
                  cfg={cfg}
                  outputs={outputs}
                  onChange={(patch) => updateChannelOut(idx, patch)}
                  onTest={() => testChannelOut(idx)}
                />
              ))}
            </div>
          </section>

          <section>
            <h2>Clock I/O</h2>
            <span>Sync to / from external MIDI clock.</span>
            <div>
              <div>
                <span>in</span>
                <label>
                  <input
                    type="checkbox"
                    checked={clockListenEnabled}
                    onChange={(e) => setClockListenEnabled(e.target.checked)}
                  />
                  Listen to MIDI clock (BPM + start/stop)
                </label>
              </div>
              <div>
                <span>out</span>
                <label>
                  <input
                    type="checkbox"
                    checked={clockSendEnabled}
                    onChange={(e) => setClockSendEnabled(e.target.checked)}
                  />
                  Send 24 PPQN MIDI clock
                </label>
                <label>
                  to:
                  <select
                    value={clockSendOutputId}
                    onChange={(e) => setClockSendOutputId(e.target.value)}
                  >
                    <option value="">(none)</option>
                    {outputs.map((o) => (
                      <option key={o.id} value={o.id}>{o.name ?? o.id}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section>
            <h2>Test send</h2>
            <span>Verify wiring without playing the app.</span>
            <div>
              <select
                value={testOutputId}
                onChange={(e) => setTestOutputId(e.target.value)}
              >
                <option value="">(select output)</option>
                {outputs.map((o) => (
                  <option key={o.id} value={o.id}>{o.name ?? o.id}</option>
                ))}
              </select>
              <label>
                ch
                <input type="number" min={0} max={15} value={sendChannel}
                  onChange={(e) => setSendChannel(parseInt(e.target.value, 10) || 0)} />
              </label>
              <label>
                note
                <input type="number" min={0} max={127} value={sendNote}
                  onChange={(e) => setSendNote(parseInt(e.target.value, 10) || 0)} />
              </label>
              <span>{noteName(sendNote)}</span>
              <label>
                vel
                <input type="number" min={0} max={127} value={sendVel}
                  onChange={(e) => setSendVel(parseInt(e.target.value, 10) || 0)} />
              </label>
              <button type="button" onClick={sendNoteOn} disabled={!testOutputId}>note-on</button>
              <button type="button" onClick={sendNoteOff} disabled={!testOutputId}>note-off</button>
              <label>
                cc
                <input type="number" min={0} max={127} value={sendCc}
                  onChange={(e) => setSendCc(parseInt(e.target.value, 10) || 0)} />
              </label>
              <label>
                value
                <input type="number" min={0} max={127} value={sendCcVal}
                  onChange={(e) => setSendCcVal(parseInt(e.target.value, 10) || 0)} />
              </label>
              <button type="button" onClick={sendCcMsg} disabled={!testOutputId}>send CC</button>
            </div>
          </section>

          <section>
            <h2>Monitor</h2>
            <span>
              {`${log.length}/${MAX_LOG} messages`}
              <button type="button" onClick={() => setPaused((p) => !p)}>
                {paused ? ' resume' : ' pause'}
              </button>
              <button type="button" onClick={clearLog}> clear</button>
            </span>
            <div>
              {log.length === 0 ? (
                <div>No traffic yet.</div>
              ) : (
                log.slice().reverse().map((e) => (
                  <div key={e.id}>
                    <span>{e.dir === 'in' ? '↓' : '↑'}</span>
                    <span>{e.source}</span>
                    <span>{e.raw.map((b) => b.toString(16).padStart(2, '0')).join(' ')}</span>
                    <span>{e.decoded}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

interface MappingRowProps {
  map: MidiInputMap;
  onChange: (patch: Partial<MidiInputMap>) => void;
  onRemove: () => void;
}

function MappingRow({ map, onChange, onRemove }: MappingRowProps) {
  return (
    <div>
      <span>{map.kind}</span>
      <label>
        ch
        <input
          type="number"
          min={-1} max={15}
          value={map.channel ?? -1}
          onChange={(e) => {
            const n = parseInt(e.target.value, 10);
            onChange({ channel: n >= 0 && n <= 15 ? n : undefined });
          }}
        />
      </label>
      {map.kind === 'note' && (
        <label>
          note
          <input
            type="number"
            min={-1} max={127}
            value={map.note ?? -1}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              onChange({ note: n >= 0 && n <= 127 ? n : undefined });
            }}
          />
        </label>
      )}
      {map.kind === 'cc' && (
        <label>
          cc
          <input
            type="number"
            min={0} max={127}
            value={map.cc}
            onChange={(e) => onChange({ cc: parseInt(e.target.value, 10) || 0 })}
          />
        </label>
      )}
      <label>
        →
        <input
          type="text"
          value={map.toAddress}
          onChange={(e) => onChange({ toAddress: e.target.value })}
          list="musical-core-midi-addresses"
        />
      </label>
      <button type="button" onClick={onRemove}>remove</button>

      <datalist id="musical-core-midi-addresses">
        {COMMON_ADDRESSES.map((a) => <option key={a} value={a} />)}
      </datalist>
    </div>
  );
}

interface ChannelOutRowProps {
  idx: number;
  label: string;
  cfg: ChannelOutConfig;
  outputs: MidiOutputLike[];
  onChange: (patch: Partial<ChannelOutConfig>) => void;
  onTest: () => void;
}

function ChannelOutRow({ idx, label, cfg, outputs, onChange, onTest }: ChannelOutRowProps) {
  const canTest = cfg.outputId !== null;
  return (
    <div>
      <span>ch{idx + 1}</span>
      <span>{label}</span>
      <label>
        <input
          type="checkbox"
          checked={cfg.enabled}
          onChange={(e) => onChange({ enabled: e.target.checked })}
        />
        enable
      </label>
      <label>
        out:
        <select
          value={cfg.outputId ?? ''}
          onChange={(e) => onChange({ outputId: e.target.value === '' ? null : e.target.value })}
        >
          <option value="">(none)</option>
          {outputs.map((o) => (
            <option key={o.id} value={o.id}>{o.name ?? o.id}</option>
          ))}
        </select>
      </label>
      <label>
        ch
        <input
          type="number"
          min={1} max={16}
          value={cfg.midiChannel + 1}
          onChange={(e) => onChange({ midiChannel: (parseInt(e.target.value, 10) || 1) - 1 })}
        />
      </label>
      <label>
        note
        <input
          type="number"
          min={0} max={127}
          value={cfg.note}
          onChange={(e) => onChange({ note: parseInt(e.target.value, 10) || 0 })}
        />
      </label>
      <span>{noteName(cfg.note)}</span>
      <label>
        vel
        <input
          type="number"
          min={0} max={1} step={0.05}
          value={cfg.velocityScale}
          onChange={(e) => onChange({ velocityScale: parseFloat(e.target.value) || 0 })}
        />
      </label>
      <button type="button" onClick={onTest} disabled={!canTest}>
        test
      </button>
    </div>
  );
}

function decodeMidi(data: number[]): string {
  if (data.length < 1) return '';
  const status = data[0];
  const high = status & 0xf0;
  const ch = status & 0x0f;
  const b1 = data[1] ?? 0;
  const b2 = data[2] ?? 0;
  if (high === 0x80) return `note off  ch${ch} ${noteName(b1)} (${b1})`;
  if (high === 0x90) return b2 === 0
    ? `note off  ch${ch} ${noteName(b1)} (${b1})`
    : `note on   ch${ch} ${noteName(b1)} (${b1}) v${b2}`;
  if (high === 0xb0) return `cc        ch${ch} #${b1}=${b2}`;
  if (high === 0xe0) return `pitch     ch${ch} ${(b2 << 7) | b1}`;
  if (high === 0xc0) return `program   ch${ch} ${b1}`;
  if (high === 0xd0) return `aftertouch ch${ch} ${b1}`;
  if (status === 0xf8) return 'clock';
  if (status === 0xfa) return 'start';
  if (status === 0xfb) return 'continue';
  if (status === 0xfc) return 'stop';
  return `0x${status.toString(16)}`;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** MIDI 60 = C4 (Yamaha / Roland convention). */
function noteName(n: number): string {
  if (n < 0 || n > 127) return '';
  const name = NOTE_NAMES[n % 12];
  const octave = Math.floor(n / 12) - 1;
  return `${name}${octave}`;
}
