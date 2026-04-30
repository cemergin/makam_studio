// React hook wrapping a Sequencer's transport + tempo state.
//
// Parameterization (vs. BeatForge):
//
//   The original `useMetronome` was tightly coupled to BeatForge's
//   SoundEngine (`engine.setSwing`, `engine.setAccents`,
//   `engine.subscribeOnBar`, `engine.setMasterVolume`,
//   `engine.setNaturalBpm`), the BeatForge `useSession` hook, the
//   `Trainer` config type, the localStorage `getMasterVolume` /
//   `setMasterVolume` helpers, and the per-pattern `swingable` /
//   `stepUnit` / `timeSig` policies. About 75% of the file was
//   trainer/session/storage glue.
//
//   The musical-core port keeps just the parts every consumer needs:
//   BPM, swing, count-in, accents, tap tempo. All defaults are
//   parameters; storage and trainer cycles stay in the consuming app.
//
// Usage:
//
//   const seq = useMemo(() => makeSequencer({ ... }), []);
//   const m = useMetronome(seq, { initialBpm: 120 });
//   m.bpm, m.setBpm, m.handleTap, m.start(), m.stop(), ...

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Sequencer } from './sequencer';

const DEFAULT_TAP_WINDOW = 8;
const DEFAULT_TAP_MIN_TAPS = 2;
const DEFAULT_TAP_RESET_MS = 2000;

export interface UseMetronomeOptions {
  /** Initial BPM. Default 120. */
  initialBpm?: number;
  /** Initial swing 0.5..0.75. Default 0.5 (straight). */
  initialSwing?: number;
  /** Initial count-in bars. Default 0. */
  initialCountInBars?: number;
  /** Tap-tempo: how many of the most recent taps to median-average.
   *  Default 8. */
  tapWindow?: number;
  /** Minimum tap count before BPM is updated. Default 2. */
  tapMinTaps?: number;
  /** If a tap arrives more than this many ms after the last, the
   *  buffer resets (treated as a fresh tap stream). Default 2000. */
  tapResetMs?: number;
  /** Min BPM clamp on tap-tempo. Default 30. */
  minBpm?: number;
  /** Max BPM clamp on tap-tempo. Default 400. */
  maxBpm?: number;
}

export interface UseMetronome {
  // Transport
  playing: boolean;
  start: (opts?: { countInBars?: number }) => void;
  stop: () => void;

  // Tempo
  bpm: number;
  setBpm: (next: number | ((prev: number) => number)) => void;

  // Swing
  swing: number;
  setSwing: (next: number | ((prev: number) => number)) => void;

  // Count-in
  countInBars: number;
  setCountInBars: (n: number) => void;

  // Tap tempo
  handleTap: () => void;
  tapTimes: number[];
  resetTaps: () => void;
}

export function useMetronome(
  sequencer: Sequencer,
  opts: UseMetronomeOptions = {},
): UseMetronome {
  const {
    initialBpm = 120,
    initialSwing = 0.5,
    initialCountInBars = 0,
    tapWindow = DEFAULT_TAP_WINDOW,
    tapMinTaps = DEFAULT_TAP_MIN_TAPS,
    tapResetMs = DEFAULT_TAP_RESET_MS,
    minBpm = 30,
    maxBpm = 400,
  } = opts;

  const [playing, setPlaying] = useState(false);
  const [bpm, setBpmState] = useState(initialBpm);
  const [swing, setSwingState] = useState(initialSwing);
  const [countInBars, setCountInBars] = useState(initialCountInBars);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  // Push BPM/swing into the sequencer whenever they change.
  useEffect(() => { sequencer.setBpm(bpm); }, [sequencer, bpm]);
  useEffect(() => { sequencer.setSwing(swing); }, [sequencer, swing]);

  const setBpm = useCallback((next: number | ((prev: number) => number)) => {
    setBpmState((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);
  const setSwing = useCallback((next: number | ((prev: number) => number)) => {
    setSwingState((prev) => (typeof next === 'function' ? next(prev) : next));
  }, []);

  const start = useCallback((startOpts?: { countInBars?: number }) => {
    sequencer.play({ countInBars: startOpts?.countInBars ?? countInBars });
    setPlaying(true);
  }, [sequencer, countInBars]);

  const stop = useCallback(() => {
    sequencer.stop();
    setPlaying(false);
  }, [sequencer]);

  // ── Tap tempo ────────────────────────────────────────────────────
  const tapTimesRef = useRef<number[]>([]);
  useEffect(() => { tapTimesRef.current = tapTimes; }, [tapTimes]);

  const handleTap = useCallback(() => {
    const now = performance.now();
    const prev = tapTimesRef.current;
    const last = prev[prev.length - 1];
    const base = last !== undefined && (now - last) > tapResetMs ? [] : prev;
    const next = [...base, now].slice(-tapWindow);
    setTapTimes(next);
    if (next.length < tapMinTaps) return;

    const window = next.slice(-Math.min(tapWindow, next.length));
    const intervals: number[] = [];
    for (let i = 1; i < window.length; i++) intervals.push(window[i] - window[i - 1]);
    const sorted = [...intervals].sort((a, b) => a - b);
    const mid = sorted.length >> 1;
    const medianMs = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
    if (medianMs <= 0) return;

    const rawBpm = 60_000 / medianMs;
    const clamped = Math.max(minBpm, Math.min(maxBpm, Math.round(rawBpm)));
    setBpmState(clamped);
  }, [tapWindow, tapMinTaps, tapResetMs, minBpm, maxBpm]);

  const resetTaps = useCallback(() => setTapTimes([]), []);

  return {
    playing, start, stop,
    bpm, setBpm,
    swing, setSwing,
    countInBars, setCountInBars,
    handleTap, tapTimes, resetTaps,
  };
}
