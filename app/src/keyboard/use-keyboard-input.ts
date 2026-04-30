// useKeyboardInput — global window key listener that drives the qanun.
//
// Three concerns, all keyed off `KeyboardEvent.code` so the user's OS
// layout (QWERTY, AZERTY, Dvorak, Colemak, …) doesn't matter:
//
//   1. KEY_TO_SCALE keys → start a SUSTAINED qanun voice on keydown,
//      release on keyup. Multiple keys can be held simultaneously
//      (poly). The string-index becomes the "active note" so the
//      modifier flower targets it.
//
//   2. KEY_TO_MANDAL_DELTA keys are SILENT. If notes are currently
//      held, the modifier slides each held voice's pitch live (a
//      hammer-on / pull-off / çarpma). Releasing the modifier slides
//      back. The modifier ALSO arms a pending delta for the next
//      scale-key pluck (so press H, then S, and S sounds modified).
//      KeyJ = canonical (delta 0; clears any pending arm; resets any
//      slid-active voices to their base pitches).
//
//   3. Space → start a sustained drone on the most-recent pitch; on
//      keyup, release it. Shift → transpose +5 scale degrees while
//      held.
//
// Auto-repeat is filtered (`event.repeat`). Cmd/Ctrl/Alt-modified
// events are ignored so OS shortcuts don't accidentally play notes.

import { useEffect, useRef } from 'react';
import { centsToHz, nearestMandalPosition, stepMandalIndex } from '../tuning/cents-math';
import { triggerVoice, triggerVoiceSustained, type VoiceId, type VoiceHandle, type ADSR } from '../audio/voices';
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
  adsr: ADSR;
  maqam: MaqamPreset;
  kararHz: number;
  state: QanunState;
  /** Called whenever a keyboard pluck fires, with the string index. */
  onPluck?: (stringIndex: number) => void;
}

interface HeldNote {
  handle: VoiceHandle;
  stringIndex: number;
  baseHz: number;     // the canonical pitch at keydown time
  currentHz: number;  // current sounding pitch (after any modifier slide)
}

export function useKeyboardInput(args: UseKeyboardInputArgs): void {
  const argsRef = useRef(args);
  argsRef.current = args;

  // Map<keyboard-code, HeldNote> — all currently sustaining keys.
  const heldNotesRef = useRef<Map<string, HeldNote>>(new Map());
  const droneRef = useRef<DroneHandle | null>(null);
  const transposeRef = useRef<number>(0);
  const heldKeysRef = useRef<Set<string>>(new Set());
  // Pending modifier delta for the NEXT scale-key pluck (auto-clears
  // on consumption). Independent of any live slides on held notes.
  const pendingDeltaRef = useRef<number>(0);
  // Last-played-string-index, for mouse-pluck flash + drone fallback.
  const activeStringRef = useRef<number | null>(null);

  useEffect(() => {
    const isOsModifierEvent = (e: KeyboardEvent) =>
      e.metaKey || e.ctrlKey || e.altKey;

    /** Compute the cents-from-karar (sounding) for a string at a given
     *  mandal-position index (0-based into legal_positions). */
    const soundingCentsAt = (stringIndex: number, posIdx: number): number => {
      const a = argsRef.current;
      const s = a.state.strings[stringIndex];
      if (!s) return 0;
      const row = a.maqam.rows.find((r) => r.degree === s.rowDegree);
      if (!row || row.legal_positions.length === 0) return s.soundingCents;
      const clamped = Math.max(0, Math.min(row.legal_positions.length - 1, posIdx));
      const mid = row.legal_positions[clamped].cents_from_karar;
      const octShift = s.octave === 'low' ? -1200 : s.octave === 'tiz' ? 1200 : 0;
      return mid + octShift;
    };

    const baseSoundingCents = (stringIndex: number): number => {
      const a = argsRef.current;
      const s = a.state.strings[stringIndex];
      return s ? s.soundingCents : 0;
    };

    /** Apply a mandal-step delta from a string's CURRENT position,
     *  returning the resulting sounding cents (no state mutation). */
    const soundingAfterDelta = (stringIndex: number, delta: number): number => {
      const a = argsRef.current;
      const s = a.state.strings[stringIndex];
      if (!s) return 0;
      const row = a.maqam.rows.find((r) => r.degree === s.rowDegree);
      if (!row) return s.soundingCents;
      const legal = row.legal_positions;
      if (legal.length === 0) return s.soundingCents;
      const { index: cur } = nearestMandalPosition(s.currentCentsMid, legal);
      const dir = (delta > 0 ? 1 : -1) as 1 | -1;
      let target = cur;
      for (let i = 0; i < Math.abs(delta); i++) {
        target = stepMandalIndex(target, dir, legal);
      }
      return soundingCentsAt(stringIndex, target);
    };

    const startScaleNote = (code: string, stringIndex: number) => {
      const a = argsRef.current;
      // If somehow already held, release the old one first.
      const existing = heldNotesRef.current.get(code);
      if (existing) existing.handle.release();

      const baseCents = baseSoundingCents(stringIndex);
      // Apply pending modifier (if any) BEFORE the keydown sounds.
      let initialCents = baseCents;
      if (pendingDeltaRef.current !== 0) {
        initialCents = soundingAfterDelta(stringIndex, pendingDeltaRef.current);
        pendingDeltaRef.current = 0;
      }
      const hz = centsToHz(a.kararHz, initialCents);
      const baseHz = centsToHz(a.kararHz, baseCents);

      const handle = triggerVoiceSustained(a.voiceId, {
        audioContext: a.audioContext,
        destination: a.destination,
        frequencyHz: hz,
        velocity: 0.85,
        brightness: a.brightness,
        decay: a.decay,
        body: a.body,
        adsr: a.adsr,
      });

      heldNotesRef.current.set(code, {
        handle,
        stringIndex,
        baseHz,
        currentHz: hz,
      });
      activeStringRef.current = stringIndex;
      a.onPluck?.(stringIndex);
    };

    const releaseScaleNote = (code: string) => {
      const note = heldNotesRef.current.get(code);
      if (!note) return;
      note.handle.release();
      heldNotesRef.current.delete(code);
    };

    const handleScaleDown = (code: string): boolean => {
      const a = argsRef.current;
      const base = KEY_TO_SCALE[code];
      if (!base) return false;
      const N = a.maqam.rows.length;
      const [degree, oct] = applyTranspose(base, transposeRef.current, N);
      const idx = resolveStringIndex(a.maqam, degree, oct);
      if (idx == null) return true;
      startScaleNote(code, idx);
      return true;
    };

    /** Apply a delta to all currently-held notes' live pitches. */
    const slideHeldNotesBy = (delta: number, glideMs = 30) => {
      const a = argsRef.current;
      heldNotesRef.current.forEach((note) => {
        const targetCents =
          delta === 0
            ? baseSoundingCents(note.stringIndex)
            : soundingAfterDelta(note.stringIndex, delta);
        const targetHz = centsToHz(a.kararHz, targetCents);
        note.currentHz = targetHz;
        note.handle.setFrequency(targetHz, glideMs);
      });
    };

    /** Slide every held note BACK to its base pitch. */
    const slideHeldNotesToBase = (glideMs = 30) => {
      heldNotesRef.current.forEach((note) => {
        note.currentHz = note.baseHz;
        note.handle.setFrequency(note.baseHz, glideMs);
      });
    };

    const handleModifierDown = (code: string): boolean => {
      if (!(code in KEY_TO_MANDAL_DELTA)) return false;
      const delta = KEY_TO_MANDAL_DELTA[code];

      // Slide every held note live (carpma / hammer-on).
      if (heldNotesRef.current.size > 0) {
        slideHeldNotesBy(delta, 30);
      }

      // Arm pending modifier for the next freshly-pressed key.
      pendingDeltaRef.current = delta;
      return true;
    };

    const handleModifierUp = (code: string): boolean => {
      if (!(code in KEY_TO_MANDAL_DELTA)) return false;
      // Slide held notes back to their base pitch (pull-off).
      if (heldNotesRef.current.size > 0) {
        slideHeldNotesToBase(40);
      }
      // Clear pending modifier on release so the next freshly-pressed
      // key isn't unexpectedly modified.
      pendingDeltaRef.current = 0;
      return true;
    };

    const startDrone = () => {
      if (droneRef.current) return;
      const a = argsRef.current;
      // Find a held note's pitch first; fall back to last-active string.
      let hz: number | null = null;
      heldNotesRef.current.forEach((note) => { if (hz == null) hz = note.currentHz; });
      if (hz == null && activeStringRef.current != null) {
        const cents = baseSoundingCents(activeStringRef.current);
        hz = centsToHz(a.kararHz, cents);
      }
      if (hz == null) return;
      droneRef.current = startSustainedDrone({
        audioContext: a.audioContext,
        destination: a.destination,
        frequencyHz: hz,
        velocity: 0.85,
      });
    };

    const releaseDrone = () => {
      const handle = droneRef.current;
      droneRef.current = null;
      if (handle) handle.release();
    };

    const releaseAllNotes = () => {
      heldNotesRef.current.forEach((note) => note.handle.release());
      heldNotesRef.current.clear();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (isOsModifierEvent(e)) return;

      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        transposeRef.current = 5;
        heldKeysRef.current.add(e.code);
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        heldKeysRef.current.add(e.code);
        startDrone();
        return;
      }

      if (handleModifierDown(e.code)) {
        heldKeysRef.current.add(e.code);
        return;
      }
      if (handleScaleDown(e.code)) {
        heldKeysRef.current.add(e.code);
        return;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      heldKeysRef.current.delete(e.code);
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
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
      if (handleModifierUp(e.code)) return;
      if (e.code in KEY_TO_SCALE) {
        releaseScaleNote(e.code);
        return;
      }
    };

    const onBlur = () => {
      releaseAllNotes();
      releaseDrone();
      transposeRef.current = 0;
      pendingDeltaRef.current = 0;
      heldKeysRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      releaseAllNotes();
      releaseDrone();
    };
  }, []);

  // The `triggerVoice` import is used inside the effect via
  // triggerVoiceSustained. Keep a reference so eslint doesn't whine.
  void triggerVoice;
}
