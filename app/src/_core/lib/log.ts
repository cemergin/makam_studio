// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// Tiny logger backing the visible error toasts (lib/errors.tsx).
// Lives in its own file so React Fast Refresh stays happy — the
// `errors.tsx` module exports React components, and Fast Refresh
// only reloads cleanly when component files don't also export plain
// functions.
//
// TODO: parameterize for consuming app —
//   The original BeatForge log prefixed console messages with
//   `[BeatForge]`. The consuming app should call `setLogPrefix` once
//   at startup to override (e.g. `[makam_studio]`). Default is empty
//   so brand-neutral.

export interface LogEntry {
  id: number;
  severity: 'warn' | 'error';
  message: string;
  at: number;
}

let nextId = 1;
const listeners = new Set<(entries: LogEntry[]) => void>();
const entries: LogEntry[] = [];
let prefix = '';

/** Set the console-prefix the logger writes ahead of every message.
 *  Pass e.g. 'BeatForge' or 'makam_studio'. The brackets are added
 *  automatically; pass an empty string to disable. */
export function setLogPrefix(next: string): void {
  prefix = next;
}

function push(severity: 'warn' | 'error', message: string): void {
  const entry: LogEntry = { id: nextId++, severity, message, at: Date.now() };
  entries.push(entry);
  if (entries.length > 20) entries.shift();
  const snap = [...entries];
  listeners.forEach((fn) => fn(snap));
  const tag = prefix ? `[${prefix}] ` : '';
  if (severity === 'error') console.error(`${tag}${message}`);
  else console.warn(`${tag}${message}`);
}

export function logError(message: string, err?: unknown): void {
  const detail = err instanceof Error ? err.message : err ? String(err) : '';
  push('error', detail ? `${message} · ${detail}` : message);
}

export function logWarn(message: string): void {
  push('warn', message);
}

export function subscribeLog(fn: (entries: LogEntry[]) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
