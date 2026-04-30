// Cents arithmetic helpers.
//
// Cents-from-karar is the canonical pitch value across the engine.
// Hz = kararHz × 2^(cents/1200). Inverse: cents = 1200 × log2(hz/kararHz).

import type { MandalPosition } from './types';

export function centsToHz(kararHz: number, cents: number): number {
  return kararHz * Math.pow(2, cents / 1200);
}

export function hzToCents(hz: number, kararHz: number): number {
  return 1200 * Math.log2(hz / kararHz);
}

/** Find the legal mandal position whose `cents_from_karar` is closest
 *  to `targetCents`. Returns the position itself plus the index. */
export function nearestMandalPosition(
  targetCents: number,
  legal: readonly MandalPosition[],
): { position: MandalPosition; index: number } {
  if (legal.length === 0) {
    throw new Error('nearestMandalPosition: empty legal positions list');
  }
  let bestIdx = 0;
  let bestDist = Math.abs(legal[0].cents_from_karar - targetCents);
  for (let i = 1; i < legal.length; i++) {
    const d = Math.abs(legal[i].cents_from_karar - targetCents);
    if (d < bestDist) {
      bestDist = d;
      bestIdx = i;
    }
  }
  return { position: legal[bestIdx], index: bestIdx };
}

/** Step through legal mandal positions by ±1. Wraps stop at the ends
 *  (no octave wrap — moving past the last position clamps). */
export function stepMandalIndex(
  currentIndex: number,
  step: number,
  legal: readonly MandalPosition[],
): number {
  const next = currentIndex + step;
  if (next < 0) return 0;
  if (next >= legal.length) return legal.length - 1;
  return next;
}

/** Octave shift in cents for a given register. */
export function octaveShiftCents(octave: 'low' | 'mid' | 'tiz'): number {
  if (octave === 'low') return -1200;
  if (octave === 'tiz') return 1200;
  return 0;
}
