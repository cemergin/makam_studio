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

function FxBlock({ fx, module, bus }: { fx: FxKey; module: ControllableModule; bus: MasterBus }) {
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
    if (p.kind === 'discrete' && p.options) return null; // FX have continuous-only in practice; degrade gracefully
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
        onChange={(nv) => updateValue(p.name, nv)}
      />
    );
  };

  return (
    <div className={`fx-block ${bypass ? 'fx-block--off' : ''}`}>
      <header className="fx-block__head">
        <span>{FX_LABELS[fx]}</span>
        <button
          type="button"
          className="fx-block__bypass"
          onClick={toggleBypass}
          aria-pressed={!bypass}
        >
          {bypass ? 'OFF' : 'ON'}
        </button>
      </header>
      <div className="fx-block__params">
        {module.params.map(renderParam)}
      </div>
    </div>
  );
}

export function FxModule({ bus }: Props) {
  return (
    <ConsoleModule title="MASTER FX">
      <div className="fx-module">
        {FX_LIST.map((fx) => (
          <FxBlock key={fx} fx={fx} module={bus.effects[fx]} bus={bus} />
        ))}
      </div>
    </ConsoleModule>
  );
}
