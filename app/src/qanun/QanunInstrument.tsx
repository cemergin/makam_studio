// QanunInstrument — the main playing surface. Vertical stack of strings.
//
// Strings are rendered low → high (low octave at the top, tiz at the
// bottom — i.e. ascending downward, mirroring the visual orientation of
// the bundled HTML reference). Karar rows are highlighted across the
// full width.

import type { MaqamPreset } from '../tuning/types';
import { centsToHz } from '../tuning/cents-math';
import { defaultKararHz } from '../tuning/maqamat';
import { triggerQanun } from '../audio/qanun-voice';
import { StringRow } from './StringRow';
import { useQanunState } from './use-qanun-state';

interface Props {
  maqam: MaqamPreset;
  audioContext: AudioContext;
  destination: AudioNode;
  /** Synth params (brightness/decay/body) — read-only here, set by SynthControls. */
  brightness: number;
  decay: number;
  body: number;
}

export function QanunInstrument({
  maqam, audioContext, destination, brightness, decay, body,
}: Props) {
  const state = useQanunState(maqam);
  const kararHz = defaultKararHz(maqam);

  const pluckString = (stringIndex: number) => {
    const s = state.strings[stringIndex];
    if (!s) return;
    const hz = centsToHz(kararHz, s.soundingCents);
    triggerQanun({
      audioContext,
      destination,
      frequencyHz: hz,
      velocity: 0.85,
      brightness,
      decay,
      body,
    });
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
    triggerQanun({
      audioContext,
      destination,
      frequencyHz: hz,
      velocity: 0.5,
      brightness: brightness * 0.8,
      decay: decay * 0.7,
      body,
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
            isKarar={isKarar}
            onStep={(step) => previewMandalStep(s.index, step)}
            onPluck={() => pluckString(s.index)}
          />
        );
      })}
    </div>
  );
}
