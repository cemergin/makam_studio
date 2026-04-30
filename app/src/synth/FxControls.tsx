// FxControls — 4 effect cards (filter, overdrive, reverb send, delay
// send). Each card auto-derives its sliders from the effect module's
// `.params` schema (continuous + discrete), with a bypass toggle at top.

import { useEffect, useState } from 'react';
import type { ControllableModule, ParamSpec } from '../_core/audio';
import type { FxKey, MasterBus } from '../audio/master-bus';

interface Props {
  bus: MasterBus;
}

const FX_LABELS: Record<FxKey, string> = {
  filter: 'Filter',
  overdrive: 'Overdrive',
  reverb: 'Reverb send',
  delay: 'Delay send',
};

const FX_ORDER: FxKey[] = ['filter', 'overdrive', 'reverb', 'delay'];

interface FxCardProps {
  fx: FxKey;
  module: ControllableModule;
  bus: MasterBus;
}

function FxCard({ fx, module, bus }: FxCardProps) {
  const [bypass, setBypass] = useState(fx === 'reverb' || fx === 'delay' || fx === 'overdrive');
  const [values, setValues] = useState<Record<string, number | string>>(() => {
    const init: Record<string, number | string> = {};
    for (const p of module.params) init[p.name] = p.default;
    return init;
  });

  useEffect(() => {
    bus.setFxBypass(fx, bypass);
  }, [bypass, bus, fx]);

  const updateValue = (name: string, value: number | string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    bus.setFxParam(fx, name, value);
  };

  const renderParam = (p: ParamSpec) => {
    if (p.kind === 'discrete' && p.options) {
      return (
        <div className="fx-param" key={p.name}>
          <label htmlFor={`${fx}-${p.name}`} className="fx-param__label">
            {p.name}
            <span className="fx-param__value">{values[p.name]}</span>
          </label>
          <select
            id={`${fx}-${p.name}`}
            value={String(values[p.name])}
            onChange={(e) => updateValue(p.name, e.target.value)}
          >
            {p.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      );
    }
    // continuous + structural — both surface as a numeric slider.
    const min = p.min ?? 0;
    const max = p.max ?? 1;
    const step = (max - min) / 200;
    const v = typeof values[p.name] === 'number' ? values[p.name] as number : Number(p.default);
    return (
      <div className="fx-param" key={p.name}>
        <label htmlFor={`${fx}-${p.name}`} className="fx-param__label">
          {p.name}
          <span className="fx-param__value">
            {v.toFixed(2)}{p.unit ? p.unit : ''}
          </span>
        </label>
        <input
          id={`${fx}-${p.name}`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={v}
          onChange={(e) => updateValue(p.name, Number(e.target.value))}
        />
      </div>
    );
  };

  return (
    <section className={`fx-card ${bypass ? 'fx-card--bypass' : ''}`}>
      <header className="fx-card__header">
        <span className="fx-card__title">{FX_LABELS[fx]}</span>
        <button
          type="button"
          className={`fx-card__bypass ${bypass ? 'fx-card__bypass--off' : 'fx-card__bypass--on'}`}
          onClick={() => setBypass((b) => !b)}
          aria-pressed={!bypass}
        >
          {bypass ? 'OFF' : 'ON'}
        </button>
      </header>
      <div className="fx-card__params">
        {module.params.map(renderParam)}
      </div>
    </section>
  );
}

export function FxControls({ bus }: Props) {
  return (
    <section className="card" aria-label="FX controls">
      <h3 className="card__title">FX</h3>
      <div className="fx-list">
        {FX_ORDER.map((fx) => (
          <FxCard key={fx} fx={fx} module={bus.effects[fx]} bus={bus} />
        ))}
      </div>
    </section>
  );
}
