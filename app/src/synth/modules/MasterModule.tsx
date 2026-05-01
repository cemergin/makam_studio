// app/src/synth/modules/MasterModule.tsx

import { ConsoleModule } from '../ConsoleModule';
import { Knob } from '../Knob';
import { Meter } from '../Meter';
import type { AnalyserLevel } from '../hooks/useAnalyserLevel';

interface Props {
  masterVolume: number;
  level: AnalyserLevel;
  audioState: AudioContextState;
  onMasterVolume: (v: number) => void;
  onResume: () => void;
}

export function MasterModule({ masterVolume, level, audioState, onMasterVolume, onResume }: Props) {
  return (
    <ConsoleModule title="MASTER" flowsForward={false}>
      <Knob label="vol" value={masterVolume} min={0} max={1} defaultValue={0.6}
            onChange={onMasterVolume} />
      <Meter level={level} variant="large" />
      {audioState !== 'running' && (
        <button type="button" className="audio-resume" onClick={onResume}>
          Resume audio ({audioState})
        </button>
      )}
    </ConsoleModule>
  );
}
