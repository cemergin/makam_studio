// Qanun machine — triangle + sine body + ADSR envelope.
//
// Two trigger modes:
//
//   triggerQanun(t)            — fire-and-forget. ADSR runs through
//                                  release automatically after a short
//                                  hold. Used for one-shot plucks.
//   triggerQanunSustained(t)   — returns { release() }. Note holds at
//                                  sustain level until release() is
//                                  called. Used for held-key playing
//                                  AND mouse-down/up sustained plucks.
//
// Envelope:
//   t = 0          → 0.0001  (start of attack)
//   t = a          → peak    (=v × 0.35)
//   t = a + d      → sustain (=peak × s)
//   release()      → exp ramp to 0.0001 over r seconds
//
// All amplitudes are kept conservative (peak 0.35 × velocity per voice,
// limiter at -3 dBFS on the master bus) so polyphonic play doesn't
// approach unity.
//
// Sustained variant additionally:
//   - inserts a configurable filter (LP/BP/HP) BEFORE the amp env
//   - drives that filter's cutoff with an optional filter envelope
//   - hosts up to 2 LFOs that modulate pitch / filter / amp / off

import type {
  FilterConfig,
  FilterEnv,
  LfoConfig,
} from './machines/_machine-config';
import {
  attachLfos,
  scheduleFilterEnv,
} from './machines/_machine-config';

export interface ADSR {
  a: number;  // attack seconds
  d: number;  // decay seconds
  s: number;  // sustain level 0..1
  r: number;  // release seconds
}

export interface QanunMachineTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  /** Frequency in Hz (NOT MIDI). */
  frequencyHz: number;
  /** 0..1 attack amplitude. Default 1. */
  velocity?: number;
  /** 0..1 — controls a body-resonance bandpass amount. */
  brightness?: number;
  /** Legacy single-knob decay (used as ADSR.d if adsr is not provided). */
  decay?: number;
  /** 0..1 — controls a fifth-up sine layer amount. */
  body?: number;
  /** Schedule time in ctx.currentTime. Default = now. */
  time?: number;
  /** Full ADSR override. If provided, overrides `decay`. */
  adsr?: ADSR;
  /** Optional per-machine filter override (sustained variant only). */
  filter?: FilterConfig;
  filterEnv?: FilterEnv;
  /** Up to 2 LFOs (sustained variant only). */
  lfo1?: LfoConfig;
  lfo2?: LfoConfig;
}

export interface MachineHandle {
  /** Begin release phase. Auto-cleans up after the release tail. */
  release(): void;
  /** Slide the voice's pitch to a new frequency over `glideMs` ms.
   *  Used by modifier keys to bend a still-ringing note (çarpma /
   *  hammer-on). Default glide ~30ms — fast enough to feel snappy,
   *  slow enough to avoid clicks. */
  setFrequency(hz: number, glideMs?: number): void;
  /** True after release() has been called. */
  released: boolean;
}

interface OneShotNodes {
  ctx: AudioContext;
  osc: OscillatorNode;
  oscBody: OscillatorNode;
  lp: BiquadFilterNode;
  bodyMixGain: GainNode;
  env: GainNode;
  cleanup: () => void;
}

function buildOneShot(t: QanunMachineTrigger): {
  nodes: OneShotNodes;
  peak: number;
  adsr: ADSR;
  startedAt: number;
} {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const brightness = Math.max(0, Math.min(1, t.brightness ?? 0.6));
  const body = Math.max(0, Math.min(1, t.body ?? 0.3));
  const f = Math.max(20, t.frequencyHz);

  // Resolve ADSR. If full adsr provided, use it. Otherwise build from
  // the legacy `decay` knob (treated as a fast attack + the user's
  // decay-to-zero time, no sustain hold for one-shot mouse plucks).
  const adsr: ADSR = t.adsr ?? {
    a: 0.005,
    d: 0.5 + Math.max(0, Math.min(1, t.decay ?? 0.7)) * 1.5, // 0.5–2s
    s: 0.0, // legacy plucks decay to zero
    r: 0.3,
  };

  // Voice nodes
  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = f;

  const oscBody = ctx.createOscillator();
  oscBody.type = 'sine';
  oscBody.frequency.value = f * 1.5;

  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 600 + brightness * 8000;
  lp.Q.value = 0.7;

  const bodyMixGain = ctx.createGain();
  bodyMixGain.gain.value = body * 0.15;

  const env = ctx.createGain();

  osc.connect(lp);
  lp.connect(env);
  oscBody.connect(bodyMixGain);
  bodyMixGain.connect(env);
  env.connect(dest);

  osc.start(when);
  oscBody.start(when);

  const peak = v * 0.35;

  const cleanup = () => {
    try { osc.stop(); } catch { /* already stopped */ }
    try { oscBody.stop(); } catch { /* already stopped */ }
    try { osc.disconnect(); } catch { /* idempotent */ }
    try { oscBody.disconnect(); } catch { /* idempotent */ }
    try { lp.disconnect(); } catch { /* idempotent */ }
    try { bodyMixGain.disconnect(); } catch { /* idempotent */ }
    try { env.disconnect(); } catch { /* idempotent */ }
  };

  return {
    nodes: { ctx, osc, oscBody, lp, bodyMixGain, env, cleanup },
    peak,
    adsr,
    startedAt: when,
  };
}

/** Schedule the AD portion of the envelope. */
function scheduleAttackDecay(env: GainNode, peak: number, adsr: ADSR, when: number): void {
  env.gain.setValueAtTime(0.0001, when);
  env.gain.exponentialRampToValueAtTime(peak, when + Math.max(0.001, adsr.a));
  const sustainAbs = Math.max(0.0001, peak * adsr.s);
  env.gain.exponentialRampToValueAtTime(sustainAbs, when + adsr.a + Math.max(0.001, adsr.d));
}

/** One-shot: triggers attack-decay-release on its own. */
export function triggerQanun(t: QanunMachineTrigger): void {
  const { nodes, peak, adsr, startedAt } = buildOneShot(t);
  const ctx = nodes.ctx;
  scheduleAttackDecay(nodes.env, peak, adsr, startedAt);

  const sustainStart = startedAt + adsr.a + adsr.d;
  const sustainHold = adsr.s > 0.01 ? 0.5 : 0;
  const releaseStart = sustainStart + sustainHold;
  nodes.env.gain.setValueAtTime(
    Math.max(0.0001, peak * adsr.s),
    releaseStart,
  );
  nodes.env.gain.exponentialRampToValueAtTime(
    0.0001,
    releaseStart + Math.max(0.01, adsr.r),
  );

  const stopAt = releaseStart + Math.max(0.01, adsr.r) + 0.05;
  const stopAtMs = (stopAt - ctx.currentTime) * 1000;
  setTimeout(() => {
    nodes.cleanup();
  }, Math.max(100, stopAtMs));
}

/** Sustained: caller controls release. Returns a handle.
 *  Wires in the configurable filter + filter env + LFOs. */
export function triggerQanunSustained(t: QanunMachineTrigger): MachineHandle {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const brightness = Math.max(0, Math.min(1, t.brightness ?? 0.6));
  const body = Math.max(0, Math.min(1, t.body ?? 0.3));
  const f = Math.max(20, t.frequencyHz);
  const adsr: ADSR = t.adsr ?? { a: 0.005, d: 0.4, s: 0.5, r: 0.5 };
  const peak = v * 0.35;

  // Defaults: lp, cutoff 6000, q 0.7. Brightness biases the cutoff up.
  const filterCfg: FilterConfig = t.filter ?? {
    type: 'lp',
    cutoff: Math.min(18000, 600 + brightness * 8000 + 600),
    q: 0.7,
  };
  const filterEnv: FilterEnv = t.filterEnv ?? {
    a: 0.005, d: 0.8, s: 0.0, r: 0.2, amount: 0.3,
  };

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = f;

  const oscBody = ctx.createOscillator();
  oscBody.type = 'sine';
  oscBody.frequency.value = f * 1.5;

  const bodyMixGain = ctx.createGain();
  bodyMixGain.gain.value = body * 0.15;

  // Sum of main + body BEFORE the filter.
  const sumGain = ctx.createGain();
  sumGain.gain.value = 1;
  osc.connect(sumGain);
  oscBody.connect(bodyMixGain).connect(sumGain);

  // Configurable filter.
  const filter = ctx.createBiquadFilter();
  filter.type = filterCfg.type === 'hp' ? 'highpass' : filterCfg.type === 'bp' ? 'bandpass' : 'lowpass';
  filter.frequency.value = filterCfg.cutoff;
  filter.Q.value = filterCfg.q;
  sumGain.connect(filter);

  // Amp envelope.
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.exponentialRampToValueAtTime(peak, when + Math.max(0.001, adsr.a));
  env.gain.exponentialRampToValueAtTime(
    Math.max(0.0001, peak * adsr.s),
    when + adsr.a + Math.max(0.001, adsr.d),
  );
  filter.connect(env);
  env.connect(dest);

  osc.start(when);
  oscBody.start(when);

  // Schedule filter envelope on cutoff (in addition to LFO route below).
  scheduleFilterEnv(filter, filterCfg.cutoff, filterEnv, when);

  // Attach LFOs.
  const lfos = attachLfos({
    ctx,
    when,
    pitchTargets: [osc.detune, oscBody.detune],
    filter,
    baseCutoff: filterCfg.cutoff,
    ampEnv: env,
    ampPeak: peak,
    lfo1: t.lfo1,
    lfo2: t.lfo2,
  });

  let released = false;
  const release = () => {
    if (released) return;
    released = true;
    const now = ctx.currentTime;
    const startFrom = Math.max(0.0001, env.gain.value);
    try {
      env.gain.cancelScheduledValues(now);
      env.gain.setValueAtTime(startFrom, now);
      env.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.01, adsr.r));
    } catch { /* ctx closing */ }
    setTimeout(() => {
      try { osc.stop(); } catch { /* */ }
      try { oscBody.stop(); } catch { /* */ }
      try { osc.disconnect(); } catch { /* */ }
      try { oscBody.disconnect(); } catch { /* */ }
      try { bodyMixGain.disconnect(); } catch { /* */ }
      try { sumGain.disconnect(); } catch { /* */ }
      try { filter.disconnect(); } catch { /* */ }
      try { env.disconnect(); } catch { /* */ }
      lfos.cleanup();
    }, Math.ceil(Math.max(0.01, adsr.r) * 1000) + 80);
  };

  const setFrequency = (hz: number, glideMs = 30) => {
    if (released) return;
    const now = ctx.currentTime;
    const t2 = Math.max(0.001, glideMs / 1000);
    const fT = Math.max(20, hz);
    osc.frequency.cancelScheduledValues(now);
    osc.frequency.setValueAtTime(osc.frequency.value, now);
    osc.frequency.linearRampToValueAtTime(fT, now + t2);
    oscBody.frequency.cancelScheduledValues(now);
    oscBody.frequency.setValueAtTime(oscBody.frequency.value, now);
    oscBody.frequency.linearRampToValueAtTime(fT * 1.5, now + t2);
  };

  // Safety net.
  setTimeout(() => { if (!released) release(); }, 30_000);

  return {
    release,
    setFrequency,
    get released() { return released; },
  };
}
