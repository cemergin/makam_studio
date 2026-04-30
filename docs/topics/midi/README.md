---
title: MIDI (makam_studio)
status: placeholder
date: 2026-04-30
---

# MIDI

This is a Phase 1 placeholder. Content to be forked/adapted from `~/lab/beatforge/docs/topics/midi/` per the recommendation in `research/beatforge-reusable-research-mining.md`.

For Web MIDI API + protocol bytes + hot-unplug handling, **cross-link** to `~/lab/beatforge/docs/topics/midi/reference.md` rather than re-deriving.

Planned makam_studio-specific content:

- Perde-keyed input mapping — how a 12-EDO MIDI keyboard maps to microtonal makam pitches (the active maqam preset retunes at note-on time, not at controller-config time).
- Split-zone MIDI output — left zone (chord-and-mode select) vs right zone (melody) routed to different MIDI channels (per `research/split-keyboard-chord-and-melody-ux.md`).
- Mid-melody mandal flips via MIDI CC (per `docs/design-direction.md` §pivot 2 "v2 / power-user").
- iOS Safari does not ship Web MIDI as of Apr 2026 — same fallback story as BeatForge.
