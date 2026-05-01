// Layout-agnostic keyboard mapping for the qanun-style instrument.
//
// We use `KeyboardEvent.code` (which always names the *physical* key
// position regardless of the user's OS keyboard layout) so the same
// fingering works on QWERTY, AZERTY, Dvorak, Colemak, and any other
// layout. `KeyZ` is the lower-left letter row's first key wherever the
// user lives.
//
// Translation rules (from the user spec):
//   Low row    Z X C V B → maqam degrees -4, -3, -2, -1, 0  (B = karar)
//   Middle row A S D F G → degrees 0, 1, 2, 3, 4             (A = karar)
//   High row   Q W E R T → degrees 4, 5, 6, 7, 8             (R = karar+oct)
//
// Encoded as `[degree (1-indexed within scale modulo octave),
// octaveShift relative to the karar's mid octave]`. The qanun's
// `useQanunState` builds a 3-octave stack (low / mid / tiz) where
// mid = 0¢ register and karar octave shifts are ±1200¢. This layout's
// octaveShift maps directly onto that register: -1 → 'low', 0 → 'mid',
// +1 → 'tiz'.

import type { MaqamPreset } from '../tuning/types';

/** Physical key code → [scale degree (1-indexed within octave),
 *  octave shift relative to the karar's mid octave]. */
export const KEY_TO_SCALE: Record<string, readonly [number, number]> = {
  // Low row Z X C V B → -4 -3 -2 -1 0 (B = karar at oct 0)
  KeyZ: [4, -1],
  KeyX: [5, -1],
  KeyC: [6, -1],
  KeyV: [7, -1],
  KeyB: [1, 0],

  // Middle row A S D F G → 0 1 2 3 4 (karar through 5th)
  KeyA: [1, 0],
  KeyS: [2, 0],
  KeyD: [3, 0],
  KeyF: [4, 0],
  KeyG: [5, 0],

  // High row Q W E R T → 4 5 6 7 8 (R = karar+octave; T = 2nd above)
  KeyQ: [5, 0],
  KeyW: [6, 0],
  KeyE: [7, 0],
  KeyR: [1, 1],
  KeyT: [2, 1],
};

/** Modifier "flower" — right-hand keys that nudge the active string's
 *  mandal selection by N steps. J = neutral (back to canonical). */
export const KEY_TO_MANDAL_DELTA: Record<string, number> = {
  KeyJ: 0,   // neutral / canonical
  KeyH: -1,  // step down 1
  KeyN: -2,  // step down 2
  KeyM: -3,  // step down 3
  KeyK: 1,   // step up 1
  KeyU: 2,   // step up 2
  KeyI: 3,   // step up 3
};

/** Number row → maqam index in ALL_MAQAMAT. Switching loads the maqam
 *  in canonical position (state resets via useQanunState's id-watch). */
export const KEY_TO_MAQAM_INDEX: Record<string, number> = {
  Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3,
  Digit5: 4, Digit6: 5, Digit7: 6, Digit8: 7, Digit9: 8,
};

/** Same registers list `useQanunState` uses internally; mirroring here
 *  so the keyboard hook can resolve `(degree, octaveShift)` →
 *  string-index without reaching into qanun internals. */
const REGISTERS: ReadonlyArray<'low' | 'mid' | 'tiz'> = ['low', 'mid', 'tiz'];

function octaveShiftToRegister(shift: number): 'low' | 'mid' | 'tiz' | null {
  if (shift === -1) return 'low';
  if (shift === 0) return 'mid';
  if (shift === 1) return 'tiz';
  return null;
}

/** Resolve a `(degree, octaveShift)` pair to a string-index in the
 *  qanun's flat string array. Degrees that overflow the scale length
 *  carry into the next-octave register (e.g. degree 8 in oct 0 of an
 *  8-row maqam → degree 1 in oct +1 — the same pitch class).
 *
 *  Uses the qanun's actual string layout where the LAST row of low and
 *  mid registers is skipped (the octave-equivalent pitch overlaps with
 *  the next register's first row). */
export function resolveStringIndex(
  maqam: MaqamPreset,
  degree: number,
  octaveShift: number,
): number | null {
  const N = maqam.rows.length;
  if (N === 0) return null;

  let d = degree;
  let octs = octaveShift;
  while (d > N) {
    d -= N;
    octs += 1;
  }
  while (d < 1) {
    d += N;
    octs -= 1;
  }

  const reg = octaveShiftToRegister(octs);
  if (!reg) return null;
  const regIdx = REGISTERS.indexOf(reg);
  if (regIdx < 0) return null;

  // Layout: low + mid skip degree N; tiz includes all N rows.
  // Index counts:
  //   low  rows 1..N-1 → indices 0..N-2  (count N-1)
  //   mid  rows 1..N-1 → indices N-1..2N-3  (count N-1)
  //   tiz  rows 1..N   → indices 2N-2..3N-2  (count N)
  if (regIdx === 0) {
    // low — degree N maps to next register's degree 1
    if (d === N) return resolveStringIndex(maqam, 1, octs + 1);
    return d - 1;
  }
  if (regIdx === 1) {
    // mid — same wrap-up rule for degree N
    if (d === N) return resolveStringIndex(maqam, 1, octs + 1);
    return (N - 1) + (d - 1);
  }
  // tiz — full N rows
  return 2 * (N - 1) + (d - 1);
}

/** Apply a transpose offset (in scale degrees) to a `(degree, oct)`
 *  pair, carrying overflow into the octave. */
export function applyTranspose(
  base: readonly [number, number],
  transposeDegrees: number,
  scaleLength: number,
): [number, number] {
  let d = base[0] + transposeDegrees;
  let oct = base[1];
  while (d > scaleLength) {
    d -= scaleLength;
    oct += 1;
  }
  while (d < 1) {
    d += scaleLength;
    oct -= 1;
  }
  return [d, oct];
}
