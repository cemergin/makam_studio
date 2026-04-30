// Voice barrel + unified dispatch.
//
// `triggerVoice(voiceId, t)` is the single fire-and-forget entry point for
// all instrument voices. New voices register here so adding one is
// purely additive — no changes to QanunInstrument or callers beyond
// passing a different `voiceId`.

import { triggerQanun, triggerQanunSustained, type ADSR, type VoiceHandle } from '../qanun-voice';
import { triggerVaporPluck, triggerVaporPluckSustained } from './vapor-pluck';
import { triggerSynthwaveSaw, triggerSynthwaveSawSustained } from './synthwave-saw';
import { triggerDreamPad, triggerDreamPadSustained } from './dream-pad';

export { triggerVaporPluck } from './vapor-pluck';
export { triggerSynthwaveSaw } from './synthwave-saw';
export { triggerDreamPad } from './dream-pad';
export type { VoiceHandle, ADSR } from '../qanun-voice';

export type VoiceId = 'qanun' | 'vapor-pluck' | 'synthwave-saw' | 'dream-pad';

/** Common trigger signature shared across all voices. Per-voice modules
 *  may ignore params they don't use (e.g. body for synthwave-saw). */
export interface VoiceTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  frequencyHz: number;
  velocity?: number;
  time?: number;
  brightness?: number;
  decay?: number;
  body?: number;
}

export interface VoiceMeta {
  id: VoiceId;
  label: string;
}

export const VOICES: VoiceMeta[] = [
  { id: 'qanun',         label: 'Qanun' },
  { id: 'vapor-pluck',   label: 'Vapor Pluck' },
  { id: 'synthwave-saw', label: 'Synthwave' },
  { id: 'dream-pad',     label: 'Dream Pad' },
];

export function triggerVoice(voiceId: VoiceId, t: VoiceTrigger & { adsr?: ADSR }): void {
  switch (voiceId) {
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
      const _exhaustive: never = voiceId;
      throw new Error(`Unknown voiceId: ${String(_exhaustive)}`);
    }
  }
}

/** Sustained dispatch — every voice now supports a release handle and
 *  live setFrequency for carpma slides. */
export function triggerVoiceSustained(
  voiceId: VoiceId,
  t: VoiceTrigger & { adsr?: ADSR },
): VoiceHandle {
  switch (voiceId) {
    case 'qanun':         return triggerQanunSustained(t);
    case 'vapor-pluck':   return triggerVaporPluckSustained(t);
    case 'synthwave-saw': return triggerSynthwaveSawSustained(t);
    case 'dream-pad':     return triggerDreamPadSustained(t);
    default: {
      const _exhaustive: never = voiceId;
      throw new Error(`Unknown voiceId: ${String(_exhaustive)}`);
    }
  }
}
