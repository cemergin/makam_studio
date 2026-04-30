// SynthControls — voice selector + three knobs (brightness, decay, body)
// + master volume. The voice selector picks one of the registered
// VoiceIds; brightness/decay/body are interpreted per-voice (qanun reads
// all three; the modern synth voices read brightness + decay and ignore
// body).

import { VOICES, type VoiceId } from '../audio/voices';

interface Props {
  voiceId: VoiceId;
  brightness: number;
  decay: number;
  body: number;
  masterVolume: number;
  onVoiceId: (v: VoiceId) => void;
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
  voiceId, brightness, decay, body, masterVolume,
  onVoiceId, onBrightness, onDecay, onBody, onMasterVolume,
}: Props) {
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
      <Slider
        id="synth-brightness"
        label="brightness"
        value={brightness}
        onChange={onBrightness}
        hint="loop / filter cutoff"
      />
      <Slider
        id="synth-decay"
        label="decay"
        value={decay}
        onChange={onDecay}
        hint="sustain length"
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
    </section>
  );
}
