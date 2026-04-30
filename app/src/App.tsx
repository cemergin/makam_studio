import { useState } from 'react';

// Phase 2 placeholder shell. NO functional UI yet.
// The three layout-mode buttons below are non-functional and exist only to
// demonstrate the upcoming structure (per docs/spec/v1.md §2.6 and the
// design-direction.md "Pivot 1" note that the qanun-honor view is a toggle,
// not the default).

type LayoutMode = 'split-keyboard' | 'single-surface' | 'qanun-honor';

const LAYOUTS: ReadonlyArray<{ id: LayoutMode; label: string; hint: string }> = [
  {
    id: 'split-keyboard',
    label: 'Split keyboard',
    hint: 'Default. Left zone = preset selector + karar slider; right zone = microtonal piano.',
  },
  {
    id: 'single-surface',
    label: 'Single surface',
    hint: 'Hide the left zone; expand the keyboard for full-width playing.',
  },
  {
    id: 'qanun-honor',
    label: 'Qanun honor',
    hint: 'Trapezoidal mandal grid view — for users who already know the instrument.',
  },
];

export function App() {
  const [layout, setLayout] = useState<LayoutMode>('split-keyboard');

  return (
    <div className="app">
      <header className="app-header">
        <h1>makam_studio</h1>
        <p className="tagline">
          Browser-based maqam synthesizer with a qanun-like control surface.
        </p>
        <p className="banner">Phase 2 in progress</p>
      </header>

      <main className="app-main">
        <section className="layout-toggles" aria-label="Layout mode">
          <h2>Layout modes</h2>
          <div className="tabs" role="tablist">
            {LAYOUTS.map((l) => (
              <button
                key={l.id}
                type="button"
                role="tab"
                aria-selected={layout === l.id}
                className={layout === l.id ? 'tab tab--active' : 'tab'}
                onClick={() => setLayout(l.id)}
                disabled
                title="Non-functional in this scaffold; subsequent commits wire these up."
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="layout-hint">
            <strong>{LAYOUTS.find((l) => l.id === layout)?.label}:</strong>{' '}
            {LAYOUTS.find((l) => l.id === layout)?.hint}
          </p>
        </section>

        <section className="placeholder-pane">
          <p>
            The instrument surface lands in subsequent commits. The shared
            engine (events / router / audio-graph / MIDI / PWA helpers) is
            already vendor-copied into <code>src/_core/</code> from{' '}
            <a
              href="https://github.com/cemergin/musical-core"
              target="_blank"
              rel="noreferrer"
            >
              musical-core
            </a>
            .
          </p>
        </section>
      </main>

      <footer className="app-footer">
        <a href="../MANIFESTO.md">MANIFESTO</a>
        <span aria-hidden="true"> · </span>
        <a
          href="https://github.com/cemergin/makam_studio"
          target="_blank"
          rel="noreferrer"
        >
          github
        </a>
        <span aria-hidden="true"> · </span>
        <span className="muted">MIT · offline · no accounts</span>
      </footer>
    </div>
  );
}
