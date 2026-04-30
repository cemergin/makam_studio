---
title: PWA / offline (makam_studio)
status: placeholder
date: 2026-04-30
---

# PWA + offline

This is a Phase 1 placeholder. Content to be forked/adapted from `~/lab/beatforge/docs/topics/pwa-audio/` per the recommendation in `research/beatforge-reusable-research-mining.md`.

There is essentially nothing makam-specific to add. **Cross-link** to `~/lab/beatforge/docs/topics/pwa-audio/reference.md` (~3.2K lines covering manifest, service-worker lifecycle, Workbox, IndexedDB, Wake Lock, Media Session, Web Share). Apply the same iOS-Safari install discipline.

The only makam_studio-flavored notes that may eventually live here:

- Wake Lock around the playing surface (a player practicing should never have the screen dim).
- Media Session "now playing" labeling — show the active maqam + karar on the lock screen.
- Web Share preset URLs — `?maqam=hicaz&karar=A4` deep-links should be share-targets.
