// app/src/App.tsx
//
// makam_studio — main app shell.
//
// Layout (top → bottom):
//   Header (slim) → Console (collapsible top-mounted Moog rack) →
//   MaqamRail | (karar bar + qanun strings)
//
// Audio context lazily resumes on the first user gesture (the resume
// button surfaces in the MASTER module while ctx is suspended).

import { useEffect, useMemo, useRef, useState } from 'react';
import './styles/istanbul-brutalist.css';

import { ALL_MAQAMAT, RAST } from './tuning/maqamat';
import type { MaqamPreset } from './tuning/types';

import { useAudioContext } from './audio/audio-context';
import { createMasterBus } from './audio/master-bus';
import type { MasterBus } from './audio/master-bus';

import { MaqamRail } from './qanun/MaqamRail';
import { QanunInstrument } from './qanun/QanunInstrument';
import { KeyboardOverlay } from './keyboard/KeyboardOverlay';

import { Console } from './synth/Console';
import { useAnalyserLevel } from './synth/hooks/useAnalyserLevel';
import { OscModule } from './synth/modules/OscModule';
import { FilterModule } from './synth/modules/FilterModule';
import { AmpModule } from './synth/modules/AmpModule';
import { ModModule } from './synth/modules/ModModule';
import { FxModule } from './synth/modules/FxModule';
import { MasterModule } from './synth/modules/MasterModule';

import {
  MACHINES, MACHINE_PARAMS,
  type MachineId, type ADSR, type FilterConfig, type FilterEnv,
  type LfoConfig, type MachineParamValues,
} from './audio/machines';

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const;

interface MachineConfig {
  ampAdsr: ADSR;
  filter: FilterConfig;
  filterEnv: FilterEnv;
  lfo1: LfoConfig;
  lfo2: LfoConfig;
  brightness: number;
  body: number;
  octave: number;
  params: MachineParamValues;
}

function machineDefaults(id: MachineId): MachineConfig {
  const params: MachineParamValues = {};
  for (const p of MACHINE_PARAMS[id]) params[p.name] = p.default;
  // base universal layer per machine — same as before with octave added
  const universal: Record<MachineId, Omit<MachineConfig, 'params'>> = {
    'qanun': {
      ampAdsr:   { a: 0.005, d: 0.4, s: 0.5, r: 0.5 },
      filter:    { type: 'lp', cutoff: 6000, q: 0.7 },
      filterEnv: { a: 0.005, d: 0.8, s: 0,   r: 0.2, amount: 0.3 },
      lfo1:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      lfo2:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      brightness: 0.6, body: 0.3, octave: 0,
    },
    'vapor-pluck': {
      ampAdsr:   { a: 0.005, d: 0.4, s: 0.5, r: 0.5 },
      filter:    { type: 'lp', cutoff: 1500, q: 0.7 },
      filterEnv: { a: 0.005, d: 0.6, s: 0,   r: 0.3, amount: 0.6 },
      lfo1:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      lfo2:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      brightness: 0.6, body: 0.3, octave: 0,
    },
    'synthwave-saw': {
      ampAdsr:   { a: 0.005, d: 0.4, s: 0.5, r: 0.5 },
      filter:    { type: 'lp', cutoff: 3000, q: 1.5 },
      filterEnv: { a: 0.005, d: 0.5, s: 0.2, r: 0.3, amount: 0.4 },
      lfo1:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      lfo2:      { rate: 2, shape: 'sine', depth: 0, destination: 'off' },
      brightness: 0.6, body: 0.3, octave: 0,
    },
    'dream-pad': {
      ampAdsr:   { a: 1.0, d: 1.0, s: 0.7, r: 1.0 },
      filter:    { type: 'bp', cutoff: 1800, q: 1.5 },
      filterEnv: { a: 0.5, d: 1.0, s: 0.5, r: 1.0, amount: 0 },
      lfo1:      { rate: 0.5, shape: 'sine', depth: 0, destination: 'off' },
      lfo2:      { rate: 0.3, shape: 'sine', depth: 0, destination: 'off' },
      brightness: 0.5, body: 0.3, octave: 0,
    },
  };
  return { ...universal[id], params };
}

export function App() {
  const { ctx, state: audioState, resume } = useAudioContext();
  const busRef = useRef<MasterBus | null>(null);

  if (!busRef.current) busRef.current = createMasterBus(ctx);
  const bus = busRef.current;

  if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__ctx = ctx;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__bus = bus;
  }

  useEffect(() => {
    return () => { busRef.current?.dispose(); busRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [maqam, setMaqam] = useState<MaqamPreset>(RAST);
  const [machineId, setMachineId] = useState<MachineId>('qanun');
  const [configs, setConfigs] = useState<Record<MachineId, MachineConfig>>(() => ({
    'qanun': machineDefaults('qanun'),
    'vapor-pluck': machineDefaults('vapor-pluck'),
    'synthwave-saw': machineDefaults('synthwave-saw'),
    'dream-pad': machineDefaults('dream-pad'),
  }));
  const [masterVolume, setMasterVolume] = useState(0.6);
  useEffect(() => { bus.setMasterVolume(masterVolume); }, [masterVolume, bus]);

  const [kararSemitoneOffset, setKararSemitoneOffset] = useState(0);
  const maqamat = useMemo(() => ALL_MAQAMAT, []);
  const cfg = configs[machineId];
  const updateCfg = (patch: Partial<MachineConfig>) =>
    setConfigs((prev) => ({ ...prev, [machineId]: { ...prev[machineId], ...patch } }));

  const level = useAnalyserLevel(bus.analyser);
  const machineLabel = MACHINES.find((m) => m.id === machineId)?.label ?? machineId;

  // Derive whether a destination is being actively modulated, so the
  // corresponding knob in the console pulses (Phase 6.2).
  const isModulated = (dest: 'pitch' | 'filter' | 'amp') =>
    (cfg.lfo1.depth > 0 && cfg.lfo1.destination === dest) ||
    (cfg.lfo2.depth > 0 && cfg.lfo2.destination === dest);

  return (
    <div className="app app--top-console">
      <header className="app-header">
        <h1 className="app-header__title">makam_studio</h1>
        <span className="app-header__maqam">
          {maqam.name.canonical}
          {maqam.name.native && (<span className="app-header__maqam-native">{maqam.name.native}</span>)}
        </span>
        <span className="app-header__karar">
          karar
          <span className="app-header__karar-name">{maqam.karar_perde}</span>
        </span>
      </header>

      <Console
        level={level}
        machineLabel={machineLabel}
        masterVolume={masterVolume}
        onMasterVolume={setMasterVolume}
      >
        <OscModule
          machineId={machineId}
          octave={cfg.octave}
          brightness={cfg.brightness}
          body={cfg.body}
          machineParams={cfg.params}
          modulatedPitch={isModulated('pitch')}
          onMachineId={setMachineId}
          onOctave={(octave) => updateCfg({ octave })}
          onBrightness={(brightness) => updateCfg({ brightness })}
          onBody={(body) => updateCfg({ body })}
          onMachineParam={(name, value) => updateCfg({ params: { ...cfg.params, [name]: value } })}
        />
        <FilterModule
          filter={cfg.filter}
          filterEnv={cfg.filterEnv}
          modulatedCutoff={isModulated('filter')}
          onFilter={(filter) => updateCfg({ filter })}
          onFilterEnv={(filterEnv) => updateCfg({ filterEnv })}
        />
        <AmpModule
          adsr={cfg.ampAdsr}
          modulatedAmp={isModulated('amp')}
          onAdsr={(ampAdsr) => updateCfg({ ampAdsr })}
        />
        <ModModule
          lfo1={cfg.lfo1}
          lfo2={cfg.lfo2}
          onLfo1={(lfo1) => updateCfg({ lfo1 })}
          onLfo2={(lfo2) => updateCfg({ lfo2 })}
        />
        <FxModule bus={bus} />
        <MasterModule
          masterVolume={masterVolume}
          level={level}
          audioState={audioState}
          onMasterVolume={setMasterVolume}
          onResume={() => resume()}
        />
      </Console>

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
              >{n}</button>
            );
          })}
          <button type="button" className="karar-bar__step" onClick={() => setKararSemitoneOffset((v) => v - 12)} aria-label="Karar one octave down">−8</button>
          <button type="button" className="karar-bar__step" onClick={() => setKararSemitoneOffset((v) => v + 12)} aria-label="Karar one octave up">+8</button>
          <button type="button" className="karar-bar__reset" onClick={() => setKararSemitoneOffset(0)}>reset</button>
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
          octaveOffset={cfg.octave}
          machineParams={cfg.params}
          kararSemitoneOffset={kararSemitoneOffset}
          onMaqamSelect={(idx) => { const next = maqamat[idx]; if (next) setMaqam(next); }}
          droneOctave={0}
        />
      </main>
      <KeyboardOverlay />
    </div>
  );
}
