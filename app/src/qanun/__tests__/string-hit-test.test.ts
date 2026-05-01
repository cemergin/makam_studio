// app/src/qanun/__tests__/string-hit-test.test.ts
//
// Pure-logic test for the drag-strum hit-tester. Given a list of
// pluck-button rectangles and a pointer (x, y), return the string
// index whose pluck button contains the pointer, or null if none.
//
// (Real DOM hit-testing uses document.elementFromPoint at runtime;
// this helper is the deterministic fallback used in tests + makes
// the production hit-test trivially auditable.)

import { describe, expect, it } from 'vitest';
import { hitTestStringPluck, type PluckRect } from '../string-hit-test';

const RECTS: PluckRect[] = [
  { stringIndex: 0, left: 100, top: 100, right: 200, bottom: 130 },
  { stringIndex: 1, left: 100, top: 140, right: 200, bottom: 170 },
  { stringIndex: 2, left: 100, top: 180, right: 200, bottom: 210 },
];

describe('hitTestStringPluck', () => {
  it('returns the string index when point is inside a rect', () => {
    expect(hitTestStringPluck(150, 115, RECTS)).toBe(0);
    expect(hitTestStringPluck(150, 155, RECTS)).toBe(1);
    expect(hitTestStringPluck(150, 195, RECTS)).toBe(2);
  });
  it('returns null when point misses all rects', () => {
    expect(hitTestStringPluck(50, 115, RECTS)).toBeNull();
    expect(hitTestStringPluck(150, 220, RECTS)).toBeNull();
    expect(hitTestStringPluck(250, 115, RECTS)).toBeNull();
  });
  it('returns null between rows (gutter between rects)', () => {
    expect(hitTestStringPluck(150, 135, RECTS)).toBeNull();
  });
  it('treats edges as inside (left/top inclusive, right/bottom exclusive)', () => {
    expect(hitTestStringPluck(100, 100, RECTS)).toBe(0); // top-left corner
    expect(hitTestStringPluck(199.9, 129.9, RECTS)).toBe(0); // just inside bottom-right
    expect(hitTestStringPluck(200, 100, RECTS)).toBeNull(); // exactly on right edge → outside
  });
});
