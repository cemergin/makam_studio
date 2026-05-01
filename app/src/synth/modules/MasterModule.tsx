// app/src/synth/modules/MasterModule.tsx

import { ConsoleModule } from '../ConsoleModule';
import { Meter } from '../Meter';
import type { AnalyserLevel } from '../hooks/useAnalyserLevel';

interface Props {
  level: AnalyserLevel;
  audioState: AudioContextState;
  masterVolume: number;
  onMasterVolume: (v: number) => void;
  onResume: () => void;
}

export function MasterModule({ level, audioState, masterVolume, onMasterVolume, onResume }: Props) {
  return (
    <ConsoleModule title="MASTER" flowsForward={false}>
      <div className="master-module">
        <div className="master-module__meter">
          <span className="console-module__sub-label">OUT</span>
          <Meter level={level} variant="large" />
        </div>
        <label className="master-module__vol">
          <span>volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={masterVolume}
            onChange={(e) => onMasterVolume(Number(e.target.value))}
          />
          <span className="master-module__vol-readout">{Math.round(masterVolume * 100)}</span>
        </label>
        {audioState !== 'running' && (
          <button type="button" className="audio-resume audio-resume--inline" onClick={onResume}>
            resume audio ({audioState})
          </button>
        )}
      </div>
    </ConsoleModule>
  );
}
