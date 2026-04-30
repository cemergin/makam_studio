// makam_studio — main app shell.
//
// Layout: 3-column grid (rail | main | tweaks). Header spans full width.
// The tweaks panel collapses to a thin strip; users expand it for synth
// + FX controls. Audio context lazily resumes on the first user gesture.

import { useEffect, useMemo, useRef, useState } from 'react';
import './styles/istanbul-brutalist.css';

import { ALL_MAQAMAT, RAST } from './tuning/maqamat';
import type { MaqamPreset } from './tuning/types';

import { useAudioContext } from './audio/audio-context';
import { createMasterBus } from './audio/master-bus';
import type { MasterBus } from './audio/master-bus';

import { MaqamRail } from './qanun/MaqamRail';
import { QanunInstrument } from './qanun/QanunInstrument';
import { SynthControls } from './synth/SynthControls';
import { FxControls } from './synth/FxControls';
import type { VoiceId } from './audio/voices';

export function App() {
  const { ctx, state: audioState, resume } = useAudioContext();
  const busRef = useRef<MasterBus | null>(null);

  // Build the master bus once; recreate if the AudioContext is replaced
  // (it isn't, but we guard anyway).
  if (!busRef.current) {
    busRef.current = createMasterBus(ctx);
  }
  const bus = busRef.current;

  // DEBUG: expose ctx + bus to window for live audio-path probing.
  // Remove after the audio chain is verified working end-to-end.
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ctx = ctx;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__bus = bus;
  }

  // Tear down on unmount.
  useEffect(() => {
    return () => {
      busRef.current?.dispose();
      busRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [maqam, setMaqam] = useState<MaqamPreset>(RAST);

  // Synth params.
  const [voiceId, setVoiceId] = useState<VoiceId>('qanun');
  const [brightness, setBrightness] = useState(0.6);
  const [decay, setDecay] = useState(0.7);
  const [body, setBody] = useState(0.3);
  const [masterVolume, setMasterVolume] = useState(0.6);
  useEffect(() => {
    bus.setMasterVolume(masterVolume);
  }, [masterVolume, bus]);

  const [tweaksOpen, setTweaksOpen] = useState(true);

  const maqamat = useMemo(() => ALL_MAQAMAT, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-header__title">makam_studio</h1>
        <span className="app-header__maqam">
          {maqam.name.canonical}
          {maqam.name.native && (
            <span className="app-header__maqam-native">{maqam.name.native}</span>
          )}
        </span>
        <span className="app-header__karar">
          karar
          <span className="app-header__karar-name">{maqam.karar_perde}</span>
        </span>
        <span
          className="app-header__kbd"
          title={[
            'Keyboard input (physical-key positions, layout-agnostic):',
            '',
            '  High   Q W E R T   degrees 4 5 6 7 8  (R = karar+oct)',
            '  Karar  A S D F G   degrees 1 2 3 4 5  (A = karar)',
            '  Low    Z X C V B   degrees -4..0     (B = karar)',
            '',
            'Modifier flower (right hand):',
            '  J = canonical    H/N/M = -1/-2/-3 mandal',
            '                   K/U/I = +1/+2/+3 mandal',
            '',
            'Shift  = transpose +5 scale degrees while held',
            'Space  = sustain last pitch as drone while held',
          ].join('\n')}
          aria-label="Keyboard input help"
        >
          kbd <span className="app-header__kbd-icon" aria-hidden="true">⌨</span>
        </span>
      </header>

      <MaqamRail maqamat={maqamat} active={maqam} onSelect={setMaqam} />

      <main className="main">
        <QanunInstrument
          maqam={maqam}
          audioContext={ctx}
          destination={bus.input}
          voiceId={voiceId}
          brightness={brightness}
          decay={decay}
          body={body}
        />
      </main>

      {tweaksOpen ? (
        <aside className="tweaks" aria-label="Tweaks">
          <button
            type="button"
            className="tweaks__toggle"
            onClick={() => setTweaksOpen(false)}
          >
            collapse ›
          </button>
          {audioState !== 'running' && (
            <button
              type="button"
              className="audio-resume"
              onClick={() => resume()}
            >
              Resume audio ({audioState})
            </button>
          )}
          <SynthControls
            voiceId={voiceId}
            brightness={brightness}
            decay={decay}
            body={body}
            masterVolume={masterVolume}
            onVoiceId={setVoiceId}
            onBrightness={setBrightness}
            onDecay={setDecay}
            onBody={setBody}
            onMasterVolume={setMasterVolume}
          />
          <FxControls bus={bus} />
        </aside>
      ) : (
        <aside className="tweaks tweaks--collapsed" aria-label="Tweaks (collapsed)">
          <button
            type="button"
            className="tweaks__toggle"
            onClick={() => setTweaksOpen(true)}
          >
            ‹ tweaks
          </button>
        </aside>
      )}
    </div>
  );
}
