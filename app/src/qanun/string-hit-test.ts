// app/src/qanun/string-hit-test.ts
//
// Hit-test for drag-strum: given a pointer position and a list of
// pluck-button rectangles (in viewport coords), return the string
// index whose rect contains the point, or null.
//
// Used by QanunInstrument's document-level pointermove handler. We
// also use document.elementFromPoint as the production hit-test
// (it's faster and respects DOM stacking), but the rect-list path
// gives us a unit-testable kernel + a fallback.

export interface PluckRect {
  stringIndex: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function hitTestStringPluck(
  x: number, y: number, rects: readonly PluckRect[],
): number | null {
  for (const r of rects) {
    if (x >= r.left && x < r.right && y >= r.top && y < r.bottom) {
      return r.stringIndex;
    }
  }
  return null;
}
