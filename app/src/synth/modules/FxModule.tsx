// app/src/synth/modules/FxModule.tsx
//
// Master-bus FX. Auto-renders each effect's params from its
// ControllableModule.params schema. Bypass = mix/wet → 0 (handled
// in master-bus.setFxBypass).

import { useState } from 'react';
import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import type { ControllableModule, ParamSpec } from '../../_core/audio';
import type { FxKey, MasterBus } from '../../audio/master-bus';

interface Props {
  bus: MasterBus;
}

const FX_LIST: FxKey[] = ['filter', 'overdrive', 'reverb', 'delay'];
const FX_LABELS: Record<FxKey, string> = {
  filter: 'flt', overdrive: 'od', reverb: 'rev', delay: 'dly',
};

function FxRow({ fx, module, bus }: { fx: FxKey; module: ControllableModule; bus: MasterBus }) {
  const [bypass, setBypass] = useState(true);
  const [values, setValues] = useState<Record<string, number | string>>(() => {
    const init: Record<string, number | string> = {};
    for (const p of module.params) init[p.name] = p.default;
    return init;
  });

  const updateValue = (name: string, value: number | string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    bus.setFxParam(fx, name, value);
  };
  const toggleBypass = () => {
    const next = !bypass;
    setBypass(next);
    bus.setFxBypass(fx, next);
  };

  const renderParam = (p: ParamSpec) => {
    if (p.kind === 'discrete' && p.options) return null;
    const min = p.min ?? 0, max = p.max ?? 1;
    const v = typeof values[p.name] === 'number' ? values[p.name] as number : Number(p.default);
    return (
      <Knob
        key={p.name}
        label={p.name}
        value={v}
        min={min}
        max={max}
        defaultValue={Number(p.default)}
        unit={p.unit ?? ''}
        size={36}
        onChange={(nv) => updateValue(p.name, nv)}
      />
    );
  };

  return (
    <div className={`fx-row ${bypass ? 'fx-row--off' : ''}`}>
      <button
        type="button"
        className={`fx-row__bypass ${bypass ? '' : 'fx-row__bypass--on'}`}
        onClick={toggleBypass}
        aria-pressed={!bypass}
        title={bypass ? 'Off (click to enable)' : 'On (click to bypass)'}
      >
        <span className="fx-row__lamp" />
      </button>
      <span className="fx-row__name">{FX_LABELS[fx]}</span>
      <div className="fx-row__params">
        {module.params.map(renderParam)}
      </div>
    </div>
  );
}

export function FxModule({ bus }: Props) {
  return (
    <ConsoleModule title="MASTER FX">
      <div className="fx-stack">
        {FX_LIST.map((fx) => (
          <FxRow key={fx} fx={fx} module={bus.effects[fx]} bus={bus} />
        ))}
      </div>
    </ConsoleModule>
  );
}
