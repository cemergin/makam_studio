// useKeyboardInput — global window key listener that drives the qanun.
//
// PERSISTENT-STATE MODIFIER MODEL — like a real qanun:
//
//   1. KEY_TO_SCALE keys → start a SUSTAINED machine voice on keydown,
//      release on keyup. NO auto-revert on release; the string stays
//      where the user put it. Multi-key sustains are polyphonic.
//
//   2. KEY_TO_MANDAL_DELTA modifiers (silent — they never trigger a
//      voice) split into TWO behaviors based on whether notes are
//      currently ringing:
//
//        • WITH held notes — TEMPORARY carpma. Press slides held
//          voices up/down; release slides them back. Audio + state
//          both move during the press, both revert on release. This
//          is the ornament gesture.
//
//        • WITHOUT held notes — PERSISTENT state flip. The active
//          (last-plucked) string's mandal moves to canonical+delta
//          and STAYS there. Subsequent plucks of that string sound at
//          the modified pitch. This is the mode-shift gesture.
//
//      KeyJ = canonical reset. With held notes: slides them to maqam
//      canonical and updates their base so they stay there on release.
//      Without held notes: resets the active string's state to
//      canonical.
//
//   3. Space → start a sustained drone on the most-recent pitch; on
//      keyup, release it. Shift → transpose +5 scale degrees while
//      held.
//
// Auto-repeat is filtered (`event.repeat`). Cmd/Ctrl/Alt-modified
// events are ignored so OS shortcuts don't accidentally play notes.

import { useEffect, useRef } from 'react';
import { centsToHz, nearestMandalPosition, stepMandalIndex } from '../tuning/cents-math';
import {
  triggerMachine, triggerMachineSustained,
  type MachineId, type MachineHandle, type ADSR,
  type FilterConfig, type FilterEnv, type LfoConfig,
} from '../audio/machines';
import { startSustainedDrone, type DroneHandle } from '../audio/machines/sustained-drone';
import type { MaqamPreset } from '../tuning/types';
import type { QanunState } from '../qanun/use-qanun-state';
import {
  KEY_TO_MANDAL_DELTA,
  KEY_TO_MAQAM_INDEX,
  KEY_TO_SCALE,
  applyTranspose,
  resolveStringIndex,
} from './keyboard-layout';

/** Public registry handle exposed via `externalRef` so non-keyboard
 *  callers (mouse / pointer / touch) can register a sustained note
 *  that participates in slide / canonical / pin / revert logic exactly
 *  like a keyboard-held note. The caller decides when to invoke
 *  releaseExternal(id). */
export interface ExternalNoteRegistry {
  registerExternalNote(args: {
    /** Unique key for this note (caller-chosen, e.g. `mouse:${stringIndex}`). */
    id: string;
    handle: MachineHandle;
    stringIndex: number;
    baseHz: number;
    baseMandalIdx: number;
  }): void;
  releaseExternal(id: string): void;
}

interface UseKeyboardInputArgs {
  audioContext: AudioContext;
  destination: AudioNode;
  machineId: MachineId;
  brightness: number;
  body: number;
  adsr: ADSR;
  filter: FilterConfig;
  filterEnv: FilterEnv;
  lfo1: LfoConfig;
  lfo2: LfoConfig;
  /** Octave offset (-2..+2). Threaded into machine triggers. */
  octaveOffset?: number;
  /** Machine-specific params keyed by ParamSpec.name from MACHINE_PARAMS. */
  machineParams?: import('../audio/machines').MachineParamValues;
  /** Voice mode: 'poly' (chord, default) or 'legato' (mono + glide). */
  voiceMode?: 'poly' | 'legato';
  /** Glide time in milliseconds for legato mode (default 60). */
  glideMs?: number;
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
  /** Called when a number key (1–9) selects a maqam by index. */
  onSelectMaqam?: (index: number) => void;
  /** Octave offset for the Space-hold drone. Multiplies drone freq by 2^n. */
  droneOctave?: number;
  /** Optional ref the hook fills with a registry the parent can use to
   *  push/pop mouse-held notes into the SAME slide/pin/canonical map. */
  externalRef?: { current: ExternalNoteRegistry | null };
}

interface HeldNote {
  handle: MachineHandle;
  stringIndex: number;
  baseHz: number;             // pitch at keydown time
  currentHz: number;          // current sounding pitch (after any modifier slide)
  baseMandalIdx: number;      // mandal index at keydown time (the "rest position" for carpma return)
  currentMandalIdx: number;   // current mandal index (drives state visualization)
}

/** Legato (mono) voice state. Only one is active at a time; new key
 *  presses glide this voice to the new pitch without retriggering the
 *  envelope. The held-key stack is in `monoStackRef`. */
interface MonoVoiceState {
  handle: MachineHandle;
  stringIndex: number;
  baseHz: number;
  currentHz: number;
  baseMandalIdx: number;
  currentMandalIdx: number;
}

export function useKeyboardInput(args: UseKeyboardInputArgs): void {
  const argsRef = useRef(args);
  argsRef.current = args;

  // Map<keyboard-code, HeldNote> — all currently sustaining keys.
  const heldNotesRef = useRef<Map<string, HeldNote>>(new Map());
  // Legato (mono) voice + key-stack. Only used when voiceMode==='legato'.
  // The stack is the order keys were pressed; the top of the stack is
  // the currently-sounding pitch. Releasing a non-top key removes it
  // from the stack without affecting audio; releasing the top glides
  // the voice back to the new top.
  const monoVoiceRef = useRef<MonoVoiceState | null>(null);
  const monoStackRef = useRef<{ code: string; stringIndex: number }[]>([]);
  const droneRef = useRef<DroneHandle | null>(null);
  const transposeRef = useRef<number>(0);
  const heldKeysRef = useRef<Set<string>>(new Set());
  // Pinned positions per stringIndex. KeyL is now a no-op (every
  // modifier press is already persistent in the new model), but the
  // pin map is kept so the visual badge can be re-purposed.
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
      const isLegato = a.voiceMode === 'legato';
      const glideMs = a.glideMs ?? 60;

      // Read the string's CURRENT state (including any persistent
      // modifications applied by previous modifier presses). The note
      // sounds wherever the string currently is — that's the whole
      // point of the persistent model.
      const s = a.state.strings[stringIndex];
      const row = s ? a.maqam.rows.find((r) => r.degree === s.rowDegree) : null;
      const legal = row?.legal_positions ?? [];
      const baseMandalIdx = legal.length > 0 && s
        ? nearestMandalPosition(s.currentCentsMid, legal).index
        : 0;
      const baseCents = baseSoundingCents(stringIndex);
      const hz = centsToHz(a.kararHz, baseCents);

      if (!isLegato) {
        // POLY path — preserve existing behavior.
        const existing = heldNotesRef.current.get(code);
        if (existing) existing.handle.release();

        const handle = triggerMachineSustained(a.machineId, {
          audioContext: a.audioContext,
          destination: a.destination,
          frequencyHz: hz,
          velocity: 0.85,
          brightness: a.brightness,
          body: a.body,
          adsr: a.adsr,
          filter: a.filter,
          filterEnv: a.filterEnv,
          lfo1: a.lfo1,
          lfo2: a.lfo2,
          octaveOffset: a.octaveOffset,
          params: a.machineParams,
        });

        heldNotesRef.current.set(code, {
          handle,
          stringIndex,
          baseHz: hz,
          currentHz: hz,
          baseMandalIdx,
          currentMandalIdx: baseMandalIdx,
        });
        activeStringRef.current = stringIndex;
        a.onPluck?.(stringIndex);
        emitSustainingChange();
        return;
      }

      // LEGATO path — single mono voice + key stack. New keys glide the
      // existing voice without re-triggering the envelope.
      const stack = monoStackRef.current;
      const existingIdx = stack.findIndex((e) => e.code === code);
      if (existingIdx >= 0) stack.splice(existingIdx, 1);
      stack.push({ code, stringIndex });

      if (!monoVoiceRef.current) {
        const handle = triggerMachineSustained(a.machineId, {
          audioContext: a.audioContext,
          destination: a.destination,
          frequencyHz: hz,
          velocity: 0.85,
          brightness: a.brightness,
          body: a.body,
          adsr: a.adsr,
          filter: a.filter,
          filterEnv: a.filterEnv,
          lfo1: a.lfo1,
          lfo2: a.lfo2,
          octaveOffset: a.octaveOffset,
          params: a.machineParams,
        });
        monoVoiceRef.current = {
          handle,
          stringIndex,
          baseHz: hz,
          currentHz: hz,
          baseMandalIdx,
          currentMandalIdx: baseMandalIdx,
        };
      } else {
        monoVoiceRef.current.handle.setFrequency(hz, glideMs);
        monoVoiceRef.current.stringIndex = stringIndex;
        monoVoiceRef.current.currentHz = hz;
        monoVoiceRef.current.baseMandalIdx = baseMandalIdx;
        monoVoiceRef.current.currentMandalIdx = baseMandalIdx;
      }
      activeStringRef.current = stringIndex;
      a.onPluck?.(stringIndex);
      emitSustainingChange();
    };

    const releaseScaleNote = (code: string) => {
      const a = argsRef.current;
      const isLegato = a.voiceMode === 'legato';

      if (!isLegato) {
        // POLY path — preserve existing behavior.
        const note = heldNotesRef.current.get(code);
        if (!note) return;
        // PERSISTENT model: no auto-revert on release. The string stays
        // wherever it currently is. Use J to explicitly reset to canonical.
        note.handle.release();
        heldNotesRef.current.delete(code);
        emitSustainingChange();
        return;
      }

      // LEGATO path — pop the stack; if empty, release the voice.
      // Otherwise glide the voice to the new top-of-stack pitch.
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
    };

    /** Emit a snapshot of currently-sustaining stringIndices. Multiple
     *  keys can map to the same string (e.g. KeyG and KeyQ both = degree
     *  5 in mid octave); the set deduplicates so the visual stays on
     *  until the LAST holder releases. In legato mode the mono voice's
     *  current stringIndex is also included so its lamp lights. */
    const emitSustainingChange = () => {
      const a = argsRef.current;
      if (!a.onSustainingChange) return;
      const indices = new Set<number>();
      heldNotesRef.current.forEach((note) => indices.add(note.stringIndex));
      if (monoVoiceRef.current) indices.add(monoVoiceRef.current.stringIndex);
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
     *  position bar slide alongside the pitch.
     *
     *  Special case: delta = 0 (J = canonical) ALWAYS targets the
     *  maqam's `is_canonical` position, ignoring baseMandalIdx and any
     *  pin. This is the explicit "reset to canonical" gesture; users
     *  shouldn't have to think about whether the base drifted. */
    const slideHeldNotesBy = (delta: number, glideMs = 30) => {
      const a = argsRef.current;
      heldNotesRef.current.forEach((note) => {
        const s = a.state.strings[note.stringIndex];
        if (!s) return;
        const row = a.maqam.rows.find((r) => r.degree === s.rowDegree);
        if (!row) return;
        const legal = row.legal_positions;
        if (legal.length === 0) return;

        let targetIdx: number;
        if (delta === 0) {
          const canonicalIdx = legal.findIndex((p) => p.is_canonical);
          targetIdx = canonicalIdx >= 0 ? canonicalIdx : note.baseMandalIdx;
          // Also: clear any pin on this string + update note's
          // baseMandalIdx so subsequent release lands at canonical too.
          pinnedMandalRef.current.delete(note.stringIndex);
          note.baseMandalIdx = targetIdx;
        } else {
          const dir = (delta > 0 ? 1 : -1) as 1 | -1;
          targetIdx = note.baseMandalIdx;
          for (let i = 0; i < Math.abs(delta); i++) {
            targetIdx = stepMandalIndex(targetIdx, dir, legal);
          }
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

      // Legato (mono) voice — same logic, applied to the single voice.
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

      // Legato (mono) voice — same revert logic.
      const v = monoVoiceRef.current;
      if (v) {
        const stepsBack = v.baseMandalIdx - v.currentMandalIdx;
        if (stepsBack !== 0) {
          const dir = (stepsBack > 0 ? 1 : -1) as 1 | -1;
          for (let i = 0; i < Math.abs(stepsBack); i++) {
            a.state.stepMandal(v.stringIndex, dir);
          }
        }
        v.currentMandalIdx = v.baseMandalIdx;
        v.currentHz = v.baseHz;
        v.handle.setFrequency(v.baseHz, glideMs);
      }
    };

    /** Modify the active string's mandal state to canonical+delta.
     *  Persistent — state STAYS until another modifier or J. No audio
     *  is triggered (modifier keys are silent). */
    const flipActiveString = (delta: number) => {
      const a = argsRef.current;
      const stringIndex = a.lastPluckedRef?.current ?? activeStringRef.current;
      if (stringIndex == null) return;
      const s = a.state.strings[stringIndex];
      if (!s) return;
      const row = a.maqam.rows.find((r) => r.degree === s.rowDegree);
      if (!row) return;
      const legal = row.legal_positions;
      if (legal.length === 0) return;

      const canonicalIdx = legal.findIndex((p) => p.is_canonical);
      if (canonicalIdx < 0) return;

      // Target = canonical + delta (clamped via stepMandalIndex).
      const dir = (delta > 0 ? 1 : -1) as 1 | -1;
      let targetIdx = canonicalIdx;
      for (let i = 0; i < Math.abs(delta); i++) {
        targetIdx = stepMandalIndex(targetIdx, dir, legal);
      }

      // Step state from current position → target.
      const { index: cur } = nearestMandalPosition(s.currentCentsMid, legal);
      const stepsTo = targetIdx - cur;
      if (stepsTo !== 0) {
        const stepDir = (stepsTo > 0 ? 1 : -1) as 1 | -1;
        for (let i = 0; i < Math.abs(stepsTo); i++) {
          a.state.stepMandal(stringIndex, stepDir);
        }
      }
    };

    const handleModifierDown = (code: string): boolean => {
      if (!(code in KEY_TO_MANDAL_DELTA)) return false;
      const delta = KEY_TO_MANDAL_DELTA[code];

      if (heldNotesRef.current.size > 0) {
        // Notes ringing → TEMPORARY carpma. Slide live; reverts on
        // modifier release.
        slideHeldNotesBy(delta, 30);
        sliddenByModRef.current.add(code);
      } else {
        // No notes ringing → PERSISTENT mode-shift on the active string.
        flipActiveString(delta);
      }
      return true;
    };

    const handleModifierUp = (code: string): boolean => {
      if (!(code in KEY_TO_MANDAL_DELTA)) return false;
      const wasSliding = sliddenByModRef.current.has(code);
      sliddenByModRef.current.delete(code);
      if (wasSliding && heldNotesRef.current.size > 0) {
        // Carpma return — slide held notes back to where they were
        // before the modifier press.
        slideHeldNotesToBase(40);
      }
      return true;
    };

    const startDrone = () => {
      if (droneRef.current) return;
      const a = argsRef.current;
      let hz: number | null = null;
      heldNotesRef.current.forEach((note) => { if (hz == null) hz = note.currentHz; });
      if (hz == null && activeStringRef.current != null) {
        const cents = baseSoundingCents(activeStringRef.current);
        hz = centsToHz(a.kararHz, cents);
      }
      if (hz == null) return;
      // Octave shift: multiply pitch by 2^n where n is the user's
      // selected drone octave offset (-2..+2). Default 0 = no shift.
      const oct = a.droneOctave ?? 0;
      hz = hz * Math.pow(2, oct);
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
      monoVoiceRef.current?.handle.release();
      monoVoiceRef.current = null;
      monoStackRef.current = [];
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

      // Number-row maqam switch — release everything first so we don't
      // have lingering notes ringing under the new tuning.
      if (e.code in KEY_TO_MAQAM_INDEX) {
        const idx = KEY_TO_MAQAM_INDEX[e.code];
        const a = argsRef.current;
        if (a.onSelectMaqam) {
          releaseAllNotes();
          releaseDrone();
          // Pin state is per-string-index; clearing on maqam switch
          // because string semantics change with the new preset.
          pinnedMandalRef.current.clear();
          if (a.onPinnedChange) a.onPinnedChange(new Set());
          a.onSelectMaqam(idx);
        }
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
      sliddenByModRef.current.clear();
      heldKeysRef.current.clear();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    // Expose an external-note registry so mouse / pointer / touch
    // callers can register a sustained note that participates in the
    // SAME slide / canonical / pin / revert logic as keyboard-held
    // notes. The id chosen by the caller (e.g. `mouse:${stringIndex}`)
    // becomes a key in `heldNotesRef` exactly like a keyboard code.
    if (argsRef.current.externalRef) {
      argsRef.current.externalRef.current = {
        registerExternalNote({ id, handle, stringIndex, baseHz, baseMandalIdx }) {
          // If a previous note exists under this id, release it first.
          const prev = heldNotesRef.current.get(id);
          if (prev) prev.handle.release();
          heldNotesRef.current.set(id, {
            handle,
            stringIndex,
            baseHz,
            currentHz: baseHz,
            baseMandalIdx,
            currentMandalIdx: baseMandalIdx,
          });
          activeStringRef.current = stringIndex;
          argsRef.current.onPluck?.(stringIndex);
          emitSustainingChange();
        },
        releaseExternal(id) {
          releaseScaleNote(id);
        },
      };
    }

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      releaseAllNotes();
      releaseDrone();
      if (argsRef.current.externalRef) {
        argsRef.current.externalRef.current = null;
      }
    };
  }, []);

  // The `triggerMachine` import is used inside the effect via
  // triggerMachineSustained. Keep a reference so eslint doesn't whine.
  void triggerMachine;
}
