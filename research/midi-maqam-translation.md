---
title: MIDI maqam-translation architecture
audience: makam_studio engine + Phase 2 implementer; future-self auditing the Pivot 8 killer-feature claim; reviewers comparing protocol choices.
tldr: |
  Specifies the protocol, algorithm, latency budget, and UX layer that turn vanilla 12-EDO MIDI from any USB keyboard into correctly-tuned MIDI for any external synth. v1 ships single-channel pitch-bend + MTS-ESP-compatible .scl/.kbm export as the two primary output paths, with hybrid white-key-canonical key mapping as the default. MPE and live MTS SysEx are v2. The trickiest detail (pitch-bend BEFORE note-on, sub-millisecond) is solvable with MIDIOutput.send(data, timestamp) using DOMHighResTimeStamp scheduling. Latency budget commits to <0.5 ms processing on top of the 5–15 ms OS+browser baseline. Standalone proxy mode is flagged as v1.5 — it's the highest-leverage delivery for the "maqam-tuning processor" framing, but the embedded mode in v1 already exposes the entire output chain.
skip_if: You only care about how the synth voice sounds (see web-audio-plucked-string-synthesis.md), or about which maqamat to ship (see ottoman-turkish-makam.md / arabic-levantine-maqam.md), or about UI for the playing surface (see split-keyboard-chord-and-melody-ux.md and ux-interface-review.md). This is exclusively about MIDI in/out.
date: 2026-04-30
status: draft
---

# TL;DR

- **v1 ships two output protocols.** Single-channel MIDI 1.0 + 14-bit pitch-bend (`±2 sm`, ~0.024 cents resolution) for live; MTS-ESP-compatible `.scl + .kbm` file export for static DAW interop. MPE and runtime MTS SysEx are v1.5/v2.
- **Default key-mapping is hybrid:** white keys = the maqam's 7-pitch ascending scale; black keys = override-palette shortcuts (Aleppine/Iraqi/Cairene Sikah, koron variants). Linear and karar-anchored modes switchable in Settings.
- **The trickiest detail — pitch-bend MUST arrive before note-on or attack glitches — is solved by `MIDIOutput.send(data, timestamp)` with a 1 ms gap.** Bend at `t-1 ms`, note-on at `t`. Bullet-proof across drivers; +1 ms latency well below human perception.
- **Latency budget: < 0.5 ms translator processing per event (target < 0.2 ms)** on top of the 5-15 ms OS+browser baseline. Hot path is three O(1) lookups + cents→bend arithmetic + 6 bytes out.
- **Standalone proxy mode is v1.5.** v1's embedded `?tab=_midi` panel already exposes the full chain. v1.5 ships a no-distractions `?mode=proxy` shell + MTS Bulk SysEx for hardware synths.
- **MIDI 2.0 readiness is architectural.** A single `TranslatorOutputAdapter` interface makes a future MIDI 2.0 adapter one new file. No v1 commitment; Web MIDI 2.0 is W3C-stage as of early 2026.
- **Safari is blocked.** No Web MIDI in WebKit since 2020 and no change anticipated. Graceful-fallback notice covers iOS users; the in-app playing surface still works.

---

# 1. The four MIDI tuning protocols

## 1.1 MIDI 1.0 channel-wide pitch-bend

The cheapest, oldest, most universally supported microtonal MIDI technique. Every MIDI synth made since 1983 speaks it.

Wire format: status byte `0xEn` (n = MIDI channel 0..15) followed by two data bytes carrying a 14-bit unsigned value (LSB first, MSB). Center is 8192. The 14-bit range maps to a configurable cents range — the "pitch-bend sensitivity" — that defaults to ±2 semitones.

**Resolution math.** ±200 cents over 16384 steps = ~0.0244 cents per step. Well under perceptible and well under the source-measurement variance documented in `tuning-systems-formalization.md` §3.2. ±48 semitones (the MPE member default) gives ~0.586 cents — still acceptable. ±96 sm (spec maximum) gives ~1.17 cents — the lower bound of "fine." makam_studio commits to ±2 semitones as the v1 default; a setting expands when needed.

**Configuring the receiver.** Pitch-bend sensitivity is changed via Registered Parameter Number (RPN) 0: a 6-message CC preamble (CC 101=0, CC 100=0, CC 6=N, CC 38=0, then null RPN CC 101=127, CC 100=127). The translator sends this preamble at session-start (on enable-MIDI-output) and again on sensitivity change. Idempotent; cheap (18 bytes); sending on every output-device-connect is the right policy.

**The implication that drives v1: monophonic-only without channel-rotation.** A pitch-bend on channel 1 affects every note sounding on channel 1. Polyphonic maqam playback therefore requires either (a) one channel per sounding note (= MPE), or (b) a hand-rolled round-robin allocator. Pivot 6 commits v1 to monophonic; this is a v1 non-issue.

**Hardware/software support.** Universal. The receiving synth's pitch-bend sensitivity must be configured to match (see §6).

## 1.2 MPE (MIDI Polyphonic Expression)

Formalized 2018 by the MMA as RP-053. Each sounding note gets its own MIDI channel; per-note pitch-bend, channel pressure, and CC 74 (timbre) all work without crosstalk.

**Zone architecture.** A "Zone" = master channel + contiguous range of member channels.
- **Lower Zone:** master = ch 1, members = ch 2..15 (or 2..N if split).
- **Upper Zone:** master = ch 16, members = ch 15..N descending.

Most rigs use Lower Zone full-width (master ch 1, members ch 2-15, 14 voices). The MPE Configuration Message (MCM, via RPN 6) sets member count.

**Default pitch-bend sensitivities.** Master = ±2 sm (matches MIDI 1.0; used for the global pitch wheel that affects all sounding notes). Member = ±48 sm (per-note bend reaches 4 octaves; resolution ~0.586 cents). Both settable via RPN 0 per channel.

**Channel allocation strategies.** When a new note-on arrives:
- **Round-robin:** advance ch 2→3→...→15→2 regardless of state. Simple; can collide with held notes.
- **LRU-among-free:** prefer silent channels; tie-break by oldest. Fall back to "steal oldest" when all are sounding.
- **Per-note pitch-similarity:** pick the channel whose last bend is closest to the new bend. Niche; reduces audible glide on synths that interpolate bend across note transitions.

makam_studio v2 commits to **LRU-with-steal-oldest** — what Bitwig, Logic, and Surge XT use, and robust under polyphonic load.

**The MPE timing constraint: pitch-bend BEFORE note-on on the member channel.** A note-on with non-zero bend MUST be preceded by the bend message; otherwise the synth strikes at zero-bend and audibly snaps. The MPE spec is explicit ("Whatever the current pitch bend value is at a particular note's channel at the time of the note-on will sound throughout the lifetime of the note"). §3.4 below covers the Web MIDI scheduling that solves this race.

**Support.** First-class on Roli Seaboard, LinnStrument, Continuum, Osmose; on Surge XT, u-he Diva, Pianoteq, Equator, Logic 10.5+, Ableton Live 11+, Bitwig 3+, Cubase 10.5+, Reaper. Many older VSTs and most stock-instrument hardware do NOT speak MPE — hence single-channel is the v1 default.

## 1.3 MIDI 2.0 per-note pitch

MIDI 2.0 (2020 spec, 2023 v1.1) introduces Universal MIDI Packets (UMP). A "Note On with Pitch" carries a 32-bit per-note pitch attribute = ~0.0001 cents native resolution; no pitch-bend math.

State as of April 2026: native on Windows 11 24H2/25H2 (Windows MIDI Services, January-February 2026 rollout). Capability on macOS CoreMIDI since Big Sur but no app surface. Linux work in progress. **Web: no Web MIDI 2.0 spec adopted yet.** W3C Web Audio Working Group is discussing extending the existing API. Expected: not v1, possibly v2 (mid-2027), more likely v3.

**v1 stance.** Architect for it; don't ship it. Isolate the protocol-emit layer behind a `TranslatorOutputAdapter` interface so a MIDI 2.0 adapter is one new file when browser support stabilizes.

## 1.4 MTS / MTS-ESP

The MIDI Tuning Standard sends tuning data in-band over MIDI as SysEx.

**Bulk Tuning Dump** (Universal Non-Realtime SysEx, sub-IDs `08 01`): one 406-byte message containing 128 frequencies, each as 3 bytes — byte 1 = highest 12-EDO MIDI note ≤ target, bytes 2-3 = 14-bit cents fraction (resolution 100/2^14 ≈ 0.0061 cents). Sent once; receiver maintains the table. Frame: `F0 7E <dev-id> 08 01 <prog#> <16 ASCII name> <128×3-byte freq> <checksum> F7`.

**Single Note Tuning Change** (sub-ID `08 02` static, `08 07` realtime — the realtime variant retunes already-sounding notes). Retunes one or few notes without resending the table.

**Scale/Octave Tuning** (sub-IDs `08 08` 1-byte / `08 09` 2-byte): 12 cents-offsets, one per pitch class, applied to all octaves. Compact (~32 bytes) but loses octave asymmetry.

**Web MIDI implications.** All MTS messages are SysEx, requiring elevated permission (`navigator.requestMIDIAccess({ sysex: true })`). Chrome/Edge/Firefox prompt; Safari doesn't ship Web MIDI at all. Hot-unplug behavior identical to non-SysEx (`InvalidStateError`).

**MTS-ESP (ODDSound).** A modern in-DAW protocol — shared-memory IPC between a master plugin and many client plugins in the same DAW process. Many synths are clients (Surge XT, u-he Diva, Pianoteq, Madrona Aalto, Bitwig stock). MTS-ESP Mini (free master) reads `.scl`, `.kbm`, `.tun`, and MTS SysEx and broadcasts to all clients. **There is no MTS-ESP for browsers** — it's desktop-plugin-only. The intended browser interop is: makam_studio exports `.scl + .kbm` files; user drops into MTS-ESP Mini in their DAW; MTS-ESP Mini retunes the client plugin pool.

makam_studio could *additionally* emit MTS Bulk Tuning Dump SysEx over Web MIDI for hardware synths that speak MTS but not MTS-ESP (Korg Minilogue, some Yamaha, Roland). This is the **v1.5 enhancement** paired with the standalone-proxy mode (§8). v1 ships file export only.

## 1.5 Comparison table

| Protocol | Cents resolution | Polyphony | VST/Hardware support | Implementation cost | v1 fit |
|---|---|---|---|---|---|
| MIDI 1.0 single-channel pitch-bend | ~0.024 cents (±2 sem); ~0.586 cents (±48 sem) | Mono only without channel-rotate | Universal | ~30 LoC + RPN setup | **v1 default (live).** |
| MPE | ~0.586 cents (member at ±48 sem default) | Up to 14 (Lower Zone) | Modern controllers + ~50% of recent VSTs | ~150 LoC (allocator + master/member dance) | v2. |
| MIDI 2.0 per-note pitch | ~0.0001 cents | Effectively unlimited | Native to MIDI 2.0 hardware/software (rare 2026) | Architectural readiness only | v3+. |
| MTS Bulk Tuning Dump (SysEx live) | 0.0061 cents | Polyphonic by construction | Hardware: Korg, Yamaha, some Roland; soft-synths: Pianoteq, Surge XT | ~80 LoC + SysEx permission + ~406-byte send | v1.5. |
| MTS Single Note Tuning Change | 0.0061 cents | Per-note via 0x08 0x07 realtime | Subset of MTS receivers | ~40 LoC | v2. |
| MTS-ESP runtime | 0.0061 cents | Polyphonic | Most modern DAW soft-synths | Not browser-implementable | Never (file export only). |
| `.scl + .kbm` file export | 0.0001 cents (depends on file precision) | Polyphonic | Universal via MTS-ESP Mini | ~50 LoC | **v1 default (static).** |

The two highlighted v1 rows are the entire v1 commitment for the killer-feature framing.

---

# 2. The vanilla-key-to-maqam-degree mapping problem

A user plugs in any USB MIDI keyboard. They press middle C. What plays?

This is the layer between the incoming MIDI note number (0-127, 12-EDO) and the canonical maqam pitch the synth should emit. Three plausible conventions, each with significant trade-offs.

## 2.1 Linear scale-degree mapping

Every MIDI key plays the next maqam scale-degree, wrapping at the octave. White and black keys interleave the scale; the keyboard becomes a maqam-degree counter.

Concretely for a 7-pitch maqam (Hicaz) with karar at MIDI 60 (C4):
- MIDI 60 → degree 1 (Çârgâh / 0 cents)
- MIDI 61 → degree 2 (Nîm Hicâz / 113.2 cents)
- MIDI 62 → degree 3 (Dik Hicâz / 384.9 cents)
- MIDI 63 → degree 4 (Nevâ / 498.1 cents)
- MIDI 64 → degree 5 (Hüseynî / 702.0 cents)
- MIDI 65 → degree 6 (Acem / 792.5 cents)
- MIDI 66 → degree 7 (Mâhûr / 1086.8 cents)
- MIDI 67 → degree 1 + octave (1200.0 cents)
- ... and so on.

**Pros.** Trivially simple. Every key plays a maqam pitch (no "wasted" keys). User intuition: "pressing a higher key plays a higher maqam degree."

**Cons.** Alien to pianists. The same physical white-key C plays Çârgâh in Hicaz, Rast in Maqam Rast, Yegâh in Hüseyni — depending on the loaded preset. Switching maqamat moves the entire keyboard's "meaning." Loses MIDI compatibility with anything else: a recorded MIDI file replayed through linear-mode-Hicaz vs linear-mode-Saba sounds entirely different.

## 2.2 Hybrid (white-key canonical scale + black-key override palette)

White keys carry the maqam's 7-pitch ascending scale; black keys carry override-palette shortcuts (Aleppine vs. Iraqi vs. Cairene Sikah, koron variants, per-degree comma adjustments). Matches the qanun mandal model — white = default; black = one-tap alternate.

Concretely for Hicaz (karar = C): C/D/E/F/G/A/B → degrees 1-7 at canonical Hicaz pitches; black keys C♯/D♯/F♯/G♯/A♯ → first override for the adjacent white-key degree (or unused). Octave wraps.

**Pros.** Pianists keep muscle memory. Standard white-key scale shapes lay onto the maqam. The mandal-as-override model maps directly to black-key shortcut access. This is what most commercial maqam Kontakt/Ableton libraries use.

**Cons.** Asymmetric maqamat (Hüseyni descending-flat, Saba's resolve) need a rule: "override palette shifts on descent direction." Persian gusheh sets with 8+ candidates per degree overflow 5 black keys; truncate to "top 5 most-cited" and surface remaining candidates only via the right-zone palette UI.

**v1 decision.** Default. The piano metaphor is established by Pivot 1; the override-palette UI exists anyway per Pivot 6; black-key shortcuts are symmetric with that UI.

## 2.3 Karar-anchored absolute mapping

Each MIDI key has a fixed nominal cents-from-karar offset; the maqam preset retunes specific keys to its actual pitches (others stay at 12-EDO or are silent). Karar shifts the whole map. Closest to qanun physics — each "string" is a fixed key, the maqam preset is the mandal-position table.

**Pros.** Most faithful to the qanun. Same MIDI file loaded into different maqamat produces different microtonal results without restructuring the file. Best for users who think in absolute pitches (electronic-music producers, xenharmonic theorists).

**Cons.** Non-monotonic in the general case — adjacent keys can produce non-adjacent pitches when a maqam pulls a degree past its 12-EDO neighbor. Loses the "maqam identity per key" mental model.

**v1 decision.** Optional Settings toggle. Default OFF.

## 2.4 v1 commitment

Default key-mapping: **hybrid (§2.2)**. Two settings exposed:
- "Mapping mode" — three-radio: `Hybrid` (default), `Linear`, `Karar-anchored`.
- "Karar MIDI note" — slider, default 60 (C4). Sets which MIDI note plays the karar.

Persists per-user via localStorage (`ms_midi_keymap_mode`, `ms_midi_karar_note`). Changing maqam preset preserves both settings; changing karar via the karar slider in the playing surface updates the MIDI mapping live.

---

# 3. The pitch-bend math

For each protocol, the conversion from "cents-from-12-EDO" to wire-format bytes.

## 3.1 MIDI 1.0 pitch-bend (the v1 hot path)

Given a target note's required cents-offset from the nearest 12-EDO MIDI note: `c` (signed, typically in [-100, +100] for any single mapping; can be larger after octave normalization).

With pitch-bend sensitivity = ±2 semitones (= ±200 cents):
```
bend14 = round((c / 200.0) * 8191) + 8192
        clamped to [0, 16383]
lsb    = bend14 & 0x7F
msb    = (bend14 >> 7) & 0x7F
```

Wire-emit on MIDI channel `n` (0-15):
```
0xE0 | n,  lsb,  msb
```

Then immediately the note-on:
```
0x90 | n,  midi_note,  velocity
```

**Worked example.** Hicaz, karar C, hybrid mapping; user presses MIDI 64 (E4). Mapping → degree 3 (Dik Hicâz, 384.9 cents above C4). Nearest 12-EDO is E4 at 400 cents. Required offset: `c = -15.1`. With ±200 cents: `bend14 = round((-15.1/200)*8191) + 8192 = 7574`. LSB `0x16`, MSB `0x3B`. Wire bytes (ch 0): `0xE0 0x16 0x3B 0x90 0x40 0x64`. Six bytes per note-on.

**Note-off.** Don't reset bend; the next note-on's bend overwrites anyway. Saves 3 bytes per note.

**Sustain pedal during a maqam change.** Setting "Live retune held notes" controls it (default ON, qanun-mandal-style). ON: emit fresh bend on the active channel for each held-note offset, no new note-on. OFF: held notes keep original bend; new notes use the new maqam.

## 3.2 MPE per-note pitch-bend

Same arithmetic per-note. Difference: per-member-channel state. With MPE member-channel default sensitivity = ±48 semitones:
```
bend14 = round((c / 4800.0) * 8191) + 8192
```

Resolution: 4800/8191 ≈ 0.586 cents per step. Acceptable.

The translator needs to:
1. Acquire a member channel via the LRU allocator (§1.2).
2. Send the pitch-bend on that channel BEFORE the note-on (see §3.4).
3. Track which channel holds which note-id so the matching note-off targets the right channel.
4. On note-off, free the channel (return to LRU pool) only after a small grace period (~50 ms) so any release-tail synth modulation has settled.

The state machine is short — ~200 LoC including the allocator. It's v2 because Pivot 6 (monophonic v1) makes it unnecessary in v1.

## 3.3 MTS-ESP file export

No bend math. Walk the maqam preset's `pitches[]`, emit each as a cents-from-karar value in the `.scl` file (per `tuning-systems-formalization.md` §5 export format), emit a `.kbm` file binding the karar to MIDI 60. The receiving plugin (MTS-ESP Mini, then any client) reads the file and re-pitches notes itself. Lowest-friction for compatible DAWs.

## 3.4 The single trickiest detail: pitch-bend BEFORE note-on

Send note-on first then bend, and the synth strikes at 12-EDO pitch before sliding to target — a 1-5 ms glitch on attack.

**The Web MIDI solution.** `MIDIOutput.send(data, timestamp)` accepts a `DOMHighResTimeStamp` (milliseconds since `performance.timeOrigin`, sub-millisecond precision). Spec guarantees: same-timestamp messages emit in call order; past timestamps emit ASAP; future timestamps queue.

**Two strategies.**
- **A: same timestamp, rely on call order.** Send bend then note-on with identical timestamp. Simplest. Risk: relies on the "must result in send-order" clause holding across drivers (Chrome/Edge/Firefox respect; some Linux ALSA bridges historically have not).
- **B: explicit 1 ms gap.** Bend at `t = T-1ms`, note-on at `t = T`. Gap guarantees ordering even on misbehaving drivers. Trade: +1 ms latency, well below human perception (5-10 ms threshold).

**v1 commitment: Strategy B with 1 ms gap.** Bullet-proof. Used for both single-channel and (v2) MPE.

Pseudocode:
```
const t_in = performance.now();
output.send([0xE0|ch, lsb, msb], t_in);          // bend first
output.send([0x90|ch, n, vel],  t_in + 1.0);     // note-on +1ms
```

Total budget contribution: 1 ms gap + ~0.2-0.5 ms Web MIDI scheduling jitter = ~1.5 ms added vs. immediate-send. Acceptable.

---

# 4. Latency budget

**Baseline (out of our control).** Chromium Web MIDI: typical 5-15 ms input-to-output round-trip across OS USB driver + transport + receiver audio engine. Spec doesn't quantify a bound (see W3C issues #187, #37). 5-10 ms imperceptible; 10-15 ms acceptable; >20 ms means the rig has a problem outside makam_studio.

**Translator commitment: < 0.5 ms processing per event; target < 0.2 ms.**

Hot path on note-on:
1. Receive `midimessage` (browser dispatch, ~immediate).
2. Parse status byte → `kind`, `channel` (~10 ns).
3. Mapping-mode lookup O(1) — small table indexed by `midi_note` (~50 ns).
4. Cents-from-karar lookup O(1) — `pitches[degree-1].cents_from_karar` (~30 ns).
5. Compute nearest 12-EDO + remaining cents (~20 ns).
6. Convert cents → bend14 → LSB+MSB (~30 ns).
7. Two `MIDIOutput.send()` calls with timestamps (~returns in µs).

Total: ~0.2-0.4 ms on a modern CPU including JS engine overhead. The 1 ms gap from §3.4 adds delivery latency but is CPU-idle, not processing. MPE channel-allocation lookup over 14 elements: ~50 ns; negligible. File-export `.scl`: <5 ms synchronously for 7-pitch presets; not a hot path.

**Measurement.** Translator panel ships a Latency Monitor with three modes: (1) **loopback** — send a note-on to output, listen for it back via input (median + p95 over 100 reps); (2) **synth-response** — send note-on, wait for audible signal via `analyser.getFloatTimeDomainData()` peak detection (audio-output latency on top of MIDI); (3) **translator-only** — synthetic input event, time the hot path (median + p95 over 1000 reps; enforces the <0.5 ms commitment). BeatForge's existing raw monitor in `Midi.tsx` provides the listening-side machinery for free.

---

# 5. Channel allocation (MPE specifics)

v1 is monophonic; this section is the v2 advance-spec.

**Allocation strategies for Lower Zone full-width (master ch 1, members ch 2-15):**
- **Round-robin pointer:** cursor `i` in [2..15], advance per note-on. Simplest; doesn't track sounding state, so a held note can be overwritten on wrap.
- **LRU-among-free:** track per-channel `is_sounding` + `last_used_at_ms`. Pick the silent channel held silent longest; fall back to "steal oldest sounding." **The makam_studio v2 commitment.** Same algorithm Bitwig, Logic, and Surge XT use.
- **LRU with grace period:** above + ~50 ms hold after note-off before re-allocating, so release-tail modulation settles.

**Voice stealing** (all 14 channels sounding, 15th note arrives): steal-oldest is canonical and what every analog poly synth from the 1970s does. Steal-quietest and steal-most-similar-pitch are niche optimizations; not in v2.

**Per-note pressure / timbre / slide passthrough.** Channel pressure (0xDn), CC 74 (timbre), and additional pitch-bend gestures pass through verbatim on the member channel. If the controller sends its own bend mid-note (vibrato), combine additively with the maqam offset: `out_bend = maqam_bend_offset + (controller_bend - 8192)`, clamped 14-bit. User gets vibrato around the correct maqam pitch.

---

# 6. Configuration UX

The translator surfaces in a panel forked from BeatForge's `app/src/modes/Midi/Midi.tsx`. Sections:

1. **Input devices.** Per-device toggle + Omni-or-channel filter. Multiple inputs merge. Persists `ms_midi_active_inputs`.
2. **Output device + protocol.** Per-output: protocol radio (`Single-channel pitch-bend` / `MPE Lower Zone` (v2) / `MTS Bulk SysEx` (v1.5)); channel (1-16, single-channel only); pitch-bend range (2/4/12/24/48 sm, default 2); member channel count (8/14/15, MPE only). Warn visibly when polyphonic input is detected on single-channel output ("3 notes overlapped; only the most recent is heard — switch to MPE for chord output").
3. **Configure-your-synth panel.** Expandable list of copy-paste instructions for common receivers (Pianoteq, Surge XT, u-he Diva, Korg Minilogue, Roland Boutique, Behringer JT-4000). Community-curated via `presets/synth-configs.json`.
4. **Test signal.** "Play A=440 in C Hicaz" diagnostic — emits a held A4 tuned to the active maqam's nearest pitch. Default suite: ascend through the 7 maqam pitches, 800 ms each, displaying expected vs. observed cents.
5. **Latency monitor.** Live readout of translator hot-path median + p95, MIDI round-trip, and audio-output latency (when monitor wiring is configured). Updates every ~250 ms.
6. **Live monitor.** Forked from BeatForge: every inbound + outbound MIDI message logged with timestamp, source, decoded mnemonic.

**Three settings the user MUST control:**
1. Input device.
2. Output device + protocol.
3. Karar MIDI note (default 60 / C4).

**Three settings with sensible defaults:**
1. Mapping mode → hybrid.
2. Pitch-bend sensitivity → ±2 sm.
3. Live retune held notes → ON.

---

# 7. Edge cases

- **Microtonal-aware controllers (LinnStrument, Continuum) emitting their own pitch-bend.** Default: combine additively with the maqam offset, clamp to 14-bit. Setting "Pass-through input pitch-bend" (default ON). OFF for users with a pre-tuned controller; ON for vanilla-keyboard-plus-vibrato.
- **Sustain pedal during a maqam change.** Setting "Live retune held notes" (default ON, qanun-mandal-style): walk sustained notes, emit fresh bend on each. OFF leaves held notes; new notes use the new maqam.
- **MIDI clock + transport passthrough.** Forward 0xF8/0xFA/0xFB/0xFC verbatim. An external arpeggiator driving the translator's input becomes a maqam-aware arpeggiator for free.
- **Aftertouch + CC passthrough.** Channel pressure (0xDn), poly aftertouch (0xAn), CC (0xBn) — all bytes-in-bytes-out. The translator only rewrites pitch-bend and note-on/off pitches.
- **Polyphonic input on single-channel mono output.** All note-ons emit; synth typically auto-cuts the older note. UI warns after 2+ overlapping note-ons in <100 ms.
- **Pitch-bend wheel + maqam bend.** Combine additively, clamp.
- **Non-A=440 reference / fractional karar.** `karar_perde.cents_offset_from_a440` (per `tuning-systems-formalization.md` §5.1) carries it. Conversion: `target_freq = 440 × 2^((karar_offset + cents_from_karar + 100×midi_step) / 1200)`, then `cents_offset = 1200 × log2(target_freq / nearest_12edo_freq)`. ~1 µs recomputation on karar change; held notes retune live.

---

# 8. Standalone vs. embedded modes

Two delivery paradigms; one codebase.

**Embedded mode (v1).** Translator panel inside the main app at `?tab=_midi` (BeatForge's secret-tab pattern). Synth voice is one possible output; user can mute it and route everything to MIDI out.

**Standalone proxy mode (v1.5).** Tiny single-page app at `?mode=proxy` — input device picker, maqam preset + karar slider, output device + protocol picker, big "Active" indicator with latency display. Synth voice muted by default. The whole app becomes a maqam-tuning pedal for external rigs. **The highest-leverage delivery for the killer-feature framing**: a producer with a hardware synth, a piano sample library, or an orchestra of VSTs can plug any of them in and play maqam-tuned music through them.

**Phasing.** v1 = embedded only. v1.5 (~2-3 months post-launch) = standalone proxy + MTS Bulk SysEx for hardware. v2 = MPE polyphony in both modes. The split validates the embedded UX with real users before committing to the standalone shell.

---

# 9. Browser security and Web MIDI access

**Permission model.** `requestMIDIAccess()` needs (1) secure context — HTTPS or `localhost`; GitHub Pages serves HTTPS; (2) user permission, sticky per origin; (3) `{ sysex: true }` for elevated SysEx access, with a stronger-worded prompt and enterprise-policy-denyable. v1 (no live SysEx) requests without SysEx; v1.5 (MTS Bulk) requests with, gracefully degrading to file-export-only if denied.

**Support matrix (April 2026).** Chrome / Edge / Firefox / Opera (desktop) — full Web MIDI + SysEx with permission. Mobile Chrome (Android) — full, USB-OTG. **Safari (desktop and iOS) and all iOS browsers — no Web MIDI.** Apple declined in 2020 citing fingerprinting; no change anticipated before 2027+. iOS browsers all use WebKit by App Store policy; no polyfill possible.

**Graceful fallback for Safari / iOS.** Panel surfaces a one-time dismissable notice: "Web MIDI isn't supported in this browser. To translate vanilla MIDI to maqam-tuned MIDI, use Chrome, Edge, or Firefox on a desktop. The in-app playing surface here still works fully." Persists in `ms_midi_safari_acknowledge`.

**Hot-unplug handling.** Inherited verbatim from BeatForge's `sink.ts` `safeSend()` wrapper: every `MIDIOutput.send()` in `try/catch`; `InvalidStateError` logs once and drops the byte; next message retries.

---

# 10. Future-proofing for MIDI 2.0

The translator's protocol-emit layer is one TypeScript file: `TranslatorOutputAdapter`, with `prepareForSynth(spec)`, `sendNoteOn(note_id, midi_note, velocity, cents_offset, timestamp)`, `sendNoteOff(...)`, `sendCC(...)`, `sendPitchBend(...)`, `dispose()`. Concrete adapters:
- v1: `SingleChannelPitchBendAdapter` (live), `MTSScalaFileAdapter` (file export).
- v1.5: `MPELowerZoneAdapter` (live, 14-channel allocation), `MTSBulkSysExAdapter` (hardware-synth driver).
- Future: `Midi2PerNotePitchAdapter` when Web MIDI 2.0 stabilizes.

Adding a protocol is one file + one settings entry + one test fixture. The translator core is protocol-agnostic and works in cents-from-karar throughout (per `tuning-systems-formalization.md` §1); each adapter converts cents to wire format. The future MIDI 2.0 adapter inherits cents resolution automatically — its 0.0001-cents native resolution exceeds our preset storage's one-decimal-place precision, so we'd be emitting at maximum protocol fidelity.

---

## Implications for makam_studio

### v1 architecture (concrete, opinionated)

- **Live protocol:** MIDI 1.0 single-channel + ±2 sm pitch-bend. Universal, ~0.024 cents resolution.
- **File-export protocol:** MTS-ESP-compatible `.scl + .kbm` (per `tuning-systems-formalization.md` §5). DAW interop via MTS-ESP Mini.
- **Key-mapping:** Hybrid (§2.2), default karar MIDI note 60.
- **Voice allocation:** Monophonic per Pivot 6; UI warns on polyphonic input.
- **Pitch-bend timing:** Strategy B (1 ms gap before note-on, §3.4).
- **Latency budget:** < 0.5 ms processing per event; target < 0.2 ms.

### BeatForge fork specifics

Files to fork into `makam_studio/app/src/`:
- `modules/midi/midi.ts` (~140 LoC) — wholesale. Add a third mapping kind: `TuningMap` (note → maqam-degree-aware emit). `bindInput` becomes `bindMaqamTranslator(input, mappings, translatorState)`.
- `modules/midi/sink.ts` (~145 LoC) — substantially rewritten. BeatForge emits flat note-on/note-off pairs at a fixed step duration; the maqam translator emits bend+note-on/note-off pairs with user-controlled durations and the `TranslatorOutputAdapter` indirection.
- `modules/midi/clock.ts` (~100 LoC) — wholesale fork. Transparent passthrough; useful for maqam-aware arpeggios.
- `modules/midi/types.ts` (~125 LoC) — wholesale + added types `TuningMap`, `MaqamTranslatorState`, `TranslatorOutputAdapter`.
- `lib/useMidiBridge.ts` (~330 LoC) — wholesale. Rename `bf_midi_*` → `ms_midi_*`. Add `ms_midi_keymap_mode`, `ms_midi_karar_note`, `ms_midi_protocol`.
- `lib/midiMappings.ts`, `lib/midiChannelOut.ts` — wholesale; tiny.
- `modes/Midi/Midi.tsx` (~600 LoC) — substantially rewritten as the §6 four-section panel.

Estimated effort: ~3 working days including tests. We inherit BeatForge's test-shape and replace assertions with maqam-translation expectations.

### Standalone proxy mode delivery decision

**Defer to v1.5.** The embedded mode in v1 already exposes the full translator (via `?tab=_midi`), so any user who *wants* the standalone-proxy experience can already get it by leaving that tab open in a separate browser window. v1.5 adds the polished landing page and the no-distractions UI shell. Cost of deferring: low, because the work is mostly UX shell + URL routing, ~2 days. Cost of shipping in v1: medium, because it commits us to that UX before we know whether the embedded-mode-as-killer-feature is sufficient.

### Three settings the user MUST be able to control

1. Input device (which MIDI keyboard).
2. Output device + protocol (where the maqam-tuned MIDI goes).
3. Karar MIDI note (which physical key plays the karar).

### Three settings that should default sensibly

1. Mapping mode → hybrid (default).
2. Pitch-bend sensitivity → ±2 semitones (default).
3. Live retune held notes → ON (default).

### The validation test

Single criterion that gates "the translator works":

> Play A4 (MIDI 69) in C Hicaz, karar = MIDI 60 (C4). Expected output frequency: 412.985 Hz (Acem in Hicaz, 792.5 cents above C4, per `tuning-systems-formalization.md` §6). Measured at the receiving synth's audio output: must be within ±1 cent (412.745–413.225 Hz, equivalently 791.5–793.5 cents above C4).

Run at three points: (1) file-export path — Surge XT loaded with the exported `.scl`; (2) live single-channel pitch-bend path — same Surge XT receiving real-time MIDI; (3) v2 only — MPE round-trip via Pianoteq.

If observed-vs-expected exceeds 1 cent: investigate bend math, the synth's pitch-bend sensitivity setting, and the receiver's internal pitch resolution. Common culprits: synth set to ±12 sm when our spec says ±2; `.scl` last-line period misread as 8th pitch instead of octave.

Audit runs on every release via §6's diagnostics framework.

---

## Open questions

1. **Should v1 ship MTS Bulk SysEx alongside file export?** ~80 LoC + SysEx permission UX. Defer to v1.5 unless an early hardware user requests it; document the limitation in v1 release notes.
2. **Default protocol for the standalone-proxy URL?** Single-channel is universal but mono; MPE is poly but ~50% of receivers lack it. Auto-detection by manufacturer is overkill; a three-radio with one-sentence explanations is sufficient.
3. **White-key octave-shift vs. wrap-octave default in hybrid mode?** v1 wraps naturally into the next octave; octave-shift sits on dedicated UI buttons. Revisit if user research surfaces confusion.
4. **Which protocol does the translator prefer when MIDI 2.0 eventually lands?** v1 stance: prefer MIDI 1.0 single-channel for compatibility; flag MIDI 2.0 as advanced setting when Web MIDI 2.0 ships.
5. **Configurable pitch-bend reset on note-off?** Default: no reset (saves 3 bytes/note). Setting "Reset pitch-bend on note-off" for users whose synth interpolates bend across rapid note transitions and audible glides.
6. **MPE: rotate channels for mono input?** Spec doesn't require it. Recommend rotating anyway, so user transitions between mono and poly observe consistent behavior.
7. **Native-script protocol picker labels?** Defer to i18n layer (`useT()`).
8. **Per-maqam pitch-bend sensitivity?** ±2 sm sufficient for v1. v2 could allow per-preset overrides.
9. **Send full RPN preamble on every output-device-connect?** 6 messages = 18 bytes, cheap. Some synths display a brief "RPN received" indicator that may distract. Defer until user feedback.

---

## Sources

### Web MIDI API
- [W3C Web MIDI API Editor's Draft](https://webaudio.github.io/web-midi-api/)
- [MDN: MIDIOutput.send()](https://developer.mozilla.org/en-US/docs/Web/API/MIDIOutput/send)
- [Can I Use: Web MIDI API](https://caniuse.com/midi)
- [Bugzilla 836897 - Mozilla WebMIDI implementation](https://bugzilla.mozilla.org/show_bug.cgi?id=836897)
- [WebMidi.js (djipco)](https://github.com/djipco/webmidi)
- [Apple Web MIDI declination on Hacker News (2020)](https://news.ycombinator.com/item?id=23676109)

### MIDI 1.0 + pitch-bend
- [MIDI 1.0 Microtonal Support — midi.org](https://midi.org/community/midi-specifications/midi-1-0-microtonal-support)
- [Tigoe: MIDI Pitch Bend examples](https://tigoe.github.io/SoundExamples/midi-pitch-bend.html)
- [MIDIUtil: tuning and microtonalities](https://midiutil.readthedocs.io/en/latest/tuning.html)
- [Cycling 74: microtonal MIDI cents-to-pitch-bend](https://cycling74.com/forums/microtonal-midi-cents-to-pitch-bends)

### MPE (MIDI Polyphonic Expression)
- [MPE Specification 1.0 — MIDI Manufacturers Association (PDF)](https://d30pueezughrda.cloudfront.net/campaigns/mpe/mpespec.pdf)
- [MPE Specification Adopted — midi.org](https://midi.org/midi-polyphonic-expression-mpe-specification-adopted)
- [StudioCode MPE primer](https://studiocode.dev/kb/MIDI/mpe/)
- [Roger Linn Design: How to add MPE](https://www.rogerlinndesign.com/support/support-developers-how-to-add-mpe)
- [Sound on Sound: ABC of MPE](https://www.soundonsound.com/sound-advice/mpe-midi-polyphonic-expression)
- [iZotope: MPE Explained](https://www.izotope.com/en/learn/midi-polyphonic-expression-explained.html)
- [ROLI: What is MPE](https://support.roli.com/en/support/solutions/articles/36000027933-what-is-mpe-)

### MIDI 2.0
- [State of MIDI 2.0 (Feb 2026 update) — midi.org](https://midi.org/the-state-of-midi-2-0-high-resolution-performance-and-the-rise-of-profiles-update-feb-2026)
- [Universal MIDI Packet (UMP) Format and MIDI 2.0 Protocol Specification (PDF, AMEI)](https://amei-music.github.io/midi2.0-docs/amei-pdf/M2-104-UM_v1-1-2_UMP_and_MIDI_2-0_Protocol_Specification.pdf)
- [Windows MIDI Services (Microsoft Devblogs)](https://devblogs.microsoft.com/windows-music-dev/windows-midi-services-oct-2024-update/)
- [uapmd: MIDI 2.0 plugin host](https://github.com/atsushieno/uapmd)

### MTS / MTS-ESP
- [MIDI Tuning Standard — Wikipedia](https://en.wikipedia.org/wiki/MIDI_tuning_standard)
- [The MIDI Tuning Standard — Microtonal Synthesis (Rich + Scholz)](http://microtonal-synthesis.com/MIDItuning.html)
- [Tonalsoft: A Gentle Introduction to MTS](http://www.tonalsoft.com/monzo/miditune/miditune.aspx)
- [MTS-ESP — ODDSound (GitHub)](https://github.com/ODDSound/MTS-ESP)
- [MTS-ESP overview — ODDSound](https://oddsound.com/usingmtsesp.php)
- [MTS-ESP Mini — ODDSound](https://oddsound.com/mtsespmini.php)
- [MTS-ESP Suite — ODDSound](https://oddsound.com/mtsespsuite.php)
- [TechnoGems: MTS in SuperCollider](http://technogems.blogspot.com/2018/07/using-midi-tuning-specification-mts.html)

### Hardware compatibility
- [Hπ Instruments: GM microtuning compatibility](https://hpi.zentral.zone/compatibility)
- [Pianoteq pitch-bend handling — Modartt forum](https://forum.modartt.com/viewtopic.php?id=10518)

### BeatForge MIDI module (read-only reference)
- `/Users/cemergin/lab/beatforge/app/src/modules/midi/midi.ts`
- `/Users/cemergin/lab/beatforge/app/src/modules/midi/sink.ts`
- `/Users/cemergin/lab/beatforge/app/src/modules/midi/clock.ts`
- `/Users/cemergin/lab/beatforge/app/src/modules/midi/types.ts`
- `/Users/cemergin/lab/beatforge/app/src/lib/useMidiBridge.ts`
- `/Users/cemergin/lab/beatforge/app/src/modes/Midi/Midi.tsx`
- `/Users/cemergin/lab/beatforge/docs/topics/midi/README.md`

---

## References

### Specifications
- MIDI Manufacturers Association (1996, updated 2018). *MIDI 1.0 Detailed Specification, version 4.2.1*. Los Angeles, CA: MIDI Manufacturers Association. — The base wire-protocol document; defines pitch-bend status byte 0xEn semantics and the RPN/NRPN mechanism.
- MIDI Manufacturers Association (2018, March 12). *MIDI Polyphonic Expression (MPE) v1.0*, RP-053. Los Angeles, CA: MIDI Manufacturers Association. — The MPE spec. Defines Lower Zone / Upper Zone, default ±2 sm master and ±48 sm member pitch-bend, MCM via RPN 6, channel-per-note allocation.
- MIDI Manufacturers Association (1992, updated 2008). *MIDI Tuning Standard*, RP-012. Los Angeles, CA: MMA. — The MTS spec. Defines Bulk Tuning Dump SysEx (sub-IDs 08 01), Single Note Tuning Change (08 02), Realtime Single Note Tuning Change (08 07), Scale/Octave Tuning (08 08, 08 09).
- MIDI Manufacturers Association + Association of Musical Electronics Industry (2020, updated 2023). *Universal MIDI Packet (UMP) Format and MIDI 2.0 Protocol Specification, v1.1.2.* Document M2-104-UM. — MIDI 2.0 wire-format spec, including 32-bit per-note pitch attribute.
- W3C Web Audio Working Group (2024). *Web MIDI API Editor's Draft.* https://webaudio.github.io/web-midi-api/. — The browser-side spec for MIDIInput, MIDIOutput, MIDIAccess, sysex permission, DOMHighResTimeStamp scheduling.

### Books / academic
- Rothstein, J. (1995). *MIDI: A Comprehensive Introduction* (2nd ed.). A-R Editions. — Chapter on the wire protocol; pitch-bend resolution math.
- Loy, G. (2007). *Musimathics: The Mathematical Foundations of Music, Volume 2.* MIT Press. — Cents/log-frequency mathematics, pitch-bend resolution analysis.
- Smith, J. O. III. *Physical Audio Signal Processing.* Stanford CCRMA online textbook. https://ccrma.stanford.edu/~jos/pasp/. — DSP foundations relevant to pitch quantization and modulator interaction.
- Wessel, D., & Wright, M. (2002). "Problems and Prospects for Intimate Musical Control of Computers." *Computer Music Journal*, 26(3), 11-22. MIT Press. — Foundational NIME paper on real-time MIDI latency and gestural control budgets.
- McPherson, A. (2010). "The Magnetic Resonator Piano: Electronic Augmentation of an Acoustic Grand Piano." *Journal of New Music Research*, 39(3), 189-202. — Microtonal MIDI control of acoustic instruments via per-note pitch-bend.

### Articles / standards
- ODDSound (2020). *MTS-ESP: Master/Client Tuning Protocol — Developer Documentation.* https://oddsound.com/devs.php. — The MTS-ESP shared-memory IPC protocol, why it doesn't transfer to browsers.
- Sevish (2017). "Mapping Microtonal Scales to a MIDI Keyboard in Scala." https://sevish.com/2017/mapping-microtonal-scales-keyboard-scala/. — Practical .kbm authoring guide.

### Pianoteq, Surge XT, u-he Diva
- Modartt Pianoteq Documentation (2026). "Tuning, MTS-ESP, and Microtonality." — Pianoteq's pitch-bend and MTS-ESP behavior.
- Surge Synthesizer Team (2024). *Surge XT Manual: Tunings.* https://surge-synthesizer.github.io/manual-xt/. — Surge XT's .scl/.kbm and MTS-ESP interop.
- u-he (2024). *Diva User Guide.* — u-he's tuning interop.
