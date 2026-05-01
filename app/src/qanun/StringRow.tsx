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
// Pluck input: the button uses pointer events (covers mouse + pen +
// touch in a single API) so press / release on any device produces a
// SUSTAINED note. Press → onPress; release / leave / cancel → onRelease.

import { useRef } from 'react';
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
  /** Pointer pressed on the pluck button — start a sustained note. */
  onPress: () => void;
  /** Pointer released / cancelled / left — release the sustained note. */
  onRelease: () => void;
}

export function StringRow({
  s, legal, currentIndex, maqam,
  isKarar, isFlashing, isSustaining, isPinned,
  onStep, onPress, onRelease,
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

  // Track whether a pointer-down on THIS button is currently active so
  // we don't fire onRelease for a stray onPointerLeave when the pointer
  // never went down here (e.g. user drags from another row).
  const activeRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    activeRef.current = true;
    // capture so onPointerUp fires reliably even if the user drags
    // outside the button bounds before releasing.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    onPress();
  };
  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!activeRef.current) return;
    activeRef.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* */ }
    onRelease();
  };
  const handlePointerCancel = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!activeRef.current) return;
    activeRef.current = false;
    try { e.currentTarget.releasePointerCapture?.(e.pointerId); } catch { /* */ }
    onRelease();
  };

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
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        // Some browsers fire pointer-leave instead of pointer-cancel
        // when capture is dropped (e.g. the element disappears). Treat
        // it as a release to avoid stuck notes.
        onPointerLeave={handlePointerCancel}
        // Suppress default context menu on long-press touch.
        onContextMenu={(e) => e.preventDefault()}
        aria-label={`Pluck ${perde.name}`}
      >
        <span className="string-row__pluck-line" aria-hidden="true" />
      </button>
    </div>
  );
}
