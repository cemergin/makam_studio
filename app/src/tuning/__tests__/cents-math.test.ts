import { describe, expect, it } from 'vitest';
import {
  centsToHz,
  hzToCents,
  nearestMandalPosition,
  octaveShiftCents,
  stepMandalIndex,
} from '../cents-math';
import type { MandalPosition } from '../types';

describe('centsToHz', () => {
  it('returns the karar Hz unchanged at 0¢', () => {
    expect(centsToHz(440, 0)).toBeCloseTo(440, 9);
  });

  it('doubles at +1200¢ (octave up)', () => {
    expect(centsToHz(440, 1200)).toBeCloseTo(880, 9);
  });

  it('halves at -1200¢ (octave down)', () => {
    expect(centsToHz(440, -1200)).toBeCloseTo(220, 9);
  });

  it('handles non-440 karars', () => {
    expect(centsToHz(294, 0)).toBeCloseTo(294, 9);
    expect(centsToHz(294, 1200)).toBeCloseTo(588, 9);
  });
});

describe('hzToCents', () => {
  it('returns 0 when hz === karar', () => {
    expect(hzToCents(440, 440)).toBeCloseTo(0, 9);
  });

  it('returns 1200 for an octave above', () => {
    expect(hzToCents(880, 440)).toBeCloseTo(1200, 9);
  });

  it('returns -1200 for an octave below', () => {
    expect(hzToCents(220, 440)).toBeCloseTo(-1200, 9);
  });

  it('round-trips with centsToHz', () => {
    for (const c of [-1200, -700, -50, 0, 50, 200, 700, 1200]) {
      const hz = centsToHz(440, c);
      expect(hzToCents(hz, 440)).toBeCloseTo(c, 9);
    }
  });
});

describe('octaveShiftCents', () => {
  it('returns -1200 / 0 / +1200 for low/mid/tiz', () => {
    expect(octaveShiftCents('low')).toBe(-1200);
    expect(octaveShiftCents('mid')).toBe(0);
    expect(octaveShiftCents('tiz')).toBe(1200);
  });
});

describe('nearestMandalPosition', () => {
  const legal: MandalPosition[] = [
    { cents_from_karar: 0 },
    { cents_from_karar: 100 },
    { cents_from_karar: 250 },
    { cents_from_karar: 500 },
  ];

  it('finds the exact match', () => {
    expect(nearestMandalPosition(250, legal).index).toBe(2);
  });

  it('rounds to nearest', () => {
    expect(nearestMandalPosition(120, legal).index).toBe(1);
    expect(nearestMandalPosition(160, legal).index).toBe(1);
    expect(nearestMandalPosition(200, legal).index).toBe(2);
  });

  it('throws on empty legal positions', () => {
    expect(() => nearestMandalPosition(0, [])).toThrow();
  });
});

describe('stepMandalIndex', () => {
  const legal: MandalPosition[] = [
    { cents_from_karar: 0 },
    { cents_from_karar: 100 },
    { cents_from_karar: 250 },
  ];

  it('moves by ±1 within range', () => {
    expect(stepMandalIndex(1, 1, legal)).toBe(2);
    expect(stepMandalIndex(1, -1, legal)).toBe(0);
  });

  it('clamps at the ends', () => {
    expect(stepMandalIndex(0, -1, legal)).toBe(0);
    expect(stepMandalIndex(2, 1, legal)).toBe(2);
  });
});
