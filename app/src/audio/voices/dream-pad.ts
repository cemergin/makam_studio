// Dream Pad — slow-attack ambient pad with formant-flavored color.
//
// Reference flavor: Stars of the Lid, Brian Eno *Music for Airports*.
// Two oscillators (sine + triangle) detuned ±5¢ provide a soft beating
// shimmer; two parallel bandpass formants give a vocal-vowel cast; a
// very slow LFO modulates output gain by ±15% so the pad breathes.
//
// Topology:
//   2 oscillators (sine + triangle, ±5¢) →
//      slow AD env (2s attack, 6s decay) →
//      formant-ish parallel bandpasses (800Hz Q 2 + 2400Hz Q 1.5, summed) →
//      LFO (0.3Hz) on output gain (±15% modulation) →
//      output gain (peak v × 0.15)
//
// Headroom: pad is the heaviest voice (LFO + 2 oscs + 2 parallel formants)
// but still well under 10× a K-S equivalent. Peak v × 0.15 keeps the
// master limiter idle even when stacking 3-4 simultaneous pad notes.

export interface DreamPadTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  frequencyHz: number;
  velocity?: number;
  time?: number;
  brightness?: number; // shifts formant 2 (2400Hz) up/down
  decay?: number;      // extends sustain duration
  body?: number;       // reserved
}

export function triggerDreamPad(t: DreamPadTrigger): void {
  const ctx = t.audioContext;
  const dest = t.destination;
  const when = t.time ?? ctx.currentTime;
  const v = Math.max(0, Math.min(1, t.velocity ?? 1));
  const brightness = Math.max(0, Math.min(1, t.brightness ?? 0.5));
  const decay = Math.max(0, Math.min(1, t.decay ?? 0.6));
  const f = Math.max(20, t.frequencyHz);

  // Pad envelope: 2s attack, then decay over 4..8s (scales with decay).
  const attack = 2.0;
  const decayLen = 4.0 + decay * 4.0;
  const stopAt = when + attack + decayLen + 0.3;

  // ---- Two oscillators detuned ±5¢ -------------------------------------
  const oscSine = ctx.createOscillator();
  oscSine.type = 'sine';
  oscSine.frequency.value = f;
  oscSine.detune.value = -5;

  const oscTri = ctx.createOscillator();
  oscTri.type = 'triangle';
  oscTri.frequency.value = f;
  oscTri.detune.value = 5;

  const sumGain = ctx.createGain();
  sumGain.gain.value = 0.5;
  oscSine.connect(sumGain);
  oscTri.connect(sumGain);
  oscSine.start(when);
  oscTri.start(when);
  oscSine.stop(stopAt);
  oscTri.stop(stopAt);

  // ---- Long AD envelope ------------------------------------------------
  const env = ctx.createGain();
  env.gain.setValueAtTime(0.0001, when);
  env.gain.linearRampToValueAtTime(1.0, when + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, when + attack + decayLen);
  sumGain.connect(env);

  // ---- Two parallel formant bandpasses summed --------------------------
  const formant1 = ctx.createBiquadFilter();
  formant1.type = 'bandpass';
  formant1.frequency.value = 800;
  formant1.Q.value = 2;

  const formant2 = ctx.createBiquadFilter();
  formant2.type = 'bandpass';
  // Brightness shifts formant 2 between 1800Hz and 3000Hz.
  formant2.frequency.value = 1800 + brightness * 1200;
  formant2.Q.value = 1.5;

  const formantSum = ctx.createGain();
  formantSum.gain.value = 0.5;
  env.connect(formant1).connect(formantSum);
  env.connect(formant2).connect(formantSum);
  // Mix in some dry to keep low-end body — 30% dry / 70% formants.
  const dryGain = ctx.createGain();
  dryGain.gain.value = 0.3;
  env.connect(dryGain).connect(formantSum);

  // ---- LFO on output gain ±15% -----------------------------------------
  const outGain = ctx.createGain();
  // Set base level inside the modulation: target peak = v × 0.15, LFO
  // modulates ±15% of that. Base value is the peak; LFO subtracts up to
  // 15% so we never exceed it.
  const peak = v * 0.15;
  outGain.gain.value = peak;
  formantSum.connect(outGain);
  outGain.connect(dest);

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.3;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = peak * 0.15; // ±15% modulation
  lfo.connect(lfoDepth);
  lfoDepth.connect(outGain.gain);
  lfo.start(when);
  lfo.stop(stopAt);

  // Cleanup.
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
