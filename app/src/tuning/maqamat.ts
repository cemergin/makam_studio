// 8 v1 maqamat — Rast, Hicaz, Hüseynî, Uşşâk, Saba, Segâh, Bayati,
// Nihavend.
//
// Cents values derive from research/ottoman-turkish-makam.md §3 and §4.
// One Holdrian comma = 1200/53 ≈ 22.64 cents. The AEU-canonical flat
// systems used:
//   - "1-koma flat" (Segâh)  ≈ -22.6¢ from natural
//   - "4-koma flat" (bakiye) ≈ -90.6¢
//   - "5-koma flat" (küçük mücenneb) ≈ -113.2¢
//   - "1-koma sharp" (Eviç) ≈ +22.6¢ above F = ≈ -67.9¢ below F♯
//
// All scales here are quoted relative to their own karar = 0¢, so a
// makam ending on Dügâh (A) starts at 0¢ even though Dügâh is 9 commas
// above Rast in the absolute system.
//
// `legal_positions` for each row include the canonical pitch plus
// alternates (e.g. Eviç ↔ Acem, Hisar ↔ Hüseynî) plus ±9¢ / ±22¢ comma
// adjustments per spec §3 of design_notes.

import type { MaqamPreset, MandalPosition } from './types';

const COMMA = 1200 / 53;

/** Quick helper: emit canonical + small comma adjustments (±9¢, ±22¢)
 *  + listed alternates as legal mandal positions. */
function positions(
  canonicalCents: number,
  alternates: Array<{ cents: number; label: string }> = [],
): MandalPosition[] {
  const out: MandalPosition[] = [];
  // Comma-fraction adjustments below canonical.
  out.push({ cents_from_karar: canonicalCents - 22, label: '−22¢' });
  out.push({ cents_from_karar: canonicalCents - 9,  label: '−9¢'  });
  // Alternates that fall below canonical.
  for (const a of alternates.filter((a) => a.cents < canonicalCents)) {
    out.push({ cents_from_karar: a.cents, label: a.label });
  }
  // Canonical position.
  out.push({ cents_from_karar: canonicalCents, label: 'canonical', is_canonical: true });
  // Alternates above canonical.
  for (const a of alternates.filter((a) => a.cents > canonicalCents)) {
    out.push({ cents_from_karar: a.cents, label: a.label });
  }
  // Comma-fraction adjustments above canonical.
  out.push({ cents_from_karar: canonicalCents + 9,  label: '+9¢'  });
  out.push({ cents_from_karar: canonicalCents + 22, label: '+22¢' });
  // Sort and dedupe within ±2¢ tolerance.
  out.sort((a, b) => a.cents_from_karar - b.cents_from_karar);
  const dedup: MandalPosition[] = [];
  for (const p of out) {
    if (
      dedup.length === 0 ||
      Math.abs(p.cents_from_karar - dedup[dedup.length - 1].cents_from_karar) > 2
    ) {
      dedup.push(p);
    } else if (p.is_canonical) {
      // prefer the canonical entry when collapsing duplicates
      dedup[dedup.length - 1] = p;
    }
  }
  return dedup;
}

// ---- Ottoman comma cents (rounded from Karaosmanoğlu measurements
// where the AEU theoretical value differs from typical practice).
const NEUTRAL_THIRD = 5 * COMMA;          // ≈ 113¢ (Segâh perde above Dügâh)
const NEUTRAL_SEVENTH = 9 * COMMA;        // ≈ 204¢ — used for relative reasoning
const PERFECT_FOURTH = Math.round(498);   // ≈ 498¢ exact (4-comma adjustment)
const PERFECT_FIFTH = 31 * COMMA;         // ≈ 702¢ (Rast→Nevâ)

// ---- Helpers for the perde positions used across maqamat (above Rast).
const C_RAST_PERDES = {
  rast:      0,
  segah:     22 * COMMA,            // ≈ 498¢ minus comma — wait: Segâh (B-1k) is at 5 commas above Dügâh
  // For absolute Rast-anchored math we use the comma counts from §3 of research:
  //   Rast=31, Dügâh=40, Segâh=49, Çârgâh=53, Nevâ=62, Hüseynî=71, Eviç=80, Gerdâniye=84
  // Subtract 31 to get comma-from-Rast.
};

/** From-Rast cents for absolute perde positions (centered). */
const fromRast = (commas: number) => commas * COMMA;

// Pre-compute common interval cents.
const RAST_DUGAH      = fromRast(9);   // 9 commas = ≈ 204¢
const RAST_SEGAH      = fromRast(18);  // 18 commas = ≈ 408¢
const RAST_CARGAH     = fromRast(22);  // 22 commas = ≈ 498¢
const RAST_NEVA       = fromRast(31);  // 31 commas = ≈ 702¢
const RAST_HUSEYNI    = fromRast(40);  // 40 commas = ≈ 906¢
const RAST_EVIC       = fromRast(49);  // 49 commas = ≈ 1109¢
const RAST_GERDANIYE  = fromRast(53);  // 53 commas = ≈ 1200¢

// Suppress unused-var warnings from the constants block above (kept
// for future-self reference in this file).
void NEUTRAL_THIRD; void NEUTRAL_SEVENTH; void PERFECT_FOURTH; void PERFECT_FIFTH;
void C_RAST_PERDES;

/** Helper: quick maqam definition, all rows in one octave. */
interface RowDef {
  name: string;
  native?: string;
  cents: number;
  alternates?: Array<{ cents: number; label: string }>;
}

function maqam(
  id: string,
  canonical: string,
  native: string | undefined,
  karar: string,
  rows: RowDef[],
  seyir?: string,
  notes?: string,
): MaqamPreset {
  return {
    id,
    name: { canonical, native },
    tradition: 'turkish',
    karar_perde: karar,
    rows: rows.map((r, i) => ({
      degree: i + 1,
      canonical_name: r.name,
      canonical_name_native: r.native,
      canonical_cents: r.cents,
      legal_positions: positions(r.cents, r.alternates ?? []),
    })),
    seyir,
    notes,
  };
}

// =============================================================
//  THE 8 V1 MAQAMAT
// =============================================================

export const RAST: MaqamPreset = maqam(
  'turkish.classical.rast',
  'Rast',
  'راست',
  'Rast',
  [
    { name: 'Rast',       native: 'راست',     cents: 0 },
    { name: 'Dügâh',      native: 'دوكاه',    cents: RAST_DUGAH },
    { name: 'Segâh',      native: 'سه‌گاه',   cents: RAST_SEGAH,
      alternates: [{ cents: RAST_SEGAH + COMMA, label: 'Bûselik' }] },
    { name: 'Çârgâh',     native: 'چارگاه',   cents: RAST_CARGAH },
    { name: 'Nevâ',       native: 'نوا',      cents: RAST_NEVA },
    { name: 'Hüseynî',    native: 'حسینی',    cents: RAST_HUSEYNI,
      alternates: [{ cents: 75 * COMMA - 31 * COMMA, label: 'Acem' }] },
    { name: 'Eviç',       native: 'اوج',      cents: RAST_EVIC,
      alternates: [{ cents: 75 * COMMA - 31 * COMMA + COMMA * 4, label: 'Acem' }] },
    { name: 'Gerdâniye',  native: 'گردانیه',  cents: RAST_GERDANIYE },
  ],
  'Çıkıcı (ascending). Dignified, "the natural makam." Karar Rast (G), güçlü Nevâ (D), tîz durak Gerdâniye.',
  'durak Rast • güçlü Nevâ',
);

export const HICAZ: MaqamPreset = maqam(
  'turkish.classical.hicaz',
  'Hicaz',
  'حجاز',
  'Dügâh',
  [
    { name: 'Dügâh',      native: 'دوكاه',    cents: 0 },
    // 5-koma flat above Dügâh — Zirgüle perde (≈ 113¢)
    { name: 'Zirgüle',    native: 'زرگوله',   cents: 5 * COMMA },
    // Augmented second to Nim Hicaz / C♯ on the qanun layout — ≈ 386¢
    { name: 'Nim Hicaz',  native: '',         cents: 17 * COMMA },
    { name: 'Çârgâh',     native: 'چارگاه',   cents: 22 * COMMA },
    { name: 'Nevâ',       native: 'نوا',      cents: 31 * COMMA },
    { name: 'Hisar',      native: 'حصار',     cents: 35 * COMMA,
      alternates: [{ cents: 40 * COMMA, label: 'Hüseynî' }] },
    { name: 'Eviç',       native: 'اوج',      cents: 49 * COMMA,
      alternates: [{ cents: 44 * COMMA, label: 'Acem' }] },
    { name: 'Muhayyer',   native: 'محیر',     cents: 53 * COMMA },
  ],
  'İnici-çıkıcı (descending-ascending). Built on Dügâh; iconic augmented-second between Zirgüle and Nim Hicaz.',
  'durak Dügâh • güçlü Hüseynî',
);

export const HUSEYNI: MaqamPreset = maqam(
  'turkish.classical.huseyni',
  'Hüseynî',
  'حسینی',
  'Dügâh',
  [
    { name: 'Dügâh',      native: 'دوكاه',    cents: 0 },
    { name: 'Segâh',      native: 'سه‌گاه',   cents: 5 * COMMA },
    { name: 'Çârgâh',     native: 'چارگاه',   cents: 13 * COMMA },
    { name: 'Nevâ',       native: 'نوا',      cents: 22 * COMMA },
    { name: 'Hüseynî',    native: 'حسینی',    cents: 31 * COMMA },
    { name: 'Eviç',       native: 'اوج',      cents: 40 * COMMA,
      alternates: [{ cents: 35 * COMMA, label: 'Acem' }] },
    { name: 'Gerdâniye',  native: 'گردانیه',  cents: 44 * COMMA },
    { name: 'Muhayyer',   native: 'محیر',     cents: 53 * COMMA },
  ],
  'İnici-çıkıcı. Bedrock folk + classical. Hüseynî perde carries identity weight.',
  'durak Dügâh • güçlü Hüseynî',
);

// "Karaosmanoğlu's measurements show performers actually play this around
//  120–145 ¢" — we use ~135¢ for Uşşâk segâh perde (between Segâh and Bûselik).
const USSAK_SEGAH = 135;

export const USSAK: MaqamPreset = maqam(
  'turkish.classical.ussak',
  'Uşşâk',
  'عشاق',
  'Dügâh',
  [
    { name: 'Dügâh',      native: 'دوكاه',    cents: 0 },
    { name: 'Segâh',      native: 'سه‌گاه',   cents: USSAK_SEGAH,
      alternates: [{ cents: 5 * COMMA, label: 'Segâh canonical' }] },
    { name: 'Çârgâh',     native: 'چارگاه',   cents: 13 * COMMA },
    { name: 'Nevâ',       native: 'نوا',      cents: 22 * COMMA },
    { name: 'Hüseynî',    native: 'حسینی',    cents: 31 * COMMA },
    { name: 'Acem',       native: 'عجم',      cents: 35 * COMMA },
    { name: 'Gerdâniye',  native: 'گردانیه',  cents: 44 * COMMA },
    { name: 'Muhayyer',   native: 'محیر',     cents: 53 * COMMA },
  ],
  'Çıkıcı. "Longing." The canonical Uşşâk segâh sits 4–5 commas flat — empirically nearer 135¢ than AEU\'s 113¢.',
  'durak Dügâh • güçlü Nevâ',
);

export const SABA: MaqamPreset = maqam(
  'turkish.classical.saba',
  'Saba',
  'صبا',
  'Dügâh',
  [
    { name: 'Dügâh',      native: 'دوكاه',    cents: 0 },
    { name: 'Segâh',      native: 'سه‌گاه',   cents: 5 * COMMA },
    { name: 'Çârgâh',     native: 'چارگاه',   cents: 13 * COMMA },
    // Lowered fourth — Saba's calling card. ≈ 18 commas (Hicaz perde)
    { name: 'Hicaz',      native: 'حجاز',     cents: 18 * COMMA },
    // Pestperde — 4-koma flat ≈ 26 commas
    { name: 'Hisar',      native: 'حصار',     cents: 26 * COMMA },
    { name: 'Nevâ',       native: 'نوا',      cents: 31 * COMMA },
    { name: 'Hüseynî',    native: 'حسینی',    cents: 35 * COMMA,
      alternates: [{ cents: 40 * COMMA, label: 'Hüseynî natural' }] },
    { name: 'Gerdâniye',  native: 'گردانیه',  cents: 44 * COMMA },
  ],
  'İnici. Yearning, the only canonical makam with downward-resolving identity.',
  'durak Dügâh • güçlü Çârgâh',
);

export const SEGAH: MaqamPreset = maqam(
  'turkish.classical.segah',
  'Segâh',
  'سه‌گاه',
  'Segâh',
  [
    { name: 'Segâh',      native: 'سه‌گاه',   cents: 0 },
    { name: 'Çârgâh',     native: 'چارگاه',   cents: 4 * COMMA },
    { name: 'Nevâ',       native: 'نوا',      cents: 13 * COMMA },
    { name: 'Hüseynî',    native: 'حسینی',    cents: 22 * COMMA },
    { name: 'Eviç',       native: 'اوج',      cents: 31 * COMMA },
    { name: 'Gerdâniye',  native: 'گردانیه',  cents: 35 * COMMA,
      alternates: [{ cents: 39 * COMMA, label: 'Şehnaz' }] },
    { name: 'Muhayyer',   native: 'محیر',     cents: 44 * COMMA },
    { name: 'Tîz Segâh',  native: '',         cents: 53 * COMMA },
  ],
  'Çıkıcı. Mystical; durak Segâh perde itself — a microtonal tonic. Often Sufi-repertoire.',
  'durak Segâh • güçlü Hüseynî',
);

export const BAYATI: MaqamPreset = maqam(
  'turkish.classical.bayati',
  'Bayati',
  'بیاتی',
  'Dügâh',
  [
    { name: 'Dügâh',      native: 'دوكاه',    cents: 0 },
    { name: 'Segâh',      native: 'سه‌گاه',   cents: USSAK_SEGAH }, // shares Uşşâk-style flat segâh
    { name: 'Çârgâh',     native: 'چارگاه',   cents: 13 * COMMA },
    { name: 'Nevâ',       native: 'نوا',      cents: 22 * COMMA },
    { name: 'Hüseynî',    native: 'حسینی',    cents: 31 * COMMA },
    { name: 'Acem',       native: 'عجم',      cents: 35 * COMMA },
    { name: 'Gerdâniye',  native: 'گردانیه',  cents: 44 * COMMA },
    { name: 'Muhayyer',   native: 'محیر',     cents: 53 * COMMA },
  ],
  'İnici-çıkıcı. Levantine-Turkish bridge: same scale as Uşşâk but enters from above.',
  'durak Dügâh • güçlü Nevâ',
);

export const NIHAVEND: MaqamPreset = maqam(
  'turkish.classical.nihavend',
  'Nihavend',
  'نهاوند',
  'Rast',
  [
    { name: 'Rast',       native: 'راست',     cents: 0 },
    { name: 'Dügâh',      native: 'دوكاه',    cents: 9 * COMMA },
    { name: 'Kürdî',      native: 'کردی',     cents: 14 * COMMA }, // 5-koma flat above Dügâh
    { name: 'Çârgâh',     native: 'چارگاه',   cents: 22 * COMMA },
    { name: 'Nevâ',       native: 'نوا',      cents: 31 * COMMA },
    { name: 'Hisar',      native: 'حصار',     cents: 35 * COMMA },
    { name: 'Eviç',       native: 'اوج',      cents: 49 * COMMA, // F♯
      alternates: [{ cents: 44 * COMMA, label: 'Acem' }] },
    { name: 'Gerdâniye',  native: 'گردانیه',  cents: 53 * COMMA },
  ],
  'İnici-çıkıcı. The most Western-minor-sounding makam; gateway for Western-trained ears.',
  'durak Rast • güçlü Nevâ',
);

export const ALL_MAQAMAT: MaqamPreset[] = [
  RAST, HICAZ, HUSEYNI, USSAK, SABA, SEGAH, BAYATI, NIHAVEND,
];

export function getMaqamById(id: string): MaqamPreset | undefined {
  return ALL_MAQAMAT.find((m) => m.id === id);
}

/** Karar frequency lookup. The user fixes a "concert pitch" for the
 *  qanun overall — we default karar = A3 (220 Hz) for Dügâh-rooted
 *  maqamat and G3 (~196 Hz) for Rast-rooted. The actual mapping is in
 *  `audio/master-bus.ts`; this is just a sensible default for v1. */
export function defaultKararHz(maqam: MaqamPreset): number {
  if (maqam.karar_perde === 'Rast') return 196.0; // G3
  if (maqam.karar_perde === 'Segâh') return 247.5; // ≈ B3 1-koma flat
  return 220.0; // A3 — Dügâh by default
}
