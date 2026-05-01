// app/src/synth/modules/FilterModule.tsx
//
// VCF: type, cutoff (log Hz), resonance, env amount, env A D S R.

import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import type { FilterConfig, FilterEnv, FilterType } from '../../audio/machines';

interface Props {
  filter: FilterConfig;
  filterEnv: FilterEnv;
  modulatedCutoff?: boolean;
  onFilter: (f: FilterConfig) => void;
  onFilterEnv: (e: FilterEnv) => void;
}

const FILTER_TYPES: FilterType[] = ['lp', 'hp', 'bp'];

export function FilterModule({
  filter, filterEnv, modulatedCutoff = false, onFilter, onFilterEnv,
}: Props) {
  return (
    <ConsoleModule title="FILTER">
      <div className="console-module__row">
        <label className="osc-module__select">
          <span>type</span>
          <select
            value={filter.type}
            onChange={(e) => onFilter({ ...filter, type: e.target.value as FilterType })}
          >
            {FILTER_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
          </select>
        </label>
        <Knob
          label="cutoff" unit="Hz"
          value={filter.cutoff} min={50} max={18000} log
          defaultValue={6000}
          format={(v) => `${Math.round(v)}Hz`}
          modulated={modulatedCutoff}
          onChange={(v) => onFilter({ ...filter, cutoff: v })}
        />
        <Knob
          label="res"
          value={filter.q} min={0.1} max={18}
          defaultValue={0.7}
          onChange={(v) => onFilter({ ...filter, q: v })}
        />
        <Knob
          label="env amt"
          value={filterEnv.amount} min={-1} max={1}
          defaultValue={0.3}
          onChange={(v) => onFilterEnv({ ...filterEnv, amount: v })}
        />
      </div>
      <div className="console-module__row">
        <span className="console-module__sub-label">ENV</span>
        <Knob label="A" value={filterEnv.a} min={0.001} max={2}    defaultValue={0.005} onChange={(v) => onFilterEnv({ ...filterEnv, a: v })} />
        <Knob label="D" value={filterEnv.d} min={0.001} max={4}    defaultValue={0.8}   onChange={(v) => onFilterEnv({ ...filterEnv, d: v })} />
        <Knob label="S" value={filterEnv.s} min={0}     max={1}    defaultValue={0}     onChange={(v) => onFilterEnv({ ...filterEnv, s: v })} />
        <Knob label="R" value={filterEnv.r} min={0.001} max={4}    defaultValue={0.2}   onChange={(v) => onFilterEnv({ ...filterEnv, r: v })} />
      </div>
    </ConsoleModule>
  );
}
