// MaqamRail — left rail. Logo + karar block + 8 maqam buttons + legend +
// seyir text. Active maqam highlighted in deep teal with saffron left bar.

import type { MaqamPreset } from '../tuning/types';
import { defaultKararHz } from '../tuning/maqamat';

interface Props {
  maqamat: readonly MaqamPreset[];
  active: MaqamPreset;
  onSelect: (m: MaqamPreset) => void;
}

export function MaqamRail({ maqamat, active, onSelect }: Props) {
  const kararHz = defaultKararHz(active);
  return (
    <aside className="rail" aria-label="Maqam selector">
      <div className="rail__logo">
        <span className="rail__logo-mark">M</span>
        <span className="rail__logo-text">makam_studio</span>
      </div>

      <section className="rail__karar">
        <span className="rail__karar-label">karar</span>
        <span className="rail__karar-name">{active.karar_perde}</span>
        <span className="rail__karar-hz">{kararHz.toFixed(1)} Hz</span>
      </section>

      <nav className="rail__maqamat" aria-label="Maqam list">
        {maqamat.map((m) => {
          const isActive = m.id === active.id;
          return (
            <button
              key={m.id}
              type="button"
              className={`rail__maqam ${isActive ? 'rail__maqam--active' : ''}`}
              onClick={() => onSelect(m)}
              aria-pressed={isActive}
            >
              <span className="rail__maqam-bar" aria-hidden="true" />
              <span className="rail__maqam-name">{m.name.canonical}</span>
              {m.name.native && (
                <span className="rail__maqam-native">{m.name.native}</span>
              )}
            </button>
          );
        })}
      </nav>

      <section className="rail__legend">
        <span className="rail__legend-title">legend</span>
        <span className="rail__legend-row">
          <span className="rail__legend-swatch rail__legend-swatch--karar" />
          karar (durak)
        </span>
        <span className="rail__legend-row">
          <span className="rail__legend-swatch rail__legend-swatch--saffron" />
          modified string
        </span>
        <span className="rail__legend-row">
          <span className="rail__legend-swatch rail__legend-swatch--canonical" />
          canonical mandal
        </span>
      </section>

      {active.seyir && (
        <section className="rail__seyir">
          <span className="rail__seyir-title">seyir</span>
          <p className="rail__seyir-text">{active.seyir}</p>
          {active.notes && <p className="rail__seyir-notes">{active.notes}</p>}
        </section>
      )}
    </aside>
  );
}
