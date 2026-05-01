---
title: Synth + FX + UI Design
status: approved
date: 2026-05-01
supersedes: parts of the right "tweaks" panel layout
---

# Synth + FX + UI Design

A Moog-inspired top-mounted console replaces the right tweaks panel,
the master bus is rewired so effects actually process audio (and
can't feed back), and the qanun strings get a louder visual signal
about which one is playing.

## Why

Three things triggered this redesign:

1. The master bus is currently in a regression-fix state — effect
   modules are constructed but bypassed because the previous wiring
   produced a feedback loop. Users twiddle FX knobs and nothing
   happens.
2. The tweaks panel on the right has accumulated four collapsible
   sections (Machine / Filter / LFO / Tone) plus FX. The user reports
   it feels crowded.
3. The strings have a subtle 250ms saffron flash and a thin border on
   sustain, but in practice it's hard to see *which* string is
   sounding when several keys are involved or when a strum sweeps
   across rows.

The user asked for "a Moog kinda UI and synth arch." That phrase ties
the three things together: the Moog metaphor is hardware-with-signal-
flow-on-the-panel, which gives us both a layout (left-to-right, signal
flow visible) and a permission slip to redesign the controls in
hardware-synth idiom (knobs, modules, dividers, LEDs).

## Synth architecture

```
Per-voice (one of these per pluck or held note):

   OSC ──► VCF ──► VCA ──► bus
   (machine)  ▲     ▲
              │     │
        Filter ENV  Amp ADSR
              ▲     ▲
              │     │
        ┌─────┴─────┘
        │
       LFO1 ──► [pitch | cutoff | amp | off]
       LFO2 ──► [pitch | cutoff | amp | off]

Master bus (post-voice):

  voices ──► filter ──► overdrive ──► insertOut
                                          │
                          ┌───────────────┼───────────────┐
                          │               │               │
                          ▼               ▼               ▼
                  reverb.input    delay.input         masterMix
                          │               │               ▲
                  reverb.output   delay.output            │
                          │               │               │
                          └───────────────┴───────────────┘
                                          │
                                     masterMix (one-way return)
                                          │
                                          ▼
                                     masterVolume
                                          │
                                          ▼
                                       limiter
                                          │
                                          ▼
                                       analyser
                                          │
                                          ▼
                                     ctx.destination
```

### Audio-graph invariants

These become source comments so future changes can't break them
silently:

1. `reverb.output` and `delay.output` only connect to `masterMix`.
   They never reach `reverb.input`, `delay.input`, or each other's
   input.
2. `masterMix` is output-only downstream of itself — nothing in
   `masterVolume → limiter → analyser → destination` ever loops back.
3. `insertOut` taps reverb and delay sends in **parallel** (one
   connection from `insertOut` to each of: `reverb.input`,
   `delay.input`, `masterMix`). The dry signal reaches `masterMix`
   directly; the sends arrive separately.
4. The filter and overdrive insert modules are **always in path**.
   "Bypass" is the existing internal `mix → 0` (full dry). No mid-
   playback graph mutation.
5. The reverb and delay sends are **always wired** to `masterMix`.
   "Bypass" is the existing internal `wet → 0`. No mid-playback graph
   mutation.

### Limiter

`DynamicsCompressor` at the tail. Threshold `-3 dBFS`, ratio `20:1`,
attack `3 ms`, release `250 ms`, knee `0`. Brick-wall safety so a
pile-up during a strum can't blow eardrums.

### Per-machine config

Two layers per machine:

- **Universal layer** (every machine): octave offset (-2..+2), amp
  ADSR, filter (type / cutoff / q + env + amount), LFO1, LFO2,
  brightness, body.
- **Machine-specific layer**: each machine exposes a
  `params: ParamSpec[]` schema. The `OscModule` in the console reads
  this schema and auto-renders knobs (same pattern `FxControls`
  already uses for effects). Examples to add:
  - **qanun**: pluck-hardness, sympathetic-resonance
  - **vapor-pluck**: damping, noise-burst
  - **synthwave-saw**: unison-voices, detune, sub-level
  - **dream-pad**: detune, chorus-depth

The exact set per machine is tuned during Phase 1, prioritising knobs
that give the machine a distinct fingerprint over knobs that
overlap with the universal layer.

### LFO routing audit

Section 1 noted "LFO should work too." Each machine in
`audio/machines/*.ts` will be audited to confirm its LFO output
nodes are actually `connect()`-ed to their destination AudioParam
(pitch / cutoff / amp gain). Any dangling routes are bug fixes that
land in Phase 1 alongside the master-bus rewire.

## Layout

```
┌──────────────────────────────────────────────────────────┐
│ Header (slim — maqam name, karar, kbd hint)              │
├──────────────────────────────────────────────────────────┤
│ Console — top-mounted, collapsible                       │
│   COLLAPSED (default while playing, ~44px tall):         │
│     [▾ EXPAND]  machine: qanun  ▌▌▌▌▌▌  master ───●─    │
│   EXPANDED (~240px tall):                                │
│     OSC ▸ FILTER ▸ AMP ▸ MOD ▸ MASTER FX ▸ MASTER       │
├─────────┬────────────────────────────────────────────────┤
│ Maqam   │ Karar bar                                      │
│ Rail    │                                                │
│         │ Qanun instrument — full center width           │
│         │                                                │
└─────────┴────────────────────────────────────────────────┘
```

- Top-mounted console, full width, two states.
- Collapsed strip (~44px): machine name (read-only), output meter
  (tiny), master volume, expand button. No tiny knobs to misclick.
- Expanded (~240px): six modules in signal-flow order — OSC, FILTER,
  AMP, MOD, MASTER FX, MASTER.
- Toggle: **Tab** key, plus the on-screen button.
- The right `aside.tweaks` panel is removed entirely. Everything it
  held lives in the console.
- `MaqamRail` stays where it is (left). `karar-bar` stays in the main
  column above the strings.

## Modules

Six, left-to-right, signal flow on the left, master on the right:

```
┌──────────────────────────────────────────────────────────────────┐
│  OSC      │ FILTER    │ AMP    │ MOD       │ MASTER FX  │MASTER │
│  ─────    │ ───────   │ ────   │ ────────  │ ────────── │ ─────│
│  machine  │ type LP   │ A D    │ LFO1      │ filter ◯  │ vol ◯│
│  octave◯  │ cutoff ◯  │ S R    │  rate ◯  │ od     ◯  │ ▌▌▌▌│
│  bright◯  │ res    ◯  │ curve  │  shape▽  │ rev    ◯  │ meter │
│  body  ◯  │ env amt◯  │        │  dep   ◯ │ delay  ◯  │      │
│  m-spec◯  │ env A D S R│       │  dst   ▽ │           │      │
│           │           │        │ LFO2 (same)│         │      │
└──────────────────────────────────────────────────────────────────┘
   per-voice                              master bus
```

A subtle vertical divider sits between MOD and MASTER FX to mark the
voice → bus boundary.

### OSC

- machine selector (qanun / vapor-pluck / synthwave-saw / dream-pad)
- octave knob (-2..+2)
- brightness knob
- body knob
- voice-mode selector (`poly` / `legato`)
- glide knob (5..300 ms; only meaningful in legato mode)
- machine-specific knobs auto-rendered from `machine.params`

### FILTER

- type selector (LP / HP / BP)
- cutoff knob (log-scaled Hz)
- resonance knob
- env amount knob
- env A D S R as compact knobs

### AMP

- A D S R knobs
- inline envelope curve preview (existing component)

### MOD

- LFO1: rate, shape selector, depth, destination selector
- LFO2: same controls, stacked beneath

### MASTER FX

- Filter insert: type, cutoff, q, mix
- Overdrive insert: drive, tone, mix
- Reverb send: wet, size, decay
- Delay send: wet, time, feedback
- All four "always wired" — bypass = mix/wet → 0

### MASTER

- master volume knob
- output meter (large)
- audio-context resume button (when ctx is suspended)

## Legato voice mode

A keyboard-only voice mode toggle on the OSC module: **poly** (current
behavior — every key press creates a new voice) or **legato** (mono
voice + portamento glide).

### Legato semantics (model A — pure legato, no retrigger)

- **One voice at a time.** Keys press onto a stack (most-recent on
  top). The voice always sounds the topmost held key.
- **First key press in a held-group**: trigger fresh voice through
  `triggerMachineSustained`, full attack envelope, normal sustain.
- **Subsequent key presses while voice is sounding**: glide voice to
  the new pitch via `handle.setFrequency(hz, glideMs)`. **No envelope
  retrigger** — the amp envelope continues from sustain, no new
  attack. The string-index follows the topmost key.
- **Key release while others are still held**: pop from stack. If
  stack non-empty, glide voice to the new top. If stack empty, call
  `handle.release()` (ADSR R rings out as today).
- **`glideMs` knob** controls portamento time. Default 60 ms. Range
  5–300 ms.

### Mouse strum stays poly-style regardless of voiceMode

The drag-strum gesture (Phase 5) deliberately decouples each pointer-
over event into a discrete sustain. Legato is keyboard-only in v1 to
keep the gesture metaphors distinct (mizrap strum vs sliding melody).
A future revision may unify them.

### Modifier compatibility

- Carpma slides (held + modifier) operate on the active voice in both
  modes — in legato, that's just the one mono voice.
- Persistent-state mode-shift (no-held + modifier) operates on the
  last-plucked string regardless of voiceMode.
- J (canonical reset) works the same in both modes.

### Implementation

- New ref `monoVoiceRef: { handle, stringIndex, baseHz, currentHz,
  baseMandalIdx, currentMandalIdx } | null`
- New ref `monoStackRef: { code, stringIndex }[]`
- `startScaleNote` and `releaseScaleNote` branch on `voiceMode`
- Modifier slide / flip helpers operate on `heldNotesRef` (poly) OR
  `monoVoiceRef` (legato) — abstract behind a single iterator helper

## Visual style

### Palette

- **Console panel surface**: deep charcoal (~`#1a1614`) with a slight
  vertical brushed-metal gradient
- **Module backgrounds**: a hair lighter than the panel, with a 1px
  inset border so each module reads as a card on the panel
- **Knobs**: matte dark body with a single saffron indicator line from
  centre to perimeter; tiny dot detents around the rim
- **Labels**: existing brutalist sans, all-caps, very small, off-white
  at 70% opacity (silk-screen feel)
- **Numeric readouts**: monospace, saffron, tucked under each knob
- **Dividers**: hairline saffron vertical lines between modules with
  small ▸ arrows on top (signal-flow indicator)
- **Active states**: any knob whose param is actively modulated (e.g.
  cutoff with LFO depth > 0 routed to it) gets a slow saffron pulse on
  its indicator line
- **LEDs**: small filled circle, gray when off, saffron when on, with
  a small bloom

Saffron is the only accent. Everything else stays grayscale on
charcoal.

### Knob primitive

`Knob.tsx` — a reusable rotary used everywhere knobby in the console.

- Drag vertical (primary)
- Shift+drag — fine (10× lower sensitivity)
- Double-click — reset to default
- Scroll wheel over the knob — increment by step
- Sweep range -135° to +135° (270°), Moog/Eurorack standard
- Reads `min/max/default/unit/log` from `ParamSpec`, so machine-
  specific params auto-render

### Module shell

`ConsoleModule.tsx` — generic wrapper:

- Header row with small-caps title
- Body slot for knobs/sliders/selects
- Thin signal-flow arrow on the right edge connecting to the next
  module

### Typography

- Module titles: 10px, all-caps, wide letter-spacing
- Knob labels: 9px, all-caps
- Knob values: 11px, monospace, saffron
- Selectors: minimal text dropdowns, no chrome — just the value with a
  tiny ▾ on hover

## Active-string visual

Multi-layer indication, building on the current flash:

- **`PLAYING` lamp in each row's left gutter** (next to the mandal
  track):
  - off (gray) when idle
  - solid saffron when sustaining (key held, mouse held, or pinned-
    and-recently-plucked)
  - quick fade-out (~250ms) on a short pluck
- **Thicker row glow** while sustaining: `string-row--sustaining`
  border becomes 2-3px saffron left edge plus a soft outer glow
- **Perde name + cents readout** on the active row get a hair larger
  and brighter while sustaining
- **Pluck button**: the thin line inside briefly thickens + brightens
  on trigger (envelope-y feel)

Layers compose: a held mouse press shows lamp + thick glow + perde
emphasis; a quick keyboard tap shows a flashing lamp only.

## Drag-strum gesture

Drag across pluck buttons sweeps a strum, like a mizrap on a real
qanun:

- Pointer-down on a pluck button → start a sustained note (current
  behavior)
- While the pointer is over a button, that string sustains
- When the pointer leaves a button, that string releases — its amp
  ADSR's R phase rings out the decay tail
- When the pointer enters a new button, that string starts sustaining
- Lift pointer → release whatever's current
- Result: dragging across strings sounds like a strum because each
  release-tail rings under the next pluck

Implementation:

- Drop the per-button pointer-capture currently used by `StringRow`
- Hoist pointer handling to `QanunInstrument`
- On `pointermove`, hit-test with `document.elementFromPoint` to find
  the pluck button under the pointer
- The existing `ExternalNoteRegistry` already handles multi-note
  registration; this rides on it
- Edge case: dragging onto the mandal track or perde column does not
  trigger — only the pluck button half of the row counts as a "clicky
  bit"

Touch-friendly: PointerEvents unify mouse + touch, so a finger-drag
across the strings on a tablet feels identical.

## Output meter

- Horizontal bar
- 200ms peak-hold dot riding on a smoothly decaying RMS fill bar
- Saffron up to -6 dBFS, transitions to red between -6 and -3, hard
  clip lamp lights at 0
- Driven by `analyser.getByteTimeDomainData()` polled at 30fps via
  `requestAnimationFrame`
- Two render sizes from the same `useAnalyserLevel(analyser)` hook:
  large (in MASTER) and tiny (in the collapsed strip — bar only, no
  peak dot)

## Component decomposition

### New

```
app/src/synth/
  Console.tsx                  # top-mounted shell
  Knob.tsx                     # rotary primitive
  ConsoleModule.tsx            # generic module wrapper
  Meter.tsx                    # level meter (large + tiny variants)
  hooks/useAnalyserLevel.ts    # polls AnalyserNode, returns {rms, peak}
  modules/OscModule.tsx        # machine, octave, brightness, body, machine-specific
  modules/FilterModule.tsx     # type, cutoff, q, env, amount
  modules/AmpModule.tsx        # ADSR + curve preview
  modules/ModModule.tsx        # LFO1 + LFO2
  modules/FxModule.tsx         # filter / overdrive / reverb / delay
  modules/MasterModule.tsx     # master volume, meter, resume
```

### Removed

```
app/src/synth/SynthControls.tsx
app/src/synth/FxControls.tsx
```

### Modified

```
app/src/audio/master-bus.ts            # new topology, mix/wet bypass, no routing modes
app/src/audio/machines/*.ts            # LFO audit, machine-specific params
app/src/qanun/StringRow.tsx            # LED lamp, drop pointer-capture, gutter layout
app/src/qanun/QanunInstrument.tsx      # document-level pointer handler, hit-test, drag-strum
app/src/App.tsx                        # kill tweaks aside, mount Console at top
app/src/styles/istanbul-brutalist.css  # console + knob + meter + lamp styles
```

## Build sequence

Each phase ends in a commit. The app is shippable between phases.

### Phase 1 — Audio (UI unchanged)

1. Audit each machine's LFO wiring; fix any disconnected destinations
2. Add `params: ParamSpec[]` schema to each machine; thread per-
   machine values through the trigger functions
3. Rewire `master-bus.ts` to the no-feedback topology; bypass = mix /
   wet → 0; drop the `setRoutingMode` toggle
4. Smoke test: every existing slider in the current FxControls should
   now produce audible change

### Phase 2 — Console infrastructure (no audio changes)

1. `Knob.tsx` primitive (drag, shift-fine, dblclick-reset, scroll)
2. `ConsoleModule.tsx` wrapper
3. `useAnalyserLevel.ts` + `Meter.tsx`
4. `Console.tsx` shell with Tab toggle and collapsed strip

### Phase 3 — Modules (App still uses old SynthControls until phase 4)

1. `OscModule` first — exercises the machine-specific param plumbing
2. `FilterModule`, `AmpModule`, `ModModule`, `FxModule`, `MasterModule`

### Phase 4 — Layout rewire

1. Mount `Console` at top of `App.tsx`, wire all state
2. Delete `SynthControls.tsx`, `FxControls.tsx`, the right
   `aside.tweaks` JSX, the `tweaksOpen` state

### Phase 5 — Strings UX

1. LED lamp + thicker glow + perde emphasis in `StringRow.tsx`
2. Drop pointer-capture, move pointer handling to `QanunInstrument`
   with `elementFromPoint` hit-testing
3. Drag-strum: pointer-over-button = sustain, leave = release

### Phase 6 — Polish

1. Visual style pass on the console (palette tokens, dividers,
   signal-flow arrows, knob detents)
2. Active-modulation pulse on knob indicator when LFO depth > 0 routes
   to that param
3. Touch verification on tablet form factor

## Risks + mitigations

- **Phase 1 master-bus rewire is the highest-risk change**. The
  limiter at the tail is the main safety net; smoke testing with the
  current UI before any layout disruption catches problems early.
- **Phase 5 pointer refactor risks regressing keyboard-mouse parity**.
  The `ExternalNoteRegistry` already abstracts shared note state, so
  the keyboard path stays untouched. The risk is contained to the
  mouse / touch surface.
- **Phase 3 can leak state if module props aren't lifted carefully**.
  Mitigation: keep `MachineConfig` map in `App.tsx` exactly as today,
  pass into modules instead of `SynthControls`.

## Out of scope

- Routing modes for sends (the previous `parallel | series` toggle is
  dropped; only parallel ships)
- Real disconnect-style bypass for inserts (always-in-path with mix=0
  is sufficient)
- Per-string envelope-amplitude scaling on the playing lamp
  (brightness modulation by envelope phase) — v2 polish
- Mobile layout ergonomics beyond touch-input parity (small screens
  may still need the right panel back as a separate work item)
