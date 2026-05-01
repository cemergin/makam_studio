// Shared machine-config helpers — filter, filter envelope, LFOs.
//
// Every "sustained" machine variant has the same downstream shape:
//
//   oscillators → filter (HP/BP/LP) → ampEnv → output
//                    ↑
//                filterEnv → modulates cutoff (multiplicative)
//                LFOs     → can route to pitch / filter / amp / off
//
// This file owns:
//   - shared types (FilterConfig, FilterEnv, LfoConfig, LfoDest, ...)
//   - scheduleFilterEnv(): schedules the cutoff modulation
//   - attachLfos(): builds the 0..2 LFO graph and returns a cleanup
//
// Direct AudioParam scheduling is used for the filter env (no
// ConstantSourceNode tricks). The cutoff at any time is:
//
//     baseCutoff × 2^(envValue × amount × 2)
//
// where envValue is the standard ADSR shape (0..1) and amount is in
// [-1, +1] (negative = inverted sweep). amount × 2 gives ±2 octaves.

export type FilterType = 'lp' | 'hp' | 'bp';

export interface FilterConfig {
  type: FilterType;
  cutoff: number;     // Hz, 50..18000
  q: number;          // 0.1..18
}

export interface FilterEnv {
  a: number;          // attack seconds
  d: number;          // decay seconds
  s: number;          // sustain 0..1
  r: number;          // release seconds (currently unused — filter env doesn't re-trigger on release)
  amount: number;     // -1..+1, ±2 octaves of cutoff
}

export type OscType = 'sine' | 'triangle' | 'sawtooth' | 'square';
export type LfoDest = 'off' | 'pitch' | 'filter' | 'amp';

export interface LfoConfig {
  rate: number;       // Hz, 0.05..20
  shape: OscType;
  depth: number;      // 0..1 normalized
  destination: LfoDest;
}

export const DEFAULT_LFO: LfoConfig = {
  rate: 2,
  shape: 'sine',
  depth: 0,
  destination: 'off',
};

/** Schedule a multiplicative filter-cutoff envelope on top of the base
 *  cutoff. Uses setValueAtTime + exponentialRampToValueAtTime — clean,
 *  cheap, and doesn't rely on ConstantSourceNode summing. */
export function scheduleFilterEnv(
  filter: BiquadFilterNode,
  baseCutoff: number,
  env: FilterEnv,
  when: number,
): void {
  const amount = Math.max(-1, Math.min(1, env.amount));
  if (amount === 0) {
    filter.frequency.setValueAtTime(baseCutoff, when);
    return;
  }
  // factor = 2^(envValue × amount × 2)  → envValue ∈ {0, 1, sustain}
  const factorAt = (envValue: number) =>
    Math.max(50, Math.min(18000, baseCutoff * Math.pow(2, envValue * amount * 2)));

  const peakFactor = factorAt(1);
  const sustainFactor = factorAt(Math.max(0, Math.min(1, env.s)));

  const a = Math.max(0.001, env.a);
  const d = Math.max(0.001, env.d);
  // Start at base (env=0).
  filter.frequency.cancelScheduledValues(when);
  filter.frequency.setValueAtTime(baseCutoff, when);
  filter.frequency.exponentialRampToValueAtTime(peakFactor, when + a);
  filter.frequency.exponentialRampToValueAtTime(sustainFactor, when + a + d);
}

interface AttachLfosArgs {
  ctx: AudioContext;
  when: number;
  /** AudioParams to modulate when destination='pitch' (in cents). */
  pitchTargets: AudioParam[];
  /** Filter to modulate when destination='filter'. */
  filter: BiquadFilterNode;
  baseCutoff: number;
  /** Amp env gain to modulate when destination='amp' (tremolo). */
  ampEnv: GainNode;
  ampPeak: number;
  lfo1?: LfoConfig;
  lfo2?: LfoConfig;
}

interface LfoNodes {
  osc: OscillatorNode;
  depth: GainNode;
  cfg: LfoConfig;
}

export interface AttachedLfos {
  cleanup(): void;
}

/** Build a 1- or 2-LFO graph and connect it according to each LFO's
 *  destination. Returns a cleanup function. Caller is expected to
 *  invoke cleanup() after the voice's release tail finishes. */
export function attachLfos(args: AttachLfosArgs): AttachedLfos {
  const { ctx, when, pitchTargets, filter, baseCutoff, ampEnv, ampPeak } = args;
  const built: LfoNodes[] = [];

  const buildOne = (cfg: LfoConfig | undefined) => {
    if (!cfg || cfg.destination === 'off' || cfg.depth <= 0) return;
    const osc = ctx.createOscillator();
    osc.type = cfg.shape;
    osc.frequency.value = Math.max(0.05, Math.min(20, cfg.rate));
    const depth = ctx.createGain();
    osc.connect(depth);

    switch (cfg.destination) {
      case 'pitch': {
        // depth × 100 cents into each oscillator's detune param.
        depth.gain.value = cfg.depth * 100;
        for (const p of pitchTargets) {
          depth.connect(p);
        }
        break;
      }
      case 'filter': {
        // depth × baseCutoff × 0.5 → ±50% sweep at depth=1.
        depth.gain.value = cfg.depth * baseCutoff * 0.5;
        depth.connect(filter.frequency);
        break;
      }
      case 'amp': {
        // depth × peak × 0.3 → tremolo capped at 30% peak.
        depth.gain.value = cfg.depth * ampPeak * 0.3;
        depth.connect(ampEnv.gain);
        break;
      }
    }
    osc.start(when);
    built.push({ osc, depth, cfg });
  };

  buildOne(args.lfo1);
  buildOne(args.lfo2);

  return {
    cleanup() {
      for (const n of built) {
        try { n.osc.stop(); } catch { /* */ }
        try { n.osc.disconnect(); } catch { /* */ }
        try { n.depth.disconnect(); } catch { /* */ }
      }
    },
  };
}
