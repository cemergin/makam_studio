// app/src/synth/modules/MasterModule.tsx

import { ConsoleModule } from '../ConsoleModule';
import { Meter } from '../Meter';
import type { AnalyserLevel } from '../hooks/useAnalyserLevel';

interface Props {
  level: AnalyserLevel;
  audioState: AudioContextState;
  onResume: () => void;
}

export function MasterModule({ level, audioState, onResume }: Props) {
  return (
    <ConsoleModule title="MASTER" flowsForward={false}>
      <Meter level={level} variant="large" />
      {audioState !== 'running' && (
        <button type="button" className="audio-resume audio-resume--inline" onClick={onResume}>
          resume audio ({audioState})
        </button>
      )}
    </ConsoleModule>
  );
}
