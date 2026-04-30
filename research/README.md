# Research

The foundation of makam_studio. Before any code is written, we are mapping the musicological, UX, and DSP terrain across the maqam (and adjacent modal) traditions the project aims to cover.

## Why this much research?

Maqam isn't one system. It's a family of overlapping but distinct traditions, each with its own theoretical history, performance practice, and disagreements between theorists. Adjacent traditions (raga, Byzantine octoechos, Maghrebi tab', Balkan dromoi) share most of maqam's structural concerns but bring distinct constraints (time-of-day, suite structure, drone). Building a tool that handles them honestly — without flattening differences — requires understanding each on its own terms.

## Wave 1 — completed 2026-04-30

| File | Scope |
|---|---|
| [`ottoman-turkish-makam.md`](ottoman-turkish-makam.md) | Arel-Ezgi-Uzdilek 24-tone system, Yarman critique, makam catalog, seyir, çeşni, perde names, geçki |
| [`arabic-levantine-maqam.md`](arabic-levantine-maqam.md) | Jins-based modular theory, maqam family tree, regional sikah variants, Mishaqa quarter-tone, Maqam World |
| [`persian-dastgah.md`](persian-dastgah.md) | 7 dastgāh + 5 avaz, koron/sori, radif/gusheh, Vaziri vs Farhat, instrument-driven tuning |
| [`azeri-mugham-and-shashmaqam.md`](azeri-mugham-and-shashmaqam.md) | Azerbaijani 7-mugham + Bukharan/Tajik 6-maqam, Hajibeyli's theory, the shared-name problem |
| [`egyptian-maqam-and-cairo-1932.md`](egyptian-maqam-and-cairo-1932.md) | Egyptian practice through Umm Kulthum, the 1932 Cairo Congress, regional flavor of sikah |
| [`qanun-instrument-design.md`](qanun-instrument-design.md) | Physical construction, mandal mechanics (Turkish vs Arabic), playing technique, key players, control-surface mapping |
| [`ux-interface-review.md`](ux-interface-review.md) | Existing maqam apps, microtonal keyboards, naming, RTL, color/cultural sensitivity, mobile vs desktop |
| [`web-audio-plucked-string-synthesis.md`](web-audio-plucked-string-synthesis.md) | Karplus-Strong + Thiran fractional delay, modal alternative, qanun-specific timbre, polyphony budget |
| [`tuning-systems-formalization.md`](tuning-systems-formalization.md) | .scl/.kbm formats, commas vs quarter-tones, unified data model proposal across all traditions |

## Wave 2 — dispatched 2026-04-30

Wave 2 extends coverage to adjacent traditions, deepens instrument-maker context, surveys a major UX direction (split-keyboard chord-and-melody), and inventories what to reuse from BeatForge. Stricter sourcing requirements: peer-reviewed anchors with full bibliographic citations.

| File | Scope |
|---|---|
| [`north-african-andalusian.md`](north-african-andalusian.md) | Tunisian ma'lūf, Algerian San'a/Gharnati, Moroccan Ālā, the tab' system, the nawba suite structure |
| [`hindustani-raga-and-khayal.md`](hindustani-raga-and-khayal.md) | 10-thaat system, 22-shruti theory + critique, khayal vs dhrupad, gharanas, time-of-day, tanpura drone |
| [`greek-byzantine-balkan-modes.md`](greek-byzantine-balkan-modes.md) | Byzantine octoechos, modern Greek dromoi (rebetiko/smyrneika), Bulgarian/Macedonian/Albanian modal practice |
| [`qanun-makers-and-luthiery.md`](qanun-makers-and-luthiery.md) | Ali Eken, Ejder Güleç, Nahat lineage, materials science, mandal mechanism, the "click," pricing tier |
| [`split-keyboard-chord-and-melody-ux.md`](split-keyboard-chord-and-melody-ux.md) | Omnichord, HiChord, autoharp, NI Komplete Kontrol Scale mode — split-keyboard interaction model + v1 layout |
| [`beatforge-reusable-research-mining.md`](beatforge-reusable-research-mining.md) | Inventory of what to fork / reference / draw inspiration from in `~/lab/beatforge/docs/` and `app/` |

Each doc carries: YAML frontmatter (title, audience, tldr, date, status), a TL;DR section, body, "Implications for makam_studio", "Open questions", "Sources", and (wave 2) a full bibliographic `## References` section.

## Wave 3 — dispatched 2026-04-30

Wave 3 covers two technical extensions arising from new product directions: a multi-instrument timbre roster (zurna, ney, clarinet, violin, kamancha, lyra, baglama, tar, dutar, tanbur in addition to qanun) and a MIDI maqam-translation layer (vanilla 12-EDO MIDI in → auto-pitch-bend / MPE / MTS-ESP out).

| File | Scope |
|---|---|
| [`multi-instrument-synthesis.md`](multi-instrument-synthesis.md) | Bowed-string PM (violin, kamancha, lyra), wind synthesis (ney, zurna, clarinet), long-neck plucked variants (baglama, tar, dutar, tanbur). Per-voice CPU + complexity assessment. |
| [`midi-maqam-translation.md`](midi-maqam-translation.md) | MIDI 1.0 pitch-bend math, MPE per-note channel allocation, MTS-ESP integration, vanilla-key → maqam-degree mapping, latency budget, the "maqam-tuning processor" architecture. |

## Wave 4 — dispatched 2026-04-30

Wave 4 covers the drone subsystem — musicology of drone usage across traditions, the "vaporwave ambient choir tubular wind" patch synthesis, and the Tab-to-current-pitch karar-modulation gesture.

| File | Scope |
|---|---|
| [`drone-synthesis-and-modulation.md`](drone-synthesis-and-modulation.md) | Drone in raga/dastgāh/maqam/Byzantine/folk traditions, vaporwave-choir-tubular-wind patch spec, Tab-modulation algorithm, drone in MIDI output |

## After research

Once both waves are reviewed, Phase 1 produces:

- A **product spec** (mirroring `beatforge/docs/spec/metronome.md`)
- A **tuning-data schema** (the unified data model from `tuning-systems-formalization.md`)
- An **audio engine architecture** (drawing on `web-audio-plucked-string-synthesis.md` + BeatForge fork)
- A **UX design doc** (interface decisions from `ux-interface-review.md` + `split-keyboard-chord-and-melody-ux.md`, governed by [`docs/design-direction.md`](../docs/design-direction.md))

Then code begins.
