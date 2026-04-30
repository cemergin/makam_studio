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

export function App() {
  const { ctx, state: audioState, resume } = useAudioContext();
  const busRef = useRef<MasterBus | null>(null);

  // Build the master bus once; recreate if the AudioContext is replaced
  // (it isn't, but we guard anyway).
  if (!busRef.current) {
    busRef.current = createMasterBus(ctx);
  }
  const bus = busRef.current;

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
      </header>

      <MaqamRail maqamat={maqamat} active={maqam} onSelect={setMaqam} />

      <main className="main">
        <QanunInstrument
          maqam={maqam}
          audioContext={ctx}
          destination={bus.input}
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
            brightness={brightness}
            decay={decay}
            body={body}
            masterVolume={masterVolume}
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
