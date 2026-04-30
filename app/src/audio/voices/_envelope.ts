// Shared ADSR + VoiceHandle helpers used by every voice's sustained
// variant. Keeps the envelope behavior consistent: attack to peak,
// decay to sustain × peak, hold at sustain until release(), then
// exponential ramp to silence over R.

import type { ADSR, VoiceHandle } from '../qanun-voice';

/** Schedule the attack-decay portion of an ADSR envelope on a gain node.
 *  After this completes, env.gain holds at sustain × peak indefinitely. */
export function scheduleAttackDecay(
  env: GainNode,
  peak: number,
  adsr: ADSR,
  when: number,
): void {
  const sustainAbs = Math.max(0.0001, peak * adsr.s);
  env.gain.cancelScheduledValues(when);
  env.gain.setValueAtTime(0.0001, when);
  env.gain.exponentialRampToValueAtTime(peak, when + Math.max(0.001, adsr.a));
  env.gain.exponentialRampToValueAtTime(
    sustainAbs,
    when + adsr.a + Math.max(0.001, adsr.d),
  );
}

/** Build a release function that ramps the env to silence over R, then
 *  invokes the cleanup callback. Returns the standard VoiceHandle. */
export function makeVoiceHandle(
  ctx: AudioContext,
  env: GainNode,
  adsr: ADSR,
  cleanup: () => void,
  setFrequency?: (hz: number, glideMs?: number) => void,
): VoiceHandle {
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
    } catch {
      // context may be closing
    }
    setTimeout(cleanup, Math.ceil(Math.max(0.01, adsr.r) * 1000) + 80);
  };
  return {
    release,
    setFrequency: setFrequency ?? (() => { /* no-op */ }),
    get released() { return released; },
  };
}
