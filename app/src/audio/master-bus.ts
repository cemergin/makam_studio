// Master FX bus — voices in, master out.
//
// Topology (mirrors the playground EffectsPanel pattern):
//
//   busInput → [filter insert] → [overdrive insert] → masterMix
//   masterMix ─┬─→ reverb send ────→ masterMix (parallel)
//              ├─→ delay send ─────→ masterMix (parallel)
//              └─→ analyser → ctx.destination
//
// Inserts process the dry signal in series; reverb + delay act as
// parallel sends from masterMix back into masterMix. Each effect is a
// ControllableModule from the vendored _core/audio/effects, with bypass
// handled by routing through a per-FX gate gain (1.0 = active, 0 = mute).
//
// `setFxParam(fxKey, paramName, value)` dispatches to the underlying
// ControllableModule via .set(). Values for known params come from the
// effect module's `.params` schema.

import {
  createDelayFx,
  createFilter,
  createOverdrive,
  createReverb,
  type ControllableModule,
} from '../_core/audio';

export type FxKey = 'filter' | 'overdrive' | 'reverb' | 'delay';

export interface MasterBus {
  /** Plug voices into here. */
  input: AudioNode;
  /** Per-effect ControllableModule for inspecting param schema. */
  effects: Record<FxKey, ControllableModule>;
  /** Set a param on a named effect. */
  setFxParam(fx: FxKey, name: string, value: number | string): void;
  /** Bypass = true mutes the effect's contribution; reverb + delay
   *  bypass mutes the send. Filter + overdrive bypass routes around. */
  setFxBypass(fx: FxKey, bypass: boolean): void;
  /** Set master output volume 0..1. */
  setMasterVolume(v: number): void;
  /** Tear down all nodes. */
  dispose(): void;
}

export function createMasterBus(ctx: AudioContext): MasterBus {
  // ---- Build effect modules ---------------------------------------
  const filter = createFilter(ctx, { mode: 'lp', cutoff: 8000, q: 0.7, mix: 1.0 });
  const overdrive = createOverdrive(ctx, { drive: 0.0, tone: 5000, mix: 0.0 });
  const reverb = createReverb(ctx, { wet: 0.0, size: 2.0, decay: 2.5 });
  const delay = createDelayFx(ctx, { wet: 0.0, time: 0.25, feedback: 0.35 });

  // ---- Series inserts: filter → overdrive bypass routing ---------
  // We model bypass with a pair of gains per insert: insertGate gates
  // the FX path; bypassGate gates a parallel dry-around path. They're
  // mutually exclusive (one is 1, the other 0).
  const busInput = ctx.createGain(); // entry point for voices

  // filter insert
  const filterFxIn = ctx.createGain();
  const filterFxOut = ctx.createGain();
  filterFxIn.gain.value = 1; // active by default
  const filterDry = ctx.createGain();
  filterDry.gain.value = 0; // bypass-around path
  busInput.connect(filterFxIn);
  if (filter.input) filterFxIn.connect(filter.input);
  if (filter.output) filter.output.connect(filterFxOut);
  busInput.connect(filterDry);
  // join into next stage
  const afterFilter = ctx.createGain();
  filterFxOut.connect(afterFilter);
  filterDry.connect(afterFilter);

  // overdrive insert
  const odFxIn = ctx.createGain();
  const odFxOut = ctx.createGain();
  odFxIn.gain.value = 1;
  const odDry = ctx.createGain();
  odDry.gain.value = 0;
  afterFilter.connect(odFxIn);
  if (overdrive.input) odFxIn.connect(overdrive.input);
  if (overdrive.output) overdrive.output.connect(odFxOut);
  afterFilter.connect(odDry);

  const masterMix = ctx.createGain();
  odFxOut.connect(masterMix);
  odDry.connect(masterMix);

  // ---- Parallel sends: reverb + delay ------------------------------
  const reverbSend = ctx.createGain();
  reverbSend.gain.value = 1; // bypass uses module wet=0; gate stays 1
  masterMix.connect(reverbSend);
  if (reverb.input) reverbSend.connect(reverb.input);
  if (reverb.output) reverb.output.connect(masterMix);

  const delaySend = ctx.createGain();
  delaySend.gain.value = 1;
  masterMix.connect(delaySend);
  if (delay.input) delaySend.connect(delay.input);
  if (delay.output) delay.output.connect(masterMix);

  // ---- Master volume + analyser + destination ----------------------
  const masterVolume = ctx.createGain();
  masterVolume.gain.value = 0.6;
  masterMix.connect(masterVolume);

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  masterVolume.connect(analyser);
  analyser.connect(ctx.destination);

  const effects: Record<FxKey, ControllableModule> = {
    filter,
    overdrive,
    reverb,
    delay,
  };

  return {
    input: busInput,
    effects,
    setFxParam(fx, name, value) {
      const mod = effects[fx];
      if (!mod) return;
      mod.set(name, value);
    },
    setFxBypass(fx, bypass) {
      if (fx === 'filter') {
        // bypass=true → route around
        filterFxIn.gain.value = bypass ? 0 : 1;
        filterDry.gain.value = bypass ? 1 : 0;
      } else if (fx === 'overdrive') {
        odFxIn.gain.value = bypass ? 0 : 1;
        odDry.gain.value = bypass ? 1 : 0;
      } else if (fx === 'reverb') {
        // reverb is a send — mute the send gain
        reverbSend.gain.value = bypass ? 0 : 1;
      } else if (fx === 'delay') {
        delaySend.gain.value = bypass ? 0 : 1;
      }
    },
    setMasterVolume(v) {
      masterVolume.gain.value = Math.max(0, Math.min(1, v));
    },
    dispose() {
      try { busInput.disconnect(); } catch { /* idempotent */ }
      try { filterFxIn.disconnect(); } catch { /* idempotent */ }
      try { filterFxOut.disconnect(); } catch { /* idempotent */ }
      try { filterDry.disconnect(); } catch { /* idempotent */ }
      try { afterFilter.disconnect(); } catch { /* idempotent */ }
      try { odFxIn.disconnect(); } catch { /* idempotent */ }
      try { odFxOut.disconnect(); } catch { /* idempotent */ }
      try { odDry.disconnect(); } catch { /* idempotent */ }
      try { masterMix.disconnect(); } catch { /* idempotent */ }
      try { reverbSend.disconnect(); } catch { /* idempotent */ }
      try { delaySend.disconnect(); } catch { /* idempotent */ }
      try { masterVolume.disconnect(); } catch { /* idempotent */ }
      try { analyser.disconnect(); } catch { /* idempotent */ }
      filter.dispose();
      overdrive.dispose();
      reverb.dispose();
      delay.dispose();
    },
  };
}
