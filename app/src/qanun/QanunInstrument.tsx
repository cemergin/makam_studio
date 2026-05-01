// QanunInstrument — the main playing surface. Vertical stack of strings.
//
// Strings are rendered low → high (low octave at the top, tiz at the
// bottom — i.e. ascending downward, mirroring the visual orientation of
// the bundled HTML reference). Karar rows are highlighted across the
// full width.

import { useCallback, useRef, useState } from 'react';
import type { MaqamPreset } from '../tuning/types';
import { centsToHz, nearestMandalPosition } from '../tuning/cents-math';
import { defaultKararHz } from '../tuning/maqamat';
import {
  triggerMachine,
  triggerMachineSustained,
  type MachineId,
  type ADSR,
  type FilterConfig,
  type FilterEnv,
  type LfoConfig,
} from '../audio/machines';
import { StringRow } from './StringRow';
import { useQanunState } from './use-qanun-state';
import {
  useKeyboardInput,
  type ExternalNoteRegistry,
} from '../keyboard/use-keyboard-input';

interface Props {
  maqam: MaqamPreset;
  audioContext: AudioContext;
  destination: AudioNode;
  machineId: MachineId;
  brightness: number;
  body: number;
  /** ADSR envelope (full a/d/s/r). Sustained voices hold at S until release. */
  adsr: ADSR;
  filter: FilterConfig;
  filterEnv: FilterEnv;
  lfo1: LfoConfig;
  lfo2: LfoConfig;
  kararSemitoneOffset?: number;
  /** Number keys 1..9 select a maqam by its index in the rail. */
  onMaqamSelect?: (index: number) => void;
  /** Drone octave offset (-2..+2). Multiplies drone pitch by 2^n. */
  droneOctave?: number;
}

export function QanunInstrument({
  maqam, audioContext, destination, machineId, brightness, body,
  adsr, filter, filterEnv, lfo1, lfo2,
  kararSemitoneOffset = 0, onMaqamSelect, droneOctave = 0,
}: Props) {
  const state = useQanunState(maqam);
  const kararHz = defaultKararHz(maqam) * Math.pow(2, kararSemitoneOffset / 12);

  // Three visual layers for played strings:
  //   - flashIndices  → 250ms saffron pulse on every trigger (mouse + key)
  //   - sustainingIndices → persistent glow while a key is held
  //   - pinnedIndices → 📌 badge on strings pinned via KeyL
  const [flashIndices, setFlashIndices] = useState<ReadonlySet<number>>(new Set());
  const flashTimers = useRef<Map<number, number>>(new Map());
  const [sustainingIndices, setSustainingIndices] = useState<ReadonlySet<number>>(new Set());
  const [pinnedIndices, setPinnedIndices] = useState<ReadonlySet<number>>(new Set());
  // Shared with the keyboard hook so KeyL targets the most-recently-
  // plucked string regardless of source (mouse OR keyboard).
  const lastPluckedRef = useRef<number | null>(null);
  // External-note registry exposed by the keyboard hook. Mouse-held
  // plucks register here so they participate in the SAME slide / pin
  // / canonical / revert logic as keyboard-held notes.
  const externalRef = useRef<ExternalNoteRegistry | null>(null);

  const flashString = useCallback((stringIndex: number) => {
    lastPluckedRef.current = stringIndex;
    setFlashIndices((prev) => {
      const next = new Set(prev);
      next.add(stringIndex);
      return next;
    });
    const old = flashTimers.current.get(stringIndex);
    if (old) window.clearTimeout(old);
    const id = window.setTimeout(() => {
      setFlashIndices((prev) => {
        const next = new Set(prev);
        next.delete(stringIndex);
        return next;
      });
      flashTimers.current.delete(stringIndex);
    }, 250);
    flashTimers.current.set(stringIndex, id);
  }, []);

  // Hook up window-level keyboard input. The hook calls onPluck so we
  // share the flash logic between mouse clicks and keyboard taps.
  useKeyboardInput({
    audioContext,
    destination,
    machineId,
    brightness,
    body,
    adsr,
    filter,
    filterEnv,
    lfo1,
    lfo2,
    maqam,
    kararHz,
    state,
    onPluck: flashString,
    onSustainingChange: setSustainingIndices,
    onPinnedChange: setPinnedIndices,
    lastPluckedRef,
    onSelectMaqam: onMaqamSelect,
    droneOctave,
    externalRef,
  });

  /** Mouse / pointer / touch START — begin a SUSTAINED note that
   *  registers into the same held-notes map as keyboard notes. */
  const pressString = useCallback((stringIndex: number) => {
    const s = state.strings[stringIndex];
    if (!s) return;
    const row = maqam.rows.find((r) => r.degree === s.rowDegree);
    const legal = row?.legal_positions ?? [];
    const baseMandalIdx = legal.length > 0
      ? nearestMandalPosition(s.currentCentsMid, legal).index
      : 0;
    const hz = centsToHz(kararHz, s.soundingCents);

    const handle = triggerMachineSustained(machineId, {
      audioContext,
      destination,
      frequencyHz: hz,
      velocity: 0.85,
      brightness,
      body,
      adsr,
      filter,
      filterEnv,
      lfo1,
      lfo2,
    });

    const id = `mouse:${stringIndex}`;
    if (externalRef.current) {
      externalRef.current.registerExternalNote({
        id,
        handle,
        stringIndex,
        baseHz: hz,
        baseMandalIdx,
      });
    } else {
      // Fallback: registry not wired yet — release on next frame so the
      // note doesn't leak. (This branch is defensive; in practice the
      // hook's effect is mounted before any pluck.)
      setTimeout(() => handle.release(), 0);
    }
    flashString(stringIndex);
  }, [
    state.strings, maqam, kararHz, machineId, audioContext, destination,
    brightness, body, adsr, filter, filterEnv, lfo1, lfo2, flashString,
  ]);

  const releaseString = useCallback((stringIndex: number) => {
    const id = `mouse:${stringIndex}`;
    externalRef.current?.releaseExternal(id);
  }, []);

  const previewMandalStep = (stringIndex: number, step: 1 | -1) => {
    state.stepMandal(stringIndex, step);
    const s = state.strings[stringIndex];
    if (!s) return;
    const row = maqam.rows.find((r) => r.degree === s.rowDegree);
    if (!row) return;
    const idx = state.currentMandalIndex(stringIndex);
    const targetIdx = Math.max(0, Math.min(row.legal_positions.length - 1, idx + step));
    const newMidCents = row.legal_positions[targetIdx].cents_from_karar;
    const sounding =
      newMidCents +
      (s.octave === 'low' ? -1200 : s.octave === 'tiz' ? 1200 : 0);
    const hz = centsToHz(kararHz, sounding);
    triggerMachine(machineId, {
      audioContext,
      destination,
      frequencyHz: hz,
      velocity: 0.5,
      brightness: brightness * 0.8,
      body,
      adsr,
      filter,
      filterEnv,
      lfo1,
      lfo2,
    });
  };

  const renderOrder = state.strings.slice().reverse();

  return (
    <div className="qanun-instrument" role="group" aria-label={`Qanun strings — ${maqam.name.canonical}`}>
      {renderOrder.map((s) => {
        const isKarar = s.rowDegree === 1;
        return (
          <StringRow
            key={s.index}
            s={s}
            legal={state.legalPositions(s.index)}
            currentIndex={state.currentMandalIndex(s.index)}
            maqam={maqam}
            isKarar={isKarar}
            isFlashing={flashIndices.has(s.index)}
            isSustaining={sustainingIndices.has(s.index)}
            isPinned={pinnedIndices.has(s.index)}
            onStep={(step) => previewMandalStep(s.index, step)}
            onPress={() => pressString(s.index)}
            onRelease={() => releaseString(s.index)}
          />
        );
      })}
    </div>
  );
}
