---
title: makam_studio architecture
status: placeholder
date: 2026-04-30
---

# Architecture

This is a Phase 1 placeholder. Content to be forked/adapted from `~/lab/beatforge/docs/architecture/` per the recommendation in `research/beatforge-reusable-research-mining.md`.

Planned files:

- `overview.md` — 10,000-ft view. Layer diagram (audio engine → tuning-data → React app). Engine-in-useRef pattern. Single source of truth for time + tuning state.
- `audio-engine.md` — Web Audio graph, voice management, Karplus-Strong + Thiran fractional delay specifics, master FX bus, polyphony budget, the lookahead scheduler (deferred to v2).
- `tuning-data.md` — the unified tuning-data schema derived from `research/tuning-systems-formalization.md`. .scl/.kbm imports, comma-vs-quartertone representation, per-string mandal state.
- `react-app.md` — React shell, state ownership, persistence (Dexie + localStorage), tab routing, secret-tab-via-URL pattern (qanun-honor view at `?tab=_qanun`).
