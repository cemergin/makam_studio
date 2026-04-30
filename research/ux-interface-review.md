---
title: "UX & Interface Review: Maqam, Microtonal, and Qanun Software"
audience: "makam_studio designers and engineers; anyone shaping the playing surface, preset model, mobile layout, or visual identity. Read before any code or visual mockups."
tldr: |
  Survey of 25+ existing maqam apps, microtonal editors, and hardware controllers. Distills what works, what fails, and what makam_studio should learn — with concrete principles for the MVP.
skip_if: "You are working on the audio engine (see web-audio-plucked-string-synthesis.md) or the tuning data model (see tuning-systems-formalization.md). This document deliberately ignores DSP and schema design and focuses only on interface, naming, accessibility, and cultural representation."
date: 2026-04-30
status: draft
---

# TL;DR

- **There is no good browser-based maqam playing instrument**. Maqam World is a great catalog but unplayable; iOS/Android qanun apps are toys with broken touch and no real microtuning; Scale Workshop is for tuning nerds, not maqam musicians. **The gap makam_studio fills is real.**
- **The qanun's mandal panel IS the UX** — every tradition has solved "how to retune fast on stage" by giving the player a row of physical levers per course, and that physical model translates beautifully to a touch surface. Don't invent a new metaphor; honor the one that works.
- **Pianoteq and Hauptwerk show the right preset model**: a single dropdown of named tunings ("Werckmeister III", "Kirnberger III") that re-tunes the whole instrument instantly. makam_studio's "select karar + maqam" should look exactly like this — not a wizard, not a modal — one menu, two pickers, done.
- **Pitch labeling has to be dual** (perde + Western letter + cents readout on demand). Every existing tool picks one and alienates half its users; we have to do all three and let the user choose.
- **Cultural sensitivity is technical, not aesthetic.** Use Vazirmatn for Persian, IBM Plex Sans Arabic for Arabic, Noto Naskh Arabic for body Arabic. Avoid pseudo-Kufic display fonts, "Aladdin" framing, generic "Middle Eastern" beige-and-gold. Treat green carefully (Islamic prophetic association). RTL is a real engineering constraint, not a checkbox.
- **Mobile-first is wrong for makam_studio.** A 26-course qanun is a *wide* instrument; the desktop is the canonical view, mobile is the constrained one. Design the wide layout, then collapse — not the other way around.

---

## 1. Existing maqam-specific software

### Maqam World (maqamworld.com) — the canonical catalog

The reference English-language maqam resource, recently rebuilt with responsive layout and clickable notes that generate sound. Its great strength is **pedagogical structure**: jins-first navigation (the 8-family taxonomy: 'Ajam, Bayati, Hijaz, Kurd, Nahawand, Nikriz, Rast, Sikah, plus standalone maqams), with each maqam page documenting tonic, ghammaz (dominant), basic scale, "jins baggage" (vocabulary outside the basic scale), and modulation paths.

**What works:**
- Jins-as-building-block ontology — every page reinforces "maqam is built from jins, not from full scales." This is the right mental model and we should preserve it.
- Multi-language support (Arabic, English, French, German, Italian, Greek, Spanish, Portuguese).
- Audio examples paired with notation; "I call, you respond" lessons in the Maqam Lessons sister project.
- Jins are sized 3-/4-/5-note, with an alphabetical index.

**Why it fails as a playing tool:**
- It's a website, not an instrument. The clickable sound generators play one note at a time, not melodic phrases.
- Notation is fixed Western staff with quarter-tone accidentals — there is no way to retune the system, hear a maqam at a different karar, or compare regional variants of the same maqam (e.g. Egyptian vs. Aleppine sikah).
- No control over playback timbre (fixed oud sample).
- No transposition. Everything is presented in the canonical "C" key.

**What makam_studio steals:** the jins-family taxonomy, the "baggage notes" concept, and the multilingual approach.

**What we don't steal:** the static-website feel. We need a real instrument.

### Maqam (iOS), Maqamat Al-Arabiya (Android), Maqam 4.0

Pocket reference apps — ajnas + maqam catalog with stock-oud audio playback. Maqamat Al-Arabiya covers 34 maqams across 9 families. Closer to flashcards than instruments. Confirms the jins-family ontology is widely accepted.

### iOS / Android qanun apps (Qanun Professional, Qanun Sim, E-qanun, Qanun.az, Arabic/Turkish Qanun)

There is no Apple-published "iQanun" — the term conflates a category. The third-party apps typically show a horizontal qanun with parallel-line strings, advertise both Arabic and Turkish modes, and offer scale presets (bayati, rast, hijaz, saba).

**What fails consistently:** user reviews report broken sound, broken touch on iPhone 11, audio failures. Mandal simulation is shallow — usually just a "select scale" dropdown without per-course tuning. Quarter-tone control is approximated. Sound is sample-based, single-timbre. No karar transposition — instruments fixed at one tonic. Users explicitly ask in reviews for "options to change maqamat scales and quarter notes."

**Lesson:** the bar is on the floor. A working microtonal qanun in the browser, with real per-course retuning and karar transposition, would be best-in-class on launch.

### Best Service "Qanun" (Engine Player) — paid VST

Bassam Ayoub's commercial sample library. Includes microtuning presets for Bayati, Rast, Saba, Sikah. Sample-based (so out of bounds for our pure-synthesis constraint) but its preset menu is a useful comparable: just a list of named maqam tunings in a dropdown.

### Maqam Lessons playground (maqamlessons.com)

Pedagogical site by Akram Touma. Six maqam pages, eight jins pages, hyperlinked rather than hierarchical ("no required starting point"). Notates ajnas with **large noteheads for tonic, small noteheads for context** — encoding "central vs. vocabulary." Worth borrowing.

### MAQAM Quarter-Tone Controller (Mazeka Toys) and Qtone Web

The Mazeka MAQAM is a hardware MIDI controller that retunes keyboard synths (Korg Trinity etc.) to quarter-tone scales — confirms Arab musicians have repeatedly asked for "one button to retune the whole instrument to a maqam."

Qtone Web is an open-source Persian quarter-tone tuner: circular display (12-semitone inner ring, 24-quarter outer ring), independent koron/sori cents controls (42, 50, or 58¢) because **different traditions disagree** on half-flat size. **Model for us:** don't pick one quarter-tone and pretend it's universal — expose the variation as a setting (Persian, Egyptian, Aleppine, Turkish AEU, Yarman 79).

---

## 2. General microtonal UI patterns

### Scala / .scl + .kbm

Lingua franca of microtonal tuning. Plain text: .scl defines pitch ratios/cents; .kbm maps them to MIDI notes. Used by Ableton Microtuner, Pianoteq, Hauptwerk, Lumatone Editor, Surge XT, Logic Pro. Universally portable with a vast online archive — but a developer format. End users download .scl blind and Scala is degree-based, not maqam-based: there's no canonical encoding for "Hijaz on D." We import .scl as a substrate and expose maqam semantics on top.

### Scale Workshop 3 (Sevish + xenharmonic-devs)

State-of-the-art browser microtonal tuning editor. MIT-licensed React app; tabs for build/synth/export. Scale lines accept rich syntax — `3/2` (ratio), `701.9` (cents), `n\m` (EDO step), monzos `[-1 1 0>`, FJS notation. Imports .scl/.kbm/.tun. Plays via QWERTY isomorphic, MIDI, or touch keyboard. URL-based sharing encodes entire state. **Reference for what a good microtonal browser tool looks like.**

But: it is a *tuning editor*, not a maqam instrument. The mental model is "I am building a scale from intervals" — a maqam musician thinks "I am playing Hijaz on D, segâh is here." Notation assumes Western/xenharmonic literacy: no perde names, no Arabic/Persian script, no Turkish koma symbols. QWERTY isomorphic surface is alien to qanun players.

### Ableton Live Microtuner + MTS-ESP (ODDSound)

Microtuner (free Max for Live, late 2024) loads .scl, supports lead/follow sync. MTS-ESP is the de facto DAW microtuning standard: a master plug-in sets a global tuning table read by clients in real time. Mini supports .scl/.kbm/.tun/MTS SysEx. Suite adds tuning morphing, automation, hardware integration. **Lesson:** dynamic retuning during a piece (Hijaz → Saba mid-phrase) is now an expected primitive — our engine should support it.

### Pianoteq + Hauptwerk: the preset-menu model

Pianoteq's Tuning panel has a Temperament dropdown: Equal, Meantone (5 variants), Werckmeister III, Kirnberger III, Vallotti, Young. Clicking re-tunes instantly. "Advanced Tuning" panel exposes per-note cents for power users. Hauptwerk extends this to 200+ historical organs, each with its original temperament, recallable instantly from console/panels/menus. **The clearest model for makam_studio's preset UX:** one dropdown of named tunings → instant retune → drill-down for power users. Replace "Werckmeister III" with "Hijaz on D (Turkish AEU)" and the model maps 1:1. A maqam app is, in this sense, a historical-music app.

---

## 3. Microtonal physical instrument controllers

### Lumatone

280-key hex isomorphic, poly aftertouch + Lumatouch. **Lumatone Editor** (free Mac/Win) assigns each key MIDI note/channel/color, saves 10 onboard presets, configures microtonal layouts (24-EDO, 31-EDO, 53-EDO). Editor mimics the physical hex grid; users color-code scales by function. **Lessons:** (1) color-code by function (karar, dominant, leading tone), not pitch; (2) editor mirrors physical layout — players think in hand shapes; (3) 10 onboard preset slots beat any menu. Translate: persistent "favorite tuning" quick slots.

### LinnStrument and Continuum Fingerboard

LinnStrument (200 pads, MPE) supports microtuning by tuning rows ±50 cents or via external scale-translation software — Roger Linn punts deep microtuning to external tools. **Lesson:** keep our tuning layer cleanly separable so users can drive Lumatone/LinnStrument with our engine.

Continuum Fingerboard (0.1¢ X-resolution, 3-axis touch) is heavily used for Carnatic/Hindustani — proving *continuous* pitch surfaces have a non-Western audience. **Open question:** should makam_studio offer continuous-slide mode? The qanun is plucked (pitch fixed by bridge), so discrete mandal is more authentic — but a slide mode could unlock vocal-imitation seyir.

### Tonal Plexus (H-Pi Instruments) and microtonal guitars

The Tonal Plexus packs 211 keys per octave with 32 user tuning tables; fewer than 100 were built. The Tonal Plexus Editor (now Universal Tuning Editor) lets you tune any key using ratios, Hz, decimals, or functions — beloved by ~50 theorists, never reached players. **Anti-lesson:** maximum flexibility ≠ maximum reach. Privilege the player over the theorist at every turn.

Erkan Oğur invented the fretless classical guitar (1976) for Turkish maqam intonation — pure ear, no reference pitches. Tolgahan Çoğulu's microtonal guitar uses moveable frets in tracks (equivalent to mandals). Both prove the demand; neither maps directly to a screen, but a "no-mandal" expert mode with tuner-style readout could honor the fretless tradition.

### Ozan Yarman's 79-tone qanun

Custom-built (2005), implements 79 MOS 159-tET. Naturals marked in **royal fuchsia**; from any natural up to 7 mandals down to flats, 8 to sharps, 12 to double-sharps. Two notations: Sagittal accidentals, and Yarman's **Mandalatura** — numeric labels (+1..+12, -1..-7, 0 = natural). Lessons: (1) mandal count varies 4–12 across traditions, our model must scale gracefully; (2) numeric notation is a viable alternative to glyph-stack accidentals.

---

## 4. UX heuristics for maqam UI

### The C-orientation problem

Western-trained users default to "C is home." **Maqam isn't key-based in this sense.** Karar (foundational pitch) can be any pitch — Rast on G is canonical Turkish, Rast on C is canonical Arabic; Persian dastgāh tunes around vocal range. To communicate this: default the karar to a *non-C* pitch (G or D) on first launch (subverts "C is home" immediately); show karar prominently, color-marked, never in a settings panel; karar transposition is one-finger (slider or +/-); never call it "key" — call it "karar" (or "tonic" with a tooltip).

### Naming: perde vs. letters vs. cents

**Maqam World** uses Western letters with quarter-tone accidentals. **Hardware qanuns** label mandals with numeric positions (1..12 for Turkish, 1..4 for Arabic). **Turkish theory** uses perde names (Rast = G, Dügâh = A, Segâh = B-flat-1-comma, Çârgâh = C, Nevâ = D, Hüseynî = E, Acem = F, Eviç = F♯, Gerdâniye = G). **Arabic theory** sometimes uses Italian solfège (Do, Re, Mi…) per Qtone Web.

**No existing tool labels well for all audiences.** The right answer is **dual labels with user preference**:

- Default: perde name (large) + Western letter + sub-octave cents (small)
- Toggle: perde-only / letters-only / cents-only / all three
- For Arabic users: an option to use Italian solfège instead of letters
- For Persian: koron/sori glyphs instead of Western quarter-tone accidentals

**Concrete spec:** every pitch label should be a structured object (perde, latin, solfege, persian, cents) and the rendering layer picks based on user preference.

### Visualizing a microtone

Existing approaches we observed:

| Tool | Approach |
|---|---|
| Maqam World | Western staff + half-flat / half-sharp glyphs |
| Qtone Web | Concentric rings: 12 semitones inner, 24 quarters outer; cents readout in center |
| Sibelius/Finale/MuseScore | Staff with Stein-Zimmermann or Gould microtonal accidentals |
| Lumatone | Color-coded hex cells, no notation |
| Yarman 79-qanun | Sagittal accidentals OR Mandalatura numeric (+1..+12, –1..–7) |
| Hardware qanun | Numbered mandal positions, raise/lower visible state |

**Recommendation for makam_studio:**
- **Primary visual:** mandal-row beneath each course, showing current position as filled vs. empty markers (mirrors physical hardware).
- **Secondary readout:** cents display on hover/touch (like Qtone Web's center).
- **Notation export:** when exporting to MusicXML or rendering a "current scale" diagram, support both Stein-Zimmermann (Arabic) and Sagittal/Yarman (Turkish) — as a user preference, not a hard pick.

### Responsive layout

The qanun is a **wide instrument**: ~26 courses × 3.5 octaves. On a 27" monitor, all 26 courses fit comfortably as parallel horizontal "strings." On a phone, you cannot show 26 strings without each being unplayable.

**Strategies observed:**
- GarageBand iOS strings: shows 4 cellos / violas on screen, swipe to access more, "Smart Strings" auto-completes chord shapes.
- Animoog: 16-key octave on screen, scroll for more, pinch to zoom octave width.
- Korg iELECTRIBE: 16 buttons fixed, swap "page" of buttons.

**Recommendation:** mobile collapses to **"current maqam view"** — show only the courses needed for the current jins/maqam (typically 7–10 of the 26), with the option to swipe to a "full instrument" mode. Desktop shows all 26.

### Touch vs. keyboard vs. MIDI

- **Touch (primary on mobile, secondary on desktop):** finger-pluck a string. Multi-touch for chords. Long-press a course to open its mandal panel.
- **QWERTY keyboard (primary on desktop):** isomorphic mapping (like Scale Workshop). Number-row or equivalent for accidentals/mandal toggles.
- **MIDI input (advanced):** map a MIDI keyboard or Lumatone via .kbm. Translate incoming MIDI notes through current maqam tuning.

Each requires distinct visual feedback. Touch needs large hitboxes (44px minimum, ideally 60px on phone). Keyboard needs visible key-binding labels on first hover. MIDI needs a tuning-mapping panel.

---

## 5. Accessibility

### Color use & symbolism

Green has strong **Islamic prophetic association** (Muhammad's favorite color, color of Paradise in the Quran, in many Muslim-majority flags). Not forbidden — *honored*. Avoid using green carelessly (e.g. error states); it works fine for karar marker or in-tune indicator. Yarman's 79-qanun marks naturals in **royal fuchsia** — a real used signal. Avoid black-and-gold "luxury Orient" and beige-and-brown "default Middle Eastern" palettes.

### Color-blind-safe palettes

Use Wong palette (IBM-derived): blue `#0072B2`, orange `#E69F00`, sky blue `#56B4E9`, vermilion `#D55E00`, bluish green `#009E73`, yellow `#F0E442`, reddish purple `#CC79A7`, black. Always pair color with shape/icon. WCAG AA: 4.5:1 normal text, 3:1 large.

### RTL for Arabic and Persian

`<html lang="ar" dir="rtl">` and `lang="fa" dir="rtl"`. CSS logical properties (`margin-inline-start`, `text-align: start`) — never `margin-left`. Numbers/codes stay LTR via bidirectional spans. Directional icons (arrows) flip; symbolic icons (search, gear) don't.

The qanun playing surface itself is direction-agnostic (a string is a string). What needs to flip: side panels (presets move to right edge in RTL), nav arrows, perde→letter reading direction, maqam family list.

### Screen-reader labels for microtonal pitches

VoiceOver/TalkBack have no convention for "E half-flat." AccessMusic uses a "talking tuner" with spoken pitch + cents. We should: provide ARIA labels per course (`aria-label="Course 7, Segâh, B-half-flat, 354 cents above karar"`); let the user choose readout format (perde / letter / cents / full); prefix the karar course with "Karar:"; label mandal toggles as "Mandal 1, Segâh raised by 1 koma, active" not "button".

---

## 6. Cultural sensitivity in UI

### Avoid Orientalist visual tropes

Specific things **not** to do:

- **Pseudo-Kufic / "Aladdin" display fonts** — fake-Arabic lettering made of Latin shapes. Never. Use real Arabic typefaces or none.
- **Sand dunes, lamps, scimitars, harem imagery** — even ironically. Just don't.
- **"Exotic" framing language** — "Mystical maqam scales of the East," "Ancient secrets of Arabic music." The maqam tradition is **alive, urban, and contemporary**; treat it that way.
- **The default "souk palette"** — saffron yellow, burnt orange, kohl black, used to signal "Middle Eastern". Too easy.
- **Pretending traditions are interchangeable.** Conflating Turkish, Arabic, Persian, Azeri into one "Eastern music" is the deepest Orientalist move. makam_studio's tradition tabs must be visibly equal and visibly distinct.

### Authentic script use & font recommendations

| Script | Body / UI text | Display / headers |
|---|---|---|
| Arabic | **IBM Plex Sans Arabic** (8 weights, modern, clean) | **Noto Naskh Arabic** for elegant body, **Amiri** for classical |
| Persian | **Vazirmatn** (rastikerdar/vazirmatn, 9 weights, MIT, designed for web/UI) | Vazirmatn Black for display, or **Sahel** |
| Turkish (Latin with diacritics) | **IBM Plex Sans** or **Inter** — both have full Turkish coverage |
| Ottoman Turkish (Arabic script) | **Noto Naskh Arabic** — supports the historical script |

All four are free / open-source, web-deliverable, and support the diacritics and ligatures their scripts require. Avoid Naskh fonts that don't fully connect — Arabic script's continuity is non-negotiable.

For musical perde labels: **Vazirmatn** works for both Persian and Arabic, ships with proportional Latin numerals, and looks current rather than nostalgic. Recommended as the unified label font.

### Credit lineage

Mirror BeatForge's "living archive" pattern. Specifically:

- Every maqam preset cites its tradition, its theoretical source (e.g. "Turkish AEU 24-tone, after Arel-Ezgi-Uzdilek, 1948") and its regional variant.
- An About / Credits page names theorists (Mikhail Mishaqa, Hossein Alizâdeh, Üzeyir Hacıbeyov, Ozan Yarman) and notes living teachers/players the project consulted.
- Pattern files are JSON, contributable via PRs — same as BeatForge.
- The project's About text affirms the tradition is **living, authored, and contested** — not a museum.

---

## 7. Mobile vs. desktop

The qanun is naturally wide (78 strings, 3.5-octave span). Phones are tall. There is no good way to show all 26 courses at playable size on a 6" portrait screen.

**Strategies surveyed:**
- **GarageBand iOS Strings:** 4 instruments visible at a time, swipe horizontally. "Smart Strings" pre-builds chords so the user doesn't need to play individual notes.
- **Animoog Z:** 16-key octave visible, scrollable. Pinch-zoom octave width. Selectable scales reduce the visible note set.
- **Korg iELECTRIBE / Module:** fixed 16-pad grid; "page" selector swaps which 16 pads you see.
- **Continuum app:** continuous strip, scroll horizontally. (Not playable with two hands at all.)

**Recommendation:** **desktop-first, mobile-collapsed.**

Desktop default: show all 26 courses, mandal panel expanded under each, side preset panel.

Mobile portrait: **"current maqam view"** — show only the 7–10 courses participating in the active jins/maqam. A "full instrument" toggle expands to all 26 with horizontal scroll. The mandal panel becomes a long-press modal rather than always-on.

Mobile landscape: closer to desktop — all 26 courses fit at small size, mandal panel as long-press.

Tablet: full desktop layout works.

---

## Implications for makam_studio (the actionable section)

### Screen layout (desktop)

```
+-----------------------------------------------------------+
| [Tradition tabs: Turkish | Arabic | Persian | Azeri | …]  |
+-----------------------------------------------------------+
| [Karar: D ▼]  [Maqam: Hicaz ▼]  [Save preset]   [Import]  |
+-----------------------------------------------------------+
|                                                           |
|   [Course 1] [Course 2] [Course 3] ... [Course 26]        |
|   ─────────  ─────────  ─────────       ─────────         |
|   ─────────  ─────────  ─────────       ─────────         |
|   ─────────  ─────────  ─────────       ─────────         |
|    mandal    mandal    mandal             mandal          |
|    panel    panel    panel              panel             |
|   (perde)  (perde)  (perde)            (perde)            |
|   (letter) (letter) (letter)           (letter)           |
|                                                           |
+-----------------------------------------------------------+
| [Cents readout: hovered course = 350¢ above karar]        |
+-----------------------------------------------------------+
```

Primary surface: 26-course string grid horizontally. Each course = three parallel string-lines + a mandal panel below. Pluck = click/tap a string. Edit a course's tuning = long-press / right-click → mandal modal opens.

Top control row: tradition tab, karar picker, maqam picker, save/import. **One row, no wizard, no modal.** Pianoteq dropdown model.

### Interaction model for "select karar + maqam"

Two adjacent pickers:

1. **Tradition tab** at the top (Turkish / Arabic / Persian / Azeri / Egyptian / Shashmaqam) — switches the catalog and the preferred notation system.
2. **Karar dropdown:** lists pitches with both names (e.g. "G — Rast", "A — Dügâh", "D — Nevâ"). Default: G (Rast) for Turkish, D for Arabic, C for Persian (per tradition convention).
3. **Maqam dropdown:** lists maqams from the current tradition. Within the dropdown, group by jins family (Maqam World ontology). Show the maqam's tonic-jins glyph as an icon next to the name.

Switching either picker re-tunes the whole instrument **instantly**, no apply button. Real-time preview as you scroll the dropdown.

### Per-string editing model

- **Hover** (desktop) shows a course's current pitch in cents + perde + letter.
- **Long-press** (touch) or **right-click** (desktop) opens that course's mandal panel — sliders or stepped buttons for the 4 (Arabic) or 12 (Turkish) mandal positions, with cents and perde labels. Saves as a tuning override.
- A small badge appears on a course that has a non-default override.
- "Reset to maqam" button per course and per instrument.

### Naming convention

**Dual labels, default to perde + letter, cents on demand.**

| User preference | Primary display | Secondary | Tertiary |
|---|---|---|---|
| Default | Perde (Rast, Dügâh…) | Letter (G, A…) | — |
| "Letters" | Letter (G, A♭½…) | Perde | Cents |
| "Cents" | Cents (0, 200…) | Perde | Letter |
| "Solfège" | Italian (Do, Re…) | Perde | Cents |
| "Persian" | Koron/sori glyphs | Perde | Cents |
| Power user | All four lines stacked | | |

Internal data: every pitch is `{ perde: "Segâh", latin: "B♭1", solfege: "Si bemolle", persian: "Si koron", cents_above_karar: 354 }`.

### Mobile-first or desktop-first?

**Desktop-first. Mobile-collapsed.** The qanun is a wide instrument; designing it for portrait phone first compromises the canonical view. Build the desktop layout, then design two mobile collapses:

- Mobile portrait: "current maqam" (7–10 courses), mandal as long-press modal, swipe for full instrument.
- Mobile landscape: scaled-down full instrument.

### Color palette + typography

**Palette (proposal):**

- Background: warm parchment (`#F4EFE6`) — not pure white, not Aladdin-beige
- Foreground/text: deep ink (`#1A1410`)
- Karar marker: deep teal (`#0F5C56`) — distinct from green, not Islamic-green
- "Currently played" highlight: amber (`#E69F00`) — Wong palette
- Mandal raised: bluish green (`#009E73`) — Wong palette
- Mandal lowered: vermilion (`#D55E00`) — Wong palette
- Tradition accents (one per tradition tab):
  - Turkish: deep indigo (`#3D4B8C`)
  - Arabic: terracotta (`#A14C3A`)
  - Persian: lapis (`#1F4E79`)
  - Azeri: oxblood (`#7A2E2E`)
  - Egyptian: ochre (`#B58A3D`)
  - Shashmaqam: cobalt (`#2C5282`)

(Tradition accents intentionally distinct, neither cliché nor flag-mimicking.)

**Typography (proposal):**

- UI body (Latin): **Inter** 400/500/600
- UI body (Arabic): **IBM Plex Sans Arabic** 400/500
- UI body (Persian): **Vazirmatn** 400/500
- Headings (Latin): Inter 700
- Headings (Arabic): **Noto Naskh Arabic** 700 — only for "ceremonial" text (about page, credits)
- Perde labels: Vazirmatn 500 (works across both Arabic and Persian, plus Latin)
- Numerals (cents readouts): Inter Tabular 400 (monospace digits)

### Three to five anti-patterns we must avoid

1. **The "select your maqam" wizard.** Several apps make tuning into a multi-step modal flow. Wrong. It's a dropdown. It's always a dropdown.
2. **Pseudo-Arabic display fonts** ("Aladdin," "Casablanca," "Sinbad" type families). Never. Real Arabic script or Latin only.
3. **Conflating traditions.** Don't ship "one quarter-tone" — ship the regional variants and let the user pick. Don't ship a single "Hijaz" — ship Turkish AEU Hicâz, Arabic Hijaz, Persian Chahargah-derived hijaz, separately and clearly.
4. **A piano-keyboard playing surface.** A piano metaphor pre-loads "C is home" and "black/white = scale/non-scale". Both are wrong for maqam. Stay with the qanun's parallel-string layout.
5. **"Set tuning by typing cents in a textbox."** Power users want this; default users will be defeated. The mandal-panel UI handles 95% of cases; an "advanced" textbox tab handles the rest.

---

## Open questions

1. **Continuous slide mode?** Should we offer a non-mandal mode where pitch is continuous along the string (vocal-imitation style)? The Continuum demonstrates demand; the qanun's plucked physics argues against it. Probably an opt-in expert mode.
2. **Notation export.** Stein-Zimmermann is dominant in Arabic. Sagittal / Yarman Mandalatura are used in Turkish theory. Persian sheet music uses koron/sori glyphs. Do we render all three on demand, or pick one canonical and let users override?
3. **Per-course color in default theme?** Lumatone teaches "color-code by function." Should every course be colored by its scale-degree role (karar, ghammaz, leading tone)? Or only the karar?
4. **MIDI in / MIDI out.** Lumatone integration is interesting — drive their hardware with our tuning engine. But this is a Phase 2/3 question.
5. **Recording + sharing.** Does the URL encode a session (Scale Workshop pattern)? Do we offer audio export? Pattern PRs only?
6. **Seyir hints.** Maqam World's "ghammaz" and "baggage notes" suggest melodic-direction hints. Should the playing surface visually suggest "this maqam typically rises through this note next"? Risk of over-prescribing improvisation.
7. **Tradition disagreement display.** Maqam Sikah on D in Aleppo ≠ Sikah on D in Cairo ≠ Sikah on D in Istanbul. Do we expose all three as side-by-side variants, or pick a default per tradition tab?
8. **What about ney/oud players, not qanunists?** The qanun control surface is canonical-by-design but unfamiliar to most maqam musicians (who play ney, oud, kemençe). Is there room for an oud-fretboard alternative view? (Phase 2/3.)

---

## Sources

### Maqam-specific software
- [MaqamWorld](https://maqamworld.com)
- [MaqamWorld jins page](https://maqamworld.com/en/jins.php)
- [MaqamWorld maqam page](https://maqamworld.com/en/maqam.php)
- [Maqam Lessons playground](https://maqamlessons.com/playground/index.html)
- [Maqam Mastery — Oud for Guitarists](https://learn.oudforguitarists.com/maqam-mastery/)
- [Maqamat Al-Arabiya (Android)](https://maqamat-al-arabiya.en.softonic.com/android)
- [Qanun Professional Instrument (iOS)](https://apps.apple.com/us/app/qanun-professional-instrument/id1673311388)
- [Qanun Sim (iOS)](https://apps.apple.com/sa/app/qanun-sim/id6739710730)
- [E-qanun (iOS)](https://apps.apple.com/az/app/e-qanun/id1609920528)
- [Qanun.az (iOS)](https://apps.apple.com/ae/app/qanun-az/id1596669588)
- [Best Service Qanun (Engine Player)](https://www.bestservice.com/en/qanun.html)
- [Qtone Web (GitHub)](https://github.com/doctorhy/Qtone-web)
- [MAQAM Quarter-Tone Tuning Controller (Mazeka Toys)](https://wmw-uae.com/product/maqam-quarter-tone-tuning-controller/)

### Microtonal editors and DAWs
- [Scale Workshop 3 (Sevish)](https://sevish.com/scaleworkshop/)
- [Scale Workshop on GitHub (xenharmonic-devs)](https://github.com/xenharmonic-devs/scale-workshop)
- [Scale Workshop User Guide](https://sevish.com/scaleworkshop1/guide.htm)
- [Ableton Microtuner](https://www.ableton.com/en/packs/microtuner/)
- [Ableton Tuning Systems FAQ](https://help.ableton.com/hc/en-us/articles/11535414344476-Tuning-Systems-FAQ)
- [MTS-ESP (ODDSound)](https://oddsound.com/)
- [MTS-ESP Suite](https://oddsound.com/mtsespsuite.php)
- [MTS-ESP on GitHub](https://github.com/ODDSound/MTS-ESP)
- [Pianoteq User Manual](https://www.modartt.com/user_manual?product=pianoteq&lang=en)
- [Pianoteq temperament discussion (forum)](https://forum.modartt.com/viewtopic.php?id=3845)
- [Hauptwerk overview](https://www.hauptwerk.com/overview/)
- [Hauptwerk historical temperaments](https://www.hauptwerk.com/bring-historic-organs-to-life-at-home-with-hauptwerk/)

### Hardware controllers
- [Lumatone Isomorphic Keyboard](https://www.lumatone.io/)
- [Lumatone Features](https://www.lumatone.io/features)
- [Lumatone Software Downloads](https://www.lumatone.io/support/software)
- [LinnStrument](https://www.rogerlinndesign.com/linnstrument)
- [Continuum Fingerboard (Haken Audio)](https://www.hakenaudio.com/continuum-introduction)
- [Continuum Fingerboard (Wikipedia)](https://en.wikipedia.org/wiki/Continuum_Fingerboard)
- [Tonal Plexus (H-Pi Instruments)](https://hpi.zentral.zone/tonalplexus)
- [Tonal Plexus Editor](https://hpi.zentral.zone/tpxe)
- [Ozan Yarman 79-tone qanun](https://www.ozanyarman.com/79toneqanun.html)
- [Erkan Oğur (Wikipedia)](https://en.wikipedia.org/wiki/Erkan_O%C4%9Fur)

### Qanun-specific references
- [Qanun (Wikipedia)](https://en.wikipedia.org/wiki/Qanun_(instrument))
- [Differences between Arabic and Turkish Qanun (EthnicMusical)](https://www.ethnicmusical.com/kanun/differences-between-arabic-qanun-and-turkish-qanun/)
- [Qanun mandal / lever set (Etsy product photo)](https://www.etsy.com/listing/1295907899/turkish-arabic-kanun-qanun-mandal-levers)
- [How to navigate levers in Arabic and Turkish qanuns (YouTube)](https://www.youtube.com/watch?v=EIOiDbixHIE)

### Notation and theory
- [Quarter tone (Wikipedia)](https://en.wikipedia.org/wiki/Quarter_tone)
- [Turkish makam (Wikipedia)](https://en.wikipedia.org/wiki/Turkish_makam)
- [Koron (Wikipedia)](https://en.wikipedia.org/wiki/Koron_(music))
- [LilyPond Persian classical music notation](http://lilypond.org/doc/v2.24/Documentation/notation/persian-classical-music)
- [Microtonal Theory: Makams and Maqamat](https://www.microtonaltheory.com/microtonal-ethnography/makams-and-maqamat)
- [Sibelius quarter-tone playback](https://www.rpmseattle.com/of_note/sibelius-quick-tip-quarter-tone-playback/)
- [Quarter-Tone Accidentals plugin for Finale (elbsound)](https://elbsound.studio/quarter-tone-accidentals.php)
- [Microtonal MuseScore plugin](https://musescore.org/en/node/4931)

### Typography and writing systems
- [Vazirmatn font (GitHub)](https://github.com/rastikerdar/vazirmatn)
- [IBM Plex Sans Arabic (Google Fonts)](https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic)
- [Noto Naskh Arabic (Google Fonts)](https://fonts.google.com/noto/specimen/Noto+Naskh+Arabic)
- [Noto Kufi Arabic (Google Fonts)](https://fonts.google.com/noto/specimen/Noto+Kufi+Arabic)
- [Basic Principles of Arabic Type Design (Communication Arts)](https://www.commarts.com/features/basic-principles-of-arabic-type-design)
- [Right-to-Left Mobile Design (Smashing Magazine)](https://www.smashingmagazine.com/2017/11/right-to-left-mobile-design/)
- [RTL Styling 101](https://rtlstyling.com/posts/rtl-styling/)
- [RTL design guide for developers (SimpleLocalize)](https://simplelocalize.io/blog/posts/rtl-design-guide-developers/)

### Cultural sensitivity and accessibility
- [Identity Representation: self-Orientalism in Arab design (Academia.edu)](https://www.academia.edu/33684768/Identity_representation_self_Orientalism_and_hyper_nationalism_in_Arab_design)
- [Localized UX and Cultural Design for Arabic Users (PGS)](https://www.pgsuae.com/blogs/localized-ux-and-cultural-design-for-arabic-users/)
- [Mirroring: How to Design for Arabic Users (Marvel)](https://marvelapp.com/blog/mirroring-designing-for-arab-users/)
- [Green in Islam (Wikipedia)](https://en.wikipedia.org/wiki/Green_in_Islam)
- [Symbolic Use of Color in Islamic Architecture (ArchDaily)](https://www.archdaily.com/1004972/the-symbolic-use-of-color-in-islamic-architecture)
- [A Practical Guide To Designing For Colorblind People (Smashing Magazine)](https://www.smashingmagazine.com/2024/02/designing-for-colorblindness/)
- [Color-Blind Safe Palette (IBM Design Library)](https://www.color-hex.com/color-palette/1044488)
- [AccessMusic (sheet music for blind musicians)](https://apps.apple.com/us/app/accessmusic/id6747299730)
- [VoiceOver Screen Reader Guide](https://www.accessibilityjobs.net/tools/voiceover)

### Mobile instrument design references
- [GarageBand iOS user guide](https://help.apple.com/pdf/garagebandiphone/en_US/garageband-iphone-user-guide.pdf)
- [GarageBand Strings (Apple Support)](https://support.apple.com/guide/garageband-iphone/play-the-strings-chsf2f99a20/ios)
- [Moog Animoog (Synthtopia)](https://www.synthtopia.com/content/2011/10/16/moog-animoog/)
- [User interface case study: iOS GarageBand (Ethan Hein)](https://www.ethanhein.com/wp/2012/user-interface-case-study-ios-garageband/)
