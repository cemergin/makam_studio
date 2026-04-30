// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Sequencer implementation — anchor-derive scheduler with cooperative
// catch-up. Mirrors the timing math from BeatForge's sequencer,
// retargeted at a generic SequencerPattern + onStep callback so any
// app can wire up its own voice scheme.
//
// Why anchor-derive instead of `+= stepSec`:
//   nextNoteTimes[ch] = anchorTimes[ch] + (nextIdx - anchorIdx) * stepSec
// is bounded float-add — accumulated drift stays at the FPU's
// per-multiply error, not the per-add error × N steps. setBpm
// re-anchors each row at its current nextNoteTime so the new rate
// takes effect from "now" without retroactively warping.
//
// Why cooperative catch-up: a stalled tick (worker backgrounded,
// long GC, page hidden) can leave only SOME rows past the clock.
// Snapping just the laggers to (now + 5ms) splits the grid in two.
// Instead we pick one recoverT and snap every row that's behind to
// the same instant — phase reconverges within < 5 ms of any stall.

import type {
  Sequencer,
  SequencerOptions,
  SequencerPattern,
  SequencerStep,
  SequencerTrack,
} from './types';

const DEFAULT_SCHEDULE_AHEAD_S = 0.30;
const STALL_RECOVERY_S = 0.005;

const EMPTY_PATTERN: SequencerPattern = {
  steps: 16,
  bpm: 480, // 16th notes at 120 natural BPM
  stepUnit: 16,
  swing: 0.5,
  tracks: [],
};

export function makeSequencer(opts: SequencerOptions): Sequencer {
  const { clock, onStep, onBar, onTransport } = opts;
  const scheduleAheadS = opts.scheduleAheadS ?? DEFAULT_SCHEDULE_AHEAD_S;

  // ── Sequencer state ─────────────────────────────────────────────
  let running = false;
  let pattern: SequencerPattern = EMPTY_PATTERN;
  let bpm = pattern.bpm;
  let stepUnit: 2 | 4 | 8 | 16 = pattern.stepUnit ?? 16;
  let stepsPerBar = pattern.steps;
  let swing = pattern.swing ?? 0.5;

  // Per-track scheduler state. Length tracks pattern.tracks.length —
  // mutated in place via push/pop so array references stay stable
  // across ticks (cheap allocation, simpler debugging).
  const nextNoteTimes: number[] = [];
  const nextIdxs: number[] = [];
  const anchorTimes: number[] = [];
  const anchorIdxs: number[] = [];

  let _startTime = 0;
  let lastEmittedBar = 0;

  // ── Math helpers ────────────────────────────────────────────────
  const stepSeconds = (): number => 240 / (bpm * stepUnit);
  const barSeconds = (): number => stepSeconds() * stepsPerBar;
  const trackStepSec = (trackIdx: number): number => {
    const track = pattern.tracks[trackIdx];
    const ringSteps = track?.steps.length || stepsPerBar;
    if (ringSteps <= 0) return 0;
    return barSeconds() / ringSteps;
  };

  // ── Re-anchor primitive ─────────────────────────────────────────
  const reanchorAll = (): void => {
    if (!running) return;
    for (let i = 0; i < nextNoteTimes.length; i++) {
      anchorTimes[i] = nextNoteTimes[i];
      anchorIdxs[i] = nextIdxs[i];
    }
  };

  // Sync per-track scheduler arrays to the pattern's track count.
  const syncRowCount = (): void => {
    const target = pattern.tracks.length;
    const t0 = running ? clock() + 0.01 : _startTime;
    while (nextNoteTimes.length < target) {
      nextNoteTimes.push(t0);
      nextIdxs.push(0);
      anchorTimes.push(t0);
      anchorIdxs.push(0);
    }
    while (nextNoteTimes.length > target) {
      nextNoteTimes.pop();
      nextIdxs.pop();
      anchorTimes.pop();
      anchorIdxs.pop();
    }
  };

  // ── Public API ──────────────────────────────────────────────────
  const setPattern = (next: SequencerPattern): void => {
    const prevTrackLengths = pattern.tracks.map((t) => t.steps.length);
    const newTracks = next.tracks;
    const newStepsPerBar = next.steps;

    if (running) {
      const bar = barSeconds();
      const elapsed = clock() - _startTime;
      const barsCompleted = elapsed > 0 ? Math.floor(elapsed / bar) + 1 : 0;
      const nextBarStart = _startTime + barsCompleted * bar;
      // When a track's length changes (or the master step count
      // changes), snap that track to step 0 at the next bar boundary
      // so the new cycle aligns musically. Other tracks ride through.
      const masterChanged = newStepsPerBar !== stepsPerBar;
      for (let i = 0; i < newTracks.length; i++) {
        const prevLen = prevTrackLengths[i] ?? 0;
        const newLen = newTracks[i]?.steps.length ?? 0;
        if (prevLen !== newLen || masterChanged) {
          if (i < nextNoteTimes.length) {
            nextNoteTimes[i] = nextBarStart;
            nextIdxs[i] = 0;
            anchorTimes[i] = nextBarStart;
            anchorIdxs[i] = 0;
          }
        }
      }
    }

    pattern = next;
    bpm = next.bpm;
    stepUnit = next.stepUnit ?? stepUnit;
    stepsPerBar = newStepsPerBar;
    swing = next.swing ?? swing;
    syncRowCount();
  };

  const setBpm = (b: number): void => {
    reanchorAll();
    bpm = b;
    pattern = { ...pattern, bpm: b };
  };
  const setSwing = (s: number): void => {
    swing = Math.max(0.5, Math.min(0.75, s));
    pattern = { ...pattern, swing };
  };

  const play = (playOpts: { startTime?: number; countInBars?: number } = {}): void => {
    if (running) return;
    running = true;
    syncRowCount();
    const countIn = Math.max(0, Math.floor(playOpts.countInBars ?? 0));
    const headRoom = playOpts.startTime ?? (clock() + 0.06);
    const start = headRoom + countIn * barSeconds();
    _startTime = start;
    lastEmittedBar = 0;
    for (let i = 0; i < nextNoteTimes.length; i++) {
      nextNoteTimes[i] = start;
      nextIdxs[i] = 0;
      anchorTimes[i] = start;
      anchorIdxs[i] = 0;
    }
    onTransport?.('play', start);
  };

  const stop = (): void => {
    if (!running) return;
    running = false;
    onTransport?.('stop', clock());
  };

  const audibleBar = (): number => {
    if (!running) return 0;
    const bar = barSeconds();
    if (bar <= 0) return 0;
    const elapsed = clock() - _startTime;
    if (elapsed < 0) return 0;
    return Math.floor(elapsed / bar) + 1;
  };

  const audibleStepFor = (trackIdx: number): number => {
    if (!running) return -1;
    const ss = trackStepSec(trackIdx);
    if (ss <= 0) return -1;
    const now = clock();
    if (now < _startTime) return -1;
    const track = pattern.tracks[trackIdx];
    const ringSteps = track?.steps.length || stepsPerBar;
    if (ringSteps <= 0) return -1;
    const anchorT = anchorTimes[trackIdx] ?? _startTime;
    const anchorI = anchorIdxs[trackIdx] ?? 0;
    const stepsSinceAnchor = Math.floor((now - anchorT) / ss);
    const globalIdx = anchorI + stepsSinceAnchor;
    return ((globalIdx % ringSteps) + ringSteps) % ringSteps;
  };

  const audibleStep = (): number => audibleStepFor(0);

  // ── The tick loop ───────────────────────────────────────────────
  const tick = (): void => {
    if (!running) return;
    const now = clock();
    const horizon = now + scheduleAheadS;
    const mainStepSec = stepSeconds();

    // Bar boundary detection — emit BarEvent for every bar that has
    // ticked past since the last emit. Long stalls get caught up in
    // one tick.
    const currentBar = audibleBar();
    if (currentBar > lastEmittedBar) {
      const bar = barSeconds();
      for (let b = lastEmittedBar + 1; b <= currentBar; b++) {
        onBar?.(b, _startTime + (b - 1) * bar);
      }
      lastEmittedBar = currentBar;
    }

    // Cooperative catch-up: if any track is behind, snap every track
    // that's behind to one shared recoverT so phase reconverges.
    let stalled = false;
    for (let ch = 0; ch < nextNoteTimes.length; ch++) {
      const track = pattern.tracks[ch];
      if (!track || track.steps.length === 0) continue;
      if (nextNoteTimes[ch] < now) { stalled = true; break; }
    }
    if (stalled) {
      const recoverT = now + STALL_RECOVERY_S;
      for (let ch = 0; ch < nextNoteTimes.length; ch++) {
        const track = pattern.tracks[ch];
        if (!track || track.steps.length === 0) continue;
        if (nextNoteTimes[ch] < recoverT) {
          nextNoteTimes[ch] = recoverT;
          anchorTimes[ch] = recoverT;
          anchorIdxs[ch] = nextIdxs[ch];
        }
      }
    }

    // Per-track scheduling.
    for (let ch = 0; ch < nextNoteTimes.length; ch++) {
      const track: SequencerTrack | undefined = pattern.tracks[ch];
      if (!track || track.steps.length === 0) continue;
      const ringSteps = track.steps.length;
      const stepSec = trackStepSec(ch);
      if (stepSec <= 0) continue;

      const isMainRate = ringSteps === stepsPerBar;
      const applySwing = isMainRate && stepUnit !== 4 && swing !== 0.5;

      while (nextNoteTimes[ch] < horizon) {
        let tPlay = nextNoteTimes[ch];
        if (applySwing && (nextIdxs[ch] % 2) === 1) {
          tPlay += (swing - 0.5) * 2 * mainStepSec;
        }
        const stepIdx = nextIdxs[ch] % ringSteps;
        const step: SequencerStep | undefined = track.steps[stepIdx];
        if (step?.on) {
          onStep(track, step, {
            time: tPlay,
            stepIndex: stepIdx,
            trackIndex: ch,
          });
        }

        nextIdxs[ch] += 1;
        nextNoteTimes[ch] = anchorTimes[ch]
          + (nextIdxs[ch] - anchorIdxs[ch]) * stepSec;
      }
    }
  };

  const restartFromNextBar = (): void => {
    if (!running) return;
    const bar = barSeconds();
    if (bar <= 0) return;
    const elapsed = clock() - _startTime;
    const barsCompleted = elapsed > 0 ? Math.floor(elapsed / bar) + 1 : 0;
    const nextBarStart = _startTime + barsCompleted * bar;
    for (let i = 0; i < nextNoteTimes.length; i++) {
      nextNoteTimes[i] = nextBarStart;
      nextIdxs[i] = 0;
      anchorTimes[i] = nextBarStart;
      anchorIdxs[i] = 0;
    }
  };

  return {
    setPattern, setBpm, setSwing,
    play, stop,
    running: () => running,
    bpm: () => bpm,
    swing: () => swing,
    startTime: () => _startTime,
    audibleBar, audibleStep, audibleStepFor,
    stepSeconds, barSeconds,
    tick, restartFromNextBar,
  };
}
