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
import { KeyboardOverlay } from './keyboard/KeyboardOverlay';
import type {
  MachineId, ADSR, FilterConfig, FilterEnv, LfoConfig,
} from './audio/machines';

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const;

/** Per-machine config bundle held in App state. Switching the active
 *  machine restores that machine's last config (so a user's filter
 *  tweak on the qanun isn't clobbered when they jump to vapor-pluck). */
interface MachineConfig {
  ampAdsr: ADSR;
  filter: FilterConfig;
  filterEnv: FilterEnv;
  lfo1: LfoConfig;
  lfo2: LfoConfig;
  brightness: number;
  body: number;
}

/** Sensible defaults per machine. The values mirror each machine's
 *  internal "if not provided" defaults so the UI shows reality. */
const MACHINE_DEFAULTS: Record<MachineId, MachineConfig> = {
  'qanun': {
    ampAdsr:   { a: 0.005, d: 0.4, s: 0.5, r: 0.5 },
    filter:    { type: 'lp', cutoff: 6000, q: 0.7 },
    filterEnv: { a: 0.005, d: 0.8, s: 0.0, r: 0.2, amount: 0.3 },
    lfo1:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
    lfo2:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
    brightness: 0.6,
    body: 0.3,
  },
  'vapor-pluck': {
    ampAdsr:   { a: 0.005, d: 0.4, s: 0.5, r: 0.5 },
    filter:    { type: 'lp', cutoff: 1500, q: 0.7 },
    filterEnv: { a: 0.005, d: 0.6, s: 0.0, r: 0.3, amount: 0.6 },
    lfo1:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
    lfo2:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
    brightness: 0.6,
    body: 0.3,
  },
  'synthwave-saw': {
    ampAdsr:   { a: 0.005, d: 0.4, s: 0.5, r: 0.5 },
    // Cutoff at ~3 kHz is a reasonable mid-range default; the per-note
    // 2*freq + brightness*6kHz formula ran when the slider was UI-less.
    // Now the user can override via the UI; default sits roughly there.
    filter:    { type: 'lp', cutoff: 3000, q: 1.5 },
    filterEnv: { a: 0.005, d: 0.5, s: 0.2, r: 0.3, amount: 0.4 },
    lfo1:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
    lfo2:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
    brightness: 0.6,
    body: 0.3,
  },
  'dream-pad': {
    ampAdsr:   { a: 1.0, d: 1.0, s: 0.7, r: 1.0 },
    filter:    { type: 'bp', cutoff: 1800, q: 1.5 },
    filterEnv: { a: 0.5, d: 1.0, s: 0.5, r: 1.0, amount: 0.0 },
    lfo1:      { rate: 0.5, shape: 'sine', depth: 0, destination: 'off' },
    lfo2:      { rate: 0.3, shape: 'sine', depth: 0, destination: 'off' },
    brightness: 0.5,
    body: 0.3,
  },
};

export function App() {
  const { ctx, state: audioState, resume } = useAudioContext();
  const busRef = useRef<MasterBus | null>(null);

  if (!busRef.current) {
    busRef.current = createMasterBus(ctx);
  }
  const bus = busRef.current;

  // DEBUG: expose ctx + bus to window for live audio-path probing.
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ctx = ctx;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__bus = bus;
  }

  useEffect(() => {
    return () => {
      busRef.current?.dispose();
      busRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [maqam, setMaqam] = useState<MaqamPreset>(RAST);

  // Active machine + per-machine config map. Switching machines
  // restores that machine's last-used config.
  const [machineId, setMachineId] = useState<MachineId>('qanun');
  const [configs, setConfigs] = useState<Record<MachineId, MachineConfig>>(() => ({ ...MACHINE_DEFAULTS }));

  const [masterVolume, setMasterVolume] = useState(0.6);
  useEffect(() => {
    bus.setMasterVolume(masterVolume);
  }, [masterVolume, bus]);

  const [tweaksOpen, setTweaksOpen] = useState(true);

  // Drone octave offset (-2..+2 octaves from the held pitch).
  const [droneOctave, setDroneOctave] = useState(0);

  // Karar transpose in semitones from the maqam's preset karar.
  const [kararSemitoneOffset, setKararSemitoneOffset] = useState(0);

  const maqamat = useMemo(() => ALL_MAQAMAT, []);

  const cfg = configs[machineId];
  const updateCfg = (patch: Partial<MachineConfig>) =>
    setConfigs((prev) => ({ ...prev, [machineId]: { ...prev[machineId], ...patch } }));

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
        <div className="karar-bar" role="group" aria-label="Karar transpose">
          <span className="karar-bar__label">karar transpose</span>
          {NOTE_NAMES.map((n, i) => {
            const offsetMod = ((kararSemitoneOffset % 12) + 12) % 12;
            const active = i === offsetMod;
            return (
              <button
                key={n}
                type="button"
                className={`karar-bar__note ${active ? 'karar-bar__note--active' : ''}`}
                onClick={() => setKararSemitoneOffset(i)}
                title={`Set karar offset to +${i} semitone${i === 1 ? '' : 's'}`}
              >
                {n}
              </button>
            );
          })}
          <button
            type="button"
            className="karar-bar__step"
            onClick={() => setKararSemitoneOffset((v) => v - 12)}
            aria-label="Karar one octave down"
          >−8</button>
          <button
            type="button"
            className="karar-bar__step"
            onClick={() => setKararSemitoneOffset((v) => v + 12)}
            aria-label="Karar one octave up"
          >+8</button>
          <button
            type="button"
            className="karar-bar__reset"
            onClick={() => setKararSemitoneOffset(0)}
          >reset</button>
          <span className="karar-bar__readout">{kararSemitoneOffset >= 0 ? '+' : ''}{kararSemitoneOffset} st</span>
        </div>
        <QanunInstrument
          maqam={maqam}
          audioContext={ctx}
          destination={bus.input}
          machineId={machineId}
          brightness={cfg.brightness}
          body={cfg.body}
          adsr={cfg.ampAdsr}
          filter={cfg.filter}
          filterEnv={cfg.filterEnv}
          lfo1={cfg.lfo1}
          lfo2={cfg.lfo2}
          kararSemitoneOffset={kararSemitoneOffset}
          onMaqamSelect={(idx) => {
            const next = maqamat[idx];
            if (next) setMaqam(next);
          }}
          droneOctave={droneOctave}
        />
      </main>
      <KeyboardOverlay />

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
            machineId={machineId}
            brightness={cfg.brightness}
            body={cfg.body}
            masterVolume={masterVolume}
            adsr={cfg.ampAdsr}
            filter={cfg.filter}
            filterEnv={cfg.filterEnv}
            lfo1={cfg.lfo1}
            lfo2={cfg.lfo2}
            droneOctave={droneOctave}
            onMachineId={setMachineId}
            onBrightness={(brightness) => updateCfg({ brightness })}
            onBody={(body) => updateCfg({ body })}
            onMasterVolume={setMasterVolume}
            onAdsr={(ampAdsr) => updateCfg({ ampAdsr })}
            onFilter={(filter) => updateCfg({ filter })}
            onFilterEnv={(filterEnv) => updateCfg({ filterEnv })}
            onLfo1={(lfo1) => updateCfg({ lfo1 })}
            onLfo2={(lfo2) => updateCfg({ lfo2 })}
            onDroneOctave={setDroneOctave}
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
