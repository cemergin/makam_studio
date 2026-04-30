// SynthControls — three knobs for the Karplus-Strong voice
// (brightness, decay, body) plus master volume.

interface Props {
  brightness: number;
  decay: number;
  body: number;
  masterVolume: number;
  onBrightness: (v: number) => void;
  onDecay: (v: number) => void;
  onBody: (v: number) => void;
  onMasterVolume: (v: number) => void;
}

function Slider({
  id, label, value, onChange, hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="synth-slider">
      <label htmlFor={id} className="synth-slider__label">
        {label}
        <span className="synth-slider__value">{Math.round(value * 100)}</span>
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint && <span className="synth-slider__hint">{hint}</span>}
    </div>
  );
}

export function SynthControls({
  brightness, decay, body, masterVolume,
  onBrightness, onDecay, onBody, onMasterVolume,
}: Props) {
  return (
    <section className="card" aria-label="Synth controls">
      <h3 className="card__title">String</h3>
      <Slider
        id="synth-brightness"
        label="brightness"
        value={brightness}
        onChange={onBrightness}
        hint="loop lowpass cutoff"
      />
      <Slider
        id="synth-decay"
        label="decay"
        value={decay}
        onChange={onDecay}
        hint="feedback gain"
      />
      <Slider
        id="synth-body"
        label="body"
        value={body}
        onChange={onBody}
        hint="parallel resonance"
      />
      <Slider
        id="master-volume"
        label="master"
        value={masterVolume}
        onChange={onMasterVolume}
      />
    </section>
  );
}
