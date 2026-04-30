// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Tempo conversion helpers.
//
// The audio engine schedules in "step BPM" — i.e., the rate of the
// pattern's smallest subdivision (`stepUnit`). For UI we want the
// "natural" BPM determined by the time signature's denominator, since
// that's how sheet music + the broader musical world expresses tempo.
//
//   4/4  → ♩ = N   (quarter is the beat)
//   9/8  → ♪ = N   (eighth is the beat)
//   6/8  → ♪ = N
//   12/4 → ♩ = N
//
// Conversion: naturalBpm = stepBpm × denom / stepUnit
//             stepBpm    = naturalBpm × stepUnit / denom
//
// Ported intact from BeatForge `audio/tempo.ts`.

const DEFAULT_DENOM = 4;

export function parseTimeSigDenom(timeSig: string): number {
  const m = timeSig.match(/^\d+\/(\d+)$/);
  if (!m) return DEFAULT_DENOM;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_DENOM;
}

export function stepToNaturalBpm(stepBpm: number, stepUnit: number, denom: number): number {
  return Math.round((stepBpm * denom) / stepUnit);
}

export function naturalToStepBpm(naturalBpm: number, stepUnit: number, denom: number): number {
  return Math.round((naturalBpm * stepUnit) / denom);
}

/** Glyph for a note-value denominator. Falls back to ♩. */
export function denomGlyph(denom: number): string {
  switch (denom) {
    case 2: return '𝅗𝅥';
    case 4: return '♩';
    case 8: return '♪';
    case 16: return '♬';
    default: return '♩';
  }
}

/** Convenience: { value, glyph } for displaying a pattern's natural tempo. */
export function naturalTempo(stepBpm: number, stepUnit: number, timeSig: string): {
  value: number;
  glyph: string;
  denom: number;
} {
  const denom = parseTimeSigDenom(timeSig);
  return {
    value: stepToNaturalBpm(stepBpm, stepUnit, denom),
    glyph: denomGlyph(denom),
    denom,
  };
}

/** Step duration in seconds at the given BPM × stepUnit. Mirrors the
 *  identity used inside the sequencer:
 *    stepSec = 240 / (bpm × stepUnit)
 *  This is the same number whether you express the tempo in step-BPM
 *  (where stepUnit = 16 typically) or convert it via naturalToStepBpm.
 */
export function stepSecondsAt(bpm: number, stepUnit: number): number {
  return 240 / (bpm * stepUnit);
}

/** Bar duration in seconds. */
export function barSecondsAt(bpm: number, stepUnit: number, stepsPerBar: number): number {
  return stepSecondsAt(bpm, stepUnit) * stepsPerBar;
}
