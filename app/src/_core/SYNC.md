# musical-core sync log

Vendor-copied snapshot of `~/lab/musical-core/src/` into this app. Edit-only-via-sync — see `Policy` below.

## Current sync

- **Source:** `cemergin/musical-core@ecb4e1cd71efb7741a3a4d0653e8a7f6c5f0bc5b`
- **Synced:** 2026-04-30
- **Synced by:** Phase 2 scaffold agent

## Re-sync command

From the project root:

```bash
rsync -av --delete ~/lab/musical-core/src/ ~/lab/makam_studio/app/src/_core/
```

After re-sync, update the commit SHA and date in this file.

## Policy

- **DO NOT edit files inside `_core/` directly.** Make changes upstream in `~/lab/musical-core/src/` and re-sync.
- If you need a temporary local patch (e.g., emergency fix before upstreaming), mark it with a `// TODO: upstream to musical-core` comment and open a corresponding upstream issue.
- The `_core/` underscore prefix is the visual cue that these are vendored modules.
- Cross-app convention (BeatForge ↔ makam_studio): the canonical change lands in whichever consumer originated it, then propagates to musical-core, then to other consumers. See `~/lab/musical-core/CONTRIBUTING.md` for the sync discipline.

## Consuming-app responsibilities (from musical-core's PORT_LOG)

These three are the items the `_core/` modules expect the consuming app to handle. Verbatim from `~/lab/musical-core/PORT_LOG.md`'s "Known issues / decisions consuming apps will need to make":

### 1. CSS variables

`pwa.tsx` and `errors.tsx` reference `var(--bg-2)`, `var(--fg)`, `var(--line)`, `var(--accent)`, `var(--muted)`, `var(--sans)`, `var(--bg-sunk)`. Consuming apps define these in their stylesheet, or fork those two files and inline the colors.

→ **Status in makam_studio:** `app/src/styles.css` defines all seven on `:root` with the warm-light palette per `MANIFESTO.md` and `docs/design-direction.md` Pivot 5. Full v1 palette per `docs/spec/v1.md` §18 lands later.

### 2. Safari Web MIDI fallback

iOS Safari does not ship Web MIDI. The MIDI module's `enable()` throws a clear error in unsupported environments; consuming apps should hide the MIDI surface entirely on iOS Safari rather than render a permanently-broken "Enable MIDI" button.

→ **Status in makam_studio:** TODO when the MIDI panel lands.

### 3. Generic `db.ts` factory tables

`src/lib/db.ts` is a generic `makeDatabase(name, versions)` factory. Consuming apps declare their own table types and call the factory with their schema. `safeLoadAll<T>(table, validate, sortKey)` is also generic.

→ **Status in makam_studio:** TODO. Per `docs/spec/v1.md` §15, v1 tables include `userMaqamPresets`, `userTunings`, `userVoiceConfigs`, etc. — all to be wired through `makeDatabase` in a later commit.

## Other parameterization the consuming app may need to set

From `PORT_LOG.md` §"Parameterization seams":

- `setLogPrefix('makam_studio')` once at startup (otherwise the log is unprefixed).
- `useMidiBridge`'s `storageKeyPrefix` should be `'ms_midi_'` (default is `'bf_midi_'` from BeatForge — would collide if both apps share an origin).
- `readUrlState<TTab>(...)`'s generic `Tab` type — pass makam_studio's tab union (`'play' | 'presets' | 'settings' | '_qanun'` or whichever route set lands).
- A `SessionAdapter` for `useMidiBridge` — for non-sequenced apps, `defaultSessionAdapter()` is the no-op fallback.
