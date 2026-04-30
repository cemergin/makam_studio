// Singleton AudioContext + resume helper.
//
// Browsers require a user gesture before audio can start. We expose a
// global ctx that is created lazily on first call to
// `getAudioContext()`, and a `resumeAudioContext()` helper that the UI
// surfaces wire to a click handler ("Resume audio"). React components
// use the `useAudioContext()` hook to read both values.

import { useEffect, useState } from 'react';

let ctx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!ctx) {
    const Ctor =
      window.AudioContext ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) {
      throw new Error('Web Audio API is not available in this browser.');
    }
    ctx = new Ctor();
  }
  return ctx;
}

export async function resumeAudioContext(): Promise<AudioContextState> {
  const c = getAudioContext();
  if (c.state === 'suspended') {
    await c.resume();
  }
  return c.state;
}

export interface UseAudioContextResult {
  ctx: AudioContext;
  state: AudioContextState;
  resume: () => Promise<void>;
}

/** Hook: return the singleton AudioContext + its current state +
 *  a resume callback that triggers a re-render when state flips
 *  from 'suspended' to 'running'. */
export function useAudioContext(): UseAudioContextResult {
  const c = getAudioContext();
  const [state, setState] = useState<AudioContextState>(c.state);

  useEffect(() => {
    const handler = () => setState(c.state);
    c.addEventListener('statechange', handler);
    return () => c.removeEventListener('statechange', handler);
  }, [c]);

  const resume = async () => {
    await resumeAudioContext();
    setState(c.state);
  };

  return { ctx: c, state, resume };
}
