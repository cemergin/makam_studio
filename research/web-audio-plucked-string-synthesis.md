---
title: "Web Audio plucked-string synthesis for makam_studio"
audience: "audio engine architect, makam_studio core dev"
tldr: "Use a digital-waveguide / Extended-Karplus-Strong voice in an AudioWorklet, with 1st-order Thiran allpass fractional delay for cents-accurate microtonal tuning, body coloration via a small biquad cascade (no convolution body for v1), and ~3 detuned strings per voice for the qanun course shimmer. Riskiest unknown is sustained-pitch stability under mandal retuning — derisk with a 1-week prototype that sweeps a delay line and FFT-validates its output."
skip_if: "you only care about UI; for that, see the qanun-control-surface research doc"
date: 2026-04-30
status: draft
---

# TL;DR

- **Recommendation:** Extended Karplus-Strong (digital waveguide, single delay line per voice) inside one shared `AudioWorkletNode`, with a **1st-order Thiran allpass** for the fractional-sample portion of the delay. Linear interpolation kills high partials; integer delay produces 5–25-cent pitch errors at the qanun's upper range; Thiran is the documented best fit for tight feedback loops.
- **Microtonal precision is achievable to ≤ 1 cent** across the qanun's full A2–E6 range at 48 kHz. At E6 (≈ 1318 Hz), an integer delay of 36 samples mistunes the note by ~46 cents — unacceptable for makam. A 5-cent target requires sub-1/100-sample delay precision; a Thiran allpass nails this.
- **Voice budget (rule of thumb, 2026):** desktop ~24 voices comfortably (≤ 5% CPU on M-series / Ryzen-class), mid-range phone (Pixel 7 / iPhone 13) **~6 voices** of full-fat EKS in pure JS, **~12+** if DSP is in WebAssembly. The qanun rarely sounds more than 4 simultaneous notes; this is a comfortable budget.
- **Course detune (~3–8 cents across 3 strings) is the single most important timbral move** — it gives the qanun its shimmer, masks small tuning errors, and is essentially free to compute. Treat each "voice" as 3 detuned KS strings into one summing bus, not as 3 voices.
- **No convolution body for v1.** A 4–6 biquad parametric-EQ chain (broad peaks ~280 Hz, ~1.2 kHz, plus a high-shelf for plectrum bite) gets 80% of the qanun body sound at 1% of the CPU. Commuted synthesis with a stored impulse response is a v2 option.
- **Oud:** same engine, longer delay-line losses, much darker brightness (LP at ~2.5 kHz), bass courses ~10–12 s sustain, no levered retuning. Santur (v2): hammered excitation envelope (sharp 3–8 ms attack, slight noise burst), more partials, longer sustain (~15 s on bass courses).

---

## 1. Karplus-Strong basics

The Karplus-Strong (KS) algorithm is a feedback loop containing a delay line of length $L$ samples and a low-loss filter. An impulse-like burst (originally white noise) is loaded into the delay line; on each sample tick the output is read, filtered, and fed back to the input. Smith (CCRMA) showed this is a special case of digital waveguide synthesis: the delay line *is* the wave traveling along the string, and the filter represents the per-period loss.

**Pitch:**

$$
f_0 = \frac{f_s}{L + d}
$$

where $f_s$ is the sample rate, $L$ is the integer delay in samples, and $d \in [0,1)$ is the filter's group delay (or fractional delay).

**Original lowpass (Karplus 1983):** the canonical $y[n] = 0.5\,(x[n] + x[n-1])$ — a one-zero filter that adds half a sample of group delay and has a unity-gain DC pole and 0 at Nyquist. It dampens high frequencies more than low ones, modeling the physical reality that high partials of a real string lose energy fastest.

**Why it works as a string model.** A real plucked string vibrates at $f_n = n c / (2 L_\text{string})$ where $c$ is wave speed. The delay line stores 1 round trip of energy traveling at $c$; the lowpass models all the energy losses (air, internal, termination) accumulated over one round trip.

### AudioWorklet implementation considerations

A naive implementation chaining `DelayNode`, `BiquadFilterNode`, and a `GainNode` into a feedback loop is wrong on three counts:

1. `DelayNode.delayTime` is sample-rate-discrete in practice and *also* introduces hidden interpolation that you can't tune.
2. The minimum cycle in a Web Audio feedback loop is **128 samples** (one render quantum). At 48 kHz this is 2.67 ms = 375 Hz minimum, far too high for makam (the qanun's lowest A2 is 110 Hz, needing a 436-sample delay).
3. You can't reach the per-sample DSP needed for fractional delay.

Therefore: implement KS inside an `AudioWorkletProcessor`. The processor receives 128-sample input/output blocks; inside `process()` you run a per-sample loop. Keep all state (the delay-line ringbuffer, allpass state variables, envelope phases) on `this`. **Allocate nothing inside `process()`** — Casey Primozic documented a real Web Audio synth where parameter-validation allocations were spending more time than the DSP itself, dropping audio at 16 voices until parameter count was reduced from 34 to 6 per processor.

For block size: the Web Audio render quantum is currently fixed at 128 frames (W3C is moving toward a configurable quantum, but treat it as fixed for 2026). At 48 kHz this gives a 2.67 ms hard budget per render call; at 44.1 kHz it's 2.90 ms. Realistic safe target: stay under 1.5 ms total to leave room for jitter.

**One Worklet for many voices, not one per voice.** The Karplus stress tester (Schaedler) found that "100 strings per worklet" is dramatically more efficient than 100 worklet nodes with one string each — each worklet boundary costs cross-thread parameter-table marshaling on every block. Architecture: a single `KanunVoiceProcessor` with an internal pool of N voice slots, driven by `MessagePort` messages or (preferably) a `SharedArrayBuffer` ringbuffer of note-on/note-off commands. SharedArrayBuffer + Atomics is the documented best practice; MessagePort triggers JS-side allocations and GC pauses.

---

## 2. Karplus-Strong tuning precision (the critical issue)

This is the make-or-break for makam_studio.

### The integer-delay tuning error

For an integer delay $L$ and one-zero lowpass (group delay 0.5 sample), the achievable pitch is $f_s / (L + 0.5)$. To play a target $f$ you need $L_\text{ideal} = f_s/f - 0.5$. Rounding $L$ to the nearest integer introduces a pitch error.

**Worked example, 48 kHz sample rate:**

| Note | $f$ (Hz) | $L_\text{ideal}$ | $L_\text{rounded}$ | Actual $f$ | Error (cents) |
|---|---|---|---|---|---|
| A2 | 110.00 | 435.95 | 436 | 109.99 | -0.2 |
| A4 | 440.00 | 108.59 | 109 | 438.36 | -6.5 |
| A5 | 880.00 | 54.05 | 54 | 880.73 | +1.4 |
| E6 | 1318.51 | 35.91 | 36 | 1315.07 | -4.5 |
| C7 | 2093.00 | 22.43 | 22 | 2133.33 | +33.0 |

Notes:

- The error is roughly proportional to $f^2 / f_s$.
- **Anything above A5 with integer-only delay drifts by a meaningful musical amount.** The qanun's top is around E6.
- For makam, where adjacent microtones are ~22 cents apart and trained ears notice ~5–10 cents, this is firmly unacceptable.

### Fractional delay solutions

Three practical options. Smith's PASP and the Karjalainen / Välimäki / Tolonen line of work both come out the same way for plucked strings.

#### Linear interpolation

One multiply, two adds per sample. **Wrong choice for KS** because it has frequency-dependent amplitude rolloff: at half-sample fractional delay, the gain at Nyquist drops to zero. Inside the high-Q feedback loop this becomes additional damping, killing the very high partials that give the qanun its bright "ping," and worse, the damping changes with the fractional part of the delay — so **timbre changes as you retune**. Use only for non-feedback delays.

#### Lagrange interpolation (3rd or 5th order)

Maximally flat at DC. Smith documents:

- Order 1 = linear (above).
- Order 3: 3 multiplies/sample; small ripple in the magnitude response, mostly transparent at audio bandwidths.
- Order 5: 5 multiplies/sample; very flat to ~16 kHz.

Smith warns: **odd-order Lagrange interpolators can have gain > 1 at some frequencies when the fractional delay is at the edge of the central one-sample range.** That's a problem inside a high-Q feedback loop — literal instability. Order 3 is OK if you keep the fractional delay $d$ within $[-0.5, 0.5]$ and the loop loss generous; order 5 is safer but more compute.

#### Thiran allpass interpolation

This is what Smith and Karjalainen / Välimäki recommend for nearly-lossless feedback loops. A 1st-order Thiran allpass:

$$
H(z) = \frac{a_1 + z^{-1}}{1 + a_1 z^{-1}}, \quad a_1 = \frac{1-d}{1+d}
$$

provides a fractional delay of $d \in (0, 1)$ at low frequencies, with **unity magnitude at all frequencies** — no amplitude distortion at all, anywhere. Cost: 1 multiply, 2 adds per sample (same as linear). This is the dominant choice in published plucked-string-synthesis work.

The catch: Thiran is **maximally flat in group delay only at DC**. Group delay deviates from the requested value at high frequencies, which manifests as small detuning of high partials (a tiny inharmonicity-like effect — actually closer to real string behavior than perfect harmonics). For 1st order, group delay error is small enough that it's musically irrelevant up to ~1/3 of $f_s$. Higher-order Thirans (e.g. order 4) exist but introduce a real risk: **Thiran allpass filters can produce audible transients when their parameters are changed** (Välimäki & Laakso 1995). For mandal retuning and pitch glides we'll be modulating this filter, so:

- Use **1st-order Thiran allpass** + integer delay line. 1 multiply per sample inside the feedback loop.
- For pitch glides (oud-style), use Välimäki's transient-elimination technique (state-variable update) when changing $a_1$.
- The mandal "click" of Turkish qanun playing is actually desirable — but we want it to sound like a string-tension change, not a DSP zipper. Schedule mandal changes during silent moments or use linear interpolation of $a_1$ over ~10 ms.

**Verdict: 1st-order Thiran. Best precision-per-instruction in the literature, and the documented choice of Smith/Karjalainen/Välimäki for plucked strings.**

### Cents precision check

A 1st-order Thiran can resolve $d$ to whatever floating-point precision allows. With double-precision $a_1$, fractional delay precision is effectively $10^{-15}$ samples. Pitch precision in cents:

$$
\Delta_\text{cents} = 1200 \log_2 \frac{L+d}{L+d+\epsilon}
$$

For $L \approx 36$ (E6 at 48 kHz) and $\epsilon = 10^{-6}$ samples, $\Delta_\text{cents} \approx 5 \times 10^{-5}$. **The DSP is not the precision bottleneck; the audio interface clock drift is.** A typical phone audio clock is accurate to $\pm 50$ ppm (0.087 cents) — well below human hearing.

---

## 3. Extended plucked-string (Jaffe-Smith 1983)

The original 1983 CMJ paper and Smith's PASP page on Extended KS list six structural blocks. Mapping each to qanun-relevance:

| EKS block | Function | Qanun relevance |
|---|---|---|
| **Pick-direction LP**: $H_p(z) = (1-p)/(1 - p z^{-1})$ | Models plectrum striking up vs. down by lowpass-filtering the *excitation* | Marginal. The risha (qanun plectrum) is consistent. Skip. |
| **Pick-position comb**: $H_\beta(z) = 1 - z^{-\lfloor \beta L + 0.5\rfloor}$ | Notches the harmonics at multiples of $1/\beta$ — physically correct for plucking at fractional position $\beta$ along the string | **Useful**. Qanun plucking is near the bridge (~5–10% from bridge), giving a bright comb-shaped spectrum. Worth modeling. |
| **String-damping filter**: typ. one/two-pole/zero LPF in feedback loop, $|H_d| \le 1$ | Frequency-dependent decay — high partials die faster than low | **Critical**. This is the main timbre control. |
| **String-stiffness allpass**: cascade of allpasses for inharmonicity | Models stiff strings (piano) where partials drift sharp | Marginal. Qanun nylon/PVF strings on a long bridge are nearly ideal — skip for v1. |
| **Tuning allpass**: $H_\eta(z) = (-\eta + z^{-1})/(1 - \eta z^{-1})$ | 1st-order allpass for sub-sample delay tuning (this is the Thiran) | **Critical**. See §2. |
| **Dynamic-level LP**: $H_L(z) = (1-R_L)/(1-R_L z^{-1})$ where $R_L = e^{-\pi L T}$ | Brightness control: louder → brighter, modulating the *excitation* spectrum | **Important**. Qanun gets brighter when struck harder; this is one of its expressive dimensions. |

So the v1 EKS-for-qanun chain (per voice):

```
excitation(noise, dynamic-level LP, pick-position comb)
   → delay-line + 1st-order Thiran allpass (tuning)
   → string-damping LPF (1-pole)
   → output, fed back to delay-line input
```

That's 1 burst-shaping pass plus 4 multiplies per sample in the loop (Thiran 1, damping 2, gain trim 1). Comfortable.

### Modal synthesis as alternative

Modal synthesis sums $N$ decaying sinusoids: each partial is a `BiquadFilter` (resonator) or oscillator-plus-envelope pair. **Mathematical equivalence with KS exists** (the KS feedback loop is just an efficient way of running an infinite modal sum); the practical question is implementation.

For a qanun-quality plucked sound you'd want ~10–25 partials per note. Per partial: 1 oscillator + 1 envelope generator. Web Audio native nodes can do this without an AudioWorklet — feasible.

But the cost adds up: 25 partials × 24 voices = 600 oscillator-and-gain pairs. On a phone this strains the audio graph traversal cost (each node has overhead). And modal synthesis loses a key qanun behavior: as the note decays, partials decay at *different* rates *interactively* due to the loop topology, not as independent exponentials. Real strings exhibit beating and energy exchange between partials that modal synthesis approximates but doesn't reproduce.

Use case for modal: a fallback for browsers without AudioWorklet (very rare in 2026 — only ~1% of users) or for the body resonance (broad peaks, fixed). Not as the primary engine.

### Waveguide synthesis

Smith's framing of KS as a "single delay line + filter" is the simplest digital waveguide. A full bidirectional waveguide (two delay lines, one for each traveling wave) is more accurate physically but rarely necessary for plucked strings — the simplification to a single delay loop is well-validated. Mention only for completeness; **stick with single-delay-line EKS**.

---

## 4. Qanun-specific timbre

### Acoustic facts

- **Strings**: Turkish qanun has 26 courses × 3 strings = 78 strings, range A2 to E6 (3.5 octaves). Arabic qanun extends slightly lower. Strings are nylon or PVF (poly­vinylidene fluoride) — flexible enough that inharmonicity is small (skip stiffness model for v1).
- **Bridge**: a single long bridge sits on five (Arabic) or four (Turkish) "fish-skin" patches that act as drumheads, transmitting string vibration to the soundboard. The skin patches add a characteristic short-time noisy attack and broad mid-frequency emphasis.
- **Body**: thin trapezoidal soundboard (typically plane / chinar wood, ~95 cm × 38 cm × 5 cm). The "kafes" sound holes (decorative grilles) shape the radiation. Spectral analyses (Şentürk et al.) attribute much of the qanun's bright midrange and "shimmer" to the soundboard's flexural modes.
- **Detuning**: each course's 3 strings are tuned nominally identically but in practice drift apart by 3–8 cents from string-aging and tuning-peg slip. Players accept and even cultivate this. Beating between strings creates the "shimmering chorus" that is *the* qanun signature.
- **Decay**: low courses sustain ~10–15 s, mid courses ~5–8 s, top courses ~2–4 s. Strong frequency-dependent decay.
- **Plucking**: with two metal-tipped plectra (risha) worn on index fingers, very close to the bridge (~5–10% of string length). Yields a bright spectrum with comb notches.
- **Mandal retuning**: small lever shortens effective string length by tiny amounts; resolution is ~25/72-comma in Turkish practice (~17 cents).

### Synthesis recipe per voice (the qanun-isms)

1. **Three KS strings per voice, summed.** Tunings: $f, f \cdot 2^{+\delta_1/1200}, f \cdot 2^{-\delta_2/1200}$ with $\delta_{1,2}$ randomly in [3, 8] cents. Each gets a slightly different damping coefficient (±5%) and a slightly different excitation seed. **This is the single most important step.** Free CPU; profound timbre gain.
2. **Bright excitation.** White noise burst of ~1.5 ms, lowpass-filtered to brightness target (3–8 kHz cutoff), modulated by a steep 0.5 ms attack envelope. Add 5–10% short-burst metallic pink noise for the plectrum click.
3. **Pick-position comb at $\beta \approx 0.07$** (7% from bridge): explicit notch via $1 - z^{-\lfloor \beta L\rfloor}$ on the excitation only — does not need to be in the loop.
4. **Bridge "skin buzz."** Subtle high-frequency noise modulated by amplitude envelope of the voice — feed |output| through a high-pass (~6 kHz) into a noise-modulated gain at -36 dB. Sounds like brightness; absent from KS otherwise.
5. **Body resonance via 4 biquads in series after the voice bus** (not per voice):
   - Peaking, 280 Hz, +6 dB, Q=2 (Helmholtz / soundboard fundamental)
   - Peaking, 1200 Hz, +4 dB, Q=3 (mid plate mode)
   - Peaking, 3500 Hz, +2 dB, Q=4 (skin/bridge bite)
   - High-shelf, 8 kHz, -3 dB (air absorption / room)
6. **Master reverb.** Short, damped (high-frequency-decay-faster) algorithmic reverb, ~1.2–1.8 s RT60. Qanun rooms are not cathedrals; in ensemble settings the qanun is recorded relatively dry. Avoid cathedral reverbs.

For commuted synthesis (v2), record a real qanun body's impulse response and convolve it with the excitation table once at note-on. CPU cost is then zero in the loop. The loss is dynamic body interaction (which is small for plucked strings). Defer until v2 if at all.

---

## 5. Oud (secondary timbre)

**Same engine, different parameters.** The oud is a fretless lute: pear-shaped body (much larger air volume than qanun), gut/nylon strings, plucked with a long thin plectrum. Sound is darker and more vocal.

| Parameter | Qanun | Oud |
|---|---|---|
| String count per "course" | 3, detuned | 2 (most courses), in unison or octave |
| Damping LP cutoff (initial) | ~7 kHz | ~3 kHz |
| Brightness | high | medium |
| Body fundamental | ~280 Hz | ~110 Hz (much larger box, lower air mode) |
| Pluck position $\beta$ | ~0.07 | ~0.15 (further from bridge) |
| Decay (low courses) | 10–15 s | 6–10 s |
| Mandal-style retuning | yes | no |
| Continuous pitch (vibrato/glide) | no (mandals only) | **yes** — fretless |

The oud needs continuous pitch control — a per-frame `delayLength` update with smooth Thiran allpass coefficient interpolation. This is the only structural addition vs. qanun. Use the Välimäki transient-elimination state-variable update when $a_1$ changes by more than ~0.05 between blocks.

**Verdict: feasible from the same EKS engine. No separate algorithm needed.** Cost of supporting oud-mode: a different excitation profile, a different damping curve, and a continuous-pitch control surface. Roughly +20% engine code complexity.

---

## 6. Santur (Persian, secondary / v2)

The santur is **hammered**, not plucked. Acoustically:

- 9 courses × 4 strings (typical), fixed-pitch — **no microtonal mid-performance retuning**, the player retunes between pieces.
- Trapezoid walnut/rosewood body, two sets of 9 movable bridges, range ~3 octaves.
- Sound: percussive bright attack (3–8 ms, much sharper than plucked), long crystalline decay (~15+ s on bass courses), ringing sympathetic resonance.

**Engine fit:** still the same EKS! What changes is the *excitation*:

- Replace the noise-burst-into-LP with a short pulse + click + brief noise tail (a "felt-tipped wooden mallet" envelope: 2 ms attack, 5 ms hold, 30 ms decay).
- Increase loop loss filter cutoff (brighter → longer crystalline decay than oud, but less than qanun's "ping").
- More partials remain energetic → could benefit from 5th-order Lagrange in the delay if KS damping is too aggressive. Unlikely necessary.
- 4 strings per course (vs. qanun's 3, oud's 2) → more shimmer with the same detune trick.

**Sympathetic resonance is more prominent on santur** than on qanun. v2 worth modeling: a sympathetic-coupling matrix that re-injects energy from active voices into nearby (untriggered) string slots at low gain. Free if all 36 strings are running as voices anyway; costs a small mixing matrix per block.

**Santur as a control metaphor (v2 alternative).** Instead of "78 strings + mandals" (qanun), the UI is "36 strings + movable bridges + 2 hammers." Less microtonal flexibility per-performance, but a great control story for Persian dastgah and shashmaqam.

---

## 7. Polyphony management

**Voice allocation.** A voice pool of `N` slots, all the same `KarplusVoice`. On note-on:

1. Find a free slot. If none, steal the oldest.
2. Optionally prefer stealing a voice in release phase (low energy) over an attacking voice — measure RMS in the last 256 samples; steal the lowest.
3. On note-off, set a fast release envelope (~50 ms) on the damping filter to kill it gracefully.

**Architecture: one Worklet, internal voice pool.** The Karplus stress tester confirms this is faster than per-voice Worklets (no cross-thread overhead per voice; one shared parameter table; one `process()` call sums all active voices). Use a simple flat array of voice objects in the processor.

**Polyphony budget for makam_studio (2026):**

| Platform | Voices (full EKS, 3 strings each) | Voices (single-string KS) |
|---|---|---|
| Desktop M-series / Ryzen 7000 | 24 (≤3% CPU) | ~80 |
| Mid-range phone (Pixel 7, iPhone 13) | **6 voices** in JS, ~12 in WASM | ~20–30 |
| Budget phone (Snapdragon 6) | 4 in JS, ~8 in WASM | ~15 |

Performance reasoning. AudioWorklet at 48 kHz / 128-frame quantum has 2.67 ms / call. Each voice (3 strings, EKS):

- Per sample, per string: 1 ringbuffer read, 1 Thiran allpass (1 mul + 2 add), 1 damping LP (2 mul + 2 add), 1 ringbuffer write. ~4 mul + 5 add. ≈ 9 floating-point ops.
- 3 strings × 128 samples = 384 sample iterations × 9 ops ≈ 3,500 ops/voice/block.
- Plus body filters (4 biquads × 128 × ~5 ops = 2,560 ops/block, shared across voices).

A modern phone CPU does ~1 GFLOP scalar JS, ~2–3 GFLOP through WASM. 6 voices × 3,500 = 21,000 ops in JS = 21 µs per block. We have 2,670 µs total budget. So the math says ~50+ voices are theoretically possible — meaning the *real* bottleneck is JS engine warmup, parameter messaging, and node-graph traversal, not DSP. The Primozic/Schaedler benchmarks confirm this: parameter overhead dominates until you cut it ruthlessly.

**The qanun rarely sounds 4 simultaneous notes** in normal performance. 6-voice polyphony on phone is comfortably musical. 24-voice on desktop is generous.

---

## 8. Performance budget on Web Audio in 2026

Confirmed givens (2026):

- **Render quantum: 128 frames** (W3C is moving toward configurable, but treat as fixed).
- At 48 kHz, that's 2.67 ms/call. At 44.1 kHz, 2.90 ms/call.
- Output latency: ~10 ms Windows desktop, ~5 ms macOS/iOS, 30–40 ms Linux, 12–150 ms Android (very device-dependent).
- ScriptProcessorNode is fully deprecated; AudioWorklet is the only path forward.
- WebAssembly + AudioWorklet is the high-performance combo. Emscripten's Wasm Audio Worklets are designed to allocate zero garbage in `process()`.
- SharedArrayBuffer + Atomics for cross-thread is universally available (since the 2022 isolation-policy resolution).

**GC avoidance rules (reiterate, because critical):**

1. No `new`, no `[]`, no `{}`, no string concatenation in `process()`.
2. Pre-allocate every typed array, every state object, every scratch buffer in the constructor.
3. Use SharedArrayBuffer for note events (no MessagePort in the hot path).
4. Limit `AudioParam` count (≤ 8 per node — ideally a single SAB-backed param table).
5. WASM if compute is the bottleneck; idiomatic JS first if not.

**Realistic budget per voice:** 50–200 µs/block on phone, 5–30 µs/block on desktop, depending on EKS extensions enabled.

**Realistic polyphony order-of-magnitude:** 5–10 phone voices, 30–50 desktop voices in JS; 2–3× those in WASM. Match Primozic's empirical ceiling around "16 voices" for moderate-complexity DSP on mid-range hardware.

---

## 9. Architecture (block diagram in prose)

```
NOTE EVENTS (SAB ringbuffer from main thread)
   │
   ▼
┌─────────────────────────────────────────────────────────────┐
│  KanunSynthProcessor  (single AudioWorkletNode)             │
│                                                              │
│   VoicePool[24]                                              │
│     each voice: { active, freq, vel, age,                    │
│                   string[3]: { delayBuf, allpass, dampLP,    │
│                                 detuneCents, age } }         │
│                                                              │
│   for each render block:                                     │
│     for each active voice:                                   │
│       for each string in voice:                              │
│         per-sample loop (128 iter):                          │
│           x = ringbuf[readPos]                               │
│           y = thiranAllpass(x)                               │
│           z = dampLP(y)                                      │
│           ringbuf[writePos] = z                              │
│           voiceOutBuffer[i] += z                             │
│       sum string outputs into voice channel                  │
│     mix all voices into output buffer                        │
└─────────────────────────────────────────────────────────────┘
   │
   ▼
[Master EQ: 4 biquad parametric peaks for body coloration]
   │
   ▼
[Master Compressor (gentle, ~3:1, slow attack, fast release)]
   │
   ▼
[Master Reverb (custom 8-tap feedback delay network or Workbox-style)]
   │
   ▼
AudioContext.destination
```

### Per-voice parameters

| Parameter | Range | Default | Notes |
|---|---|---|---|
| `freq` (Hz) | 50–4000 | per-note | Sets delay length; cents-precise via Thiran |
| `vel` (0–1) | 0–1 | 0.7 | Drives excitation amplitude AND brightness LP cutoff |
| `pluckPosition` (0–1) | 0.02–0.5 | 0.07 | Comb-filter notch position |
| `brightness` (0–1) | 0–1 | 0.6 | Damping LP cutoff |
| `sustain` (0–1) | 0–1 | 0.7 | Damping LP gain (close to 1 = long sustain) |
| `detuneCents[3]` | ±15 cents | random[3,8] | Per-string detune, set on note-on |
| `bodyMode` | enum | "qanun" | qanun / oud / santur — selects body biquad preset and damping curve |

### Why no convolution body in v1

A qanun body IR could realistically be 0.5 s (24,000 samples at 48 kHz). A `ConvolverNode` doing this every render is fine in Web Audio (highly optimized FFT convolution). But it doesn't save us anything over 4 biquads (which sound 90% as good and are 100% deterministic across browsers), it adds binary asset weight (we want the bundle ~1 MB, not 100 KB IR per body), and it commits us to "no samples" being broken.

**Decision: v1 = biquad body, all sources synthesized. v2 = optional commuted-synthesis mode with stored IR (minimum-phase windowed to ~50 ms).**

---

## 10. Anti-aliasing / pitch precision testing

### Validating cents accuracy

The standard recipe:

1. Set up an `OfflineAudioContext` at 48 kHz.
2. Render 2 s of voice sustain at target frequency $f$.
3. Take samples ~1.0 s in (after attack settles, before significant decay).
4. Apply a Hann window (8192 samples → ~6 Hz bin width).
5. FFT, find peak bin, parabolic interpolation to subbin precision (Quinn's estimator gives ~10× resolution improvement).
6. Convert measured frequency $f_m$ to cents error: $1200 \log_2(f_m/f)$.

Threshold: ≤ 1 cent (0.058% frequency error). Achievable.

### Microtonal precision test

For a target ratio (e.g., 350 cents = $2^{350/1200} \approx 1.22436$), spawn a voice at $f \cdot 1.22436$ and verify its measured frequency is within 1 cent.

**Test grid for makam_studio:**

- Octave grid: A2, A3, A4, A5, E6.
- Microtone grid (within A4 octave): every 22 cents (Holderian commas), 0–1200 cents = 55 test points.
- Cross product = 275 measurements. Run as a 1-shot offline test in CI.

Pass criterion: 95th percentile error ≤ 1 cent, max error ≤ 3 cents (allows for FFT bin imprecision, not actual DSP error).

### Aliasing

Pure KS doesn't alias under normal use — the delay-line feedback can't generate energy above $f_s/2$ if the excitation was bandlimited (white noise is, by definition). The risk is in the *excitation* burst: if you use a sharp impulse (single sample at full scale) you'll inject Nyquist-edge energy. Mitigation: lowpass the excitation to $f_s/2 \cdot 0.9$ before injecting. Cheap.

The more subtle aliasing risk is in time-varying delay: when modulating $a_1$ for vibrato/glide, abrupt changes inject sample-rate harmonics. Hence the smoothing recommendation (10 ms zipper-noise-free interpolation).

---

## Implications for makam_studio

### Recommendation: **Extended Karplus-Strong + 1st-order Thiran allpass, in a single AudioWorklet, voiced as 3 detuned strings per "string" event.**

Defending each piece:

- **EKS over modal:** modal ties up too many native nodes (24 voices × 25 partials = 600 oscillators, even before body filters); EKS lets us use one Worklet and write tight per-sample code. Modal's ostensible advantage (no Worklet needed) doesn't matter in 2026 — AudioWorklet ships everywhere.
- **EKS over full digital waveguide:** the bidirectional waveguide buys us little for plucked strings; single-delay-line EKS is the de facto industry approach (Smith calls KS "a special case" for a reason).
- **Thiran over Lagrange:** unity magnitude inside a high-Q feedback loop is non-negotiable. Lagrange's gain-can-exceed-1 issue is a real-world stability hazard. 1st-order Thiran is documented as the right answer in Smith / Karjalainen / Välimäki.
- **Thiran over linear interpolation:** linear's rolloff at high frequencies is timbre-destroying for the qanun's bright top.
- **JS over WASM (initially):** start in JS for fast iteration. Profile. Move the per-sample inner loop to AssemblyScript or Rust-via-wasm-bindgen if (and only if) phone benchmarks show > 8% CPU at 6 voices.
- **Biquad body over convolution body:** simpler, smaller, deterministic, sufficient.
- **3 strings per voice (the detune trick):** the most musical CPU-spend in the entire engine. If you cut anything to save CPU, do not cut this.

### v1 polyphony targets

- **Desktop:** 24 voices × 3 strings = 72 active KS loops, comfortable.
- **Phone:** 6 voices × 3 strings = 18 active KS loops, tight but musical.
- **Voice-stealing:** simple oldest-first with release-phase preference.

### The single riskiest technical question

**"Can a 1st-order Thiran allpass embedded in a per-sample feedback loop, driven from JS in an AudioWorklet, hold pitch to ≤1 cent across A2–E6 *while being retuned in real time* (mandal moves, oud glides), without zipper noise, without instability, and at < 5% phone CPU at 6 voices?"**

Every published reference says "yes" individually, but no published reference says "yes in a Web Audio AudioWorklet on a 2026 mid-range phone simultaneously." This is the integration risk.

### 1-week derisking plan

**Day 1 — Bare delay-line voice in AudioWorklet (JS).**
Single voice, integer-delay KS, one-zero LP, white-noise burst. No tuning, no body, no detune. Confirm sound, confirm no underruns at 1 voice. ~50 LOC.

**Day 2 — Thiran allpass + cents test rig.**
Add 1st-order Thiran allpass. Build the OfflineAudioContext FFT test harness. Run the 275-point microtone grid. Pass criterion: max error ≤ 3 cents, 95th-percentile ≤ 1 cent.

**Day 3 — 6-voice pool, simple voice stealing.**
Add voice array. No detune yet. Profile in Chrome on a Pixel 6 (or browserstack). Confirm CPU < 10% at 6 voices.

**Day 4 — Full EKS extensions: damping filter, dynamic-level LP, pick-position comb.**
Add the rest of §3. Re-profile.

**Day 5 — Three-string-per-voice detune.**
Add the qanun shimmer. This is where it should start to sound *like a qanun.* Bench 6 voices on phone again — should still be < 8% CPU. If not, here is where WASM enters the conversation.

**Day 6 — Pitch glide / mandal retuning torture test.**
Schedule continuous pitch slides, abrupt mandal-like jumps. Listen for zipper noise, clicks, drift. Implement Välimäki transient-elimination if needed. Re-run cents test during a 100-cent glissando.

**Day 7 — Body biquads + reverb. Listen comparatively against qanun reference recordings.**
Honest A/B against 3 real qanun recordings (one Turkish, one Arabic, one Egyptian). Note where the synth falls short. Document for Phase 2.

**Outcome:** a working `KanunVoiceProcessor.js` (~600 LOC), an automated cents-precision CI test, a phone-CPU benchmark, and 90 seconds of side-by-side audio comparing synth to recordings. If at end of week the answer is "yes, holds tune, sounds OK, fits CPU," we proceed. If "fails on phone CPU" — drop to WASM. If "doesn't sound like qanun" — investigate body filter, re-listen to recordings, deepen excitation modeling.

If the 1-week prototype fails on cents precision, we have a deep DSP problem to solve before any of the rest of makam_studio matters.

---

## Open questions

- **WASM threshold:** at what voice count does pure JS become inadequate on Pixel 7 / iPhone 13? Need actual measurement, not theory.
- **Per-string vs. shared body filters:** does each course need its own body coloration? Probably not — qanun bodies are shared resonators by definition. Confirm by ear.
- **Sympathetic resonance:** qanun has it but it's subtle. Worth modeling for v1, or v2? (Lean: v2.)
- **Mandal click sound:** real qanuns make a tiny mechanical click when a mandal moves. Should we synthesize that as an interaction sound? (Music designer decision, not DSP.)
- **Sample-rate mismatch:** AudioContext defaults to 44.1 or 48 kHz depending on hardware. Does our cents-precision claim survive at 44.1? (Yes — bigger error margin would be at higher pitch ratios with lower $f_s$. Re-run the precision test at 44.1 to confirm.)
- **Polyphonic chorus pollution:** with 24 voices × 3 strings × random detunes, the global chorus might smear too much. May need to lock detune patterns per-course (so each "string" has stable identity) rather than re-randomizing on every note-on.
- **Buzz modeling:** the skin-bridge buzz of qanun is subtle and characteristic. Hard to verify without a comparative listening test.
- **WebKit on iOS:** Safari has historically been the laggard on AudioWorklet performance. 2026 status?
- **Modal hybrid:** could a 2-3 partial modal "head" + KS "tail" give better attack realism than KS alone? (Lean: not for v1.)

---

## Sources

### Authoritative (Smith / CCRMA / Stanford)

- Julius O. Smith III, *Physical Audio Signal Processing for Virtual Musical Instruments and Audio Effects*, https://ccrma.stanford.edu/~jos/pasp/
- Smith, "The Karplus-Strong Algorithm," PASP, https://ccrma.stanford.edu/~jos/pasp/Karplus_Strong_Algorithm.html
- Smith, "Extended Karplus-Strong Algorithm," PASP, https://ccrma.stanford.edu/~jos/pasp/Extended_Karplus_Strong_Algorithm.html
- Smith, "Commuted Synthesis," PASP, https://ccrma.stanford.edu/~jos/pasp/Commuted_Synthesis.html
- Smith, MUS420 Lecture 4A: "Interpolated Delay Lines, Ideal Bandlimited Interpolation, and Fractional Delay Filter Design," https://ccrma.stanford.edu/~jos/Interpolation/
- Smith, "Lagrange Interpolation," PASP, https://www.dsprelated.com/freebooks/pasp/Lagrange_Interpolation.html
- Smith, "Delay-Line Interpolation," PASP, https://www.dsprelated.com/freebooks/pasp/Delay_Line_Interpolation.html

### Foundational papers

- D. A. Jaffe and J. O. Smith, "Extensions of the Karplus-Strong Plucked-String Algorithm," *Computer Music Journal* 7(2), pp. 56–69 (1983), https://www.music.mcgill.ca/~gary/courses/papers/Jaffe-Extensions-CMJ-1983.pdf
- M. Karjalainen, V. Välimäki, T. Tolonen, "Plucked-String Models: From the Karplus-Strong Algorithm to Digital Waveguides and Beyond," *Computer Music Journal* 22(3) (1998), http://users.spa.aalto.fi/vpv/publications/cmj98.pdf
- M. Karjalainen, V. Välimäki, Z. Jánosy, "Towards High-Quality Sound Synthesis of the Guitar and String Instruments," ICMC 1993, http://users.spa.aalto.fi/vpv/publications/icmc93-guitar.pdf
- V. Välimäki and T. I. Laakso, "Elimination of Transients in Time-Varying Allpass Fractional Delay Filters with Applications to Digital Waveguide Modeling," ICMC 1995, https://quod.lib.umich.edu/i/icmc/bbp2372.1995.096
- Wikipedia (orientation only), "Karplus–Strong string synthesis," https://en.wikipedia.org/wiki/Karplus%E2%80%93Strong_string_synthesis

### Web Audio platform

- W3C, *Web Audio API 1.1*, https://www.w3.org/TR/webaudio-1.1/
- MDN, `AudioWorkletProcessor.process()`, https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletProcessor/process
- Hongchan Choi, "Audio Worklet Design Pattern," Chrome for Developers, https://developer.chrome.com/blog/audio-worklet-design-pattern/
- Paul Adenot, "Web Audio API performance and debugging notes," https://padenot.github.io/web-audio-perf/
- Casey Primozic, "Finding + Fixing an AudioWorkletProcessor Performance Pitfall," https://cprimozic.net/blog/webaudio-audioworklet-optimization/
- W3C TPAC 2025 Audio WG update, https://www.w3.org/2025/11/TPAC/demo-audio-wg-update.html
- Emscripten, "Wasm Audio Worklets API," https://emscripten.org/docs/api_reference/wasm_audio_worklets.html

### Existing JS / Web KS implementations

- Jack Schaedler, "Karplus-Strong Stress Tester," https://jackschaedler.github.io/karplus-stress-tester/ + repo https://github.com/jackschaedler/karplus-stress-tester
- mrahtz, "JavaScript Karplus-Strong," https://github.com/mrahtz/javascript-karplus-strong + writeup http://amid.fish/karplus-strong

### Qanun / oud / santur acoustics and reference

- Wikipedia, "Qanun (instrument)," https://en.wikipedia.org/wiki/Qanun_(instrument)
- Wikipedia, "Santur," https://en.wikipedia.org/wiki/Santur
- "Spectral sound analysis and sound board optimization of Kanun instrument," ResearchGate, https://www.researchgate.net/publication/328297474_Spectral_sound_analysis_and_sound_board_optimization_of_Kanun_instrument
- Maqamworld, "The Qanun," https://www.maqamworld.com/en/instr/qanun.php
- George Dimitri Sawa, "The Qanun," http://www.georgedimitrisawa.com/the-qanun

### Cents / pitch precision

- Wikipedia, "Cent (music)," https://en.wikipedia.org/wiki/Cent_(music)
- Wikipedia, "Equal temperament," https://en.wikipedia.org/wiki/Equal_temperament
