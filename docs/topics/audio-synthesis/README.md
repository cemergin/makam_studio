---
title: Audio synthesis (makam_studio)
status: placeholder
date: 2026-04-30
---

# Audio synthesis

This is a Phase 1 placeholder. Content to be forked/adapted from `~/lab/beatforge/docs/topics/audio-synthesis/` per the recommendation in `research/beatforge-reusable-research-mining.md`.

For Web Audio API surface (AudioContext, AudioParam, AudioWorklet, OfflineAudioContext) plus DSP primitives, **cross-link** to `~/lab/beatforge/docs/topics/audio-synthesis/web-audio-dsp.md` rather than re-deriving.

Planned makam_studio-specific content:

- Karplus-Strong + Thiran fractional delay implementation depth (per `research/web-audio-plucked-string-synthesis.md`).
- Modal-resonator alternative voice (sympathetic strings; bell/tank/pot timbres for tanpura-like drone).
- Polyphony budget verification (qanun sustains ~10 strings simultaneously; BeatForge's "spawn-and-GC" pattern needs validation under that load).
- Master FX choices (reverb size matching maqam-recital halls; delay timing relative to seyir phrasing).
