// One string row in the qanun grid.
// Three columns: mandal track | perde + cents readout | pluck button.

import { resolvePerde } from '../tuning/perde-dictionary';
import type { QanunString } from './use-qanun-state';
import type { MandalPosition } from '../tuning/types';
import { MandalTrack } from './MandalTrack';

interface Props {
  s: QanunString;
  legal: readonly MandalPosition[];
  currentIndex: number;
  isKarar: boolean;
  isFlashing?: boolean;
  /** True while a held key is sounding this string. Persistent glow. */
  isSustaining?: boolean;
  onStep: (step: 1 | -1) => void;
  onPluck: () => void;
}

export function StringRow({
  s, legal, currentIndex, isKarar, isFlashing, isSustaining, onStep, onPluck,
}: Props) {
  const perde = resolvePerde(s.soundingCents);
  const inflectionStr =
    perde.inflection === 0
      ? ''
      : perde.inflection > 0
        ? `+${perde.inflection}¢`
        : `${perde.inflection}¢`;

  const rowClass = [
    'string-row',
    isKarar ? 'string-row--karar' : '',
    s.isModified ? 'string-row--modified' : '',
    isFlashing ? 'string-row--flashing' : '',
    isSustaining ? 'string-row--sustaining' : '',
    `string-row--${s.octave}`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={rowClass}>
      <div className="string-row__mandal">
        <MandalTrack legal={legal} currentIndex={currentIndex} onStep={onStep} />
      </div>
      <div className="string-row__perde">
        <span className="string-row__perde-name">{perde.name}</span>
        {inflectionStr && (
          <span className="string-row__perde-inflection">{inflectionStr}</span>
        )}
        <span className="string-row__cents">
          {Math.round(s.soundingCents)}¢
        </span>
      </div>
      <button
        type="button"
        className="string-row__pluck"
        onClick={onPluck}
        aria-label={`Pluck ${perde.name}`}
      >
        <span className="string-row__pluck-line" aria-hidden="true" />
      </button>
    </div>
  );
}
