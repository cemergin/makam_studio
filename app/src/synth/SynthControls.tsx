// SynthControls — voice selector + ADSR envelope + tone knobs
// (brightness, body) + master volume.

import type { ADSR } from '../audio/voices';
import { VOICES, type VoiceId } from '../audio/voices';

interface Props {
  voiceId: VoiceId;
  brightness: number;
  body: number;
  masterVolume: number;
  adsr: ADSR;
  droneOctave: number;
  onVoiceId: (v: VoiceId) => void;
  onBrightness: (v: number) => void;
  onBody: (v: number) => void;
  onMasterVolume: (v: number) => void;
  onAdsr: (v: ADSR) => void;
  onDroneOctave: (n: number) => void;
}

function Slider({
  id, label, value, onChange, hint, min = 0, max = 1, step = 0.01,
  format,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  format?: (v: number) => string;
}) {
  return (
    <div className="synth-slider">
      <label htmlFor={id} className="synth-slider__label">
        {label}
        <span className="synth-slider__value">
          {format ? format(value) : Math.round(value * 100)}
        </span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <span className="synth-slider__hint">{hint}</span>}
    </div>
  );
}

/** Inline SVG visualization of the ADSR shape — gives the sliders an
 *  immediate "what does this look like" reading. */
function AdsrCurve({ adsr }: { adsr: ADSR }) {
  // Layout: A ramps from 0 to peak; D ramps from peak to S; sustain
  // holds for a fixed display time; R ramps from S to 0.
  const W = 240;
  const H = 50;
  const padX = 4;
  const padY = 4;
  const peak = H - padY;
  const sustainY = padY + (1 - adsr.s) * (H - 2 * padY);
  // Time scale: total visible = a + d + 0.4 (sustain hold) + r, capped.
  const totalTime = Math.max(0.05, adsr.a + adsr.d + 0.4 + adsr.r);
  const xFor = (t: number) => padX + (t / totalTime) * (W - 2 * padX);

  const x0 = xFor(0);
  const x1 = xFor(adsr.a);
  const x2 = xFor(adsr.a + adsr.d);
  const x3 = xFor(adsr.a + adsr.d + 0.4);
  const x4 = xFor(adsr.a + adsr.d + 0.4 + adsr.r);

  const path = `M ${x0} ${peak} L ${x1} ${padY} L ${x2} ${sustainY} L ${x3} ${sustainY} L ${x4} ${peak}`;
  return (
    <svg className="adsr-curve" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <rect x="0" y="0" width={W} height={H} fill="rgba(0,0,0,0.25)" />
      <line x1="0" y1={peak} x2={W} y2={peak} stroke="rgba(255,255,255,0.15)" />
      <line x1={x1} y1={padY} x2={x1} y2={peak} stroke="rgba(232,213,106,0.25)" strokeDasharray="2 2" />
      <line x1={x2} y1={padY} x2={x2} y2={peak} stroke="rgba(232,213,106,0.25)" strokeDasharray="2 2" />
      <line x1={x3} y1={padY} x2={x3} y2={peak} stroke="rgba(232,213,106,0.25)" strokeDasharray="2 2" />
      <path d={path} fill="none" stroke="var(--saffron)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function SynthControls({
  voiceId, brightness, body, masterVolume, adsr, droneOctave,
  onVoiceId, onBrightness, onBody, onMasterVolume, onAdsr, onDroneOctave,
}: Props) {
  const setA = (a: number) => onAdsr({ ...adsr, a });
  const setD = (d: number) => onAdsr({ ...adsr, d });
  const setS = (s: number) => onAdsr({ ...adsr, s });
  const setR = (r: number) => onAdsr({ ...adsr, r });
  const fmtSec = (v: number) => `${v.toFixed(2)}s`;

  return (
    <section className="card" aria-label="Synth controls">
      <h3 className="card__title">Voice</h3>
      <div className="synth-voice-selector" role="group" aria-label="Voice selector">
        {VOICES.map((v) => (
          <button
            key={v.id}
            type="button"
            className="synth-voice-selector__btn"
            onClick={() => onVoiceId(v.id)}
            aria-pressed={voiceId === v.id}
          >
            {v.label}
          </button>
        ))}
      </div>

      <h3 className="card__title">Envelope (ADSR)</h3>
      <AdsrCurve adsr={adsr} />
      <Slider
        id="adsr-a"
        label="attack"
        value={adsr.a}
        onChange={setA}
        min={0.001} max={2} step={0.001}
        format={fmtSec}
      />
      <Slider
        id="adsr-d"
        label="decay"
        value={adsr.d}
        onChange={setD}
        min={0.01} max={3} step={0.01}
        format={fmtSec}
      />
      <Slider
        id="adsr-s"
        label="sustain"
        value={adsr.s}
        onChange={setS}
      />
      <Slider
        id="adsr-r"
        label="release"
        value={adsr.r}
        onChange={setR}
        min={0.01} max={4} step={0.01}
        format={fmtSec}
      />

      <h3 className="card__title">Tone</h3>
      <Slider
        id="synth-brightness"
        label="brightness"
        value={brightness}
        onChange={onBrightness}
        hint="filter cutoff"
      />
      <Slider
        id="synth-body"
        label="body"
        value={body}
        onChange={onBody}
        hint="resonance (qanun only)"
      />
      <Slider
        id="master-volume"
        label="master"
        value={masterVolume}
        onChange={onMasterVolume}
      />

      <h3 className="card__title">Drone</h3>
      <div className="drone-octave" role="group" aria-label="Drone octave offset">
        <span className="synth-slider__label">octave</span>
        {[-2, -1, 0, 1, 2].map((n) => (
          <button
            key={n}
            type="button"
            className={`drone-octave__btn ${droneOctave === n ? 'drone-octave__btn--active' : ''}`}
            onClick={() => onDroneOctave(n)}
            aria-pressed={droneOctave === n}
          >
            {n > 0 ? `+${n}` : n === 0 ? '0' : `${n}`}
          </button>
        ))}
      </div>
    </section>
  );
}
