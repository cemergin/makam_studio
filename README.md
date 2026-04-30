# makam_studio

> Browser-based maqam synthesizer with a qanun-like control surface. Sister project to [BeatForge](../beatforge/). Same constraints — pure Web Audio synthesis, no samples, no backend, PWA, MIT — applied to microtonal melodic instruments instead of percussion.

**Status:** Phase 0 — research (closing 2026-04-30). No code yet. We are mapping the musicological + UX + DSP terrain across multiple maqam traditions *before* designing the engine.

**Read first:** [`MANIFESTO.md`](MANIFESTO.md) is the project constitution — vision, beliefs, anti-pillars, architecture in 600 words, killer-feature framing, all 10 design pivots, roadmap, cultural-sensitivity priorities. Tactical decisions live in [`docs/design-direction.md`](docs/design-direction.md). Research corpus lives in [`research/`](research/README.md).

## The pitch

Every maqam tradition — Ottoman/Turkish, Arabic/Levantine, Egyptian, Persian dastgāh, Azerbaijani mugham, Bukharan/Tajik shashmaqam — uses microtonal pitches that don't fit the 12-EDO piano. The qanun is the one instrument that handles them all gracefully: ~78 strings (26 courses × 3), each pre-tunable on the fly via small levers (mandals) under each course.

makam_studio takes that physical model into the browser:

- **A virtual qanun** as the primary playing surface — every string independently retunable to any microtonal pitch.
- **Maqam presets** that retune the whole instrument — pick a karar (root) and a maqam (e.g. "C Hicaz") and start playing.
- **Multi-tradition support** — Turkish, Arabic (regional variants), Persian, Azeri, Shashmaqam, Egyptian.
- **Pure synthesis** — Karplus-Strong-derived plucked-string voice; no sample files.
- **PWA, offline, free, MIT** — same operating constraints as BeatForge.

## Where things live

```
makam_studio/
├── README.md           ← this file
├── research/           ← musicological + UX + DSP research (Phase 0)
│   └── README.md       ← research dispatch index
├── docs/               ← spec + architecture (Phase 1, after research)
└── app/                ← React + Vite shipping app (not yet)
```

## Conventions

Mirrors BeatForge's documentation conventions. Every meaningful directory will eventually have its own `INDEX.yaml` + `README.md`. Long-form docs lead with TL;DR + audience + skip-if. Lowercase + hyphens for filenames.

## Roadmap

- **Phase 0 — Research (in flight, 2026-04-30).** Nine parallel research agents writing `research/` corpus. See [`research/README.md`](research/README.md).
- **Phase 1 — Spec + schema + architecture.** Synthesize research into a product spec, a unified tuning-data schema, and an audio engine architecture.
- **Phase 2 — MVP build.** Karplus-Strong qanun voice, virtual qanun UI, ~12 maqam presets across 3 traditions, karar selector, per-string override.
- **Phase 3 — Tradition expansion.** Persian/Azeri/Shashmaqam coverage, MIDI input, .scl import/export.
