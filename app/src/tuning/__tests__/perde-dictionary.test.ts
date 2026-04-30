import { describe, expect, it } from 'vitest';
import { resolvePerde } from '../perde-dictionary';

describe('resolvePerde', () => {
  it('resolves 0¢ to Rast in the mid octave', () => {
    const r = resolvePerde(0);
    expect(r.name).toBe('Rast');
    expect(r.octave).toBe('mid');
    expect(r.inflection).toBe(0);
  });

  it('resolves +1200¢ to Rast in the tiz register', () => {
    // Rast has no tiz rename in the dictionary (TIZ_RENAME does not list
    // Rast), so the name stays 'Rast' but the octave flips to 'tiz'.
    const r = resolvePerde(1200);
    expect(r.octave).toBe('tiz');
    expect(r.name).toBe('Rast');
    expect(r.inflection).toBe(0);
  });

  it('resolves -1200¢ to Rast in the low register', () => {
    const r = resolvePerde(-1200);
    expect(r.octave).toBe('low');
    expect(r.name).toBe('Rast');
    expect(r.inflection).toBe(0);
  });

  it('returns inflection for slightly-off pitches', () => {
    // 50¢ above Rast → halfway to Nim Zirgüle (≈ 90¢). Whichever is
    // chosen, inflection should be the signed delta to canonical and
    // the resolved name should be the closer of the two.
    const r = resolvePerde(50);
    expect(['Rast', 'Nim Zirgüle']).toContain(r.name);
    expect(typeof r.inflection).toBe('number');
    // The inflection magnitude should be at most ~half the distance
    // between Rast (0) and Nim Zirgüle (~90¢).
    expect(Math.abs(r.inflection)).toBeLessThanOrEqual(60);
  });

  it('snaps Hüseynî → Muhayyer in the tiz register', () => {
    // Hüseynî sits ~905¢ above Rast (40 commas above Rast).
    // Add 1200¢ for tiz. We feed cents-from-karar = 905 + 1200 = 2105¢.
    const r = resolvePerde(2105);
    expect(r.octave).toBe('tiz');
    expect(r.name).toBe('Muhayyer');
  });

  it('snaps Hüseynî → Hüseynî Aşîrân in the low register', () => {
    // 905¢ - 1200¢ = -295¢
    const r = resolvePerde(-295);
    expect(r.octave).toBe('low');
    expect(r.name).toBe('Hüseynî Aşîrân');
  });
});
