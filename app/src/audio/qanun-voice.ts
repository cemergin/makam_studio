// Qanun voice — triangle + sine body + ADSR envelope.
//
// Two trigger modes:
//
//   triggerQanun(t)            — fire-and-forget. ADSR runs through
//                                  release automatically after a short
//                                  hold. Used for mouse-click plucks.
//   triggerQanunSustained(t)   — returns { release() }. Note holds at
//                                  sustain level until release() is
//                                  called. Used for held-key playing.
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

export interface ADSR {
  a: number;  // attack seconds
  d: number;  // decay seconds
  s: number;  // sustain level 0..1
  r: number;  // release seconds
}

export interface QanunVoiceTrigger {
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
}

export interface VoiceHandle {
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

interface VoiceNodes {
  ctx: AudioContext;
  osc: OscillatorNode;
  oscBody: OscillatorNode;
  lp: BiquadFilterNode;
  bodyMixGain: GainNode;
  env: GainNode;
  cleanup: () => void;
}

function buildVoice(t: QanunVoiceTrigger): {
  nodes: VoiceNodes;
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

/** Schedule the AD portion of the envelope. The S level is set; what
 *  happens after that depends on the caller (auto-release vs. manual). */
function scheduleAttackDecay(env: GainNode, peak: number, adsr: ADSR, when: number): void {
  env.gain.setValueAtTime(0.0001, when);
  // Attack — exponential to peak.
  env.gain.exponentialRampToValueAtTime(peak, when + Math.max(0.001, adsr.a));
  // Decay — exponential to sustain level (clamp tiny minimum so exp ramp is valid).
  const sustainAbs = Math.max(0.0001, peak * adsr.s);
  env.gain.exponentialRampToValueAtTime(sustainAbs, when + adsr.a + Math.max(0.001, adsr.d));
}

/** One-shot: triggers attack-decay-release on its own. Used by
 *  mouse-click plucks. */
export function triggerQanun(t: QanunVoiceTrigger): void {
  const { nodes, peak, adsr, startedAt } = buildVoice(t);
  const ctx = nodes.ctx;
  scheduleAttackDecay(nodes.env, peak, adsr, startedAt);

  const sustainStart = startedAt + adsr.a + adsr.d;
  const sustainHold = adsr.s > 0.01 ? 0.5 : 0; // brief hold if sustain set
  const releaseStart = sustainStart + sustainHold;
  // Release ramp.
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

/** Sustained: caller controls release. Returns a handle. */
export function triggerQanunSustained(t: QanunVoiceTrigger): VoiceHandle {
  const { nodes, peak, adsr, startedAt } = buildVoice(t);
  const ctx = nodes.ctx;
  scheduleAttackDecay(nodes.env, peak, adsr, startedAt);

  let released = false;

  const release = () => {
    if (released) return;
    released = true;
    const now = ctx.currentTime;
    const startFrom = Math.max(0.0001, nodes.env.gain.value);
    nodes.env.gain.cancelScheduledValues(now);
    nodes.env.gain.setValueAtTime(startFrom, now);
    nodes.env.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.01, adsr.r));

    const stopAtMs = (Math.max(0.01, adsr.r) + 0.1) * 1000;
    setTimeout(() => {
      nodes.cleanup();
    }, Math.max(100, stopAtMs));
  };

  // Live pitch bend: linear-ramp both oscillators (main + body fifth)
  // to the new frequency over `glideMs` ms. Used by modifier keys to
  // hammer-on / pull-off a held note. Body stays at 1.5× the main.
  const setFrequency = (hz: number, glideMs = 30) => {
    if (released) return;
    const now = ctx.currentTime;
    const t = Math.max(0.001, glideMs / 1000);
    const f = Math.max(20, hz);
    nodes.osc.frequency.cancelScheduledValues(now);
    nodes.osc.frequency.setValueAtTime(nodes.osc.frequency.value, now);
    nodes.osc.frequency.linearRampToValueAtTime(f, now + t);
    nodes.oscBody.frequency.cancelScheduledValues(now);
    nodes.oscBody.frequency.setValueAtTime(nodes.oscBody.frequency.value, now);
    nodes.oscBody.frequency.linearRampToValueAtTime(f * 1.5, now + t);
  };

  // Safety: if the caller never releases (e.g. component unmounts mid-
  // hold), auto-release after 30s so we don't leak nodes forever.
  setTimeout(() => { if (!released) release(); }, 30_000);

  return {
    release,
    setFrequency,
    get released() { return released; },
  };
}
