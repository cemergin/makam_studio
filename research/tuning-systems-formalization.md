---
title: Tuning Systems Formalization — A Unified Data Model for makam_studio
audience: Engineers building the makam_studio engine. Musicologists auditing the schema. Future contributors writing import/export code.
tldr: |
  Survey of microtonal tuning formats (.scl, .kbm, .tun, MTS, MTS-ESP, SonicWeave) and the four maqam-relevant tuning grids (53-EDO Holdrian, 24-EDO quarter-tone, free-cents, just-ratio), then a v1 schema proposal that stores presets in a portable JSON shape with cents as the canonical unit, optional ratio sources, ascending/descending asymmetry, ajnas composition for Arabic, mandal availability per course for the qanun model, and tradition-aware snap grids. Recommends shipping .scl import/export in v1, .kbm import in v1, MTS-ESP read in v1, full MTS SysEx in v2.
skip_if: You only care about which maqamat to ship in MVP — see `arabic-levantine-maqam.md` and `ottoman-turkish-makam.md`. You only care about UI — see `ux-interface-review.md`.
date: 2026-04-30
status: draft
---

# TL;DR

- **Cents is the canonical internal unit.** Store every pitch as cents-from-karar (signed float, one decimal place). Ratios are kept as an optional secondary representation when the source theory states them as ratios; they're informational, not authoritative for playback.
- **A maqam preset is a structured record, not a flat list.** Top-level fields: `id`, `name` (with native script + romanizations), `tradition`, `region`, `karar_perde`, `pitches[]`, optional `pitches_descending[]`, optional `ajnas[]`, optional `seyir`, `aliases[]`, `references[]`, `format_version`. Every pitch is `{ degree, name, cents_from_karar, ratio?, practice_range_cents?, mandal_position? }`.
- **The qanun is modeled separately from the scale.** A `course_state[]` records, per course, which `available_pitches[]` are wired in (the mandal stack) and which one is currently active. Loading a maqam preset writes a `course_state` for the current karar; the user can override per-course at any time.
- **Tradition determines the snap grid, not the storage format.** `turkish` → 53-EDO Holdrian (~22.6 cents per step). `arabic_*` → 24-EDO quarter-tone (50 cents). `persian` → free continuous cents (no snap). `azeri` and `shashmaqam` → flagged "v1 uses arabic 24-EDO grid as a teaching simplification, v2 to revisit."
- **v1 ships .scl + .kbm import/export and MTS-ESP read; ships sharable URLs that encode preset state via base64 JSON.** v2 adds full MTS SysEx import, .tun import, dastgāh→gusheh hierarchy, and ratio-first storage for users who want exact JI.
- **The most controversial decision: cents-as-canonical, not ratios.** It loses theoretical purity for Pythagorean and just-intonation theorists who read maqam as ratios (Yarman, some Turkish theorists), but it's the only representation that handles Persian dastgāh practice (where pitches are continuous and ratio-mismatched), Egyptian quarter-tones (where 24-EDO is *defined* in equal cents), and cross-tradition export to Scala/MTS-ESP/AnaMark — all of which assume cents downstream anyway. Ratios remain in the schema as informational; we just don't compute from them at audio rate.

---

## 1. The format landscape

The microtonal world has converged, mostly grudgingly, on a small set of file formats. Each was designed for a slightly different problem; understanding the tradeoffs is necessary before choosing what makam_studio writes to disk and what it accepts from outside.

### 1.1 Scala .scl — the de facto scale format

The Scala scale file format, defined by Manuel Op de Coul, is the single most-supported microtonal file in the wild. Synths, samplers, plugins, hardware (Oddsound MTS-ESP, Pianoteq, Korg Minilogue, Roli Seaboard, Madrona Aalto, dozens more) read it. It is a plain ASCII file with this shape:

```
! description.scl  (lines beginning with ! are comments and ignored)
A short human-readable description of the scale, one line, may be empty
 N                       (the number of pitch lines that follow)
!
 first-pitch
 second-pitch
 ...
 N-th-pitch
```

Two unbreakable rules:

1. **The unison is implicit.** The first stored pitch is the *second* note of the scale. The first note (1/1, 0.0 cents) is never written.
2. **The last stored pitch is the period.** For an octave-repeating scale, that's `2/1` or `1200.0`. For a non-octave scale (Bohlen-Pierce, Carlos Alpha, etc.) it's whatever the period is.

A pitch line is one of:
- A **ratio**, like `3/2` or `81/64` or `5` (where `5` is shorthand for `5/1`). Detected by absence of a decimal point.
- A **cents value**, like `701.955` or `100.` or `-15.0`. Detected by presence of a decimal point.

Anything after the value on the line is allowed and ignored: `5/4 just major third`, `701.9 fifth`. Whitespace at start of line is allowed.

**Strengths:** universal, trivially parsed, human-readable, supports both ratios and cents, no embedded MIDI assumption.

**Weaknesses:** carries no naming for individual pitches (no "Segâh" label), no ascending/descending asymmetry, no metadata other than the description line, no MIDI mapping (that's .kbm's job). The file says *what the scale is*; it says nothing about *what key it's in* or *how it maps to a keyboard*.

makam_studio decision: **adopt .scl as a first-class import/export format in v1.** Round-trip with any DAW or hardware microtuner Just Works. We will lose pitch *names* on export, which is a real loss — but importing a .scl into makam_studio yields a usable preset that the user can re-name and re-categorize.

### 1.2 Scala .kbm — keyboard mapping

A .kbm file binds a .scl scale to a MIDI keyboard. It answers: "MIDI note 60 plays scale degree X at frequency Y, the scale repeats every M MIDI notes, scale degree Z is the octave-equivalent." It is, like .scl, plain ASCII with `!` comments. The non-comment lines, in order, are:

1. **Map size** — number of mapping entries (typically 12 for a chromatic-style mapping, can be larger or smaller).
2. **First MIDI note** to retune.
3. **Last MIDI note** to retune.
4. **MIDI middle note** — the note that maps to the *first* scale degree (the 1/1).
5. **Reference MIDI note** — the one whose frequency is given on the next line.
6. **Reference frequency** in Hz (float).
7. **Scale degree treated as the formal octave** — this is the index in the .scl file (0 = unison, last index = period). For a 7-note maqam stored as a 7-pitch .scl, you'd typically put 7 here so the scale repeats at the period.
8. **Mapping entries** — one per line, `map size` of them. Each is either an integer (which scale degree this MIDI step plays) or a lowercase `x` (this MIDI step is silent / not mapped).

The clever bit is the seven-step header: it cleanly separates *what scale* from *what key* from *what keyboard layout*. You can keep one .scl and ship a dozen .kbm files for different karar choices.

makam_studio decision: **import .kbm in v1; export .kbm only if exporting to a destination that requires it (it can otherwise be auto-generated from the preset's karar).** Most users will never see a .kbm; we generate one on demand for export-to-DAW workflows.

### 1.3 AnaMark .tun — full-keyboard tuning

Mark Henning's .tun format takes a different tack: it specifies an absolute pitch in cents for *every one of 128 MIDI notes*. There's no scale-plus-mapping decomposition; the file just says "MIDI 0 = -6900.0 cents, MIDI 1 = -6800.0 cents, ..., MIDI 127 = X cents." V2 adds optional sections (`[Scale Begin]`, `[Info]`, `[Functional Tuning]`, `[Mapping]`, `[Editor Specifics]`) that overlay scale-style metadata on top of the absolute table, but the core abstraction is "table of 128 cent values."

**Strength:** no decoding. The synth reads 128 numbers and is done.

**Weakness:** loses the structural information. A .scl + .kbm pair tells the synth "this is a 9-note scale repeating at 1200 cents starting from MIDI 60." A .tun says "here are 128 numbers." Same audio result; very different data model.

makam_studio decision: **v1 reads .tun (because some users will want to import existing libraries), exports .tun only if requested; defers writing .tun by default.** We prefer .scl + .kbm because the structure round-trips with our internal model.

### 1.4 MIDI Tuning Standard (MTS) — SysEx-based

MTS is in-band: tuning information rides on the MIDI cable as System Exclusive (SysEx) messages. Two main flavors:

- **Bulk Tuning Dump.** One message containing 128 frequencies, one per MIDI note. Each frequency is encoded in 3 bytes: byte 0 = the highest equal-tempered semitone *not exceeding* the frequency (0–127); bytes 1–2 = a 14-bit fraction of 100 cents above that semitone. Effective resolution: 100 / 2^14 ≈ 0.0061 cents.
- **Single Note Tuning Change.** One message changes the tuning of one (or a few) MIDI notes, potentially in real time, optionally affecting notes that are currently sounding.

There's also a **Scale/Octave Tuning** variant which sends 12 cents-offsets (one per pitch class) and applies them across all octaves — much smaller, much less expressive.

MTS lives at the protocol layer, which means in a browser context it requires Web MIDI output. For a browser app that *also* wants to drive an external hardware synth from a maqam preset, MTS is the right protocol.

makam_studio decision: **v2 feature.** The browser app is self-contained for sound; we don't need MTS to play through the qanun. Adding MTS export-to-external-device is a power-user feature that earns its complexity later.

### 1.5 MTS-ESP (ODDSound)

MTS-ESP is the modern in-DAW solution. ODDSound's library is C++; the protocol is a shared-memory mailbox that lets a "master" plugin push tuning updates to all "client" plugins in real time, with the dynamic tuning concept first-class (so you can crossfade tunings, automate tuning changes, etc.). Importantly, MTS-ESP Mini (the free master) can load .scl, .kbm, .tun, and MTS SysEx files, which makes MTS-ESP essentially the universal *consumer* of microtuning data in modern DAWs.

The browser context here is interesting. There is no MTS-ESP for browsers — it's a desktop plugin protocol. But several projects (Scale Workshop) export `.kbm + .scl` *intended for* MTS-ESP Mini consumption.

makam_studio decision: **v1 produces .scl files compatible with MTS-ESP Mini's loader.** That is: standard cents-format Scala files that an MTS-ESP user can drag into their DAW and immediately use to tune any MTS-ESP-aware soft synth. We do not implement MTS-ESP itself.

### 1.6 Scale Workshop / SonicWeave

Sevish + xenharmonic-devs' Scale Workshop is the de facto modern web-based microtonal scale editor. As of v3 it ships a domain-specific language called **SonicWeave** for building scales programmatically: `3/2`, `701.9`, `2\\12` (n steps of m-EDO), monzos `[a b c>`, FJS intervals (`M3^5`), and arithmetic between intervals. The native serialization for v3 is a SonicWeave source string, not JSON. It also imports/exports .scl, .kbm, and .tun.

Two relevant signals from Scale Workshop:

- **URL-based sharing.** Scale Workshop encodes the entire scale into a sharable URL. This is the same pattern BeatForge uses for pattern shares.
- **No native JSON spec to converge on.** Scale Workshop's "format" is SonicWeave source code, which is too expressive for our needs and tightly coupled to xenharmonic theory primitives that don't all map cleanly onto maqam concepts.

makam_studio decision: **define our own JSON shape (specified in §5).** Adopt Scale Workshop's URL-share *pattern*, but with our schema, not theirs. Optionally export SonicWeave source as a "developer" format in v2.

### 1.7 Comma-based notation systems

For completeness: **Sagittal** (Secor + Keenan, 2001) is a notation system using arrow-shaped symbols whose flags encode specific commas (5-comma, 7-comma, 11-diesis, etc.); it's included in the SMuFL standard music font layout. **HEJI** / **HEWM** (Helmholtz-Ellis Just Intonation, Sabat + von Schweinitz 2000–2004) attaches accidentals to each prime harmonic. **Ben Johnston's notation** redefines plain `C-G-D-A-E-B` as a Ptolemaic JI series and adds `+/-` for the syntonic comma plus prime-specific symbols.

These are *display* notation systems, not file formats. They matter to makam_studio only in that the AEU Turkish system has its own native comma-accidentals (1, 4, 5, 8 commas sharp/flat) that are *also* a comma notation, and we need to be able to render them. The schema must therefore carry a `display_accidental` hint per pitch (e.g., "5-comma flat") so the UI can render the Turkish glyph rather than guessing from cents.

---

## 2. Pythagorean intervals and commas

The maqam world is fundamentally a Pythagorean world with overlay corrections. Commas — small intervals that fall between "the same note" computed two different ways — are the unit of correction.

### 2.1 The four commas to know

| Comma | Ratio | Cents | Where it shows up |
|---|---|---|---|
| Holdrian (Turkish) | 2^(1/53) | 22.6415 | The atom of the AEU 53-EDO Turkish system |
| Pythagorean | 3¹² / 2¹⁹ | 23.4600 | The gap that 12 perfect fifths overshoot 7 octaves |
| Syntonic | 81 / 80 | 21.5063 | The gap between Pythagorean and 5-limit-just major thirds |
| Schisma | (Pythagorean − Syntonic) | 1.9537 | The leftover after subtracting Syntonic from Pythagorean |

Two finer ones — the **kleisma** (~8.1 cents) and **diaschisma** (~19.6 cents) — appear in extended JI and Sagittal but rarely in maqam-specific theory. We mention them for completeness; the schema doesn't need to model them as first-class objects.

### 2.2 Why 53-EDO is the Turkish basis

Take 53 equal divisions of the octave. Each step is 1200/53 ≈ 22.6415 cents. Now: 31 of those steps come to 31 × 22.6415 ≈ 701.89 cents — within 0.07 cent of a just perfect fifth (701.955 cents). That's astonishing: 53-EDO is a near-perfect Pythagorean tuning. The Pythagorean comma (the leftover after stacking 12 fifths) shrinks to a near-zero residual error. This is why Turkish theorists adopted 53-EDO: it lets them do Pythagorean math, work in commas, and have the math close cleanly.

### 2.3 The AEU interval-name vocabulary

In commas, the Turkish AEU system enumerates these named step sizes:

| Step | Commas | Cents | Turkish name |
|---|---|---|---|
| smallest | 1 | 22.6 | koma / fazla |
| | 3 | 67.9 | eksik bakiye |
| | 4 | 90.6 | bakiye |
| | 5 | 113.2 | küçük mücenneb |
| | 8 | 181.1 | büyük mücenneb |
| | 9 | 203.8 | tanini (whole tone) |

A whole tone is 9 commas (≈204 cents, very close to the just 9/8 = 203.91 cents). The bakiye (4 commas, ~91 cents) is the Turkish "diatonic semitone." The küçük mücenneb (5 commas, ~113 cents) is the slightly-larger "chromatic semitone." These four nominals (1, 4, 5, 8) are also the numbers used on the AEU sharp/flat accidentals.

### 2.4 Encoding pitches as comma-counts

A perde like Segâh in the Çârgâh-based system is described as "5 commas above Rast" (Rast itself being a perfect fifth above the karar Yegâh). 5 commas = 5 × 22.6415 ≈ 113.2 cents. This is the value the schema must store. If you see a Turkish theory source say "Segâh = 5 commas above Rast" the conversion is mechanical; the schema's job is to keep both representations available so we can render the comma-count in the UI but compute audio from cents.

---

## 3. Quarter-tones (Arabic, Egyptian)

### 3.1 24-EDO and the Cairo Congress

In 1932 the Cairo Congress of Arab Music canonized 24-tone equal temperament — 24 equal steps of 50 cents each — as the official theoretical basis of Arabic music. This is the system that Mishaqa-style "half-flat" / "half-sharp" notation (♭, the slashed flat; ♯, the half-sharp) writes against. It is genuinely *equal*: no commas, no Pythagorean substructure. The "quarter-tone" perde sits at exactly 50 cents above the next-lower 12-EDO note.

This is a teaching abstraction. In real performance, the actual quarter-tone pitches are not at 50 cents.

### 3.2 What practice actually does — sikah is the famous case

The third degree of Maqam Rast (Sikah / Segâh / Sîkâh) is the textbook example. Theory says it's 350 cents above the tonic (a "neutral third" — between minor 3rd at 300 and major 3rd at 400). In practice, ethnomusicological measurement (Marcus 1989, 1993, 2007; Maalouf; Touma; Shumays 2009 "Fuzzy Boundaries") finds:

| Tradition / region | Sikah ≈ cents above tonic | Notes |
|---|---|---|
| Egyptian (Cairo) | ~350 | Roughly matches theory; Marcus's reference baseline |
| Aleppine (Syrian) | ~340 | Slightly flat of theory; "Aleppo sikah" is its own perde |
| Iraqi | ~360 | Slightly sharp of theory; "Iraqi sikah" |
| Turkish (Segâh) | ~384 | A different pitch entirely; lives at 17 commas above Rast (17 × 22.64 ≈ 384.9) — *not* a quarter-tone, a Pythagorean-derived neutral 3rd |

The Turkish Segâh number bears explanation. In the AEU system, Segâh is reached from Rast by stacking specific named intervals; the algebra produces 17 commas, which is ~384 cents — essentially a 5/4-comma below a just major third (~386 cents) and notably *higher* than the Arabic neutral 3rd at ~340–360 cents. This 30–45-cent gap between "Arabic Segâh" and "Turkish Segâh" is one of the most audible inter-tradition differences and is exactly the kind of distinction makam_studio must preserve. It's also one strong argument for cents-as-canonical: the integer-comma Turkish description and the half-flat Arabic description don't reconcile in any other unit.

### 3.3 The schema implication

Each pitch gets an optional `practice_range_cents: [min, max]` field. For the Sikah of Maqam Rast this might be:

- `nominal_cents: 350.0` (the 24-EDO theoretical value)
- `practice_range_cents: [340.0, 365.0]` (covers Aleppine through Iraqi)

For an Egyptian-region preset specifically, the nominal is 350.0 with a tighter range. For a Turkish Maqam Rast preset, Segâh's nominal is 384.4 with whatever range the AEU theorists tolerate (typically ±5 cents).

The engine plays the nominal. The practice range is metadata for UI hints, future per-string nudge, and pedagogy.

---

## 4. Persian koron and sori

Persian theory adds two accidentals invented by Vaziri in the 1930s: **koron** (lowers a note; theoretically a quarter-tone flat; symbol: a sori-flipped `p` shape) and **sori** (raises a note; theoretically a quarter-tone sharp). In Vaziri's prescription, both are 50 cents — placing Persian theoretically inside 24-EDO.

In practice (Farhat 1990 *The Dastgah Concept in Persian Music*, Mofakham 2023):

- **Koron** sits closer to ~33–40 cents flat in most performance contexts; on fixed-fret instruments like tar and setar it sometimes settles around 30 cents flat and sometimes around 50 depending on the gusheh.
- **Sori** is somewhat closer to 30–40 cents sharp.
- Both are **direction-dependent**: a koron approached from below may resolve at a different pitch than the same koron approached from above, especially in melodic figures.
- The pitch is also **gusheh-dependent**: within Dastgāh-e Shur, different gushehs (Daramad, Salmak, Razavi, etc.) settle the koron at different cents.

makam_studio cannot model the full radif/gusheh detail in v1 without ballooning the schema. The compromise: **v1 stores Persian pitches as continuous cents (no snap), with practice ranges derived from Farhat's measurements where available, and a `seyir` / `gusheh_note` text field that flags "this preset represents the Daramad-level pitch set; gusheh-specific bending is up to the player."**

---

## 5. The v1 schema — prose specification

What follows is the field-by-field specification of the makam_studio preset format. It is described in JSON-like prose. No code; the engineer who implements this will translate to TypeScript types or a Zod schema.

### 5.1 Top-level preset object

A `MaqamPreset` is an object with these fields:

- **`format_version`** — string. Required. Current value: `"1.0.0"`. Used by the loader to refuse files newer than it understands and to drive future migrations.
- **`id`** — string. Required. A stable opaque identifier (suggest UUIDv4 or a slugified `tradition.region.maqam_name.variant`). Used for sharing, citing, and de-duping.
- **`name`** — object with subfields:
  - `canonical` (string, required) — the name the project considers official, in romanized Latin, e.g. `"Hicaz"` for Turkish or `"Hijaz"` for Arabic.
  - `native` (string, optional) — in the appropriate native script, e.g. `"حجاز"` (Arabic), `"حجاز"` (Persian Arabic-script), `"Hicaz"` (Turkish modern Latin uses the same form as canonical for Turkish — but we keep the field for symmetry).
  - `transliterations` (array of strings, optional) — additional accepted spellings: `["Hidjaz", "Hijāz", "Hijaaz"]`.
- **`tradition`** — enum string. Required. One of `"turkish"`, `"arabic_levantine"`, `"arabic_egyptian"`, `"persian"`, `"azeri"`, `"shashmaqam"`. This drives the snap grid and the default mandal-position quantization.
- **`region`** — string, optional. Free-form for v1 but suggested values: `"istanbul"`, `"aleppo"`, `"damascus"`, `"cairo"`, `"baghdad"`, `"tehran"`, `"bukhara"`, `"baku"`. The UI surfaces this for the cross-tradition disambiguation problem (e.g., "Maqam Rast (Egyptian)" vs. "Maqam Rast (Aleppine)").
- **`era`** — string, optional. `"ottoman_classical"`, `"19c_arabic"`, `"20c_arabic"`, `"radif_qajar"`, `"contemporary"`. Used for browse-by-era and provenance tagging.
- **`karar_perde`** — object, required. The root pitch of the preset. Subfields:
  - `name` — string. The traditional name, e.g. `"Yegâh"`, `"Dügâh"`, `"Râst"`, or for non-named-perde traditions, a Western nominal like `"D"`.
  - `midi_note` — integer, optional. The MIDI note number when this preset is loaded onto a 12-EDO MIDI keyboard. Used for .kbm export. Typical: 62 (D4) or 60 (C4).
  - `cents_offset_from_a440` — float, required. Signed cents offset of the *karar* from A=440 Hz. Lets the engine compute Hz directly without going through the MIDI table. Example: karar = D4 → cents_offset = -700.0 (D4 is 7 semitones below A4); karar = D4 with a +33 cent ezgi nudge → cents_offset = -667.0.
- **`pitches`** — array of `PitchEntry`, required. Length 7 typically (octave excluded? Or included? See decision below.) The ordered pitch set in *ascending* direction.
- **`pitches_descending`** — array of `PitchEntry`, optional. Present only when the descending form differs (Hüseyni, Saba, certain Arabic/Persian uses). When absent, descending = reverse of ascending.
- **`ajnas`** — array of `JinsRef`, optional. Arabic-only; describes the modular construction. Empty/absent for traditions where ajnas isn't the native theoretical model.
- **`seyir`** — string, optional. Free-form prose describing the melodic development pattern. Not parsed; rendered as-is in the UI.
- **`aliases`** — array of strings, optional. Cross-tradition equivalent names: `["Rast", "Râst", "راست", "Rost", "rāst"]`. Used for search and disambiguation.
- **`references`** — array of `Reference` objects, optional. Pointers to source recordings, theory texts, online databases.
- **`tags`** — array of strings, optional. Free-form: `["common"]`, `["rare"]`, `["pedagogical"]`, `["takht"]`, `["meshk"]`. Used for filter UI.
- **`license`** — string, optional. SPDX-like. Default `"CC0-1.0"` for community presets to match the project's MIT ethos and minimize friction for sharing.
- **`author`** — string, optional. The contributor or transcriber.

**Decision on octave inclusion in `pitches`.** The .scl convention is "first pitch implicit at unison, last pitch is the period." For internal storage, makam_studio does the **opposite**: stores all 7 (or however many) scale-degree pitches *including* the unison at index 0 (always cents 0.0) and *excluding* the explicit period (always cents 1200.0 unless we ever support non-octave maqamat, which we don't plan to in v1). Reasoning: an indexed UI ("string 3 plays Sikah") is much more readable when index 3 is genuinely the 3rd scale degree; the .scl convention is an export concern, not a storage concern; and it's trivial to drop the [0] and append [1200] on .scl write.

### 5.2 PitchEntry

A `PitchEntry` represents one scale degree:

- **`degree`** — integer. 1-indexed scale degree (1 = karar / unison, 2 = 2nd degree, ..., 7 = 7th). The 8th degree (octave) is conventionally not stored; if a maqam genuinely uses a non-octave period, store the period as `degree: N+1` and set `period_cents` on the preset (a v2 extension).
- **`name`** — string, required. The traditional name of this perde / pitch. Turkish examples: `"Yegâh"`, `"Hüseynî Aşîrân"`, `"Irâk"`, `"Rast"`, `"Dügâh"`, `"Segâh"`, `"Çârgâh"`. Arabic examples: `"Rast"`, `"Dukah"`, `"Sikah"`, `"Jaharkah"`, `"Nawa"`. Persian examples: `"Daramad"`, or a Western nominal where the tradition doesn't name individual scale degrees.
- **`name_native`** — string, optional. The native-script form: `"یگاه"`, `"سيكاه"`, etc.
- **`cents_from_karar`** — float, required. Signed, one decimal place (more precision is meaningless given source-measurement variance). This is the authoritative value the engine plays.
- **`ratio`** — string, optional. Source-theoretic ratio if the original source states one: `"9/8"`, `"32/27"`. Stored as a string to avoid floating-point drift; parsed on demand. Engine ignores this for playback unless the user explicitly opts in to "ratio-exact mode."
- **`practice_range_cents`** — `[min: float, max: float]`, optional. The empirically-observed range this perde occupies in performance. Used for UI hints, future practice-mode "how close are you to the range," and the ear-training game.
- **`comma_count`** — integer, optional. Turkish-only: the AEU integer count of Holdrian commas above karar (or for non-karar perde, above the previous perde). Lets the UI render the AEU notation without re-deriving from cents.
- **`display_accidental`** — enum string, optional. For Turkish: `"natural"`, `"1c_flat"`, `"4c_flat"`, `"5c_flat"`, `"8c_flat"`, `"1c_sharp"`, ... For Arabic: `"natural"`, `"half_flat"`, `"flat"`, `"half_sharp"`, `"sharp"`. For Persian: `"natural"`, `"koron"`, `"sori"`, `"flat"`, `"sharp"`. For non-Western native scripts, a separate `display_accidental_native` may be added in v2.
- **`enharmonic_aliases`** — array of strings, optional. For pitches that are spelled differently in different sources: `["Segâh", "Sikah"]`. Useful for cross-tradition search.

### 5.3 JinsRef (Arabic ajnas-stacking model)

For Arabic maqamat, the canonical theoretical model is *jins composition*: a maqam = first jins + second jins (overlapping at the ghammaz, the "modulation point"), sometimes with a third. The schema represents this directly:

- **`jins_id`** — string, required. References a separate `JinsLibrary` record (a separate JSON file or embedded list of standalone jins definitions: Rast jins, Bayati jins, Hijaz jins, Saba jins, Sikah jins, Nahawand jins, Kurd jins, Ajam jins, Nikriz jins, Jiharkah jins, etc.).
- **`transposition_cents`** — float, required. The cents value above the karar at which this jins begins.
- **`role`** — enum: `"foundation"` (the lower jins, anchors the maqam), `"branch"` (the upper jins), `"alternate"` (a less common substitution).

A `Jins` definition object (separate from `MaqamPreset`, lives in a sibling library) has:

- `id`, `name`, `native_name`, `aliases`, `tradition` (always `"arabic_*"` for v1 since this model is Arabic-native).
- `intervals_cents` — array of floats, the interval sizes within the jins (not absolute pitches). Example: Rast jins = `[200.0, 150.0, 150.0]` (whole, neutral 2nd, neutral 2nd, totalling 500 cents = a perfect fourth). Hijaz jins = `[150.0, 250.0, 100.0]` (half, augmented 2nd, half, also totalling 500).
- `ghammaz_offset_cents` — float, the offset within the jins where the *next* jins starts when this one is the foundation.

When loading an Arabic preset, the engine: (a) reads `ajnas`, (b) for each `JinsRef` looks up the Jins definition, (c) computes absolute cents-from-karar for each pitch by adding `transposition_cents` to the running interval sum, (d) writes the resulting `pitches[]` into a derived in-memory representation. The serialized preset can contain *both* `ajnas` (canonical theoretical view) *and* `pitches` (precomputed for fast load); they must agree, and the loader can validate.

For Turkish, Persian, and other traditions, `ajnas` is absent and `pitches` is the only source of truth.

### 5.4 Mandal model (the qanun layer)

A maqam preset describes *what notes are in the scale*. The qanun layer describes *which of those notes is currently sounding on which course*. These are different concerns and live in different objects.

A `QanunState` (or `InstrumentState`) is the in-app session state — not part of a preset file but *derivable from* loading a preset onto an instrument:

- **`courses`** — array of `CourseState`, length = number of courses on the instrument (typically 26 for a Turkish qanun, 27 for an Arabic qanun, larger for extended models).
- For each `CourseState`:
  - `course_index` — integer (0-based or 1-based, pick one and document; we recommend 1-based to match instrument-physical numbering).
  - `nominal_pitch_class` — the natural pitch this course represents (e.g. `"D"` or `"Dügâh"`), in the absence of any mandal engagement.
  - `available_pitches` — array of `MandalPosition` records, the wired-in mandal offsets available on this course. Turkish qanun typically has 7+ per course; Arabic has 1–5. Each `MandalPosition` is `{ index, cents_offset_from_nominal, name?, is_engaged }`.
  - `active_mandal_index` — integer. Which `available_pitches[]` entry is currently sounding. Mutates as the player engages mandals.

Loading a maqam preset onto a qanun is a function: `(MaqamPreset, QanunInstrument) → QanunState`. It walks the preset's `pitches[]`, finds for each pitch the course that bears that pitch class, and selects the `available_pitches[]` entry whose `cents_offset_from_nominal` puts that course at the desired cents-from-karar. If no available mandal matches within tolerance, the engine raises a "this preset can't be played on this instrument without retuning" error and offers options (snap to nearest available, override course nominal, switch to an extended-mandal model).

This design means **the preset is portable across instruments** (a Turkish preset can be loaded onto an Arabic qanun, with degraded fidelity warnings) and **the instrument is configurable** (a user can edit a course's `available_pitches` to match their physical instrument).

### 5.5 Tradition-specific snap grids

A `tradition` enum value implies a default snap grid for the per-string slider UI:

- **`turkish`** → 53-EDO grid; per-string slider snaps to multiples of 22.6415 cents from the course nominal. Mandal positions in Turkish presets are validated to lie on this grid.
- **`arabic_egyptian`** and **`arabic_levantine`** → 24-EDO grid; snaps to multiples of 50 cents. Mandal positions in Arabic presets are validated to lie on this grid.
- **`persian`** → no snap; continuous cents slider. Mandal positions can be any float.
- **`azeri`** → for v1, defaults to the Arabic 24-EDO grid as a teaching simplification, with a flag `tradition_grid_uncertain: true` in the preset metadata. v2 to revisit after more dedicated Azeri research.
- **`shashmaqam`** → same compromise as Azeri for v1.

The user can always override the snap grid in the per-string editor; the tradition just sets the default. This is the right default-and-override pattern: opinionated about what's typical, permissive about what's possible.

### 5.6 Reference object

```
{
  type: "recording" | "book" | "article" | "url" | "database",
  citation: "Marcus, Scott (2007). Music in Egypt. Oxford UP, ch. 3.",
  url?: "https://maqamworld.com/en/maqam/rast.php",
  notes?: "Marcus's measurement of Cairo Rast Sikah at ~350c."
}
```

This is intentionally lightweight. The cultural-respect gain from naming sources is high; the schema cost is low.

### 5.7 Versioning and migration

`format_version` follows semver with these rules:

- **Patch** (1.0.x): bug-fix to docs, no schema change.
- **Minor** (1.x.0): add new optional fields; old loaders must skip unknown fields without error.
- **Major** (x.0.0): incompatible change; loaders must refuse and surface migration UI.

The loader implements a chain of one-way migrators: `1.0 → 1.1 → ... → current`. Files older than the chain trigger a one-time conversion on import.

---

## 6. Conversion table — "C Hicaz" across notations

To make the schema concrete, here is a single maqam — Hicaz / Hijaz — expressed in the four representations the format must reconcile. Karar = C (we'll set C4 = 261.626 Hz at A=440 for arithmetic).

The Hicaz scale, in its most common form, ascends: C, D♭, E, F, G, A♭, B, C′. The signature interval is the augmented second between D♭ and E.

### Turkish Hicaz (AEU, comma counts)

The Turkish Hicaz reading uses these step sizes (in Holdrian commas): 5, 12, 5, 9, 4, 13, 5. Cumulating from karar:

| Degree | Perde | Commas above karar | Cents above karar | Hz at C4 karar | Closest ratio |
|---|---|---|---|---|---|
| 1 | Çârgâh | 0 | 0.0 | 261.626 | 1/1 |
| 2 | Nîm Hicâz | 5 | 113.2 | 279.314 | (≈ 16/15 = 111.7c) |
| 3 | Dik Hicâz | 17 | 384.9 | 327.024 | (≈ 5/4 = 386.3c) |
| 4 | Nevâ | 22 | 498.1 | 348.832 | 4/3 = 498.0c |
| 5 | Hüseynî | 31 | 702.0 | 392.435 | 3/2 = 702.0c |
| 6 | Acem | 35 | 792.5 | 412.985 | (≈ 8/5 = 813.7c — note the gap) |
| 7 | Mâhûr | 48 | 1086.8 | 489.836 | (≈ 15/8 = 1088.3c) |
| 8 | Tîz Çârgâh | 53 | 1200.0 | 523.251 | 2/1 |

Note the augmented-2nd at degrees 2→3: 384.9 − 113.2 = 271.7 cents. That's the famous "wide" augmented second.

### Arabic Hijaz (24-EDO, half-flats / half-sharps)

In Arabic theoretical notation (24-EDO), Hijaz ascending: C, D♭ (flat), E (natural — no half-tones in the augmented second!), F, G, A♭ (flat), B (natural), C′. There are no quarter-tones in standard Hijaz; it's a 12-EDO-compatible mode that shares this property with Western harmonic minor / Phrygian dominant.

| Degree | Name | Cents above karar | Hz at C4 karar | Step from prev |
|---|---|---|---|---|
| 1 | Rast (= karar C) | 0.0 | 261.626 | — |
| 2 | Dukah♭ (D♭) | 100.0 | 277.183 | 100 |
| 3 | Sikah ↑ (E) | 400.0 | 329.628 | 300 |
| 4 | Jaharkah (F) | 500.0 | 349.228 | 100 |
| 5 | Nawa (G) | 700.0 | 391.995 | 200 |
| 6 | Husayni♭ (A♭) | 800.0 | 415.305 | 100 |
| 7 | Awj (B) | 1100.0 | 493.883 | 300 |
| 8 | Kirdan (C′) | 1200.0 | 523.251 | 100 |

### The disagreement

| Degree | Turkish Hicaz cents | Arabic Hijaz cents | Δ (cents) |
|---|---|---|---|
| 1 | 0.0 | 0.0 | 0 |
| 2 | 113.2 | 100.0 | +13.2 |
| 3 | 384.9 | 400.0 | −15.1 |
| 4 | 498.1 | 500.0 | −1.9 |
| 5 | 702.0 | 700.0 | +2.0 |
| 6 | 792.5 | 800.0 | −7.5 |
| 7 | 1086.8 | 1100.0 | −13.2 |
| 8 | 1200.0 | 1200.0 | 0 |

Two pitches differ by ~13 cents (the "küçük mücenneb vs. semitone" gap on degrees 2 and 7) and one by ~15 cents (degree 3, where Turkish Dik Hicâz is essentially a just major third at 5/4 ≈ 386c while Arabic Hijaz goes to a 12-EDO major third at 400c). The augmented second in Turkish reading is **271.7 cents**; in Arabic reading it's **300 cents**. That's a real, audible difference.

### Practice variability

Egyptian practice often pulls the augmented 2nd narrower — performers approach D♭ from the natural and bend toward E, producing an effective augmented second closer to 270–280 cents (close to Turkish!). This is the kind of regional behavior the `practice_range_cents` field captures: nominal 300, range [265, 305].

### What the preset object actually stores

For the Turkish "C Hicaz" preset (id: `turkish.classical.hicaz`, karar D Yegâh canonically — but here transposed to C):

```
{
  format_version: "1.0.0",
  id: "turkish.classical.hicaz.kararC",
  name: { canonical: "Hicaz", native: "حجاز", transliterations: ["Hicâz", "Hidjaz"] },
  tradition: "turkish",
  region: "istanbul",
  karar_perde: { name: "Çârgâh", midi_note: 60, cents_offset_from_a440: -900.0 },
  pitches: [
    { degree: 1, name: "Çârgâh", cents_from_karar: 0.0, comma_count: 0, display_accidental: "natural" },
    { degree: 2, name: "Nîm Hicâz", cents_from_karar: 113.2, comma_count: 5, display_accidental: "5c_flat", ratio: "256/243" },
    { degree: 3, name: "Dik Hicâz", cents_from_karar: 384.9, comma_count: 17, display_accidental: "8c_flat", ratio: "5/4" },
    { degree: 4, name: "Nevâ", cents_from_karar: 498.1, comma_count: 22, display_accidental: "natural", ratio: "4/3" },
    { degree: 5, name: "Hüseynî", cents_from_karar: 702.0, comma_count: 31, display_accidental: "natural", ratio: "3/2" },
    { degree: 6, name: "Acem", cents_from_karar: 792.5, comma_count: 35, display_accidental: "5c_flat" },
    { degree: 7, name: "Mâhûr", cents_from_karar: 1086.8, comma_count: 48, display_accidental: "natural" }
  ],
  seyir: "Begins on Çârgâh; emphasizes the Nîm Hicâz–Dik Hicâz tension; descends through Hüseynî–Nevâ to settle.",
  aliases: ["Hicaz", "Hijaz", "Hidjaz", "حجاز", "حجاز"],
  tags: ["common", "pedagogical"],
  references: [{ type: "book", citation: "Arel, Hüseyin Sadettin (1968). Türk Mûsıkîsi Nazariyatı Dersleri." }],
  license: "CC0-1.0"
}
```

For the Arabic "C Hijaz" preset, replace the `tradition`, drop `comma_count` from each pitch, swap `display_accidental` to Arabic forms, set `region` to `"cairo"` or `"aleppo"`, and add an `ajnas` array describing the Hijaz jins on degree 1 (`{ jins_id: "hijaz", transposition_cents: 0.0, role: "foundation" }`) and the Rast or Nahawand jins on degree 5 (the second jins choice depends on the family branch, captured in the family-tree research).

---

## 7. Naming, metadata, native script

### 7.1 Cross-tradition shared names — the disambiguation problem

Maqamat travel across traditions and rename themselves; the same name often denotes different scales in different cities. *Rast* exists in Turkish, Arabic (multiple regions), Persian (as a dastgāh, named *Rast Panjgāh*), and Shashmaqam, and the cents content differs. *Hijaz/Hicaz* differs in augmented-second size between Turkish and Arabic (above). *Segâh/Sikah* differs in nominal pitch by 30+ cents. *Nahawand* is essentially Western harmonic minor in Arabic but a different mode in Persian.

The schema's `aliases` array is the search-side fix: typing "Rast" finds all five Rasts and the UI lets the user choose by tradition tag and karar. The schema's `tradition` and `region` fields are the disambiguation-side fix: the canonical preset list always shows "Maqam Rast (Egyptian, Cairo, Marcus 1989 measurements)" rather than just "Maqam Rast."

### 7.2 Native script

We support three primary native scripts:

- **Arabic script** for Arabic, Persian (Persian Arabic-script, often Nastaliq for display), and where Ottoman-era Turkish sources used it.
- **Turkish Latin** (with diacritics: ç, ş, ğ, ı, ö, ü) for modern Turkish.
- **Cyrillic** for Azeri and Shashmaqam (Bukhara → Tajik / Uzbek Cyrillic).

The schema stores native names as UTF-8 strings. The UI handles RTL where appropriate (Arabic, Persian Nastaliq). Font-handling is a v1 concern but a separate one (see `ux-interface-review.md`).

### 7.3 Era and provenance

Many maqamat have evolved. *Maqam Bayati* in 1880s Cairo is not the same as in 2020s Beirut. The `era` and `references` fields together pin a preset to a specific theoretical moment. v1 ships presets pinned to: Ottoman classical (Arel-Ezgi-Uzdilek), 20th-century Egyptian (Marcus measurements), 20th-century Aleppine (Maqam World as a curated baseline), Vaziri / Farhat Persian.

### 7.4 Versioning specifically for shared URLs

A shared URL encodes a preset state. The format-version field protects sharing: a URL generated by makam_studio v0.5 using format 1.0.0 must remain loadable in makam_studio v0.9 using format 1.0.0 (because the schema is forward-compatible within a major). A URL generated by a future v2.0.0 schema will refuse to load on a v1.x app, with a clear message.

---

## 8. Edge cases

### 8.1 Asymmetric scales

**Hüseyni** is the canonical example: ascending uses one set of pitches; descending substitutes a different one (the upper portion changes). Saba similarly resolves *downward* to a pitch a fourth below the starting tonic — not at all to the start. The schema handles this with the optional `pitches_descending` array. When the engine plays a phrase, melodic direction is tracked (a piano-roll-style "is this note higher or lower than the previous one?") and the appropriate pitch table is consulted. v1 implements the simplest version: `pitches_descending`, when present, is used for any descending step within the phrase. Direction-tracking is per-voice, not per-instrument.

### 8.2 Ajnas-stacking and modulation

For Arabic maqam, the canonical theoretical structure is two (sometimes three) ajnas overlaid. The schema's `ajnas[]` field captures this and lets the UI render the modular view ("this is Maqam Rast = Rast jins on C + Rast jins on G"). Pre-computed `pitches[]` lets the engine play without re-solving the composition every render.

A future v2 feature: *modulation*. A maqam can pivot to another maqam mid-phrase by sharing a jins. The schema doesn't yet model modulation paths, but the ajnas-stacking structure makes it straightforward to add: a `modulations[]` array on the preset listing target maqamat that share a jins.

### 8.3 Persian dastgāh hierarchy

A Persian dastgāh is a parent + many gushehs, each with specific pitch shifts and characteristic motifs. v1's compromise: **flatten each dastgāh into a single representative scale (the daramad-level pitch set) and store named gushehs as separate `MaqamPreset` records with the parent dastgāh referenced via a `parent_dastgah_id` field.** This lets us ship Shur, Mahur, Homayoun, Segah, Chahargah, Nava, Rast Panjgah as 7 daramad-presets in v1, with gushehs added incrementally as separate presets. v2 introduces an explicit `Dastgah` parent object that owns its `gushehs[]` list with hierarchical loading semantics; v1 uses the flat parent-id pointer pattern.

### 8.4 Unspecified pitches

Some traditions have pitches that are deliberately *flexible* in performance — not a discrete pitch but a region. The `practice_range_cents` field captures this; the `nominal_cents` is the engine's default play value, and the UI surfaces the range as a soft constraint (the player can deviate within range freely; deviating outside surfaces a gentle warning).

### 8.5 Non-octave maqamat

We have not encountered any in the maqam world; the octave is universal. The schema assumes octave-equivalence (1200 cent period). v2 may add an explicit `period_cents` field if any tradition surfaces a non-octave preset.

### 8.6 Ratio storage precision

Floating-point arithmetic on ratios accumulates error. The schema stores `ratio` as a *string* (`"81/64"`), parsed only when the user explicitly opts into ratio-exact mode. Default playback uses the stored `cents_from_karar` (a float), which carries one decimal place — sufficient given source-measurement variance.

---

## Implications for makam_studio

### v1 vs. v2 split

**v1 schema fields (must implement):** all of §5 except dastgāh hierarchy (flattened via `parent_dastgah_id`), modulation paths (deferred), per-gusheh pitch shifts (deferred). All maqam presets ship as flat `MaqamPreset` records. Mandal model and tradition-snap grids are v1.

**v1 import/export:**
- Read .scl, .kbm, .tun, internal-JSON.
- Write .scl, .kbm, internal-JSON.
- URL-share: base64-encoded internal-JSON in URL hash, with a length-budget cap (~2KB compressed, similar to BeatForge's pattern share).
- Round-trip integrity test: load → save → load → compare; must produce identical preset.

**v2 deferred:**
- Dastgāh as parent object with owned gushehs.
- Modulation graph between maqamat.
- MTS SysEx export over Web MIDI.
- AnaMark .tun *write*.
- SonicWeave source export.
- Ratio-exact playback mode.
- Per-gusheh / per-seyir pitch micro-adjustments.

### Recommended v1 "starter library"

Approximately 30 maqam presets across traditions for the MVP:

- **Turkish** (~10): Çârgâh, Rast, Hicaz, Hüseyni, Uşşak, Saba, Nihavend, Kürdi, Segâh, Hicazkar.
- **Arabic** (~10, mixed regions): Rast (Egyptian, Aleppine variants), Bayati, Hijaz, Saba, Sikah, Nahawand, Kurd, Ajam, Nawa Athar, Kurd.
- **Persian** (~5): Shur (daramad), Mahur, Homayoun, Segah, Chahargah.
- **Azeri** (~3): Rast, Shur, Segah (with `tradition_grid_uncertain` flagged).
- **Shashmaqam** (~2): Buzruk, Rast.

Each preset cited to a primary source. The starter library is shipped as a single bundled JSON file in the app and is *immutable from the app UI*; user-edited copies are stored separately (in IndexedDB) with a different `id` namespace.

### Sharing model — URL pattern

BeatForge uses URL fragments to encode patterns for share. makam_studio adopts the same idea:

```
https://cemergin.github.io/makam_studio/?p=<base64-of-compressed-MaqamPreset-JSON>
```

The compressed payload includes only fields the recipient *needs* to recreate the preset: omit defaults, drop `references`/`tags` when empty, normalize whitespace. A 7-pitch preset compresses to <500 bytes typical; a heavily-annotated one (with native script and references) to ~1.5KB.

For longer-lived shares (>2KB or community-curated), use a content-addressable hash and let users contribute presets via PR to the `presets/` directory of the repo, exactly as BeatForge handles patterns. This keeps the no-backend constraint while supporting community growth.

### .scl import/export

In v1, .scl import:
1. Parse the file (description line, count, N pitch lines, ratios → cents conversion).
2. Construct a minimal `MaqamPreset` with `tradition: "unknown"`, `format_version: 1.0.0`, derived `pitches[]` (with nameless degrees), description in `name.canonical`.
3. Surface a "this scale was imported from Scala format; please add tradition and pitch names" UI prompt.
4. Allow user to enrich and save.

In v1, .scl export:
1. Walk preset's `pitches[]` (skipping degree 1's unison) and emit each as `cents_from_karar` formatted to 6 decimal places.
2. Append `1200.000000` as the period.
3. Use `name.canonical` (or a composite "Hicaz · Turkish · karar=C") as the description line.
4. Discard pitch names (they have no .scl representation) but keep them in a `! ` comment block at the top of the file as informational.

### .kbm import/export

In v1, .kbm import is paired with .scl import: the .kbm tells the loader how to map the imported scale onto MIDI keys, which sets `karar_perde.midi_note` and any non-trivial mapping. Most user .kbm files will be 12-of-12 mappings; the loader handles the simple case directly and rejects exotic mappings (with a clear error) until v2.

In v1, .kbm export is auto-generated from `karar_perde.midi_note` and `pitches[].length` — straightforward; no user UI surface needed.

### MTS-ESP compatibility (read-only via .scl)

By exporting standard .scl files, makam_studio presets are immediately loadable by ODDSound MTS-ESP Mini, which is the most common path to use a maqam tuning in a DAW. We should test this round-trip explicitly in QA: export Hicaz preset → load into MTS-ESP Mini → drive an MTS-ESP-aware soft synth → measure pitch in cents → confirm <0.1 cent error.

### Engine internal representation

The engine reads `MaqamPreset.pitches[].cents_from_karar`, adds `karar_perde.cents_offset_from_a440`, and computes Hz directly: `Hz = 440 × 2^((karar_offset + pitch_cents_from_karar) / 1200)`. No MIDI note table involved internally; MIDI is a UI / I/O concern only. This decouples the engine from 12-EDO assumptions cleanly.

For the qanun voice (Karplus-Strong derived; see `web-audio-plucked-string-synthesis.md`), each course's "string" runs at the Hz computed for the active mandal-position pitch. Mandal changes are smooth pitch-bend events (linear ramp in cents over ~20 ms by default) so engagement doesn't click.

---

## Open questions

1. **Should ratios be storable as exact rationals (BigInt numerator/denominator) for v2?** The case for it: Yarman-style 79-tone Turkish theory and any Pythagorean-purist work needs exact arithmetic. The case against: ~200 lines of arithmetic code we don't currently need. Defer to v2 or community demand.
2. **Should `comma_count` generalize to a per-tradition `theoretical_unit`?** E.g. Persian could carry `koron_displacement` or similar. Right now we only special-case the Turkish 53-EDO unit. v2 candidate.
3. **Where does the jins library live?** As a separate `JinsLibrary.json` file shipped alongside presets, or embedded into each Arabic preset? The separate-file approach is cleaner (one source of truth for "what is the Hijaz jins") but introduces a load-order constraint. v1 recommendation: separate file, eagerly loaded at app startup.
4. **Mandal mapping for unfamiliar instruments.** When a user loads a Turkish preset onto an Arabic qanun (fewer mandals), what is the right fallback? Snap to nearest? Refuse? Offer a "view as Turkish but on Arabic instrument" mode that adds virtual mandals? v1: snap to nearest, surface a list of pitches that lost precision.
5. **Modulation graph — when does this become first-class?** Empirically, Arabic theory leans heavily on modulation (geçki in Turkish, intiqal in Arabic). A purpose-built data structure (graph of "from maqam X you can pivot to maqam Y via shared jins Z") becomes valuable as soon as we ship a "maqam tour" practice mode. Tentatively v2.
6. **Display of Persian Nastaliq vs. naskh script.** Nastaliq is the traditional calligraphic display style and conveys cultural register; naskh is more legible at small UI sizes. Defer to UX research; the schema doesn't need to encode this — fonts are an app-config concern.
7. **Is "tradition" a closed enum forever?** What about Andalusian (North African), Yemeni, Khaleeji, or Uyghur On Ikki Muqam (which shares lineage with Shashmaqam but has its own identity)? v1 ships the closed enum listed above; v2 may either expand the enum (preferred) or move to free-form strings with a curated registry.
8. **Should we adopt SonicWeave as a v2 input language?** It would let advanced users author scales in a precise DSL. The mismatch: SonicWeave is xenharmonic-flavored, not maqam-flavored. v2 to revisit; may end up as an "advanced mode" import path only.

---

## Sources

### File format specifications
- [Scala scale file (.scl) format — Huygens-Fokker Foundation](https://www.huygens-fokker.org/scala/scl_format.html) — the canonical .scl spec.
- [Scala help — Huygens-Fokker Foundation](https://www.huygens-fokker.org/scala/help.htm) — Scala application reference, partial .kbm coverage.
- [Mapping microtonal scales to a MIDI keyboard in Scala — Sevish](https://sevish.com/2017/mapping-microtonal-scales-keyboard-scala/) — practical .kbm guide.
- [libscala-file C++ library README — MarkCWirt](https://github.com/MarkCWirt/libscala-file) — independent .kbm format documentation.
- [AnaMark tuning file format — Xenharmonic Wiki](https://en.xen.wiki/w/Anamark_tuning_file_format) — TUN format overview.
- [Specifications of AnaMark tuning file format V2.00 — Mark Henning (PDF)](https://www.mark-henning.de/files/am/Tuning_File_V2_Doc.pdf) — official TUN V2 specification.
- [AnaMark-Tuning-Library — Zardini (GitHub)](https://github.com/zardini123/AnaMark-Tuning-Library) — open-source TUN/SCL/KBM reference implementation.
- [MIDI Tuning Standard — Wikipedia](https://en.wikipedia.org/wiki/MIDI_tuning_standard) — MTS bulk dump and single-note tuning change overview.
- [The MIDI Tuning Standard — Microtonal Synthesis](http://microtonal-synthesis.com/MIDItuning.html) — Robert Rich + Carter Scholz reference text.
- [MTS-ESP — ODDSound (GitHub)](https://github.com/ODDSound/MTS-ESP) — MTS-ESP C/C++ library, README, integration guide.
- [Use MTS-ESP — ODDSound](https://oddsound.com/usingmtsesp.php) — official documentation of MTS-ESP usage.
- [Scale Workshop — xenharmonic-devs (GitHub)](https://github.com/xenharmonic-devs/scale-workshop) — Scale Workshop 3 source and feature list.
- [SonicWeave DSL — xenharmonic-devs](https://github.com/xenharmonic-devs/sonic-weave/blob/main/documentation/dsl.md) — SonicWeave language reference.
- [Scale Workshop — Xenharmonic Wiki](https://en.xen.wiki/w/Scale_Workshop) — Scale Workshop overview.

### Notation systems
- [Sagittal: A Microtonal Notation System — Secor & Keenan](https://www.sagittal.org/sagittal.pdf) — Sagittal primary reference.
- [Helmholtz–Ellis notation — Xenharmonic Wiki](https://en.xen.wiki/w/Helmholtz%E2%80%93Ellis_notation) — HEJI overview.
- [How to Use Ben Johnston's Just Intonation Notation — Kyle Gann](https://www.kylegann.com/BJNotation.html) — Johnston notation primer.
- [HEWM notation — Tonalsoft Encyclopedia](http://www.tonalsoft.com/enc/h/hewm.aspx) — Helmholtz-Ellis-Wolf-Monzo background.

### Pythagorean / 53-EDO / commas
- [53 equal temperament — Wikipedia](https://en.wikipedia.org/wiki/53_equal_temperament) — 53-EDO mathematics, Holdrian comma derivation.
- [Holdrian comma — Microtonal Encyclopedia (Miraheze)](https://microtonal.miraheze.org/wiki/Holdrian_comma) — Holdrian comma details.
- [Pythagorean comma — Wikipedia](https://en.wikipedia.org/wiki/Pythagorean_comma) — Pythagorean comma 3¹²/2¹⁹ derivation.
- [53edo — Xenharmonic Wiki](https://en.xen.wiki/w/53edo) — extended 53-EDO theoretical material.

### Turkish / AEU
- [Turkish makam — Wikipedia](https://en.wikipedia.org/wiki/Turkish_makam) — AEU system, perde and comma table.
- [Microtonal Theory — Turkish Makams](https://www.microtonaltheory.com/microtonal-ethnography/turkish-makams) — bakiye, küçük/büyük mücenneb, tanini definitions.
- [EXPERIMENTS ON THE RELATIONSHIP BETWEEN PERDE AND SEYIR IN TURKISH MAKAM MUSIC — Akkoç (Sethares)](https://sethares.engr.wisc.edu/paperspdf/MP3204_02_Akkoc.pdf) — empirical Turkish perde measurements.
- [79-Tone Tuning & Theory for Turkish Maqam Music — Yarman (Academia.edu)](https://www.academia.edu/44935064/EXPANDED_PH_D_THESIS_79_TONE_TUNING_and_THEORY_FOR_TURKISH_MAQAM_MUSIC_As_A_Solution_To_The_Non_Conformance_Between_Current_Model_And_Practice) — Yarman's critique of AEU and 79-tone alternative.
- [Tuning systems for qanun — Xenharmonic Wiki](https://en.xen.wiki/w/Tuning_systems_for_qanun) — Turkish 72-EDO and 53-EDO qanun tunings.
- [Turkish Music: Temperament and Pitches — Francesco Montanari](http://fmnt.info/blog/20180430_turkish-music.html) — Turkish AEU / koma practical reference.
- [Makams and Cents — BabaYagaMusic](https://babayagamusic.com/Music/Makams-and-Cents.htm) — practical Turkish cents conversions.

### Arabic / Egyptian
- [Arabic maqam — Wikipedia](https://en.wikipedia.org/wiki/Arabic_maqam) — 1932 Cairo Congress, 24-EDO, ajnas overview.
- [Maqam World](https://www.maqamworld.com/en/maqam.php) — maqam family tree and jins-composition reference.
- [Jins — Wikipedia](https://en.wikipedia.org/wiki/Jins) — jins definitions, list of standard ajnas.
- [The Fuzzy Boundaries of Intonation in Maqam: Cognitive ... — Shumays 2009 (PDF)](https://www.maqamlessons.com/analysis/media/FuzzyBoundaries_MaqamIntonation2009.pdf) — empirical regional sikah measurements.
- [Maqam Analysis: A Primer — Shumays, Music Theory Spectrum 2013](https://maqamlessons.com/analysis/media/MaqamAnalysisAPrimer_MTS3502_Shumays2013.pdf) — modular jins analysis.
- [Inside Arabic Music — Marcus 2017](https://dokumen.pub/inside-arabic-music-arabic-maqam-performance-and-theory-in-the-20th-century-0190658363-9780190658366.html) — 20th-c. Arabic theory and practice.
- [Is it Sikah…? or Segâh…? — TAQS.IM](https://taqs.im/sikah-or-segah/) — discussion of regional sikah/segah differences.
- [Maqam ‘Iraq — Maqam World](https://www.maqamworld.com/en/maqam/iraq.php) — Iraqi sikah variant.
- [A Guide to the Maqam Tuning Presets for Ableton Live 12 — Tuning](https://tuning.ableton.com/arabic-maqam/maqam-guide/) — Ableton Live 12 maqam preset reference.

### Persian
- [Dastgāh — Wikipedia](https://en.wikipedia.org/wiki/Dastgah) — dastgāh / radif / gusheh hierarchy.
- [The Dastgah Concept in Persian Music — Hormoz Farhat (Cambridge UP)](https://books.google.com/books?id=NiMhWnYDuQMC) — Farhat's measurement-based theory.
- [A Rational Intonation Approach to Persian Music — Mofakham 2023 (PDF)](https://ziva-hudba.info/wp-content/uploads/2024/07/Mofakham_ZH14_Rational_Persian_4.pdf) — modern Persian intonation analysis.
- [The Dastgah Concept in Persian Music — Ableton Tuning](https://tuning.ableton.com/persian-radif/dastgah-concept/) — practitioner-facing dastgāh introduction.
- [LilyPond Notation Reference: Persian classical music](http://lilypond.org/doc/v2.23/Documentation/notation/persian-classical-music.html) — koron / sori notation.
- [The Dastgah Music System — Anand Subramanian](https://anandksub.dev/blog/notes_on_dastgah.html) — engineer-friendly dastgāh primer.

### Qanun and instrument
- [Qanun (instrument) — Wikipedia](https://en.wikipedia.org/wiki/Qanun_(instrument)) — instrument anatomy, mandal mechanics.
- [Differences Between Arabic Qanun and Turkish Qanun — Ethnic Musical](https://www.ethnicmusical.com/kanun/differences-between-arabic-qanun-and-turkish-qanun/) — mandal-count and tuning-system differences.
- [Qanun — Xenharmonic Wiki](https://en.xen.wiki/w/Qanun) — qanun in tuning theory.
- [79-tone qanun recipe — Ozan Yarman](http://www.ozanyarman.com/79toneqanun.html) — Yarman's expanded qanun mandal layout.
