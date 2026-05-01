// Machine barrel + unified dispatch.
//
// `triggerMachine(machineId, t)` is the single fire-and-forget entry
// point for all instrument machines. New machines register here so
// adding one is purely additive — no changes to QanunInstrument or
// callers beyond passing a different `machineId`.

import { triggerQanun, triggerQanunSustained, type ADSR, type MachineHandle } from '../qanun-machine';
import { triggerVaporPluck, triggerVaporPluckSustained } from './vapor-pluck';
import { triggerSynthwaveSaw, triggerSynthwaveSawSustained } from './synthwave-saw';
import { triggerDreamPad, triggerDreamPadSustained } from './dream-pad';
import type { ParamSpec } from '../../_core/audio';
import type {
  FilterConfig,
  FilterEnv,
  LfoConfig,
} from './_machine-config';

export { triggerVaporPluck } from './vapor-pluck';
export { triggerSynthwaveSaw } from './synthwave-saw';
export { triggerDreamPad } from './dream-pad';
export type { MachineHandle, ADSR } from '../qanun-machine';
export type {
  FilterConfig,
  FilterEnv,
  LfoConfig,
  LfoDest,
  OscType,
  FilterType,
} from './_machine-config';
export { DEFAULT_LFO } from './_machine-config';
export type { ParamSpec } from '../../_core/audio';

export type MachineId = 'qanun' | 'vapor-pluck' | 'synthwave-saw' | 'dream-pad';

/** Machine-specific parameter values, keyed by ParamSpec.name. */
export type MachineParamValues = Record<string, number | string>;

/** Common trigger signature shared across all machines. Per-machine
 *  modules may ignore params they don't use (e.g. body for synthwave). */
export interface MachineTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  frequencyHz: number;
  velocity?: number;
  time?: number;
  brightness?: number;
  decay?: number;
  body?: number;
  filter?: FilterConfig;
  filterEnv?: FilterEnv;
  lfo1?: LfoConfig;
  lfo2?: LfoConfig;
  /** Octave offset (-2..+2). Multiplies frequencyHz by 2^octaveOffset. */
  octaveOffset?: number;
  /** Machine-specific params keyed by ParamSpec.name from MACHINE_PARAMS. */
  params?: MachineParamValues;
}

export interface MachineMeta {
  id: MachineId;
  label: string;
}

export const MACHINES: MachineMeta[] = [
  { id: 'qanun',         label: 'Qanun' },
  { id: 'vapor-pluck',   label: 'Vapor Pluck' },
  { id: 'synthwave-saw', label: 'Synthwave' },
  { id: 'dream-pad',     label: 'Dream Pad' },
];

/** Per-machine extra params (the "make each machine special" layer).
 *  OscModule reads from this map to render machine-specific knobs.
 *  Each machine reads its own values from the corresponding key on
 *  MachineTrigger.params (a Record<string, number | string>). */
export const MACHINE_PARAMS: Record<MachineId, readonly ParamSpec[]> = {
  'qanun': [
    { name: 'pluck',     kind: 'continuous', min: 0, max: 1, default: 0.5, unit: '' },
    { name: 'sympathy',  kind: 'continuous', min: 0, max: 1, default: 0.3, unit: '' },
  ],
  'vapor-pluck': [
    { name: 'damping',   kind: 'continuous', min: 0, max: 1, default: 0.5, unit: '' },
    { name: 'noise',     kind: 'continuous', min: 0, max: 1, default: 0.2, unit: '' },
  ],
  'synthwave-saw': [
    { name: 'unison',    kind: 'discrete',   options: ['1','3','5','7'], default: '3', unit: 'voices' },
    { name: 'detune',    kind: 'continuous', min: 0, max: 30, default: 8, unit: '¢' },
    { name: 'sub',       kind: 'continuous', min: 0, max: 1, default: 0.3, unit: '' },
  ],
  'dream-pad': [
    { name: 'detune',    kind: 'continuous', min: 0, max: 40, default: 12, unit: '¢' },
    { name: 'chorus',    kind: 'continuous', min: 0, max: 1, default: 0.4, unit: '' },
  ],
};

function applyOctave(t: MachineTrigger): MachineTrigger {
  const off = t.octaveOffset ?? 0;
  if (off === 0) return t;
  return { ...t, frequencyHz: t.frequencyHz * Math.pow(2, off) };
}

export function triggerMachine(machineId: MachineId, t: MachineTrigger & { adsr?: ADSR }): void {
  const tt = applyOctave(t);
  switch (machineId) {
    case 'qanun':         triggerQanun(tt); return;
    case 'vapor-pluck':   triggerVaporPluck(tt); return;
    case 'synthwave-saw': triggerSynthwaveSaw(tt); return;
    case 'dream-pad':     triggerDreamPad(tt); return;
    default: {
      const _exhaustive: never = machineId;
      throw new Error(`Unknown machineId: ${String(_exhaustive)}`);
    }
  }
}

/** Sustained dispatch — every machine supports a release handle and
 *  live setFrequency for carpma slides. */
export function triggerMachineSustained(
  machineId: MachineId,
  t: MachineTrigger & { adsr?: ADSR },
): MachineHandle {
  const tt = applyOctave(t);
  switch (machineId) {
    case 'qanun':         return triggerQanunSustained(tt);
    case 'vapor-pluck':   return triggerVaporPluckSustained(tt);
    case 'synthwave-saw': return triggerSynthwaveSawSustained(tt);
    case 'dream-pad':     return triggerDreamPadSustained(tt);
    default: {
      const _exhaustive: never = machineId;
      throw new Error(`Unknown machineId: ${String(_exhaustive)}`);
    }
  }
}
