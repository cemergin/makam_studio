// Master FX bus — voices in, master out.
//
// Topology (CRITICAL — no feedback loops at the master-bus level):
//
//                                       parallel mode (default)
//   busInput → [filter] → [overdrive] → preFx
//                                          ├─→ direct ─────────────────────────────→ masterSum
//                                          ├─→ preToReverb → reverb.in → reverb.out ─→ masterSum
//                                          └─→ preToDelay  → delay.in  → delay.out ─┬→ masterSum
//                                                                                    └─(series only)→ reverb.in → reverb.out → masterSum
//
// Two send-routing modes:
//   - 'parallel' : reverb + delay tap preFx independently; both return to masterSum.
//   - 'series'   : preFx → delay → reverb → masterSum (delay feeds reverb).
//                  preFx does NOT tap reverb directly in series mode.
//
// Why split preFx from masterSum: the OLD topology routed reverb.out
// and delay.out BACK into masterMix, which itself fed reverb/delay's
// inputs. That's a loop at the bus level: every pass through the
// convolver re-entered the convolver, and the master-bus gain grew
// unbounded the moment a wet slider moved past 0. Almost blew the
// user's ears out — DO NOT REVERT to mixing returns into the same
// node that feeds the sends.
//
// The DynamicsCompressorNode at the tail acts as a brick-wall limiter
// (threshold -3 dBFS, ratio 20:1, fast attack) so any remaining peaks
// — accumulating plucks, K-S near-self-oscillation, biquad transients
// — are caught before they hit the speakers.

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
  /** Plug voices into here. */
  input: AudioNode;
  /** Per-effect ControllableModule for inspecting param schema. */
  effects: Record<FxKey, ControllableModule>;
  /** Set a param on a named effect. */
  setFxParam(fx: FxKey, name: string, value: number | string): void;
  /** Bypass = true mutes the effect's contribution. */
  setFxBypass(fx: FxKey, bypass: boolean): void;
  /** Send routing — parallel (default) or series (delay → reverb). */
  setRoutingMode(mode: RoutingMode): void;
  /** Set master output volume 0..1. */
  setMasterVolume(v: number): void;
  /** Subscribe to the analyser for visualisation. */
  analyser: AnalyserNode;
  /** Tear down all nodes. */
  dispose(): void;
}

export function createMasterBus(ctx: AudioContext): MasterBus {
  // ---- Effect modules with conservative defaults ------------------
  const filter = createFilter(ctx, { mode: 'lp', cutoff: 8000, q: 0.7, mix: 1.0 });
  const overdrive = createOverdrive(ctx, { drive: 0.0, tone: 5000, mix: 0.0 });
  const reverb = createReverb(ctx, { wet: 0.0, size: 2.0, decay: 2.5 });
  const delay = createDelayFx(ctx, { wet: 0.0, time: 0.25, feedback: 0.3 });

  // ---- Series inserts ---------------------------------------------
  const busInput = ctx.createGain();

  // filter insert: wet/dry pair, mutually exclusive (sums to 1.0)
  const filterFxIn = ctx.createGain();
  const filterFxOut = ctx.createGain();
  filterFxIn.gain.value = 1;
  const filterDry = ctx.createGain();
  filterDry.gain.value = 0;
  busInput.connect(filterFxIn);
  if (filter.input) filterFxIn.connect(filter.input);
  if (filter.output) filter.output.connect(filterFxOut);
  busInput.connect(filterDry);
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

  const preFx = ctx.createGain();
  odFxOut.connect(preFx);
  odDry.connect(preFx);

  // ---- Master sum bus ---------------------------------------------
  const masterSum = ctx.createGain();

  // Always-on dry path
  const directGain = ctx.createGain();
  directGain.gain.value = 1;
  preFx.connect(directGain);
  directGain.connect(masterSum);

  // Six routing gains. The tuple of (routingMode, reverbBypass,
  // delayBypass) determines all six values.
  //
  //   preToReverb   : preFx → reverb.in. ON in parallel + reverb-on.
  //   preToDelay    : preFx → delay.in. ON when delay-on.
  //   delayToReverb : delay.out → reverb.in. ON in series + reverb-on.
  //   delayToMaster : delay.out → masterSum. ON when delay-on.
  //   reverbToMaster: reverb.out → masterSum. ON when reverb-on.
  const preToReverb = ctx.createGain();
  preToReverb.gain.value = 1; // parallel default
  preFx.connect(preToReverb);
  if (reverb.input) preToReverb.connect(reverb.input);

  const preToDelay = ctx.createGain();
  preToDelay.gain.value = 1;
  preFx.connect(preToDelay);
  if (delay.input) preToDelay.connect(delay.input);

  const delayToReverb = ctx.createGain();
  delayToReverb.gain.value = 0; // off in parallel
  if (delay.output) delay.output.connect(delayToReverb);
  if (reverb.input) delayToReverb.connect(reverb.input);

  const delayToMaster = ctx.createGain();
  delayToMaster.gain.value = 1;
  if (delay.output) delay.output.connect(delayToMaster);
  delayToMaster.connect(masterSum);

  const reverbToMaster = ctx.createGain();
  reverbToMaster.gain.value = 1;
  if (reverb.output) reverb.output.connect(reverbToMaster);
  reverbToMaster.connect(masterSum);

  // User-facing state — recompute all six gains from this triple.
  let routingMode: RoutingMode = 'parallel';
  let reverbBypass = false;
  let delayBypass = false;

  function recomputeRouting() {
    const reverbOn = !reverbBypass;
    const delayOn = !delayBypass;
    if (routingMode === 'parallel') {
      preToReverb.gain.value = reverbOn ? 1 : 0;
      preToDelay.gain.value = delayOn ? 1 : 0;
      delayToReverb.gain.value = 0;
      delayToMaster.gain.value = delayOn ? 1 : 0;
      reverbToMaster.gain.value = reverbOn ? 1 : 0;
    } else {
      // series — preFx → delay → reverb → master
      preToReverb.gain.value = 0;
      preToDelay.gain.value = delayOn ? 1 : 0;
      delayToReverb.gain.value = (delayOn && reverbOn) ? 1 : 0;
      delayToMaster.gain.value = delayOn ? 1 : 0;
      reverbToMaster.gain.value = reverbOn ? 1 : 0;
    }
  }
  recomputeRouting();

  // ---- Master volume + limiter + analyser + destination ------------
  const masterVolume = ctx.createGain();
  masterVolume.gain.value = 0.3;
  masterSum.connect(masterVolume);

  // Brick-wall limiter — final safety net. -3 dBFS / 20:1 / 3ms attack.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;
  limiter.knee.value = 0;
  masterVolume.connect(limiter);

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  limiter.connect(analyser);
  analyser.connect(ctx.destination);

  const effects: Record<FxKey, ControllableModule> = {
    filter, overdrive, reverb, delay,
  };

  return {
    input: busInput,
    effects,
    analyser,
    setFxParam(fx, name, value) {
      effects[fx]?.set(name, value);
    },
    setFxBypass(fx, bypass) {
      if (fx === 'filter') {
        filterFxIn.gain.value = bypass ? 0 : 1;
        filterDry.gain.value = bypass ? 1 : 0;
      } else if (fx === 'overdrive') {
        odFxIn.gain.value = bypass ? 0 : 1;
        odDry.gain.value = bypass ? 1 : 0;
      } else if (fx === 'reverb') {
        reverbBypass = bypass;
        recomputeRouting();
      } else if (fx === 'delay') {
        delayBypass = bypass;
        recomputeRouting();
      }
    },
    setRoutingMode(mode) {
      routingMode = mode;
      recomputeRouting();
    },
    setMasterVolume(v) {
      masterVolume.gain.value = Math.max(0, Math.min(1, v));
    },
    dispose() {
      const nodes = [
        busInput, filterFxIn, filterFxOut, filterDry, afterFilter,
        odFxIn, odFxOut, odDry, preFx, masterSum,
        directGain, preToReverb, preToDelay,
        delayToReverb, delayToMaster, reverbToMaster,
        masterVolume, limiter, analyser,
      ];
      for (const n of nodes) {
        try { n.disconnect(); } catch { /* idempotent */ }
      }
      filter.dispose();
      overdrive.dispose();
      reverb.dispose();
      delay.dispose();
    },
  };
}
