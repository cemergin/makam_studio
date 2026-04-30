// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Persistence for the MIDI tab's per-channel output routing. Same
// localStorage approach as midi-mappings.ts.
//
// TODO: parameterize for consuming app —
//   Hard-coded `bf_midi_channel_out_v1` storage key in the BeatForge
//   original. Pass an explicit `storageKey` to namespace per app.

import { DEFAULT_CHANNEL_OUT, type ChannelOutConfig } from './sink';
import { clampMidiByte, clampMidiChannel } from './types';

const DEFAULT_KEY = 'bf_midi_channel_out_v1';

/** Load N rows of channel-output config. Always returns exactly
 *  `count` entries — missing rows fall back to DEFAULT_CHANNEL_OUT
 *  so the UI can render a stable N-row table from day one. */
export function loadChannelOuts(count: number, storageKey = DEFAULT_KEY): ChannelOutConfig[] {
  const out: ChannelOutConfig[] = [];
  let saved: unknown[] = [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) saved = parsed;
    }
  } catch { /* fall through to defaults */ }

  for (let i = 0; i < count; i++) {
    const candidate = saved[i];
    if (isChannelOutConfig(candidate)) {
      // Clamp persisted numerics so corrupt or out-of-range values
      // (manual edit, schema migration, future-version data) can't
      // flow through bit-shifting and misroute MIDI traffic.
      out.push({
        ...candidate,
        midiChannel: clampMidiChannel(candidate.midiChannel),
        note: clampMidiByte(candidate.note),
        velocityScale: Number.isFinite(candidate.velocityScale)
          ? Math.max(0, Math.min(1, candidate.velocityScale))
          : 1,
      });
    } else {
      out.push({ ...DEFAULT_CHANNEL_OUT });
    }
  }
  return out;
}

export function saveChannelOuts(rows: readonly ChannelOutConfig[], storageKey = DEFAULT_KEY): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(rows));
  } catch { /* storage full / disabled — silently drop */ }
}

function isChannelOutConfig(v: unknown): v is ChannelOutConfig {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  // Persisted form may have outputId === '' from before the null
  // refactor; normalise on read so callers can treat unset as null
  // uniformly.
  if (o.outputId === '') o.outputId = null;
  const outputIdOk = o.outputId === null || typeof o.outputId === 'string';
  return typeof o.enabled === 'boolean'
    && outputIdOk
    && typeof o.midiChannel === 'number'
    && typeof o.note === 'number'
    && typeof o.velocityScale === 'number';
}
