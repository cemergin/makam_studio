# Synth + FX + UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewire the master bus so effects actually process audio (no feedback), replace the right tweaks panel with a top-mounted Moog-style console of six modules, and give the qanun strings a clearer "now playing" indicator plus a drag-strum gesture.

**Architecture:** Audio path is voice → `[filter insert] → [overdrive insert] → tap`, with reverb and delay as parallel sends to a one-way return bus, then master volume → limiter → analyser → destination. UI restructures into a horizontal console at the top with six modules in signal-flow order (OSC → FILTER → AMP → MOD → MASTER FX → MASTER), collapsible to a slim strip during play. Strings get an LED gutter lamp and pointer-driven strum.

**Tech Stack:** React 19, Vite 8, TypeScript, Web Audio API, Vitest with `OfflineAudioContext` (skipped in happy-dom env), Bun for package + CI. PointerEvents for unified mouse + touch.

**Spec:** `docs/spec/2026-05-01-synth-fx-ui-design.md`

---

## File Structure

### New files

```
app/src/synth/
  Console.tsx                    # top-mounted shell with collapsed/expanded states
  Knob.tsx                       # rotary knob primitive (drag, shift-fine, dblclick-reset, scroll)
  ConsoleModule.tsx              # generic wrapper: header + body + signal-flow arrow
  Meter.tsx                      # output level meter (large + tiny variants)
  hooks/useAnalyserLevel.ts      # AnalyserNode polling, returns {rms, peak}
  modules/OscModule.tsx          # machine + octave + brightness + body + machine-specific
  modules/FilterModule.tsx       # type, cutoff, q, env amount, env A D S R
  modules/AmpModule.tsx          # ADSR + curve preview
  modules/ModModule.tsx          # LFO1 + LFO2 (rate, shape, depth, destination each)
  modules/FxModule.tsx           # filter / overdrive / reverb / delay
  modules/MasterModule.tsx       # master volume + meter + audio resume
```

### Modified

```
app/src/audio/master-bus.ts                          # new no-feedback topology
app/src/audio/__tests__/master-bus.test.ts           # update for new API + topology
app/src/audio/machines/_machine-config.ts            # add ParamSpec re-export
app/src/audio/machines/index.ts                      # add params() per machine + octave
app/src/audio/machines/qanun-machine.ts (or path)    # add machine-specific params
app/src/audio/machines/vapor-pluck.ts                # same
app/src/audio/machines/synthwave-saw.ts              # same
app/src/audio/machines/dream-pad.ts                  # same
app/src/qanun/StringRow.tsx                          # LED lamp, drop pointer-capture
app/src/qanun/QanunInstrument.tsx                    # document-level pointer for drag-strum
app/src/qanun/__tests__/string-hit-test.test.ts      # NEW (hit-test logic)
app/src/App.tsx                                      # mount Console at top, kill tweaks aside
app/src/styles/istanbul-brutalist.css                # console + knob + meter + lamp styles
```

### Removed

```
app/src/synth/SynthControls.tsx
app/src/synth/FxControls.tsx
```

---

## Phase 1 — Audio (UI unchanged, verify with existing knobs)

### Task 1.1: Verify (or fix) per-machine LFO routing

**Why:** User reports "the LFO should work too." Before changing anything, write a test that drives an LFO through each machine and confirms modulation reaches the destination param. If a machine's wiring is broken, the test fails and we fix it.

**Files:**
- Create: `app/src/audio/machines/__tests__/lfo-routing.test.ts`

- [ ] **Step 1: Write the LFO routing test**

```ts
// app/src/audio/machines/__tests__/lfo-routing.test.ts
//
// Smoke test for LFO modulation. Drive each sustained machine with a
// 4 Hz LFO routed to amp at depth=1; render 1s; the RMS computed in
// 100ms windows must vary across the second (tremolo creates a
// time-varying envelope). If the LFO is dangling, RMS is constant.

import { describe, expect, it } from 'vitest';
import { triggerMachineSustained, MACHINES, type LfoConfig } from '../index';

const HAS_OAC = typeof globalThis.OfflineAudioContext !== 'undefined';
const TREMOLO_LFO: LfoConfig = { rate: 4, shape: 'sine', depth: 1, destination: 'amp' };

function rmsWindows(data: Float32Array, windowMs: number, sampleRate: number): number[] {
  const n = Math.floor((windowMs / 1000) * sampleRate);
  const out: number[] = [];
  for (let i = 0; i + n <= data.length; i += n) {
    let sumSq = 0;
    for (let j = 0; j < n; j++) sumSq += data[i + j] * data[i + j];
    out.push(Math.sqrt(sumSq / n));
  }
  return out;
}

describe('LFO routing — amp destination causes tremolo', () => {
  for (const m of MACHINES) {
    it.skipIf(!HAS_OAC)(`${m.id}: amp LFO produces time-varying RMS`, async () => {
      const sampleRate = 44_100;
      const ctx = new OfflineAudioContext(1, sampleRate, sampleRate);
      const handle = triggerMachineSustained(m.id, {
        audioContext: ctx as unknown as AudioContext,
        destination: ctx.destination,
        frequencyHz: 440,
        velocity: 1.0,
        brightness: 0.6,
        body: 0.3,
        adsr: { a: 0.005, d: 0.05, s: 0.9, r: 0.2 },
        lfo1: TREMOLO_LFO,
      });
      const buf = await ctx.startRendering();
      handle.release();
      const data = buf.getChannelData(0);
      const windows = rmsWindows(data, 100, sampleRate);
      const min = Math.min(...windows);
      const max = Math.max(...windows);
      // 4 Hz tremolo at depth 1 should make windowed RMS vary by at least 20%.
      expect(max - min, `${m.id} tremolo range`).toBeGreaterThan(min * 0.2);
    });
  }
});
```

- [ ] **Step 2: Run test to see which machines pass**

Run: `bun run test app/src/audio/machines/__tests__/lfo-routing.test.ts`
Expected: skipped if no OfflineAudioContext, otherwise either passes (LFO works) or fails (broken).

- [ ] **Step 3: If a machine fails, fix the wiring**

Inspect the failing machine's `triggerXSustained` function. Look for `attachLfos({...})` — confirm `ampEnv` (the gain node feeding output) is passed correctly and that the destination switch covers `'amp'`. The shared helper at `app/src/audio/machines/_machine-config.ts:114` already implements all three destinations correctly, so a failure means a machine isn't calling it (or is passing the wrong target).

- [ ] **Step 4: Re-run; all machines pass**

Run: `bun run test app/src/audio/machines/__tests__/lfo-routing.test.ts`
Expected: PASS for every machine, or skipped uniformly.

- [ ] **Step 5: Commit**

```bash
git add app/src/audio/machines/__tests__/lfo-routing.test.ts \
        app/src/audio/machines/
git commit -m "Verify LFO routing per machine + smoke test"
```

---

### Task 1.2: Add `ParamSpec` schema per machine + thread per-machine values

**Why:** The OscModule auto-renders machine-specific knobs from `machine.params`. We need each machine to expose its schema and accept those values in its trigger function. This task adds the schema + plumbing without changing audible behavior (defaults stay current).

**Files:**
- Modify: `app/src/audio/machines/qanun-machine.ts`
- Modify: `app/src/audio/machines/vapor-pluck.ts`
- Modify: `app/src/audio/machines/synthwave-saw.ts`
- Modify: `app/src/audio/machines/dream-pad.ts`
- Modify: `app/src/audio/machines/index.ts`

- [ ] **Step 1: Re-export `ParamSpec` from machines barrel**

In `app/src/audio/machines/index.ts`, after the existing type exports add:

```ts
export type { ParamSpec } from '../../_core/audio';
```

- [ ] **Step 2: Add a `MachineParams` map keyed by `MachineId`**

In `app/src/audio/machines/index.ts`, add:

```ts
import type { ParamSpec } from '../../_core/audio';

/** Per-machine extra params (the "make each machine special" layer).
 *  OscModule reads from this map to render machine-specific knobs.
 *  Each machine reads its own values from the corresponding key on
 *  MachineTrigger.params (a Record<string, number>). */
export const MACHINE_PARAMS: Record<MachineId, readonly ParamSpec[]> = {
  'qanun': [
    { name: 'pluck',     kind: 'continuous', min: 0, max: 1, default: 0.5, unit: '' },
    { name: 'sympathy',  kind: 'continuous', min: 0, max: 1, default: 0.3, unit: '' },
  ],
  'vapor-pluck': [
    { name: 'damping',   kind: 'continuous', min: 0, max: 1, default: 0.5, unit: '' },
    { name: 'noise',     kind: 'continuous', min: 0, max: 1, default: 0.2, unit: '' },
  ],
  'synthwave-saw': [
    { name: 'unison',    kind: 'discrete',   options: ['1','3','5','7'], default: '3', unit: 'voices' },
    { name: 'detune',    kind: 'continuous', min: 0, max: 30, default: 8, unit: '¢' },
    { name: 'sub',       kind: 'continuous', min: 0, max: 1, default: 0.3, unit: '' },
  ],
  'dream-pad': [
    { name: 'detune',    kind: 'continuous', min: 0, max: 40, default: 12, unit: '¢' },
    { name: 'chorus',    kind: 'continuous', min: 0, max: 1, default: 0.4, unit: '' },
  ],
};

export type MachineParamValues = Record<string, number | string>;
```

- [ ] **Step 3: Extend `MachineTrigger` interface with `params` and `octaveOffset`**

In `app/src/audio/machines/index.ts`, modify the `MachineTrigger` interface:

```ts
export interface MachineTrigger {
  audioContext: AudioContext;
  destination: AudioNode;
  frequencyHz: number;
  velocity?: number;
  time?: number;
  brightness?: number;
  decay?: number;
  body?: number;
  filter?: FilterConfig;
  filterEnv?: FilterEnv;
  lfo1?: LfoConfig;
  lfo2?: LfoConfig;
  /** Octave offset (-2..+2). Multiplies frequencyHz by 2^octaveOffset. */
  octaveOffset?: number;
  /** Machine-specific params keyed by ParamSpec.name from MACHINE_PARAMS. */
  params?: MachineParamValues;
}
```

- [ ] **Step 4: Apply octaveOffset in dispatch**

In both `triggerMachine` and `triggerMachineSustained`, before delegating, derive the effective frequency:

```ts
function applyOctave(t: MachineTrigger): MachineTrigger {
  const off = t.octaveOffset ?? 0;
  if (off === 0) return t;
  return { ...t, frequencyHz: t.frequencyHz * Math.pow(2, off) };
}

export function triggerMachine(machineId: MachineId, t: MachineTrigger & { adsr?: ADSR }): void {
  const tt = applyOctave(t);
  switch (machineId) {
    case 'qanun':         triggerQanun(tt); return;
    case 'vapor-pluck':   triggerVaporPluck(tt); return;
    case 'synthwave-saw': triggerSynthwaveSaw(tt); return;
    case 'dream-pad':     triggerDreamPad(tt); return;
    default: {
      const _exhaustive: never = machineId;
      throw new Error(`Unknown machineId: ${String(_exhaustive)}`);
    }
  }
}

// Same for triggerMachineSustained:
export function triggerMachineSustained(machineId: MachineId, t: MachineTrigger & { adsr?: ADSR }): MachineHandle {
  const tt = applyOctave(t);
  switch (machineId) {
    case 'qanun':         return triggerQanunSustained(tt);
    case 'vapor-pluck':   return triggerVaporPluckSustained(tt);
    case 'synthwave-saw': return triggerSynthwaveSawSustained(tt);
    case 'dream-pad':     return triggerDreamPadSustained(tt);
    default: {
      const _exhaustive: never = machineId;
      throw new Error(`Unknown machineId: ${String(_exhaustive)}`);
    }
  }
}
```

- [ ] **Step 5: Wire each machine to read its params (one machine per substep)**

For each of the four machine files, accept the new fields in the trigger interface (`params?: MachineParamValues; octaveOffset?: number;`), and use them where reasonable. **Octave is already applied in dispatch** so machines do not handle it. **Machine-specific params are best-effort wiring**: if a knob doesn't have an obvious effect yet, leave a `// TODO: params.X currently unused — see plan task 1.2` comment so we can come back. The schema being present is what unblocks Phase 3's UI.

For `qanun-machine.ts`, hook `params.pluck` to the attack hardness (multiply `adsr.a` by `(1 - pluck * 0.9)`) and `params.sympathy` to a small extra body multiplier. For `vapor-pluck.ts`, `params.damping` scales the filter Q (multiply by `0.5 + damping * 1.5`); `params.noise` adds a brief noise burst gain at attack time. For `synthwave-saw.ts`, `params.unison` controls the saw count (parse from string), `params.detune` replaces the hardcoded `±8` cents, `params.sub` controls a sub-oscillator gain. For `dream-pad.ts`, `params.detune` and `params.chorus` control existing modulation depth.

If you can't wire a param without significant audio rework, leave it as a stored-but-unused `// TODO` for now. The UI surface is what we need this task to unblock.

- [ ] **Step 6: Build + run all tests**

Run:
```bash
cd app && bun run build && bun run test
```
Expected: type-check passes, build succeeds, no test regressions.

- [ ] **Step 7: Commit**

```bash
git add app/src/audio/machines/
git commit -m "Add per-machine ParamSpec schema + octave + machine-specific values"
```

---

### Task 1.3: Rewire `master-bus.ts` to no-feedback topology

**Why:** Effects are currently bypassed (constructed but disconnected from the audio path). Rewire them in with the topology defined in the spec — filter/overdrive as inserts, reverb/delay as parallel sends to a one-way return bus.

**Files:**
- Modify: `app/src/audio/master-bus.ts`

- [ ] **Step 1: Replace `master-bus.ts` with the new topology**

```ts
// app/src/audio/master-bus.ts
//
// Master FX bus — voices in, master out.
//
// Topology (no feedback paths possible):
//
//   busInput → filter.input → overdrive.input ─► insertOut
//                                                   │
//                              ┌────────────────────┼─────────────────┐
//                              │                    │                 │
//                              ▼                    ▼                 ▼
//                       reverb.input         delay.input          masterMix
//                              │                    │                 ▲
//                       reverb.output        delay.output             │
//                              │                    │                 │
//                              └────────────────────┴─────────────────┘
//                                                   │
//                                              masterMix (one-way return)
//                                                   │
//                                                   ▼
//                                              masterVolume
//                                                   │
//                                                   ▼
//                                              limiter (-3 dBFS, 20:1)
//                                                   │
//                                                   ▼
//                                              analyser
//                                                   │
//                                                   ▼
//                                            ctx.destination
//
// Invariants (DO NOT BREAK):
//
//   1. reverb.output and delay.output ONLY connect to masterMix.
//   2. masterMix is downstream-only — nothing in masterVolume → limiter
//      → analyser → destination ever loops back into a send.
//   3. Filter + overdrive inserts are always in path; bypass = mix → 0.
//   4. Reverb + delay sends are always wired to masterMix; bypass = wet → 0.
//   5. Routing modes are not supported in v1 (parallel only).

import {
  createDelayFx,
  createFilter,
  createOverdrive,
  createReverb,
  type ControllableModule,
} from '../_core/audio';

export type FxKey = 'filter' | 'overdrive' | 'reverb' | 'delay';

export interface MasterBus {
  input: AudioNode;
  effects: Record<FxKey, ControllableModule>;
  setFxParam(fx: FxKey, name: string, value: number | string): void;
  /** Bypass = set the module's internal mix (filter/overdrive) or wet
   *  (reverb/delay) to 0. No graph mutation. */
  setFxBypass(fx: FxKey, bypass: boolean): void;
  setMasterVolume(v: number): void;
  analyser: AnalyserNode;
  dispose(): void;
}

export function createMasterBus(ctx: AudioContext): MasterBus {
  const filter    = createFilter(ctx,    { mode: 'lp', cutoff: 8000, q: 0.7, mix: 0.0 });
  const overdrive = createOverdrive(ctx, { drive: 0.0, tone: 5000, mix: 0.0 });
  const reverb    = createReverb(ctx,    { wet: 0.0, size: 2.0, decay: 2.5 });
  const delay     = createDelayFx(ctx,   { wet: 0.0, time: 0.25, feedback: 0.3 });

  const input        = ctx.createGain();   input.gain.value = 1;
  const masterMix    = ctx.createGain();   masterMix.gain.value = 1;
  const masterVolume = ctx.createGain();   masterVolume.gain.value = 0.6;

  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -3;
  limiter.ratio.value     = 20;
  limiter.attack.value    = 0.003;
  limiter.release.value   = 0.25;
  limiter.knee.value      = 0;

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;

  // Inserts in series: input → filter → overdrive → insertOut
  input.connect(filter.input);
  filter.output.connect(overdrive.input);
  // overdrive.output is the "insertOut" tap — branches three ways:
  overdrive.output.connect(masterMix);     // dry
  overdrive.output.connect(reverb.input);  // reverb send
  overdrive.output.connect(delay.input);   // delay send

  // Send returns — ONE-WAY into masterMix only:
  reverb.output.connect(masterMix);
  delay.output.connect(masterMix);

  // Master tail
  masterMix.connect(masterVolume);
  masterVolume.connect(limiter);
  limiter.connect(analyser);
  analyser.connect(ctx.destination);

  const effects: Record<FxKey, ControllableModule> = { filter, overdrive, reverb, delay };

  /** Each module's "off" param + the value it represents when bypassed.
   *  Used by setFxBypass to set/restore. */
  const BYPASS_PARAM: Record<FxKey, string> = {
    filter:    'mix',
    overdrive: 'mix',
    reverb:    'wet',
    delay:     'wet',
  };
  const lastValue: Record<FxKey, number> = {
    filter: 0, overdrive: 0, reverb: 0, delay: 0,
  };
  const bypassed: Record<FxKey, boolean> = {
    filter: true, overdrive: true, reverb: true, delay: true,
  };

  return {
    input,
    effects,
    analyser,
    setFxParam(fx, name, value) {
      effects[fx]?.set(name, value);
      // Track the last user-set bypass-param value so toggling bypass
      // off restores it.
      if (name === BYPASS_PARAM[fx] && typeof value === 'number' && !bypassed[fx]) {
        lastValue[fx] = value;
      }
    },
    setFxBypass(fx, bypass) {
      bypassed[fx] = bypass;
      if (bypass) {
        // Snapshot current bypass-param value, then ramp to 0.
        // (Modules expose their current via .get() in some forks; we
        // remember it via setFxParam interception above.)
        effects[fx]?.set(BYPASS_PARAM[fx], 0);
      } else {
        effects[fx]?.set(BYPASS_PARAM[fx], lastValue[fx] || 0.5);
      }
    },
    setMasterVolume(v) {
      masterVolume.gain.value = Math.max(0, Math.min(1, v));
    },
    dispose() {
      for (const n of [input, masterMix, masterVolume, limiter, analyser]) {
        try { n.disconnect(); } catch { /* idempotent */ }
      }
      filter.dispose();
      overdrive.dispose();
      reverb.dispose();
      delay.dispose();
    },
  };
}
```

- [ ] **Step 2: Type-check**

Run:
```bash
cd app && bunx tsc --noEmit
```
Expected: no errors except possibly in `master-bus.test.ts` (which uses removed `setRoutingMode` — fixed in Task 1.4) and `App.tsx` (uses old fields — touched later but should still compile because the public interface is a subset).

If there are compile errors in callers, that's the test file calling `setRoutingMode`. Note them; fix in next task.

- [ ] **Step 3: Commit**

```bash
git add app/src/audio/master-bus.ts
git commit -m "Rewire master bus: inserts in series, sends in parallel, no feedback"
```

---

### Task 1.4: Update `master-bus.test.ts` for the new API + topology

**Why:** Tests reference `setRoutingMode` which no longer exists, and assert behavior that the new topology preserves but tests express differently.

**Files:**
- Modify: `app/src/audio/__tests__/master-bus.test.ts`

- [ ] **Step 1: Replace the test file**

```ts
// app/src/audio/__tests__/master-bus.test.ts
//
// Master-bus topology verification.
//
// CRITICAL: with reverb wet, delay wet, and delay feedback all maxed,
// the limiter must keep the output below digital full-scale. The
// pre-rewrite topology let returns feed back into sends (almost blew
// the user's ears out); the current topology has reverb.output and
// delay.output going only to masterMix, never back into themselves
// or each other.

import { describe, expect, it } from 'vitest';
import { createMasterBus } from '../master-bus';

const HAS_OAC = typeof globalThis.OfflineAudioContext !== 'undefined';

if (!HAS_OAC) {
  // eslint-disable-next-line no-console
  console.log('[master-bus.test] OfflineAudioContext unavailable — skipping engine-level tests.');
}

interface RenderResult { peakAbs: number; rms: number; }

async function renderAt(
  setup: (ctx: OfflineAudioContext) => void,
  durationSec = 1.0,
  sampleRate = 44_100,
): Promise<RenderResult> {
  const ctx = new OfflineAudioContext(1, Math.floor(durationSec * sampleRate), sampleRate);
  setup(ctx);
  const buf = await ctx.startRendering();
  const data = buf.getChannelData(0);
  let peak = 0, sumSq = 0;
  for (let i = 0; i < data.length; i++) {
    const a = Math.abs(data[i]);
    if (a > peak) peak = a;
    sumSq += data[i] * data[i];
  }
  return { peakAbs: peak, rms: Math.sqrt(sumSq / data.length) };
}

describe('createMasterBus', () => {
  it.skipIf(!HAS_OAC)('exposes the public surface', () => {
    const ctx = new OfflineAudioContext(1, 256, 44_100);
    const bus = createMasterBus(ctx as unknown as AudioContext);
    expect(bus.input).toBeDefined();
    expect(bus.effects.filter).toBeDefined();
    expect(bus.effects.overdrive).toBeDefined();
    expect(bus.effects.reverb).toBeDefined();
    expect(bus.effects.delay).toBeDefined();
    expect(typeof bus.setFxParam).toBe('function');
    expect(typeof bus.setFxBypass).toBe('function');
    expect(typeof bus.setMasterVolume).toBe('function');
    expect(bus.analyser).toBeDefined();
    bus.dispose();
  });

  it.skipIf(!HAS_OAC)('does not produce unbounded output with reverb + delay both fully wet', async () => {
    const result = await renderAt((ctx) => {
      const bus = createMasterBus(ctx as unknown as AudioContext);
      bus.setFxBypass('filter', true);
      bus.setFxBypass('overdrive', true);
      bus.setFxBypass('reverb', false);
      bus.setFxBypass('delay', false);
      bus.setFxParam('reverb', 'wet', 1);
      bus.setFxParam('delay', 'wet', 1);
      bus.setFxParam('delay', 'feedback', 0.7);
      bus.setMasterVolume(0.8);

      const osc = ctx.createOscillator();
      osc.frequency.value = 220;
      const amp = ctx.createGain();
      amp.gain.value = 0.5;
      osc.connect(amp);
      amp.connect(bus.input);
      osc.start(0);
      osc.stop(1.0);
    }, 1.0);

    expect(result.peakAbs).toBeLessThan(1.0);
  });

  it.skipIf(!HAS_OAC)('reverb send rings out after source stops (parallel send working)', async () => {
    const result = await renderAt((ctx) => {
      const bus = createMasterBus(ctx as unknown as AudioContext);
      bus.setFxBypass('filter', true);
      bus.setFxBypass('overdrive', true);
      bus.setFxBypass('reverb', false);
      bus.setFxBypass('delay', true);
      bus.setFxParam('reverb', 'wet', 1);
      bus.setMasterVolume(0.8);

      const osc = ctx.createOscillator();
      osc.frequency.value = 220;
      const amp = ctx.createGain();
      amp.gain.value = 0.3;
      osc.connect(amp);
      amp.connect(bus.input);
      osc.start(0);
      osc.stop(0.5);
    }, 1.0);

    // After source stops at 0.5s, reverb tail must still produce signal.
    expect(result.rms).toBeGreaterThan(0.001);
    expect(result.peakAbs).toBeLessThan(1.0);
  });

  it.skipIf(!HAS_OAC)('all FX bypassed: dry signal still reaches the master', async () => {
    const result = await renderAt((ctx) => {
      const bus = createMasterBus(ctx as unknown as AudioContext);
      bus.setFxBypass('filter', true);
      bus.setFxBypass('overdrive', true);
      bus.setFxBypass('reverb', true);
      bus.setFxBypass('delay', true);
      bus.setMasterVolume(1.0);

      const osc = ctx.createOscillator();
      osc.frequency.value = 220;
      const amp = ctx.createGain();
      amp.gain.value = 0.3;
      osc.connect(amp);
      amp.connect(bus.input);
      osc.start(0);
      osc.stop(0.5);
    }, 0.5);

    expect(result.rms).toBeGreaterThan(0.001);
    expect(result.peakAbs).toBeLessThan(1.0);
  });

  it.skipIf(!HAS_OAC)('overdrive insert: drive > 0 distorts the signal', async () => {
    // With overdrive un-bypassed at high mix + drive, the output spectrum
    // should have more harmonic content than the dry signal. We sample
    // RMS as a proxy — distortion adds energy in the harmonic series.
    const result = await renderAt((ctx) => {
      const bus = createMasterBus(ctx as unknown as AudioContext);
      bus.setFxBypass('filter', true);
      bus.setFxBypass('reverb', true);
      bus.setFxBypass('delay', true);
      bus.setFxBypass('overdrive', false);
      bus.setFxParam('overdrive', 'drive', 0.9);
      bus.setFxParam('overdrive', 'mix', 1.0);
      bus.setMasterVolume(0.6);

      const osc = ctx.createOscillator();
      osc.frequency.value = 220;
      const amp = ctx.createGain();
      amp.gain.value = 0.3;
      osc.connect(amp);
      amp.connect(bus.input);
      osc.start(0);
      osc.stop(0.5);
    }, 0.5);

    expect(result.rms).toBeGreaterThan(0.001);
    expect(result.peakAbs).toBeLessThan(1.0);
  });
});
```

- [ ] **Step 2: Run the test**

Run:
```bash
cd app && bun run test app/src/audio/__tests__/master-bus.test.ts
```
Expected: PASS (or skipped uniformly if `OfflineAudioContext` isn't available in the env).

- [ ] **Step 3: Run the entire test suite + build**

Run:
```bash
cd app && bun run test && bun run build
```
Expected: all tests pass, build succeeds. Note the bundle size (compare to last commit — should be marginally smaller because routing-mode code is gone).

- [ ] **Step 4: Manual smoke test**

```bash
cd app && bun run dev
```

In the browser:
1. Click the maqam → strings appear
2. Press a scale key (e.g. `A` for karar). Hear sound through the chain.
3. In FxControls panel: enable reverb → wet to ~0.6 → notes should now have audible reverb tail.
4. Toggle delay on → wet ~0.5 → audible echoes.
5. Drive overdrive mix to 1, drive to 0.7 → distortion present.
6. Crank reverb wet to 1, delay wet to 1, delay feedback to 0.9, hold a note → tail rings, but never explodes (limiter holds the peak).

Document any anomalies. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/src/audio/__tests__/master-bus.test.ts
git commit -m "master-bus tests: drop routing modes, verify new topology"
```

---

## Phase 2 — Console infrastructure (no audio changes)

### Task 2.1: `Knob.tsx` rotary primitive

**Files:**
- Create: `app/src/synth/Knob.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/src/synth/Knob.tsx
//
// Rotary knob primitive. Drives any numeric param. Used everywhere
// knobby in the console (machine octave, filter cutoff, ADSR knobs,
// LFO depth, reverb wet, etc.).
//
// Interactions:
//   - Drag vertical (primary): pixel→value, sensitivity scales with range
//   - Shift+drag: 10× lower sensitivity (fine adjust)
//   - Double-click: reset to default
//   - Scroll wheel over knob: increment by step
//
// Visual:
//   - 270° sweep (-135° at min, +135° at max), Moog/Eurorack standard
//   - Saffron indicator line from centre to perimeter
//   - Optional log scaling (cutoff Hz wants this)
//   - Active class when value != default
//
// Keyboard: tab-focusable; arrow keys nudge by step.

import { useCallback, useEffect, useRef, useState } from 'react';

export interface KnobProps {
  value: number;
  min: number;
  max: number;
  defaultValue?: number;
  step?: number;
  log?: boolean;        // log scaling (cutoff Hz)
  label?: string;
  unit?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  /** Whether the param is being modulated (e.g. LFO active on this dest). */
  modulated?: boolean;
  size?: number;        // px; default 44
}

const SWEEP_DEG = 270;
const MIN_DEG = -135;

function lin01(v: number, min: number, max: number, log: boolean): number {
  if (!log) return (v - min) / (max - min);
  const lo = Math.log(Math.max(1e-6, min));
  const hi = Math.log(Math.max(1e-6, max));
  return (Math.log(Math.max(1e-6, v)) - lo) / (hi - lo);
}
function from01(t: number, min: number, max: number, log: boolean): number {
  const u = Math.max(0, Math.min(1, t));
  if (!log) return min + u * (max - min);
  const lo = Math.log(Math.max(1e-6, min));
  const hi = Math.log(Math.max(1e-6, max));
  return Math.exp(lo + u * (hi - lo));
}

export function Knob({
  value, min, max, defaultValue = min, step,
  log = false, label, unit = '', format,
  onChange, modulated = false, size = 44,
}: KnobProps) {
  const elRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<{ startY: number; startVal: number; fine: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  const norm = lin01(value, min, max, log);
  const angle = MIN_DEG + norm * SWEEP_DEG;

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { startY: e.clientY, startVal: value, fine: e.shiftKey };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = d.startY - e.clientY;            // up = increase
    const sens = (d.fine || e.shiftKey) ? 0.001 : 0.01;
    const startNorm = lin01(d.startVal, min, max, log);
    const next = from01(startNorm + dy * sens, min, max, log);
    const clamped = Math.max(min, Math.min(max, next));
    const stepped = step ? Math.round(clamped / step) * step : clamped;
    if (stepped !== value) onChange(stepped);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    setDragging(false);
  };
  const onDoubleClick = () => onChange(defaultValue);
  const onWheel = useCallback((e: WheelEvent) => {
    if (document.activeElement !== elRef.current) return;
    e.preventDefault();
    const sgn = e.deltaY < 0 ? 1 : -1;
    const s = step ?? (max - min) / 200;
    const next = Math.max(min, Math.min(max, value + sgn * s));
    onChange(next);
  }, [value, min, max, step, onChange]);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const s = step ?? (max - min) / 100;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight')   { e.preventDefault(); onChange(Math.min(max, value + s)); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft')  { e.preventDefault(); onChange(Math.max(min, value - s)); }
  };

  const display = format ? format(value) : value.toFixed(unit === 'Hz' || unit === '¢' ? 0 : 2) + unit;

  return (
    <div className="knob" style={{ width: size }}>
      {label && <div className="knob__label">{label}</div>}
      <button
        ref={elRef}
        type="button"
        className={`knob__face ${dragging ? 'knob__face--dragging' : ''} ${modulated ? 'knob__face--modulated' : ''}`}
        style={{ width: size, height: size }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
        aria-label={label ?? 'knob'}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        role="slider"
      >
        <div className="knob__indicator" style={{ transform: `rotate(${angle}deg)` }} />
      </button>
      <div className="knob__value">{display}</div>
    </div>
  );
}
```

- [ ] **Step 2: Add base styles**

Append to `app/src/styles/istanbul-brutalist.css`:

```css
/* Knob primitive */
.knob {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-family: var(--font-sans, 'Inter', sans-serif);
}
.knob__label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(247, 240, 220, 0.7);
}
.knob__face {
  position: relative;
  border: 1px solid rgba(247, 240, 220, 0.2);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 25%, #2a2522 0%, #14110f 100%);
  cursor: ns-resize;
  padding: 0;
  outline: none;
  transition: border-color 0.1s ease, box-shadow 0.1s ease;
}
.knob__face:focus-visible,
.knob__face--dragging {
  border-color: var(--saffron, #f4a52a);
  box-shadow: 0 0 0 2px rgba(244, 165, 42, 0.2);
}
.knob__indicator {
  position: absolute;
  top: 50%; left: 50%;
  width: 2px; height: 50%;
  background: var(--saffron, #f4a52a);
  transform-origin: top center;
}
.knob__face--modulated .knob__indicator {
  animation: knob-pulse 1.4s ease-in-out infinite;
}
@keyframes knob-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}
.knob__value {
  font-family: var(--font-mono, 'Source Code Pro', monospace);
  font-size: 11px;
  color: var(--saffron, #f4a52a);
  white-space: nowrap;
}
```

- [ ] **Step 3: Build to verify it compiles**

Run:
```bash
cd app && bun run build
```
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/src/synth/Knob.tsx app/src/styles/istanbul-brutalist.css
git commit -m "Knob primitive: rotary with drag/shift-fine/dblclick-reset/scroll/keyboard"
```

---

### Task 2.2: `ConsoleModule.tsx` generic wrapper

**Files:**
- Create: `app/src/synth/ConsoleModule.tsx`

- [ ] **Step 1: Create the wrapper**

```tsx
// app/src/synth/ConsoleModule.tsx
//
// Generic module shell used by every console module. Header (small-caps
// title), body slot for knobs/selects, and a thin signal-flow arrow on
// the right edge connecting to the next module.

import type { ReactNode } from 'react';

interface Props {
  title: string;
  /** When true, renders the right-edge arrow (signal flow continues). */
  flowsForward?: boolean;
  children: ReactNode;
}

export function ConsoleModule({ title, flowsForward = true, children }: Props) {
  return (
    <section className="console-module">
      <header className="console-module__header">
        <span className="console-module__title">{title}</span>
      </header>
      <div className="console-module__body">{children}</div>
      {flowsForward && <span className="console-module__arrow" aria-hidden="true">▸</span>}
    </section>
  );
}
```

- [ ] **Step 2: Add base styles**

Append to `istanbul-brutalist.css`:

```css
/* Console module shell */
.console-module {
  position: relative;
  flex: 1 1 0;
  min-width: 0;
  padding: 8px 12px;
  border-right: 1px solid rgba(247, 240, 220, 0.08);
  background: linear-gradient(180deg, rgba(247, 240, 220, 0.02), transparent);
}
.console-module:last-child { border-right: none; }
.console-module__header {
  margin-bottom: 6px;
}
.console-module__title {
  font-family: var(--font-sans);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(247, 240, 220, 0.7);
}
.console-module__body {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: flex-start;
}
.console-module__arrow {
  position: absolute;
  right: -7px; top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: var(--saffron, #f4a52a);
  opacity: 0.5;
  pointer-events: none;
}
```

- [ ] **Step 3: Build**

Run: `cd app && bun run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/src/synth/ConsoleModule.tsx app/src/styles/istanbul-brutalist.css
git commit -m "ConsoleModule wrapper: header + body slot + signal-flow arrow"
```

---

### Task 2.3: `useAnalyserLevel` hook

**Files:**
- Create: `app/src/synth/hooks/useAnalyserLevel.ts`

- [ ] **Step 1: Create the hook**

```ts
// app/src/synth/hooks/useAnalyserLevel.ts
//
// Polls an AnalyserNode at requestAnimationFrame cadence and returns
// {rms, peak} as a stateful pair. Both are 0..1 floats (linear, not dB).
// Components can derive their own dBFS / colour from these.
//
// Used by Meter (large variant in MASTER module + tiny variant in the
// collapsed console strip).

import { useEffect, useState } from 'react';

export interface AnalyserLevel { rms: number; peak: number; }

export function useAnalyserLevel(analyser: AnalyserNode | null): AnalyserLevel {
  const [level, setLevel] = useState<AnalyserLevel>({ rms: 0, peak: 0 });

  useEffect(() => {
    if (!analyser) return;
    const buf = new Uint8Array(analyser.fftSize);
    let raf = 0;
    let lastPeak = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(buf);
      let peak = 0;
      let sumSq = 0;
      for (let i = 0; i < buf.length; i++) {
        const s = (buf[i] - 128) / 128;       // -1..+1
        const a = Math.abs(s);
        if (a > peak) peak = a;
        sumSq += s * s;
      }
      const rms = Math.sqrt(sumSq / buf.length);
      // Peak hold + decay
      lastPeak = Math.max(peak, lastPeak * 0.9);
      setLevel({ rms, peak: lastPeak });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [analyser]);

  return level;
}
```

- [ ] **Step 2: Build**

Run: `cd app && bun run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add app/src/synth/hooks/useAnalyserLevel.ts
git commit -m "useAnalyserLevel: rAF-paced AnalyserNode polling, returns {rms, peak}"
```

---

### Task 2.4: `Meter.tsx` level meter

**Files:**
- Create: `app/src/synth/Meter.tsx`

- [ ] **Step 1: Create the component**

```tsx
// app/src/synth/Meter.tsx
//
// Horizontal output level meter. Two variants:
//   - large: in the MASTER module; shows RMS fill + peak-hold dot,
//     coloured by zone (saffron up to -6 dB, transitions to red between
//     -6 and -3 dB, hard clip lamp at 0 dB)
//   - tiny: in the collapsed console strip; just the RMS bar
//
// Both feed off the AnalyserLevel struct from useAnalyserLevel.

import type { AnalyserLevel } from './hooks/useAnalyserLevel';

interface Props {
  level: AnalyserLevel;
  variant?: 'large' | 'tiny';
}

function linToDb(x: number): number {
  return 20 * Math.log10(Math.max(1e-6, x));
}

export function Meter({ level, variant = 'large' }: Props) {
  const rmsDb = linToDb(level.rms);
  const peakDb = linToDb(level.peak);
  // Map -60..0 dB → 0..1 width. Clamp.
  const rmsW = Math.max(0, Math.min(1, (rmsDb + 60) / 60));
  const peakW = Math.max(0, Math.min(1, (peakDb + 60) / 60));
  const clipping = peakDb > -0.5;
  const hot = peakDb > -6;

  return (
    <div className={`meter meter--${variant} ${clipping ? 'meter--clip' : ''}`}>
      <div
        className={`meter__fill ${hot ? 'meter__fill--hot' : ''}`}
        style={{ width: `${rmsW * 100}%` }}
      />
      {variant === 'large' && (
        <div className="meter__peak" style={{ left: `${peakW * 100}%` }} />
      )}
      {clipping && variant === 'large' && <div className="meter__clip-lamp" />}
    </div>
  );
}
```

- [ ] **Step 2: Add styles**

Append to `istanbul-brutalist.css`:

```css
/* Meter */
.meter {
  position: relative;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(247, 240, 220, 0.15);
  overflow: hidden;
}
.meter--large { width: 140px; height: 12px; }
.meter--tiny  { width: 60px;  height: 6px; }
.meter__fill {
  position: absolute;
  top: 0; bottom: 0; left: 0;
  background: var(--saffron, #f4a52a);
  transition: width 30ms linear;
}
.meter__fill--hot {
  background: linear-gradient(90deg, var(--saffron, #f4a52a) 60%, #d23c1f 100%);
}
.meter__peak {
  position: absolute;
  top: 0; bottom: 0;
  width: 2px;
  background: rgba(247, 240, 220, 0.95);
  transform: translateX(-1px);
}
.meter__clip-lamp {
  position: absolute;
  top: 50%; right: 4px;
  width: 6px; height: 6px;
  border-radius: 50%;
  transform: translateY(-50%);
  background: #d23c1f;
  box-shadow: 0 0 4px rgba(210, 60, 31, 0.8);
}
```

- [ ] **Step 3: Build**

Run: `cd app && bun run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/src/synth/Meter.tsx app/src/styles/istanbul-brutalist.css
git commit -m "Meter: horizontal level meter (large + tiny variants)"
```

---

### Task 2.5: `Console.tsx` shell with collapsed/expanded states + Tab toggle

**Files:**
- Create: `app/src/synth/Console.tsx`

- [ ] **Step 1: Create the shell**

```tsx
// app/src/synth/Console.tsx
//
// Top-mounted Moog-style console.
//
// Two states:
//   - collapsed (~44px): machine name (read-only), tiny meter,
//     master volume slider, expand button
//   - expanded (~240px): six modules in signal-flow order:
//     OSC → FILTER → AMP → MOD → MASTER FX → MASTER
//
// Toggle: Tab key or the on-screen ▾/▴ button.
// While focused inside an input, Tab follows tab order — we only treat
// Tab as a console toggle when the focused element is body or any
// non-form element of the page.

import { useEffect, useState, type ReactNode } from 'react';
import { Meter } from './Meter';
import type { AnalyserLevel } from './hooks/useAnalyserLevel';

interface Props {
  level: AnalyserLevel;
  machineLabel: string;
  masterVolume: number;
  onMasterVolume: (v: number) => void;
  /** All six module elements; rendered only when expanded. */
  children: ReactNode;
}

const FORM_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function Console({
  level, machineLabel, masterVolume, onMasterVolume, children,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Tab') return;
      const t = document.activeElement;
      if (t && FORM_TAGS.has(t.tagName)) return;
      e.preventDefault();
      setExpanded((x) => !x);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section className={`console ${expanded ? 'console--expanded' : 'console--collapsed'}`} aria-label="Synth console">
      <div className="console__strip">
        <button
          type="button"
          className="console__toggle"
          onClick={() => setExpanded((x) => !x)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse console' : 'Expand console'}
        >
          {expanded ? '▴' : '▾'} {expanded ? 'COLLAPSE' : 'EXPAND'}
        </button>
        <span className="console__machine-label">{machineLabel}</span>
        <Meter level={level} variant="tiny" />
        <label className="console__master">
          <span>MASTER</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterVolume}
            onChange={(e) => onMasterVolume(Number(e.target.value))}
          />
        </label>
      </div>
      {expanded && <div className="console__rack">{children}</div>}
    </section>
  );
}
```

- [ ] **Step 2: Add styles**

Append to `istanbul-brutalist.css`:

```css
/* Console shell */
.console {
  position: sticky;
  top: 0;
  z-index: 30;
  background: linear-gradient(180deg, #1a1614 0%, #14110f 100%);
  border-bottom: 1px solid rgba(247, 240, 220, 0.1);
  font-family: var(--font-sans);
  color: rgba(247, 240, 220, 0.9);
}
.console__strip {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  height: 44px;
  border-bottom: 1px solid rgba(247, 240, 220, 0.05);
}
.console__toggle {
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  letter-spacing: 0.1em;
  background: transparent;
  border: 1px solid rgba(247, 240, 220, 0.2);
  color: rgba(247, 240, 220, 0.85);
  padding: 4px 8px;
  cursor: pointer;
}
.console__toggle:hover { border-color: var(--saffron, #f4a52a); }
.console__machine-label {
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--saffron, #f4a52a);
}
.console__master {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: rgba(247, 240, 220, 0.7);
  margin-left: auto;
}
.console__master input[type='range'] { width: 120px; }
.console__rack {
  display: flex;
  align-items: stretch;
  min-height: 196px;
  padding: 8px 0;
}
```

- [ ] **Step 3: Smoke test in App temporarily**

Skip in this task — Console will be mounted in `App.tsx` during Phase 4.  Just confirm the build:

Run: `cd app && bun run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/src/synth/Console.tsx app/src/styles/istanbul-brutalist.css
git commit -m "Console shell: collapsed strip + expanded rack, Tab toggle"
```

---

## Phase 3 — Modules (App still uses old SynthControls)

### Task 3.1: `OscModule.tsx` — machine, octave, brightness, body, machine-specific

**Files:**
- Create: `app/src/synth/modules/OscModule.tsx`

- [ ] **Step 1: Create the module**

```tsx
// app/src/synth/modules/OscModule.tsx
//
// First module in the rack. Owns:
//   - machine selector (qanun | vapor-pluck | synthwave-saw | dream-pad)
//   - octave knob (-2..+2)
//   - brightness knob
//   - body knob
//   - machine-specific knobs auto-rendered from MACHINE_PARAMS[machineId]

import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import { MACHINES, MACHINE_PARAMS, type MachineId, type MachineParamValues, type ParamSpec } from '../../audio/machines';

interface Props {
  machineId: MachineId;
  octave: number;
  brightness: number;
  body: number;
  machineParams: MachineParamValues;
  onMachineId: (id: MachineId) => void;
  onOctave: (v: number) => void;
  onBrightness: (v: number) => void;
  onBody: (v: number) => void;
  onMachineParam: (name: string, value: number | string) => void;
}

export function OscModule({
  machineId, octave, brightness, body, machineParams,
  onMachineId, onOctave, onBrightness, onBody, onMachineParam,
}: Props) {
  const renderMachineParam = (p: ParamSpec) => {
    if (p.kind === 'discrete' && p.options) {
      return (
        <label className="osc-module__select" key={p.name}>
          <span>{p.name}</span>
          <select
            value={String(machineParams[p.name] ?? p.default)}
            onChange={(e) => onMachineParam(p.name, e.target.value)}
          >
            {p.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
      );
    }
    const v = typeof machineParams[p.name] === 'number'
      ? (machineParams[p.name] as number)
      : Number(p.default);
    const min = p.min ?? 0, max = p.max ?? 1;
    return (
      <Knob
        key={p.name}
        label={p.name}
        value={v}
        min={min}
        max={max}
        defaultValue={Number(p.default)}
        unit={p.unit ?? ''}
        onChange={(nv) => onMachineParam(p.name, nv)}
      />
    );
  };

  return (
    <ConsoleModule title="OSC">
      <label className="osc-module__select">
        <span>machine</span>
        <select
          value={machineId}
          onChange={(e) => onMachineId(e.target.value as MachineId)}
        >
          {MACHINES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </label>
      <Knob label="octave"     value={octave}     min={-2} max={2} step={1} defaultValue={0}   onChange={onOctave}     />
      <Knob label="brightness" value={brightness} min={0}  max={1}        defaultValue={0.6} onChange={onBrightness} />
      <Knob label="body"       value={body}       min={0}  max={1}        defaultValue={0.3} onChange={onBody}       />
      {MACHINE_PARAMS[machineId].map(renderMachineParam)}
    </ConsoleModule>
  );
}
```

- [ ] **Step 2: Add module-specific styles**

Append to `istanbul-brutalist.css`:

```css
/* OscModule */
.osc-module__select {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(247, 240, 220, 0.7);
}
.osc-module__select select {
  background: rgba(0, 0, 0, 0.4);
  color: var(--saffron, #f4a52a);
  font-family: var(--font-mono, monospace);
  font-size: 11px;
  border: 1px solid rgba(247, 240, 220, 0.2);
  padding: 4px 6px;
}
```

- [ ] **Step 3: Build**

Run: `cd app && bun run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/src/synth/modules/OscModule.tsx app/src/styles/istanbul-brutalist.css
git commit -m "OscModule: machine/octave/brightness/body + auto-rendered machine-specific params"
```

---

### Task 3.2: `FilterModule.tsx`

**Files:**
- Create: `app/src/synth/modules/FilterModule.tsx`

- [ ] **Step 1: Create the module**

```tsx
// app/src/synth/modules/FilterModule.tsx
//
// VCF: type, cutoff (log Hz), resonance, env amount, env A D S R.

import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import type { FilterConfig, FilterEnv, FilterType } from '../../audio/machines';

interface Props {
  filter: FilterConfig;
  filterEnv: FilterEnv;
  onFilter: (f: FilterConfig) => void;
  onFilterEnv: (e: FilterEnv) => void;
}

const FILTER_TYPES: FilterType[] = ['lp', 'hp', 'bp'];

export function FilterModule({ filter, filterEnv, onFilter, onFilterEnv }: Props) {
  return (
    <ConsoleModule title="FILTER">
      <label className="osc-module__select">
        <span>type</span>
        <select
          value={filter.type}
          onChange={(e) => onFilter({ ...filter, type: e.target.value as FilterType })}
        >
          {FILTER_TYPES.map((t) => <option key={t} value={t}>{t.toUpperCase()}</option>)}
        </select>
      </label>
      <Knob
        label="cutoff" unit="Hz"
        value={filter.cutoff} min={50} max={18000} log
        defaultValue={6000}
        format={(v) => `${Math.round(v)}Hz`}
        onChange={(v) => onFilter({ ...filter, cutoff: v })}
      />
      <Knob
        label="res"
        value={filter.q} min={0.1} max={18}
        defaultValue={0.7}
        onChange={(v) => onFilter({ ...filter, q: v })}
      />
      <Knob
        label="env amt"
        value={filterEnv.amount} min={-1} max={1}
        defaultValue={0.3}
        onChange={(v) => onFilterEnv({ ...filterEnv, amount: v })}
      />
      <Knob label="A" value={filterEnv.a} min={0.001} max={2}    defaultValue={0.005} onChange={(v) => onFilterEnv({ ...filterEnv, a: v })} />
      <Knob label="D" value={filterEnv.d} min={0.001} max={4}    defaultValue={0.8}   onChange={(v) => onFilterEnv({ ...filterEnv, d: v })} />
      <Knob label="S" value={filterEnv.s} min={0}     max={1}    defaultValue={0}     onChange={(v) => onFilterEnv({ ...filterEnv, s: v })} />
      <Knob label="R" value={filterEnv.r} min={0.001} max={4}    defaultValue={0.2}   onChange={(v) => onFilterEnv({ ...filterEnv, r: v })} />
    </ConsoleModule>
  );
}
```

- [ ] **Step 2: Build**

Run: `cd app && bun run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add app/src/synth/modules/FilterModule.tsx
git commit -m "FilterModule: type/cutoff/res/env amount + env ADSR"
```

---

### Task 3.3: `AmpModule.tsx`

**Files:**
- Create: `app/src/synth/modules/AmpModule.tsx`

- [ ] **Step 1: Create the module**

```tsx
// app/src/synth/modules/AmpModule.tsx
//
// Amp ADSR. Four knobs + a small inline curve preview.

import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import type { ADSR } from '../../audio/machines';

interface Props {
  adsr: ADSR;
  onAdsr: (v: ADSR) => void;
}

function curvePath(adsr: ADSR, w = 80, h = 32): string {
  const total = Math.max(0.01, adsr.a + adsr.d + 1.0 + adsr.r);
  const x = (t: number) => (t / total) * w;
  const y = (lvl: number) => h - lvl * (h - 2);
  const ax = x(adsr.a);
  const dx = x(adsr.a + adsr.d);
  const sx = x(adsr.a + adsr.d + 1.0);
  const rx = x(total);
  const sy = y(adsr.s);
  return `M0,${h} L${ax.toFixed(1)},${y(1)} L${dx.toFixed(1)},${sy.toFixed(1)} L${sx.toFixed(1)},${sy.toFixed(1)} L${rx.toFixed(1)},${h}`;
}

export function AmpModule({ adsr, onAdsr }: Props) {
  return (
    <ConsoleModule title="AMP">
      <Knob label="A" value={adsr.a} min={0.001} max={3}  defaultValue={0.005} onChange={(v) => onAdsr({ ...adsr, a: v })} />
      <Knob label="D" value={adsr.d} min={0.001} max={4}  defaultValue={0.4}   onChange={(v) => onAdsr({ ...adsr, d: v })} />
      <Knob label="S" value={adsr.s} min={0}     max={1}  defaultValue={0.5}   onChange={(v) => onAdsr({ ...adsr, s: v })} />
      <Knob label="R" value={adsr.r} min={0.01}  max={6}  defaultValue={0.5}   onChange={(v) => onAdsr({ ...adsr, r: v })} />
      <svg className="amp-module__curve" width="80" height="32" viewBox="0 0 80 32" aria-hidden="true">
        <path d={curvePath(adsr)} stroke="var(--saffron, #f4a52a)" strokeWidth="1.5" fill="none" />
      </svg>
    </ConsoleModule>
  );
}
```

- [ ] **Step 2: Add module-specific styles**

Append to `istanbul-brutalist.css`:

```css
/* AmpModule */
.amp-module__curve {
  align-self: center;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(247, 240, 220, 0.1);
}
```

- [ ] **Step 3: Build**

Run: `cd app && bun run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/src/synth/modules/AmpModule.tsx app/src/styles/istanbul-brutalist.css
git commit -m "AmpModule: ADSR knobs + inline SVG curve preview"
```

---

### Task 3.4: `ModModule.tsx` — LFO1 + LFO2

**Files:**
- Create: `app/src/synth/modules/ModModule.tsx`

- [ ] **Step 1: Create the module**

```tsx
// app/src/synth/modules/ModModule.tsx
//
// Two LFOs stacked. Each: rate, shape, depth, destination.

import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import type { LfoConfig, LfoDest, OscType } from '../../audio/machines';

interface Props {
  lfo1: LfoConfig;
  lfo2: LfoConfig;
  onLfo1: (v: LfoConfig) => void;
  onLfo2: (v: LfoConfig) => void;
}

const SHAPES: OscType[] = ['sine', 'triangle', 'sawtooth', 'square'];
const DESTS: LfoDest[] = ['off', 'pitch', 'filter', 'amp'];

function LfoRow({ label, cfg, onChange }: { label: string; cfg: LfoConfig; onChange: (v: LfoConfig) => void }) {
  return (
    <div className="mod-module__row">
      <span className="mod-module__row-label">{label}</span>
      <Knob label="rate" unit="Hz" value={cfg.rate} min={0.05} max={20} log defaultValue={2}
            onChange={(v) => onChange({ ...cfg, rate: v })} />
      <label className="osc-module__select">
        <span>shape</span>
        <select value={cfg.shape} onChange={(e) => onChange({ ...cfg, shape: e.target.value as OscType })}>
          {SHAPES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>
      <Knob label="depth" value={cfg.depth} min={0} max={1} defaultValue={0}
            onChange={(v) => onChange({ ...cfg, depth: v })} />
      <label className="osc-module__select">
        <span>dest</span>
        <select value={cfg.destination} onChange={(e) => onChange({ ...cfg, destination: e.target.value as LfoDest })}>
          {DESTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </label>
    </div>
  );
}

export function ModModule({ lfo1, lfo2, onLfo1, onLfo2 }: Props) {
  return (
    <ConsoleModule title="MOD">
      <div className="mod-module">
        <LfoRow label="LFO1" cfg={lfo1} onChange={onLfo1} />
        <LfoRow label="LFO2" cfg={lfo2} onChange={onLfo2} />
      </div>
    </ConsoleModule>
  );
}
```

- [ ] **Step 2: Add module styles**

Append to `istanbul-brutalist.css`:

```css
/* ModModule */
.mod-module { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.mod-module__row { display: flex; align-items: flex-start; gap: 10px; }
.mod-module__row-label {
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(247, 240, 220, 0.7);
  align-self: center;
  width: 36px;
}
```

- [ ] **Step 3: Build**

Run: `cd app && bun run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/src/synth/modules/ModModule.tsx app/src/styles/istanbul-brutalist.css
git commit -m "ModModule: LFO1 + LFO2 (rate/shape/depth/destination)"
```

---

### Task 3.5: `FxModule.tsx` — master FX (filter, overdrive, reverb, delay)

**Files:**
- Create: `app/src/synth/modules/FxModule.tsx`

- [ ] **Step 1: Create the module**

```tsx
// app/src/synth/modules/FxModule.tsx
//
// Master-bus FX. Auto-renders each effect's params from its
// ControllableModule.params schema. Bypass = mix/wet → 0 (handled
// in master-bus.setFxBypass).

import { useState } from 'react';
import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import type { ControllableModule, ParamSpec } from '../../_core/audio';
import type { FxKey, MasterBus } from '../../audio/master-bus';

interface Props {
  bus: MasterBus;
}

const FX_LIST: FxKey[] = ['filter', 'overdrive', 'reverb', 'delay'];
const FX_LABELS: Record<FxKey, string> = {
  filter: 'flt', overdrive: 'od', reverb: 'rev', delay: 'dly',
};

function FxBlock({ fx, module, bus }: { fx: FxKey; module: ControllableModule; bus: MasterBus }) {
  const [bypass, setBypass] = useState(true);
  const [values, setValues] = useState<Record<string, number | string>>(() => {
    const init: Record<string, number | string> = {};
    for (const p of module.params) init[p.name] = p.default;
    return init;
  });

  const updateValue = (name: string, value: number | string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    bus.setFxParam(fx, name, value);
  };
  const toggleBypass = () => {
    const next = !bypass;
    setBypass(next);
    bus.setFxBypass(fx, next);
  };

  const renderParam = (p: ParamSpec) => {
    if (p.kind === 'discrete' && p.options) return null; // FX have continuous-only in practice; degrade gracefully
    const min = p.min ?? 0, max = p.max ?? 1;
    const v = typeof values[p.name] === 'number' ? values[p.name] as number : Number(p.default);
    return (
      <Knob
        key={p.name}
        label={p.name}
        value={v}
        min={min}
        max={max}
        defaultValue={Number(p.default)}
        unit={p.unit ?? ''}
        onChange={(nv) => updateValue(p.name, nv)}
      />
    );
  };

  return (
    <div className={`fx-block ${bypass ? 'fx-block--off' : ''}`}>
      <header className="fx-block__head">
        <span>{FX_LABELS[fx]}</span>
        <button
          type="button"
          className="fx-block__bypass"
          onClick={toggleBypass}
          aria-pressed={!bypass}
        >
          {bypass ? 'OFF' : 'ON'}
        </button>
      </header>
      <div className="fx-block__params">
        {module.params.map(renderParam)}
      </div>
    </div>
  );
}

export function FxModule({ bus }: Props) {
  return (
    <ConsoleModule title="MASTER FX">
      <div className="fx-module">
        {FX_LIST.map((fx) => (
          <FxBlock key={fx} fx={fx} module={bus.effects[fx]} bus={bus} />
        ))}
      </div>
    </ConsoleModule>
  );
}
```

- [ ] **Step 2: Add styles**

Append to `istanbul-brutalist.css`:

```css
/* FxModule */
.fx-module { display: flex; gap: 10px; align-items: flex-start; }
.fx-block { display: flex; flex-direction: column; gap: 4px; }
.fx-block__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(247, 240, 220, 0.7);
}
.fx-block--off .fx-block__head { opacity: 0.6; }
.fx-block__bypass {
  background: transparent;
  border: 1px solid rgba(247, 240, 220, 0.2);
  color: rgba(247, 240, 220, 0.85);
  font-family: var(--font-mono);
  font-size: 9px;
  padding: 1px 4px;
  cursor: pointer;
}
.fx-block--off .fx-block__bypass {
  border-color: rgba(247, 240, 220, 0.1);
  color: rgba(247, 240, 220, 0.5);
}
.fx-block:not(.fx-block--off) .fx-block__bypass {
  border-color: var(--saffron, #f4a52a);
  color: var(--saffron, #f4a52a);
}
.fx-block__params { display: flex; gap: 6px; }
```

- [ ] **Step 3: Build**

Run: `cd app && bun run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add app/src/synth/modules/FxModule.tsx app/src/styles/istanbul-brutalist.css
git commit -m "FxModule: filter / overdrive / reverb / delay with auto-rendered params"
```

---

### Task 3.6: `MasterModule.tsx` — master volume + meter + audio resume

**Files:**
- Create: `app/src/synth/modules/MasterModule.tsx`

- [ ] **Step 1: Create the module**

```tsx
// app/src/synth/modules/MasterModule.tsx

import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import { Meter } from '../Meter';
import type { AnalyserLevel } from '../hooks/useAnalyserLevel';

interface Props {
  masterVolume: number;
  level: AnalyserLevel;
  audioState: AudioContextState;
  onMasterVolume: (v: number) => void;
  onResume: () => void;
}

export function MasterModule({ masterVolume, level, audioState, onMasterVolume, onResume }: Props) {
  return (
    <ConsoleModule title="MASTER" flowsForward={false}>
      <Knob label="vol" value={masterVolume} min={0} max={1} defaultValue={0.6}
            onChange={onMasterVolume} />
      <Meter level={level} variant="large" />
      {audioState !== 'running' && (
        <button type="button" className="audio-resume" onClick={onResume}>
          Resume audio ({audioState})
        </button>
      )}
    </ConsoleModule>
  );
}
```

- [ ] **Step 2: Build**

Run: `cd app && bun run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add app/src/synth/modules/MasterModule.tsx
git commit -m "MasterModule: master volume + meter + resume button"
```

---

## Phase 4 — Layout rewire

### Task 4.1: Mount `Console` at top of `App.tsx`, wire all state, remove tweaks aside

**Why:** Replace the right `aside.tweaks` panel + the existing `SynthControls` / `FxControls` with the Console + six modules at the top.

**Files:**
- Modify: `app/src/App.tsx`

- [ ] **Step 1: Replace `App.tsx`**

```tsx
// app/src/App.tsx
//
// makam_studio — main app shell.
//
// Layout (top → bottom):
//   Header (slim) → Console (collapsible top-mounted Moog rack) →
//   MaqamRail | (karar bar + qanun strings)
//
// Audio context lazily resumes on the first user gesture (the resume
// button surfaces in the MASTER module while ctx is suspended).

import { useEffect, useMemo, useRef, useState } from 'react';
import './styles/istanbul-brutalist.css';

import { ALL_MAQAMAT, RAST } from './tuning/maqamat';
import type { MaqamPreset } from './tuning/types';

import { useAudioContext } from './audio/audio-context';
import { createMasterBus } from './audio/master-bus';
import type { MasterBus } from './audio/master-bus';

import { MaqamRail } from './qanun/MaqamRail';
import { QanunInstrument } from './qanun/QanunInstrument';
import { KeyboardOverlay } from './keyboard/KeyboardOverlay';

import { Console } from './synth/Console';
import { useAnalyserLevel } from './synth/hooks/useAnalyserLevel';
import { OscModule } from './synth/modules/OscModule';
import { FilterModule } from './synth/modules/FilterModule';
import { AmpModule } from './synth/modules/AmpModule';
import { ModModule } from './synth/modules/ModModule';
import { FxModule } from './synth/modules/FxModule';
import { MasterModule } from './synth/modules/MasterModule';

import {
  MACHINES, MACHINE_PARAMS,
  type MachineId, type ADSR, type FilterConfig, type FilterEnv,
  type LfoConfig, type MachineParamValues,
} from './audio/machines';

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const;

interface MachineConfig {
  ampAdsr: ADSR;
  filter: FilterConfig;
  filterEnv: FilterEnv;
  lfo1: LfoConfig;
  lfo2: LfoConfig;
  brightness: number;
  body: number;
  octave: number;
  params: MachineParamValues;
}

function machineDefaults(id: MachineId): MachineConfig {
  const params: MachineParamValues = {};
  for (const p of MACHINE_PARAMS[id]) params[p.name] = p.default;
  // base universal layer per machine — same as before with octave added
  const universal: Record<MachineId, Omit<MachineConfig, 'params'>> = {
    'qanun': {
      ampAdsr:   { a: 0.005, d: 0.4, s: 0.5, r: 0.5 },
      filter:    { type: 'lp', cutoff: 6000, q: 0.7 },
      filterEnv: { a: 0.005, d: 0.8, s: 0,   r: 0.2, amount: 0.3 },
      lfo1:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      lfo2:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      brightness: 0.6, body: 0.3, octave: 0,
    },
    'vapor-pluck': {
      ampAdsr:   { a: 0.005, d: 0.4, s: 0.5, r: 0.5 },
      filter:    { type: 'lp', cutoff: 1500, q: 0.7 },
      filterEnv: { a: 0.005, d: 0.6, s: 0,   r: 0.3, amount: 0.6 },
      lfo1:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      lfo2:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      brightness: 0.6, body: 0.3, octave: 0,
    },
    'synthwave-saw': {
      ampAdsr:   { a: 0.005, d: 0.4, s: 0.5, r: 0.5 },
      filter:    { type: 'lp', cutoff: 3000, q: 1.5 },
      filterEnv: { a: 0.005, d: 0.5, s: 0.2, r: 0.3, amount: 0.4 },
      lfo1:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      lfo2:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      brightness: 0.6, body: 0.3, octave: 0,
    },
    'dream-pad': {
      ampAdsr:   { a: 1.0, d: 1.0, s: 0.7, r: 1.0 },
      filter:    { type: 'bp', cutoff: 1800, q: 1.5 },
      filterEnv: { a: 0.5, d: 1.0, s: 0.5, r: 1.0, amount: 0 },
      lfo1:      { rate: 0.5, shape: 'sine', depth: 0, destination: 'off' },
      lfo2:      { rate: 0.3, shape: 'sine', depth: 0, destination: 'off' },
      brightness: 0.5, body: 0.3, octave: 0,
    },
  };
  return { ...universal[id], params };
}

export function App() {
  const { ctx, state: audioState, resume } = useAudioContext();
  const busRef = useRef<MasterBus | null>(null);

  if (!busRef.current) busRef.current = createMasterBus(ctx);
  const bus = busRef.current;

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ctx = ctx;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__bus = bus;
  }

  useEffect(() => {
    return () => { busRef.current?.dispose(); busRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [maqam, setMaqam] = useState<MaqamPreset>(RAST);
  const [machineId, setMachineId] = useState<MachineId>('qanun');
  const [configs, setConfigs] = useState<Record<MachineId, MachineConfig>>(() => ({
    'qanun': machineDefaults('qanun'),
    'vapor-pluck': machineDefaults('vapor-pluck'),
    'synthwave-saw': machineDefaults('synthwave-saw'),
    'dream-pad': machineDefaults('dream-pad'),
  }));
  const [masterVolume, setMasterVolume] = useState(0.6);
  useEffect(() => { bus.setMasterVolume(masterVolume); }, [masterVolume, bus]);

  const [kararSemitoneOffset, setKararSemitoneOffset] = useState(0);
  const maqamat = useMemo(() => ALL_MAQAMAT, []);
  const cfg = configs[machineId];
  const updateCfg = (patch: Partial<MachineConfig>) =>
    setConfigs((prev) => ({ ...prev, [machineId]: { ...prev[machineId], ...patch } }));

  const level = useAnalyserLevel(bus.analyser);
  const machineLabel = MACHINES.find((m) => m.id === machineId)?.label ?? machineId;

  return (
    <div className="app app--top-console">
      <header className="app-header">
        <h1 className="app-header__title">makam_studio</h1>
        <span className="app-header__maqam">
          {maqam.name.canonical}
          {maqam.name.native && (<span className="app-header__maqam-native">{maqam.name.native}</span>)}
        </span>
        <span className="app-header__karar">
          karar
          <span className="app-header__karar-name">{maqam.karar_perde}</span>
        </span>
      </header>

      <Console
        level={level}
        machineLabel={machineLabel}
        masterVolume={masterVolume}
        onMasterVolume={setMasterVolume}
      >
        <OscModule
          machineId={machineId}
          octave={cfg.octave}
          brightness={cfg.brightness}
          body={cfg.body}
          machineParams={cfg.params}
          onMachineId={setMachineId}
          onOctave={(octave) => updateCfg({ octave })}
          onBrightness={(brightness) => updateCfg({ brightness })}
          onBody={(body) => updateCfg({ body })}
          onMachineParam={(name, value) => updateCfg({ params: { ...cfg.params, [name]: value } })}
        />
        <FilterModule
          filter={cfg.filter}
          filterEnv={cfg.filterEnv}
          onFilter={(filter) => updateCfg({ filter })}
          onFilterEnv={(filterEnv) => updateCfg({ filterEnv })}
        />
        <AmpModule adsr={cfg.ampAdsr} onAdsr={(ampAdsr) => updateCfg({ ampAdsr })} />
        <ModModule
          lfo1={cfg.lfo1}
          lfo2={cfg.lfo2}
          onLfo1={(lfo1) => updateCfg({ lfo1 })}
          onLfo2={(lfo2) => updateCfg({ lfo2 })}
        />
        <FxModule bus={bus} />
        <MasterModule
          masterVolume={masterVolume}
          level={level}
          audioState={audioState}
          onMasterVolume={setMasterVolume}
          onResume={() => resume()}
        />
      </Console>

      <MaqamRail maqamat={maqamat} active={maqam} onSelect={setMaqam} />

      <main className="main">
        <div className="karar-bar" role="group" aria-label="Karar transpose">
          <span className="karar-bar__label">karar transpose</span>
          {NOTE_NAMES.map((n, i) => {
            const offsetMod = ((kararSemitoneOffset % 12) + 12) % 12;
            const active = i === offsetMod;
            return (
              <button
                key={n}
                type="button"
                className={`karar-bar__note ${active ? 'karar-bar__note--active' : ''}`}
                onClick={() => setKararSemitoneOffset(i)}
                title={`Set karar offset to +${i} semitone${i === 1 ? '' : 's'}`}
              >{n}</button>
            );
          })}
          <button type="button" className="karar-bar__step" onClick={() => setKararSemitoneOffset((v) => v - 12)} aria-label="Karar one octave down">−8</button>
          <button type="button" className="karar-bar__step" onClick={() => setKararSemitoneOffset((v) => v + 12)} aria-label="Karar one octave up">+8</button>
          <button type="button" className="karar-bar__reset" onClick={() => setKararSemitoneOffset(0)}>reset</button>
          <span className="karar-bar__readout">{kararSemitoneOffset >= 0 ? '+' : ''}{kararSemitoneOffset} st</span>
        </div>
        <QanunInstrument
          maqam={maqam}
          audioContext={ctx}
          destination={bus.input}
          machineId={machineId}
          brightness={cfg.brightness}
          body={cfg.body}
          adsr={cfg.ampAdsr}
          filter={cfg.filter}
          filterEnv={cfg.filterEnv}
          lfo1={cfg.lfo1}
          lfo2={cfg.lfo2}
          octaveOffset={cfg.octave}
          machineParams={cfg.params}
          kararSemitoneOffset={kararSemitoneOffset}
          onMaqamSelect={(idx) => { const next = maqamat[idx]; if (next) setMaqam(next); }}
          droneOctave={0}
        />
      </main>
      <KeyboardOverlay />
    </div>
  );
}
```

- [ ] **Step 2: Update `QanunInstrument.tsx` to accept the new props**

Open `app/src/qanun/QanunInstrument.tsx`. Add to the `Props` interface:

```ts
  octaveOffset?: number;
  machineParams?: import('../audio/machines').MachineParamValues;
```

Inside `pressString` and the keyboard hook call, thread `octaveOffset: octaveOffset` and `params: machineParams` into `triggerMachineSustained` calls. Same for `previewMandalStep`'s `triggerMachine`.

If the keyboard hook (`use-keyboard-input.ts`) doesn't yet take these, add them to its `UseKeyboardInputArgs` and thread to its internal trigger calls. They are optional, so no defaults are needed for callers that don't pass them.

- [ ] **Step 3: Update CSS layout for top-console mode**

Append to `istanbul-brutalist.css`:

```css
/* Top-console layout — no right tweaks panel */
.app--top-console {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto 1fr;
  grid-template-areas:
    "header   header"
    "console  console"
    "rail     main";
  height: 100vh;
  overflow: hidden;
}
.app--top-console .app-header { grid-area: header; }
.app--top-console .console    { grid-area: console; }
.app--top-console .maqam-rail { grid-area: rail; overflow-y: auto; }
.app--top-console .main       { grid-area: main; overflow-y: auto; }
```

- [ ] **Step 4: Build + smoke test**

Run:
```bash
cd app && bun run build && bun run dev
```

In browser:
1. Header at top, console under it (collapsed strip showing).
2. Press Tab — console expands. Six modules visible in OSC → FILTER → AMP → MOD → MASTER FX → MASTER order.
3. Twist the OSC octave knob, hold a key — pitch shifts.
4. Twist FILTER cutoff — tone changes.
5. Twist AMP A/D/S/R — envelope curve preview updates.
6. Set MOD LFO1 dest=amp, depth=0.5, rate=4 — held note has tremolo.
7. Toggle FX reverb ON, wet=0.6, hold a note — reverb tail.
8. Press Tab — collapses. Tiny meter still bouncing.
9. Old right tweaks panel is gone.

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add app/src/App.tsx \
        app/src/qanun/QanunInstrument.tsx \
        app/src/styles/istanbul-brutalist.css
git commit -m "Mount Console at top, kill right tweaks panel, thread per-machine params"
```

---

### Task 4.2: Delete `SynthControls.tsx` and `FxControls.tsx`

**Files:**
- Delete: `app/src/synth/SynthControls.tsx`
- Delete: `app/src/synth/FxControls.tsx`

- [ ] **Step 1: Verify no imports remain**

Run:
```bash
cd app && grep -rn "SynthControls\|FxControls" src/
```
Expected: no matches. If any, delete those imports / usages.

- [ ] **Step 2: Delete the files**

Run:
```bash
git rm app/src/synth/SynthControls.tsx app/src/synth/FxControls.tsx
```

- [ ] **Step 3: Build + run tests**

Run:
```bash
cd app && bun run build && bun run test
```
Expected: success.

- [ ] **Step 4: Commit**

```bash
git commit -m "Remove SynthControls and FxControls (replaced by console modules)"
```

---

## Phase 5 — Strings UX

### Task 5.1: PLAYING lamp + thicker glow + perde emphasis on `StringRow`

**Files:**
- Modify: `app/src/qanun/StringRow.tsx`
- Modify: `app/src/styles/istanbul-brutalist.css`

- [ ] **Step 1: Add the lamp + reorganize the row**

In `StringRow.tsx`, in the JSX where the row is rendered (currently `<div className={rowClass}>`), inject a leading `<span class="string-row__lamp">` element. Add an `is-on` modifier when sustaining or flashing:

```tsx
const lampClass = [
  'string-row__lamp',
  (isFlashing || isSustaining) ? 'string-row__lamp--on' : '',
].filter(Boolean).join(' ');

return (
  <div className={rowClass}>
    <span className={lampClass} aria-hidden="true" />
    <div className="string-row__mandal"> ... </div>
    <div className="string-row__perde"> ... </div>
    <button className="string-row__pluck" ...> ... </button>
  </div>
);
```

- [ ] **Step 2: Add styles for lamp + thicker glow + perde emphasis**

Append to `istanbul-brutalist.css`:

```css
/* Active-string lamp + emphasis */
.string-row { position: relative; }
.string-row__lamp {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(247, 240, 220, 0.18);
  margin-right: 8px;
  flex-shrink: 0;
  transition: background 120ms ease, box-shadow 120ms ease;
}
.string-row__lamp--on {
  background: var(--saffron, #f4a52a);
  box-shadow: 0 0 8px rgba(244, 165, 42, 0.7);
}
.string-row--sustaining {
  border-left-width: 3px;
  border-left-color: var(--saffron, #f4a52a);
  box-shadow: inset 4px 0 12px -4px rgba(244, 165, 42, 0.25);
}
.string-row--sustaining .string-row__perde-name,
.string-row--sustaining .string-row__cents {
  color: rgba(247, 240, 220, 1);
  font-weight: 600;
}
.string-row--flashing .string-row__pluck-line {
  background: var(--saffron, #f4a52a);
  height: 3px;
  transition: background 200ms ease, height 200ms ease;
}
```

- [ ] **Step 3: Build + smoke test**

Run: `cd app && bun run build && bun run dev`

In browser:
1. Hold a key — lamp glows saffron, thick saffron left edge appears, perde name brightens.
2. Release — lamp fades, edge thins.
3. Tap quickly — lamp flashes, fades over ~250ms.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/src/qanun/StringRow.tsx app/src/styles/istanbul-brutalist.css
git commit -m "Active-string lamp + thicker glow + perde emphasis"
```

---

### Task 5.2: Hit-test helper + tests for drag-strum

**Files:**
- Create: `app/src/qanun/string-hit-test.ts`
- Create: `app/src/qanun/__tests__/string-hit-test.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// app/src/qanun/__tests__/string-hit-test.test.ts
//
// Pure-logic test for the drag-strum hit-tester. Given a list of
// pluck-button rectangles and a pointer (x, y), return the string
// index whose pluck button contains the pointer, or null if none.
//
// (Real DOM hit-testing uses document.elementFromPoint at runtime;
// this helper is the deterministic fallback used in tests + makes
// the production hit-test trivially auditable.)

import { describe, expect, it } from 'vitest';
import { hitTestStringPluck, type PluckRect } from '../string-hit-test';

const RECTS: PluckRect[] = [
  { stringIndex: 0, left: 100, top: 100, right: 200, bottom: 130 },
  { stringIndex: 1, left: 100, top: 140, right: 200, bottom: 170 },
  { stringIndex: 2, left: 100, top: 180, right: 200, bottom: 210 },
];

describe('hitTestStringPluck', () => {
  it('returns the string index when point is inside a rect', () => {
    expect(hitTestStringPluck(150, 115, RECTS)).toBe(0);
    expect(hitTestStringPluck(150, 155, RECTS)).toBe(1);
    expect(hitTestStringPluck(150, 195, RECTS)).toBe(2);
  });
  it('returns null when point misses all rects', () => {
    expect(hitTestStringPluck(50, 115, RECTS)).toBeNull();
    expect(hitTestStringPluck(150, 220, RECTS)).toBeNull();
    expect(hitTestStringPluck(250, 115, RECTS)).toBeNull();
  });
  it('returns null between rows (gutter between rects)', () => {
    expect(hitTestStringPluck(150, 135, RECTS)).toBeNull();
  });
  it('treats edges as inside (left/top inclusive, right/bottom exclusive)', () => {
    expect(hitTestStringPluck(100, 100, RECTS)).toBe(0); // top-left corner
    expect(hitTestStringPluck(199.9, 129.9, RECTS)).toBe(0); // just inside bottom-right
    expect(hitTestStringPluck(200, 100, RECTS)).toBeNull(); // exactly on right edge → outside
  });
});
```

- [ ] **Step 2: Run the test to confirm it fails**

Run: `cd app && bun run test app/src/qanun/__tests__/string-hit-test.test.ts`
Expected: FAIL with "Cannot find module '../string-hit-test'".

- [ ] **Step 3: Implement the helper**

```ts
// app/src/qanun/string-hit-test.ts
//
// Hit-test for drag-strum: given a pointer position and a list of
// pluck-button rectangles (in viewport coords), return the string
// index whose rect contains the point, or null.
//
// Used by QanunInstrument's document-level pointermove handler. We
// also use document.elementFromPoint as the production hit-test
// (it's faster and respects DOM stacking), but the rect-list path
// gives us a unit-testable kernel + a fallback.

export interface PluckRect {
  stringIndex: number;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function hitTestStringPluck(
  x: number, y: number, rects: readonly PluckRect[],
): number | null {
  for (const r of rects) {
    if (x >= r.left && x < r.right && y >= r.top && y < r.bottom) {
      return r.stringIndex;
    }
  }
  return null;
}
```

- [ ] **Step 4: Re-run; passes**

Run: `cd app && bun run test app/src/qanun/__tests__/string-hit-test.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app/src/qanun/string-hit-test.ts app/src/qanun/__tests__/string-hit-test.test.ts
git commit -m "string-hit-test: pure-logic hit-tester for drag-strum"
```

---

### Task 5.3: Hoist pointer handling to `QanunInstrument` + drag-strum interaction

**Why:** Current pointer handling is per-button with capture; capture is incompatible with drag-strum (it forces all events to stay on the original button). Drop capture and listen at the QanunInstrument level.

**Files:**
- Modify: `app/src/qanun/StringRow.tsx`
- Modify: `app/src/qanun/QanunInstrument.tsx`

- [ ] **Step 1: Strip pointer handling from `StringRow`**

In `StringRow.tsx`, remove the `useRef<boolean>(false)` activeRef + the pointer event handlers + the capture calls. The pluck button becomes a plain element with a `data-string-index` attribute and an `aria-label`. The visual feedback (`string-row__pluck-line` thickening on `--flashing`) is driven by props as before.

```tsx
<button
  type="button"
  className="string-row__pluck"
  data-string-index={s.index}
  // No pointer handlers here — handled at QanunInstrument level.
  onContextMenu={(e) => e.preventDefault()}
  aria-label={`Pluck ${perde.name}`}
>
  <span className="string-row__pluck-line" aria-hidden="true" />
</button>
```

Also remove the `onPress` and `onRelease` callbacks from the `Props` interface (no longer used — replaced by the document-level handler). Keep `onStep` (mandal step button still works the old way).

- [ ] **Step 2: Add document-level pointer handling to `QanunInstrument`**

Replace the pointer-related logic in `QanunInstrument.tsx`. The component already has `pressString(stringIndex)` and `releaseString(stringIndex)`. Add a single `useEffect` that wires `pointerdown` / `pointermove` / `pointerup` on the instrument's root element. Track which string is currently held and which strings have already fired in the current drag.

```tsx
// Inside QanunInstrument, after pressString/releaseString are defined:
const rootRef = useRef<HTMLDivElement | null>(null);

useEffect(() => {
  const root = rootRef.current;
  if (!root) return;

  // Currently sounding string under the pointer (single-pointer model).
  let current: number | null = null;
  let pointerActive = false;

  const findStringIndexAtPoint = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const btn = el.closest('.string-row__pluck') as HTMLElement | null;
    if (!btn) return null;
    const v = btn.getAttribute('data-string-index');
    if (v == null) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const onPointerDown = (e: PointerEvent) => {
    const idx = findStringIndexAtPoint(e.clientX, e.clientY);
    if (idx == null) return;
    e.preventDefault();
    pointerActive = true;
    current = idx;
    pressString(idx);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!pointerActive) return;
    const idx = findStringIndexAtPoint(e.clientX, e.clientY);
    if (idx === current) return;
    if (current != null) releaseString(current);
    current = idx;
    if (idx != null) pressString(idx);
  };

  const onPointerUp = () => {
    if (!pointerActive) return;
    pointerActive = false;
    if (current != null) releaseString(current);
    current = null;
  };

  // Attach pointerdown to root only; move + up listen on window so a
  // drag that leaves the instrument doesn't hang the gesture.
  root.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);

  return () => {
    root.removeEventListener('pointerdown', onPointerDown);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    if (current != null) releaseString(current);
  };
}, [pressString, releaseString]);
```

Wrap the rendered `<div className="qanun-instrument">` with `ref={rootRef}`. Remove the now-unused `onPress` / `onRelease` props passed into each `StringRow`.

- [ ] **Step 3: Type-check + build**

Run: `cd app && bun run build`
Expected: success. If type errors point to the removed `onPress`/`onRelease` props, finish removing them.

- [ ] **Step 4: Smoke test in dev**

Run: `cd app && bun run dev`

In browser:
1. Click + hold on a string's pluck button — sounds + sustains. Lamp glows.
2. Release — note rings out (ADSR R).
3. Click + drag across multiple rows — each string in turn sustains while pointer is over it; previous string release-tails ring under each new pluck. Sounds like a strum.
4. Drag onto the mandal track or perde column — does NOT trigger.
5. On a touchscreen / trackpad: same gesture works.
6. Release pointer mid-drag (off any button) — current string releases, no stuck note.
7. Multi-key keyboard play still works alongside.

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add app/src/qanun/StringRow.tsx app/src/qanun/QanunInstrument.tsx
git commit -m "Drag-strum: hoist pointer to QanunInstrument, hit-test via elementFromPoint"
```

---

## Phase 6 — Polish

### Task 6.1: Visual style pass

**Files:**
- Modify: `app/src/styles/istanbul-brutalist.css`

- [ ] **Step 1: Add CSS custom properties for the console palette**

Find the `:root { ... }` block (or top of the file) and add:

```css
:root {
  /* ...existing tokens... */
  --console-panel:    #1a1614;
  --console-panel-2:  #14110f;
  --console-card:     rgba(247, 240, 220, 0.03);
  --saffron:          #f4a52a;
  --silk-screen:      rgba(247, 240, 220, 0.7);
}
```

Update existing rules in the console / module CSS to reference these tokens instead of hardcoded hex.

- [ ] **Step 2: Add knob detents (4 small dots around the rim)**

Update the `.knob__face` rule and add a `.knob__face::before` (or use a background SVG). For minimum diff, a CSS gradient ring works:

```css
.knob__face {
  position: relative;
  /* ...existing... */
}
.knob__face::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  background:
    radial-gradient(2px 2px at 50% 0%, var(--silk-screen) 100%, transparent 100%) no-repeat,
    radial-gradient(2px 2px at 100% 50%, var(--silk-screen) 100%, transparent 100%) no-repeat,
    radial-gradient(2px 2px at 50% 100%, var(--silk-screen) 100%, transparent 100%) no-repeat,
    radial-gradient(2px 2px at 0% 50%, var(--silk-screen) 100%, transparent 100%) no-repeat;
  opacity: 0.3;
  pointer-events: none;
}
```

- [ ] **Step 3: Polish dividers + signal-flow arrows in console**

Tweak the existing `.console-module__arrow` to render slightly larger and brighter at the divider line:

```css
.console-module__arrow {
  position: absolute;
  right: -8px; top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  color: var(--saffron);
  opacity: 0.6;
  text-shadow: 0 0 4px rgba(244, 165, 42, 0.4);
}
```

- [ ] **Step 4: Build + visual check**

Run: `cd app && bun run build && bun run dev`

In browser, inspect: knob detents visible, signal-flow arrows showing between modules, palette consistent.

Stop dev server.

- [ ] **Step 5: Commit**

```bash
git add app/src/styles/istanbul-brutalist.css
git commit -m "Console polish: palette tokens, knob detents, signal-flow arrows"
```

---

### Task 6.2: Active-modulation pulse on knobs

**Why:** The Knob component already accepts a `modulated` prop. Wire it up so a knob whose param is being modulated (e.g. cutoff with LFO depth > 0 routed to it) gets the pulse animation. Visual feedback that LFOs are doing something.

**Files:**
- Modify: `app/src/synth/modules/FilterModule.tsx`
- Modify: `app/src/synth/modules/AmpModule.tsx`
- Modify: `app/src/synth/modules/OscModule.tsx`

- [ ] **Step 1: Thread an `isModulated(dest)` helper into the modules**

In `App.tsx`, derive a small helper from the LFO config and pass it down:

```tsx
const isModulated = (dest: 'pitch' | 'filter' | 'amp') =>
  (cfg.lfo1.depth > 0 && cfg.lfo1.destination === dest) ||
  (cfg.lfo2.depth > 0 && cfg.lfo2.destination === dest);
```

Pass `isModulated` into `OscModule`, `FilterModule`, `AmpModule`:
- OscModule: `modulatedPitch={isModulated('pitch')}` — apply to the octave knob
- FilterModule: `modulatedCutoff={isModulated('filter')}` — apply to the cutoff knob
- AmpModule: `modulatedAmp={isModulated('amp')}` — apply to the S knob (visible during sustain)

- [ ] **Step 2: Update each module to consume the prop**

Add the new optional prop to each module's `Props` interface, default to `false`, pass it to the relevant `<Knob ... modulated={...} />`.

- [ ] **Step 3: Build + smoke test**

Run: `cd app && bun run build && bun run dev`

In browser:
1. MOD → LFO1: rate=2, depth=0.5, dest=filter.
2. Cutoff knob's saffron indicator line should now pulse.
3. Switch dest=pitch → octave knob pulses, cutoff stops.
4. Switch dest=amp → AMP S knob pulses.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add app/src/App.tsx \
        app/src/synth/modules/OscModule.tsx \
        app/src/synth/modules/FilterModule.tsx \
        app/src/synth/modules/AmpModule.tsx
git commit -m "Pulse knob indicator when its param is being LFO-modulated"
```

---

### Task 6.3: Touch verification + final smoke test

**Files:** none (verification task)

- [ ] **Step 1: Build production bundle**

Run: `cd app && bun run build`
Note bundle size for the changelog/PR.

- [ ] **Step 2: Run dev with network exposure**

Run: `cd app && bun run dev --host`

Open the LAN URL on a tablet or phone (or open Chrome DevTools' device-mode emulation in desktop).

- [ ] **Step 3: Manual touch test plan**

On the touch device:
1. Tap a string — sustains while finger is down, releases on lift. Lamp visible.
2. Drag finger across rows — strum sounds correct, each row's lamp lights as the finger crosses it.
3. Tap a knob, drag up — value changes.
4. Double-tap a knob — resets.
5. Tap Tab equivalent (the on-screen ▾ button) — console toggles.
6. Twist filter cutoff while holding a sustained note — tone sweeps live.
7. Crank reverb wet + delay wet + delay feedback at high values — no runaway clip lamp lights but never blows up.

Stop dev server.

- [ ] **Step 4: Final test suite + build**

Run:
```bash
cd app && bun run test && bun run build
```
Expected: all tests pass, build succeeds.

- [ ] **Step 5: Commit + push final state**

```bash
git status   # should be clean unless test/build produced changes
git push origin main
```

The GitHub Pages deploy workflow at `.github/workflows/deploy.yml` will publish the production build automatically.

---

---

## Phase 7 — Legato voice mode

### Task 7.1: Add `voiceMode` + `glideMs` to MachineConfig + OSC module UI

**Why:** Surface the toggle and the portamento time knob so users can switch from poly to legato mode and tune the glide.

**Files:**
- Modify: `app/src/App.tsx`
- Modify: `app/src/synth/modules/OscModule.tsx`

- [ ] **Step 1: Extend `MachineConfig` and per-machine defaults**

In `App.tsx`, add to `MachineConfig`:

```ts
interface MachineConfig {
  // ...existing fields
  voiceMode: 'poly' | 'legato';
  glideMs: number;       // portamento time in legato mode (5..300)
}
```

In `machineDefaults(id)`, add to the `universal` map for every machine:

```ts
voiceMode: 'poly' as const,
glideMs: 60,
```

- [ ] **Step 2: Pass `voiceMode` + `glideMs` to OscModule**

In `App.tsx`, update the OSC module invocation:

```tsx
<OscModule
  // ...existing props
  voiceMode={cfg.voiceMode}
  glideMs={cfg.glideMs}
  onVoiceMode={(voiceMode) => updateCfg({ voiceMode })}
  onGlideMs={(glideMs) => updateCfg({ glideMs })}
/>
```

- [ ] **Step 3: Render the selector + knob in `OscModule`**

In `OscModule.tsx`, add to `Props`:

```ts
voiceMode: 'poly' | 'legato';
glideMs: number;
onVoiceMode: (m: 'poly' | 'legato') => void;
onGlideMs: (ms: number) => void;
```

In the JSX, after the body knob and before the machine-specific knobs, add:

```tsx
<label className="osc-module__select">
  <span>voice</span>
  <select
    value={voiceMode}
    onChange={(e) => onVoiceMode(e.target.value as 'poly' | 'legato')}
  >
    <option value="poly">poly</option>
    <option value="legato">legato</option>
  </select>
</label>
<Knob
  label="glide"
  unit="ms"
  value={glideMs}
  min={5}
  max={300}
  log
  defaultValue={60}
  format={(v) => `${Math.round(v)}ms`}
  onChange={onGlideMs}
/>
```

- [ ] **Step 4: Thread `voiceMode` + `glideMs` to QanunInstrument and the keyboard hook**

In `App.tsx`, pass into `QanunInstrument`:

```tsx
voiceMode={cfg.voiceMode}
glideMs={cfg.glideMs}
```

In `QanunInstrument.tsx`, add to `Props` (both optional with defaults):

```ts
voiceMode?: 'poly' | 'legato';
glideMs?: number;
```

Thread into `useKeyboardInput({ voiceMode, glideMs, ... })`. (Task 7.2 implements the consuming logic.)

- [ ] **Step 5: Add a placeholder `voiceMode` arg to `UseKeyboardInputArgs`**

In `app/src/keyboard/use-keyboard-input.ts`, add to `UseKeyboardInputArgs`:

```ts
voiceMode?: 'poly' | 'legato';
glideMs?: number;
```

Don't change behavior yet — Task 7.2 wires the legato code path. Default `voiceMode = 'poly'` keeps everything working.

- [ ] **Step 6: Build + smoke**

Run: `cd app && bun run build && bun run dev`

Expected: `voice` selector appears in OSC module, `glide` knob next to it. Switching voice/glide doesn't change behavior yet (legato logic lands in 7.2 — confirms wiring only).

- [ ] **Step 7: Commit**

```bash
git add app/src/App.tsx \
        app/src/synth/modules/OscModule.tsx \
        app/src/qanun/QanunInstrument.tsx \
        app/src/keyboard/use-keyboard-input.ts
git commit -m "Legato wiring: voiceMode + glideMs through MachineConfig and keyboard hook (no logic yet)"
```

---

### Task 7.2: Implement legato voice management in keyboard hook

**Why:** With wiring in place, add the actual mono-voice + key-stack logic. Switching `voiceMode` to `legato` should cause one voice at a time, gliding between keys without envelope retrigger.

**Files:**
- Modify: `app/src/keyboard/use-keyboard-input.ts`

- [ ] **Step 1: Add mono-voice + key-stack refs**

Near the other refs in `useKeyboardInput`, add:

```ts
interface MonoVoiceState {
  handle: MachineHandle;
  stringIndex: number;
  baseHz: number;
  currentHz: number;
  baseMandalIdx: number;
  currentMandalIdx: number;
}
const monoVoiceRef = useRef<MonoVoiceState | null>(null);
const monoStackRef = useRef<{ code: string; stringIndex: number }[]>([]);
```

- [ ] **Step 2: Branch `startScaleNote` on `voiceMode`**

In `startScaleNote(code, stringIndex)`, after computing `baseCents` / `hz` / `baseMandalIdx`, check the mode:

```ts
const a = argsRef.current;
const isLegato = a.voiceMode === 'legato';
const glideMs = a.glideMs ?? 60;

if (!isLegato) {
  // existing poly path: triggerMachineSustained, register in heldNotesRef, etc.
  return;
}

// legato path
const stack = monoStackRef.current;
// remove any prior entry for this code (key auto-repeat already filtered upstream)
const existingIdx = stack.findIndex((e) => e.code === code);
if (existingIdx >= 0) stack.splice(existingIdx, 1);
stack.push({ code, stringIndex });

if (!monoVoiceRef.current) {
  // first key in a held-group → trigger fresh voice
  const handle = triggerMachineSustained(a.machineId, {
    audioContext: a.audioContext,
    destination: a.destination,
    frequencyHz: hz,
    velocity: 0.85,
    brightness: a.brightness, body: a.body,
    adsr: a.adsr, filter: a.filter, filterEnv: a.filterEnv,
    lfo1: a.lfo1, lfo2: a.lfo2,
    octaveOffset: a.octaveOffset, params: a.machineParams,
  });
  monoVoiceRef.current = {
    handle, stringIndex,
    baseHz: hz, currentHz: hz,
    baseMandalIdx, currentMandalIdx: baseMandalIdx,
  };
} else {
  // subsequent key → glide existing voice to new pitch (no retrigger)
  monoVoiceRef.current.handle.setFrequency(hz, glideMs);
  monoVoiceRef.current.stringIndex = stringIndex;
  monoVoiceRef.current.currentHz = hz;
  monoVoiceRef.current.baseMandalIdx = baseMandalIdx;
  monoVoiceRef.current.currentMandalIdx = baseMandalIdx;
}
activeStringRef.current = stringIndex;
a.onPluck?.(stringIndex);
emitSustainingChange();
```

- [ ] **Step 3: Branch `releaseScaleNote` on `voiceMode`**

In `releaseScaleNote(code)`:

```ts
const a = argsRef.current;
const isLegato = a.voiceMode === 'legato';
if (!isLegato) {
  // existing poly path
  return;
}
const stack = monoStackRef.current;
const idx = stack.findIndex((e) => e.code === code);
if (idx < 0) return;
stack.splice(idx, 1);

if (stack.length === 0) {
  monoVoiceRef.current?.handle.release();
  monoVoiceRef.current = null;
  emitSustainingChange();
  return;
}
// glide to new stack top
const top = stack[stack.length - 1];
const v = monoVoiceRef.current;
if (!v) return;
const baseCents = baseSoundingCents(top.stringIndex);
const newHz = centsToHz(a.kararHz, baseCents);
v.handle.setFrequency(newHz, a.glideMs ?? 60);
v.stringIndex = top.stringIndex;
v.currentHz = newHz;
const s = a.state.strings[top.stringIndex];
const row = s ? a.maqam.rows.find((r) => r.degree === s.rowDegree) : null;
const legal = row?.legal_positions ?? [];
v.baseMandalIdx = legal.length > 0 && s
  ? nearestMandalPosition(s.currentCentsMid, legal).index
  : 0;
v.currentMandalIdx = v.baseMandalIdx;
activeStringRef.current = top.stringIndex;
emitSustainingChange();
```

- [ ] **Step 4: Update `emitSustainingChange` to include the mono voice**

Modify `emitSustainingChange` so legato mode reports the mono voice's stringIndex into the sustaining set:

```ts
const emitSustainingChange = () => {
  const a = argsRef.current;
  if (!a.onSustainingChange) return;
  const set = new Set<number>();
  // poly voices
  for (const note of heldNotesRef.current.values()) set.add(note.stringIndex);
  // legato voice
  if (monoVoiceRef.current) set.add(monoVoiceRef.current.stringIndex);
  a.onSustainingChange(set);
};
```

- [ ] **Step 5: Update modifier helpers to operate on the mono voice too**

`slideHeldNotesBy(delta, glideMs)` and `slideHeldNotesToBase(glideMs)` currently iterate `heldNotesRef`. Add a parallel branch for the mono voice:

```ts
const slideHeldNotesBy = (delta: number, glideMs = 30) => {
  const a = argsRef.current;
  // existing iteration over heldNotesRef.current.forEach(...)
  // ...

  // mono voice path
  const v = monoVoiceRef.current;
  if (v) {
    const s = a.state.strings[v.stringIndex];
    if (!s) return;
    const row = a.maqam.rows.find((r) => r.degree === s.rowDegree);
    if (!row) return;
    const legal = row.legal_positions;
    if (legal.length === 0) return;

    let targetIdx: number;
    if (delta === 0) {
      const canonicalIdx = legal.findIndex((p) => p.is_canonical);
      targetIdx = canonicalIdx >= 0 ? canonicalIdx : v.baseMandalIdx;
      pinnedMandalRef.current.delete(v.stringIndex);
      v.baseMandalIdx = targetIdx;
    } else {
      const dir = (delta > 0 ? 1 : -1) as 1 | -1;
      targetIdx = v.baseMandalIdx;
      for (let i = 0; i < Math.abs(delta); i++) {
        targetIdx = stepMandalIndex(targetIdx, dir, legal);
      }
    }
    const diff = targetIdx - v.currentMandalIdx;
    if (diff !== 0) {
      const stepDir = (diff > 0 ? 1 : -1) as 1 | -1;
      for (let i = 0; i < Math.abs(diff); i++) {
        a.state.stepMandal(v.stringIndex, stepDir);
      }
    }
    v.currentMandalIdx = targetIdx;
    const targetCents = soundingCentsAt(v.stringIndex, targetIdx);
    const targetHz = centsToHz(a.kararHz, targetCents);
    v.currentHz = targetHz;
    v.handle.setFrequency(targetHz, glideMs);
  }
};
```

Apply the equivalent mono-voice block to `slideHeldNotesToBase`.

- [ ] **Step 6: Update onBlur / cleanup paths**

In the cleanup / blur handlers, also release the mono voice:

```ts
const releaseAllNotes = () => {
  // existing heldNotesRef cleanup
  monoVoiceRef.current?.handle.release();
  monoVoiceRef.current = null;
  monoStackRef.current = [];
  emitSustainingChange();
};
```

- [ ] **Step 7: Build + smoke test**

Run: `cd app && bun run build && bun run dev`

In browser:
1. Default mode is poly — multiple keys = chord (current behavior).
2. Switch OSC → voice → legato. Glide = 60.
3. Press A — sustains.
4. Press S while still holding A — pitch glides to S, no fresh attack.
5. Release S, A still held — pitch glides back to A.
6. Release A — voice releases (ADSR R).
7. Press D, then F, then G in quick succession — each glide happens with no retrigger.
8. With H held in legato, modifier slides: hold A, then press M (carpma down) → voice slides down; release M → slides back. Same as poly.
9. With no notes held in legato, press H (no-held + modifier = persistent flip) → string state shifts, no audio. Then press A → sounds at modified pitch. Same as poly.
10. Switch back to poly mid-play — releases all monos, then poly triggers per-key as today.

Stop dev server.

- [ ] **Step 8: Commit**

```bash
git add app/src/keyboard/use-keyboard-input.ts
git commit -m "Legato voice mode: mono voice + key stack, no envelope retrigger"
```

---

## Risks + mitigations

- **Phase 1 master-bus rewire is the highest-risk change.** The limiter at the tail is the safety net; smoke testing with the current UI before any layout disruption catches problems early. The test in Task 1.4 explicitly verifies "reverb + delay both fully wet doesn't run away."
- **Phase 5 pointer refactor risks regressing keyboard-mouse parity.** The `ExternalNoteRegistry` already abstracts shared note state, so the keyboard path stays untouched. Risk is contained to the mouse / touch surface.
- **Phase 3 can leak state if module props aren't lifted carefully.** Mitigation: keep `MachineConfig` map in `App.tsx` exactly as today; pass into modules instead of `SynthControls`.
- **`MACHINE_PARAMS` schema and machine internals can drift.** If a machine doesn't yet wire a particular param, leave a `// TODO: params.X currently unused — see plan task 1.2` comment so the UI works (the schema is the source of truth) but the audio is best-effort. Phase 1 prioritises the ship-able subset.

## Out of scope

- Routing modes (`parallel | series` toggle is dropped; only parallel ships)
- Real disconnect-style bypass for inserts (always-in-path with mix=0 is sufficient)
- Per-string envelope-amplitude scaling on the playing lamp (brightness modulation by envelope phase) — v2 polish
- Mobile layout ergonomics beyond touch-input parity (small screens may still need the right panel back as a separate work item)
