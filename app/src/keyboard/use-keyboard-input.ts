// useKeyboardInput — global window key listener that drives the qanun.
//
// Three concerns, all keyed off `KeyboardEvent.code` so the user's OS
// layout (QWERTY, AZERTY, Dvorak, Colemak, …) doesn't matter:
//
//   1. KEY_TO_SCALE keys → pluck the qanun voice at a resolved Hz.
//      The active string is the one we just plucked; we remember it
//      in a ref so the modifier flower can retune it.
//
//   2. KEY_TO_MANDAL_DELTA keys are SILENT — they NEVER trigger the
//      voice. They do two things at once:
//        a. Retune the most-recently-played string by ± N mandal
//           steps (the next pluck of that string lands at the new
//           pitch).
//        b. Arm the same delta as a "pending modifier" — the next
//           DIFFERENT string that is plucked has the same delta
//           applied before sounding, then the modifier auto-clears.
//      KeyJ = canonical (delta 0; clears any pending modifier).
//
//   3. Space → start a sustained drone on the most-recent pitch; on
//      keyup, release it (0.5s ramp). Shift → transpose +5 scale
//      degrees while held.
//
// Auto-repeat is filtered (`event.repeat`) so holding a key doesn't
// spam plucks. Keys pressed with Cmd/Ctrl/Alt are ignored so OS
// shortcuts don't accidentally play notes.

import { useEffect, useRef } from 'react';
import { centsToHz, nearestMandalPosition, stepMandalIndex } from '../tuning/cents-math';
import { triggerVoice, type VoiceId } from '../audio/voices';
import { startSustainedDrone, type DroneHandle } from '../audio/voices/sustained-drone';
import type { MaqamPreset } from '../tuning/types';
import type { QanunState } from '../qanun/use-qanun-state';
import {
  KEY_TO_MANDAL_DELTA,
  KEY_TO_SCALE,
  applyTranspose,
  resolveStringIndex,
} from './keyboard-layout';

interface UseKeyboardInputArgs {
  audioContext: AudioContext;
  destination: AudioNode;
  voiceId: VoiceId;
  brightness: number;
  decay: number;
  body: number;
  maqam: MaqamPreset;
  kararHz: number;
  state: QanunState;
  /** Called whenever a keyboard pluck fires, with the string index that was triggered. */
  onPluck?: (stringIndex: number) => void;
}

interface ActiveNote {
  stringIndex: number;
  hz: number;
  time: number;
}

export function useKeyboardInput(args: UseKeyboardInputArgs): void {
  const {
    audioContext, destination, voiceId, brightness, decay, body,
    maqam, kararHz, state,
  } = args;

  // Stash mutable args in a ref so the window listeners — registered
  // once on mount — always see fresh values without re-binding on
  // every render.
  const argsRef = useRef(args);
  argsRef.current = args;
  void audioContext; void destination; void voiceId;
  void brightness; void decay; void body; void maqam; void kararHz; void state;

  const activeNoteRef = useRef<ActiveNote | null>(null);
  const droneRef = useRef<DroneHandle | null>(null);
  const transposeRef = useRef<number>(0);
  const heldKeysRef = useRef<Set<string>>(new Set());
  // Pending modifier delta: applied (and consumed) on the NEXT scale-key
  // pluck. Cleared after one use, or when J is pressed, or when set
  // to a fresh value by another modifier press.
  const pendingDeltaRef = useRef<number>(0);

  useEffect(() => {
    const isModifierEvent = (e: KeyboardEvent) =>
      e.metaKey || e.ctrlKey || e.altKey;

    const playPluck = (stringIndex: number, velocity: number) => {
      const a = argsRef.current;
      const s = a.state.strings[stringIndex];
      if (!s) return;
      const hz = centsToHz(a.kararHz, s.soundingCents);
      triggerVoice(a.voiceId, {
        audioContext: a.audioContext,
        destination: a.destination,
        frequencyHz: hz,
        velocity,
        brightness: a.brightness,
        decay: a.decay,
        body: a.body,
      });
      activeNoteRef.current = {
        stringIndex,
        hz,
        time: a.audioContext.currentTime,
      };
      a.onPluck?.(stringIndex);
    };

    const handleScaleKey = (code: string) => {
      const a = argsRef.current;
      const base = KEY_TO_SCALE[code];
      if (!base) return false;
      const N = a.maqam.rows.length;
      const [degree, oct] = applyTranspose(base, transposeRef.current, N);
      const idx = resolveStringIndex(a.maqam, degree, oct);
      if (idx == null) return true; // out-of-range; consume the key anyway

      // Apply pending modifier (if any) to THIS string's mandal index
      // before the pluck. Modifier auto-clears after consumption.
      const delta = pendingDeltaRef.current;
      if (delta !== 0) {
        const s = a.state.strings[idx];
        const row = s ? a.maqam.rows.find((r) => r.degree === s.rowDegree) : null;
        if (s && row) {
          const legal = row.legal_positions;
          if (legal.length > 0) {
            const { index: currentIdx } = nearestMandalPosition(s.currentCentsMid, legal);
            const stepDir = (delta > 0 ? 1 : -1) as 1 | -1;
            let targetIdx = currentIdx;
            for (let i = 0; i < Math.abs(delta); i++) {
              targetIdx = stepMandalIndex(targetIdx, stepDir, legal);
            }
            const stepsToApply = targetIdx - currentIdx;
            if (stepsToApply !== 0) {
              const dir = (stepsToApply > 0 ? 1 : -1) as 1 | -1;
              for (let i = 0; i < Math.abs(stepsToApply); i++) {
                a.state.stepMandal(idx, dir);
              }
            }
          }
        }
        pendingDeltaRef.current = 0;
      }

      playPluck(idx, 0.85);
      return true;
    };

    const handleModifierKey = (code: string) => {
      const a = argsRef.current;
      if (!(code in KEY_TO_MANDAL_DELTA)) return false;
      const delta = KEY_TO_MANDAL_DELTA[code];

      // Always: arm the next-pluck modifier. J (delta 0) clears any
      // pending modifier so the next pluck lands at canonical.
      pendingDeltaRef.current = delta;

      // Also: retune the most-recently-played string in place (visible
      // in the UI, audible on the NEXT pluck of that string). NO audio
      // dispatch — modifier keys are silent.
      const active = activeNoteRef.current;
      if (!active) return true;
      const stringIndex = active.stringIndex;
      const s = a.state.strings[stringIndex];
      if (!s) return true;
      const row = a.maqam.rows.find((r) => r.degree === s.rowDegree);
      if (!row) return true;
      const legal = row.legal_positions;
      if (legal.length === 0) return true;

      if (delta === 0) {
        // J → reset to canonical on the active string.
        const { index: currentIdx } = nearestMandalPosition(s.currentCentsMid, legal);
        const canonicalIdx = legal.findIndex((p) => p.is_canonical);
        const targetIdx = canonicalIdx >= 0 ? canonicalIdx : currentIdx;
        const diff = targetIdx - currentIdx;
        if (diff !== 0) {
          const step = (diff > 0 ? 1 : -1) as 1 | -1;
          for (let i = 0; i < Math.abs(diff); i++) {
            a.state.stepMandal(stringIndex, step);
          }
        }
        return true;
      }

      // ±N steps applied to the active string.
      const { index: currentIdx } = nearestMandalPosition(s.currentCentsMid, legal);
      const stepDir = (delta > 0 ? 1 : -1) as 1 | -1;
      let targetIdx = currentIdx;
      for (let i = 0; i < Math.abs(delta); i++) {
        targetIdx = stepMandalIndex(targetIdx, stepDir, legal);
      }
      const stepsToApply = targetIdx - currentIdx;
      if (stepsToApply !== 0) {
        const dir = (stepsToApply > 0 ? 1 : -1) as 1 | -1;
        for (let i = 0; i < Math.abs(stepsToApply); i++) {
          a.state.stepMandal(stringIndex, dir);
        }
      }
      return true;
    };

    const startDrone = () => {
      if (droneRef.current) return;
      const a = argsRef.current;
      const active = activeNoteRef.current;
      if (!active) return;
      droneRef.current = startSustainedDrone({
        audioContext: a.audioContext,
        destination: a.destination,
        frequencyHz: active.hz,
        velocity: 0.85,
      });
    };

    const releaseDrone = () => {
      const handle = droneRef.current;
      droneRef.current = null;
      if (handle) handle.release();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (isModifierEvent(e)) return;

      // Track Shift state for transpose.
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        transposeRef.current = 5;
        heldKeysRef.current.add(e.code);
        return;
      }

      if (e.code === 'Space') {
        // Start a drone on the most-recent pitch (no-op if nothing has
        // been played yet).
        e.preventDefault();
        heldKeysRef.current.add(e.code);
        startDrone();
        return;
      }

      if (handleModifierKey(e.code)) {
        heldKeysRef.current.add(e.code);
        return;
      }
      if (handleScaleKey(e.code)) {
        heldKeysRef.current.add(e.code);
        return;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeysRef.current.delete(e.code);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        // Only clear transpose if neither shift is held.
        if (
          !heldKeysRef.current.has('ShiftLeft') &&
          !heldKeysRef.current.has('ShiftRight')
        ) {
          transposeRef.current = 0;
        }
        return;
      }
      if (e.code === 'Space') {
        releaseDrone();
        return;
      }
    };

    const onBlur = () => {
      // Release everything if the window loses focus — prevents stuck
      // drones when the user tabs away mid-hold.
      releaseDrone();
      transposeRef.current = 0;
      heldKeysRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      releaseDrone();
    };
  }, []);
}
