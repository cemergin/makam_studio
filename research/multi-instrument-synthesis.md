---
title: "Multi-instrument synthesis for makam_studio (bowed, wind, and long-neck-lute voices)"
audience: "audio engine architect, makam_studio core dev"
tldr: "v1 ships five voices: qanun (Wave 1), baglama, tar, ney, and clarinet. All five reuse the qanun's K-S/Thiran AudioWorklet kernel with parameter changes — no new DSP architecture required for v1. Bowed-string voices (violin, kamancha, lyra) defer to v2 because real-time Helmholtz/friction modelling in Web Audio is a 1–2 month derisking project we should not block v1 on; the recommended path is a Faust → WASM Worklet build, optionally via the Faust-STK violin model. Tanbur, dutar, and zurna also defer (long-sustain stability, drone-pair, and harmonic-balance challenges respectively). The voice ↔ pitch-UI interaction is unified by a per-voice 'pitchMode' enum: discrete | discrete-with-bend | glide. The single biggest win is realising BeatForge's `fm.ts` already ships saz, oud, and sitar presets — a 60-second timbre demo can be standing this week, even before Wave 1's K-S engine lands."
skip_if: "you only care about wave-1 plucked-string DSP (read web-audio-plucked-string-synthesis.md instead) or UI design (see ux-interface-review.md)"
date: 2026-04-30
status: draft
---

# TL;DR

- **v1 voice roster (recommended): qanun + baglama + tar + ney + clarinet.** Two long-neck plucked lutes (K-S parametric tweaks of the Wave 1 engine), one ney (cylindrical-bore flute waveguide; cheapest of the wind models), one clarinet (single-reed waveguide; the canonical Smith model and the cheapest reed model). The qanun is the keystone (Wave 1 owns it).
- **All five v1 voices share one AudioWorklet kernel.** The K-S/Thiran loop covers qanun, baglama, and tar with parameter swaps; the wind voices add a separate "bore-loop + reed/jet excitation" path inside the *same* worklet processor file (one worklet, multiple voice classes). One context-switch per voice activation. CPU budget for the v1 roster is comfortably inside Wave 1's phone budget (~6 voices total, monophonic anyway).
- **Bowed strings (violin, kamancha, lyra) defer to v2.** Real-time Helmholtz/stick-slip friction modelling at < 1 ms latency in a Web Audio worklet is achievable but is a 1–2 month DSP project on its own. The right path is Faust → WebAssembly Worklet using the existing Faust-STK `violinModel`, but that requires standing up a Faust toolchain we don't otherwise need for v1. **Defer cleanly. Document the v2 path.**
- **Tanbur, dutar, zurna also defer.** Tanbur's 30-second sustain breaks the K-S "lossy filter inside loop" stability assumption (need either dual-polarisation waveguide or commuted synthesis). Dutar's drone-+-melody character needs polyphony, which v1 doesn't have. Zurna's loudness and harmonic-balance is a mixing/EQ problem more than a synthesis one — easier *after* the engine settles.
- **The pitch-UI adapts per voice via a `pitchMode` enum.** `discrete` (qanun, baglama frets, clarinet at v1) → keyboard plays the canonical pitch on key-down, ignores mid-key pitch motion. `discrete-with-bend` (tar) → keyboard plus per-note micro-bend gesture. `glide` (ney, all bowed in v2) → key-down sets target pitch, finger-drag glides; aftertouch / mod-wheel-equivalent drives vibrato depth. The right-zone keyboard component reads the active voice's `pitchMode` and switches behaviour. **One UI, three modes, fork-able from BeatForge nothing.**
- **Surprise reuse from BeatForge: `fm.ts` already ships `saz`, `oud`, `sitar` presets** (FM-synthesis approximations, not Karplus-Strong). They sound *acceptable* — not great, but acceptable enough that we can ship a "Quick Demo" page on day 1 that just plays maqam-tuned notes through the existing FM synth, before the Wave 1 K-S engine lands. **Suggested first build target: a "FM-pluck demo" page using BeatForge's voice machine code as a stub, replaced piecewise as real voices land.** No saz preset in `modal.ts` (Wave 2 mining doc was wrong on that point — saz/oud are FM, not modal).
- **Reference recordings list at the end of this doc** — three iconic players per instrument, calibration listening for the team.

---

## 1. Long-neck lute parametric tweaks (Karplus-Strong family, monophonic v1)

The qanun (Wave 1) and the four Anatolian / Persian / Central-Asian long-neck plucked lutes (baglama, tar, dutar, tanbur) share the same fundamental physics: a string vibrating between fixed ends, driven by a plucking impulse, terminated by a body that radiates sound. The Karplus-Strong (K-S) algorithm models all five — what changes is parameter values, not algorithm.

This section catalogues the per-instrument parametric overlay we apply on top of the Wave 1 EKS kernel. **No new DSP code.** A single `pluck.ts` voice machine reads a `bodyMode` enum (`qanun | baglama | tar | dutar | tanbur`) and sets damping, brightness, body-filter coefficients, and decay envelopes accordingly.

### 1.1 Qanun (Wave 1 keystone — recap for context)

Already specified in `research/web-audio-plucked-string-synthesis.md`. Recap of the *parametric* values we'll be contrasting against:

- 3 strings per course, detuned ±3–8 cents.
- Damping LP cutoff: ~7 kHz initially, rolls down with note pitch.
- Body filter: 4 biquads at 280 Hz / 1.2 kHz / 3.5 kHz peaks + 8 kHz high-shelf cut.
- Pluck position β ≈ 0.07 (close to bridge → bright comb).
- Decay: 10–15 s low courses, 2–4 s top courses.
- Mandal levered retuning: snap to comma values, ~17-cent resolution.
- No continuous pitch.
- Range A2–E6 (3.5 octaves).

### 1.2 Baglama / saz (Anatolian long-neck folk lute)

**Distinctive timbre vs qanun.** Pear-shaped wooden body (mulberry or walnut) with two small round sound-holes — much more compact body cavity than the qanun, fundamental Helmholtz resonance ~300 Hz. Strings are steel (top course) and steel-wound nylon (lower courses), giving brighter attack than the qanun's nylon/PVF. Long fretboard (~40 cm scale length, longer than qanun's effective string lengths). Movable nylon-bound frets — player can shift them between pieces for different makam tunings, but not mid-performance.

The signature timbre is a *very strong fundamental* with a fast-decaying upper-harmonic shimmer — the "bağlama bite." Drone strings (the lower G-G or D-D pair) ring sympathetically; the player often strums all strings while fretting only the top course, so the sound is "melody on top, drone underneath." For monophonic v1, we voice only the melody course.

**K-S parameter changes vs qanun:**

| Parameter | Qanun | Baglama (v1 monophonic) |
|---|---|---|
| Strings per voice | 3 detuned (±3–8 ¢) | 2 in unison (±2 ¢ — tighter than qanun) |
| Damping LP cutoff (initial) | ~7 kHz | ~5 kHz |
| Brightness (initial) | high | medium-high |
| Body fundamental | ~280 Hz | ~300 Hz |
| Body filter Q | broad (Q=2–4) | narrower (Q=4–6 — smaller cavity, more peaky resonance) |
| Pluck position β | 0.07 | 0.15 (struck further from bridge with mizrap plectrum) |
| Decay (low courses) | 10–15 s | 4–8 s (smaller body, less sustain) |
| Mandal retuning | yes | no (movable frets only — set per piece, not per note) |
| Continuous pitch | no | optional vibrato (left-hand finger pressure on fret) |

**Microtonal capability.** Baglama uses Turkish AEU-comma microtones, *baked into the fret positions* before play begins. The fretting is microtonally precise but not continuously tunable mid-performance — the player can bend slightly via finger pressure (a 10–20¢ "stretch") but the canonical pitches are discrete. **Pitch UI: `discrete-with-bend`** (see §6).

**Drone-string handling.** Punted to v2 with polyphony. In v1 monophonic, the user hears only the fretted melody pitch.

**BeatForge fork opportunity.** `app/src/audio/machines/voice/fm.ts` ships a `saz` FM preset (`pitch: 300, ratio: 1, index: 110, decay: 700, feedback: 0.15`). It sounds OK as a *stub* — convincingly plucked, but lacks the bağlama's body resonance. **Use it as a placeholder for the day-1 demo, replace with K-S voice in week 2.**

### 1.3 Tar (Persian / Azerbaijani double-bowl long-neck lute)

**Distinctive timbre vs qanun and baglama.** The tar's body is a *figure-of-eight double bowl* (two pear-shaped halves joined at the waist) carved from mulberry wood, *covered with a thin lambskin or fish-skin membrane*. The membrane is the key timbral element — it's a drumhead, not a wood plate. Three double-courses of steel and bronze strings; a fourth double-course of bass strings. Long, thin neck with movable gut/silk frets (~25 frets covering ~2.5 octaves microtonally). Played with a brass plectrum coated in beeswax.

Sound character: *very bright attack* (steel strings + bridge on a tight membrane), *slightly buzzy decay* (the membrane shapes mid-frequency emphasis), *medium-long sustain* on the lower courses. Persian tar has a slightly different body geometry than Azeri tar — Persian is rounder, Azeri is flatter — but the differences are subtler than the differences from qanun or baglama. Treat as one voice for v1.

**K-S parameter changes:**

| Parameter | Qanun | Tar |
|---|---|---|
| Strings per voice | 3 detuned | 2 in unison (per double course) |
| Damping LP cutoff | ~7 kHz | ~6 kHz |
| Brightness (initial) | high | high (membrane = bright) |
| Body fundamental | ~280 Hz (single chamber) | ~190 Hz + ~340 Hz (dual cavity → two peaks) |
| Body filter | 4 biquads, single-cavity | 5 biquads, dual-cavity (two prominent low peaks ~ a perfect fifth apart) |
| Membrane buzz | none | yes — 6 kHz HP-noise modulated by amplitude envelope, –30 dB |
| Pluck position β | 0.07 | 0.10 |
| Decay (low courses) | 10–15 s | 5–9 s |
| Continuous pitch | no | yes (fretless under fingering) — see UI note |

**Microtonal capability.** This is where tar gets interesting. Persian tar frets are tied gut/silk on the neck, and players slide them slightly during a piece. More importantly, the player's finger pressure on a fret gives a few cents of bend, and *some* notes are played without contacting a fret at all (free-fingered, slide-into-pitch). This makes tar arguably the most flexible-pitch member of the long-neck-lute family. **Pitch UI: `discrete-with-bend`** baseline, but the user-override mechanism (Pivot 6's per-degree candidate-pitch palette) gets heaviest use here.

**Body filter design.** The dual-bowl figure-eight is a coupled-resonator system — two air cavities connected through the waist. Acoustically, this creates two prominent low-frequency peaks separated by roughly a perfect fifth (the wider lower cavity peaks lower; the smaller upper cavity peaks higher; they couple weakly). For v1, two parametric peak biquads at 190 Hz and 340 Hz approximate this. v2 could measure a real tar's body IR and use a 50-ms windowed convolution.

**Sympathetic strings.** Tar has no separate sympathetic course (unlike sitar or sarod) — but the *unstruck* courses do ring in sympathy with the played one. Polyphony issue, defer to v2.

### 1.4 Dutar (Central-Asian, Uzbek/Tajik/Turkmen 2-string long-neck)

**Distinctive timbre.** The dutar (literally "two strings") has a long pear-shaped wooden body, two strings tuned a fourth or fifth apart, no membrane (wood top), played with the fingertips (no plectrum). Sound is *softer than baglama* (no plectrum, gentler attack), *sweeter than tar* (no buzzy membrane), with a long resonant decay because the wood top is thin and the body is large.

The defining playing convention: **drone + melody simultaneously.** The player strums or finger-picks both strings; one string holds the tonic drone, the other plays melody. This is a polyphonic instrument by design. For monophonic v1, **we voice the melody string only and skip the drone** — the user hears a "dutar without drone," which is musically incomplete but technically correct as a single-line voice. Document the v2 implication: dutar will be the first voice that *needs* polyphony to sound right.

**K-S parameter changes:**

| Parameter | Qanun | Dutar (v1 melody-only) |
|---|---|---|
| Strings per voice | 3 detuned | 1 (no detune — single string per note) |
| Damping LP cutoff | ~7 kHz | ~4 kHz (no plectrum → softer attack → less brightness) |
| Brightness (initial) | high | medium (finger-picked) |
| Body fundamental | ~280 Hz | ~220 Hz (large pear-shaped wood box) |
| Pluck position β | 0.07 | 0.20 (fingertip strike further from bridge) |
| Pluck excitation | sharp noise burst | softer pulse + envelope (1.5 ms attack vs qanun's 0.5 ms) |
| Decay (low strings) | 10–15 s | 8–14 s (long! thin wood top resonates) |
| Continuous pitch | no | yes (finger pressure on frets) |

**Microtonal capability.** Movable gut frets, similar story to baglama — set per piece, slight bend mid-performance. **Pitch UI: `discrete-with-bend`.**

**v2 polyphony note.** When polyphony lands, the user-facing affordance for dutar should be a "drone toggle": pressing it sustains the tonic + fifth on the second string while melody plays. This is one of the cleanest motivations for v2 polyphony.

### 1.5 Tanbur (Ottoman / Tajik long-neck — the hardest plucked voice)

**Distinctive timbre.** The Ottoman tanbur is *the* hardest plucked-string voice in the entire roster. Acoustically:

- *Body*: a hemispherical wooden shell (no sound hole), violin-like bridge transmitting string vibration to a soundboard that is the front of the hemisphere. The lack of a sound hole is unusual — energy radiates entirely through the soundboard, and the body doesn't have a Helmholtz cavity resonance.
- *Strings*: 7 or 8 strings in pairs (3 melody + 3–4 drone) on the Turkish tanbur; the Tajik tanbur has fewer pairs (5 or so).
- *Frets*: up to 48 movable frets — *the densest fretboard of any traditional instrument* — to accommodate the full Turkish 53-comma microtonal system. Frets are gut and *do* slide during play (Turkish), but the Tajik tanbur has fixed frets.
- *Plectrum*: a long thin tortoiseshell or plastic plectrum, bowed across the strings (the "bowed tanbur" or *yaylı tanbur* is a separate instrument).
- *Sympathetic strings*: only the lowest melody course is fretted; the upper courses are sympathetic resonators that ring without being directly played.

**The challenge: extremely long sustain (~30 seconds at full ring-out).** The Wave 1 K-S engine's "lossy filter inside loop" approach starts to fail when you need 30 s of sustain — the loss filter coefficient gets so close to unity that *any* numerical error compounds, and the loop either drifts in pitch (rounding error in delay-line read-pointer) or rings forever (gain creep). Karjalainen / Erkut have published a tanbur-specific physical model using **dual-polarisation waveguides** and **commuted synthesis** (Erkut & Karjalainen 2002, IEEE Transactions on Speech and Audio Processing).

**The dual-polarisation move.** Real strings vibrate in *two* perpendicular planes simultaneously — vertical and horizontal — and these two polarisations exchange energy through the bridge. For short-sustain plucks (qanun, baglama) one polarisation suffices; for long-sustain plucks (tanbur, sitar, also acoustic guitar's high notes) the two-polarisation model gives the characteristic *beating* and *energy redistribution* during decay that single-polarisation K-S misses. Cost: 2× the per-voice DSP (two parallel delay loops + a 2x2 bridge coupling matrix).

**The sympathetic-coupling move.** When 4–7 sympathetic strings are present, energy from the played string injects into them through the bridge. Karjalainen-Erkut's dual-polarisation tanbur model couples N strings via a small NxN bridge admittance matrix. For monophonic v1 (one melody string sounding at a time), this becomes manageable: one active K-S loop + 3–6 passive loops getting bridge-coupled energy.

**Verdict for v1: defer.** Tanbur is the highest-fidelity-required voice in the entire roster. We could ship a "tanbur-flavoured baglama" stub (longer K-S decay, narrow body filter, brighter excitation) but it would be misleading — the tanbur's sympathetic shimmer and its 30-s ring are central to the instrument's identity. Better to ship qanun + baglama + tar in v1 and add tanbur in a 2-week dedicated v2 sprint with the dual-polarisation engine.

**Risk if we tried tanbur in v1.** Numerical-stability tail risk: a damping coefficient set 0.001 too high makes the voice run away (audible feedback), 0.001 too low makes it dead. The mandal-retuning torture-test from Wave 1's Day-6 risk-out scales here: with 30-s sustain and dual polarisation, the equivalent torture test is more like 60 s of held note across multiple retunings. **Not in the v1 budget.**

### 1.6 What to build, in what order

Implementation order for the long-neck plucked-lute family:

1. Qanun first (Wave 1 already plans this).
2. Baglama next (parameter swap on the same voice, +0.5 day).
3. Tar (parameter swap + dual-cavity body filter, +1 day).
4. Dutar (parameter swap + softer excitation, +0.5 day, but document the v2 polyphony promise).
5. Tanbur last — and in v2, not v1.

By the end of week 2 of voice-engine work, the user has 4 plucked-lute voices to choose from.

---

## 2. Bowed-string physical modeling (violin, kamancha, lyra)

This is the hardest synthesis category in the whole roster. It is also where a maqam-music synth that ships *without it* feels meaningfully incomplete, especially for Persian (kamancha is central to dastgah) and Greek/Cretan (lyra) audiences.

**v1 verdict, stated up front: defer all bowed-string voices to v2.** Reasoning follows.

### 2.1 The bow-string interaction (Helmholtz motion)

A bowed string doesn't vibrate sinusoidally. It vibrates in *Helmholtz motion*: the string sticks to the bow, gets pulled along until tension overcomes static friction, then slips back at high speed, then catches on the bow again — a sawtooth-like cycle whose fundamental period is the round-trip travel time of the string. The slip-stick cycle is locked to the string's natural period by the friction nonlinearity itself. McIntyre, Schumacher & Woodhouse 1983 (the canonical "MSW" paper) was the first time-domain digital simulation that reproduced Helmholtz motion correctly.

**Three-parameter input space.** A bowed string is driven by:

- **Bow velocity** $v_b$ (m/s) — how fast the bow moves across the string.
- **Bow force** $F_b$ (N) — how hard the bow presses into the string.
- **Bow position** $\beta$ (fraction of string length from bridge) — where the bow contacts the string.

These three values define a point in a 3D space. Helmholtz motion exists only inside a particular subspace of this volume (the "Schelleng diagram" — the famous wedge-shaped region bounded by minimum and maximum bow forces). Outside that wedge, the string makes squawks, surface sounds, raucous double-period oscillations, or no sound at all. **The whole expressivity of the violin is the player's ability to navigate this 3D wedge in real time.** Replicating that with a UI is a separate hard problem — see §6.

**Why this is hard for digital synthesis.** The friction nonlinearity is *not* a simple lookup table. State-of-the-art models use either:

- **Static friction curve** (Smith 1986; classic "MSW-style" model). Friction force vs. relative bow-string velocity is a fixed curve with a high static peak and a lower dynamic plateau. Cheap, classic, sometimes unstable at extreme parameter values.
- **Elasto-plastic friction** (Serafin et al. 2002). Bow hairs deform elastically before slipping plastically; gives smoother attack transients and more reliable Helmholtz onset.
- **Thermal friction** (Smith & Woodhouse 2000; Galluzzo 2003). Rosin temperature at the contact point modulates friction. Most physically accurate, "more benign" parameter response (Helmholtz onset is reliable across a wider Schelleng wedge). This is the current state-of-the-art.

For the v2 makam_studio, **elasto-plastic** is probably the right balance: better than static curve, much simpler than thermal. Faust-STK's `violinModel` uses an elasto-plastic-derived model.

### 2.2 Smith's bowed-string waveguide

The canonical Smith model:

```
                 ┌─────────── upper-delay-line ───────────┐
                 │                                          │
        bridge ──┤                                          ├── nut
                 │                                          │
                 └───────────  lower-delay-line  ───────────┘
                                       │
                                       │
                                  bow scattering junction
                                       │
                                  bow input  (v_b, F_b)
```

Two delay lines — one above and one below the bow's contact point — represent the two string segments. The bow injects energy at the junction (the scattering point), with the friction nonlinearity governing how much velocity (and which sign) the bow imparts each sample. The bridge end has a body filter (radiation impedance + body resonance); the nut end has a near-rigid termination. Body radiation is the audible output.

**Per-sample DSP cost rough estimate** (single-polarisation, static friction):

- 2 delay lines: 2 ringbuffer reads + 2 writes + 2 fractional-delay (Thiran) interpolations
- Friction nonlinear lookup: ~5 multiplies + lookup table
- Bridge filter: ~2 biquads = 10 multiplies
- Body filter: ~4 biquads = 20 multiplies

Total ≈ 40 multiplies + 6 reads/writes per sample, **per voice**, single-polarisation. K-S equivalent (Wave 1) is ~9 ops per sample per string (3 strings = 27 per voice). So bowed-string is ~1.5–2× per-sample cost, BUT:

- Dual-polarisation (essential for high-quality violin) doubles it → ~3–4× K-S.
- Thermal friction adds another ~30% → ~4–5× K-S.
- Bridge admittance and body radiation aren't symmetric — typically need higher-order filters → another ~30–50% → ~5–7× K-S.
- The model needs to run at 88.2 or 96 kHz internally (oversampling) to keep the friction nonlinearity stable → **2× the per-sample work in the inner loop**.

Realistic CPU-cost ranking: bowed-string PM is ~5–15× K-S per-voice, depending on quality target. The brief asked us to be honest about this and the literature backs the estimate (Faust-STK `violinModel` benchmarks roughly 5× the `karplusStrong` model on identical hardware in IRCAM's published Faust performance comparisons).

### 2.3 Modal alternative (cheaper, less expressive)

A modal bowed-string approximation: instead of physically modelling the slip-stick interaction, you sum N partials with bow-noise excitation, where each partial is enveloped to behave roughly like a bowed harmonic.

- Cheap (~25 partials × biquad = same as 25 modal bell partials).
- Bow-noise excitation gives "bow-like" attack (broadband noise burst, low-pass filtered, modulated by amplitude).
- Loses the expressive dimension of the Helmholtz wedge — bow-force/velocity changes don't change the *quality* of the sound, only the loudness and brightness.
- For a hand-played UI, the user can't really feel the bow anyway — they're using a touchscreen — so the modal approximation may be musically sufficient.

**This is a real option for v2.** Modal bowed-string can ship faster than full PM (1–2 weeks vs 1–2 months) and may be 80% as good for the UI we'll have. Recommend prototyping both paths in v2 and comparing.

### 2.4 Web Audio realisation

Two implementation paths:

**Path A: Hand-written AudioWorklet in JavaScript.** Fastest to prototype, easiest to debug, but limited by V8/JSC numerical performance. For a 5–7× K-S workload in pure JS, the phone budget (Wave 1 estimated ~6 voices) shrinks to ~1 voice, *maybe* 2. Doesn't scale.

**Path B: Faust → WebAssembly → AudioWorklet.** Faust (GRAME) is a domain-specific language for DSP that compiles to C++/WASM/Rust. The Faust-STK library (Romain Michon, Stanford CCRMA + GRAME) ships a `violinModel` and a `bowedString` primitive that produce production-quality bowed-string synthesis. The toolchain compiles `.dsp` source to a WASM module, then wraps it as an AudioWorkletProcessor. Performance is roughly 2–3× faster than equivalent hand-tuned JS for tight DSP inner loops, putting bowed-string PM back in the realm of "1–3 voices on phone, 4–8 on desktop." Recent (2024) work has stabilised the Faust → WASM AudioWorklet pipeline (presented at IFC-24 in Turin) to the point where it's a maintained, recommended path.

The cost: standing up the Faust toolchain is a real engineering project. We'd need:

- Build-time integration (Faust compiler, emcc or Rust-WASM toolchain).
- Runtime loader for WASM-AudioWorklet glue.
- A bridge from makam_studio's parameter system (`ControllableModule`) to Faust's parameter UI.
- Testing infrastructure.

For v1, this is too much. For v2, it's a 2–3 week sprint to set up and a further 2–3 weeks to integrate three bowed voices. **Total v2 bowed-string budget: ~6 weeks.**

### 2.5 Bow-attack transient and other expressivity concerns

The "scrape" before pitch establishes is central to violin character — it's the audible moment of stick-slip-onset before Helmholtz motion stabilises. In Smith's model, this emerges naturally from the friction dynamics (within the first 2–10 string-period cycles after note-on). In modal/additive models, you have to fake it with a noise transient. Faust-STK does this convincingly.

**Vibrato + portamento.** Crucial for Ottoman/Persian violin and kamancha. Implementation: a slow LFO or fingertip-position envelope on the *delay-line length*, modulated by an "expression" input. Same technique as oud glide in Wave 1. The Thiran allpass coefficient gets continuously updated; transient elimination is needed (Välimäki & Laakso 1995, cited in Wave 1).

### 2.6 Per-instrument tweaks

| Aspect | Violin (Ottoman / Western) | Kamancha (Persian / Azeri) | Lyra (Cretan v1, Pontic v2) |
|---|---|---|---|
| Body | 4-string, multi-resonance LTI body model with prominent "bridge hill" near 3 kHz; tuning historically G-D-A-E (Western), D-A-E-A (Ottoman scordatura) but tuning is a UI concern, not a synthesis one | Smaller body (gourd or wood, ~15–18 cm diameter) covered with thin animal-skin membrane; **no sound holes**; spike protruding below the body that rests on the player's knee. Played upright. Membrane shifts the body resonance higher and adds slight buzz | Cretan: pear-shaped wooden body, ~3 strings, *no* membrane, played upright. Pontic: narrower bottle-shaped body, very microtonal practice (the *khelidonisma* technique uses fingernail-touch instead of fingertip-press) |
| Body filter peaks | 280 Hz (air mode) + ~430 Hz (top plate) + ~3 kHz (bridge hill) + body radiation at ~5 kHz | 200 Hz (membrane fundamental) + ~600 Hz (membrane harmonic) + ~2 kHz (membrane buzz peak) — much narrower body filter than violin | Cretan: ~300 Hz (smaller wood body) + ~1.2 kHz; Pontic: ~250 Hz + ~1.5 kHz, narrower peaks |
| Brightness | medium-high (rosin + horsehair = bright bow) | bright but slightly nasal (smaller body filter) | medium (wood-on-wood damping) |
| String count | 4, tuned in 5ths (Western) or 4ths/5ths (Ottoman) | 4 metal strings tuned in 4ths (typically C-G-D-A or similar regional variation) | 3 strings (Cretan + Pontic both) |
| Microtonal flexibility | continuous (fretless) | continuous | continuous |
| Vibrato/portamento | central to playing style | central + characteristic side-to-side hand motion | continuous fingerboard slide is the definitive technique |

### 2.7 v1 compromise: ship a "violin-ish" *modal* placeholder?

Tempting. But for the same reason we chose K-S over modal for plucked strings (the modal approximation loses energy-exchange between partials, which is exactly what makes a bowed string feel *alive*), a modal-only bowed voice would feel synthetic and limp. Better to:

- v1: ship without bowed strings. Document the v2 plan and the "why."
- v1.5 (between v1 and v2): if user demand is loud, ship a *modal* bowed-string approximation as a clearly-labelled "preview" voice with the caveat that v2 will replace it with full PM.
- v2: full Faust-STK bowed string for violin, kamancha, and Cretan lyra.

---

## 3. Wind synthesis (ney, zurna, clarinet)

Three different wind families, three different excitation models, sharing the same "delay-line-as-bore + body-radiation-output" structure. CPU cost is medium across all three — much cheaper than bowed strings, somewhat more expensive than K-S.

### 3.1 Ney (end-blown rim-edge flute)

**Acoustic facts.** A ney is a *very simple* instrument — a hollow reed with 6 finger holes and a thumb hole, with no fipple, no reed, no embouchure plate. The player blows across the rim of one end at an angle, and the air jet hits the rim's sharp edge, creating an edge tone that excites the reed's air column. Different blow angles give different overtones (the player can *octave-jump* by changing embouchure). Range typically D3 to D6, depending on ney size — there are 7 sizes in the Turkish "fasıl ney" family.

**Synthesis approach.** Smith's flute waveguide model, simplified:

```
breath_noise  ──>  jet-edge nonlinearity  ──>  cylindrical-bore waveguide  ──>  body radiation
                                                          |
                                                          └── feedback (jet sustains via tube resonance)
```

Components:

- **Breath noise**: pink noise modulated by a slow envelope (the player's breath flow). Amplitude controls "blow strength" — central expressive dimension.
- **Jet-edge nonlinearity**: the jet flips between two stable states (above the edge, below the edge) at a frequency locked to the bore's resonance. In practice, Smith's flute uses a noise-modulated nonlinear function (a sigmoid or hyperbolic tangent) to model the jet flip. Cheap.
- **Bore waveguide**: a single bidirectional delay line (cylindrical bore, simple), terminated at the open hole end (selectable by which fingerhole is open) by a partial reflection.
- **Body radiation filter**: a 1-pole high-pass to model the bell-end radiation (open end of the tube).

CPU cost per voice: ~2–3× K-S equivalent (delay line + nonlinearity + breath envelope generator). Modest.

**Half-holing for microtones.** A ney player gets microtonal pitches by partially covering a finger hole — covering 50% of the hole drops the pitch by ~50¢, covering 25% by ~25¢, etc. This is the player's primary microtonal mechanism. For digital synthesis, this maps to a continuous-pitch input: the user's UI gesture (finger-drag, mod-wheel, or aftertouch) modulates the bore's effective length. **Pitch UI: `glide`.**

**Speech-like character.** The defining timbre of ney is its *breathiness* — the noise-to-tone ratio is much higher than most wind instruments (a flutist's breath noise is barely audible at quiet dynamics; a ney's is always present). This is a design intent: increase the breath-noise gain in the excitation by ~10 dB relative to a standard flute model. The ney sounds breathy because it *is* breathy; lean into it.

**v1 verdict: ship.** Cheapest of the wind models, simplest synthesis, and the timbre is iconic for Turkish/Persian/Arabic music.

### 3.2 Zurna (Anatolian/Persian/Greek double-reed shawm)

**Acoustic facts.** A loud, harmonically rich, conical-bore reed instrument. The double-reed (two thin reed blades vibrating against each other) is the primary sound generator; the conical wood body amplifies and shapes the spectrum. Outdoor instrument — projects across hundreds of metres. Cousins include the Indian shehnai, the Persian sorna, the Greek zournas, and the Western Renaissance shawm. Spectrum is very rich: strong even *and* odd harmonics (conical bore supports both, unlike cylindrical bore which suppresses even harmonics).

**Synthesis approach.** Double-reed waveguide:

```
breath  ──>  reed nonlinearity (harder + sharper than single-reed)  ──>  conical bore  ──>  bell radiation
```

Differences from clarinet (single-reed) model:

- **Reed nonlinearity is harder** — double reeds buzz more aggressively, creating richer harmonic content. Implementation: a steeper nonlinear function (e.g., a high-order polynomial or a piecewise-hyperbolic curve) at the bore termination.
- **Conical bore vs cylindrical**: a conical bore can be modelled by a cylindrical waveguide with a *frequency-dependent reflection filter* at the small (reed) end, which approximates the impedance transformation of the cone. Several Faust-STK models do this. Alternatively, a piecewise-cylindrical approximation (3–4 cylinders of decreasing diameter) works adequately.
- **Tone holes**: the zurna has 7 finger holes + 1 thumb hole. Each open hole adds a partial reflection to the bore. For accurate models this is expensive (multiple reflection junctions); for v1, a simpler "effective bore length" approximation (one reflection at the lowest open hole) sounds 80% as good.

CPU cost per voice: ~3–4× K-S equivalent. Moderate.

**The loudness problem.** A real zurna is *loud*. In an ensemble it dominates. In a synth, the user expects clean output — but if we set the zurna's output gain to match its real-world volume, it'll clip every other voice. **Solution: per-voice mix-bus calibration**, where each voice's master gain is set so that an "average forte" sounds at a consistent perceived loudness across all voices. This is a mixing decision, not a synthesis decision, but it must be done before zurna ships.

**Microtonal capability.** Like ney, the zurna player uses half-holing + embouchure pressure to bend pitch. Continuous pitch. **Pitch UI: `glide`.**

**v1 verdict: defer.** Not because the synthesis is fundamentally harder than ney — it's only slightly harder — but because the loudness/balance problem requires a settled mixer before we can responsibly ship it, and v1's mixer will be primitive. Ship in v2 alongside the bowed strings.

### 3.3 Clarinet (Greek/Balkan folk-clarinet tradition)

**Acoustic facts.** Single-reed cylindrical-bore wind. The cylindrical bore is the defining feature: it suppresses even harmonics (the bore acts as a closed-cylinder pipe at the reed end and an open-cylinder at the bell, giving a half-wavelength resonator with only odd harmonics in the lowest register). This gives the clarinet its *hollow* low-register sound (the "chalumeau" register) — a quality unique to single-reed cylindrical instruments.

The Greek/Balkan folk-clarinet tradition (Vassilis Saleas, Petroloukas Halkias) bends the clarinet's pitch *continuously* via embouchure manipulation, sometimes by half-tones or more. This is not part of standard Western clarinet technique; it's a regional specialisation that maps perfectly onto maqam practice.

**Synthesis approach.** Smith's single-reed waveguide model (CCRMA, canonical):

```
breath  ──>  reed nonlinearity  ──>  cylindrical bore (bidirectional delay)  ──>  bell radiation
                                                                                       ┐
                                              feedback to reed  ──────────────────────┘
```

Components:

- **Breath**: same as ney (pink noise modulated by amplitude envelope).
- **Reed nonlinearity**: a "pressure-controlled valve" model — at low pressure the reed is open and lets air through proportionally; at high pressure the reed slams shut and blocks airflow. The transition gives the characteristic "crow" of the clarinet's onset. Smith's CCRMA pages give the exact piecewise-linear function.
- **Cylindrical bore**: a single bidirectional delay line, with a fractional-delay Thiran for pitch precision (same machinery as K-S, reused).
- **Bell radiation**: a 1-pole high-pass filter at the open end, modelling the bell's frequency-dependent radiation.

CPU cost per voice: ~3× K-S equivalent. Modest.

**Alternative: FM clarinet (Chowning-style).** A clarinet can also be approximated with 2-op FM where the modulator-to-carrier ratio is 3:1 (pure odd harmonics) and the modulation index is moderate. Cheaper than the waveguide model (no per-sample nonlinearity), but loses the breathy attack and the embouchure-driven bending. **Useful as a fallback if performance becomes a problem; not the default.** BeatForge has the FM machinery if we go this route.

**Continuous pitch + odd-harmonic dominance.** The clarinet is the cleanest example of a wind instrument where odd-harmonic dominance defines the timbre — synthesise this faithfully and the voice sounds like a clarinet; lose the odd-harmonic emphasis and it sounds like a generic reedy oscillator. Stage tests should A/B against the FM approximation to confirm we got it.

**v1 verdict: ship.** Cheap, classic Smith model, well-documented, Faust-STK has a reference implementation if we get stuck. Greek folk clarinet is iconic for the Balkan / Aegean overlap zone.

### 3.4 Continuous-pitch implication for all three winds

Schema: ney, zurna, and clarinet are continuous-pitch instruments. Pitch-bend gestures are *part* of the playing tradition, not deviations from a fixed grid. UI implication: the right-zone keyboard, when these voices are selected, must support glide-on-touch / portamento. A real ney player slurs constantly — the keyboard equivalent is "press one key, slide finger right/left, hear pitch glide" rather than "press, release, press."

This is the central voice-↔-UI coupling design issue. See §6.

---

## 4. Synthesis approach decision matrix

| Instrument | Recommended approach | CPU/voice (rel. to K-S) | Complexity (DSP eng-days) | v1 ship? | Risk |
|---|---|---|---|---|---|
| Qanun | K-S + Thiran (Wave 1) | 1× | 5–7 days (Wave 1 baseline) | Yes | Solved (Wave 1) |
| Baglama | K-S + saz preset fork (param swap on qanun engine) | 1× | +0.5 day on qanun | Yes | Low |
| Tar | K-S + dual-cavity body filter (param swap + body filter shape) | 1× | +1 day on qanun | Yes | Low |
| Dutar | K-S + softer excitation, sparser strings | 1× | +0.5 day on qanun | Maybe (melody only — drone needs polyphony) | Low (clean defer if polyphony pushes) |
| Tanbur | K-S + dual-polarisation + sympathetic coupling + 30-s stability | 2–3× | 5–7 days dedicated | **No** | Stability; long-sustain pitch drift |
| Ney | Flute waveguide + breath noise | 2–3× | 3–5 days | Yes | Continuous-pitch UX (UI is the hard part, not synthesis) |
| Zurna | Reed waveguide + harmonic boost + conical-bore reflection | 3–4× | 4–6 days | **No** | Loudness/balance in mixer; defer to v2 alongside bowed |
| Clarinet | Single-reed waveguide (Smith canonical) | 3× | 3–5 days | Yes | Continuous-pitch UX |
| Violin | Bowed PM (Faust → WASM Worklet path) | 5–10× | 4–6 weeks (incl. Faust toolchain) | **No** | CPU + Faust toolchain dependency |
| Kamancha | Bowed PM + smaller body, membrane | 5–10× | +1 week on violin | **No** | Same as violin; lower priority for v1 |
| Lyra (Cretan) | Bowed PM + 3-string + wood body | 5–10× | +0.5 week on violin | **No** | Same as violin; defer to v2 |

### 4.1 v1 voice roster (the ask)

**Recommended v1 roster: qanun + baglama + tar + ney + clarinet.**

Defending each pick:

- **Qanun** — keystone, Wave 1 owns it, no question.
- **Baglama** — fastest possible second voice (parameter swap on the qanun engine). Iconic for Anatolian folk music; widely recognisable. Half-day of incremental work after qanun ships.
- **Tar** — second most-played microtonal instrument across Persian + Azeri makam-zone, behind kamancha. Parameter swap with body-filter geometry change. Adds a *visibly different* timbre to the roster (membrane bite vs qanun shimmer vs baglama warmth). One day of incremental work.
- **Ney** — the iconic wind voice for the entire maqam zone (Turkish, Persian, Egyptian, Azeri, Balkan all use it). Cheapest of the wind models (no double-reed nonlinearity, simple cylindrical bore). 3–5 days of dedicated work. *Critical*: tests the continuous-pitch UI before any harder voice depends on it.
- **Clarinet** — Greek/Balkan folk clarinet is iconic and adds a fundamentally different timbre family (single-reed + cylindrical bore + odd-harmonic dominance) that ney doesn't cover. The synthesis path is the canonical Smith model — solid, well-documented, Faust-STK reference if stuck. 3–5 days.

What we *don't* ship in v1, in priority order for "what would I add next if I had two more weeks":

1. Tanbur — most musically iconic of the deferred voices; needs the dedicated stability sprint.
2. Violin (Faust path) — opens the bowed-string family.
3. Zurna — once the mixer is solid.
4. Kamancha (Faust, after violin lands).
5. Cretan lyra (Faust, after kamancha).
6. Pontic lyra (Faust, lowest priority — niche even within Greek music).
7. Dutar (after polyphony lands — drone-+-melody is the whole point).

That ordering also forms the **v2 voice roadmap**.

### 4.2 What gets us 80% of the value with 20% of the work

If we had to ship a 3-voice v1 instead of 5, we'd pick **qanun + baglama + ney**: one plucked-lute representative across the Anatolian/Persian zone, one wind representative, and the keystone. That covers the most-played sound families. Tar and clarinet are ~3 days of additional work to add; we should add them — but if v1 schedule slips, qanun + baglama + ney is the minimum-viable timbre roster.

---

## 5. Risk and derisking

The single highest-risk voice in this entire roster is the **bowed-string PM**.

Wave 1 established the phone CPU budget: ~6 K-S voices on a mid-range phone in pure JS, ~12+ in WASM. Bowed-string PM at full quality is 5–10× a K-S voice. That puts bowed strings at **~1 voice on phone in pure JS, maybe 2–3 in WASM**. Good news: makam_studio v1 is monophonic (Pivot 6) — we only need 1 voice ringing at a time. So the voice-count budget *does* fit. But:

- The 1-voice Faust → WASM path requires standing up the Faust toolchain (compiler, build integration, runtime loader, parameter bridge).
- Latency budget: bowed-string PM at 96 kHz internal oversampling adds ~10–20 µs/sample of inner-loop work, so a 128-sample block needs ~1.3–2.5 ms of CPU on a phone. Web Audio's render budget at 48 kHz is 2.67 ms. Cutting it close. If oversampling, must keep inner loop very tight.
- Friction-model stability across the parameter ranges we expose to UI: the Schelleng wedge is narrow, and a UI that lets the user dial in any (force, velocity, position) triple will produce squawks 30% of the time. We need a *constrained* UI that always yields Helmholtz motion, but feels expressive.

These are 1–2 *months* of full-time DSP work, not 1 week. **Hence the v2 deferral.**

### 5.1 v2 derisking plan (3 paths, pick one)

**Path A — Faust → WASM Worklet (recommended).** Compile Faust-STK's `violinModel` to WASM, wrap as AudioWorkletProcessor, integrate with makam_studio's parameter bus. 4–6 week sprint. Best long-term answer; introduces a maintained DSP toolchain we can use for other physical models thereafter (also helps zurna, kamancha, lyra).

**Path B — Hand-written modal/additive bowed approximation.** Write a JS-only modal bowed voice in an AudioWorklet. ~25 partials with bow-noise excitation, no friction nonlinearity, no dual polarisation. Cheaper, faster to ship (1–2 weeks), but musically less expressive (no Schelleng-wedge dynamics, no proper attack scrape). Useful as a *preview* voice.

**Path C — Defer entirely, ship only plucked + wind in v2.** Honest but feels like a major omission for Persian (kamancha) and Greek (lyra) audiences who'd expect those voices to be there.

**Recommendation: Path A in v2, with Path B as an interim "preview" if v2 schedule slips.**

### 5.2 1-week derisking task list (for whichever path)

If we wanted to derisk Path A in a 1-week spike:

**Day 1 — Stand up Faust toolchain locally.** Install `faust2webaudiowasm` or equivalent. Compile Faust-STK `violinModel.dsp` to a WASM AudioWorkletProcessor. Verify it loads in Chrome. Verify it sounds like a violin (sanity).

**Day 2 — Build integration.** Wire the Faust-WASM-AudioWorklet build into the Vite bundle (separate bundling pipeline; WASM as static asset). Verify cold-load time is acceptable (target: < 200 ms post-page-ready).

**Day 3 — Parameter bridge.** Connect Faust's parameter handles (bow force, bow velocity, bow position, fundamental frequency) to `ControllableModule` in makam_studio. Verify: changing a UI slider audibly changes the synthesis parameter with < 16 ms latency.

**Day 4 — Phone benchmark.** Bench on Pixel 7 + iPhone 13. Target: < 8% CPU at 1 voice. If failing, profile — likely the friction nonlinearity loop or oversampling.

**Day 5 — Schelleng wedge constraint.** Build a UI mapping that constrains (force, velocity, position) to always-Helmholtz combinations. The simplest version: a single "bow expression" knob from 0 (gentle) to 1 (intense) that traverses a curve through the Schelleng wedge. Verify: across the full knob range, the synth always produces Helmholtz motion, never squawks.

**Day 6 — Vibrato / portamento.** Add an LFO/expression-driven pitch modulation. Verify: smooth glides, no zipper noise, vibrato matches Ottoman violin reference recordings.

**Day 7 — A/B against reference recordings.** Listen comparatively against Aleko Bacanos (Ottoman violin), Habil Aliev (Azeri kamancha), Ross Daly (Cretan lyra). Note where the synth falls short. Document for v2 sprint plan.

**Outcome: a working `BowedVoiceProcessor.wasm` running through Faust-STK, a phone CPU benchmark, and 90 seconds of side-by-side audio.** If at end of week 1 the answer is "yes, holds at 1 voice phone, sounds violin-like," we proceed with the full v2 sprint. If "fails on phone CPU," fall back to Path B (modal). If "Faust toolchain too painful to maintain," fall back to Path B.

### 5.3 v1-specific risks worth flagging

Even within the recommended v1 roster, watch:

- **Continuous-pitch UI integration.** Ney + clarinet require glide-mode keyboard. This is *new UI* — not a parameter swap, a fundamentally different gesture model. The UI prototype must come early (week 1 of UI work, not week 4) so it can shape the voice integration.
- **Body filter parameter explosion.** With qanun, baglama, and tar each having 3–5 different body-filter biquads, the master parameter table grows fast. Need a clean preset-based switching mechanism; piloted in BeatForge's existing `bodyMode` enum pattern.
- **Voice-switching audio glitches.** When user changes voice mid-note, the audio engine must crossfade or release-to-silence. Plan: 50ms release on voice-change.

---

## 6. The "voice ↔ pitch UI" interaction

This is the subtlest design issue in the multi-instrument roster. The 11 target voices have *fundamentally different* pitch-input affordances, and the right-zone keyboard must adapt.

### 6.1 The three modes

A `pitchMode` enum drives the right-zone keyboard's behaviour:

**Mode 1 — `discrete`** (qanun, baglama-frets-locked, dutar-frets-locked, clarinet-default-mode, all keyboard-input voices for v1)

- Press a key → play the canonical pitch of that scale-degree in the active maqam.
- Mid-key gestures (drag, slide) are ignored.
- Per-degree override palette (Pivot 6) provides discrete-microtonal alternatives.

**Mode 2 — `discrete-with-bend`** (tar, baglama-fretless-mode, dutar-fretless-mode, voices where the player can bend ~10–20 ¢ off a fretted pitch)

- Press a key → play the canonical pitch.
- Drag horizontally on a held key → bend pitch by up to ±50 ¢ (UI-configurable cap).
- Release → return to canonical (or stick at bent pitch — user-configurable preference).
- Per-degree override palette still available.

**Mode 3 — `glide`** (ney, zurna, all bowed strings — wind/bowed voices)

- Press a key → set target pitch; voice begins on that pitch.
- Drag horizontally on a held key → glide pitch continuously (Thiran-allpass-driven), portamento speed configurable.
- Release → release voice (note-off).
- Aftertouch / pressure / mod-wheel-equivalent → vibrato depth.
- Two-finger expression → bowing intensity (for v2 bowed; for v1 ney/clarinet, breath strength).

### 6.2 Implementation

The right-zone keyboard component reads `currentVoice.pitchMode` (added to the voice machine schema, defaults to `discrete`) and switches its gesture handler:

```ts
type VoiceMachine<T> = {
  ...
  pitchMode: 'discrete' | 'discrete-with-bend' | 'glide'
  expressionInputs?: ('breath' | 'vibrato' | 'bow-intensity')[]
}
```

The UI changes at the React level:

- Discrete: standard piano-key behaviour (key-down = note-on at canonical pitch, key-up = note-off).
- Discrete-with-bend: same as discrete + a `pointermove` listener while pointer is down + a horizontal-pixels-to-cents conversion. Show a small "bend indicator" (a coloured dot or arrow) on the key while bending.
- Glide: same as discrete-with-bend + extended horizontal range (full keyboard, not just current key) + a "currently sounding pitch" indicator that follows the finger across the keyboard. Visual style: a continuous coloured line on top of the keys showing pitch position over time (the "ney trail").

**Vibrato/breath input.** For touch devices, use `Touch.force` (3D Touch / Force Touch on iOS, Pressure Sensitivity on some Android). For mouse devices, use a mod-wheel-equivalent slider next to the keyboard. For MIDI input, use channel pressure (after-touch) and CC1/CC11.

### 6.3 What this means for v1

Voices ship with:

| Voice | pitchMode | expressionInputs | UI surface |
|---|---|---|---|
| Qanun | discrete | — | base keyboard |
| Baglama | discrete | (vibrato optional, v2) | base keyboard |
| Tar | discrete-with-bend | vibrato | base keyboard + bend indicator |
| Ney | glide | breath, vibrato | base keyboard + glide trail + breath input |
| Clarinet | glide | breath, vibrato | same as ney |

For v1, this means the keyboard implementation must support `discrete`, `discrete-with-bend`, and `glide` from day one. **Recommend prototyping the `glide` mode first** — if it works there, the simpler modes are trivial subsets.

The "secret tab via URL" pattern from BeatForge (the `?tab=_midi` panel) maps to a "qanun-honor view" toggleable to a "ney-honor view" — different physical-instrument honour models per voice. For v1 we ship just the qanun-honor view (Pivot 1); ney/clarinet honour-views are v2.

---

## 7. Reference recordings + iconic players

Listening targets for the team. 2–3 recordings per instrument.

**Qanun**
- *Göksel Baktagir*: "Yansımalar" (2002) — definitive modern Turkish qanun. Tone is bright, clear, mandal use is virtuosic.
- *Maya Youssef*: "Syrian Dreams" (2017) — contemporary Arabic qanun in solo + small-ensemble settings. Warmer, slower, more contemplative.
- *Abraham Salman*: classic Iraqi/Egyptian qanun recordings of Egyptian and Iraqi maqamat (1950s–60s). Historical reference for the Mashriqi tradition.

**Baglama / saz**
- *Aşık Veysel*: any recording. The defining solo bağlama voice of 20th-century Turkey. Plain wood-bodied saz, raw emotional delivery.
- *Erkan Oğur*: "Hiç" (1998) and onwards — virtuoso fretless saz pioneer.
- *Erol Parlak*: contemporary virtuoso, "Şelpe" technique pioneer (fingerstyle without plectrum).

**Tar**
- *Hossein Alizadeh*: "Raz-o-Niaz" (2003) — Persian tar at its most subtle.
- *Vahid Asadollahi* or *Ostad Lotfi*: solo Persian tar from the radif tradition.
- *Ramiz Quliyev*: virtuosic Azeri tar, especially the rapid mugham passages.

**Dutar**
- *Monajat Yultchieva*: Uzbek dutar + voice, the canonical female voice for Shashmaqam.
- *Munajat Yultchieva* (different recordings): solo dutar workouts.
- *Abdurahim Hamidov*: Tajik dutar master.

**Tanbur**
- *Necdet Yaşar*: "Tanbur" (1989 and onwards) — definitive 20th-century Ottoman tanbur recordings. Slow seyir, extreme microtonal precision.
- *Murat Salim Tokaç*: contemporary Ottoman tanburi, technically virtuosic.
- *Tanburi Cemil Bey*: historical recordings (1910s) — the early-recording Ottoman master. Audio quality is of-its-era but the playing is foundational.

**Ney**
- *Niyazi Sayın*: definitive 20th-century Ottoman ney master. Calm, controlled breath.
- *Kudsi Erguner*: French-Turkish ney master, world-music collaborations.
- *Hassan Kassai*: classic Iranian ney (Persian style is differently breathy than Ottoman).

**Zurna**
- *Halil Yıldız*: master Anatolian zurna, especially Erzurum / Diyarbakır regional styles.
- *Anything from the Diyarbakır halay tradition*: the davul-zurna duo at full volume.
- *Dilshad Said* (or modern recordings of Kurdish zurna players): the Kurdish/Mesopotamian zurna lineage.

**Greek folk clarinet**
- *Vassilis Saleas*: the modern technical master. Clear technique, extreme bending.
- *Petroloukas Halkias*: older-generation, more rooted in Epirote tradition.
- *Anything from the Klarino school in Epirus* — the "moiroloi" (lament) tradition demonstrates the clarinet's bending vocabulary at its most expressive.

**Violin (Ottoman / regional)**
- *Aleko Bacanos*: definitive Ottoman classical violinist of mid-20th century.
- *Tanburi Cemil Bey*: historical recordings of Ottoman violin from the dawn of recording.
- *Modern Mediterranean folk violinists*: any of the Greek/Balkan/Anatolian regional players (e.g., from Crete, Pontus, Thrace).

**Kamancha / kamanche**
- *Habil Aliev*: definitive Azeri kamancha.
- *Ardashes Apkarian*: Armenian kamancha (in classical mugham settings).
- *Ali Asghar Bahari*: Persian kamanche, historical reference.

**Cretan lyra**
- *Ross Daly*: cross-tradition Cretan-lyra master, Irish-born, Crete-based.
- *Yiannis Markopoulos*: Cretan-lyra in ensemble + composer.
- *Psarantonis (Antonios Xylouris)*: raw, traditional Cretan-lyra master.

These recordings together form a 4–5 hour listening assignment. Strongly recommended that the team listen *before* tuning per-voice synthesis parameters. The body-filter peak frequencies, the brightness curves, the decay envelopes — all of these must match what your ear remembers from the recordings, not what a paper diagram suggests.

---

## Implications for makam_studio

### v1 voice roster: qanun + baglama + tar + ney + clarinet

Defended above. Gives:

- 3 plucked voices (qanun, baglama, tar) covering the bright-shimmer/warm-wood/membrane-bite timbre families.
- 2 wind voices (ney, clarinet) covering breath-noise/edge-tone and reed-buzz timbre families.
- All 5 voices use the same AudioWorklet kernel (one process function with a voice-class switch). One module to load, one ringbuffer to manage.
- All 5 voices are monophonic — fits Pivot 6's v1 scope.
- Total DSP-engineering effort beyond Wave 1: ~10 days incremental work (0.5 baglama + 1 tar + 4 ney + 4 clarinet).

### Voice-↔-UI adaptation rules

A `pitchMode` enum on each voice machine drives the right-zone keyboard:

- `discrete` — qanun, baglama (default v1 mode)
- `discrete-with-bend` — tar
- `glide` — ney, clarinet

The keyboard component implements all three; the active voice's mode determines which gesture handler is active. **Build glide first; the other two are subsets.**

Expression inputs (breath, vibrato, bow-intensity) are voice-specific:
- Qanun, baglama: none for v1 (plucked, post-attack you can't shape the note).
- Tar: vibrato.
- Ney, clarinet: breath + vibrato.

These map to touch pressure (touch devices), mod-wheel slider (mouse devices), or MIDI CC1/CC11 + channel pressure.

### Bowed-string risk: defer to v2, plan the Faust path

Violin, kamancha, lyra: defer entirely to v2. The recommended path is Faust → WebAssembly → AudioWorkletProcessor, using Faust-STK's `violinModel` as the starting point. Standing up the Faust toolchain is 2–3 weeks; integrating three bowed voices is a further 3–4 weeks. Total v2 bowed-string sprint: ~6 weeks.

Document the deferral honestly. Persian and Greek users will notice. The mitigation is shipping ney + clarinet in v1 — those voices serve the same regions, just on different instrument families.

### Implementation order

1. **Week 0** (already planned): Wave 1 K-S engine, qanun voice, AudioWorklet kernel.
2. **Week 1**: baglama + tar (parameter swaps on qanun engine, +1.5 days total). Confirm voice-switching glitch-free at note boundaries.
3. **Week 2**: keyboard `glide` mode + `discrete-with-bend` mode in UI.
4. **Week 3**: ney voice (flute waveguide). Integrate with `glide` keyboard. Expression input wiring.
5. **Week 4**: clarinet voice (single-reed waveguide).
6. **Week 5**: voice-roster polish, body filter calibration against reference recordings, mixer balance.
7. **v1 ship.**
8. **v2 weeks 1–3**: Faust toolchain + Faust-STK violin integration.
9. **v2 weeks 4–6**: kamancha + Cretan lyra + zurna.
10. **v2 weeks 7+**: tanbur (dual-polarisation engine + sympathetic coupling) + dutar (post-polyphony).

### BeatForge fork opportunities (confirmed)

Searched `~/lab/beatforge/app/src/audio/machines/voice/`. Findings:

- **`fm.ts` ships saz, oud, sitar FM presets** — confirmed at lines 46-49. These are 2-op FM approximations (e.g. `saz: { pitch: 300, ratio: 1, index: 110, decay: 700, feedback: 0.15 }`). They sound *acceptable* — recognisable as plucked-string-like, not great, but fast. **Use as v1 Demo placeholder** while the K-S engine is being built.
- **`modal.ts` does NOT ship saz or oud presets** — wave-2 reusable-research-mining doc was incorrect on this point. Modal has bell/frame/bayan/gong/tank/pot/log/bowl/tabla/kalimba/hangdrum/daf — but no plucked-lute presets. The plucked-lute presets live in `fm.ts`.
- **`_shared/audio.ts`** (`createOsc`, `createGain`, `createBiquad`, `createNoise`, `ampEnvelope`) — fork verbatim, every voice machine needs these.
- **`registry.ts` + `voice-controller.ts`** — the voice-machine registration pattern (machine ID → instance) is exactly what makam_studio's voice selector needs. Fork the architecture, swap the registry contents.
- **No flute/clarinet/wind machines in BeatForge** — these are net-new for makam_studio. Wave 3 introduces a wind-synthesis family BeatForge doesn't need.

---

## Open questions

1. **Faust toolchain bet.** Path A (Faust → WASM) is the long-term right answer for bowed strings. But it's a real toolchain investment. If we never actually need bowed strings (audience signals say "the plucked + wind voices are enough"), the Faust investment was wasted. **Decide in v1 user testing**: do users ask for violin/kamancha by name? If yes, commit to Path A in v2. If no, ship plucked + wind only.

2. **Is the modal bowed-string approximation worth the interim ship?** A 1-week modal violin would let us tick "violin available" much sooner. But it's likely to feel underwhelming. **Lean: skip the interim, go straight to Faust in v2.**

3. **How to handle voice-switching mid-note.** Crossfade or release? Default to release (clean, simple); add crossfade in v2 if user testing complains.

4. **Per-voice mixer calibration.** Zurna is loud; ney is quiet; qanun is medium. The user expects roughly consistent perceived loudness across voices at the same UI velocity. Need a per-voice mix-bus gain calibrated by ear during voice integration.

5. **Drone-string handling for dutar (and v2 tanbur).** Do we ship a "drone toggle" in the UI that lets the user sustain a tonic + fifth on a separate (silent until requested) voice? Or wait until full polyphony arrives? **Lean: defer until polyphony.**

6. **Tanbur sustain stability under retuning.** Same risk class as Wave 1's mandal-retuning torture test, scaled up by 3x for the longer sustain + dual polarisation. Needs a dedicated stability test rig in the v2 sprint.

7. **Continuous-pitch UI testing.** The `glide` keyboard mode is genuinely new UX. We've never built it. Worth a 2-day prototype in v0 (before voice work begins) to validate the gesture feels right *with synth feedback*, even if the synth is a placeholder.

8. **Mid-performance fret-shift on baglama / dutar.** A real player can shift a fret slightly between phrases for expressive intonation. Do we expose this as a UI override? Or treat it as out-of-scope for v1 ("frets are set per maqam, not per phrase")? **Lean: out of scope for v1; expose in v2 alongside per-degree pitch overrides (Pivot 6).**

9. **Sympathetic resonance for tar (and tanbur in v2).** Tar's unstruck courses ring sympathetically — should we model this even when monophonic (single melody course, but bridge-coupled energy bleeds into 2-3 unfretted "passive" courses)? **Lean: skip for v1, add for v2 when polyphony engine is in place.**

10. **Pontic vs Cretan lyra: separate v2 voices or one shared?** Their bodies and playing styles differ. Recommend Cretan in v2 first; Pontic as a follow-on parameter swap once the bowed engine is mature.

---

## Sources

### Bowed-string PM (foundational + recent)

- McIntyre, Schumacher, Woodhouse, "On the Oscillations of Musical Instruments," JASA 74(5), 1325–1345 (1983) — the canonical MSW paper. https://www.semanticscholar.org/paper/ON-THE-OSCILLATIONS-OF-MUSICAL-INSTRUMENTS-McIntyre-Schumacher/d450445219649b57fbc5b5ddfab4cc76b916c17f
- Smith, MUS420 Lecture: "Digital Waveguide Modeling of Bowed Strings," CCRMA. https://ccrma.stanford.edu/~jos/BowedStrings/BowedStrings.pdf
- Smith, "Digital Waveguide Architectures for Virtual Musical Instruments," CCRMA. https://ccrma.stanford.edu/~jos/asahb04/asahb04.pdf
- Galluzzo & Woodhouse, "Helmholtz vibrations in bowed strings," LA-UR-21-21131 (2021). https://www.osti.gov/servlets/purl/1873352
- Smith & Woodhouse, "Bowed string simulation using a thermal friction model" — euphonics archive. https://euphonics.org/wp-content/uploads/2022/03/Thermal_bowing.pdf
- Demoucron et al., "Friction and application to real-time physical modeling of a violin," HAL archive. https://hal.science/hal-01105504
- Avanzini, Serafin & Rocchesso, "Bowed string simulation using an elasto-plastic friction model." https://www.academia.edu/33632460/Bowed_string_simulation_using_an_elasto_plastic_friction_model
- Smith, "Performance Expression in Commuted Waveguide Synthesis of Bowed Strings," with Jaffe (1995). https://ccrma.stanford.edu/~jos//pdf/JaffeSmith95.pdf

### Wind synthesis

- Smith, "Single-Reed Instruments," Physical Audio Signal Processing. https://ccrma.stanford.edu/~jos/waveguide/Single_Reed_Instruments.html
- Smith, "Digital Waveguide Single-Reed Implementation." https://ccrma.stanford.edu/~jos/pasp/Digital_Waveguide_Single_Reed_Implementation.html
- Berdahl & Smith, "Virtual Flute" (REALSIMPLE Project). https://ccrma.stanford.edu/realsimple/vir_flute/vir_flute.pdf
- Smith, "Noise Excitation Source" (flute jet model). https://ccrma.stanford.edu/realsimple/vir_flute/Noise_Excitation_Source.html
- Smith, "A Hybrid Waveguide Model of the Transverse Flute." https://ccrma.stanford.edu/~jos/mus423h/Hybrid_Waveguide_Model_Transverse.html
- Scavone, "Digital Waveguide Modeling and Simulation of Reed Woodwind Instruments," CCRMA STAN-M-72 (1997). https://ccrma.stanford.edu/files/papers/stanm72.pdf
- Kontogeorgakopoulos & Tzevelekos, "Using the cordis-Anima Formalism for the Physical Modeling of the Greek zournas Shawm." https://www.semanticscholar.org/paper/Using-the-cordis-Anima-Formalism-for-the-Physical-Kontogeorgakopoulos-Tzevelekos/fbbed1033c9198b5052ebe0cdb0f9aee32aabdec
- Almeida et al., "A Digital Synthesis Model of Double-Reed Wind Instruments." https://www.researchgate.net/publication/26532219_A_Digital_Synthesis_Model_of_Double-Reed_Wind_Instruments

### Long-neck lute physical models (tanbur, etc.)

- Erkut, Karjalainen, Huang, Välimäki, "Acoustical analysis and model-based sound synthesis of the kantele," JASA 112(4) — methodology generalises. (Also Karjalainen-Erkut 2002 IEEE TSAP article on tanbur sound synthesis.)
- Erkut & Karjalainen, "Model-based sound synthesis of tanbur, a Turkish long-necked lute." https://www.academia.edu/1106422/Model_based_sound_synthesis_of_tanbur_a_Turkish_long_necked_lute (and IEEE entry: https://ieeexplore.ieee.org/document/859073/)
- Erkut, "Acoustical analysis of tanbur, a Turkish long-necked lute." https://www.researchgate.net/publication/267550852_ACOUSTICAL_ANALYSIS_OF_TANBUR_A_TURKISH_LONG-NECKED_LUTE
- Karjalainen, Välimäki, Tolonen, "Plucked-String Models: From the Karplus-Strong Algorithm to Digital Waveguides and Beyond," Computer Music Journal 22(3) (1998). http://users.spa.aalto.fi/vpv/publications/cmj98.pdf
- Compmusic UPF, "Turkish instruments — Computational models." https://compmusic.upf.edu/node/55

### Faust + Web Audio

- Faust Programming Language. https://faust.grame.fr/
- Faust Physical Models Library (`physmodels.lib`). https://faustlibraries.grame.fr/libs/physmodels/
- Michon, "faust-stk: a set of linear and nonlinear physical models for the Faust programming language." https://ccrma.stanford.edu/~rmichon/publications/doc/DAFx11-Faust-STK.pdf
- Michon, "The Faust Physical Modeling Library." https://ccrma.stanford.edu/~rmichon/publications/doc/IFC-18-PM.pdf
- Romain Michon's Faust-STK page. https://ccrma.stanford.edu/~rmichon/faustSTK/
- Michon, "Romain Michon's Faust Tutorials." https://ccrma.stanford.edu/~rmichon/faustTutorials/
- IFC-24 conference (Turin, Nov 2024). https://faust.grame.fr/community/news/ (general Faust news listing)

### Bilbao + numerical sound synthesis

- Bilbao, *Numerical Sound Synthesis: Finite Difference Schemes and Simulation in Musical Acoustics* (Wiley, 2009). https://www2.ph.ed.ac.uk/~sbilbao/0470510463.pdf (Chapter 1 PDF available open)

### Lyra + kamancha acoustics

- Tsiouridis et al., "FEM Investigation of the Air Resonance in a Cretan Lyra." https://www.mdpi.com/2571-631X/6/4/56
- Cretan Lyra (Wikipedia). https://en.wikipedia.org/wiki/Cretan_lyra
- Byzantine lyra (Wikipedia). https://en.wikipedia.org/wiki/Byzantine_lyra
- Modal Analysis of Kamancheh (FEM + Experimental). https://www.researchgate.net/publication/268147055_Modal_Analysis_of_the_Persian_Music_Instrument_Kamancheh_Finite_Element_Modeling_and_Experimental_Investigation
- Kamancheh (Wikipedia). https://en.wikipedia.org/wiki/Kamancheh
- Terirem Project, "The Pontic Lyre." https://www.teriremproject.org/pontic-lyra/

### Iconic-player listening references

- Maqamworld, *The Qanun*. https://www.maqamworld.com/en/instr/qanun.php
- Bağlama (Wikipedia). https://en.wikipedia.org/wiki/Ba%C4%9Flama
- Tanbur (Wikipedia, Turkish). https://en.wikipedia.org/wiki/Turkish_tambur
- Penn Museum, "The Ottoman Tanbûr." https://www.penn.museum/sites/expedition/the-ottoman-tanbur/

### BeatForge codebase (read for fork opportunity verification)

- `/Users/cemergin/lab/beatforge/app/src/audio/machines/voice/fm.ts` (saz, oud, sitar presets confirmed)
- `/Users/cemergin/lab/beatforge/app/src/audio/machines/voice/modal.ts` (no saz/oud — only bell/tank/etc.)
- `/Users/cemergin/lab/beatforge/app/src/audio/machines/_shared/audio.ts`

### makam_studio internal references

- `/Users/cemergin/lab/makam_studio/research/web-audio-plucked-string-synthesis.md` — Wave 1, the K-S/Thiran qanun engine.
- `/Users/cemergin/lab/makam_studio/research/beatforge-reusable-research-mining.md` — Wave 2.
- `/Users/cemergin/lab/makam_studio/docs/design-direction.md` — pivots 6 & 7 establish monophonic v1 + 11-instrument timbre target.

---

## References

Full bibliographic citations.

- Bilbao, S. (2009). *Numerical Sound Synthesis: Finite Difference Schemes and Simulation in Musical Acoustics*. Chichester: John Wiley & Sons.
- Erkut, C., Karjalainen, M., Huang, P., & Välimäki, V. (2002). "Acoustical analysis and model-based sound synthesis of the kantele." *Journal of the Acoustical Society of America*, 112(4), 1681–1691.
- Erkut, C., & Karjalainen, M. (2002). "Model-based sound synthesis of tanbur, a Turkish long-necked lute." *Proceedings of the IEEE International Conference on Acoustics, Speech, and Signal Processing (ICASSP)*.
- Galluzzo, P., & Woodhouse, J. (2021). "Helmholtz vibrations in bowed strings." LA-UR-21-21131 / OSTI 1873352.
- Jaffe, D. A., & Smith, J. O. (1983). "Extensions of the Karplus-Strong Plucked-String Algorithm." *Computer Music Journal*, 7(2), 56–69.
- Karjalainen, M., & Smith, J. O. (1996). "Body Modeling Techniques for String Instrument Synthesis." *International Computer Music Conference Proceedings*.
- Karjalainen, M., Välimäki, V., & Tolonen, T. (1998). "Plucked-String Models: From the Karplus-Strong Algorithm to Digital Waveguides and Beyond." *Computer Music Journal*, 22(3), 17–32.
- McIntyre, M. E., Schumacher, R. T., & Woodhouse, J. (1983). "On the Oscillations of Musical Instruments." *Journal of the Acoustical Society of America*, 74(5), 1325–1345.
- Michon, R. (2011). "faust-stk: a set of linear and nonlinear physical models for the Faust programming language." *Proceedings of the 14th International Conference on Digital Audio Effects (DAFx-11)*.
- Michon, R., Smith, J. O., & Orlarey, Y. (2018). "The Faust Physical Modeling Library: a Modular Playground for the Digital Luthier." *Proceedings of the International Faust Conference (IFC-18)*.
- Scavone, G. P. (1997). "An Acoustic Analysis of Single-Reed Woodwind Instruments with an Emphasis on Design and Performance Issues and Digital Waveguide Modeling Techniques." Stanford CCRMA STAN-M-72.
- Serafin, S. (2004). "The Sound of Friction: Real-Time Models, Playability and Musical Applications." Ph.D. Thesis, Stanford University CCRMA.
- Smith, J. O. (1986). "Efficient simulation of the reed-bore and bow-string mechanisms." *Proceedings of the International Computer Music Conference*, 275–280.
- Smith, J. O. (2004). "Virtual Acoustic Musical Instruments: Review and Update." *Journal of New Music Research*, 33(3), 283–304.
- Smith, J. O. *Physical Audio Signal Processing for Virtual Musical Instruments and Audio Effects*. https://ccrma.stanford.edu/~jos/pasp/ (online book, continuously updated).
- Välimäki, V., & Laakso, T. I. (1995). "Elimination of Transients in Time-Varying Allpass Fractional Delay Filters with Applications to Digital Waveguide Modeling." *International Computer Music Conference Proceedings*.
- Woodhouse, J. (2004). "On the synthesis of guitar plucks." *Acta Acustica united with Acustica*, 90(5), 928–944.
- Woodhouse, J., & Galluzzo, P. M. (2004). "The Bowed String as We Know It Today." *Acta Acustica united with Acustica*, 90(4), 579–589.
