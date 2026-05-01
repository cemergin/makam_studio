// Vapor Pluck — chorused saw with slow lowpass sweep + cassette flutter detune.
//
// Reference flavor: Macintosh Plus *Floral Shoppe*, slowed-down DX7 in chorus
// mode. The character lives in the slow downward filter sweep over ~600ms
// (so each note feels like it's exhaling), and the slight random detune
// per-voice that emulates wow-and-flutter.
//
// Topology (sustained variant):
//   3 saw oscillators (target freq ±3..7¢ random) summed →
//      configurable filter (default LP 1500Hz Q 0.7) →
//      ADSR amp env →
//      output gain (peak v × 0.20)
//   plus optional filter-env modulation + 2 LFOs.
//
// Headroom discipline: peak gain capped at v × 0.20 so accumulating
// polyphony stays well below the master limiter threshold.

import type { ADSR, MachineHandle } from '../qanun-machine';
import { makeMachineHandle, scheduleAttackDecay } from './_envelope';
import {
  attachLfos,
  scheduleFilterEnv,
  type FilterConfig,
  type FilterEnv,
  type LfoConfig,
} from './_machine-config';

export interface VaporPluckTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  frequencyHz: number;
  velocity?: number;
  time?: number;
  brightness?: number; // optional — biases sweep top end
  decay?: number;      // optional — extends total tail length (one-shot only)
  body?: number;       // unused for vapor-pluck (kept for API symmetry)
  adsr?: ADSR;
  filter?: FilterConfig;
  filterEnv?: FilterEnv;
  lfo1?: LfoConfig;
  lfo2?: LfoConfig;
}

export function triggerVaporPluck(t: VaporPluckTrigger): void {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const brightness = Math.max(0, Math.min(1, t.brightness ?? 0.6));
  const decay = Math.max(0, Math.min(1, t.decay ?? 0.5));
  const f = Math.max(20, t.frequencyHz);

  const envDecay = 0.4 + decay * 1.0;
  const sweepDuration = 0.6 + decay * 0.4;
  const stopAt = when + envDecay + 0.2;

  const oscs: OscillatorNode[] = [];
  const sumGain = ctx.createGain();
  sumGain.gain.value = 1 / 3;

  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    const cents = (Math.random() * 8 - 4) + (i - 1) * 4;
    osc.detune.value = cents;
    osc.frequency.value = f;
    osc.connect(sumGain);
    osc.start(when);
    osc.stop(stopAt);
    oscs.push(osc);
  }

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.linearRampToValueAtTime(1.0, when + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, when + envDecay);
  sumGain.connect(env);

  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 3;
  const sweepTop = 3500 + brightness * 1500;
  const sweepBottom = 800;
  bp.frequency.setValueAtTime(sweepTop, when);
  bp.frequency.exponentialRampToValueAtTime(sweepBottom, when + sweepDuration);
  env.connect(bp);

  const chorusSum = ctx.createGain();
  chorusSum.gain.value = 0.5;
  bp.connect(chorusSum);

  const d1 = ctx.createDelay(0.05);
  d1.delayTime.value = 0.009;
  const d2 = ctx.createDelay(0.05);
  d2.delayTime.value = 0.014;
  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.35;
  bp.connect(d1); d1.connect(wetGain); wetGain.connect(chorusSum);
  bp.connect(d2); d2.connect(wetGain);

  const lfo1 = ctx.createOscillator();
  lfo1.frequency.value = 0.7;
  const lfoGain1 = ctx.createGain();
  lfoGain1.gain.value = 0.0008;
  lfo1.connect(lfoGain1).connect(d1.delayTime);
  lfo1.start(when);
  lfo1.stop(stopAt);

  const lfo2 = ctx.createOscillator();
  lfo2.frequency.value = 0.5;
  const lfoGain2 = ctx.createGain();
  lfoGain2.gain.value = 0.0008;
  lfo2.connect(lfoGain2).connect(d2.delayTime);
  lfo2.start(when);
  lfo2.stop(stopAt);

  const outGain = ctx.createGain();
  outGain.gain.value = v * 0.20;
  chorusSum.connect(outGain);
  outGain.connect(dest);

  const stopAtMs = (stopAt + 0.1 - ctx.currentTime) * 1000;
  setTimeout(() => {
    for (const o of oscs) {
      try { o.disconnect(); } catch { /* idempotent */ }
    }
    try { sumGain.disconnect(); } catch { /* idempotent */ }
    try { env.disconnect(); } catch { /* idempotent */ }
    try { bp.disconnect(); } catch { /* idempotent */ }
    try { chorusSum.disconnect(); } catch { /* idempotent */ }
    try { d1.disconnect(); } catch { /* idempotent */ }
    try { d2.disconnect(); } catch { /* idempotent */ }
    try { wetGain.disconnect(); } catch { /* idempotent */ }
    try { lfo1.disconnect(); } catch { /* idempotent */ }
    try { lfo2.disconnect(); } catch { /* idempotent */ }
    try { lfoGain1.disconnect(); } catch { /* idempotent */ }
    try { lfoGain2.disconnect(); } catch { /* idempotent */ }
    try { outGain.disconnect(); } catch { /* idempotent */ }
  }, Math.max(100, stopAtMs + 50));
}

/** Sustained variant — holds at the ADSR sustain level until release().
 *  Configurable filter (default LP 1500Hz Q 0.7) + filter env (downward
 *  sweep flavor by default) + optional LFOs. */
export function triggerVaporPluckSustained(t: VaporPluckTrigger): MachineHandle {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const f = Math.max(20, t.frequencyHz);
  const adsr: ADSR = t.adsr ?? { a: 0.005, d: 0.4, s: 0.5, r: 0.5 };
  const peak = v * 0.20;

  // Defaults: LP 1500Hz, Q 0.7. Env amount 0.6 = warm downward sweep flavor
  // (positive amount → cutoff opens, decays back; works as a tasteful
  // pluck colour for the sustained variant).
  const filterCfg: FilterConfig = t.filter ?? {
    type: 'lp', cutoff: 1500, q: 0.7,
  };
  const filterEnv: FilterEnv = t.filterEnv ?? {
    a: 0.005, d: 0.6, s: 0.0, r: 0.3, amount: 0.6,
  };

  // 3 saws with detune
  const oscs: OscillatorNode[] = [];
  const detunes: AudioParam[] = [];
  const sumGain = ctx.createGain();
  sumGain.gain.value = 1 / 3;
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    const cents = (Math.random() * 8 - 4) + (i - 1) * 4;
    osc.detune.value = cents;
    osc.frequency.value = f;
    osc.connect(sumGain);
    osc.start(when);
    oscs.push(osc);
    detunes.push(osc.detune);
  }

  // Configurable filter (was a static bandpass before).
  const filter = ctx.createBiquadFilter();
  filter.type = filterCfg.type === 'hp' ? 'highpass' : filterCfg.type === 'bp' ? 'bandpass' : 'lowpass';
  filter.frequency.value = filterCfg.cutoff;
  filter.Q.value = filterCfg.q;
  sumGain.connect(filter);

  // ADSR env
  const env = ctx.createGain();
  scheduleAttackDecay(env, peak, adsr, when);
  filter.connect(env);
  env.connect(dest);

  // Filter env on cutoff.
  scheduleFilterEnv(filter, filterCfg.cutoff, filterEnv, when);

  // LFOs.
  const lfos = attachLfos({
    ctx, when,
    pitchTargets: detunes,
    filter,
    baseCutoff: filterCfg.cutoff,
    ampEnv: env,
    ampPeak: peak,
    lfo1: t.lfo1,
    lfo2: t.lfo2,
  });

  const cleanup = () => {
    for (const o of oscs) { try { o.stop(); } catch { /* */ } try { o.disconnect(); } catch { /* */ } }
    try { sumGain.disconnect(); } catch { /* */ }
    try { env.disconnect(); } catch { /* */ }
    try { filter.disconnect(); } catch { /* */ }
    lfos.cleanup();
  };

  const setFrequency = (hz: number, glideMs = 30) => {
    const now = ctx.currentTime;
    const tT = Math.max(0.001, glideMs / 1000);
    const fT = Math.max(20, hz);
    for (const o of oscs) {
      o.frequency.cancelScheduledValues(now);
      o.frequency.setValueAtTime(o.frequency.value, now);
      o.frequency.linearRampToValueAtTime(fT, now + tT);
    }
  };

  return makeMachineHandle(ctx, env, adsr, cleanup, setFrequency);
}
