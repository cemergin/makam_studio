// app/src/synth/modules/OscModule.tsx
//
// First module in the rack. Owns:
//   - machine selector (qanun | vapor-pluck | synthwave-saw | dream-pad)
//   - octave knob (-2..+2)
//   - brightness knob
//   - body knob
//   - machine-specific knobs auto-rendered from MACHINE_PARAMS[machineId]

import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import { MACHINES, MACHINE_PARAMS, type MachineId, type MachineParamValues, type ParamSpec } from '../../audio/machines';

interface Props {
  machineId: MachineId;
  octave: number;
  brightness: number;
  body: number;
  machineParams: MachineParamValues;
  voiceMode: 'poly' | 'legato';
  glideMs: number;
  modulatedPitch?: boolean;
  onMachineId: (id: MachineId) => void;
  onOctave: (v: number) => void;
  onBrightness: (v: number) => void;
  onBody: (v: number) => void;
  onMachineParam: (name: string, value: number | string) => void;
  onVoiceMode: (m: 'poly' | 'legato') => void;
  onGlideMs: (ms: number) => void;
}

export function OscModule({
  machineId, octave, brightness, body, machineParams,
  voiceMode, glideMs,
  modulatedPitch = false,
  onMachineId, onOctave, onBrightness, onBody, onMachineParam,
  onVoiceMode, onGlideMs,
}: Props) {
  const renderMachineParam = (p: ParamSpec) => {
    if (p.kind === 'discrete' && p.options) {
      return (
        <label className="osc-module__select" key={p.name}>
          <span>{p.name}</span>
          <select
            value={String(machineParams[p.name] ?? p.default)}
            onChange={(e) => onMachineParam(p.name, e.target.value)}
          >
            {p.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      );
    }
    const v = typeof machineParams[p.name] === 'number'
      ? (machineParams[p.name] as number)
      : Number(p.default);
    const min = p.min ?? 0, max = p.max ?? 1;
    return (
      <Knob
        key={p.name}
        label={p.name}
        value={v}
        min={min}
        max={max}
        defaultValue={Number(p.default)}
        unit={p.unit ?? ''}
        onChange={(nv) => onMachineParam(p.name, nv)}
      />
    );
  };

  return (
    <ConsoleModule title="OSC">
      <div className="console-module__row">
        <label className="osc-module__select">
          <span>machine</span>
          <select
            value={machineId}
            onChange={(e) => onMachineId(e.target.value as MachineId)}
          >
            {MACHINES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <label className="osc-module__select">
          <span>voice</span>
          <select
            value={voiceMode}
            onChange={(e) => onVoiceMode(e.target.value as 'poly' | 'legato')}
          >
            <option value="poly">poly</option>
            <option value="legato">legato</option>
          </select>
        </label>
        <Knob label="octave"     value={octave}     min={-2} max={2} step={1} defaultValue={0}   onChange={onOctave}     modulated={modulatedPitch} />
        <Knob label="brightness" value={brightness} min={0}  max={1}        defaultValue={0.6} onChange={onBrightness} />
        <Knob label="body"       value={body}       min={0}  max={1}        defaultValue={0.3} onChange={onBody}       />
        {voiceMode === 'legato' && (
          <Knob
            label="glide"
            unit="ms"
            value={glideMs}
            min={5}
            max={300}
            log
            defaultValue={60}
            format={(v) => `${Math.round(v)}ms`}
            onChange={onGlideMs}
          />
        )}
      </div>
      {MACHINE_PARAMS[machineId].length > 0 && (
        <div className="console-module__row">
          {MACHINE_PARAMS[machineId].map(renderMachineParam)}
        </div>
      )}
    </ConsoleModule>
  );
}
