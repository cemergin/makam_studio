// Tuning-data layer types — minimal v1 subset matching docs/spec/v1.md §13.
//
// Cents-from-karar is the canonical engine value. Hz is computed from
// karar Hz + cents_from_karar at trigger time. Ratios are informational
// only in v1 (`Pitch.ratio` is a string, never used for playback).
//
// `MandalState` is per-instrument session state (NOT serialized in
// presets). It tracks per-string current cents-offset within its legal
// retuning range.

export type Tradition =
  | 'turkish'
  | 'arabic_levantine'
  | 'arabic_egyptian'
  | 'persian';

export interface KararSpec {
  /** Perde name of the karar — e.g. 'Dügâh', 'Rast'. */
  name: string;
  /** Frequency in Hz — what 0¢ from karar evaluates to. */
  hz: number;
}

export interface Pitch {
  /** 1-indexed scale degree (1 = unison/karar). */
  degree: number;
  /** Canonical perde name (Latin Romanization). */
  name: string;
  /** Optional native-script form. */
  name_native?: string;
  /** Authoritative engine value — cents above karar. Signed; one decimal. */
  cents_from_karar: number;
}

/** A single legal mandal position for one course. The cents value is
 *  measured from the maqam's karar (NOT relative to the row's canonical
 *  pitch) so ranking + nearestMandalPosition can compare uniformly. */
export interface MandalPosition {
  /** Cents from karar (absolute, can exceed octaves for tiz/low). */
  cents_from_karar: number;
  /** Optional human label (`"+9¢"`, `"Aleppine Sikah"`, `"Acem"`). */
  label?: string;
  /** Whether this is the canonical position for this row in the active maqam. */
  is_canonical?: boolean;
}

export interface MaqamRow {
  /** 1-indexed scale-degree row, modulo octave. 1..N where N is scale length. */
  degree: number;
  /** Canonical name for this row (in mid octave). */
  canonical_name: string;
  /** Canonical native-script form. */
  canonical_name_native?: string;
  /** Canonical cents from karar (mid octave; tiz/low add ±1200). */
  canonical_cents: number;
  /** Legal mandal positions in cents from karar (mid octave reference). */
  legal_positions: MandalPosition[];
}

/** A maqam preset, restricted to v1 needs. Pitches are 1 octave;
 *  the qanun stack repeats the row across low/mid/tiz octaves. */
export interface MaqamPreset {
  id: string;
  name: { canonical: string; native?: string };
  tradition: Tradition;
  /** Karar perde name — references global perde dictionary. */
  karar_perde: string;
  /** Canonical scale rows, ascending. Length 7 typically. */
  rows: MaqamRow[];
  /** Optional descending variant rows (overrides ascending where present). */
  rows_descending?: MaqamRow[];
  /** Free-form seyir text — shown italicized in Spectral. */
  seyir?: string;
  /** Notes about which degree is durak / güçlü / tîz durak. */
  notes?: string;
}

/** Per-string session state. Tracks the row's current selected mandal
 *  position; `octave` records which register the string lives in. */
export interface MandalState {
  /** 1-indexed string number from low to high in the rendered grid. */
  string_index: number;
  /** Which scale-row this string belongs to (1..N within an octave). */
  row_degree: number;
  /** 'low' (-12) | 'mid' (0) | 'tiz' (+12). Cents-octave shift. */
  octave: 'low' | 'mid' | 'tiz';
  /** The active mandal position for this string, expressed as cents
   *  from karar in the row's mid-octave reference. */
  current_cents_mid: number;
  /** Whether this position differs from the maqam's canonical position. */
  is_modified: boolean;
}
