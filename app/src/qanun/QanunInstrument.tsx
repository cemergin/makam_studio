// QanunInstrument — the main playing surface. Vertical stack of strings.
//
// Strings are rendered low → high (low octave at the top, tiz at the
// bottom — i.e. ascending downward, mirroring the visual orientation of
// the bundled HTML reference). Karar rows are highlighted across the
// full width.

import { useCallback, useRef, useState } from 'react';
import type { MaqamPreset } from '../tuning/types';
import { centsToHz } from '../tuning/cents-math';
import { defaultKararHz } from '../tuning/maqamat';
import { triggerVoice, type VoiceId, type ADSR } from '../audio/voices';
import { StringRow } from './StringRow';
import { useQanunState } from './use-qanun-state';
import { useKeyboardInput } from '../keyboard/use-keyboard-input';

interface Props {
  maqam: MaqamPreset;
  audioContext: AudioContext;
  destination: AudioNode;
  voiceId: VoiceId;
  brightness: number;
  body: number;
  /** ADSR envelope (full a/d/s/r). Sustained voices hold at S until release. */
  adsr: ADSR;
  kararSemitoneOffset?: number;
}

export function QanunInstrument({
  maqam, audioContext, destination, voiceId, brightness, body,
  adsr, kararSemitoneOffset = 0,
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
    voiceId,
    brightness,
    body,
    adsr,
    maqam,
    kararHz,
    state,
    onPluck: flashString,
    onSustainingChange: setSustainingIndices,
    onPinnedChange: setPinnedIndices,
    lastPluckedRef,
  });

  const pluckString = (stringIndex: number) => {
    const s = state.strings[stringIndex];
    if (!s) return;
    const hz = centsToHz(kararHz, s.soundingCents);
    triggerVoice(voiceId, {
      audioContext,
      destination,
      frequencyHz: hz,
      velocity: 0.85,
      brightness,
      body,
      adsr,
    });
    flashString(stringIndex);
  };

  const previewMandalStep = (stringIndex: number, step: 1 | -1) => {
    state.stepMandal(stringIndex, step);
    // After state updates (next render), pluck the string at the new
    // pitch. Since stepMandal uses setState, we schedule the preview
    // pluck to fire after the current task. Read the legal positions
    // synchronously here to compute the *target* pitch and play it.
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
    triggerVoice(voiceId, {
      audioContext,
      destination,
      frequencyHz: hz,
      velocity: 0.5,
      brightness: brightness * 0.8,
      body,
      adsr,
    });
  };

  // Render strings high → low so the visual top is highest pitch (like
  // looking at the qanun from the player's perspective).
  const renderOrder = state.strings.slice().reverse();

  return (
    <div className="qanun-instrument" role="group" aria-label={`Qanun strings — ${maqam.name.canonical}`}>
      {renderOrder.map((s) => {
        // First-degree row + mid octave is the karar. Highlight any
        // first-degree string — durak — across all octaves.
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
            onPluck={() => pluckString(s.index)}
          />
        );
      })}
    </div>
  );
}
