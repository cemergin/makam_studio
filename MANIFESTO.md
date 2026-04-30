# makam_studio — Manifesto

> The constitution for this work. The slow-changing layer. When this document and `docs/design-direction.md` disagree, this document wins; tactical pivots are subordinate to the principles here. Revised by intent, not by drift.

**Date:** 2026-04-30 — Phase 0 close.
**Status:** Living constitution; subsequent revisions are commits with explicit intent in the message.

---

## 1. What we are building

A free, browser-based, microtonally accurate musical instrument for the world of maqam — and adjacent modal traditions: Turkish, Arabic (Levantine and Egyptian), Persian dastgāh, Azerbaijani mugham, Bukharan-Tajik shashmaqam, North African Andalusian nawba, Greek dromoi, Byzantine octoechos, Balkan rural modal practice, Hindustani raga.

It runs offline. It needs no signup. It works on a phone. Its source is MIT.

It models the **qanun as governing metaphor** — every pitch independently retunable, every maqam a "mandal configuration" applied to the whole instrument — but presents that model through an interface most musicians can already read: a microtonal piano keyboard, with an autoharp-style preset selector for picking a maqam and a karar.

It is also a **MIDI maqam-translation processor**: any external keyboard plugged in plays in the active maqam, and any external synth plugged out receives correctly-tuned MIDI with auto pitch-bend (or MPE per-note channels). makam_studio's audio engine is one consumer of the tuning data; every external rig becomes another.

It ships a **drone subsystem** with a "vaporwave ambient choir tubular wind" patch and a Tab-to-current-pitch karar-modulation gesture — a primitive that neither the physical qanun nor classical performance practice quite supports, borrowed in spirit from the Byzantine moveable ison.

It ships a **multi-tradition catalog** with regional flavor (Cairene Sikah ≈ 340 cents; Aleppine ≈ 340; Iraqi ≈ 360; Turkish Segâh ≈ 384), a parallel **modern-synth voice category** (vaporwave, synthwave, future-funk, ambient, IDM) for sound-design experimentation, and a **cultural-context layer** that names luthiers, theorists, performers, and minority lineages.

## 2. Why we are building it

Four reasons, ordered by importance.

**Paradigm experimentation through software.** There is no good digital interface for playing maqam-based music. The wave-2 UX review surveyed every commercial and open-source maqam app, every microtonal keyboard, and every DAW tuning extension; the competitive landscape is effectively empty. That gap is also an opportunity: the design space of maqam interfaces is wide open, and software is the right medium for exploring it. We can prototype the split-keyboard, the qanun-honor view, the autoharp-button preset grid, the MIDI translator, the drone subsystem with Tab-modulation, the modern-synth voice category — multiple paradigm experiments running in one repo. Hardware iteration costs months and thousands of dollars per prototype; software iteration costs an afternoon. We are not just shipping a tool. We are running an open laboratory for what playing maqam in 2026+ can look like.

**Microtonal accuracy as honesty.** A 12-EDO piano cannot play maqam. A 24-EDO quarter-tone keyboard plays approximate Mashriqi maqam but not Turkish (Holdrian commas), Persian (koron/sori), Byzantine (72-moria), or true performance-practice intonation in any of them — the same name "Sikah" denotes pitches separated by 40+ cents across regional schools. A tool that rounds these to whatever-grid-it-already-supports erases the music. makam_studio does not round.

**The cross-tradition reframe.** Maqam, raga, dastgāh, mugham, octoechos, tab', dromos — these traditions share microtonal practice, drone- or shahed-anchored melodic modeling, modal hierarchy beyond scale, and seyir-like contour rules. They are not the same; each has its own theoretical lineage and aesthetic. But the boundary between them is theoretical, not acoustic. Modeling them separately wastes engineering work; modeling them together — without flattening differences — is the project's honest claim.

**Public-good economics.** A serious physical Turkish qanun starts at ~$1,500 and runs to $15,000+; a Yarman 79-tone or Weiss Al-Kindî qanun is $20,000+. The apprenticeship pipeline that produces master luthiers is contracting in the diaspora. Most prospective maqam musicians cannot afford the instrument. A free, open, offline-capable browser instrument is a public good for students, diaspora kids, music teachers in under-resourced schools, electronic-music people curious about microtonality, and active practitioners who want a portable rig that fits in a backpack.

## 3. Core beliefs (the cultural posture)

These are not negotiable.

**Living archive, not museum.** We are not preserving traditions in amber. We are giving practitioners a tool. If a Turkish qanun player tells us our default Hicaz is wrong, we change it. If a Bukharan Shashmaqam scholar tells us our Rost preset is academic and not how Levi Babakhanov played it, we ship the Babakhanov version too.

**Practitioners are authorities.** When the theoretical literature (AEU, Vaziri 24-EDO, 22-shrutis, Mishaqa quarter-tone) and master performers' actual recordings disagree, we follow the recordings. Karaosmanoğlu's pitch histograms beat the textbook every time. The textbook is shipped as a *toggle*, not the default.

**Diaspora and minority lineages are constitutive, not decorative.** The Bukharan-Jewish role in preserving Shashmaqam through the Soviet century; the Maghrebi-Jewish role in the 1904 Yafil transcriptions and the survival of Algerian Andalusian music; the Roma transmission of Ottoman modes across the Balkans; the Syrian-diaspora makers post-2011 — these are not footnotes. They appear on the credits page; they shape preset selection; they're cited by name.

**Anti-Orientalism.** No Aladdin-style display fonts. No "exotic" framing language. No incense imagery, no fake-Arabesque ornament. Authentic scripts (Arabic, Persian Nastaliq, Turkish Latin, Greek, Devanagari) where appropriate, with English transliteration. Musicians and luthiers credited by name.

**Free as in freedom.** MIT license. No accounts. No telemetry. No cloud. No backend. IndexedDB and localStorage only. The user's data stays on their device. Their saved presets are theirs. We do not collect what they play.

## 4. What we are NOT

Naming the seductive paths and rejecting them is cheaper than re-arguing each one as it comes up.

- **NOT a sample player.** No oud samples. No qanun samples. No ney recordings. Pure synthesis. Reasons: bundle size, hosting cost, licensing risk, compositional flexibility, the "no museum" posture.
- **NOT a DAW.** No mixing console. No multi-track recording. No timeline. (BeatForge handles rhythm; makam_studio handles pitch. Compose them externally.)
- **NOT a teaching app first.** Practice mode is a v2+ feature. v1 is an instrument.
- **NOT a closed grid.** No 12-EDO lock. No 24-EDO lock. Microtonal precision is non-negotiable, including for the modern-synth patches.
- **NOT polyphonic in v1.** v1 is monophonic. Polyphony is v2.
- **NOT phone-native.** Mobile-friendly, yes. Phone-native, no — the multi-instrument synthesis budget and the split-keyboard layout assume desktop or tablet for the best experience. The phone gets a competent reduced view.
- **NOT a social platform.** Share-by-URL preset links, yes. Comments, follows, accounts: never.
- **NOT a generic synth.** Patches are curated. Users pick a patch, not a thousand parameters. (Advanced editor is Phase 3.)
- **NOT monetized.** No premium tier. No paid presets. No ads. The economic public-good case is foundational.

## 5. The architecture (in 600 words)

Three subsystems, each one a consumer of a shared **tuning data layer**.

**The tuning data layer.** The unified maqam preset format from `research/tuning-systems-formalization.md`. Every preset = `{ tradition, region, karar, pitches[], pitches_descending?, ajnas?, perde_names?, seyir, references, aliases }`. Pitches stored as cents from karar; ratios kept as informational strings. The layer also models the qanun's mandal state — per-course candidate-pitch list with active selection. This is the most important file in the codebase; it is the single source of truth that all three subsystems read.

**Subsystem 1 — Lead synthesis.** v1 ships qanun + baglama + tar + ney + clarinet (5 voices). Karplus-Strong with Thiran fractional delay for plucked voices; cylindrical-bore waveguide for ney/clarinet. One AudioWorklet, internal voice pool, monophonic v1, polyphonic v2. Bowed strings (violin, kamancha, lyra) deferred to v2 due to CPU. Modern-synthesis patches join in Phase 1.5 as a parallel category sharing the same engine, tuning, and routing.

**Subsystem 2 — MIDI translator.** Vanilla 12-EDO MIDI in → maqam-tuned MIDI out. v1 default: single-channel + 14-bit pitch-bend at ±2 semitones (~0.024 cent resolution — finer than our preset storage). v2: MPE per-note channels for polyphonic external synths. Hybrid key-mapping default (white keys = scale, black keys = override-palette shortcuts). Pitch-bend scheduled 1 ms before note-on to avoid attack glitch. Embedded mode in v1; standalone proxy mode (the "maqam-tuning pedal" delivery) in v1.5.

**Subsystem 3 — Drone.** Separate voice running alongside the lead. v1 ships the vaporwave-choir-tubular-wind patch. Multiple interval configurations: sa-pa (default), sa-Ma, single-tone (Byzantine ison style), sa-pa-octave triad, stacked octaves, custom. Tab-to-current-pitch karar-modulation gesture is the project's signature improvisational move. Drone gets its own MIDI channel for external routing — every voice is separately addressable.

**UI layer.** Split-keyboard primary mode: left zone (~30%) = tradition tabs + maqam preset grid (16 buttons) + karar slider; right zone (~70%) = piano-style microtonal-shifted keyboard with per-pitch override buttons. Mobile collapses to vertical 50/50 split. Layout-mode toggles for single-surface and qanun-honor (literal trapezoid + mandal grid) views. Pitch labels are pluralized — perde + Latin + cents — toggleable per user.

**Engine.** Forked from BeatForge per `research/beatforge-reusable-research-mining.md`. AudioWorklet pool, voice management, master FX (damped reverb + compressor + EQ), Web Audio scheduler, Web MIDI bridge, PWA scaffold, IndexedDB preset persistence, share-link-by-URL encoding, INDEX.yaml-per-directory documentation convention. We do not re-derive. We fork, credit, and improve.

## 6. The killer feature

**makam_studio is a maqam-tuning processor that any external rig can use.**

This reframe moves the project from "another web synth" to "the pedal that turns any keyboard into a maqam keyboard." The synth-engine is one consumer of the tuning data; every external synth becomes another. A producer with a hardware Korg, a Pianoteq license, a Spitfire orchestral library, a modular rig — they can all play maqam-tuned music with makam_studio in front of their MIDI input.

The strategic implication: the **tuning-data layer is more important than the audio engine**. A perfect engine with imperfect tuning is useless; an imperfect engine with perfect tuning still empowers everyone with hardware. This decision orders our engineering priorities for the entire roadmap.

## 7. The 10 design pivots (quick reference)

Expanded in `docs/design-direction.md`.

1. **Piano is the canonical UI metaphor; qanun is the honored model.** Microtonal piano keyboard is the default playing surface; literal qanun trapezoid is an opt-in advanced view.
2. **Split-keyboard chord-and-melody as primary interaction.** Autoharp / Omnichord lineage; left zone = preset selector, right zone = melody.
3. **Reuse from BeatForge ruthlessly.** Don't re-derive AudioWorklet patterns, MIDI bridge, PWA scaffold, share-link encoding.
4. **Scope expansion to adjacent modal traditions.** v1 = TR/AR/FA; schema accommodates Maghrebi, Hindustani, Byzantine, Balkan now.
5. **The free digital qanun as public good.** Frame the about page, license, and tone around economic access.
6. **Monophonic v1 + pitch-network with button-overrides.** One note at a time; per-degree pitch palette with override buttons (qanun mandal model abstracted).
7. **Multi-instrument timbre selector.** 11-voice target list; v1 ships 5; bowed strings deferred to v2.
8. **MIDI in/out with automatic maqam pitch-bend.** The killer feature.
9. **Drone subsystem with Tab-modulation gesture.** Vaporwave-choir-tubular-wind voice; karar modulation as one-key live gesture.
10. **Modern synth patches alongside the traditional voice roster.** Vaporwave, synthwave, future-funk, ambient, IDM. Sound-design experimentation IS contemporary maqam.

## 8. Roadmap

**Phase 0 — Research (closing 2026-04-30).** ~18 docs across 4 waves landed in `research/`. Cultural posture, technical risks, schema, killer feature, drone subsystem all specified. No code yet.

**Phase 1 — Spec + schema + architecture (~2 weeks).** Synthesize research into a written product spec (mirroring `beatforge/docs/spec/metronome.md`), the v1 tuning-data schema as a real TypeScript module, an audio engine architecture document with the BeatForge fork plan, and a UX design doc. Color/typography decided.

**Phase 2 — MVP build (~8–12 weeks for a solo dev).** v1 ships: 5 lead voices, ~24 maqam presets across Turkish/Arabic/Persian, MIDI in/out with single-channel pitch-bend translation, drone subsystem with Tab-modulation, split-keyboard UI with karar slider, PWA / offline / share-link / IndexedDB persistence. Live at a public URL.

**Phase 3 — Tradition expansion + standalone proxy + modern patches (~6–12 months post-MVP).** v2 voices (bowed strings, polyphonic mode); Maghrebi / Byzantine / Greek dromoi / Hindustani preliminary tabs; MPE MIDI output; standalone "maqam-tuning pedal" proxy mode; modern-synth patch category (vaporwave / synthwave / future-funk / ambient / IDM); practice mode (perde recognition, makam-identification ear-trainer); .scl/.kbm import/export.

**Phase 4+ — Community + collaboration.** Maker-collaboration presets (Ali Eken signature, Maya Youssef tuning, Yarman 79-tone, Weiss Al-Kindî); cross-link with BeatForge for rhythm-mode crossover (rebetiko, Anatolian halay, Bulgarian asymmetric meters + maqam); community-contributed maqam preset PRs (mirroring BeatForge's pattern-contribution model); possible name reframe ("modal_studio"?) if Hindustani / Byzantine become first-class.

## 9. Cultural-sensitivity priorities (the credits ledger)

Names that appear in `app/about/`, in preset metadata, and in the README. Removing a name requires explicit constitutional intent.

**Active luthiers** by name + city + workshop — Ali Eken (İstanbul); Ejder Güleç & Sons (İzmir; built Yarman 79-tone and Weiss Al-Kindî qanuns); Erdal Çetin (İzmir, mandal manufacture); Nabil Qassis (Aleppo, pre-2011); Pierre Maakaron and Alfred Chebat (Beirut); Mohamed Abdo Saleh school (Cairo); the displaced Damascus Nahat lineage; Karolos Tsakirian (Athens, kanonaki).

**Theorist-scholars** as authorities — for Turkish: Ozan Yarman, M. Kemal Karaosmanoğlu, Barış Bozkurt, Karl Signell. For Arabic: Scott Marcus, Shireen Maalouf, Habib Hassan Touma, Sami Abu Shumays. For Persian: Hormoz Farhat, Daryush Talai, Jean During, Bruno Nettl. For Azeri/Shashmaqam: Uzeyir Hajibeyli, Theodore Levin, Razia Sultanova. For Maghrebi: Carl Davila, Jonathan Glasser, Dwight Reynolds, Ruth Davis. For Hindustani: V. N. Bhatkhande, Joep Bor, Bonnie Wade, Nazir Jairazbhoy, Wim van der Meer, Suvarnalata Rao. For Byzantine/Greek/Balkan: Egon Wellesz, Grigorios Stathis, Alexander Lingas, Risto Pekka Pennanen, Timothy Rice, Donna Buchanan, Carol Silverman.

**Master performers** as listening targets — Niyazi Sayın and Necdet Yaşar (ney/tanbur); Göksel Baktagir, Maya Youssef, Abraham Salman (qanun); Niyaz, Ross Daly, Anouar Brahem, Mercan Dede (fusion/ambient); Alim Qasimov (Azeri mugham); Munajat Yulchieva (Shashmaqam); Sabah Fakhri, Umm Kulthum, Riad Al Sunbati (Arab classical); Mohammad-Reza Shajarian, Hossein Alizadeh (Persian); Hariprasad Chaurasia, Kishori Amonkar, Bhimsen Joshi (Hindustani); Vassilis Saleas (Greek clarinet); Aleko Bacanos (Ottoman violin).

**Marginalized lineages** acknowledged explicitly — Bukharan Jewish in Shashmaqam (the Babakhanov line, the Mullokandov, Tolmasov, Iskhakova families); Maghrebi Jewish in Algerian Andalusian (Yafil's 1904 transcriptions; Reinette l'Oranaise; Salim Halali; Lili Boniche); Roma transmission of Ottoman modes across Balkans (Carol Silverman's *Romani Routes*); Syrian-diaspora makers post-2011.

The about page should look more like a credits roll than a marketing page.

## 10. Research corpus (Phase 0 ledger, 2026-04-30)

Eighteen documents totaling ~100,000 words across four waves. Lives in `research/`. Headers use TL;DR + audience + skip-if frontmatter; long-form prose with full bibliographic citations.

**Wave 1 — tradition mapping + foundational engineering** (9 docs):
- `ottoman-turkish-makam.md` — AEU 24-tone system, Yarman/Karaosmanoğlu critique, makam catalog, perde names. *Empirical recordings beat theory.*
- `arabic-levantine-maqam.md` — jins-based modular theory, regional Sikah variants. *Es half-flat varies by ~30 cents across schools.*
- `persian-dastgah.md` — 7 dastgāh + 5 avāz, koron/sori variability, radif/gusheh hierarchy. *A dastgāh is not a scale.*
- `azeri-mugham-and-shashmaqam.md` — Azeri 7 mughams + Bukharan 6 shashmaqam, Hajibeyli, the shared-name problem. *Bukharan-Jewish preservation thread.*
- `egyptian-maqam-and-cairo-1932.md` — Cairene Sikah ≈ low; the 1932 Congress canonized 24-EDO while taping practice that contradicted it.
- `qanun-instrument-design.md` — 78 strings, mandal mechanics, Turkish 72-EDO vs Arabic 24-EDO mandal granularity.
- `ux-interface-review.md` — survey of existing maqam apps. *The competitive landscape is empty.*
- `web-audio-plucked-string-synthesis.md` — Karplus-Strong + Thiran fractional delay; ~6 voices on phone, ~24 on desktop.
- `tuning-systems-formalization.md` — the unified preset schema; cents-as-canonical; .scl/.kbm export.

**Wave 2 — adjacent traditions, instrument culture, UX direction, BeatForge mining** (6 docs):
- `north-african-andalusian.md` — Tunisian/Algerian/Moroccan nawba, less microtonal practice, Davila/Glasser/Reynolds.
- `hindustani-raga-and-khayal.md` — 22-shruti theory critique, tanpura-as-structural, raga ≠ scale even more than maqam.
- `greek-byzantine-balkan-modes.md` — Byzantine 72-moria as 4th first-class grid; moveable ison; Roma transmission.
- `qanun-makers-and-luthiery.md` — Ali Eken / Ejder Güleç / Erdal Çetin / Nabil Qassis; pricing tier; the click as part of the music.
- `split-keyboard-chord-and-melody-ux.md` — autoharp is the exact analogue; Guiard's bimanual asymmetry; v1 layout (30/70 + 16-button grid).
- `beatforge-reusable-research-mining.md` — fork inventory; top day-1: MIDI module, engine spine, PWA scaffold, cultural docs.

**Wave 3 — multi-instrument synthesis + MIDI translator** (2 docs):
- `multi-instrument-synthesis.md` — v1 voice roster (qanun + baglama + tar + ney + clarinet); bowed PM deferred; BeatForge `fm.ts` already ships saz/oud.
- `midi-maqam-translation.md` — single-channel + ±2sm pitch-bend default; pitch-bend 1ms before note-on; Safari blocks Web MIDI permanently.

**Wave 4 — drone subsystem** (1 doc):
- `drone-synthesis-and-modulation.md` — vaporwave-choir-tubular-wind patch spec, Tab-modulation algorithm, drone in MIDI; Byzantine moveable ison as historical precedent.

## 11. Open questions

Carried into Phase 1.

- **Project naming.** "makam_studio" is accurate for v1 but cramped if Hindustani / Byzantine ship as first-class. Defer reframe ("modal_studio"? "tonal_studio"?) until post-MVP.
- **Default Turkish tuning grid.** AEU 53-EDO (theory) or 72-EDO (mandal practice)? Probably 53-EDO theoretical, 72-EDO performance-practice toggle.
- **MIDI input key-mapping.** Linear / hybrid / karar-anchored absolute? Probably hybrid by default.
- **Drone-on-by-default policy.** On for fusion/improv users, off for classical recital users — how is this surfaced without extra modes?
- **Mandal click sound.** Modal click + audio click + both + off; default = subtle click, per-tradition acoustic signature.
- **Color and typography palette.** Deferred to Phase 1 design review.
- **Phase 0 closure tag.** v0.1 (research-complete) vs. v0.2 (Phase-1-spec-complete) vs. v1.0 (MVP)?

## 12. Style guide (operational conventions inherited from BeatForge)

- Every meaningful directory has its own `INDEX.yaml` and `README.md`.
- Long-form documents lead with TL;DR + audience + skip-if frontmatter.
- Lowercase + hyphens for filenames.
- `docs/spec/architecture/topics/process` split.
- Cultural-sensitivity language in `CONTRIBUTING.md` modeled on BeatForge's.
- Credits roll, not marketing copy.
- Prose over lists where prose works.
- One commit per logical change; no batched mega-commits.
- Branches use the `worktree-branch` skill's music-themed naming.

## 13. Closing — the spirit

The project's success metrics are twofold.

First — *access*: whether a 14-year-old in Detroit whose grandmother was an Aleppine takht qanun player can play her grandmother's music on her phone, in the actual tuning, without paying anyone for permission. Nobody who wants in stays out for economic or geographic reasons.

Second — *inspiration*: whether that same 14-year-old grows up to make something her grandmother could not have imagined. A maqam vaporwave EP. A drone-modulating ambient set. A hybrid raga-mugham sketch. A paradigm someone else's tool will borrow from. The project succeeded if it lit curiosity, deepened practice, and inspired the next generation to take maqam in new and fresh directions.

Everything else — the tuning-data layer, the MIDI translator, the drone, the synth voices, the UI, the modern-synth patches, the ten paradigm experiments running in parallel — exists to serve these two metrics. When in doubt about a feature, a tradeoff, or a pivot, ask whether it brings access closer or whether it widens the creative range. If it does neither, drop it.

The instrument is not in the screen. It is in her hands, and in the music she has not yet imagined.
