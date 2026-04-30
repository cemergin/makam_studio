// MandalTrack — left column of a string row.
//
// Renders the legal mandal positions as ticks across a horizontal track,
// with a saffron position bar showing the current selection, and ‹/›
// step buttons that retune the string by ±1 position. Audio preview on
// each step is wired by the parent (StringRow → onStep callback).

import type { MandalPosition } from '../tuning/types';

interface Props {
  legal: readonly MandalPosition[];
  currentIndex: number;
  onStep: (step: 1 | -1) => void;
}

export function MandalTrack({ legal, currentIndex, onStep }: Props) {
  if (legal.length === 0) return null;
  const minCents = legal[0].cents_from_karar;
  const maxCents = legal[legal.length - 1].cents_from_karar;
  const span = Math.max(1, maxCents - minCents);

  const positionPct = (cents: number) =>
    ((cents - minCents) / span) * 100;

  const currentCents = legal[currentIndex]?.cents_from_karar ?? minCents;

  return (
    <div className="mandal-track">
      <button
        type="button"
        className="mandal-track__step"
        onClick={() => onStep(-1)}
        disabled={currentIndex === 0}
        aria-label="Step down"
      >
        ‹
      </button>
      <div className="mandal-track__rail" role="presentation">
        {legal.map((p, i) => (
          <span
            key={i}
            className={`mandal-track__tick ${p.is_canonical ? 'mandal-track__tick--canonical' : ''}`}
            style={{ left: `${positionPct(p.cents_from_karar)}%` }}
            title={p.label ?? ''}
            aria-hidden="true"
          />
        ))}
        <span
          className="mandal-track__bar"
          style={{ left: `${positionPct(currentCents)}%` }}
          aria-hidden="true"
        />
      </div>
      <button
        type="button"
        className="mandal-track__step"
        onClick={() => onStep(1)}
        disabled={currentIndex === legal.length - 1}
        aria-label="Step up"
      >
        ›
      </button>
    </div>
  );
}
