// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// IndexedDB persistence helpers via Dexie.
//
// PARAMETERIZATION:
//   The BeatForge original (`app/src/lib/db.ts`) declared a concrete
//   `BFDatabase` subclass with three tables (`userPatterns`,
//   `soundPatterns`, `soundKits`) and exported pattern-specific CRUD
//   functions that referenced BeatForge's `Pattern`, `SoundPattern`,
//   and `SoundKit` types from `../patterns/`. Those tables and types
//   are NOT generic infrastructure — they live in the consuming app.
//
//   What musical-core provides instead is the *recipe*:
//     1. The `makeDatabase(name, schema)` helper that returns a
//        Dexie instance with versioned migrations applied.
//     2. The `safeLoadAll<T>` helper that does the
//        validate-or-quarantine-corrupt-rows pattern BeatForge uses
//        in `loadAllSafe`.
//     3. A `LoadedRow<T>` type pattern.
//
//   Consuming apps subclass / wrap this for their own table set.
//
// TODO: parameterize for consuming app — the consuming app must:
//   - Define its own table types (Pattern, SoundPattern, ...) and
//     call `makeDatabase('your-app-db', { v1: { tableA: 'id, …' } })`.
//   - Pass its own Zod (or hand-written) validators to `safeLoadAll`.

import Dexie from 'dexie';

/** A versioned schema definition for `makeDatabase`. Keys are version
 *  numbers (in increasing order); values are the same string-key
 *  table-spec object Dexie's `db.version(n).stores({...})` accepts.
 *
 *  Example:
 *    {
 *      1: { userPatterns: 'id, region, createdAt, updatedAt' },
 *      2: {
 *        userPatterns: 'id, region, createdAt, updatedAt',
 *        soundPatterns: 'id, updatedAt',
 *      },
 *    }
 *
 *  Dexie applies versions in order; existing tables without a stores
 *  spec at version v are dropped, so each version block must list
 *  EVERY table that should exist after that migration. (See Dexie
 *  docs for the additive-only migration pattern.) */
export type DexieVersionedStores = Record<number, Record<string, string>>;

/** Build and return a Dexie instance with the given name and
 *  versioned schema. Equivalent to BeatForge's `BFDatabase` class but
 *  parameterized — the consuming app names its own DB and tables.
 *
 *  Returns the `Dexie` instance directly. Cast to your typed-table
 *  subclass if you want strong typing on `db.userPatterns` etc.: see
 *  the Dexie docs on `Dexie.Table<T, K>` typing. */
export function makeDatabase(name: string, versions: DexieVersionedStores): Dexie {
  const db = new Dexie(name);
  const versionNumbers = Object.keys(versions)
    .map((k) => parseInt(k, 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b);
  for (const v of versionNumbers) {
    db.version(v).stores(versions[v]);
  }
  return db;
}

/** A row read from IndexedDB after validation. `value` is the
 *  validated record OR null if the raw IDB data didn't pass the
 *  validator (corrupt / outdated schema). `raw` is preserved so the
 *  consuming UI can offer the user a "delete this corrupted record"
 *  action. */
export interface LoadedRow<T> {
  /** The id Dexie keyed this row by. Falls back to a generated id
   *  when raw is non-object (so the UI still has something to render
   *  next to the corrupted blob). */
  id: string;
  value: T | null;
  raw: unknown;
}

/** Generic safe-load for a table. Each raw row is run through the
 *  caller's validator; passes → `value: T`, fails → `value: null` and
 *  `raw` retained. The result is sorted by `sortKey` (descending) if
 *  supplied — otherwise the original Dexie order is preserved.
 *
 *  Mirrors BeatForge's `loadAllSafe` for `userPatterns`. */
export async function safeLoadAll<T>(
  table: { toArray(): Promise<unknown[]> },
  validate: (raw: unknown) => raw is T,
  sortKey?: (value: T | null) => number,
): Promise<LoadedRow<T>[]> {
  const raws = await table.toArray();
  const rows = raws.map<LoadedRow<T>>((raw) => {
    if (validate(raw)) {
      return { id: idOf(raw), value: raw, raw };
    }
    const fallbackId = idOf(raw) ?? `unknown-${Math.random().toString(36).slice(2, 8)}`;
    return { id: fallbackId, value: null, raw };
  });
  if (sortKey) {
    rows.sort((a, b) => (sortKey(b.value) ?? 0) - (sortKey(a.value) ?? 0));
  }
  return rows;
}

/** Best-effort id extraction from an unknown blob — used by
 *  safeLoadAll for the corrupted-row fallback so the user can still
 *  delete a record whose payload no longer parses. */
function idOf(raw: unknown): string {
  if (raw && typeof raw === 'object' && 'id' in raw) {
    return String((raw as { id: unknown }).id);
  }
  return '';
}
