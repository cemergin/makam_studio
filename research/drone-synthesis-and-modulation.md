---
title: "Drone subsystem — synthesis, modulation, and the Tab-to-current-pitch karar gesture"
audience: "makam_studio audio-engine architect, MIDI-translator implementer, UX designer of the playing surface; future-self auditing the Pivot-9 claim that drone-with-Tab-modulation is the project's signature improvisational move"
tldr: |
  v1 ships an always-on drone subsystem running as a third major engine voice
  alongside the lead synth (multi-instrument-synthesis.md) and the MIDI
  translator (midi-maqam-translation.md). The default voice is a layered
  vaporwave-choir-tubular-wind patch — formant-shifted noise + modal-bell
  partials + breath-noise — running in a single AudioWorklet at roughly 3× the
  CPU of one Karplus-Strong voice. The default interval is sa-pa (root +
  fifth). The default karar-modulation gesture is Tab: a 600-ms exponential
  glide from the current drone pitch to the user's last-played melody pitch,
  re-anchoring the maqam to the new karar. Drone gets its own MIDI channel in
  the translator's output so external rigs can route it to a separate ambient
  synth while the lead voice goes elsewhere. Defaults are opinionated: drone
  on, vaporwave patch, sa-pa, Tab enabled, re-center mode. All of them are
  one click away from off.
skip_if: "you only care about the lead synth (see multi-instrument-synthesis.md), the MIDI output protocols (see midi-maqam-translation.md), or the playing-surface UX (see split-keyboard-chord-and-melody-ux.md)."
date: 2026-04-30
status: draft
---

# TL;DR

- **Drone is on by default.** Hindustani, Byzantine, Sufi, Balkan-bagpipe and modern fusion/vaporwave practice all build melody over a sustained reference. Classical Persian, Ottoman, Arabic and Maghrebi practice do not — but their absence of drone is not an objection to drone-as-affordance; their listeners reach for makam_studio precisely to do something the classical takht does not. Default-on, one-click off, no apology.
- **The signature voice is "vaporwave ambient choir tubular wind."** A single AudioWorklet runs four detuned formant-noise voices (slow A→E→I→O→U cycle, ~10 s per cycle), 6–8 inharmonic modal partials with very long decay times, and a quiet breath-noise layer through a cylindrical-bore resonance. CPU cost: ~3× one Karplus-Strong voice — well inside the v1 phone budget for a single drone instance.
- **Tab-to-current-pitch is the project's signature improvisational move.** User holds Tab; drone glides exponentially over 600 ms from current pitch to the user's last-played melody pitch; the maqam re-anchors to the new karar. The whole network of pitch-class candidates shifts. Real qanun players cannot easily change karar mid-piece; commercial maqam tools force "stop, pick new karar, restart." Tab collapses both gaps into one keystroke. As far as we can find, no commercial maqam software does this.
- **Two modes for what happens to the maqam under the drone.** *Re-center* (default): maqam re-anchors, every override-palette refreshes its candidates. *Float*: drone moves, maqam stays — the harmonic relationship between drone and lead becomes the expressive variable. Float is a v1 feature, not a v2 nice-to-have, because float is what makes ambient/drone-music improvisation feel alive.
- **Drone gets its own MIDI channel.** Default channel 10 if the lead is on channel 1; configurable. Pitch-bend follows the karar. During a Tab modulation, the bend is updated at ~50 Hz over the 600 ms glide so the external synth tracks the ramp smoothly. An external producer can route the drone channel to an ambient pad VST while the lead goes to a hardware sampler — every voice is a separate consumer of the tuning data.
- **Phase 1 fits in two weeks.** Single-tone fixed drone (3 d) → tubular + wind layers (2 d) → sa-pa interval (1 d) → Tab re-center (2 d) → drone MIDI out with bend ramp (2 d) → float mode + UX polish (2 d). The riskiest detail is bend-ramp scheduling collisions with the lead's pitch-bend on Tab in single-channel mode; derisk by giving drone its own channel from day one, even before MIDI output ships.
- **Marketing framing: drone is the third subsystem.** Lead-synth + MIDI-translator + drone are the three things that distinguish makam_studio from "another microtonal piano in a browser." The drone subsystem is what makes maqam-with-an-ambient-bed-and-modulation an instant gesture rather than a multi-tool DAW project.

---

# 1. Drone in maqam-world musicology

Drone use varies sharply across the traditions makam_studio targets. The
Mashriqi-Ottoman-Persian classical traditions either do not use continuous
drone or use it only as a peripheral effect; the Hindustani, Byzantine,
Sufi, and Balkan worlds use drone structurally; modern fusion uses drone
unanimously. The design implication is not "follow the tradition with the
most users" — it is to serve the audience that actually reaches for this
tool, without disrespecting the traditions where drone is absent.

## 1.1 Hindustani classical — drone as constitutive

The tanpura is constitutive of Hindustani performance. Without a sustained
drone, raga performance is conceptually incomplete; pitch perception is
shaped by the drone's harmonic content and the relationship of every
melodic note to it (Bor 1999; Wade 1984; Slawek 2000). The drone's *sa* is
the absolute reference for *vādī*-, *saṃvādī*-, and *shadja-pa*
relationships — the same scale played over a different drone activates a
different raga.

The acoustic mechanism is unique. The tanpura has a curved (parabolic)
bridge with a cotton or silk thread (*jivari*) between strings and bridge.
C. V. Raman's 1922 paper "On Some Indian Stringed Instruments" was the
first to describe the resulting nonlinearity: as the string's amplitude
decays, its grazing-contact point on the curved bridge migrates, pumping
harmonics that would otherwise be weak and producing a glissando-like
sweeping spectrum (Raman 1922; Carterette and Kendall 1990; Sengupta et
al. 2018). The drone has a slowly modulating *formant* — not a static
spectrum but a breathing, almost-vocal envelope. The jivari "buzz" is what
gives a tanpura its uncanny, alive quality, and it is the acoustic
ancestor of our vaporwave-choir vowel cycle in §2.

Standard tanpura tunings: *sa-pa-sa-sa* (root + fifth) and *sa-Ma-sa-sa*
(root + fourth, for ragas that omit Pa or whose Pa is inflected — Marwa,
Saba, Lalit). Both feed our interval-mode selector.

## 1.2 Persian, Azerbaijani, Ottoman, Arabic, Maghrebi — classical: no continuous drone

Classical Persian art music has no continuous drone (Farhat 1990, Ch. 3;
During and Mirabdolbaghi 1991). The functional analogue is the *shahed*
(witness pitch — the most prominent dwelt-on note of a gusheh) and *ist*
(resting pitch — the cadential pause-point); these function as quasi-drone
reference tones via *repetition* rather than sustained sounding. The
listener's short-term-memory representation of the shahed *is* the drone.
Some modern diasporic Persian musicians add tar/setar bourdon or a synth
pad — a contemporary innovation, but now common enough in fusion that
omitting drone denies users the music they want to play.

Azerbaijani mugham follows the Persian pattern: tar and kamancha have one
or two *bourdon* strings used as brief punctuation, never as a sustained
bed (During 1988, 2005). Classical Ottoman music — Mevlevi mukabele, Fasıl,
the kâr/beste/şarkı genres — does not use drone (Signell 1977; Feldman
1996). The ney's *demlemek* (a held low tone under another player's
elaboration) exists but is uncharacteristic. The Arabic *takht* and
*firqa* do not employ drone (Touma 1996; Marcus 2007; Racy 2003); the
qanun's lower-course strings ring sympathetically, producing a quasi-drone
*harmonic field* analogous to an acoustic guitar's sympathetic shimmer
under fingerpicked melody. Tunisian *ma'lūf*, Algerian *San'a* /
*Gharnati*, and Moroccan *Ālā* nawba performances do not feature drone
(Davila 2013; Glasser 2016).

## 1.3 Folk, Sufi, Byzantine, Balkan, fusion — drone is everywhere

Sufi *zikr* performance, Bektashi devotional music, Anatolian baglama
(drone strings ring under fingered melody), Central-Asian dutar (the
second string IS the drone — the instrument is monodically incomplete
without it), and Anatolian davul/zurna ensembles (one zurna sustains a
drone while the other carries melody) all use drone structurally.

Byzantine chant uses *isokratema* (the held drone tone sung by the
*isokrátes* under the melody-singer's line) as a foundational element
(Lingas 2003; Stathis 2019). Critically, the ison is *moveable*: as the
melody passes into a different tetrachord or pentachord, the ison shifts
to the base note of the new tetrachord. The protopsaltis signals these
moves; an experienced isokrátes hears them coming. **This is the closest
historical precedent for makam_studio's Tab-modulation gesture: a
tradition where the drone is *supposed* to move with the active modal
centre.**

Greek dromoi inherited the no-drone-in-classical convention, but Greek
folk uses the *gajda/gaida/tsambouna* bagpipe bourdon, the zurna-davul
pair, and the Pontic kemenche drone-strings. Bulgarian, Macedonian,
Albanian, Serbian and Roma rural music similarly tilts toward drone
(Buchanan 2007; Pettan 2010). Modern fusion is unanimous: Niyaz, Mercan
Dede, Anouar Brahem's *Le Pas du Chat Noir*, Ross Daly's Labyrinth
ensemble (his modified Cretan lyra carries 18 sympathetic jawari-bridge
strings, explicitly inspired by tanpura practice — Daly 2016), and the
ambient-maqam YouTube/Bandcamp economy all build melody over sustained or
slowly-modulating drone beds.

## 1.4 Design implication

Default-on, one-click off, no apology. The about-page copy should
acknowledge that classical Ottoman, Arabic, Persian, and Maghrebi
traditions do not use continuous drone — that's the project's cultural
sensitivity — but the default behaviour follows the larger fusion-and-
folk-and-Hindustani-and-Byzantine-and-Sufi audience that actually reaches
for this tool.

---

# 2. The vaporwave-ambient-choir-tubular-wind patch

Three layered timbral components — choir formant, tubular modal partials,
and breath-noise wind — plus shared modulation. Layered, slow-moving,
breathing; explicitly *not* a sterile sine pad.

## 2.1 Choir layer (dominant)

Four-to-eight detuned voices, each a pink-noise generator through a
parallel bank of 3–4 bandpass filters tuned to vowel formants. The
formant filter centres slowly cycle A → E → I → O → U → A over ~10 s.
Voices are detuned 3–8 cents apart (random within a fixed seed for
session-stable pitch + chorus shimmer).

**Formant frequencies (male-bass register, transposable per drone pitch):**

| Vowel | F1 (Hz) | F2 (Hz) | F3 (Hz) | F4 (Hz) |
|-------|---------|---------|---------|---------|
| A     | 600     | 1000    | 2500    | 3500    |
| E     | 400     | 2000    | 2600    | 3500    |
| I     | 250     | 2300    | 3000    | 4000    |
| O     | 400     | 800     | 2400    | 3400    |
| U     | 300     | 600     | 2300    | 3300    |

(PMC 2018 "Static Measurements of Vowel Formant Frequencies and
Bandwidths"; bandwidths ~80/100/120/150 Hz for F1/F2/F3/F4; filter Qs ~5–8.)
The vowel cycle linearly interpolates each formant centre between
consecutive vowels (~2 s per transition). This continuous formant motion
is what makes it "vaporwave choir" rather than "filtered noise." Pink-noise
excitation shaped by an attack-sustain-release envelope (see §2.5).

## 2.2 Tubular layer (shimmer)

Modal synthesis: 6–8 inharmonic resonators with long decay times, tuned to
a tubular bell's overtone series. For fundamental f, partials sit at:

| Partial | Ratio | Decay | Amp  |
|---------|-------|-------|------|
| 1       | 1.000 | 8 s   | 1.0  |
| 2       | 2.762 | 6 s   | 0.6  |
| 3       | 5.404 | 4 s   | 0.5  |
| 4       | 8.933 | 3 s   | 0.3  |
| 5       | 13.34 | 2 s   | 0.2  |
| 6       | 18.64 | 1.5 s | 0.15 |

(Ratios from Fletcher and Rossing 1998 Ch. 21; refined by Macon and Cook
1996.) Each partial is a high-Q biquad bandpass excited by a low-amplitude
white-noise burst at drone-onset; re-excitation every 8–12 s keeps the
slowest partials alive. Karplus-Strong with feedback ≥ 0.999 is an
alternative; modal is simpler, deterministic, more reliably bell-like —
ship modal in v1.

## 2.3 Wind layer (air)

Pink noise through a cylindrical-bore resonance — the ney model from
multi-instrument-synthesis.md §3 with jet-edge oscillation off, so output
is just the breath-air of a flute-like bore tuned to the drone
fundamental (cylindrical bores emphasise odd harmonics, gently tinting
the noise). Sits at –24 to –30 dB; barely audible in isolation but its
absence is noticed. It is the "presence."

## 2.4 Pitch behaviour and analog drift

Sustained, no decay. Optional ±10 cents random-walk drift over 30-s
timescale (low-pass-filtered white-noise process) gives the patch a
warm/analog/breathing character. Default on. The drift compounds with
Tab-glide: after a Tab modulation, drift continues from the new centre.

## 2.5 Envelope, modulation, reverb

- **Attack**: 500 ms. **Sustain**: infinite. **Release**: 3–5 s — the drone
  fades softly on drone-off; re-enabling within the release window
  re-attacks from the current value, no discontinuity.
- **Tremolo**: 0.3–0.7 Hz LFO on overall amplitude, 5–15% depth.
- **Reverb**: long damped tail via BeatForge's `reverb.ts` (forked per
  `beatforge-reusable-research-mining.md`), reverb time ~6 s, HF damping
  ~3 kHz. The drone has its own send to the reverb bus, separate from the
  lead, so the drone can be wetter than the lead.

## 2.6 Web Audio realisation

One AudioWorklet processor file owns the entire drone subsystem — a
`DroneVoice` class composing **ChoirLayer** (4–8 sub-voices, pink noise →
biquad bank → detune), **TubularLayer** (6–8 high-Q biquads in parallel
with periodic low-level white-noise re-excitation), and **WindLayer** (pink
noise → cylindrical-bore IIR mirroring the ney implementation). The three
layers feed per-layer gain → summed bus → drone output. The output routes
to (a) the master with its own reverb send, and (b) the MIDI translator's
drone-channel output (§5).

**CPU cost estimate** at 48 kHz with 4 choir sub-voices, 8 tubular biquads,
and 1 wind layer: choir ~30 mults/sample, tubular ~40, wind ~8, plus LFOs
and mixing ~10. Total ~88 multiplies/sample for one drone voice vs. ~30
for one Wave-1 Karplus-Strong qanun voice. **One drone voice ≈ 3× one K-S
voice.** With v1's monophonic lead (1 voice), the engine budget is ~5 K-S
voices total — well inside the iPhone 12 / Pixel 6 phone budget Wave 1
established (~6 voices).

## 2.7 Patch parameters exposed to UI

- **Layer balance**: choir/tubular/wind proportions. Default 70/20/10.
- **Vowel-cycle speed**: 0.05–0.5 Hz. Default 0.1 Hz (~10 s/cycle).
- **Formant brightness**: global high-shelf above 2 kHz. Default neutral.
- **Drift on/off + amount**: default on, ±10 cents, 30-s timescale.
- **Tremolo rate / depth**: default 0.5 Hz, 10%.
- **Reverb send**: default 60% (drone wetter than lead).

## 2.8 Calibration listening

For the team's ear-training session: Stars of the Lid (*And Their
Refinement of the Decline*), William Basinski (*Disintegration Loops*),
Vangelis (*Blade Runner* OST, "Tears in Rain"), Klaus Schulze (*Mirage*),
Macintosh Plus (*Floral Shoppe*), Niyaz, Anouar Brahem (*Le Pas du Chat
Noir*), Ross Daly drone segments (*Mitos*), Mercan Dede, plus a
representative tanpura recording to calibrate the formant cycle against
the jivari spectrum. Calibration references, not synthesis targets.

---

# 3. Drone configurations (interval choices)

Six configurations:

- **Sa-pa** (root + fifth, two voices). Classical default; tanpura standard.
  Default for most maqam, Hindustani fusion, ambient-maqam jam.
- **Sa-Ma** (root + fourth). Hindustani ragas without Pa or with inflected
  Pa (Marwa, Saba, Lalit); some Byzantine Plagal of Second contexts.
- **Single-tone** (root only). Byzantine ison style. Most harmonically
  flexible. Default for Byzantine presets.
- **Sa-pa-octave** (root + fifth + octave, three voices). Richer, more
  "powerful," common in jam/ambient.
- **Custom interval pair** (user picks two pitches by cents). Power-user
  for unusual modes (Saba neutral fourth, Hicaz diminished fifth).
- **Moving ison** (v2). Drone auto-follows the most-recent rest tone via
  shahed/ist detection on the pitchHistory ring buffer (§4). Document
  in v1, ship in v2.

The drone-interval mode persists per-preset: loading Bhairav auto-sets
sa-pa; loading Plagal-of-Second auto-sets single-tone. Manual override
sticks per session.

## 3.1 Implementation

Each interval mode is a pool of N independent DroneVoice instances in the
AudioWorklet, sharing formant-cycle phase (vowels move together) but
independent pitches. The fifth-voice's pitch derives from the karar
through the *active maqam's actual fifth-ratio* — not always 702 cents
(e.g., Saba's neutral fifth ~672 cents). The octave-voice is exactly
+1200 cents. On Tab modulation, all voices glide together exponentially,
interval ratios preserved exactly.

---

# 4. The Tab-to-current-pitch modulation gesture

This is the project's signature improvisational move, per Pivot 9. The user
is improvising melody pitch P. They press Tab. Drone glides to P. Maqam
follows.

## 4.1 The glide algorithm

Smooth exponential ramp from current drone pitch P_drone to user's
last-played pitch P_target over 600 ms (configurable 200–1500 ms).
Implementation: the DroneVoice's `targetPitch` AudioParam is controlled by
calling `setValueAtTime(P_drone, currentTime)` immediately followed by
`exponentialRampToValueAtTime(P_target, currentTime + 0.6)`. The
`setValueAtTime` is required because exponentialRamp's starting value is
"the value at the previous event," not the current parameter value;
forgetting this is the most common Web Audio bug in pitch-glide code.
Exponential-in-Hz (= linear-in-cents) sounds uniform; linear-in-Hz sounds
slow-low-fast-high.

During the glide, all voices in the active interval mode move together:
sa-pa moves root and fifth in parallel, sa-pa-octave moves three voices,
interval ratios preserved exactly.

Default glide time 600 ms — 200 ms feels snap, 1500 ms feels psychedelic;
600 ms feels deliberate but still live. Audition during Phase 1.

## 4.2 Pitch-history tracking

A ring buffer of the lead synth's recent note-on pitches: each entry
stores pitch (Hz), timestamp, scale-degree, and held flag. HISTORY_SIZE =
16 is plenty. Tab uses `pitchHistory[lastIndex].pitch` as P_target — the
most-recent note-on, held or not (matches the user's mental model: "I just
played that, modulate to it"). Cold session with no notes: Tab plays a
soft pluck signal sound and is otherwise a no-op. Held chord (rare in
monophonic v1, possible via polyphonic MIDI in): Tab uses most-recent;
repeat-Tab within ~2 s cycles oldest → newest through currently-held
note-ons.

## 4.3 Two modes for what happens to the maqam

**Re-center (default).** The active maqam re-anchors to the new karar at P.
The whole pitch-network shifts. The keyboard's microtonal mapping changes
— each white key plays a different absolute pitch but the same scale-
degree. The override-palette refreshes (Aleppine vs. Iraqi vs. Cairene
Sikah candidates rebase to the new karar). The MIDI translator emits
`karar_change`. Mental model: "we were in A Hicaz; now we're in C Hicaz."
Default because mid-improv karar modulation is exactly what real qanun
players want to do but can't easily, and what commercial maqam tools do
not support without "stop, reload, restart."

**Float.** Drone moves to P; the maqam stays anchored. Keyboard mapping,
override-palette, and MIDI mapping do not change. Mental model: "the maqam
stays in A Hicaz, but the drone is now on C — which is the maqam's
perfect-fifth." The harmonic relationship between drone and maqam-anchor
becomes the expressive variable. Float is for ambient/drone-music
improvisers who want to *play with* the tension instead of collapsing it.

A "Re-center / Float" radio in the drone panel. Default: Re-center.
Global, applies to all subsequent Tab presses. (v2 refinement: per-Tab
modifier — Shift+Tab for float — once users ask for it.)

## 4.4 Interactions with held notes and preset changes

**Re-center + held lead note**: the held note keeps playing at its old
absolute pitch. The maqam has reassigned scale-degree → frequency for
future note-ons, but the held note's frequency was captured at note-on
time. A "live retune held notes" setting (default OFF, mirroring the MIDI
translator's §3.1) smoothly re-pitches held notes over the same 600-ms
window if the user wants it.

**Float + held lead note**: trivial; nothing moves.

**Maqam preset change while drone plays**: if karar unchanged, drone stays
put; the fifth-voice (if any) retunes to the new maqam's fifth-ratio over
a quiet 200-ms ramp. If karar changed, drone glides 600 ms as if Tab had
fired. **Float + preset change**: drone stays at its custom pitch, maqam
pitches retune around it.

## 4.5 Tab keybinding and GUI alternative

Tab borrows from "advance to next field" semantics. The drone panel also
exposes a "↻ Karar" button doing the same thing — necessary on mobile and
preferred by users on non-QWERTY layouts. Browser gotcha: Tab natively
moves focus, so the handler must `preventDefault()` and check
`document.activeElement` is the playing surface before firing — otherwise
a user tabbed into a settings dropdown would trigger karar-modulation
instead of moving focus.

---

# 5. Drone in MIDI output

The drone is a separate voice and needs its own MIDI output channel. This
is a small extension of the MIDI translator's architecture documented in
midi-maqam-translation.md.

## 5.1 Channel allocation

Default: drone on channel 10 when lead is on channel 1. Ch 10 is GM's
"drum" channel but most modern synths and DAWs don't enforce GM. The MIDI
panel exposes a "Drone MIDI channel" dropdown (1–16, default 10) and
validates drone-channel ≠ lead-channel. For MPE rigs (v2), drone gets its
own MPE zone (typically Upper Zone, master ch 16, members ch 15..N) while
the lead uses Lower Zone.

## 5.2 Sustained note-on and pitch-bend

On drone-on: (1) RPN pitch-bend sensitivity setup once per session; (2)
pitch-bend matching the karar's cents-from-12-EDO offset; (3) note-on at
the karar's nearest 12-EDO MIDI note, vel ~80, on the drone channel; (4)
no note-off until drone-off. For multi-voice intervals (sa-pa,
sa-pa-octave), each drone voice is a separate note-on on the same channel,
all sharing one bend value — so non-12-EDO interval ratios *within* the
drone (e.g., a maqam-specific neutral fifth) are approximated by 12-EDO
MIDI note numbers plus the shared karar bend. The fifth's exact tuning is
mostly inaudible against a sustained drone, so this approximation is
musically tolerable. v2's MPE path gives each drone voice its own member
channel and exact bend; v1 documents the limitation.

## 5.3 Tab-modulation pitch-bend ramp

During a 600-ms Tab glide, the translator schedules ~30 pitch-bend
messages on the drone channel via `MIDIOutput.send(data, timestamp)` at
exponentially spaced timestamps so the cents-per-step is uniform. 50 Hz
update rate (configurable to 100 Hz). MIDI bandwidth: ~150 bytes/sec —
trivial vs. the channel's ~3125 bytes/sec spec ceiling.

In re-center mode, the lead's bend on its own channel must also update
because the new karar mapping changes cents-from-12-EDO for held notes (if
"live retune held notes" is on). Both ramps run independently on
independent channels, sharing only the 600-ms timeline.

**The riskiest detail**: bend-ramp scheduling on the drone channel
colliding with simultaneous lead note-ons on the lead channel during a
Tab + new-note burst. **Derisk by giving drone its own channel from day
one** — even before MIDI output ships, mark the architecture as channel-
separated. Intra-channel bend ordering is well-tested in the lead's MIDI
translator; inter-channel scheduling is independent.

## 5.4 Routing UX

The MIDI panel exposes:
- **Drone MIDI output**: on/off (default off for v1; the in-app drone
  audio is the default; a user enables MIDI drone output deliberately).
- **Drone channel**: dropdown 1–16, default 10.
- **Drone pitch-bend range**: ±2 sm default (matches lead).
- **Drone send to a different output device**: advanced; defaults to "same
  as lead." Useful when the user wants to route lead to a hardware synth
  via USB-MIDI cable A, and drone to a soft-synth via virtual MIDI cable B.

---

# 6. Drone UX surfaces (final)

The complete UX of the drone subsystem, as it appears to the v1 user.

## 6.1 The drone panel

Collapsible, below the playing surface (single-surface mode) or in a
popover (split-keyboard mode). Collapsed-by-default on first session.
Top-to-bottom contents:

- **On/off** toggle (default on).
- **Voice selector** (radio): "Vaporwave choir tubular wind" (default) /
  "Mono bourdon" / "Sa-pa pair" / "Single-tone ison." v1 ships only the
  vaporwave voice; others are greyed coming-soon.
- **Interval mode** (radio): Sa-pa (default for most maqam) / Sa-Ma (Marwa-
  class) / Single-tone (Byzantine) / Sa-pa-octave / Custom. Auto-shifts
  with preset; manual override sticks per session.
- **Volume**: default 30% — drone is a bed.
- **Tab-to-current-pitch** toggle (default on) + "↻ Karar" GUI button +
  glide-time slider 200–1500 ms (default 600).
- **Modulation mode** (radio): Re-center (default) / Float.
- **Custom drone pitch** — input in Hz or cents-from-A4; locks the drone
  off the karar; Tab becomes a no-op while custom-pitch is engaged.

## 6.2 Advanced patch panel

Hidden by default; exposes the §2.7 controls (layer balance, vowel speed,
brightness, drift, tremolo, reverb). Power-user territory.

## 6.3 Visual feedback

When Tab fires, the karar slider's knob glides to its new position over
the same 600 ms with a brief glow in the per-tradition theme colour. The
override-palette buttons refresh their candidate-pitches in re-center
mode. Subtle, not flashy — but enough to make the signature gesture feel
*signature*.

---

# 7. Edge cases

- **Maqam preset change while drone plays.** Re-center: drone glides 600 ms
  if karar changed; otherwise stays put with fifth-voice quiet 200-ms
  retune. Float: drone stays put.
- **Lead voice switch mid-improv.** Drone unchanged.
- **Polyphonic external MIDI input.** Tab uses most-recent note-on;
  repeat-Tab within 2 s cycles oldest → newest through held notes.
- **Held lead notes during Tab.** Stay at old pitch unless "live retune
  held notes" is on (default OFF).
- **Tab with no melody-pitch history.** No-op + soft pluck signal sound.
- **Tab during active glide.** Active glide is replaced; new glide
  originates from the mid-glide value, targets the new pitch, 600 ms.
  Monotonic in cents-space; rapid Tab-Tab-Tab feels like a smooth polyglide.
- **Float mode + preset change.** Drone stays; maqam pitches retune around
  it.
- **Session export (URL share-link, IndexedDB, JSON).** Drone state — voice,
  interval mode, custom pitch, modulation mode, panel parameters — is part
  of saved state.
- **Mobile, no hardware Tab.** "↻ Karar" button is the primary gesture.
- **Master mute with drone on.** Drone audio is muted via master gain; MIDI
  output continues firing if enabled. Matches lead behaviour; document.

---

# 8. Phase 1 implementation order

Two-week derisking sequence:

1. **Day 1–3.** Single-tone fixed drone with one-voice ChoirLayer at
   vowel-A. AudioWorklet skeleton; sustained C2 pink-noise-through-formant
   bandpass when drone-on. *Risk*: high-Q formant filters can ring or
   whistle. Derisk: clamp Qs ≤ 8, sweep-test with white-noise input.
2. **Day 4–5.** Add TubularLayer (8 partials, canonical ratios, periodic
   re-excitation) + WindLayer. Mix at default 70/20/10.
3. **Day 6.** Detune 4-voice choir + A→E→I→O→U vowel cycle at 0.1 Hz.
4. **Day 7.** Sa-pa interval mode: two DroneVoices at karar and karar's
   fifth.
5. **Day 8–9.** Tab-modulation glide (re-center mode). PitchHistory ring
   buffer; Tab keydown handler with `preventDefault` and active-element
   guard; karar slider glides visually; override-palette refreshes. *Risk*:
   lead bend update collides with drone ramp on the same Web Audio frame.
   Derisk: separate AudioParams; both ramps run independently in worklet.
6. **Day 10–11.** Drone MIDI output on its own channel. Note-on on
   drone-on; 50 Hz pitch-bend stream during Tab glide. Test against
   hardware (Korg Minilogue, Yamaha Reface) and virtual (Surge XT,
   Pianoteq). *Risk*: bend collisions with lead-channel bursts. Derisk:
   independent channels + loopback verification on torture-test sequence.
7. **Day 12–13.** Float mode, glide-time slider, custom drone pitch,
   advanced patch panel, visual feedback, persistence (localStorage +
   IndexedDB).

Total: ~13 working days for the complete v1 drone subsystem.

---

## Implications for makam_studio

The v1 drone subsystem spec, as recommended commitments:

1. **Drone-on-by-default**; vaporwave-choir-tubular-wind as the single v1
   voice; mono-bourdon, sa-pa-pair, single-tone-ison voice variants in
   v1.5+.
2. **Default interval modes**: sa-pa for most maqam, sa-Ma for Marwa-class
   Hindustani, single-tone for Byzantine. Auto-shifts on preset load;
   manual override per session.
3. **Tab-to-current-pitch enabled by default**; glide 600 ms, configurable
   200–1500 ms; rebindable for users with focus-handling conflicts.
4. **Re-center is the default modulation mode**; float is v1, not v2 — it
   is what makes drone-music improvisation feel alive.
5. **Drone gets its own MIDI channel** (default ch 10). Pitch-bend follows
   the karar; ramped at 50 Hz during Tab. Drone MIDI output is *off* by
   default at v1; user enables deliberately from the MIDI panel.
6. **Third major engine subsystem** alongside lead-synthesis and
   MIDI-translation. Shares BeatForge's `ControllableModule` contract,
   typed event bus, and address-keyed dispatch. Address scheme:
   `drone.global.*`, `drone.layer.*`, `drone.tab.*`.
7. **Marketing framing**: drone-with-Tab-modulation is the project's
   signature move. The about page, README screenshot, and any demo video
   should lead with this gesture — "press Tab to modulate the karar
   mid-improv." It is the differentiator from "another microtonal piano in
   a browser."
8. **Cultural-sensitivity language**: acknowledge that classical Ottoman,
   Arabic, Persian, and Maghrebi traditions do not use continuous drone;
   default-on serves the larger fusion/Hindustani/Byzantine/Sufi/folk
   audience without denying the classical traditions. Frame as: "we
   default to drone because most of you want it; turn it off in one click
   if your tradition asks for it."

---

## Open questions

- **Drone fifth: maqam's actual fifth-ratio or pure 702 cents?**
  Recommendation: maqam's actual fifth (drone *is* the harmonic reference
  for the lead's fifth-degree; a clashing fifth-vs-fifth is audible). But
  some musicologists argue for pure 3:2 regardless. v1.5 toggle.
- **Tab with external polyphonic MIDI in.** v1: most-recent note-on with
  2-s repeat-cycle. Some users will want "bass note of held chord" or
  "average pitch." Watch for v1 feedback; refine in v1.5.
- **Moving-ison Byzantine mode** — v1 or v2? v2. PitchHistory infrastructure
  is in v1; rest-tone detection is non-trivial and culturally fraught
  (different protopsalti choose different ison points for the same melody).
- **Drone tempo-sync to a metronome?** Probably no — drone is sustained,
  not rhythmic. The slow tremolo could optionally lock to a BPM. v1.5.
- **Headphone vs. speaker low-shelf adjustment.** v1.5.
- **Drone responds to sustain pedal?** Pressing sustain on an MPE
  controller could freeze the drift and vowel-cycle for a meditative
  pause. v1.5 polish.

---

## Sources

- https://en.wikipedia.org/wiki/Tanpura
- https://en.wikipedia.org/wiki/Jivari
- https://puretones.sadharani.com/learn/tanpuraworking-1/
- https://www.researchgate.net/publication/323935775_Experimental_Investigations_of_Tanpura_Acoustics
- https://www.sciencedirect.com/science/article/abs/pii/S037843712030042X
- http://ppstbulletins.blogspot.com/2011/10/ramans-work-on-musical-instruments.html
- https://www.academia.edu/31586872/Effect_of_the_Position_of_the_Jivari_Threads_on_the_Tanpura_String_Vibrations_A_Quantitative_Study
- https://en.wikipedia.org/wiki/Ison_(music)
- https://analogion.com/site/html/Isokratema.html
- https://leitourgeia.com/2012/01/30/the-ison-problem/
- http://musicinmovement.eu/glossary/ison
- https://www.kelfar.net/orthodoxiaradio/Byzantine/byzmusic.pdf
- https://cappellaromana.org/early-music-america-reveling-in-byzantine-chant/
- https://en.wikipedia.org/wiki/Formant
- https://pmc.ncbi.nlm.nih.gov/articles/PMC6002811/
- https://www.soundbridge.io/formants-vowel-sounds
- https://polyversemusic.com/vowel-formant-cheat-sheet/
- https://www.soundonsound.com/techniques/formant-synthesis
- https://nathan.ho.name/posts/exploring-modal-synthesis/
- https://www.researchgate.net/publication/234138692_Efficient_Modeling_And_Synthesis_Of_Bell-Like_Sounds
- https://www.researchgate.net/publication/224608434_Tubular_Bells_A_Physical_and_Algorithmic_Model
- http://www.dafx17.eca.ed.ac.uk/papers/DAFx17_paper_22.pdf
- https://www.acoustics.asn.au/conference_proceedings/ICA2010/cdrom-ICA2010/papers/p1020.pdf
- https://www.soundonsound.com/techniques/synthesizing-bells
- https://en.wikipedia.org/wiki/Stars_of_the_Lid
- https://larslentzaudio.wordpress.com/2024/02/07/a-study-of-ambient-drone-music/
- https://en.wikipedia.org/wiki/Ross_Daly
- https://labyrinthmusic.gr/en/ross-daly/
- https://en.wikipedia.org/wiki/Cretan_lyra
- https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime
- https://developer.mozilla.org/en-US/docs/Web/API/AudioParam
- https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime
- http://alemangui.github.io/ramp-to-value
- https://www.w3.org/TR/2012/WD-webaudio-20120315/

---

## References

Bor, J. (ed.) (1999). *The Raga Guide: A Survey of 74 Hindustani Ragas.*
Nimbus Records / Rotterdam Conservatory of Music.

Buchanan, D. A. (2007). *Performing Democracy: Bulgarian Music and
Musicians in Transition.* University of Chicago Press.

Carterette, E. C., and Kendall, R. A. (1990). "Comparative Music
Perception and Cognition." In *The Psychology of Music* (D. Deutsch, ed.),
2nd ed., Academic Press, pp. 725–791. Includes acoustic analysis of the
tanpura's jivari spectrum.

Daly, R. (2016). Labyrinth Musical Workshop documentation, Houdetsi,
Crete. The 18-sympathetic-string modified Cretan lyra inspired by tanpura
jivari practice.

Davila, C. (2013). *The Andalusi Music of Morocco: Al-Ala — History,
Society, and Text.* Reichert Verlag.

During, J. (1988). *La musique iranienne: Tradition et évolution.*
Éditions Recherche sur les Civilisations.

During, J., and Mirabdolbaghi, Z. (1991). *The Art of Persian Music.*
Mage Publishers.

Farhat, H. (1990). *The Dastgāh Concept in Persian Music.* Cambridge
University Press. Source for the no-continuous-drone observation in
classical Persian practice.

Feldman, W. (1996). *Music of the Ottoman Court: Makam, Composition and
the Early Ottoman Instrumental Repertoire.* VWB-Verlag.

Fletcher, N. H., and Rossing, T. D. (1998). *The Physics of Musical
Instruments*, 2nd ed. Springer. Ch. 21: bells and tubular bells, source
for the inharmonic-partial structure in §2.2.

Glasser, J. (2016). *The Lost Paradise: Andalusi Music in Urban North
Africa.* University of Chicago Press.

Lingas, A. (2003). "Performance Practice and the Politics of Transcribing
Byzantine Chant." *Acta Musicae Byzantinae* 6, pp. 56–76. Reference for
ison practice and the moveable-ison protocol — the historical precedent
for our Tab-modulation gesture.

Macon, M., and Cook, P. R. (1996). "Tubular Bells: A Physical and
Algorithmic Model." *Proceedings of the International Computer Music
Conference*, ICMA. Modal-synthesis model with inharmonic partials and
per-partial decay times.

Marcus, S. L. (2007). *Music in Egypt: Experiencing Music, Expressing
Culture.* Oxford Global Music Series, Oxford University Press.

Pettan, S. (2010). *Roma Music and Anti-Roma Discourse: Pluralism and
Power in Music Practice.* Routledge.

Racy, A. J. (2003). *Making Music in the Arab World: The Culture and
Artistry of Tarab.* Cambridge University Press.

Raman, C. V. (1922). "On Some Indian Stringed Instruments." *Proceedings
of the Indian Association for the Cultivation of Science* 7, pp. 29–33.
The first systematic acoustic analysis of the tanpura's jivari
nonlinearity and harmonic-pumping spectrum.

Sengupta, R., et al. (2018). "Acoustical Genesis of Uniqueness of
Tanpura-Drone Signal." *Physica A.* Modern empirical analysis of the
jivari spectrum.

Signell, K. (1977). *Makam: Modal Practice in Turkish Art Music.* Asian
Music Publications.

Slawek, S. (2000). "Hindustani Music." In *The Garland Encyclopedia of
World Music, Vol. 5: South Asia* (A. Arnold, ed.), Routledge.

Stamou, L., Mavroeidis, M., et al. (2008). *Journal of the Acoustical
Society of America* EL 124(4). Empirical measurement of Byzantine chanters'
performed intervals.

Stathis, G. (2019). *The Sticheraria of Greek Orthodox Liturgy.* Athens.
Contemporary reference for Greek-Orthodox chant theory and ison practice.

Touma, H. H. (1996). *The Music of the Arabs.* Amadeus Press.

Wade, B. C. (1984). *Khyāl: Creativity within North India's Classical
Music Tradition.* Cambridge University Press. Reference for khayal
performance and the role of the tanpura drone.

PMC 2018: "Static Measurements of Vowel Formant Frequencies and
Bandwidths: A Review." PubMed Central article PMC6002811. Source for the
vowel-formant table in §2.1.

W3C Web Audio Working Group (2024–2026). *Web Audio API specification.*
The current spec for `AudioParam.exponentialRampToValueAtTime` and the
`MIDIOutput.send(data, timestamp)` scheduling primitives.
