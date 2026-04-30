// Forked from beatforge@86c1b88c92fdd86ac40ee1e1ee88fa3f08765ca2
// See ~/lab/musical-core/CONTRIBUTING.md for sync policy.
//
// URL → app-state parser. Pure function — no window/DOM access so
// it's testable against any search string.
//
// TODO: parameterize for consuming app —
//   The original BeatForge file declared a fixed `Tab` union of
//   'practice' | 'library' | 'studio' | '_midi' and validated
//   `?pattern=<id>` against a seed corpus. Both are app-specific. This
//   port exposes a generic `readUrlState<TTab>(search, opts)` that
//   takes the legal-tab predicate and the seed-existence check as
//   parameters. The consuming app declares its own Tab union and
//   passes appropriate validators.

export interface UrlState<TTab extends string> {
  tab: TTab | null;
  pattern: string | null;
  /** ?detail=<id> — opens an item-detail modal direct from the URL.
   *  The consuming app validates the id against its corpus, so unknown
   *  ids fall through silently. */
  detail: string | null;
}

export interface ReadUrlStateOpts<TTab extends string> {
  /** Predicate identifying legal `?tab=<value>` strings. Return true
   *  if `value` is one of the consuming app's known tabs. */
  isTab: (value: string) => value is TTab;
  /** Optional alias map: rewrites legacy tab names to current ones.
   *  e.g. BeatForge renamed 'sound' → 'studio' and kept the old links
   *  working by mapping `'sound' → 'studio'`. */
  tabAliases?: Readonly<Record<string, TTab>>;
  /** Returns true if the given id is a known seed pattern (so we keep
   *  the short ?pattern= URL form). User-/shared-pattern ids fall
   *  through to the ?p= hash form. */
  seedExists: (id: string) => boolean;
}

/** Parse a URL search string (e.g. `?tab=practice&pattern=karsilama`)
 *  into a tab + pattern pair. Unknown values fall through to null —
 *  callers default to localStorage / built-in defaults. */
export function readUrlState<TTab extends string>(
  search: string,
  opts: ReadUrlStateOpts<TTab>,
): UrlState<TTab> {
  const params = new URLSearchParams(search);
  const rawTab = params.get('tab');
  let tab: TTab | null = null;
  if (rawTab !== null) {
    if (opts.isTab(rawTab)) {
      tab = rawTab;
    } else if (opts.tabAliases && rawTab in opts.tabAliases) {
      tab = opts.tabAliases[rawTab] ?? null;
    }
  }
  const rawPattern = params.get('pattern');
  const pattern = rawPattern && opts.seedExists(rawPattern) ? rawPattern : null;
  const detail = params.get('detail') || null;
  return { tab, pattern, detail };
}
