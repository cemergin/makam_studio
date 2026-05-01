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

export type MachineId = 'qanun' | 'vapor-pluck' | 'synthwave-saw' | 'dream-pad';

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

export function triggerMachine(machineId: MachineId, t: MachineTrigger & { adsr?: ADSR }): void {
  switch (machineId) {
    case 'qanun':
      triggerQanun(t);
      return;
    case 'vapor-pluck':
      triggerVaporPluck(t);
      return;
    case 'synthwave-saw':
      triggerSynthwaveSaw(t);
      return;
    case 'dream-pad':
      triggerDreamPad(t);
      return;
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
  switch (machineId) {
    case 'qanun':         return triggerQanunSustained(t);
    case 'vapor-pluck':   return triggerVaporPluckSustained(t);
    case 'synthwave-saw': return triggerSynthwaveSawSustained(t);
    case 'dream-pad':     return triggerDreamPadSustained(t);
    default: {
      const _exhaustive: never = machineId;
      throw new Error(`Unknown machineId: ${String(_exhaustive)}`);
    }
  }
}
