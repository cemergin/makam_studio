// app/src/audio/master-bus.ts
//
// Master FX bus — voices in, master out.
//
// Topology (no feedback paths possible):
//
//   busInput → filter.input → overdrive.input ─► insertOut
//                                                   │
//                              ┌────────────────────┼─────────────────┐
//                              │                    │                 │
//                              ▼                    ▼                 ▼
//                       reverb.input         delay.input          masterMix
//                              │                    │                 ▲
//                       reverb.output        delay.output             │
//                              │                    │                 │
//                              └────────────────────┴─────────────────┘
//                                                   │
//                                              masterMix (one-way return)
//                                                   │
//                                                   ▼
//                                              masterVolume
//                                                   │
//                                                   ▼
//                                              limiter (-3 dBFS, 20:1)
//                                                   │
//                                                   ▼
//                                              analyser
//                                                   │
//                                                   ▼
//                                            ctx.destination
//
// Invariants (DO NOT BREAK):
//
//   1. reverb.output and delay.output ONLY connect to masterMix.
//   2. masterMix is downstream-only — nothing in masterVolume → limiter
//      → analyser → destination ever loops back into a send.
//   3. Filter + overdrive inserts are always in path; bypass = mix → 0.
//   4. Reverb + delay sends are always wired to masterMix; bypass = wet → 0.
//   5. Routing modes are not supported in v1 (parallel only).

import {
  createDelayFx,
  createFilter,
  createOverdrive,
  createReverb,
  type ControllableModule,
} from '../_core/audio';

export type FxKey = 'filter' | 'overdrive' | 'reverb' | 'delay';

export interface MasterBus {
  input: AudioNode;
  effects: Record<FxKey, ControllableModule>;
  setFxParam(fx: FxKey, name: string, value: number | string): void;
  /** Bypass = set the module's internal mix (filter/overdrive) or wet
   *  (reverb/delay) to 0. No graph mutation. */
  setFxBypass(fx: FxKey, bypass: boolean): void;
  setMasterVolume(v: number): void;
  analyser: AnalyserNode;
  dispose(): void;
}

export function createMasterBus(ctx: AudioContext): MasterBus {
  const filter    = createFilter(ctx,    { mode: 'lp', cutoff: 8000, q: 0.7, mix: 0.0 });
  const overdrive = createOverdrive(ctx, { drive: 0.0, tone: 5000, mix: 0.0 });
  const reverb    = createReverb(ctx,    { wet: 0.0, size: 2.0, decay: 2.5 });
  const delay     = createDelayFx(ctx,   { wet: 0.0, time: 0.25, feedback: 0.3 });

  const input        = ctx.createGain();   input.gain.value = 1;
  const masterMix    = ctx.createGain();   masterMix.gain.value = 1;
  const masterVolume = ctx.createGain();   masterVolume.gain.value = 0.6;

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.ratio.value     = 20;
  limiter.attack.value    = 0.003;
  limiter.release.value   = 0.25;
  limiter.knee.value      = 0;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;

  // Inserts in series: input → filter → overdrive → insertOut
  // Non-null assertions: ControllableModule types input/output as
  // AudioNode | null (allowing pure sources/sinks), but the FX
  // factories used here always return concrete in/out nodes.
  input.connect(filter.input!);
  filter.output!.connect(overdrive.input!);
  // overdrive.output is the "insertOut" tap — branches three ways:
  overdrive.output!.connect(masterMix);     // dry
  overdrive.output!.connect(reverb.input!); // reverb send
  overdrive.output!.connect(delay.input!);  // delay send

  // Send returns — ONE-WAY into masterMix only:
  reverb.output!.connect(masterMix);
  delay.output!.connect(masterMix);

  // Master tail
  masterMix.connect(masterVolume);
  masterVolume.connect(limiter);
  limiter.connect(analyser);
  analyser.connect(ctx.destination);

  const effects: Record<FxKey, ControllableModule> = { filter, overdrive, reverb, delay };

  /** Each module's "off" param + the value it represents when bypassed.
   *  Used by setFxBypass to set/restore. */
  const BYPASS_PARAM: Record<FxKey, string> = {
    filter:    'mix',
    overdrive: 'mix',
    reverb:    'wet',
    delay:     'wet',
  };
  const lastValue: Record<FxKey, number> = {
    filter: 0, overdrive: 0, reverb: 0, delay: 0,
  };
  const bypassed: Record<FxKey, boolean> = {
    filter: true, overdrive: true, reverb: true, delay: true,
  };

  return {
    input,
    effects,
    analyser,
    setFxParam(fx, name, value) {
      effects[fx]?.set(name, value);
      // Track the last user-set bypass-param value so toggling bypass
      // off restores it.
      if (name === BYPASS_PARAM[fx] && typeof value === 'number' && !bypassed[fx]) {
        lastValue[fx] = value;
      }
    },
    setFxBypass(fx, bypass) {
      bypassed[fx] = bypass;
      if (bypass) {
        // Snapshot current bypass-param value, then ramp to 0.
        // (Modules expose their current via .get() in some forks; we
        // remember it via setFxParam interception above.)
        effects[fx]?.set(BYPASS_PARAM[fx], 0);
      } else {
        effects[fx]?.set(BYPASS_PARAM[fx], lastValue[fx] || 0.5);
      }
    },
    setMasterVolume(v) {
      masterVolume.gain.value = Math.max(0, Math.min(1, v));
    },
    dispose() {
      for (const n of [input, masterMix, masterVolume, limiter, analyser]) {
        try { n.disconnect(); } catch { /* idempotent */ }
      }
      filter.dispose();
      overdrive.dispose();
      reverb.dispose();
      delay.dispose();
    },
  };
}
