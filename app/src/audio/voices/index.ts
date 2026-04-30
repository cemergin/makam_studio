// Voice barrel + unified dispatch.
//
// `triggerVoice(voiceId, t)` is the single fire-and-forget entry point for
// all instrument voices. New voices register here so adding one is
// purely additive — no changes to QanunInstrument or callers beyond
// passing a different `voiceId`.

import { triggerQanun } from '../qanun-voice';
import { triggerVaporPluck } from './vapor-pluck';
import { triggerSynthwaveSaw } from './synthwave-saw';
import { triggerDreamPad } from './dream-pad';

export { triggerVaporPluck } from './vapor-pluck';
export { triggerSynthwaveSaw } from './synthwave-saw';
export { triggerDreamPad } from './dream-pad';

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

export function triggerVoice(voiceId: VoiceId, t: VoiceTrigger): void {
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
      // Exhaustiveness check.
      const _exhaustive: never = voiceId;
      throw new Error(`Unknown voiceId: ${String(_exhaustive)}`);
    }
  }
}
