// Dream Pad — slow-attack ambient pad with formant-flavored color.
//
// Reference flavor: Stars of the Lid, Brian Eno *Music for Airports*.
// Two oscillators (sine + triangle) detuned ±5¢ provide a soft beating
// shimmer; configurable filter colors the timbre; very slow LFOs (the
// breathing) plus optional user-assignable LFOs.
//
// Topology (sustained):
//   2 oscillators (sine + triangle, ±5¢) →
//      configurable filter (default BP 1800 Q 1.5) →
//      slow ADSR amp env →
//      output gain (peak v × 0.15)

import type { ADSR, MachineHandle } from '../qanun-machine';
import { makeMachineHandle, scheduleAttackDecay } from './_envelope';
import {
  attachLfos,
  scheduleFilterEnv,
  type FilterConfig,
  type FilterEnv,
  type LfoConfig,
} from './_machine-config';
import type { MachineParamValues } from './index';

export interface DreamPadTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  frequencyHz: number;
  velocity?: number;
  time?: number;
  brightness?: number; // shifts formant 2 (2400Hz) up/down
  decay?: number;      // extends sustain duration (one-shot only)
  body?: number;       // reserved
  adsr?: ADSR;
  filter?: FilterConfig;
  filterEnv?: FilterEnv;
  lfo1?: LfoConfig;
  lfo2?: LfoConfig;
  octaveOffset?: number;
  params?: MachineParamValues;
}

/** Resolve pad detune/chorus from params with defaults from MACHINE_PARAMS. */
function resolvePadParams(params?: MachineParamValues): {
  detuneCents: number;
  chorusAmt: number;
} {
  const detRaw = params?.detune;
  const detuneCents = typeof detRaw === 'number' && Number.isFinite(detRaw)
    ? Math.max(0, Math.min(40, detRaw))
    : 12;
  const chRaw = params?.chorus;
  const chorusAmt = typeof chRaw === 'number' && Number.isFinite(chRaw)
    ? Math.max(0, Math.min(1, chRaw))
    : 0.4;
  return { detuneCents, chorusAmt };
}

export function triggerDreamPad(t: DreamPadTrigger): void {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const brightness = Math.max(0, Math.min(1, t.brightness ?? 0.5));
  const decay = Math.max(0, Math.min(1, t.decay ?? 0.6));
  const f = Math.max(20, t.frequencyHz);

  const attack = 2.0;
  const decayLen = 4.0 + decay * 4.0;
  const stopAt = when + attack + decayLen + 0.3;

  // params.detune (cents total spread) replaces hardcoded ±5¢.
  // params.chorus scales the breathing tremolo depth below.
  const { detuneCents, chorusAmt } = resolvePadParams(t.params);
  const halfDetune = detuneCents / 2;

  const oscSine = ctx.createOscillator();
  oscSine.type = 'sine';
  oscSine.frequency.value = f;
  oscSine.detune.value = -halfDetune;

  const oscTri = ctx.createOscillator();
  oscTri.type = 'triangle';
  oscTri.frequency.value = f;
  oscTri.detune.value = halfDetune;

  const sumGain = ctx.createGain();
  sumGain.gain.value = 0.5;
  oscSine.connect(sumGain);
  oscTri.connect(sumGain);
  oscSine.start(when);
  oscTri.start(when);
  oscSine.stop(stopAt);
  oscTri.stop(stopAt);

  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.linearRampToValueAtTime(1.0, when + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, when + attack + decayLen);
  sumGain.connect(env);

  const formant1 = ctx.createBiquadFilter();
  formant1.type = 'bandpass';
  formant1.frequency.value = 800;
  formant1.Q.value = 2;

  const formant2 = ctx.createBiquadFilter();
  formant2.type = 'bandpass';
  formant2.frequency.value = 1800 + brightness * 1200;
  formant2.Q.value = 1.5;

  const formantSum = ctx.createGain();
  formantSum.gain.value = 0.5;
  env.connect(formant1).connect(formantSum);
  env.connect(formant2).connect(formantSum);
  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.3;
  env.connect(dryGain).connect(formantSum);

  const outGain = ctx.createGain();
  const peak = v * 0.15;
  outGain.gain.value = peak;
  formantSum.connect(outGain);
  outGain.connect(dest);

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.3;
  const lfoDepth = ctx.createGain();
  // params.chorus multiplies the existing tremolo/chorus depth.
  lfoDepth.gain.value = peak * 0.15 * chorusAmt;
  lfo.connect(lfoDepth);
  lfoDepth.connect(outGain.gain);
  lfo.start(when);
  lfo.stop(stopAt);

  const stopAtMs = (stopAt + 0.1 - ctx.currentTime) * 1000;
  setTimeout(() => {
    try { oscSine.disconnect(); } catch { /* idempotent */ }
    try { oscTri.disconnect(); } catch { /* idempotent */ }
    try { sumGain.disconnect(); } catch { /* idempotent */ }
    try { env.disconnect(); } catch { /* idempotent */ }
    try { formant1.disconnect(); } catch { /* idempotent */ }
    try { formant2.disconnect(); } catch { /* idempotent */ }
    try { formantSum.disconnect(); } catch { /* idempotent */ }
    try { dryGain.disconnect(); } catch { /* idempotent */ }
    try { outGain.disconnect(); } catch { /* idempotent */ }
    try { lfo.disconnect(); } catch { /* idempotent */ }
    try { lfoDepth.disconnect(); } catch { /* idempotent */ }
  }, Math.max(100, stopAtMs + 50));
}

/** Sustained variant — holds at the ADSR sustain level until release(). */
export function triggerDreamPadSustained(t: DreamPadTrigger): MachineHandle {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const f = Math.max(20, t.frequencyHz);
  const baseAdsr: ADSR = t.adsr ?? { a: 1.0, d: 1.0, s: 0.7, r: 1.0 };
  const adsr: ADSR = { ...baseAdsr, a: Math.max(0.1, baseAdsr.a) };
  const peak = v * 0.15;

  // Default: BP 1800 Q 1.5, env amount 0 (env off by default for pad —
  // the slow attack already provides motion).
  const filterCfg: FilterConfig = t.filter ?? {
    type: 'bp', cutoff: 1800, q: 1.5,
  };
  const filterEnv: FilterEnv = t.filterEnv ?? {
    a: 0.5, d: 1.0, s: 0.5, r: 1.0, amount: 0.0,
  };

  // params.detune (cents total spread) replaces hardcoded ±5¢.
  // TODO: params.chorus currently unused in sustained variant — see plan task 1.2
  // (no chorus/tremolo stage in the sustained voice graph; the slow attack
  // already provides motion).
  const { detuneCents } = resolvePadParams(t.params);
  const halfDetune = detuneCents / 2;

  const oscSine = ctx.createOscillator();
  oscSine.type = 'sine';
  oscSine.frequency.value = f;
  oscSine.detune.value = -halfDetune;

  const oscTri = ctx.createOscillator();
  oscTri.type = 'triangle';
  oscTri.frequency.value = f;
  oscTri.detune.value = halfDetune;

  const sumGain = ctx.createGain();
  sumGain.gain.value = 0.5;
  oscSine.connect(sumGain);
  oscTri.connect(sumGain);
  oscSine.start(when);
  oscTri.start(when);

  const filter = ctx.createBiquadFilter();
  filter.type = filterCfg.type === 'hp' ? 'highpass' : filterCfg.type === 'bp' ? 'bandpass' : 'lowpass';
  filter.frequency.value = filterCfg.cutoff;
  filter.Q.value = filterCfg.q;
  sumGain.connect(filter);

  const env = ctx.createGain();
  scheduleAttackDecay(env, peak, adsr, when);
  filter.connect(env);
  env.connect(dest);

  scheduleFilterEnv(filter, filterCfg.cutoff, filterEnv, when);

  const lfos = attachLfos({
    ctx, when,
    pitchTargets: [oscSine.detune, oscTri.detune],
    filter,
    baseCutoff: filterCfg.cutoff,
    ampEnv: env,
    ampPeak: peak,
    lfo1: t.lfo1,
    lfo2: t.lfo2,
  });

  const cleanup = () => {
    try { oscSine.stop(); } catch { /* */ }
    try { oscTri.stop(); } catch { /* */ }
    try { oscSine.disconnect(); } catch { /* */ }
    try { oscTri.disconnect(); } catch { /* */ }
    try { sumGain.disconnect(); } catch { /* */ }
    try { env.disconnect(); } catch { /* */ }
    try { filter.disconnect(); } catch { /* */ }
    lfos.cleanup();
  };

  const setFrequency = (hz: number, glideMs = 30) => {
    const now = ctx.currentTime;
    const tT = Math.max(0.001, glideMs / 1000);
    const fT = Math.max(20, hz);
    oscSine.frequency.cancelScheduledValues(now);
    oscSine.frequency.setValueAtTime(oscSine.frequency.value, now);
    oscSine.frequency.linearRampToValueAtTime(fT, now + tT);
    oscTri.frequency.cancelScheduledValues(now);
    oscTri.frequency.setValueAtTime(oscTri.frequency.value, now);
    oscTri.frequency.linearRampToValueAtTime(fT, now + tT);
  };

  return makeMachineHandle(ctx, env, adsr, cleanup, setFrequency);
}
