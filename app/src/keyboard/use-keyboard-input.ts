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
  body: number;
  adsr: ADSR;
  maqam: MaqamPreset;
  kararHz: number;
  state: QanunState;
  /** Called whenever a keyboard pluck fires, with the string index. */
  onPluck?: (stringIndex: number) => void;
  /** Called whenever the set of currently-sustaining string indices
   *  changes (note start/end). Use to drive a persistent visual. */
  onSustainingChange?: (indices: ReadonlySet<number>) => void;
  /** Called whenever the set of pinned string indices changes
   *  (KeyL pins / unpins the active string). */
  onPinnedChange?: (indices: ReadonlySet<number>) => void;
  /** A ref shared with the parent so the hook can target the most-
   *  recently-plucked string from EITHER mouse or keyboard. */
  lastPluckedRef?: { current: number | null };
}

interface HeldNote {
  handle: VoiceHandle;
  stringIndex: number;
  baseHz: number;             // pitch at keydown time
  currentHz: number;          // current sounding pitch (after any modifier slide)
  baseMandalIdx: number;      // mandal index at keydown time
  currentMandalIdx: number;   // current mandal index (drives state visualization)
  /** If this note was modified via pendingDelta from a modifier that was
   *  STILL HELD at note-start time, track which modifier code so its
   *  keyup can revert the modification. null = modification is sticky
   *  (the modifier was already released before the note started). */
  pendingSource: string | null;
}

export function useKeyboardInput(args: UseKeyboardInputArgs): void {
  const argsRef = useRef(args);
  argsRef.current = args;

  // Map<keyboard-code, HeldNote> — all currently sustaining keys.
  const heldNotesRef = useRef<Map<string, HeldNote>>(new Map());
  const droneRef = useRef<DroneHandle | null>(null);
  const transposeRef = useRef<number>(0);
  const heldKeysRef = useRef<Set<string>>(new Set());
  // Pending modifier delta for the NEXT scale-key pluck. Tracks the
  // source modifier code so we know whether to revert on its keyup
  // (only if still held when the note starts).
  const pendingDeltaRef = useRef<{ delta: number; source: string | null }>({ delta: 0, source: null });
  // Pinned positions per stringIndex. KeyL toggles a pin on the active
  // string at its current mandal index; while pinned, releaseScaleNote
  // reverts to that pinned index instead of the maqam canonical.
  const pinnedMandalRef = useRef<Map<number, number>>(new Map());
  // Modifier codes that engaged a LIVE slide (their press-time held
  // notes were retuned). Used by keyup to know whether to slide back.
  const sliddenByModRef = useRef<Set<string>>(new Set());
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


    const startScaleNote = (code: string, stringIndex: number) => {
      const a = argsRef.current;
      const existing = heldNotesRef.current.get(code);
      if (existing) existing.handle.release();

      const s = a.state.strings[stringIndex];
      const row = s ? a.maqam.rows.find((r) => r.degree === s.rowDegree) : null;
      const legal = row?.legal_positions ?? [];
      const baseMandalIdx = legal.length > 0 && s
        ? nearestMandalPosition(s.currentCentsMid, legal).index
        : 0;

      const baseCents = baseSoundingCents(stringIndex);

      // Apply pending modifier (if any) BEFORE the keydown sounds.
      // This ALSO updates the qanun state so the visualization moves.
      // If the source modifier is STILL HELD, track its code so the
      // modifier's keyup can auto-revert the note.
      let initialMandalIdx = baseMandalIdx;
      let initialCents = baseCents;
      let pendingSource: string | null = null;
      const pending = pendingDeltaRef.current;
      if (pending.delta !== 0 && legal.length > 0) {
        const delta = pending.delta;
        const dir = (delta > 0 ? 1 : -1) as 1 | -1;
        let target = baseMandalIdx;
        for (let i = 0; i < Math.abs(delta); i++) {
          target = stepMandalIndex(target, dir, legal);
        }
        const diff = target - baseMandalIdx;
        if (diff !== 0) {
          const stepDir = (diff > 0 ? 1 : -1) as 1 | -1;
          for (let i = 0; i < Math.abs(diff); i++) {
            a.state.stepMandal(stringIndex, stepDir);
          }
        }
        initialMandalIdx = target;
        initialCents = soundingCentsAt(stringIndex, target);
        // If the modifier that armed this delta is STILL held when this
        // note starts, mark it as the revert-source. If already released
        // (tap-armed-then-played), the modification is sticky.
        if (pending.source && heldKeysRef.current.has(pending.source)) {
          pendingSource = pending.source;
        }
        pendingDeltaRef.current = { delta: 0, source: null };
      }
      const hz = centsToHz(a.kararHz, initialCents);
      const baseHz = centsToHz(a.kararHz, baseCents);

      const handle = triggerVoiceSustained(a.voiceId, {
        audioContext: a.audioContext,
        destination: a.destination,
        frequencyHz: hz,
        velocity: 0.85,
        brightness: a.brightness,
        body: a.body,
        adsr: a.adsr,
      });

      heldNotesRef.current.set(code, {
        handle,
        stringIndex,
        baseHz,
        currentHz: hz,
        baseMandalIdx,
        currentMandalIdx: initialMandalIdx,
        pendingSource,
      });
      activeStringRef.current = stringIndex;
      a.onPluck?.(stringIndex);
      emitSustainingChange();
    };

    const releaseScaleNote = (code: string) => {
      const note = heldNotesRef.current.get(code);
      if (!note) return;

      // Revert the qanun state to the note's baseMandalIdx (canonical
      // at note-start time) so the string doesn't stay visually
      // modified after the note ends. This is what makes subsequent
      // plucks compute their "canonical" from the actual maqam
      // canonical instead of from a stuck-modified position — the bug
      // the user just called out.
      //
      // Skip the revert if ANOTHER held key still holds this string
      // (e.g. KeyG and KeyQ both = degree 5). The other holder's
      // local currentMandalIdx tracking would get stale otherwise.
      let otherHolderExists = false;
      heldNotesRef.current.forEach((other, otherCode) => {
        if (otherCode !== code && other.stringIndex === note.stringIndex) {
          otherHolderExists = true;
        }
      });

      if (!otherHolderExists) {
        const a = argsRef.current;
        // If the string is pinned, revert to the pinned index. Else
        // revert to the note's baseMandalIdx (canonical at note-start).
        const targetIdx = pinnedMandalRef.current.get(note.stringIndex) ?? note.baseMandalIdx;
        const stepsBack = targetIdx - note.currentMandalIdx;
        if (stepsBack !== 0) {
          const dir = (stepsBack > 0 ? 1 : -1) as 1 | -1;
          for (let i = 0; i < Math.abs(stepsBack); i++) {
            a.state.stepMandal(note.stringIndex, dir);
          }
        }
      }

      note.handle.release();
      heldNotesRef.current.delete(code);
      emitSustainingChange();
    };

    /** Emit a snapshot of currently-sustaining stringIndices. Multiple
     *  keys can map to the same string (e.g. KeyG and KeyQ both = degree
     *  5 in mid octave); the set deduplicates so the visual stays on
     *  until the LAST holder releases. */
    const emitSustainingChange = () => {
      const a = argsRef.current;
      if (!a.onSustainingChange) return;
      const indices = new Set<number>();
      heldNotesRef.current.forEach((note) => indices.add(note.stringIndex));
      a.onSustainingChange(indices);
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

    /** Apply a delta (relative to BASE mandal index, not current) to all
     *  currently-held notes. Updates both the audio (setFrequency) AND
     *  the qanun state (state.stepMandal) so the perde labels and the
     *  position bar slide alongside the pitch. */
    const slideHeldNotesBy = (delta: number, glideMs = 30) => {
      const a = argsRef.current;
      heldNotesRef.current.forEach((note) => {
        const s = a.state.strings[note.stringIndex];
        if (!s) return;
        const row = a.maqam.rows.find((r) => r.degree === s.rowDegree);
        if (!row) return;
        const legal = row.legal_positions;
        if (legal.length === 0) return;

        // Target index = base + delta (clamped via stepMandalIndex).
        const dir = (delta > 0 ? 1 : -1) as 1 | -1;
        let targetIdx = note.baseMandalIdx;
        for (let i = 0; i < Math.abs(delta); i++) {
          targetIdx = stepMandalIndex(targetIdx, dir, legal);
        }

        // Step state from currentMandalIdx → targetIdx.
        const diff = targetIdx - note.currentMandalIdx;
        if (diff !== 0) {
          const stepDir = (diff > 0 ? 1 : -1) as 1 | -1;
          for (let i = 0; i < Math.abs(diff); i++) {
            a.state.stepMandal(note.stringIndex, stepDir);
          }
        }
        note.currentMandalIdx = targetIdx;

        // Slide the audio.
        const targetCents = soundingCentsAt(note.stringIndex, targetIdx);
        const targetHz = centsToHz(a.kararHz, targetCents);
        note.currentHz = targetHz;
        note.handle.setFrequency(targetHz, glideMs);
      });
    };

    /** Slide every held note BACK to its base mandal index + pitch. */
    const slideHeldNotesToBase = (glideMs = 30) => {
      const a = argsRef.current;
      heldNotesRef.current.forEach((note) => {
        const stepsBack = note.baseMandalIdx - note.currentMandalIdx;
        if (stepsBack !== 0) {
          const dir = (stepsBack > 0 ? 1 : -1) as 1 | -1;
          for (let i = 0; i < Math.abs(stepsBack); i++) {
            a.state.stepMandal(note.stringIndex, dir);
          }
        }
        note.currentMandalIdx = note.baseMandalIdx;
        note.currentHz = note.baseHz;
        note.handle.setFrequency(note.baseHz, glideMs);
      });
    };

    const handleModifierDown = (code: string): boolean => {
      if (!(code in KEY_TO_MANDAL_DELTA)) return false;
      const delta = KEY_TO_MANDAL_DELTA[code];

      if (heldNotesRef.current.size > 0) {
        // Notes are ringing → LIVE SLIDE only.
        slideHeldNotesBy(delta, 30);
        sliddenByModRef.current.add(code);
      } else {
        // No notes held → arm. Track the source so we know whether
        // to auto-revert if user holds modifier through next note-on.
        pendingDeltaRef.current = { delta, source: code };
      }
      return true;
    };

    const handleModifierUp = (code: string): boolean => {
      if (!(code in KEY_TO_MANDAL_DELTA)) return false;
      const wasSliding = sliddenByModRef.current.has(code);
      sliddenByModRef.current.delete(code);
      if (wasSliding && heldNotesRef.current.size > 0) {
        slideHeldNotesToBase(40);
      }
      // Auto-revert held notes whose pending-arm source was THIS modifier
      // (user held modifier through note-start; modifier release should
      // pull the note back to its canonical pitch).
      revertHeldNotesWithPendingSource(code, 40);
      // Pending arm is STICKY — survives the source modifier's keyup.
      // The tap-arm-then-play pattern depends on this. Cleared only by
      // a scale-key consumption or by pressing J (canonical = delta 0).
      return true;
    };

    /** Slide back any held notes that were originally modified via
     *  pendingDelta from `code`. Clears their pendingSource. */
    const revertHeldNotesWithPendingSource = (code: string, glideMs = 40) => {
      const a = argsRef.current;
      heldNotesRef.current.forEach((note) => {
        if (note.pendingSource !== code) return;
        const stepsBack = note.baseMandalIdx - note.currentMandalIdx;
        if (stepsBack !== 0) {
          const dir = (stepsBack > 0 ? 1 : -1) as 1 | -1;
          for (let i = 0; i < Math.abs(stepsBack); i++) {
            a.state.stepMandal(note.stringIndex, dir);
          }
        }
        note.currentMandalIdx = note.baseMandalIdx;
        note.currentHz = note.baseHz;
        note.handle.setFrequency(note.baseHz, glideMs);
        note.pendingSource = null;
      });
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
      emitSustainingChange();
    };

    /** KeyL toggles pin on the active (last-played) string. Pinning
     *  fixes the string's current mandal position so future releases
     *  don't revert to maqam-canonical — they snap to the pinned
     *  position. Toggling again unpins and resets to maqam-canonical. */
    const handlePinKey = (code: string): boolean => {
      if (code !== 'KeyL') return false;
      const a = argsRef.current;
      // Prefer the shared lastPluckedRef (mouse OR keyboard), fall back
      // to the keyboard-internal activeStringRef.
      const stringIndex = a.lastPluckedRef?.current ?? activeStringRef.current;
      if (stringIndex == null) return true;
      const s = a.state.strings[stringIndex];
      if (!s) return true;
      const row = a.maqam.rows.find((r) => r.degree === s.rowDegree);
      if (!row) return true;
      const legal = row.legal_positions;
      if (legal.length === 0) return true;
      const { index: cur } = nearestMandalPosition(s.currentCentsMid, legal);

      if (pinnedMandalRef.current.has(stringIndex)) {
        pinnedMandalRef.current.delete(stringIndex);
        const canonicalIdx = legal.findIndex((p) => p.is_canonical);
        const target = canonicalIdx >= 0 ? canonicalIdx : cur;
        const diff = target - cur;
        if (diff !== 0) {
          const dir = (diff > 0 ? 1 : -1) as 1 | -1;
          for (let i = 0; i < Math.abs(diff); i++) {
            a.state.stepMandal(stringIndex, dir);
          }
        }
        heldNotesRef.current.forEach((n) => {
          if (n.stringIndex === stringIndex) n.currentMandalIdx = target;
        });
      } else {
        pinnedMandalRef.current.set(stringIndex, cur);
        heldNotesRef.current.forEach((n) => {
          if (n.stringIndex === stringIndex) n.baseMandalIdx = cur;
        });
      }
      // Emit pin-state snapshot.
      if (a.onPinnedChange) {
        a.onPinnedChange(new Set(pinnedMandalRef.current.keys()));
      }
      return true;
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

      if (handlePinKey(e.code)) {
        heldKeysRef.current.add(e.code);
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
      pendingDeltaRef.current = { delta: 0, source: null };
      sliddenByModRef.current.clear();
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
