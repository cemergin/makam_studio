// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Persistence for MIDI input mapping tables. Plain localStorage —
// the data is small + non-sensitive. No IDB ceremony needed.
//
// TODO: parameterize for consuming app —
//   The original BeatForge module hard-coded `bf_midi_mappings_v1`
//   as the storage key. To avoid collisions when both BeatForge and a
//   sibling app run on the same origin (or share localStorage during
//   dev), the consuming app passes its own key prefix via the
//   `STORAGE_KEY` argument. Default is the BeatForge value so existing
//   BeatForge installs see no behavior change after vendor-copy.

import type { MidiInputMap } from './types';

const DEFAULT_KEY = 'bf_midi_mappings_v1';

/** Read the saved mapping list. Returns [] for first-run, parse
 *  failures, and storage-unavailable cases — the MIDI tab treats
 *  "no mappings" as the legitimate empty state. */
export function loadMidiMappings(storageKey = DEFAULT_KEY): MidiInputMap[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMidiInputMap);
  } catch {
    return [];
  }
}

export function saveMidiMappings(maps: MidiInputMap[], storageKey = DEFAULT_KEY): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(maps));
  } catch { /* storage full / disabled — silently drop */ }
}

/** Structural check — `maps` came from JSON.parse so we can't trust
 *  TS types. Reject anything that doesn't look like one of the two
 *  union variants. */
function isMidiInputMap(v: unknown): v is MidiInputMap {
  if (!v || typeof v !== 'object') return false;
  const o = v as Record<string, unknown>;
  if (o.kind === 'note') {
    return typeof o.toAddress === 'string';
  }
  if (o.kind === 'cc') {
    return typeof o.toAddress === 'string' && typeof o.cc === 'number';
  }
  return false;
}
