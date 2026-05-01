// Global perde dictionary — canonical perde names indexed by
// cents-mod-1200 position above Rast (G).
//
// Cents values derived from research/ottoman-turkish-makam.md §3, where
// each perde is given in Holdrian commas above Kaba Çârgâh (C). One
// Holdrian comma = 1200/53 ≈ 22.6415 cents. The reference C of the
// catalog is 31 commas below Rast (G); we re-express everything as
// cents above Rast so that a Rast-rooted maqam has Rast at 0¢.
//
// `resolvePerde(centsFromKarar)`:
//   1. Reduce cents to [0, 1200) — the perde-name cycle.
//   2. Find the closest perde in the dictionary.
//   3. Determine register from the unreduced cents (low <0, tiz ≥1200).
//   4. Apply low/tiz prefix transformations on the name where the
//      tradition expects them (Hüseynî → Muhayyer at +1200, etc.).
//   5. Return the unsigned-rounded inflection cents from canonical.

const COMMA = 1200 / 53; // ≈ 22.6415

/** Commas above Kaba Çârgâh (C) for each named perde. From
 *  research/ottoman-turkish-makam.md §3, restricted to the central
 *  octave for the cents-mod-1200 lookup. */
interface RawPerde {
  name: string;
  commasAboveKabaCargah: number;
}

// Central-octave perdes (Rast through Tîz Çârgâh, but normalized to
// 0..1200 above Rast).  Rast is at 31 commas above Kaba Çârgâh; we
// subtract 31 so Rast lands at 0¢ in the dictionary.
const RAW: RawPerde[] = [
  { name: 'Rast',         commasAboveKabaCargah: 31 },
  { name: 'Nim Zirgüle',  commasAboveKabaCargah: 35 },
  { name: 'Zirgüle',      commasAboveKabaCargah: 36 },
  { name: 'Dügâh',        commasAboveKabaCargah: 40 },
  { name: 'Kürdî',        commasAboveKabaCargah: 45 },
  { name: 'Segâh',        commasAboveKabaCargah: 49 },
  { name: 'Bûselik',      commasAboveKabaCargah: 49 }, // shares cell with Segâh: distinguish by makam context
  { name: 'Çârgâh',       commasAboveKabaCargah: 53 },
  { name: 'Nim Hicaz',    commasAboveKabaCargah: 57 },
  { name: 'Hicaz',        commasAboveKabaCargah: 58 },
  { name: 'Nevâ',         commasAboveKabaCargah: 62 },
  { name: 'Hisar',        commasAboveKabaCargah: 66 },
  { name: 'Hüseynî',      commasAboveKabaCargah: 71 },
  { name: 'Acem',         commasAboveKabaCargah: 75 },
  { name: 'Eviç',         commasAboveKabaCargah: 80 },
  { name: 'Mahur',        commasAboveKabaCargah: 81 },
  { name: 'Gerdâniye',    commasAboveKabaCargah: 84 },
];

const RAST_COMMAS = 31;

/** Canonical entries, deduplicated to one per name, with cents above Rast. */
interface PerdeEntry {
  name: string;
  centsAboveRast: number;
}

const PERDES: PerdeEntry[] = (() => {
  // Pick highest-comma entry per name (and dedupe Bûselik vs Segâh by
  // keeping Segâh as the default at 18-comma slot — Segâh is more common).
  const seen = new Map<string, PerdeEntry>();
  for (const r of RAW) {
    const cents = (r.commasAboveKabaCargah - RAST_COMMAS) * COMMA;
    if (!seen.has(r.name)) {
      seen.set(r.name, { name: r.name, centsAboveRast: cents });
    }
  }
  return Array.from(seen.values()).sort(
    (a, b) => a.centsAboveRast - b.centsAboveRast,
  );
})();

/** Names for the low and tiz registers — culturally meaningful when
 *  a perde shifts an octave (Hüseynî → Muhayyer, Segâh → Tîz Segâh). */
const TIZ_RENAME: Record<string, string> = {
  'Rast':     'Gerdâniye',
  'Dügâh':    'Muhayyer',
  'Hüseynî':  'Muhayyer',  // both name the high A
  'Segâh':    'Tîz Segâh',
  'Çârgâh':   'Tîz Çârgâh',
  'Bûselik':  'Tîz Bûselik',
  'Hicaz':    'Şehnaz',
  'Nim Hicaz': 'Nim Şehnaz',
};

const LOW_RENAME: Record<string, string> = {
  'Dügâh':   'Yegâh',
  'Hüseynî': 'Hüseynî Aşîrân',
  'Acem':    'Acem Aşîrân',
  'Eviç':    'Irak',
  'Mahur':   'Gevest',
  'Hicaz':   'Kaba Hicaz',
  'Nim Hicaz': 'Kaba Nim Hicaz',
  'Hisar':   'Pest Hisar',
  'Çârgâh':  'Kaba Çârgâh',
};

import type { MandalPosition, MaqamPreset } from './types';

export interface ResolvedPerde {
  /** The perde name in the appropriate register. */
  name: string;
  /** 'low' | 'mid' | 'tiz' — based on the unreduced cents value. */
  octave: 'low' | 'mid' | 'tiz';
  /** Cents inflection from the canonical perde, signed, rounded to
   *  nearest integer. 0 means the pitch is exactly on the canonical. */
  inflection: number;
}

/** Resolve a qanun-string's perde using the MAQAM PRESET as source of
 *  truth for canonical names. The dictionary-based `resolvePerde` is a
 *  fallback for when only cents are available; this function should be
 *  preferred whenever you have the row + legal position info, because
 *  maqam-specific tunings (e.g. Uşşâk's Segâh at ~135¢ flat from
 *  Dügâh) don't match the AEU dictionary's Segâh and would resolve to
 *  the wrong perde otherwise.
 *
 *  Algorithm:
 *    1. Find the maqam row for `rowDegree`. Its `canonical_name` is the
 *       authoritative perde name for that scale degree.
 *    2. If the current mandal position is canonical → use that name.
 *    3. If the position has a non-comma label (e.g. "Bûselik") →
 *       use the label as an alternate name.
 *    4. Otherwise (comma adjustment) → use canonical_name and report
 *       the cents inflection.
 *    5. Apply LOW/TIZ rename based on the player-relative octave. */
export function resolveMaqamPerde(
  ctx: {
    rowDegree: number;
    currentMandalIdx: number;
    legal: readonly MandalPosition[];
    octave: 'low' | 'mid' | 'tiz';
    currentCentsMid: number;
  },
  maqam: MaqamPreset,
): ResolvedPerde {
  const row = maqam.rows.find((r) => r.degree === ctx.rowDegree);
  if (!row) {
    return { name: '?', octave: ctx.octave, inflection: 0 };
  }

  const pos = ctx.legal[ctx.currentMandalIdx];
  let baseName: string = row.canonical_name;
  if (pos) {
    const label = pos.label ?? '';
    const isComma = /^[+\-]\d/.test(label) || label === 'canonical';
    if (pos.is_canonical) {
      baseName = row.canonical_name;
    } else if (label && !isComma) {
      baseName = label;
    } else {
      // Comma adjustment from canonical — keep the row's canonical name.
      baseName = row.canonical_name;
    }
  }

  let displayName = baseName;
  if (ctx.octave === 'tiz' && TIZ_RENAME[baseName]) {
    displayName = TIZ_RENAME[baseName];
  } else if (ctx.octave === 'low' && LOW_RENAME[baseName]) {
    displayName = LOW_RENAME[baseName];
  }

  const inflection = Math.round(ctx.currentCentsMid - row.canonical_cents);
  return {
    name: displayName,
    octave: ctx.octave,
    inflection,
  };
}

/** Look up a perde's cents-above-Rast by name. Returns 0 if not found
 *  (treating unknown karar perde as Rast-equivalent — safe fallback). */
export function lookupPerdeCents(name: string): number {
  // Walk the dictionary; case-sensitive match on the canonical name.
  for (const p of PERDES) {
    if (p.name === name) return p.centsAboveRast;
  }
  // Try LOW_RENAME / TIZ_RENAME source-side lookups so that aliases like
  // "Yegâh" (= low Dügâh) or "Muhayyer" (= tiz Dügâh) resolve to their
  // mid-octave canonical's cents. Useful when a maqam's karar_perde is
  // actually a register-renamed alias.
  for (const [base, low] of Object.entries(LOW_RENAME)) {
    if (low === name) {
      const baseCents = lookupPerdeCents(base);
      return baseCents - 1200;
    }
  }
  for (const [base, tiz] of Object.entries(TIZ_RENAME)) {
    if (tiz === name) {
      const baseCents = lookupPerdeCents(base);
      return baseCents + 1200;
    }
  }
  return 0;
}

/** Resolve an arbitrary cents-from-karar to the closest canonical perde +
 *  octave + inflection.
 *
 *  `kararCentsAboveRast`: the absolute cents of the maqam's karar perde
 *  above Rast (the dictionary's reference). For Rast karar it's 0; for
 *  Uşşâk / Hüseynî / Saba / Bayati / Hicaz (all karar=Dügâh) it's ~204.
 *  The lookup is on the ABSOLUTE pitch (centsFromKarar + offset) so a
 *  Dügâh-karar maqam labels its karar as "Dügâh", not "Rast". */
export function resolvePerde(centsFromKarar: number, kararCentsAboveRast = 0): ResolvedPerde {
  // Player-relative register — based on cents from karar (where the
  // hand is on the qanun, anchored to karar regardless of which perde
  // karar is).
  let octave: 'low' | 'mid' | 'tiz';
  if (centsFromKarar < -50) octave = 'low';
  else if (centsFromKarar >= 1150) octave = 'tiz';
  else octave = 'mid';

  // Absolute cents above Rast = centsFromKarar + kararCentsAboveRast.
  // Reduce to [0, 1200) for matching against the dictionary (which is
  // indexed by central-octave cents above Rast).
  const absoluteCents = centsFromKarar + kararCentsAboveRast;
  let reduced = absoluteCents;
  while (reduced < 0) reduced += 1200;
  while (reduced >= 1200) reduced -= 1200;

  // Find the closest perde in the dictionary.
  let best = PERDES[0];
  let bestDist = Math.abs(reduced - best.centsAboveRast);
  for (const p of PERDES) {
    let d = Math.abs(reduced - p.centsAboveRast);
    // Allow wrap-around: if reduced is just below 1200 and the perde
    // is just above 0, treat them as close.
    const wrapDist = Math.abs(reduced - p.centsAboveRast - 1200);
    if (wrapDist < d) d = wrapDist;
    if (d < bestDist) {
      bestDist = d;
      best = p;
    }
  }

  // Apply register-aware rename.
  let displayName = best.name;
  if (octave === 'tiz' && TIZ_RENAME[best.name]) {
    displayName = TIZ_RENAME[best.name];
  } else if (octave === 'low' && LOW_RENAME[best.name]) {
    displayName = LOW_RENAME[best.name];
  }

  // Inflection: signed difference from the canonical position, mod 1200,
  // brought into [-600, +600] for human-friendly readout.
  let inflection = reduced - best.centsAboveRast;
  if (inflection > 600) inflection -= 1200;
  if (inflection < -600) inflection += 1200;

  return {
    name: displayName,
    octave,
    inflection: Math.round(inflection),
  };
}
