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
  'Hüseynî': 'Muhayyer',
  'Segâh':   'Tîz Segâh',
  'Çârgâh':  'Tîz Çârgâh',
  'Bûselik': 'Tîz Bûselik',
  'Hicaz':   'Şehnaz',
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

export interface ResolvedPerde {
  /** The perde name in the appropriate register. */
  name: string;
  /** 'low' | 'mid' | 'tiz' — based on the unreduced cents value. */
  octave: 'low' | 'mid' | 'tiz';
  /** Cents inflection from the canonical perde, signed, rounded to
   *  nearest integer. 0 means the pitch is exactly on the canonical. */
  inflection: number;
}

/** Resolve an arbitrary cents-from-karar (assumes Rast-anchored, but
 *  callers can shift first) to the closest canonical perde + octave +
 *  inflection. The "karar" is treated as Rast for naming purposes. */
export function resolvePerde(centsFromKarar: number): ResolvedPerde {
  // Determine register from the unreduced cents.
  let octave: 'low' | 'mid' | 'tiz';
  if (centsFromKarar < -50) octave = 'low';
  else if (centsFromKarar >= 1150) octave = 'tiz';
  else octave = 'mid';

  // Reduce to [0, 1200) for matching.
  let reduced = centsFromKarar;
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
