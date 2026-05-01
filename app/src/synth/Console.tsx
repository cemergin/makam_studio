// app/src/synth/Console.tsx
//
// Top-mounted Moog-style console.
//
// Two states:
//   - collapsed (~44px): machine name (read-only), tiny meter,
//     master volume slider, expand button
//   - expanded (~240px): six modules in signal-flow order:
//     OSC → FILTER → AMP → MOD → MASTER FX → MASTER
//
// Toggle: Tab key or the on-screen ▾/▴ button.
// While focused inside an input, Tab follows tab order — we only treat
// Tab as a console toggle when the focused element is body or any
// non-form element of the page.

import { useEffect, useState, type ReactNode } from 'react';
import { Meter } from './Meter';
import type { AnalyserLevel } from './hooks/useAnalyserLevel';

interface Props {
  level: AnalyserLevel;
  machineLabel: string;
  masterVolume: number;
  onMasterVolume: (v: number) => void;
  /** All six module elements; rendered only when expanded. */
  children: ReactNode;
}

const FORM_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function Console({
  level, machineLabel, masterVolume, onMasterVolume, children,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Tab') return;
      const t = document.activeElement;
      if (t && FORM_TAGS.has(t.tagName)) return;
      e.preventDefault();
      setExpanded((x) => !x);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section className={`console ${expanded ? 'console--expanded' : 'console--collapsed'}`} aria-label="Synth console">
      <div className="console__strip">
        <button
          type="button"
          className="console__toggle"
          onClick={() => setExpanded((x) => !x)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse console' : 'Expand console'}
        >
          {expanded ? '▴' : '▾'} {expanded ? 'COLLAPSE' : 'EXPAND'}
        </button>
        <span className="console__machine-label">{machineLabel}</span>
        <Meter level={level} variant="tiny" />
        <label className="console__master">
          <span>MASTER</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterVolume}
            onChange={(e) => onMasterVolume(Number(e.target.value))}
          />
        </label>
      </div>
      {expanded && <div className="console__rack">{children}</div>}
    </section>
  );
}
