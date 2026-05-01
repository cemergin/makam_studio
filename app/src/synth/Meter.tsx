// app/src/synth/Meter.tsx
//
// Horizontal output level meter. Two variants:
//   - large: in the MASTER module; shows RMS fill + peak-hold dot,
//     coloured by zone (saffron up to -6 dB, transitions to red between
//     -6 and -3 dB, hard clip lamp at 0 dB)
//   - tiny: in the collapsed console strip; just the RMS bar
//
// Both feed off the AnalyserLevel struct from useAnalyserLevel.

import type { AnalyserLevel } from './hooks/useAnalyserLevel';

interface Props {
  level: AnalyserLevel;
  variant?: 'large' | 'tiny';
}

function linToDb(x: number): number {
  return 20 * Math.log10(Math.max(1e-6, x));
}

export function Meter({ level, variant = 'large' }: Props) {
  const rmsDb = linToDb(level.rms);
  const peakDb = linToDb(level.peak);
  // Map -60..0 dB → 0..1 width. Clamp.
  const rmsW = Math.max(0, Math.min(1, (rmsDb + 60) / 60));
  const peakW = Math.max(0, Math.min(1, (peakDb + 60) / 60));
  const clipping = peakDb > -0.5;
  const hot = peakDb > -6;

  return (
    <div className={`meter meter--${variant} ${clipping ? 'meter--clip' : ''}`}>
      <div
        className={`meter__fill ${hot ? 'meter__fill--hot' : ''}`}
        style={{ width: `${rmsW * 100}%` }}
      />
      {variant === 'large' && (
        <div className="meter__peak" style={{ left: `${peakW * 100}%` }} />
      )}
      {clipping && variant === 'large' && <div className="meter__clip-lamp" />}
    </div>
  );
}
