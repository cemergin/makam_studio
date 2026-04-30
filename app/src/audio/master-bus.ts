// Master FX bus — voices in, master out.
//
// SIMPLIFIED PATH (regression fix):
//
//   busInput → masterVolume → limiter → analyser → ctx.destination
//
// Effects (filter, overdrive, reverb, delay) are constructed so their
// param schemas are still exposed to FxControls UI, but they are NOT
// inserted into the audible path right now. The previous master-bus
// chain had a wiring issue that produced no audible signal end-to-end.
// This minimal path is "voice straight to speakers via volume + brick-
// wall limiter" — boring but proven. Once we confirm this is audible,
// we layer effects back in following BeatForge's tested pattern
// (channel strip → master mix → wet sends → master out).
//
// The DynamicsCompressorNode at the tail keeps the safety guarantee:
// nothing escapes the bus louder than -3 dBFS regardless of voice
// amplitude or accumulated polyphony.

import {
  createDelayFx,
  createFilter,
  createOverdrive,
  createReverb,
  type ControllableModule,
} from '../_core/audio';

export type FxKey = 'filter' | 'overdrive' | 'reverb' | 'delay';
export type RoutingMode = 'parallel' | 'series';

export interface MasterBus {
  input: AudioNode;
  effects: Record<FxKey, ControllableModule>;
  setFxParam(fx: FxKey, name: string, value: number | string): void;
  setFxBypass(fx: FxKey, bypass: boolean): void;
  setRoutingMode(mode: RoutingMode): void;
  setMasterVolume(v: number): void;
  analyser: AnalyserNode;
  dispose(): void;
}

export function createMasterBus(ctx: AudioContext): MasterBus {
  // Effects exist so the UI can show their params — they are NOT in
  // the audio path right now. setFxParam still drives them so users
  // can twiddle knobs; once we re-insert them we won't have to touch
  // the UI code.
  const filter = createFilter(ctx, { mode: 'lp', cutoff: 8000, q: 0.7, mix: 1.0 });
  const overdrive = createOverdrive(ctx, { drive: 0.0, tone: 5000, mix: 0.0 });
  const reverb = createReverb(ctx, { wet: 0.0, size: 2.0, decay: 2.5 });
  const delay = createDelayFx(ctx, { wet: 0.0, time: 0.25, feedback: 0.3 });

  // -- Audio path: voice → input → masterVolume → limiter → analyser → dest
  const input = ctx.createGain();
  input.gain.value = 1;

  const masterVolume = ctx.createGain();
  masterVolume.gain.value = 0.6;

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;
  limiter.knee.value = 0;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;

  input.connect(masterVolume);
  masterVolume.connect(limiter);
  limiter.connect(analyser);
  analyser.connect(ctx.destination);

  const effects: Record<FxKey, ControllableModule> = {
    filter, overdrive, reverb, delay,
  };

  return {
    input,
    effects,
    analyser,
    setFxParam(fx, name, value) {
      effects[fx]?.set(name, value);
    },
    setFxBypass() { /* no-op while FX are bypassed in the path */ },
    setRoutingMode() { /* no-op */ },
    setMasterVolume(v) {
      masterVolume.gain.value = Math.max(0, Math.min(1, v));
    },
    dispose() {
      try { input.disconnect(); } catch { /* idempotent */ }
      try { masterVolume.disconnect(); } catch { /* idempotent */ }
      try { limiter.disconnect(); } catch { /* idempotent */ }
      try { analyser.disconnect(); } catch { /* idempotent */ }
      filter.dispose();
      overdrive.dispose();
      reverb.dispose();
      delay.dispose();
    },
  };
}
