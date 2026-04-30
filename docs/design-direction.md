---
title: Design direction
audience: contributors, future-self
tldr: Captures the controlling-metaphor and primary-interaction pivots set after wave 1 of research.
date: 2026-04-30
status: living
---

# Design direction (2026-04-30)

> Living doc. Updated as research and prototyping refine these decisions. Pivots set here override anything in `research/` that contradicts them — the research is input, this is judgment.

## Pivot 1: piano is the canonical UI metaphor; qanun is the honored model

**The framing.** "The piano is a kanun in a tux." Both are harps laid flat and stood up — same one-pitch-per-string topology, same key-to-string rank order. The piano just hid the strings in a box and locked them to 12-EDO. makam_studio is the piano with the strings exposed and the lock removed.

**Why this matters.** Most electronic-music people think in pianos. A literal qanun trapezoid as the first thing a user sees is a learning cliff for 95% of the audience. A microtonal piano keyboard, on the other hand, is instantly grokkable: "press this key, hear this pitch — but the pitches have shifted because we're in C Hicaz."

**Implication.**
- **Default playing surface**: a piano-style keyboard, microtonally re-pitched per the active maqam preset. Standard piano layout, microtonal where the maqam asks.
- **Qanun-honor view**: an opt-in advanced layout that shows the literal trapezoidal mandal grid. Power users get this.
- **Per-string override**: long-press / right-click on any pitch to slide it off-grid. Available everywhere.

What is *not* abandoned: the qanun is still the model. Mandal-flip gestures, perde labeling, tradition-correct scale collections, and the ability to drop into the qanun-honor view — all preserved. The qanun is what we're modeling; the piano is what we're showing.

## Pivot 2: split-keyboard chord-and-melody as the primary interaction mode

**The reference instruments.** Suzuki Omnichord, HiChord, Appalachian autoharp, QChord, NI Komplete Kontrol "Scale" mode, Casio arranger keyboards. Common pattern: one hand selects "what's available" (chord, mode, scale); the other plays melody within it.

**Why maqam fits this perfectly.** Maqam is fixed-tonic + melodic-elaboration. The left-hand job is karar (root) + maqam selection — that is *exactly* the qanun mandal-state-for-the-whole-instrument gesture. The right-hand job is melody. Unlike Western tonal music — which needs chord progressions, where the left hand keeps changing — maqam is generally "set the karar, set the maqam, then dwell." The interaction model is naturally bimanual but asymmetric.

**v1 layout.**
- **Left zone (~30% of width on desktop, top half on mobile).** A grid of maqam preset buttons (filtered by current tradition tab) + a karar slider (full chromatic) + tradition tabs (Turkish / Arabic / Persian / +). Tapping a maqam button instantly retunes the right zone. Holding shift / long-press on a pitch in the right zone allows per-string override.
- **Right zone (~70% on desktop, bottom half on mobile).** A piano-style keyboard, 2.5–3 octaves on desktop, 1.5 on mobile. Each key represents a pitch in the current maqam (not necessarily a 12-EDO semitone). Microtonal accidentals (½♭, koron, sori, AEU comma marks) are rendered on the keys.
- **Layout-mode toggle**: switch to single-surface mode (hide left zone, expand right) for full-keyboard playing. Toggle to qanun-honor mode for the trapezoid view.

**v2 / power-user.** Mid-melody mandal flips on individual pitches, like a Turkish qanun player. Sustain pedal. MIDI input mapping (perde-keyed). Recording.

## Pivot 3: ruthlessly reuse from BeatForge

`~/lab/beatforge/docs/` and `~/lab/beatforge/app/src/` already contain solved problems we don't re-derive:

- AudioWorklet boilerplate + build pipeline (Vite + Bun)
- Web Audio engine architecture (voices → buses → master FX)
- PWA / Workbox / offline-first patterns
- IndexedDB (Dexie) preset persistence
- Share-link-by-URL encoding
- "Secret tab by URL param" pattern (BeatForge's MIDI tab) — adopt for makam_studio's qanun-honor view
- React 19 + TypeScript + Vite project structure
- INDEX.yaml documentation convention
- Living-archive ethos and CONTRIBUTING.md cultural-sensitivity language

Wave-2 agent F maps the specific files. v1 forks; we improve where needed and credit BeatForge throughout.

## Pivot 4: scope expansion to adjacent modal traditions

v1 ships Turkish + Arabic + Persian. But wave 2 adds research into adjacent traditions whose schema implications must be accommodated *now*, even if the presets ship in v2/v3:

- **North African Andalusian** (Tunisian ma'lūf, Algerian San'a/Gharnati, Moroccan Ālā). Less microtonal than Mashriqi, but adds the **suite-structure** dimension (nawba).
- **Hindustani raga + khayal**. Adds **time-of-day metadata**, **drone-anchored** practice (tanpura), and a much-deeper-than-scale modal hierarchy (raga ≠ scale, harder than Persian dastgāh).
- **Greek / Byzantine octoechos / Balkan modes**. The Byzantine 8-mode system is one of the few traditions with rigorous historical theory; modern Greek dromoi is essentially Ottoman makam at coarser tuning; Balkan adds rhythm overlap with BeatForge.

The boundary between maqam, raga, dastgāh, echos, and tab' is theoretical, not acoustic. They share microtonal practice, drone-anchored tonic, modal hierarchy, and seyir-like melodic contour rules. Modeling them separately wastes engineering work; modeling them together is the project's honest claim.

## Pivot 5: the free digital qanun as public good

A serious physical Turkish qanun starts at ~$1500 and runs to $15K+; a Yarman-style ultra-microtonal qanun is $20K+. Most prospective maqam players cannot afford the instrument. Even those who can face an apprenticeship pipeline that's contracting in the diaspora.

A free, open, browser-based, offline-capable maqam instrument is a public good. The economic-access case shapes the project's tone: this is for students, diaspora kids, music teachers in under-resourced schools, hobbyists, and curious electronic-music people. Frame the about page, the credits, the license, and the cultural-sensitivity language to honor that audience.

## Pivot 6: monophonic v1 + pitch-network with button-overrides

**v1 is monophonic.** One note at a time. Six of the eleven target timbres (ney, zurna, clarinet, violin, kamancha, lyra) are physically monophonic anyway; the long-neck lutes (qanun, baglama, tar, dutar, tanbur) get monophonic playing in v1 and full polyphony in v2.

**The playing model is "pitch-network with button-overrides."** This is the qanun mandal model abstracted from the physical instrument:

- **Default.** Pressing a key plays the canonical pitch of that scale-degree in the active maqam preset. Rast → Rast's pitches; Hicaz → Hicaz's pitches.
- **Override buttons.** Each scale-degree has a small palette of candidate pitches available immediately — for example, on the third degree of Sikah: Cairene (340¢) / Aleppine (340¢) / Iraqi (360¢) / Turkish Segâh (384¢), or finer sub-comma adjustments. Tap the button to retune that one note; configurable as one-shot or sticky.
- **Karar slider** still transposes the whole network.

This is "discrete pitch-bend": instead of a continuous wheel, you get a small grid of musically-meaningful targets. Faster to play accurately than a slider, more honest to maqam practice than 12-EDO.

The same data structure (per-degree candidate-pitch list) drives both v1 monophonic and v2 polyphonic UIs. Build it once.

## Pivot 7: multi-instrument timbre selector

A timbre selector ships with v1, covering the canonical maqam-world voices. Each entry has a synthesis path (revisited in `research/multi-instrument-synthesis.md`):

| Voice | Synthesis approach | Status |
|---|---|---|
| **Qanun** (plucked) | Karplus-Strong + Thiran fractional delay | Wave 1 covered |
| **Baglama / saz** | K-S, longer decay | BeatForge `modal` already ships saz preset — fork it |
| **Tar** (Persian/Azeri) | K-S with double-bowl body model | Wave 1 + tweak |
| **Dutar** (Central Asian) | K-S, sparser, drone-friendly | Wave 1 + tweak |
| **Tanbur** (Ottoman / Tajik) | K-S, very long sustain, sympathetic resonance | Wave 1 + tweak |
| **Ney** (end-blown reed flute) | Edge-tone + breath-noise + formant; possibly waveguide flute | Wave 3 |
| **Zurna** (double-reed shawm) | Double-reed waveguide / FM with rich harmonics | Wave 3 |
| **Clarinet** (Greek/Balkan tradition) | Single-reed waveguide / FM | Wave 3 |
| **Violin** (Ottoman / Western art) | Bowed-string physical model | Wave 3 |
| **Kamancha** (Persian/Azeri spike fiddle) | Bowed-string PM, smaller body | Wave 3 |
| **Lyra** (Cretan / Black Sea) | Bowed-string PM, distinct body resonance | Wave 3 |

Voice selection is independent of mode/maqam selection: any maqam can be played on any voice. The musician decides.

## Pivot 8: MIDI in/out with automatic maqam pitch-bend (the killer feature)

makam_studio is a **maqam-tuning processor**, not just a synth.

**MIDI in.** Vanilla 12-EDO MIDI from any USB keyboard. Note 60 (middle C) → mapped to a scale-degree in the current octave → played at the active maqam's canonical pitch for that degree. User plays piano-like; the maqam tunes itself.

**MIDI out.** Two output modes:
- **Single-channel + pitch-bend** (MIDI 1.0): note number + 14-bit pitch-bend value, sent to any monotimbral synth. Default ±2 semitones bend range; auto-recalibrate per note for sub-cent accuracy.
- **MPE** (MIDI Polyphonic Expression): channel-per-note pitch-bend for polyphonic external synths (Roli, modern hardware, MPE-aware VSTs). Required for v2 polyphony anyway.

**Standards interop.** **MTS-ESP** output for compatible plugins (load the active maqam directly into Pianoteq, Surge XT, u-he Diva, etc.). **MTS SysEx** bulk dump for older synths. **.scl/.kbm export** for archival.

**Why this matters strategically.** A producer who already owns a hardware synth, a piano sample library, an orchestra of VSTs — they can plug any of those into makam_studio and play maqam-tuned music through them. The synth-engine is one consumer of the tuning data; every external synth becomes another. The tuning-data layer is now more important than the audio engine.

**Latency budget.** MIDI is real-time. Translation must add < 1 ms. Pitch-bend must be sent BEFORE note-on (not after) to avoid pitch-glitch on attack — this is the single trickiest detail and is wave-3-agent-B's core question.

## Pivot 9: drone subsystem with Tab-modulation gesture

**The drone is a v1 feature, not a v2 nice-to-have.** A separate voice running alongside the lead. Even minimal — one mono drone, one pad voice — unlocks the "maqam improv with ambient bed" use case the user explicitly wants and lets the project honor traditions where drone is structural (Hindustani tanpura, Byzantine ison, Sufi zikr, modern fusion / vaporwave / ambient maqam).

**Aesthetic target: "vaporwave ambient choir tubular wind."** Layered:
- **Choir formant** — slow vowel cycle (A→E→I→O→U over ~10s), 4–8 detuned voices, formant-shifted noise.
- **Tubular** — modal / infinite-decay Karplus-Strong (feedback ≥ 0.999) for bell/glass-tube resonance.
- **Wind** — pink/breath noise filtered through a cylindrical-bore resonator, subtle, in the background.
- **Envelope** — slow attack (~500 ms), infinite sustain, slow release (~3–5 s).
- **Movement** — slow tremolo (~0.3–0.7 Hz), optional ±10 c analog drift over ~30 s, long damped reverb tail.

Reference flavor: Stars of the Lid, William Basinski, Macintosh Plus, Niyaz, Anouar Brahem's quiet sections, Ross Daly drone segments. Web Audio realization: one AudioWorklet voice ≈ 3× K-S CPU cost; acceptable.

**Drone configurations:**
- **sa-pa** (root + fifth) — universal classical default.
- **sa-Ma** (root + fourth) — for maqamat with inflected fifth (Saba, some Persian).
- **single-tone** (root only) — Byzantine ison style.
- **moving ison** — drone follows the most recent "rest tone" (v2; Byzantine-inspired).

**The Tab-to-current-pitch gesture.** User is on a melody pitch; presses Tab; drone glides smoothly (~600 ms exponential) from old karar to the held pitch. Two modes:
- **Re-center** (default): maqam re-anchors to the new karar — whole pitch network shifts. Mid-improv karar modulation, made cheap.
- **Float**: drone moves; maqam stays anchored. Creates expressive non-tonic tension.

This is **the project's signature improvisational move**. Classic maqam tools force "stop, pick new karar, restart" to modulate. Real qanun players can flip mandals mid-piece but cannot easily change karar. Tab-modulation collapses both gaps into a one-key live gesture. As far as I can tell, no commercial maqam tool does this.

**Drone in MIDI output.** Drone gets its own MIDI channel (or its own MTS-ESP virtual instrument). Pitch-bend follows the karar. External producers can route the drone to an actual ambient-pad VST while the qanun voice goes to a hardware sampler — every voice in the patch is a separate consumer of the tuning data.

**Drone UX surfaces:**
- On/off toggle (default: on).
- Voice selector (vaporwave-choir-tubular-wind / mono-bourdon / sa-pa pair / single-tone-ison).
- Volume slider.
- Tab-to-current-pitch (default-on); GUI alternative for users who prefer a button.
- "Re-center vs. float" mode.
- Custom drone pitch (lock to any frequency, ignoring karar).

## Pivot 10: modern synth patches alongside the traditional voice roster

Beyond the maqam-world instrument timbres (qanun, baglama, tar, dutar, tanbur, ney, zurna, clarinet, violin, kamancha, lyra), v1.5+ ships a parallel **modern-synthesis voice category**: ambient, electronica, vaporwave, synthwave, future-funk, IDM-flavored patches.

**Why.** Maqam tunings are theoretically unrelated to electronic music, but the cultural intersection is the most active artistic frontier in maqam right now — Niyaz, Mercan Dede, Onra, the entire ambient-Islamicate scene on Bandcamp, the lo-fi-maqam YouTube playlists, modern Anatolian electronic (Gaye Su Akyol, Altın Gün's psychedelic edges). Sound-design experimentation IS contemporary maqam practice for a large segment of the audience. The project should encourage it, not just preserve tradition.

**Initial patch set (Phase 1.5):**

- **Vaporwave pluck** — chorused saw with long delay, cassette flutter, slowcore pitch-drift. Pairs naturally with the vaporwave drone.
- **Ambient pad** — spectral resynthesis with maqam-locked partials, 60-second attack, modulated convolution-free reverb tail.
- **Synthwave lead** — supersaw + analog filter + bite, made for arpeggiator-driven Hicaz / Nawa Athar lines.
- **Future-funk bass** — 80s Tokyo-funk synth bass, rhythm-locked, microtonal-precise. Cross-product with BeatForge: a maqam bassline + a BeatForge clave = an instant production sketch.
- **IDM pluck** — granular K-S with pitch-shifted tail, glitch-friendly, deliberately unpredictable.
- **Dub bass** — 808-derived sub with side-chain pumping. Microtonal sub-bass is genuinely novel territory.
- **Future R&B keys** — DX7-style EP with chorus, microtonally tuned to Bayati / Husseini for soft cadences.

**These are NOT departures from the project ethos.** They share the engine, the tuning data, the MIDI translator, the drone. They are alternative voices that prove maqam tunings work in any sonic context. The same Hicaz preset that drives the qanun also drives the synthwave lead; the user picks the voice; the tuning is invariant.

**Non-goal:** we do not ship a generic VA synth UI. The patches are pre-designed; the user picks a patch, not a thousand parameters. (The patch-design surface is for future contributors via a Phase 3 advanced editor.)

**Drone configurations addendum.** Drone interval modes ship with stacked-octaves option (root + octave, root + octave + 2 octaves) alongside sa-pa, sa-Ma, single-tone, and triad. Multiple configs available; user chooses; default depends on selected drone voice (vaporwave defaults to root + octave; classical defaults to sa-pa; Byzantine defaults to single-tone).

## Pivot 11: qanun-instrument-first paradigm (supersedes Pivots 1, 2, 6)

Authoritative v1 design now lives in `~/lab/makam_studio/design_notes/design_notes.md`. The split-keyboard / piano-canonical / autoharp-button paradigm is rejected as too removed from the qanun's actual gesture (flip a mandal, pluck a string).

**The instrument**: a vertical stack of 24 strings spanning 2.5 octaves of the active maqam, with each row showing a mandal track (legal retuning positions) | perde + cents readout | pluck button. Live perde-name resolution. Istanbul brutalist styling (slate-blue concrete + Iznik tile band + manuscript gold + pomegranate karar).

**Tradeoff**: less generalizable to non-Turkish traditions (Arabic, Persian, Maghrebi) than the abstract piano-canonical paradigm. Acceptable: the qanun's own home is Turkish/Arabic art-music, so a Turkish-leaning v1 is honest. v2+ adds tradition-specific layout variants if the design proves itself.

**Spec implications**: parts of `docs/spec/v1.md` referencing the split-keyboard layout (§4, §6) are superseded by `design_notes/design_notes.md`. Sections 13 (tuning-data layer), 14 (URL share-link), 15 (IndexedDB schema) remain authoritative.

## Open questions (will be resolved in Phase 1)

- Project naming — "makam_studio" doesn't fit raga or Byzantine or Maghrebi cleanly. Possible reframe to "modal_studio" or "tuning_studio" if scope expansion holds; defer until v1 ships.
- How aggressively do we implement the "qanun click" sound effect — modal switch sound? (Some users will love it; some will find it kitsch.)
- Do we ship raga / Byzantine / Maghrebi presets in v1 (small token gesture) or hold them for v2?
- Default tuning grid for Turkish: AEU 53-EDO theoretical, or 72-EDO performance practice?
- MIDI input key-mapping convention: linear (every key = next scale degree, wraps at octave) or hybrid (white keys = canonical scale, black keys = override-palette shortcuts)?
- Color and typography palette — explicit decision deferred to Phase 1 design review.
