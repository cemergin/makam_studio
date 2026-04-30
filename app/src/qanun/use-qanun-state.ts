// useQanunState — central state hook for the qanun instrument.
//
// Given an active maqam preset, build the 24-string vertical stack
// spanning ~2.5 octaves: scale_degrees × {low, mid, tiz}. Track each
// string's current mandal-cents-from-karar offset (which may differ
// from the canonical position when the user has retuned that string).
//
// Switching maqamat resets all retunings to canonical.

import { useCallback, useMemo, useState } from 'react';
import type { MandalState, MaqamPreset } from '../tuning/types';
import { octaveShiftCents, stepMandalIndex, nearestMandalPosition } from '../tuning/cents-math';

const REGISTERS: Array<'low' | 'mid' | 'tiz'> = ['low', 'mid', 'tiz'];

export interface QanunString {
  index: number;
  rowDegree: number;
  octave: 'low' | 'mid' | 'tiz';
  /** Canonical cents from karar in the row's mid-octave reference,
   *  PLUS the current mandal selection (mid-octave). The actual
   *  sounding cents = currentCentsMid + octaveShift. */
  currentCentsMid: number;
  /** True if this string differs from the maqam's canonical position. */
  isModified: boolean;
  /** The cents value to actually play, including octave shift. */
  soundingCents: number;
}

export interface QanunState {
  /** All strings ordered low → high (low-octave first row, then mid, then tiz). */
  strings: QanunString[];
  /** Step the current string's mandal position by ±1 in its legal-positions list. */
  stepMandal: (stringIndex: number, step: 1 | -1) => void;
  /** Reset all strings to their canonical positions. */
  resetAll: () => void;
  /** Read the active maqam preset. */
  maqam: MaqamPreset;
  /** Compute a string's perde-naming context (current cents from karar
   *  in absolute terms, used by resolvePerde). */
  absoluteCents: (stringIndex: number) => number;
  /** Read the legal-position list for a string. */
  legalPositions: (stringIndex: number) => { cents_from_karar: number; label?: string }[];
  /** Read the current mandal selection index for a string. */
  currentMandalIndex: (stringIndex: number) => number;
}

/** Build the initial MandalState array for a maqam: 3 octaves × N rows
 *  of strings, each at its canonical position. */
function buildInitialState(maqam: MaqamPreset): MandalState[] {
  const out: MandalState[] = [];
  let i = 0;
  for (const reg of REGISTERS) {
    for (const row of maqam.rows) {
      out.push({
        string_index: i,
        row_degree: row.degree,
        octave: reg,
        current_cents_mid: row.canonical_cents,
        is_modified: false,
      });
      i++;
    }
  }
  return out;
}

export function useQanunState(maqam: MaqamPreset): QanunState {
  const [state, setState] = useState<MandalState[]>(() => buildInitialState(maqam));
  // Track the active mandal-position index per string, derived from
  // current_cents_mid via nearestMandalPosition.
  const [maqamId, setMaqamId] = useState(maqam.id);

  // Reset state whenever the maqam changes.
  if (maqamId !== maqam.id) {
    setMaqamId(maqam.id);
    setState(buildInitialState(maqam));
  }

  const stepMandal = useCallback((stringIndex: number, step: 1 | -1) => {
    setState((prev) => {
      const s = prev[stringIndex];
      if (!s) return prev;
      const row = maqam.rows.find((r) => r.degree === s.row_degree);
      if (!row) return prev;
      const legal = row.legal_positions;
      const { index } = nearestMandalPosition(s.current_cents_mid, legal);
      const newIdx = stepMandalIndex(index, step, legal);
      const newCents = legal[newIdx].cents_from_karar;
      const next = prev.slice();
      next[stringIndex] = {
        ...s,
        current_cents_mid: newCents,
        is_modified: Math.abs(newCents - row.canonical_cents) > 0.5,
      };
      return next;
    });
  }, [maqam]);

  const resetAll = useCallback(() => {
    setState(buildInitialState(maqam));
  }, [maqam]);

  const strings = useMemo<QanunString[]>(() => {
    return state.map((s) => {
      const row = maqam.rows.find((r) => r.degree === s.row_degree);
      const canonicalMid = row ? row.canonical_cents : 0;
      const sounding = s.current_cents_mid + octaveShiftCents(s.octave);
      return {
        index: s.string_index,
        rowDegree: s.row_degree,
        octave: s.octave,
        currentCentsMid: s.current_cents_mid,
        isModified: Math.abs(s.current_cents_mid - canonicalMid) > 0.5,
        soundingCents: sounding,
      };
    });
  }, [state, maqam]);

  const absoluteCents = useCallback(
    (stringIndex: number) => {
      const s = strings[stringIndex];
      return s ? s.soundingCents : 0;
    },
    [strings],
  );

  const legalPositions = useCallback(
    (stringIndex: number) => {
      const s = strings[stringIndex];
      if (!s) return [];
      const row = maqam.rows.find((r) => r.degree === s.rowDegree);
      return row ? row.legal_positions : [];
    },
    [strings, maqam],
  );

  const currentMandalIndex = useCallback(
    (stringIndex: number) => {
      const s = strings[stringIndex];
      if (!s) return 0;
      const row = maqam.rows.find((r) => r.degree === s.rowDegree);
      if (!row) return 0;
      const { index } = nearestMandalPosition(s.currentCentsMid, row.legal_positions);
      return index;
    },
    [strings, maqam],
  );

  return {
    strings,
    stepMandal,
    resetAll,
    maqam,
    absoluteCents,
    legalPositions,
    currentMandalIndex,
  };
}
