// Vapor Pluck — chorused saw with slow lowpass sweep + cassette flutter detune.
//
// Reference flavor: Macintosh Plus *Floral Shoppe*, slowed-down DX7 in chorus
// mode. The character lives in the slow downward filter sweep over ~600ms
// (so each note feels like it's exhaling), and the slight random detune
// per-voice that emulates wow-and-flutter.
//
// Topology:
//   3 saw oscillators (target freq ±3..7¢ random) summed →
//      AD env (5ms attack, 600ms decay) →
//      bandpass (Q ~3, sweep 4kHz → 800Hz over 600ms) →
//      output gain (peak v × 0.20)
//
// Headroom discipline: peak gain capped at v × 0.20 so accumulating
// polyphony stays well below the master limiter threshold.

export interface VaporPluckTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  frequencyHz: number;
  velocity?: number;
  time?: number;
  brightness?: number; // optional — biases sweep top end
  decay?: number;      // optional — extends total tail length
  body?: number;       // unused for vapor-pluck (kept for API symmetry)
}

export function triggerVaporPluck(t: VaporPluckTrigger): void {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const brightness = Math.max(0, Math.min(1, t.brightness ?? 0.6));
  const decay = Math.max(0, Math.min(1, t.decay ?? 0.5));
  const f = Math.max(20, t.frequencyHz);

  // Decay scales the envelope length: 0 → 0.4s, 1 → 1.4s.
  const envDecay = 0.4 + decay * 1.0;
  const sweepDuration = 0.6 + decay * 0.4;
  const stopAt = when + envDecay + 0.2;

  // ---- 3 saw oscillators with random ±3-7¢ detune (cassette-flutter) -----
  const oscs: OscillatorNode[] = [];
  const sumGain = ctx.createGain();
  sumGain.gain.value = 1 / 3; // average so sum doesn't double the peak

  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    // Random detune in cents, then convert. Center voice gets near-zero
    // detune; outer voices stretch wider. Rounded to whole cents.
    const cents = (Math.random() * 8 - 4) + (i - 1) * 4;
    osc.detune.value = cents;
    osc.frequency.value = f;
    osc.connect(sumGain);
    osc.start(when);
    osc.stop(stopAt);
    oscs.push(osc);
  }

  // ---- AD envelope ------------------------------------------------------
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.linearRampToValueAtTime(1.0, when + 0.005);
  env.gain.exponentialRampToValueAtTime(0.0001, when + envDecay);
  sumGain.connect(env);

  // ---- Bandpass with downward sweep -------------------------------------
  // Sweep top: 3.5kHz..5kHz scaled by brightness. Bottom: ~800Hz.
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 3;
  const sweepTop = 3500 + brightness * 1500;
  const sweepBottom = 800;
  bp.frequency.setValueAtTime(sweepTop, when);
  bp.frequency.exponentialRampToValueAtTime(sweepBottom, when + sweepDuration);
  env.connect(bp);

  // ---- Chorus: 3 detuned voices summed with short delays ---------------
  // We've already detuned the oscillators themselves; add a tiny delay-line
  // chorus on top for spatial width. Two delay lines at ±9ms with ±5¢
  // (relative to the bp output, post-envelope).
  const chorusSum = ctx.createGain();
  chorusSum.gain.value = 0.5;
  bp.connect(chorusSum); // dry tap

  const d1 = ctx.createDelay(0.05);
  d1.delayTime.value = 0.009;
  const d2 = ctx.createDelay(0.05);
  d2.delayTime.value = 0.014;
  const wetGain = ctx.createGain();
  wetGain.gain.value = 0.35;
  bp.connect(d1); d1.connect(wetGain); wetGain.connect(chorusSum);
  bp.connect(d2); d2.connect(wetGain);

  // Slow LFOs to wobble the delay-times — cassette flutter.
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

  // ---- Output gain: peak v × 0.20 ---------------------------------------
  const outGain = ctx.createGain();
  outGain.gain.value = v * 0.20;
  chorusSum.connect(outGain);
  outGain.connect(dest);

  // Cleanup
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
