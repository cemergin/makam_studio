// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// localStorage helpers — fail-soft wrappers that warn once per session
// when storage is unreachable (Safari private mode, quota exhausted,
// etc.) and degrade silently otherwise.
//
// PARAMETERIZATION:
//   The BeatForge original mixed three concerns:
//     1. Generic localStorage read/write with one-shot warning.
//     2. Highlights / recents lists (typed as string[] of pattern ids).
//     3. Per-pattern kit overrides (Record<patternId, KitId>) and
//        master volume (number).
//
//   (1) is genuinely shared — ported here.
//   (2) is partially shared — the ID-list pattern is generic, but the
//       semantics (highlights of patterns, recents of patterns) are
//       BeatForge-specific. Ported as `makeIdListStore(key)` factory.
//   (3) is BeatForge-specific (KitId enum) — NOT ported. The consuming
//       app builds its own kit-override / settings store on top of
//       these generic helpers.
//
// TODO: parameterize for consuming app —
//   The consuming app passes its own storage keys and validates its
//   own value types.

import { logWarn } from './log';

let storageWarned = false;
function warnStorage(op: string, err: unknown): void {
  if (storageWarned) return;
  storageWarned = true;
  const reason = err instanceof Error ? err.message : String(err);
  logWarn(`Browser storage unavailable (${op}): ${reason}. Highlights + preferences won't persist this session.`);
}

/** Read a localStorage key as a string array. Returns [] for first-run,
 *  parse failures, and storage-unavailable cases. */
export function readStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch (err) {
    warnStorage(`read ${key}`, err);
    return [];
  }
}

export function writeStringArray(key: string, ids: string[]): void {
  try { localStorage.setItem(key, JSON.stringify(ids)); }
  catch (err) { warnStorage(`write ${key}`, err); }
}

/** Read a localStorage key as a JSON object whose values pass `guard`.
 *  Anything that doesn't validate is dropped. Returns {} for first
 *  run / parse failures. */
export function readKeyedRecord<V>(
  key: string,
  guardKey: (k: string) => boolean,
  guardValue: (v: unknown) => v is V,
): Record<string, V> {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const out: Record<string, V> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (guardKey(k) && guardValue(v)) out[k] = v;
    }
    return out;
  } catch (err) {
    warnStorage(`read ${key}`, err);
    return {};
  }
}

export function writeKeyedRecord<V>(key: string, map: Record<string, V>): void {
  try { localStorage.setItem(key, JSON.stringify(map)); }
  catch (err) { warnStorage(`write ${key}`, err); }
}

/** Read a numeric value with bounds + default. */
export function readNumber(key: string, fallback: number, min = -Infinity, max = Infinity): number {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
  } catch {
    return fallback;
  }
}

export function writeNumber(key: string, value: number, min = -Infinity, max = Infinity): void {
  try { localStorage.setItem(key, String(Math.max(min, Math.min(max, value)))); }
  catch { /* localStorage unavailable */ }
}

/** Build a "set of ids" store backed by localStorage at `key`. Returns
 *  read / toggle / has helpers. Useful for "user's highlighted items",
 *  "user's recents", etc. — the BeatForge `getHighlights` /
 *  `toggleHighlight` / `pushRecent` primitives generalised. */
export function makeIdListStore(key: string, max = Infinity) {
  const get = () => readStringArray(key);
  const has = (id: string) => readStringArray(key).includes(id);
  const toggle = (id: string): string[] => {
    const cur = readStringArray(key);
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    writeStringArray(key, next);
    return next;
  };
  /** Push to the front (most-recent-first) and dedupe; trim to `max`. */
  const push = (id: string): string[] => {
    const cur = readStringArray(key).filter((x) => x !== id);
    const next = [id, ...cur].slice(0, max);
    writeStringArray(key, next);
    return next;
  };
  const remove = (id: string): string[] => {
    const next = readStringArray(key).filter((x) => x !== id);
    writeStringArray(key, next);
    return next;
  };
  return { get, has, toggle, push, remove };
}
