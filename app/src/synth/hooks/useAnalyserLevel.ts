// app/src/synth/hooks/useAnalyserLevel.ts
//
// Polls an AnalyserNode at requestAnimationFrame cadence and returns
// {rms, peak} as a stateful pair. Both are 0..1 floats (linear, not dB).
// Components can derive their own dBFS / colour from these.
//
// Used by Meter (large variant in MASTER module + tiny variant in the
// collapsed console strip).

import { useEffect, useState } from 'react';

export interface AnalyserLevel { rms: number; peak: number; }

export function useAnalyserLevel(analyser: AnalyserNode | null): AnalyserLevel {
  const [level, setLevel] = useState<AnalyserLevel>({ rms: 0, peak: 0 });

  useEffect(() => {
    if (!analyser) return;
    const buf = new Uint8Array(analyser.fftSize);
    let raf = 0;
    let lastPeak = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let peak = 0;
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) {
        const s = (buf[i] - 128) / 128;       // -1..+1
        const a = Math.abs(s);
        if (a > peak) peak = a;
        sumSq += s * s;
      }
      const rms = Math.sqrt(sumSq / buf.length);
      // Peak hold + decay
      lastPeak = Math.max(peak, lastPeak * 0.9);
      setLevel({ rms, peak: lastPeak });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return level;
}
