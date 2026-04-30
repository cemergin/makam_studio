// Karplus-Strong-lite plucked string voice for the qanun.
//
// Topology:
//   noise burst (5ms)
//        │
//        ▼
//   ┌────────────────────────────────────────┐
//   │ delay (integer-sample, length = SR/Hz) │
//   │   ↑                                    │
//   │   └──── feedback gain (~0.985) ←──┐   │
//   │                                   │   │
//   │   feedback path passes through    │   │
//   │   a one-pole lowpass biquad       │   │
//   │   (energy-decay model)            │   │
//   └────────────────────────────────────────┘
//        │
//        ▼ optional band-resonance "body" filter (in parallel)
//        ▼
//   amp envelope → destination
//
// V1 trade-off: integer-sample delay length introduces frequency error
// of up to ±(SR / (2 × N)) where N = round(SR/Hz). At 48 kHz this is
// ≤ 0.05% above middle A4 (≈ 1¢) but rises with pitch — at A6 (1760 Hz)
// it's ≈ 6¢. For maqam-precision microtonality at the top of the qanun
// we'd want a Thiran allpass for sub-sample fractional delay; v1 ships
// integer-only and accepts that the topmost strings are slightly off.
//
// TODO: add Thiran fractional-delay support in app/src/audio for
// cents-precise high-register pitches; currently has up to ~6¢ error
// above E5.

export interface QanunVoiceTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  /** Frequency in Hz (NOT MIDI). Drives the delay line length. */
  frequencyHz: number;
  /** 0..1 attack amplitude. Default 1. */
  velocity?: number;
  /** 0..1 — controls feedback-loop lowpass cutoff. 0 = dull, 1 = bright. */
  brightness?: number;
  /** 0..1 — controls feedback gain. 0 = short pluck, 1 = long sustain. */
  decay?: number;
  /** 0..1 — controls intensity of a parallel band-resonance body filter. */
  body?: number;
  /** Schedule time in ctx.currentTime. Default = now. */
  time?: number;
}

/** Pluck a Karplus-Strong-lite string. Schedules everything ahead and
 *  cleans up automatically once the loop has decayed. */
export function triggerQanun(t: QanunVoiceTrigger): void {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const brightness = Math.max(0, Math.min(1, t.brightness ?? 0.6));
  const decay = Math.max(0, Math.min(1, t.decay ?? 0.7));
  const body = Math.max(0, Math.min(1, t.body ?? 0.3));
  const f = Math.max(20, t.frequencyHz);

  const SR = ctx.sampleRate;
  // Delay length = period in seconds. The DelayNode rounds to integer
  // samples internally — that's the v1 approximation.
  const period = 1 / f;
  const maxDelay = 1 / 20; // safe upper bound for very low strings
  const delayTime = Math.max(1 / SR, Math.min(maxDelay, period));

  // Loop nodes ----------------------------------------------------------
  const delay = ctx.createDelay(maxDelay);
  delay.delayTime.value = delayTime;

  const fbLp = ctx.createBiquadFilter();
  fbLp.type = 'lowpass';
  // Brightness maps to lowpass cutoff: 0 → 1.5×f, 1 → 8 kHz (or higher).
  // The lowpass inside the feedback loop is the energy-decay model.
  // Q = 0.7 keeps the filter critically damped — anything higher
  // combined with the high-feedback K-S loop can produce instability
  // ("BiquadFilterNode: state is bad" warnings in some browsers).
  fbLp.frequency.value = Math.max(800, 1500 + brightness * 6500);
  fbLp.Q.value = 0.707;

  const fbGain = ctx.createGain();
  // Decay maps to feedback gain in [0.92, 0.998].
  fbGain.gain.value = 0.92 + decay * 0.078;

  // Loop wiring: delay → fbLp → fbGain → delay
  delay.connect(fbLp);
  fbLp.connect(fbGain);
  fbGain.connect(delay);

  // Excitation: 5 ms band-limited noise burst into the delay input.
  const burstSec = 0.005;
  const burstLen = Math.ceil(SR * burstSec);
  const buf = ctx.createBuffer(1, burstLen, SR);
  const data = buf.getChannelData(0);
  for (let i = 0; i < burstLen; i++) {
    // Tukey-ish ramp to avoid click: linear in/out
    const r = i < burstLen / 2 ? i / (burstLen / 2) : 1 - (i - burstLen / 2) / (burstLen / 2);
    data[i] = (Math.random() * 2 - 1) * r * v;
  }
  const burst = ctx.createBufferSource();
  burst.buffer = buf;

  // The string itself: take output from after fbLp (post-loop-color)
  // through an output-side amp envelope into the destination.
  const outAmp = ctx.createGain();
  outAmp.gain.value = 1;
  fbLp.connect(outAmp);

  // Optional body filter — small parallel bandpass colours the attack.
  let bodyMixed: AudioNode = outAmp;
  if (body > 0.001) {
    const bodyBp = ctx.createBiquadFilter();
    bodyBp.type = 'bandpass';
    // Body resonance moves with the pitch — this fakes a soundboard
    // sympathetic — clamp into a sensible range.
    bodyBp.frequency.value = Math.min(4000, Math.max(200, f * 2.5));
    bodyBp.Q.value = 1.5 + body * 4;
    const bodyGain = ctx.createGain();
    bodyGain.gain.value = body * 0.6;
    fbLp.connect(bodyBp).connect(bodyGain);
    const bodyMix = ctx.createGain();
    outAmp.connect(bodyMix);
    bodyGain.connect(bodyMix);
    bodyMixed = bodyMix;
  }

  // Output envelope — a long exponential tail so the K-S loop's natural
  // decay dominates but we cleanly stop after ~6s for sustain headroom.
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.linearRampToValueAtTime(v * 0.6, when + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, when + 6);

  bodyMixed.connect(env);
  env.connect(dest);

  // Burst feeds the delay loop (NOT the destination directly — its
  // copy in the loop persists, the output we hear is the post-loop-LP).
  burst.connect(delay);
  burst.start(when);
  burst.stop(when + burstSec + 0.01);

  // Cleanup: tear down all nodes once the envelope is silent.
  const stopAt = when + 6.1;
  const stopAtMs = (stopAt - ctx.currentTime) * 1000;
  setTimeout(() => {
    try { burst.disconnect(); } catch { /* idempotent */ }
    try { delay.disconnect(); } catch { /* idempotent */ }
    try { fbLp.disconnect(); } catch { /* idempotent */ }
    try { fbGain.disconnect(); } catch { /* idempotent */ }
    try { outAmp.disconnect(); } catch { /* idempotent */ }
    try { env.disconnect(); } catch { /* idempotent */ }
  }, Math.max(100, stopAtMs + 50));
}
