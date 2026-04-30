---
title: BeatForge reusable research mining — what to fork, reference, and credit
audience: makam_studio Phase 1 implementer (founder + future contributors)
tldr: >
  Inventory of everything in `~/lab/beatforge/` that makam_studio can fork directly,
  draw inspiration from, or cross-link to. Categorized A–J by reuse strength. The
  Web Audio + PWA + MIDI + INDEX.yaml + living-archive scaffolding is essentially
  free; the rhythm-engine and pattern-grid pieces stay in BeatForge.
skip_if: you only need the makam musicology research (see wave-1 docs)
date: 2026-04-30
status: draft
---

# TL;DR

- BeatForge already solves five things makam_studio would otherwise re-solve: (1) raw Web Audio engine + worker scheduler + master FX bus, (2) PWA / Workbox / offline shell, (3) Web MIDI bridge with input mapping + output routing + clock I/O, (4) IndexedDB persistence via Dexie + localStorage UI state + URL-state parser, (5) per-directory `INDEX.yaml` + `docs/{spec,architecture,topics,process}` documentation conventions.
- The single most valuable file to read first is `~/lab/beatforge/docs/topics/audio-synthesis/web-audio-dsp.md` (~2.6K lines): AudioContext lifecycle, AudioParam scheduling, AudioWorklet, plus a worked Karplus-Strong recipe — the exact DSP foundation `wave-1/web-audio-plucked-string-synthesis.md` proposes for the qanun voice.
- The MIDI module (`app/src/modules/midi/` + `app/src/lib/useMidiBridge.ts` + `app/src/modes/Midi/Midi.tsx`) is a near-complete fork target for makam_studio's MIDI input (perde-keyed) and split-zone MIDI output. The "secret tab via `?tab=_midi`" pattern maps directly onto the qanun-honor advanced view.
- Brand voice + cultural-positioning manifestos (`docs/process/manifestos/living-archive.md`, `voice-style-guide.md`) belong almost verbatim, with one substitution (drum corpus → maqam corpus). The "no museum, no gatekeeping, attribution-as-love-letter" framing is exactly the tone makam_studio needs.
- DO NOT fork: drum synthesis recipes (`drum-synthesis.md`, `voice/kick.ts` etc), the polyrhythm sequencer (`modules/sequencer`, `topics/rhythm-engine`), the step-grid + 23-region map (`patterns/seed/`, `topics/rhythm-traditions/`, `topics/rhythm-patterns/`), and aksak-specific architecture. Keep them in BeatForge; cross-link rhythm-traditions where they overlap with makam audiences (`turkish-anatolian-swana.md`, `persian-iranian.md`, `indian-subcontinent.md`).
- A makam_studio `docs/` skeleton mirroring BeatForge's four-section split (`spec/architecture/topics/process`) is proposed below with empty placeholder READMEs created at the same time as this doc.

## Method

Read in this order:

1. Top-level orientation — `~/lab/beatforge/README.md`, `INDEX.yaml`, `CONTRIBUTING.md`, `docs/README.md`, `docs/INDEX.yaml`.
2. Per-section README + INDEX.yaml — `docs/spec/`, `docs/architecture/{overview,audio-engine,react-app}.md`, all eight `docs/topics/*/README.md`, plus the manifestos `docs/process/manifestos/{living-archive,voice-style-guide}.md`.
3. App skeleton — `app/INDEX.yaml`, `app/src/INDEX.yaml`, plus `audio/`, `lib/`, `modes/`, `modules/`, `components/` indexes. Read full source for short integration files (`scheduler-worker.ts`, `urlState.ts`, `manifest.webmanifest`, `vite.config.ts`, `package.json`, `audio/machines/voice/kick.ts` as a representative voice machine).
4. Sampled the long topic docs (`web-audio-dsp.md`, `visual-design.md`, `practice/methodology.md`, `pwa-audio/reference.md`, `midi/reference.md`, `interface/{hardware-instruments,software-music}.md`) — first 100–200 lines + ToC for each, full read of any section relevant to plucked-string voicing, color tokens, MIDI input/output, or PWA setup.
5. Cross-checked against makam_studio wave-1 outputs (`research/web-audio-plucked-string-synthesis.md`, `qanun-instrument-design.md`, `ux-interface-review.md`) to flag specific places BeatForge's content directly answers a wave-1 question.
6. Glanced at `docs/process/design-reviews/` filenames only (skipped per the brief — historical, lower priority).

What was not read: the 28 `docs/topics/rhythm-traditions/*.md` region files (skim only via README), the 20 `docs/topics/rhythm-patterns/*.md` files (skim only — out of scope), the 536 seed pattern JSONs, and `docs/architecture/sequencer-and-patterns.md` (rhythm-specific).

---

## A. Audio synthesis — directly reusable engineering

The drum-synthesis *recipes* don't transfer (kick/snare/hat/clap/cowbell aren't a qanun), but the *engineering scaffolding* underneath them is exactly what makam_studio needs.

**Read these first:**

- `~/lab/beatforge/docs/topics/audio-synthesis/web-audio-dsp.md` — the canonical Web Audio + DSP reference. Sections 1 (AudioContext lifecycle, autoplay policy, iOS unlock), 3 (AudioParam scheduling — `setValueAtTime` / `linearRampToValueAtTime` / `exponentialRampToValueAtTime` / `setTargetAtTime` / `cancelAndHoldAtTime`), 4 (AudioWorklet architecture + parameterDescriptors), and the recipe section's Karplus-Strong implementation are line-for-line applicable to a plucked-string voice. This document already contains a Karplus-Strong code listing — `wave-1/web-audio-plucked-string-synthesis.md` cites the same algorithm. Cross-link rather than re-derive.
- `~/lab/beatforge/docs/topics/audio-synthesis/web-audio-libraries.md` — Tone.js / WAM 2.0 decision matrix. Useful for the "should we use a library?" question makam_studio will inevitably re-ask. Answer is going to be the same: pure Web Audio.
- `~/lab/beatforge/docs/topics/audio-synthesis/drum-synthesis.md` — *partially* useful: the "transient + tone + noise + environment" 4-layer model in §1, the "synthesize vs. sample" decision frame in §2, and the inharmonic-modal-resonator section in §5/§9 (modal voice covers bell/tank/bowl/kalimba/saz/oud — yes, **saz and oud are listed**, see `voice-style-guide.md` preset list). The kick/snare/hat/clap recipes are not relevant to a string instrument.

**Read these for engineering patterns, not recipes:**

- `~/lab/beatforge/docs/architecture/audio-engine.md` — engine class surface + audio graph diagram + the lookahead scheduler explanation. The exact graph topology (per-voice → master GainNode → DynamicsCompressor → destination, with reverb/delay returns through HF/LF damping shelves) is the right starting topology for makam_studio. Substitute "voice" with "string-pluck voice" and the diagram works.
- `~/lab/beatforge/app/src/audio/runtime/sound-engine.ts` (~720 lines) — the actual `SoundEngine` class. Voice management = "trigger-fires-fresh-disposable-graph that decays on its own and gets browser-GC'd." Polyphony budget is implicit (no fixed pool — every trigger spawns nodes; the OS GC handles cleanup post-`.stop()`). For makam_studio's higher polyphony target (qanun = up to ~10 simultaneously sustaining strings, see `wave-1/web-audio-plucked-string-synthesis.md` §polyphony), this pattern still works but plate the upper bound (e.g. 16-voice cap with steal-oldest).
- `~/lab/beatforge/app/src/audio/scheduler-worker.ts` (33 lines) — entire file. The "worker is a metronome, the main thread owns AudioContext" pattern. **Fork verbatim** for makam_studio — replace the BPM-derived interval with whatever pacing makam_studio's recording / arpeggiator features need. (Note: the qanun is fundamentally a played-by-hand instrument, not a sequencer — so the scheduler matters less for v1 than for a recording feature.)
- `~/lab/beatforge/app/src/audio/runtime/ChannelStrip.ts` — per-voice mixer + color FX slot. Less relevant for a single-instrument app, but useful when makam_studio adds the qanun-honor "per-string color FX" feature.
- `~/lab/beatforge/app/src/audio/machines/_shared/audio.ts` — the small shared helpers (`createOsc`, `createGain`, `createBiquad`, `createNoise`, `ampEnvelope`). **Fork verbatim**; these are pure low-level primitives every Web Audio app needs.
- `~/lab/beatforge/app/src/audio/machines/voice/kick.ts` — read as a *template* for the `VoiceMachine<T>` shape: knob spec → Zod config schema → defaults → presets → `render(cfg, vc, when, amp, mod)`. Replace the kick render body with a Karplus-Strong pluck and you have makam_studio's first voice. **The architectural pattern (per-voice file + Zod schema + KNOBS table + PRESETS dictionary) is exactly what makam_studio wants for the qanun voice's variation set.**
- `~/lab/beatforge/app/src/audio/machines/fx/_shared.ts` + `reverb.ts` + `delay.ts` — master FX modules. **Fork.** Reverb is a synthesized noise-burst impulse (no IR file download); delay is feedback delay. Both are exactly what a maqam instrument needs out of the box.
- `~/lab/beatforge/app/src/modules/audio-graph/` — the `ControllableModule` contract (input/output AudioNodes + ParamSpec[] + `.set(name, value, opts)` + `dispose()`). **Fork the whole module.** This is the abstraction every voice and FX implements; it makes UI knobs, MIDI CC mapping, and (later) automation all hit the same surface.
- `~/lab/beatforge/app/src/modules/events/` — the typed event bus (`TriggerEvent / ParamEvent / BarEvent / ...`). **Fork.** Even a non-sequencer instrument needs `TriggerEvent` (note-on) and `ParamEvent` (knob turn) as a uniform observable seam — the same one MIDI input drives.
- `~/lab/beatforge/app/src/modules/router/` — address-keyed dispatch (`master.gain` / `channel.0.color.cutoff`). **Fork the address scheme.** For makam_studio, addresses become `qanun.string.<n>.tuning` / `master.reverb.wet` / `qanun.global.pluckPosition`.

**How to apply (Phase 1 plan):**

Set up `app/src/audio/runtime/sound-engine.ts` mirroring BeatForge's structure. Strip out the kit/sequencer pieces. Keep: master bus + reverb/delay returns + HF/LF damping shelves + analyser + the worker-tick lookahead pattern (you'll want it eventually for recording even if v1 doesn't sequence). Add: a `Qanun` controller that owns 26 string voices + per-string mandal state. Voice machine: a single `pluck.ts` (Karplus-Strong + Thiran fractional delay per `wave-1/web-audio-plucked-string-synthesis.md`) following BeatForge's `kick.ts` template structure.

## B. MIDI — directly reusable

This is the highest-leverage fork in BeatForge. The MIDI module is purpose-built to be framework-free, well-tested, and ready to drop in.

**The architecture (3 layers):**

- **Pure module** — `~/lab/beatforge/app/src/modules/midi/` (5 files, ~640 lines including tests):
  - `midi.ts` — `makeMidiModule(bus)`. `bindInput(input, mappings)` translates Web MIDI input → `TriggerEvent` / `ParamEvent` / `ReleaseEvent` via a mapping table. **Mappings are first-class data**, persisted by `lib/midiMappings.ts`. Mapping kind is `TriggerMap | ParamMap` (discriminated union).
  - `sink.ts` — `attachMidiSink(bus, spec)`. Subscribes to bus `'trigger'` events at addresses like `'channel.0'` and emits MIDI note-on/off to a chosen output device + channel + note. **Note duration** locks to one step at current BPM (BeatForge-specific; makam_studio will derive duration from sustain release).
  - `clock.ts` — `attachClockListener(input, callbacks)` parses 0xF8 ticks and smooths BPM over 24-tick window; `makeClockSender(output, bpm, onSent)` drives 24 PPQN. Less critical for makam_studio v1 (the qanun isn't tempo-locked) but trivial to keep available.
  - `types.ts` + `index.ts` — `MidiInputLike` / `MidiOutputLike` / `MidiAccessLike` structural shapes (deliberately decoupled from `@types/webmidi` so tests can use stubs).
- **React lifecycle owner** — `~/lab/beatforge/app/src/lib/useMidiBridge.ts` (~310 lines). Single React-side owner of Web MIDI access + sink + clock + persistence. Auto-enables on subsequent loads (`bf_midi_auto_enable` flag). Exposes everything Midi.tsx needs as a single `MidiBridge` object. **Fork wholesale**, rename the `bf_midi_*` localStorage prefix to `ms_midi_*`.
- **UI** — `~/lab/beatforge/app/src/modes/Midi/Midi.tsx`. Five-section panel: input device toggles, input mappings (CC/note → bus address), per-channel output routing, clock I/O toggles, test send + live monitor. **Almost verbatim fork**: replace "channel rows" with "string output rows" or "split-zone rows" depending on which UX wins (per `wave-1/split-keyboard-chord-and-melody-ux.md`).
- **Persistence helpers** — `~/lab/beatforge/app/src/lib/midiMappings.ts` + `midiChannelOut.ts`. Both are tiny localStorage round-trippers with defensive parse. Fork.

**Reference / topic depth:**

- `~/lab/beatforge/docs/topics/midi/reference.md` (~2.3K lines) — protocol bytes, GM drum map, CC table, MIDI clock, MIDI 2.0, full Web MIDI API code samples, `.mid` file format. **Skip the GM drum map section** — makam_studio does not have drum-mapped output. The Web MIDI API section + hot-unplug handling section are gold.
- `~/lab/beatforge/docs/topics/midi/keyboard-mapping.md` (~1.9K lines) — QWERTY-to-pad conventions. **Read** for makam_studio's keyboard-input layer (the right-hand piano-keyboard zone needs QWERTY shortcuts).

**Specific gotchas to inherit (from BeatForge's `midi/README.md`):**

- iOS Safari does not ship Web MIDI as of Apr 2026 — plan a graceful fallback.
- Devices disconnect mid-session; wrap every `output.send()` in try/catch (BeatForge's audit notes flag this as a known soft spot).
- MIDI clock = 24 PPQN; scheduler tick must be a multiple.

**How to apply (Phase 2):**

Fork `app/src/modules/midi/` + `lib/useMidiBridge.ts` + `lib/midiMappings.ts` + `lib/midiChannelOut.ts` + `modes/Midi/Midi.tsx` *as one commit*, with rename + the bus address scheme adjusted for `qanun.*` addresses. Match BeatForge's address-keyed dispatch so a controller's CC turning a knob and a UI knob are observationally identical to the engine. The MIDI panel becomes makam_studio's "bind your nanoKEY2" + "send to your DAW" surface.

## C. PWA / offline — fully reusable

BeatForge's PWA story is solid and almost entirely portable. There is essentially nothing to add.

**Fork directly:**

- `~/lab/beatforge/app/vite.config.ts` (47 lines, full file is short). The whole `VitePWA({ registerType: 'autoUpdate', workbox: { globPatterns, runtimeCaching } })` block. Adjust the `base: '/beatforge/'` to `'/makam_studio/'` (or your repo name) for GitHub Pages. The autoUpdate registration type matches BeatForge's lesson learned ("`prompt` was too easy for stale SWs to hold on silently").
- `~/lab/beatforge/app/public/manifest.webmanifest` — 20-line manifest. Adjust name / short_name / theme_color / background_color / icon / categories. The `start_url: "./?source=pwa"` analytics tag and `display: standalone` are good defaults.
- `~/lab/beatforge/app/src/lib/pwa.tsx` — service-worker registration glue + UpdateBanner component. **Fork.**
- `~/lab/beatforge/app/src/components/UpdateBanner.tsx` — fork.

**Reference depth:**

- `~/lab/beatforge/docs/topics/pwa-audio/reference.md` (~3.2K lines, single longest doc in BeatForge). **Cross-link, do not duplicate.** Sections to bookmark for makam_studio: §1.1 (Manifest fields including iOS-specific gotchas), §2 (service-worker lifecycle), §3 (Workbox caching strategies — stale-while-revalidate for assets, networkFirst for HTML, the BeatForge config), §4 (offline audio specifics — autoplay-unlock pattern), §6 (IndexedDB), §7 (Wake Lock — required for makam_studio: a player practicing should not have the screen dim), §8 (Media Session API — show "now playing" on lock-screen with track / play / pause), §9 (Web Share API for sharing presets via URL).
- The `pwa-audio/README.md` "Quickest path to it works offline" 4-step recipe is the right Phase 1 checklist.

**How to apply (Phase 1, with code):**

Day-1 setup: `bunx create-vite@latest` (React + TS), copy `vite.config.ts` block, copy `public/manifest.webmanifest` + adjust, copy `src/lib/pwa.tsx`, copy `src/components/UpdateBanner.tsx`, run `bun run build`, install on an iPhone, verify offline. This is a half-day's work.

## D. Interface / visual design — strong inspiration

BeatForge is a *light-themed warm-cream* app (theme_color `#e17055` orange-red, bg `#f6f2eb` warm cream — see `manifest.webmanifest`). The wave-1 `ux-interface-review.md` already calls out a different palette likely (deferred to Phase 1 design review per `docs/design-direction.md` "Open questions"). But the *information design* and *interaction conventions* are reusable.

**Read for adoption:**

- `~/lab/beatforge/docs/topics/interface/hardware-instruments.md` (~800 lines). Sections 1.1 ("zero-menu vs Elektron compromise vs deep menu"), 1.2 ("direct manipulation: <100ms gesture-to-audible threshold"), 1.3 (muscle memory + spatial mapping). **Hard requirement carried over:** every knob/slider must update sound in realtime as user drags (BeatForge enforces; makam_studio inherits).
- `~/lab/beatforge/docs/topics/interface/software-music.md` (~1.4K lines). Section 1 (DAW UI paradigms, especially Ableton's session/arrangement duality — relevant if makam_studio adds a recording surface), section 5 (UI patterns), section 9 (typography in music software — monospace for values, tabular-lining-numerals to avoid layout shift), section 12 (onboarding strategies).
- `~/lab/beatforge/docs/topics/interface/visual-design.md` (~1.2K lines). **The most directly forkable file.** Section 2.1 (component library: step buttons, knobs at 24/40/64px tiers, faders, displays, meters, grids, panels, modals — every primitive a music UI needs). Section 2.2 ("Design Tokens for a Music App") is a complete CSS variable system covering: background layers (4 tiers), text hierarchy (4 tiers), accent colors, state colors (active/selected/muted/solo/record/error/success), 8 track-identity colors, velocity/intensity colors, meter colors, typography (font families, sizes, weights, line heights, letter spacing), spacing (4px base, mapped to "musical 4/4"). **Fork the structure; substitute the palette.**
- `~/lab/beatforge/docs/topics/interface/world-percussion-sound.md` (~300 lines). Almost not relevant — drum-specific. Skip unless you want the cultural-sensitivity-of-naming insight applied to makam.

**Conventions to adopt:**

- **Opacity = velocity** (BeatForge invariant). Velocity 0 = off, 1 = ghost (0.45 opacity), 2 = accent (1.0 opacity). For makam_studio: opacity = sustain-amount or vibrato-depth or string-loudness — pick one mapping and use it everywhere.
- **<100ms gesture-to-audible** rule (BeatForge invariant from `hardware-instruments.md`). Every UI knob emits a `ParamEvent` on the bus, and `ControllableModule.set()` ramps via `linearRampToValueAtTime` so subscribers see consistent ramp shape.
- **No CSS framework** (BeatForge invariant). Single `styles/app.css` with CSS variables for theming. `bf-warm` / `bf-noir` / `bf-paper` themes; makam_studio can have `ms-warm` / etc, or pick its own theme set during the Phase 1 design review.
- **Single global stylesheet** is a strong opinion ("no CSS modules, no framework"). Inheriting it saves a tooling decision.

**How to apply (Phase 1):**

The Phase 1 design review (per `docs/design-direction.md`) sets the makam_studio palette + typography. Until then, fork BeatForge's CSS variable *structure* (the names) and parameterize the *values* on the design review's output. Consider a cooler / more Mediterranean palette than BeatForge's warm-orange to differentiate.

## E. Practice methodology — partial fit

BeatForge's practice methodology is designed for rhythmic mastery; the qanun is a melodic-microtonal instrument. Some of the methodology transfers; some doesn't.

**Read for adaptation:**

- `~/lab/beatforge/docs/topics/practice/methodology.md` (~1.3K lines). Sections that **do** transfer:
  - **§1.1 Deliberate-practice theory** (Ericsson) — applies to every instrument-skill domain.
  - **§1.2 Spaced repetition** — directly applies to perde-recognition + makam-identification drills.
  - **§1.3 Interleaving vs. blocked practice** — applies to "drill 5 makams interleaved" vs "drill one makam blocked."
  - **§2.x Speed-training protocols** — partially applies. The ramp loop ("every N bars or M seconds, bump BPM by step") is rhythmic; makam doesn't have BPM-the-same-way. But the *structure* (start slow, increase difficulty only when clean) applies to "start with karar drilling, increase melodic complexity only when intonation stays correct."
  - **§3 Random-mute** — applies adapted: "drone drops out for a measure; you must maintain karar by ear" is exactly the qanun-with-tanpura discipline.
  - **§4 Konnakol** — surprisingly relevant. Konnakol is rhythmic vocalization; makam pedagogy has analogous solfege traditions (Turkish: noté names, Arabic: do/re/mi-but-with-quartertone-name extension, Persian: gusheh names). Cross-reference rather than borrow.
  - **§5 Recovery patterns** — applies wholesale.
- Sections that **don't** transfer: §40 PAS rudiments (purely percussion), polyrhythm training, odd-meter acclimation.

**How to apply:**

makam_studio v1 should ship without a formal practice mode (per current `docs/design-direction.md` — focus on the playing surface). v2 considers a practice mode whose primary drills are: (1) **perde recognition** (which perde just played?), (2) **makam identification** (which maqam is this seyir from?), (3) **microtonal interval ear training** (was that interval an Arabic ¾-tone, a Turkish koma, or an equal-tempered semitone?), (4) **drone-anchored intonation** (sing or play the perde against the tanpura — show pitch error in real-time with a tuner-style display). The pedagogical scaffolding (deliberate practice loop, spaced repetition, recovery patterns) is BeatForge-derived; the drills are makam-specific.

A makam_studio `docs/topics/practice/methodology.md` would import wholesale §1 + §3 + §5 from BeatForge, rewrite §2 for makam-specific ramp targets, and add new sections for the four drills above.

## F. Rhythm engine / sequencer — defer

Status: **out of scope for makam_studio v1**. The qanun is played by hand, not sequenced. v1 has no step grid, no polyrhythm, no aksak.

**However**, BeatForge's `topics/rhythm-engine/` material becomes relevant if/when makam_studio adds:

- A **melodic step sequencer** (Phase 3+) — for users who want to compose modal phrases.
- A **recording / loop overdub** feature — needs scheduler infrastructure.
- An **arpeggiator** — degenerate sequencer.

If/when those features come, read `~/lab/beatforge/docs/topics/rhythm-engine/polyrhythmic-architecture.md` (~900 lines) for the engine design (atomic patterns + Stack/Chain operators + JSON pattern format). The Turkish-usul case study (`turkish-usul.md`, ~1.5K lines) is a separate cross-link concern, see §G.

## G. Rhythm traditions — cross-link only

Direct audience overlap with makam_studio: most maqam practitioners also play (or care about) rhythmic traditions in the same regions. BeatForge has very deep coverage:

**Files to cross-link bidirectionally:**

- `~/lab/beatforge/docs/topics/rhythm-traditions/turkish-anatolian-swana.md` (~120K lines on Ottoman classical, usul system, davul-zurna, halay/zeybek/horon, Anatolian rock) — direct overlap with `makam_studio/research/ottoman-turkish-makam.md`. **Cross-link from makam_studio's Turkish docs.**
- `~/lab/beatforge/docs/topics/rhythm-traditions/persian-iranian.md` (~91K lines on Zoroastrian roots, dastgah pedagogy crosswind, daf, tombak technique) — direct overlap with `wave-1/persian-dastgah.md`. Cross-link.
- `~/lab/beatforge/docs/topics/rhythm-traditions/indian-subcontinent.md` (~91K lines on Natya Shastra, tala, konnakol) — partial overlap with planned wave-2 `hindustani-raga-and-khayal.md`. Cross-link.
- `~/lab/beatforge/docs/topics/rhythm-traditions/balkan.md` + `caucasus-mediterranean.md` + `iberian.md` — relevant to maqam diaspora (e.g. flamenco's Andalusian / Maghrebi roots, Greek dromoi). Cross-link.
- `~/lab/beatforge/docs/topics/rhythm-traditions/north-east-african.md` (Ethiopian / Eritrean / Sudanese / Coptic / Sufi music) — relevant to wave-2 `egyptian-maqam-and-cairo-1932.md`. Cross-link.
- `~/lab/beatforge/docs/topics/rhythm-traditions/econopolitics-of-music.md` — the cross-cutting political-economy file. Useful framing for makam_studio's "free public good" positioning (see `docs/design-direction.md` §pivot 5).

**Do not duplicate** any of this. makam_studio's `docs/topics/maqam-traditions/` (or whatever the analog folder ends up being called) should *link out* to BeatForge's region files for rhythmic context. A pattern card in BeatForge's Library that's a 9/8 zeybek can in turn link *back* to a makam_studio maqam from the same tradition. The two corpora are designed to be siblings.

## H. App architecture — fork the skeleton

BeatForge's React + Vite + Bun + TS skeleton is a directly forkable starting point.

**Direct forks:**

- `~/lab/beatforge/app/package.json` (82 lines) — adjust `name`, `description`, `homepage`, `repository`, `keywords`. Keep the dependency list almost as-is: `dexie`, `fuse.js`, `react@19`, `react-dom@19`, `zod`. Drop fuse.js if v1 has no library search (qanun has presets, not 536 patterns). Add `@types/webmidi` if you want the typed Web MIDI surface (BeatForge avoids it by structural typing; either is fine).
- `~/lab/beatforge/app/vite.config.ts` — see §C.
- `~/lab/beatforge/app/eslint.config.js`, `tsconfig.app.json`, `tsconfig.json`, `tsconfig.node.json` — copy verbatim.
- `~/lab/beatforge/app/scripts/githooks` — pre-commit hook running `tsc -b && eslint`. Copy.
- `~/lab/beatforge/app/src/main.tsx` — 17 lines. Copy and substitute the App import + the PWAStatus location.
- `~/lab/beatforge/app/src/App.tsx` (~700 lines) — **read but don't fork directly.** It has BeatForge-specific state (patternId, dirty guard, kit override, session). Fork the *patterns* it uses:
  - `useRef<Engine | null>(null)` + lazy init guarded by `if (engineRef.current === null) {...}` — survives StrictMode double-invocation. **Use this exact pattern.**
  - `readUrlState(window.location.search, { seedExists })` — URL parser. The "secret tab via URL" pattern is in `app/src/lib/urlState.ts` (45 lines, full file is short). **Fork verbatim.** Replace the Tab union: makam_studio gets `'play' | 'presets' | 'settings' | '_qanun'` (or whatever your route set is). The `_qanun` tab (qanun-honor view) is the analog of BeatForge's `_midi` tab — accessible only via URL, no nav chip.
  - Conditional render of `{tab === 'practice' && <Practice/>} ...` — no React Router. Tab switches stop the engine but leave session state alive (so user's selected maqam + karar persists across tabs).
  - `<SessionProvider>` wrapping the route tree — BeatForge's `modules/session/`. Cross-tab shared state. Fork the *shape* (provider + hook + types) and replace the BeatForge-specific fields (pattern, kit, channels, bpm, swing, playing) with makam_studio fields (currentMaqam, karar, mandalState, polyphony, recording).
- `~/lab/beatforge/app/src/lib/db.ts` — Dexie wrapper with versioned migrations (v1 → v2 → v3 add tables without touching existing). **Fork the structure.** makam_studio v1 tables: `userMaqamPresets`, `userTunings`, maybe `recordings` later.
- `~/lab/beatforge/app/src/lib/storage.ts` — localStorage wrapper, fail-soft. **Fork.** Replace `bf_*` with `ms_*` prefix.
- `~/lab/beatforge/app/src/lib/log.ts` + `errors.tsx` — centralized logger + ErrorBoundary. Fork.
- `~/lab/beatforge/app/src/components/Disclosure.tsx` (`<details><summary>` wrapper with consistent caret) — fork.
- `~/lab/beatforge/app/src/components/visual-helpers.ts` — `GROUP_COLORS` array + `groupIndexForStep` helper. Direct concept doesn't transfer (no groups), but the *pattern* (a single-source-of-truth color array referenced by every visualization) does. makam_studio analog: a `PERDE_COLORS` or `MAQAM_COLOR` map.

**Don't fork:**

- `~/lab/beatforge/app/src/modes/Practice/`, `Library/`, `Sound/` — entirely BeatForge UX (step grids, kit pickers, world maps, pattern lists).
- `~/lab/beatforge/app/src/components/{BeatDots,LinearGrid,CircularGrid,PillGrid,StepGrid,TransportBar}.tsx` — drum-machine UI primitives.
- `~/lab/beatforge/app/src/patterns/` — entirely the rhythm-pattern schema + 536 seed patterns.
- `~/lab/beatforge/app/src/audio/runtime/{kit-presets,ChannelStrip}.ts` — kit-specific.

**The skeleton in one paragraph:**

```
makam_studio/app/
├── public/{manifest.webmanifest, icons/, favicon.svg}     ← fork BF, swap palette
├── src/
│   ├── main.tsx                                            ← fork
│   ├── App.tsx                                             ← write fresh, use BF patterns
│   ├── audio/
│   │   ├── runtime/{sound-engine.ts, engine-adapters.ts}   ← fork structure
│   │   ├── machines/voice/pluck.ts                         ← write fresh on BF kick.ts template
│   │   ├── machines/fx/{reverb, delay, _shared}.ts         ← fork
│   │   └── scheduler-worker.ts                             ← fork (deferred to v2)
│   ├── modules/{events, router, audio-graph, session, midi} ← fork all
│   ├── lib/{db, storage, urlState, log, errors, pwa, useMidiBridge, midiMappings}.ts ← fork
│   ├── modes/
│   │   ├── Play/Play.tsx                                   ← write fresh
│   │   ├── Presets/Presets.tsx                             ← write fresh
│   │   ├── Settings/Settings.tsx                           ← write fresh
│   │   └── Qanun/Qanun.tsx                                 ← write fresh (the BF Midi.tsx analog)
│   ├── components/{Disclosure, UpdateBanner}.tsx           ← fork
│   └── styles/app.css                                       ← write fresh, BF token shape
├── vite.config.ts                                            ← fork
├── package.json, tsconfig.*.json, eslint.config.js          ← fork
└── scripts/githooks                                          ← fork
```

## I. Conventions — copy verbatim

These are zero-cost wins.

- **Per-directory `INDEX.yaml`** — every meaningful directory has one with: `path`, `purpose` (a sentence), `last_indexed` (date), `contents` (list of `{ name, kind, path, summary }`), `invariants` (constraints that hold across the directory), `related_indexes` (parent + sibling links). makam_studio inherits this convention. Write the root `INDEX.yaml` as soon as the repo has more than 5 files. (BeatForge's pattern: AI agents and humans navigate by `INDEX.yaml` chains — start at root, follow related_indexes.)
- **`docs/{spec,architecture,topics,process}` four-section split** — BeatForge's `docs/README.md` is the canonical orientation pattern. spec/ = what ships; architecture/ = current code; topics/ = subject reference (lives longer than any one feature); process/ = historical artifacts. This split is copy-paste-able.
- **TL;DR + audience + skip-if frontmatter on long-form docs** — see every BeatForge doc with `> **TL;DR**` block at top. Standardize on this in makam_studio. Long docs get TOC.
- **Lowercase + hyphens for filenames** — `turkish-anatolian-swana.md` not `TurkishAnatolianSwana.md` not `turkish_anatolian_swana.md`. Files starting with `_old-` are previous indexes kept for spelunking; ignore convention.
- **CONTRIBUTING.md structure** — see `~/lab/beatforge/CONTRIBUTING.md` (151 lines). Three sections: pattern contributions (largest), bug reports, code PRs. **The cultural-sensitivity language in §1.3** ("Lead with what the rhythm is for, not just where it's from. Avoid framing traditions as exotic or primitive...") is gold; lift the principles, substitute the corpus (patterns → maqam presets / perde tunings).
- **Brand voice / vocabulary** — `~/lab/beatforge/docs/process/manifestos/voice-style-guide.md` (180 lines). Forbidden words list (`museum`, `archive of`, `preservation`, `authentic`, `master`, `expert mode`, `pro`, `simply`, `obviously`, `easy`, `ethnic`, `exotic`, `world music`, `unleash`, `unlock`, `level up`, `hack`, `users` in user-visible strings). **Adopt this list.** `kit → ensemble` substitutions are BeatForge-specific; makam_studio analog is `preset → maqam` and `string → string` (don't fight the naming).
- **Living-archive manifesto** — `~/lab/beatforge/docs/process/manifestos/living-archive.md` (220 lines). The cultural-positioning manifesto. **Adopt almost verbatim** — the lineage list (J Dilla, Talking Heads, Vampire Weekend, Os Mutantes, Damon Albarn, Rachid Taha, Khaled, Arooj Aftab, Anoushka Shankar, Dick Dale, Bourdain, Atlas Obscura) is the room makam_studio also wants to walk into. The "no museum, attribution-as-love-letter, ship what you know, surprise-me weighted toward unexpected connections" principles all hold. Just substitute "rhythm" with "makam" / "perde" in the examples.
- **Share-link-by-URL encoding** — BeatForge encodes a pattern in `?pattern=<id>` (seed) or `?p=<base64>` (user) — see `lib/urlState.ts`. makam_studio analog: `?maqam=<name>&karar=<pitch>` for presets, or `?p=<base64-tuning>` for custom mandal-states. Same one-line pattern.
- **`docs/process/engineering-audits/notes-<date>.md`** — BeatForge writes a periodic engineering-audit dated note documenting known-but-unfixed concerns. Adopt this for makam_studio when the codebase reaches that age.

## J. Specific don't-fork list

To prevent accidental overscoping and concept-drift:

| Avoid forking | Why |
|---|---|
| Drum synthesis recipes (`docs/topics/audio-synthesis/drum-synthesis.md`, `app/src/audio/machines/voice/{kick,snare,hat,clap,cowbell,tom,crackle,phase-distort,chip,wavefolder}.ts`) | Wrong instrument family. The qanun is a plucked string, not a percussion voice. The `modal.ts` voice (bell/kalimba/saz/oud) is *partially* relevant as inspiration for a plucked-resonator voice but Karplus-Strong is the right baseline (per `wave-1/web-audio-plucked-string-synthesis.md`). |
| Step-grid + pattern schema (`app/src/patterns/`, `app/src/components/{BeatDots,LinearGrid,CircularGrid,PillGrid,StepGrid}.tsx`) | makam_studio is a melodic instrument, not a sequencer. v1 has no step grid. |
| Polyrhythmic sequencer (`app/src/modules/sequencer/`, `docs/topics/rhythm-engine/polyrhythmic-architecture.md`, `docs/architecture/sequencer-and-patterns.md`) | Out of scope for v1. Re-evaluate at Phase 3. |
| Aksak / additive-meter logic (`docs/topics/rhythm-engine/turkish-usul.md`, BPM-as-step-rate convention) | Not applicable to a hand-played instrument. Cross-link only. |
| 23-region map / world map (`app/src/modes/Library/{WorldMap,regions,paths}.ts`) | makam_studio has ~6 traditions, not 23 regions. A world map is overkill; tradition tabs work better (per `docs/design-direction.md` §pivot 2). |
| 536 seed patterns (`app/src/patterns/seed/*.json`) | Wrong content type. makam_studio's analog is ~50–100 maqam presets, not patterns. |
| 14-voice machine catalog (`registry.ts`, all of `voice/`) | makam_studio has 1 voice (the qanun pluck) in v1. Maybe add a tanpura drone voice + a vocal-formant voice in v2. |
| Speed Trainer (`app/src/modes/Practice/Trainer.tsx`) | Not for v1 — qanun is not BPM-locked. Reconsider in v2 if a practice mode ships. |
| Three-mode color theming (Practice = coral, Studio = purple, Library = green) | makam_studio's mode set is different. Pick a fresh palette in the Phase 1 design review. |

## Phase 1 priorities — first five things to fork or adapt

In the order to actually do them on day 1 of coding:

1. **PWA + project skeleton (half day).** Fork `package.json`, `vite.config.ts`, `tsconfig.*.json`, `eslint.config.js`, `public/manifest.webmanifest`, `src/lib/pwa.tsx`, `src/components/UpdateBanner.tsx`, `src/main.tsx`. Get a Hello-World React app deploying to GitHub Pages and installable as PWA. **Why first:** unlocks the "ship to my phone, test offline" loop that BeatForge's audit calls "the only way to find iOS-specific bugs." Total LoC < 200.
2. **Core modules — events + router + audio-graph (half day).** Fork `src/modules/{events,router,audio-graph}/` wholesale. These are framework-free pure TS, well-tested, and ~400 LoC. Address scheme adapted to `qanun.*` namespaces. **Why second:** every UI knob and every MIDI input flows through these; building the engine on top of them keeps the seam single-observable from the start.
3. **Audio runtime skeleton + Karplus-Strong pluck voice (1–2 days).** Fork `src/audio/runtime/sound-engine.ts` (the master GainNode + reverb/delay returns + HF/LF damping shelves + analyser graph) but strip the kit/sequencer + per-channel-strip pieces for v1. Write `src/audio/machines/voice/pluck.ts` from scratch following BeatForge's `kick.ts` template structure (KNOBS table, Zod schema, defaults, presets, `render(cfg, vc, when, amp)`). Reverb + delay FX modules forked from `src/audio/machines/fx/`. **Why third:** this is the actual unique value — Karplus-Strong + Thiran fractional delay per `wave-1/web-audio-plucked-string-synthesis.md`. Everything before it is plumbing; everything after it depends on it making a sound.
4. **Persistence + URL-state (half day).** Fork `lib/db.ts` + `lib/storage.ts` + `lib/urlState.ts` + `lib/log.ts` + `lib/errors.tsx`. Set up the Dexie schema for `userMaqamPresets` + `userTunings`. Plug `readUrlState` into App.tsx so `?maqam=hicaz&karar=A4` deep-links. **Why fourth:** without this you can't preserve user state across reloads, and share-link-by-URL is one of the two anchored conventions from `docs/design-direction.md` §pivot 3.
5. **Session provider + MIDI bridge (1 day).** Fork `src/modules/session/` + `src/modules/midi/` + `src/lib/useMidiBridge.ts` + `src/lib/midiMappings.ts` + `src/modes/Midi/Midi.tsx`. Adapt the address scheme to `qanun.*`. **Why fifth and last in Phase 1:** MIDI is high-leverage but not blocking the v1 mouse/touch UX. Doing it now (rather than deferring to Phase 2) means the secret-tab pattern is established and the "qanun-honor view at `?tab=_qanun`" pattern can use it from day 1.

After these five, write the actual UI: piano-keyboard right zone + maqam-preset left zone (per `docs/design-direction.md` §pivot 2). That's where the project's distinctive value lives, and it's the part BeatForge can't help with.

## Proposed makam_studio docs/ skeleton mirror

Mirroring BeatForge's `docs/{spec,architecture,topics,process}` four-section structure, with topics chosen for makam_studio's domain. **Empty placeholder READMEs created as part of this research deliverable** (see "Allowed file creation" in the brief).

```
makam_studio/docs/
├── README.md                                 ← (placeholder created)
├── INDEX.yaml                                ← Phase 1 task
├── spec/
│   ├── README.md                             ← (placeholder created)
│   ├── instrument.md                         ← Phase 1 — analog of BF's metronome.md
│   └── content-presentation.md               ← Phase 2 — analog of BF's library-content.md
├── architecture/
│   ├── README.md                             ← (placeholder created)
│   ├── overview.md                           ← Phase 1 — fork BF overview.md structure
│   ├── audio-engine.md                       ← Phase 1 — fork BF audio-engine.md structure, Karplus-Strong specifics
│   ├── tuning-data.md                        ← Phase 1 — derived from wave-1 tuning-systems-formalization.md
│   └── react-app.md                          ← Phase 1 — fork BF react-app.md structure
├── topics/
│   ├── README.md                             ← (placeholder created)
│   ├── audio-synthesis/
│   │   └── README.md                         ← (placeholder created) cross-links BF, adds Karplus-Strong + Thiran depth
│   ├── midi/
│   │   └── README.md                         ← (placeholder created) cross-links BF, adds perde-keyed input + split-zone output
│   ├── pwa-audio/
│   │   └── README.md                         ← (placeholder created) cross-links BF; nothing makam-specific to add
│   ├── interface/
│   │   └── README.md                         ← (placeholder created) cross-links BF + wave-1 ux-interface-review + design-direction
│   ├── practice/
│   │   └── README.md                         ← (placeholder created) cross-links BF §1+§3+§5, makam-specific drills
│   ├── maqam-traditions/
│   │   └── README.md                         ← (placeholder created) wave-1 + wave-2 musicology corpus lives here
│   ├── tuning-systems/
│   │   └── README.md                         ← (placeholder created) wave-1 tuning-systems-formalization.md becomes the entry
│   └── instrument/
│       └── README.md                         ← (placeholder created) qanun-instrument-design + qanun-makers material
└── process/
    ├── manifestos/
    │   ├── living-archive.md                 ← Phase 1 — adapted from BF
    │   └── voice-style-guide.md              ← Phase 1 — adapted from BF
    └── design-reviews/                        ← when reviews start happening
```

(The current `makam_studio/docs/design-direction.md` becomes `docs/process/design-direction.md` once `process/` exists, or stays at `docs/` as a living top-level doc — TBD in Phase 1.)

## Open questions

1. **Where does the wave-1 `research/` corpus end up?** Two options: (a) move to `docs/topics/maqam-traditions/` per the skeleton above, with each wave-1 file becoming a topic doc; or (b) keep `research/` as an inviolable phase-0 archive and *quote* into the topics docs without moving the files. Option (b) is more honest about provenance. **Decide in Phase 1.**
2. **Theme palette and typography for makam_studio.** Per `docs/design-direction.md` §"Open questions" already deferred. BeatForge is warm-cream + orange-red; makam_studio could go cooler / Mediterranean / midnight-blue / amber-gold. Recommend a Phase 1 design review with both wave-1 `ux-interface-review.md` and BeatForge's `interface/visual-design.md` color-token framework on the table.
3. **Should the `INDEX.yaml` machine-readable-map convention be wrapped into a tooling step?** BeatForge keeps them hand-written. With makam_studio starting fresh, there's an opening to write a small `bun scripts/index-check.ts` that fails CI if a directory has > 3 files but no `INDEX.yaml`. Worth considering once the directory tree stabilizes.
4. **MIDI v1 vs v2 timing.** BeatForge's `useMidiBridge.ts` is ~310 lines and ships well-tested. Forking it on day 1 vs day 30 is a small effort difference; the strategic question is whether to ship v1 with MIDI input working ("plug a controller, play it") to differentiate from competing maqam apps that don't have MIDI at all. Recommend: yes, ship MIDI input in v1; defer MIDI clock + MIDI output to v2.
5. **The polyphony cap.** BeatForge's "every trigger spawns a fresh disposable graph, GC cleans up" works for ~5–8 simultaneous percussion hits per second. The qanun can sustain ~10 strings at once with much longer envelopes (per `wave-1/web-audio-plucked-string-synthesis.md`). Verify the GC pattern still works under that load; if not, adopt a fixed 16-voice pool with steal-oldest. **Verify experimentally in Phase 1 audio-runtime spike.**
6. **Cross-linking in both directions.** BeatForge probably wants a "see makam_studio for the melodic side of this tradition" link on its rhythm-tradition pages. The brief says "do not modify `~/lab/beatforge/`," so this is for *after* makam_studio ships v1: open a small PR upstream adding the cross-links once makam_studio has an URL to point at.

## Sources

Files read in full or in part to produce this document. All paths absolute.

Top-level orientation:

- `/Users/cemergin/lab/beatforge/README.md`
- `/Users/cemergin/lab/beatforge/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/CONTRIBUTING.md`
- `/Users/cemergin/lab/beatforge/docs/README.md`
- `/Users/cemergin/lab/beatforge/docs/INDEX.yaml`

Spec:

- `/Users/cemergin/lab/beatforge/docs/spec/metronome.md` (sampled)
- `/Users/cemergin/lab/beatforge/docs/spec/library-content.md` (sampled)

Architecture:

- `/Users/cemergin/lab/beatforge/docs/architecture/overview.md` (full)
- `/Users/cemergin/lab/beatforge/docs/architecture/audio-engine.md` (sampled)
- `/Users/cemergin/lab/beatforge/docs/architecture/react-app.md` (sampled)

Topics — README of each:

- `/Users/cemergin/lab/beatforge/docs/topics/README.md`
- `/Users/cemergin/lab/beatforge/docs/topics/audio-synthesis/README.md`
- `/Users/cemergin/lab/beatforge/docs/topics/midi/README.md`
- `/Users/cemergin/lab/beatforge/docs/topics/pwa-audio/README.md`
- `/Users/cemergin/lab/beatforge/docs/topics/interface/README.md`
- `/Users/cemergin/lab/beatforge/docs/topics/practice/README.md`
- `/Users/cemergin/lab/beatforge/docs/topics/rhythm-engine/README.md`
- `/Users/cemergin/lab/beatforge/docs/topics/rhythm-traditions/README.md`

Topics — sampled depth:

- `/Users/cemergin/lab/beatforge/docs/topics/audio-synthesis/web-audio-dsp.md` (first ~320 lines)
- `/Users/cemergin/lab/beatforge/docs/topics/audio-synthesis/drum-synthesis.md` (first ~80 lines)
- `/Users/cemergin/lab/beatforge/docs/topics/midi/reference.md` (first ~80 lines)
- `/Users/cemergin/lab/beatforge/docs/topics/pwa-audio/reference.md` (first ~100 lines)
- `/Users/cemergin/lab/beatforge/docs/topics/interface/visual-design.md` (first ~390 lines including the design tokens section)
- `/Users/cemergin/lab/beatforge/docs/topics/interface/hardware-instruments.md` (first ~60 lines)
- `/Users/cemergin/lab/beatforge/docs/topics/interface/software-music.md` (first ~40 lines)
- `/Users/cemergin/lab/beatforge/docs/topics/practice/methodology.md` (first ~80 lines)

Process / manifestos:

- `/Users/cemergin/lab/beatforge/docs/process/manifestos/living-archive.md` (first ~100 lines)
- `/Users/cemergin/lab/beatforge/docs/process/manifestos/voice-style-guide.md` (first ~120 lines)

App skeleton:

- `/Users/cemergin/lab/beatforge/app/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/app/src/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/app/src/audio/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/app/src/audio/machines/voice/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/app/src/audio/machines/fx/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/app/src/lib/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/app/src/modes/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/app/src/modules/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/app/src/modules/midi/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/app/src/components/INDEX.yaml`
- `/Users/cemergin/lab/beatforge/app/package.json`
- `/Users/cemergin/lab/beatforge/app/vite.config.ts`
- `/Users/cemergin/lab/beatforge/app/public/manifest.webmanifest`
- `/Users/cemergin/lab/beatforge/app/src/audio/scheduler-worker.ts`
- `/Users/cemergin/lab/beatforge/app/src/audio/machines/voice/kick.ts`
- `/Users/cemergin/lab/beatforge/app/src/lib/db.ts` (sampled)
- `/Users/cemergin/lab/beatforge/app/src/lib/urlState.ts`
- `/Users/cemergin/lab/beatforge/app/src/patterns/types.ts`

makam_studio cross-checks:

- `/Users/cemergin/lab/makam_studio/README.md`
- `/Users/cemergin/lab/makam_studio/research/README.md`
- `/Users/cemergin/lab/makam_studio/docs/design-direction.md`
