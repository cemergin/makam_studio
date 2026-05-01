// app/src/synth/modules/AmpModule.tsx
//
// Amp ADSR. Four knobs + a small inline curve preview.

import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import type { ADSR } from '../../audio/machines';

interface Props {
  adsr: ADSR;
  onAdsr: (v: ADSR) => void;
}

function curvePath(adsr: ADSR, w = 80, h = 32): string {
  const total = Math.max(0.01, adsr.a + adsr.d + 1.0 + adsr.r);
  const x = (t: number) => (t / total) * w;
  const y = (lvl: number) => h - lvl * (h - 2);
  const ax = x(adsr.a);
  const dx = x(adsr.a + adsr.d);
  const sx = x(adsr.a + adsr.d + 1.0);
  const rx = x(total);
  const sy = y(adsr.s);
  return `M0,${h} L${ax.toFixed(1)},${y(1)} L${dx.toFixed(1)},${sy.toFixed(1)} L${sx.toFixed(1)},${sy.toFixed(1)} L${rx.toFixed(1)},${h}`;
}

export function AmpModule({ adsr, onAdsr }: Props) {
  return (
    <ConsoleModule title="AMP">
      <Knob label="A" value={adsr.a} min={0.001} max={3}  defaultValue={0.005} onChange={(v) => onAdsr({ ...adsr, a: v })} />
      <Knob label="D" value={adsr.d} min={0.001} max={4}  defaultValue={0.4}   onChange={(v) => onAdsr({ ...adsr, d: v })} />
      <Knob label="S" value={adsr.s} min={0}     max={1}  defaultValue={0.5}   onChange={(v) => onAdsr({ ...adsr, s: v })} />
      <Knob label="R" value={adsr.r} min={0.01}  max={6}  defaultValue={0.5}   onChange={(v) => onAdsr({ ...adsr, r: v })} />
      <svg className="amp-module__curve" width="80" height="32" viewBox="0 0 80 32" aria-hidden="true">
        <path d={curvePath(adsr)} stroke="var(--saffron, #f4a52a)" strokeWidth="1.5" fill="none" />
      </svg>
    </ConsoleModule>
  );
}
