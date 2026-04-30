# makam_qanun — design notes

How we got from "design a microtonal interface for makam" to a 2.5-octave
qanun-style instrument with Istanbul-brutalist styling.

---

## 1 · The starting problem

Western piano-style interfaces flatten the maqam tradition. They:

- assume 12-TET tuning (no commas, no perde nuances)
- bake-in the chromatic ladder as the only relationship between pitches
- have no native concept of *karar* (modal anchor), *güçlü* (dominant pole),
  *seyir* (melodic contour)
- treat alternate pitches (Eviç vs. Acem, Hisar vs. Hüseynî) as accidentals
  rather than as expressive choices inside a maqam

The instrument that *does* solve all this elegantly is the Turkish **qanun**:
each course of strings has a row of small levers (*mandallar*) on the left
side that re-tune the string by exact comma fractions. The player flips
mandals on the fly to shift between alternate perdes, modulate, or color a
phrase. The interface itself is a tuning-system diagram you play.

We took that as the metaphor.

---

## 2 · The earlier explorations (what got rejected)

Before landing here, we cycled through five paradigms in a design canvas:

1. **Split-Studio** — keyboard-style 30/70 split with fixed pitches per key.
   Too piano-like; alternate pitches were buried in tooltips.
2. **Qanun Atlas** — literal trapezoid silhouette with a mandal grid.
   Beautiful as a diagram, unplayable as an instrument.
3. **Hex Field** — Wicki-Hayden isomorphic lattice. Mathematically clean,
   but completely abstracted from the makam vocabulary.
4. **Tab Modulator** — a live-performance HUD with karar-rebasing on Tab.
   Useful as a transport layer but didn't expose the pitch material itself.
5. **Mandal Codex** — editorial catalog of perdes with override palettes.
   Reference, not instrument.

The rejection that mattered: **a chord-strum + melody surface "omnichord"
hybrid** felt like it was trying to do too much in one frame, and it
abstracted the qanun's actual gesture (flip a mandal, pluck a string) into
button presses on a UI keyboard. The user's note was direct: *"this will be
hard to prototype, let's start with a more qanun-like instrument."*

---

## 3 · The instrument we kept

A vertical stack of strings — 2.5 octaves of the active maqam, repeating the
scale across three registers (low, mid, tiz). Each row has three columns:

| left | middle | right |
|---|---|---|
| **tuning indicator** — the mandal track | **perde + cents readout** | **string** — click to pluck |

The tuning indicator is the heart of it. It shows:

- a horizontal track scaled to the string's available retuning range
- tick marks at every legal mandal position (canonical perde, alternate
  perdes from the maqam, and ±9¢ / ±22¢ / ±44¢ comma adjustments)
- a saffron position bar showing the string's current pitch
- ‹ and › buttons to step through positions, with audio preview on each step

Pluck = real Karplus-Strong synthesis at exact cents from the karar
frequency. No equal-temperament approximation.

---

## 4 · The "live perde naming" decision

Initially the perde label was static — it showed the canonical name of the
scale degree, even when the string had been retuned. That meant retuning
Eviç down a comma-and-a-half to Acem still showed "Eviç +96¢" — accurate
math, wrong ontology. The pitch *is* Acem.

Fix: built a global perde dictionary spanning every maqam in the corpus
(Rast, Hicaz, Hüseynî, Uşşâk, Saba, Bayati, Nihavend, Segâh families, etc.)
and indexed each canonical perde name by its cents-mod-1200 position. On
retune, the label resolves to whichever perde the pitch actually lands on
across the entire makam corpus, with an inflection badge (`+9¢`, `-22¢`)
when the pitch sits between known perdes.

Side effect: the label tier (low / tiz) updates automatically based on
octave register, so the player sees "Hüseynî" in the mid octave become
"Muhayyer" in the tiz, just as a real player would name them.

---

## 5 · The aesthetic journey

Three rounds of styling, each rejected for a specific reason:

### Round 1 — warm rustic
Brown-on-cream, Spectral serifs, copper accents. **Rejected:** *"doesn't
need to be middle eastern rustic, it can be futurist and brutalist."*
Read as orientalist pastiche.

### Round 2 — cyberpunk
Black `#0a0a0c` ground, JetBrains Mono throughout, neon green active state,
hot magenta karar, amber inflections. **Rejected:** *"more brutalist like
concrete… mexican tropical brutalism not cyberpunk shit."*
Read as generic tech-product, not architectural.

### Round 3 — Mexican tropical brutalism
Warm concrete `#b8b0a4` with grain texture, terracotta karar, saffron active
state, hard 3px black poster shadows on active elements. **Rejected:**
*"make it istanbul tropical brutalist… what's this orientalist colors."*
The terracotta + ochre combination read as Mexico City / Barragán, not
Bosphorus.

### Round 4 — Istanbul brutalism (current)
Pulled from Istanbul's actual material vocabulary:

- **damp Bosphorus concrete** — slate-blue ground `#8c9498` with cool dot
  grain (the city's concrete is wet and cool, not sun-baked)
- **Iznik tile band** running down the rail's left edge — deep teal
  `#1d6f7a`, turquoise `#4ba3a8`, pomegranate `#d94c3d` (cycling stripe,
  abstracted from Iznik pottery)
- **manuscript gold** `#e8d56a` for the active position bar (Iznik / Ottoman
  illumination)
- **pomegranate red** for karar, replacing terracotta
- **cream** `#f4f0e6` cast-concrete signage type with hard black drop-shadow
- **deep teal** active maqam block with saffron left-bar
- italic Spectral retained only for native names and seyir descriptions, where
  it carries the literary register

The principle: brutalism isn't a global aesthetic, it's regional. Mexican
brutalism is dry concrete + sun. Istanbul brutalism is wet concrete + tile.
Same material honesty, different climate.

---

## 6 · What the pieces give the player

- **Browse 8 maqamat** from the rail (Rast, Hicaz, Hüseynî, Uşşâk, Saba,
  Segâh, Bayati, Nihavend) — switching resets all retunings
- **Pluck any of ~24 strings** spanning 2.5 octaves
- **Retune any string** through legal mandal positions including the
  maqam's own alternate perdes plus comma-fraction adjustments
- **See the actual perde name update live** as you retune
- **Karar rows** highlighted in pomegranate across the full width so the
  modal anchor is always visible
- **Modified strings** highlighted in saffron so you can see at a glance
  which strings are off-canonical

---

## 7 · What's deliberately not there yet

- No dragging on the indicator (only stepwise via arrows). Continuous
  drag-to-tune is the obvious next step.
- No drone bed (toggle exists in Tweaks but not yet wired to a sustained
  oscillator on the karar pitch).
- No saving / sharing of custom tuning configurations.
- No keyboard shortcuts for plucking.
- No way to play multiple strings simultaneously (chord mode).
- No visual indicator of which alternate is "ascending" vs. "descending"
  in the maqam's seyir — the hint text is in the data but not surfaced.

These are the next obvious moves but they all extend the current frame
rather than replace it.
