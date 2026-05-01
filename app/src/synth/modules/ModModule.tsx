// app/src/synth/modules/ModModule.tsx
//
// Two LFOs stacked. Each: rate, shape, depth, destination.

import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import type { LfoConfig, LfoDest, OscType } from '../../audio/machines';

interface Props {
  lfo1: LfoConfig;
  lfo2: LfoConfig;
  onLfo1: (v: LfoConfig) => void;
  onLfo2: (v: LfoConfig) => void;
}

const SHAPES: OscType[] = ['sine', 'triangle', 'sawtooth', 'square'];
const DESTS: LfoDest[] = ['off', 'pitch', 'filter', 'amp'];

function LfoRow({ label, cfg, onChange }: { label: string; cfg: LfoConfig; onChange: (v: LfoConfig) => void }) {
  return (
    <div className="mod-module__row">
      <span className="mod-module__row-label">{label}</span>
      <Knob label="rate" unit="Hz" value={cfg.rate} min={0.05} max={20} log defaultValue={2}
            onChange={(v) => onChange({ ...cfg, rate: v })} />
      <label className="osc-module__select">
        <span>shape</span>
        <select value={cfg.shape} onChange={(e) => onChange({ ...cfg, shape: e.target.value as OscType })}>
          {SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <Knob label="depth" value={cfg.depth} min={0} max={1} defaultValue={0}
            onChange={(v) => onChange({ ...cfg, depth: v })} />
      <label className="osc-module__select">
        <span>dest</span>
        <select value={cfg.destination} onChange={(e) => onChange({ ...cfg, destination: e.target.value as LfoDest })}>
          {DESTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
    </div>
  );
}

export function ModModule({ lfo1, lfo2, onLfo1, onLfo2 }: Props) {
  return (
    <ConsoleModule title="MOD">
      <div className="mod-module">
        <LfoRow label="LFO1" cfg={lfo1} onChange={onLfo1} />
        <LfoRow label="LFO2" cfg={lfo2} onChange={onLfo2} />
      </div>
    </ConsoleModule>
  );
}
