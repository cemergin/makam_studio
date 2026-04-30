// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Sequencer module — timing + scheduling, isolated from any Web
// Audio dependency.
//
// Parameterization (vs. BeatForge):
//
//   The original `Sequencer` was tightly coupled to BeatForge's
//   pattern schema (`Step = 0 | 1 | 2`, `Sequence = Step[][]`,
//   accents-via-velocity, an EventBus that produced
//   TriggerEvent / StepEvent / BarEvent / TransportEvent at fixed
//   addresses).
//
//   musical-core decouples this with a generic SequencerPattern shape
//   and a single `onStep(track, step, time)` callback. The sequencer
//   itself doesn't know what voices exist — the consumer wires steps
//   to whatever voices it has registered. Optional `onBar` and
//   `onTransport` callbacks expose the same lifecycle hooks the
//   BeatForge bus published.
//
//   Per-track step counts are still supported (a track can have its
//   own `steps.length` for polyrhythmic / poly-meter rows) but the
//   common case (`tracks` all share `steps`) is the no-config default.
//
// What the sequencer DOES NOT own:
//
//   - AudioContext or any Web Audio nodes
//   - Voice machines (it calls `onStep`; whoever provided the
//     callback turns step events into audio)
//   - The tick driver (a worker, a setTimeout loop, or a test harness
//     pumps tick() — see SequencerOptions.driver).

/** A single step. `on` is the gate; `velocity` is 0..1; `pitch` is
 *  optional Hz for melodic tracks. Apps free to ignore fields they
 *  don't use. */
export interface SequencerStep {
  on: boolean;
  velocity?: number;
  pitch?: number;
}

/** A sequencer track — a row of steps tagged with a `voiceId` the
 *  consumer maps to whatever it wants. The sequencer never inspects
 *  `voiceId`; it's pass-through metadata for the `onStep` callback. */
export interface SequencerTrack {
  voiceId: string;
  /** Per-track step grid. If omitted at construction time the track
   *  inherits the pattern's `steps` count. Length CAN differ between
   *  tracks (poly-meter); when it does, each track ticks at its own
   *  rate proportional to the bar length. */
  steps: SequencerStep[];
}

export interface SequencerPattern {
  /** Master step count per bar, e.g. 16. Tracks default to this if
   *  `tracks[i].steps.length` matches; otherwise they tick on their
   *  own ring. */
  steps: number;
  /** Beats per minute, in step-BPM (i.e., `bpm` ticks at the rate of
   *  the pattern's smallest subdivision). 16-step grid + bpm 480 →
   *  16th notes at 120 quarter-BPM. Use `naturalToStepBpm` from
   *  `../tempo` to convert from natural BPM. */
  bpm: number;
  /** Pattern's smallest subdivision — used for step-time math. Default 16. */
  stepUnit?: 2 | 4 | 8 | 16;
  /** Swing 0.5..0.75 (0.5 = straight, 0.6 = hip-hop swing, 0.67 = triplet). */
  swing?: number;
  tracks: SequencerTrack[];
}

/** Step-callback payload — emitted at scheduling time, NOT at audible
 *  time. The consumer should pass `time` directly to Web Audio's
 *  `start(time)` / `setValueAtTime(_, time)` to get sample-accurate
 *  scheduling. */
export interface StepCallback {
  (track: SequencerTrack, step: SequencerStep, opts: {
    /** Audio-clock time the step plays at. */
    time: number;
    /** Step index inside the track's ring. */
    stepIndex: number;
    /** Track index inside the pattern. */
    trackIndex: number;
  }): void;
}

export interface SequencerOptions {
  /** Current time in seconds. The sequencer calls this every tick.
   *  Hosts wire it to AudioContext.currentTime (or perf.now()/1000
   *  for tests). */
  clock: () => number;
  /** Look-ahead window in seconds — how far past `clock()` the
   *  sequencer schedules events. Default 0.30. */
  scheduleAheadS?: number;
  /** Called for every active (`on === true`) step at scheduling time. */
  onStep: StepCallback;
  /** Called once per bar boundary. Optional. */
  onBar?: (bar: number, time: number) => void;
  /** Called on play / stop transitions. Optional. */
  onTransport?: (action: 'play' | 'stop', time: number) => void;
}

export interface Sequencer {
  // ── Pattern + transport ────────────────────────────────────────
  setPattern(pattern: SequencerPattern): void;
  setBpm(bpm: number): void;
  setSwing(swing: number): void;
  /** Begin scheduling. `startTime` is when bar 1 begins (in clock
   *  units). If omitted, `clock() + 0.06` is used. */
  play(opts?: { startTime?: number; countInBars?: number }): void;
  stop(): void;

  // ── Read-only state ────────────────────────────────────────────
  running(): boolean;
  bpm(): number;
  swing(): number;
  /** Time that bar 1 begins (post-count-in). 0 before play(). */
  startTime(): number;
  /** Audible bar number RIGHT NOW. 0 before play / during count-in. */
  audibleBar(): number;
  /** Audible step on the master grid (track 0). -1 before play. */
  audibleStep(): number;
  /** Audible step for a specific track index. */
  audibleStepFor(trackIndex: number): number;
  stepSeconds(): number;
  barSeconds(): number;

  // ── Tick driver ────────────────────────────────────────────────
  /** Pump the scheduler. Hosts call this on a worker postMessage,
   *  setTimeout, or rAF cadence. Idempotent when not running. */
  tick(): void;
  /** Re-anchor every track to the start of the next bar so all
   *  tracks reset to step 0 in unison. No-op when not playing. */
  restartFromNextBar(): void;
}
