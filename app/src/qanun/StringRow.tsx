// One string row in the qanun grid.
// Three columns: mandal track | perde + cents readout | pluck button.
//
// Perde naming is sourced from the active maqam preset (each row's
// canonical_name) — NOT from the AEU dictionary's nearest match. The
// dictionary's Segâh sits at ~408¢ above Rast, but Uşşâk's Segâh is
// ~135¢ above Dügâh (a different absolute pitch); a pure-cents nearest
// lookup would resolve it to "Kürdî" and label the row wrong. The
// preset is the source of truth.
//
// Pluck input: handled at the QanunInstrument level via document-level
// pointer listeners + elementFromPoint hit-testing. The pluck button
// itself is a plain element with `data-string-index` so the parent's
// hit-tester can identify which string the pointer is over. This
// enables drag-strum (cross multiple rows in one gesture) — per-button
// pointer capture would have pinned events to the originally-pressed
// button.

import { resolveMaqamPerde } from '../tuning/perde-dictionary';
import type { QanunString } from './use-qanun-state';
import type { MandalPosition, MaqamPreset } from '../tuning/types';
import { MandalTrack } from './MandalTrack';

interface Props {
  s: QanunString;
  legal: readonly MandalPosition[];
  currentIndex: number;
  /** The active maqam — used to look up the row's canonical perde name. */
  maqam: MaqamPreset;
  isKarar: boolean;
  /** True for ~250ms after every trigger (mouse or key). */
  isFlashing?: boolean;
  /** True while a held key is sounding this string. Persistent glow. */
  isSustaining?: boolean;
  /** True if this string has been pinned via KeyL. */
  isPinned?: boolean;
  onStep: (step: 1 | -1) => void;
}

export function StringRow({
  s, legal, currentIndex, maqam,
  isKarar, isFlashing, isSustaining, isPinned,
  onStep,
}: Props) {
  const perde = resolveMaqamPerde({
    rowDegree: s.rowDegree,
    currentMandalIdx: currentIndex,
    legal,
    octave: s.octave,
    currentCentsMid: s.currentCentsMid,
  }, maqam);

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
    isPinned ? 'string-row--pinned' : '',
    `string-row--${s.octave}`,
  ]
    .filter(Boolean)
    .join(' ');

  const lampClass = [
    'string-row__lamp',
    (isFlashing || isSustaining) ? 'string-row__lamp--on' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={rowClass}>
      <span className={lampClass} aria-hidden="true" />
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
        {isPinned && <span className="string-row__pin-badge" aria-label="Pinned">📌</span>}
      </div>
      <button
        type="button"
        className="string-row__pluck"
        data-string-index={s.index}
        // Pointer handlers live at QanunInstrument level — see the
        // useEffect that wires pointerdown/move/up + elementFromPoint.
        // Suppress default context menu on long-press touch.
        onContextMenu={(e) => e.preventDefault()}
        aria-label={`Pluck ${perde.name}`}
      >
        <span className="string-row__pluck-line" aria-hidden="true" />
      </button>
    </div>
  );
}
