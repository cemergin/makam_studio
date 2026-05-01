// app/src/synth/Knob.tsx
//
// Rotary knob primitive. Drives any numeric param. Used everywhere
// knobby in the console (machine octave, filter cutoff, ADSR knobs,
// LFO depth, reverb wet, etc.).
//
// Interactions:
//   - Drag vertical (primary): pixel→value, sensitivity scales with range
//   - Shift+drag: 10× lower sensitivity (fine adjust)
//   - Double-click: reset to default
//   - Scroll wheel over knob: increment by step
//
// Visual:
//   - 270° sweep (-135° at min, +135° at max), Moog/Eurorack standard
//   - Saffron indicator line from centre to perimeter
//   - Optional log scaling (cutoff Hz wants this)
//   - Active class when value != default
//
// Keyboard: tab-focusable; arrow keys nudge by step.

import { useCallback, useEffect, useRef, useState } from 'react';

export interface KnobProps {
  value: number;
  min: number;
  max: number;
  defaultValue?: number;
  step?: number;
  log?: boolean;        // log scaling (cutoff Hz)
  label?: string;
  unit?: string;
  format?: (v: number) => string;
  onChange: (v: number) => void;
  /** Whether the param is being modulated (e.g. LFO active on this dest). */
  modulated?: boolean;
  size?: number;        // px; default 44
}

const SWEEP_DEG = 270;
const MIN_DEG = -135;

function lin01(v: number, min: number, max: number, log: boolean): number {
  if (!log) return (v - min) / (max - min);
  const lo = Math.log(Math.max(1e-6, min));
  const hi = Math.log(Math.max(1e-6, max));
  return (Math.log(Math.max(1e-6, v)) - lo) / (hi - lo);
}
function from01(t: number, min: number, max: number, log: boolean): number {
  const u = Math.max(0, Math.min(1, t));
  if (!log) return min + u * (max - min);
  const lo = Math.log(Math.max(1e-6, min));
  const hi = Math.log(Math.max(1e-6, max));
  return Math.exp(lo + u * (hi - lo));
}

export function Knob({
  value, min, max, defaultValue = min, step,
  log = false, label, unit = '', format,
  onChange, modulated = false, size = 44,
}: KnobProps) {
  const elRef = useRef<HTMLButtonElement | null>(null);
  const dragRef = useRef<{ startY: number; startVal: number; fine: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  const norm = lin01(value, min, max, log);
  const angle = MIN_DEG + norm * SWEEP_DEG;

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragRef.current = { startY: e.clientY, startVal: value, fine: e.shiftKey };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = d.startY - e.clientY;            // up = increase
    const sens = (d.fine || e.shiftKey) ? 0.001 : 0.01;
    const startNorm = lin01(d.startVal, min, max, log);
    const next = from01(startNorm + dy * sens, min, max, log);
    const clamped = Math.max(min, Math.min(max, next));
    const stepped = step ? Math.round(clamped / step) * step : clamped;
    if (stepped !== value) onChange(stepped);
  };
  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    dragRef.current = null;
    setDragging(false);
  };
  const onDoubleClick = () => onChange(defaultValue);
  const onWheel = useCallback((e: WheelEvent) => {
    if (document.activeElement !== elRef.current) return;
    e.preventDefault();
    const sgn = e.deltaY < 0 ? 1 : -1;
    const s = step ?? (max - min) / 200;
    const next = Math.max(min, Math.min(max, value + sgn * s));
    onChange(next);
  }, [value, min, max, step, onChange]);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    const s = step ?? (max - min) / 100;
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight')   { e.preventDefault(); onChange(Math.min(max, value + s)); }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft')  { e.preventDefault(); onChange(Math.max(min, value - s)); }
  };

  const display = format ? format(value) : value.toFixed(unit === 'Hz' || unit === '¢' ? 0 : 2) + unit;

  return (
    <div className="knob" style={{ width: size }}>
      {label && <div className="knob__label">{label}</div>}
      <button
        ref={elRef}
        type="button"
        className={`knob__face ${dragging ? 'knob__face--dragging' : ''} ${modulated ? 'knob__face--modulated' : ''}`}
        style={{ width: size, height: size }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
        aria-label={label ?? 'knob'}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
        role="slider"
      >
        <div className="knob__indicator" style={{ transform: `rotate(${angle}deg)` }} />
      </button>
      <div className="knob__value">{display}</div>
    </div>
  );
}
