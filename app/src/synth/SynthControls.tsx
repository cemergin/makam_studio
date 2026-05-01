// SynthControls — comprehensive Machine panel.
//
// Layout (top → bottom):
//   - Machine selector  : 4 buttons; active highlighted.
//   - Amp Envelope      : ADSR sliders + SVG curve preview.
//   - Filter            : type buttons (LP/HP/BP), cutoff (log), Q,
//                          + filter envelope ADSR + amount (-1..+1).
//   - LFO 1 / LFO 2     : rate, shape, depth, destination buttons.
//   - Tone              : brightness, body, master volume.
//   - Drone             : octave offset buttons (-2..+2).
//
// Filter + LFO sections collapse to keep the panel scannable.

import { useState, type ReactNode } from 'react';
import type { ADSR } from '../audio/qanun-machine';
import {
  MACHINES,
  type MachineId,
  type FilterConfig,
  type FilterEnv,
  type LfoConfig,
  type LfoDest,
  type OscType,
  type FilterType,
} from '../audio/machines';

interface Props {
  machineId: MachineId;
  brightness: number;
  body: number;
  masterVolume: number;
  adsr: ADSR;
  filter: FilterConfig;
  filterEnv: FilterEnv;
  lfo1: LfoConfig;
  lfo2: LfoConfig;
  droneOctave: number;
  onMachineId: (v: MachineId) => void;
  onBrightness: (v: number) => void;
  onBody: (v: number) => void;
  onMasterVolume: (v: number) => void;
  onAdsr: (v: ADSR) => void;
  onFilter: (v: FilterConfig) => void;
  onFilterEnv: (v: FilterEnv) => void;
  onLfo1: (v: LfoConfig) => void;
  onLfo2: (v: LfoConfig) => void;
  onDroneOctave: (n: number) => void;
}

function Slider({
  id, label, value, onChange, hint, min = 0, max = 1, step = 0.01,
  format,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
}) {
  return (
    <div className="synth-slider">
      <label htmlFor={id} className="synth-slider__label">
        {label}
        <span className="synth-slider__value">
          {format ? format(value) : Math.round(value * 100)}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <span className="synth-slider__hint">{hint}</span>}
    </div>
  );
}

/** Log-scale Hz slider (50..18000 default; UI uses normalized 0..1 internally). */
function LogHzSlider({
  id, label, value, onChange,
  min = 50, max = 18000,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  const lnMin = Math.log(min);
  const lnMax = Math.log(max);
  const norm = Math.max(0, Math.min(1, (Math.log(Math.max(min, value)) - lnMin) / (lnMax - lnMin)));
  const setNorm = (n: number) => {
    const hz = Math.exp(lnMin + n * (lnMax - lnMin));
    onChange(Math.round(hz));
  };
  return (
    <div className="synth-slider">
      <label htmlFor={id} className="synth-slider__label">
        {label}
        <span className="synth-slider__value">
          {value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${Math.round(value)}`} Hz
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={0} max={1} step={0.001}
        value={norm}
        onChange={(e) => setNorm(Number(e.target.value))}
      />
    </div>
  );
}

/** Inline SVG visualization of the ADSR shape. */
function AdsrCurve({ adsr }: { adsr: ADSR }) {
  const W = 240;
  const H = 50;
  const padX = 4;
  const padY = 4;
  const peak = H - padY;
  const sustainY = padY + (1 - adsr.s) * (H - 2 * padY);
  const totalTime = Math.max(0.05, adsr.a + adsr.d + 0.4 + adsr.r);
  const xFor = (t: number) => padX + (t / totalTime) * (W - 2 * padX);

  const x0 = xFor(0);
  const x1 = xFor(adsr.a);
  const x2 = xFor(adsr.a + adsr.d);
  const x3 = xFor(adsr.a + adsr.d + 0.4);
  const x4 = xFor(adsr.a + adsr.d + 0.4 + adsr.r);

  const path = `M ${x0} ${peak} L ${x1} ${padY} L ${x2} ${sustainY} L ${x3} ${sustainY} L ${x4} ${peak}`;
  return (
    <svg className="adsr-curve" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect x="0" y="0" width={W} height={H} fill="rgba(0,0,0,0.25)" />
      <line x1="0" y1={peak} x2={W} y2={peak} stroke="rgba(255,255,255,0.15)" />
      <line x1={x1} y1={padY} x2={x1} y2={peak} stroke="rgba(232,213,106,0.25)" strokeDasharray="2 2" />
      <line x1={x2} y1={padY} x2={x2} y2={peak} stroke="rgba(232,213,106,0.25)" strokeDasharray="2 2" />
      <line x1={x3} y1={padY} x2={x3} y2={peak} stroke="rgba(232,213,106,0.25)" strokeDasharray="2 2" />
      <path d={path} fill="none" stroke="var(--saffron)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function CollapsibleSection({
  title, defaultOpen = false, children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`synth-section ${open ? 'synth-section--open' : ''}`}>
      <button
        type="button"
        className="synth-section__toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className="synth-section__chev" aria-hidden="true">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="synth-section__body">{children}</div>}
    </div>
  );
}

const FILTER_TYPES: { id: FilterType; label: string }[] = [
  { id: 'lp', label: 'LP' },
  { id: 'hp', label: 'HP' },
  { id: 'bp', label: 'BP' },
];

const LFO_SHAPES: OscType[] = ['sine', 'triangle', 'sawtooth', 'square'];
const LFO_DESTS: { id: LfoDest; label: string }[] = [
  { id: 'off',    label: 'off' },
  { id: 'pitch',  label: 'pitch' },
  { id: 'filter', label: 'filter' },
  { id: 'amp',    label: 'amp' },
];

function LfoControls({
  id, label, lfo, onChange,
}: {
  id: string;
  label: string;
  lfo: LfoConfig;
  onChange: (v: LfoConfig) => void;
}) {
  return (
    <CollapsibleSection title={label} defaultOpen={false}>
      <Slider
        id={`${id}-rate`}
        label="rate"
        value={lfo.rate}
        onChange={(rate) => onChange({ ...lfo, rate })}
        min={0.05} max={20} step={0.05}
        format={(v) => `${v.toFixed(2)} Hz`}
      />
      <div className="synth-row">
        <span className="synth-row__label">shape</span>
        <select
          className="synth-select"
          value={lfo.shape}
          onChange={(e) => onChange({ ...lfo, shape: e.target.value as OscType })}
        >
          {LFO_SHAPES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <Slider
        id={`${id}-depth`}
        label="depth"
        value={lfo.depth}
        onChange={(depth) => onChange({ ...lfo, depth })}
      />
      <div className="synth-row">
        <span className="synth-row__label">destination</span>
        <div className="synth-pill-group" role="group" aria-label={`${label} destination`}>
          {LFO_DESTS.map((d) => (
            <button
              key={d.id}
              type="button"
              className="synth-pill"
              aria-pressed={lfo.destination === d.id}
              onClick={() => onChange({ ...lfo, destination: d.id })}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </CollapsibleSection>
  );
}

export function SynthControls({
  machineId, brightness, body, masterVolume,
  adsr, filter, filterEnv, lfo1, lfo2, droneOctave,
  onMachineId, onBrightness, onBody, onMasterVolume,
  onAdsr, onFilter, onFilterEnv, onLfo1, onLfo2, onDroneOctave,
}: Props) {
  const setA = (a: number) => onAdsr({ ...adsr, a });
  const setD = (d: number) => onAdsr({ ...adsr, d });
  const setS = (s: number) => onAdsr({ ...adsr, s });
  const setR = (r: number) => onAdsr({ ...adsr, r });
  const fmtSec = (v: number) => `${v.toFixed(2)}s`;

  return (
    <section className="card" aria-label="Machine">
      <h3 className="card__title">Machine</h3>
      <div className="synth-voice-selector" role="group" aria-label="Machine selector">
        {MACHINES.map((m) => (
          <button
            key={m.id}
            type="button"
            className="synth-voice-selector__btn"
            onClick={() => onMachineId(m.id)}
            aria-pressed={machineId === m.id}
          >
            {m.label}
          </button>
        ))}
      </div>

      <h3 className="card__title">Amp Envelope (ADSR)</h3>
      <AdsrCurve adsr={adsr} />
      <Slider
        id="adsr-a" label="attack" value={adsr.a} onChange={setA}
        min={0.001} max={2} step={0.001} format={fmtSec}
      />
      <Slider
        id="adsr-d" label="decay" value={adsr.d} onChange={setD}
        min={0.01} max={3} step={0.01} format={fmtSec}
      />
      <Slider id="adsr-s" label="sustain" value={adsr.s} onChange={setS} />
      <Slider
        id="adsr-r" label="release" value={adsr.r} onChange={setR}
        min={0.01} max={4} step={0.01} format={fmtSec}
      />

      <CollapsibleSection title="Filter" defaultOpen={false}>
        <div className="synth-row">
          <span className="synth-row__label">type</span>
          <div className="synth-pill-group" role="group" aria-label="Filter type">
            {FILTER_TYPES.map((ft) => (
              <button
                key={ft.id}
                type="button"
                className="synth-pill"
                aria-pressed={filter.type === ft.id}
                onClick={() => onFilter({ ...filter, type: ft.id })}
              >
                {ft.label}
              </button>
            ))}
          </div>
        </div>
        <LogHzSlider
          id="filter-cutoff"
          label="cutoff"
          value={filter.cutoff}
          onChange={(cutoff) => onFilter({ ...filter, cutoff })}
        />
        <Slider
          id="filter-q" label="resonance" value={filter.q}
          onChange={(q) => onFilter({ ...filter, q })}
          min={0.1} max={18} step={0.1}
          format={(v) => v.toFixed(1)}
        />
        <h4 className="synth-subtitle">Filter Env</h4>
        <Slider
          id="fenv-a" label="attack" value={filterEnv.a}
          onChange={(a) => onFilterEnv({ ...filterEnv, a })}
          min={0.001} max={2} step={0.001} format={fmtSec}
        />
        <Slider
          id="fenv-d" label="decay" value={filterEnv.d}
          onChange={(d) => onFilterEnv({ ...filterEnv, d })}
          min={0.01} max={3} step={0.01} format={fmtSec}
        />
        <Slider
          id="fenv-s" label="sustain" value={filterEnv.s}
          onChange={(s) => onFilterEnv({ ...filterEnv, s })}
        />
        <Slider
          id="fenv-r" label="release" value={filterEnv.r}
          onChange={(r) => onFilterEnv({ ...filterEnv, r })}
          min={0.01} max={4} step={0.01} format={fmtSec}
        />
        <Slider
          id="fenv-amount" label="amount"
          value={filterEnv.amount}
          onChange={(amount) => onFilterEnv({ ...filterEnv, amount })}
          min={-1} max={1} step={0.01}
          format={(v) => (v >= 0 ? `+${v.toFixed(2)}` : v.toFixed(2))}
        />
      </CollapsibleSection>

      <LfoControls id="lfo1" label="LFO 1" lfo={lfo1} onChange={onLfo1} />
      <LfoControls id="lfo2" label="LFO 2" lfo={lfo2} onChange={onLfo2} />

      <h3 className="card__title">Tone</h3>
      <Slider
        id="synth-brightness" label="brightness"
        value={brightness} onChange={onBrightness}
        hint="filter cutoff bias"
      />
      <Slider
        id="synth-body" label="body"
        value={body} onChange={onBody}
        hint="resonance (qanun only)"
      />
      <Slider
        id="master-volume" label="master"
        value={masterVolume} onChange={onMasterVolume}
      />

      <h3 className="card__title">Drone</h3>
      <div className="synth-row">
        <span className="synth-row__label">octave</span>
        <div className="synth-pill-group" role="group" aria-label="Drone octave">
          {[-2, -1, 0, 1, 2].map((n) => (
            <button
              key={n}
              type="button"
              className="synth-pill"
              aria-pressed={droneOctave === n}
              onClick={() => onDroneOctave(n)}
            >
              {n > 0 ? `+${n}` : `${n}`}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
