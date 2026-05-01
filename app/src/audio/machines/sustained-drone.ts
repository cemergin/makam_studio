// Sustained Drone — looping sine + slow LFO with explicit release.
//
// Used by the keyboard hook's Space-hold gesture: while the user holds
// Space, the most-recently-played pitch sustains as a soft drone. On
// keyup the returned `release()` ramps amplitude to silence over 0.5s
// and tears the graph down.
//
// Topology:
//   2 oscillators (sine fundamental + sine fifth, summed quietly) →
//      AD-style attack envelope (0.3s linear ramp to peak) →
//      slow LFO (0.25Hz) on output gain (±15% of peak) →
//      output gain (peak v × 0.20) → destination
//
// Headroom: monophonic by construction (the keyboard hook holds at
// most one handle at a time), peak ≤ 0.20×v keeps us well under the
// master limiter even when stacked with active plucks.

export interface SustainedDroneTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  frequencyHz: number;
  velocity?: number;
}

export interface DroneHandle {
  release(): void;
}

export function startSustainedDrone(t: SustainedDroneTrigger): DroneHandle {
  const ctx = t.audioContext;
  const dest = t.destination;
  const v = Math.max(0, Math.min(1, t.velocity ?? 0.85));
  const f = Math.max(20, t.frequencyHz);
  const t0 = ctx.currentTime;

  const peak = v * 0.20;
  const attack = 0.30;
  const release = 0.50;

  const oscFund = ctx.createOscillator();
  oscFund.type = 'sine';
  oscFund.frequency.value = f;

  const oscFifth = ctx.createOscillator();
  oscFifth.type = 'sine';
  oscFifth.frequency.value = f * 1.5;

  const fifthGain = ctx.createGain();
  fifthGain.gain.value = 0.18;

  const sumGain = ctx.createGain();
  sumGain.gain.value = 1.0;
  oscFund.connect(sumGain);
  oscFifth.connect(fifthGain).connect(sumGain);

  const outGain = ctx.createGain();
  outGain.gain.setValueAtTime(0.0001, t0);
  outGain.gain.linearRampToValueAtTime(peak, t0 + attack);
  sumGain.connect(outGain);
  outGain.connect(dest);

  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.25;
  const lfoDepth = ctx.createGain();
  lfoDepth.gain.value = peak * 0.15;
  lfo.connect(lfoDepth);
  lfoDepth.connect(outGain.gain);

  oscFund.start(t0);
  oscFifth.start(t0);
  lfo.start(t0);

  let released = false;
  let teardownTimer: ReturnType<typeof setTimeout> | null = null;

  const teardown = () => {
    try { oscFund.stop(); } catch { /* idempotent */ }
    try { oscFifth.stop(); } catch { /* idempotent */ }
    try { lfo.stop(); } catch { /* idempotent */ }
    try { oscFund.disconnect(); } catch { /* idempotent */ }
    try { oscFifth.disconnect(); } catch { /* idempotent */ }
    try { fifthGain.disconnect(); } catch { /* idempotent */ }
    try { sumGain.disconnect(); } catch { /* idempotent */ }
    try { lfo.disconnect(); } catch { /* idempotent */ }
    try { lfoDepth.disconnect(); } catch { /* idempotent */ }
    try { outGain.disconnect(); } catch { /* idempotent */ }
  };

  const releaseFn = () => {
    if (released) return;
    released = true;
    const now = ctx.currentTime;
    try {
      outGain.gain.cancelScheduledValues(now);
      outGain.gain.setValueAtTime(Math.max(outGain.gain.value, 0.0001), now);
      outGain.gain.exponentialRampToValueAtTime(0.0001, now + release);
    } catch {
      // ignore — context may be closed
    }
    teardownTimer = setTimeout(teardown, Math.ceil(release * 1000) + 80);
  };

  const wrappedRelease = () => {
    if (teardownTimer) clearTimeout(teardownTimer);
    teardownTimer = null;
    releaseFn();
  };

  return { release: wrappedRelease };
}
