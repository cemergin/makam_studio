// app/src/synth/ConsoleModule.tsx
//
// Generic module shell used by every console module. Header (small-caps
// title), body slot for knobs/selects, and a thin signal-flow arrow on
// the right edge connecting to the next module.

import type { ReactNode } from 'react';

interface Props {
  title: string;
  /** When true, renders the right-edge arrow (signal flow continues). */
  flowsForward?: boolean;
  children: ReactNode;
}

export function ConsoleModule({ title, flowsForward = true, children }: Props) {
  return (
    <section className="console-module">
      <header className="console-module__header">
        <span className="console-module__title">{title}</span>
      </header>
      <div className="console-module__body">{children}</div>
      {flowsForward && <span className="console-module__arrow" aria-hidden="true">▸</span>}
    </section>
  );
}
