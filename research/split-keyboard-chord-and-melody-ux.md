---
title: "Split-Keyboard Chord-and-Melody UX: Lineage and v1 Layout for makam_studio"
audience: "makam_studio designers and front-end engineers; anyone deciding the primary interaction surface, control-zone allocation, mobile collapse, computer-keyboard mapping, and MIDI input split. Read before any layout mockups or interaction prototypes."
tldr: |
  Surveys the Suzuki Omnichord, HiChord, Casio/Yamaha arrangers, the Appalachian autoharp, the Suzuki QChord, NI Komplete Kontrol Scale, Ableton Scale, GarageBand chord strips, Logic Pro Chord Trigger, FL Studio scale highlighting, and continuous-pitch surfaces (LinnStrument, ROLI, Continuum) — then anchors the bimanual model in the Wessel/Wright, Hunt/Wanderley, Jordà, Malloch, and Guiard literature — to argue that makam_studio's v1 should ship a 30/70 horizontal split (vertical on mobile) where the LEFT zone is a maqam-preset grid + karar slider + tradition tabs, and the RIGHT zone is a microtonally re-pitched piano keyboard.
skip_if: "You are working on the audio engine (see web-audio-plucked-string-synthesis.md) or the underlying tuning data model (see tuning-systems-formalization.md). Wave-1 ux-interface-review.md covers maqam apps and microtonal tools generically — this document is specifically about the split-keyboard / chord-and-melody interaction model and is a SUPERSET of the design-direction.md Pivot 2 prose."
date: 2026-04-30
status: draft
---

# TL;DR

- The split-keyboard / chord-and-melody pattern — *one hand chooses what notes are available, the other plays melody within them* — is a 45-year-old, multi-instrument, multi-DAW design pattern; it is the single most-validated bimanual model in commercial music tech.
- Maqam is uniquely well-suited because it is **fixed-tonic + melodic-elaboration**: once karar and maqam are set, the left hand can dwell, exactly the operating mode the autoharp/Omnichord/arranger split assumes. Western tonal music violates this assumption (chord progressions force constant left-hand activity); maqam does not.
- The autoharp's chord-bar is the strongest historical precedent: a chord-bar = "a preset applied to all strings"; strumming = "play within the preset." Re-read this with one substitution: a maqam-button = "a tuning applied to all keys"; pressing keys = "play within the tuning." The mapping is 1:1.
- Anti-patterns to avoid: do **not** mimic the Omnichord's *chord* vocabulary (we want modes, not chords); do **not** mimic the autoharp's *strum* (we want individual key articulation); do **not** mimic the arranger keyboard's *auto-accompaniment* (no drum machine, no backing — that is BeatForge's territory).
- v1 layout (defended in section 11): 30/70 horizontal split on desktop ≥1024px, vertical 50/50 split on mobile <768px, with the left zone hosting tradition tabs → maqam grid → karar slider, and the right zone hosting a 2.5-octave microtonal piano. Long-press on any right-zone key = per-pitch mandal flip. Q-row = preset hotkeys, A-row = melody, on QWERTY. MIDI input below middle-C splits to preset, above splits to melody, with user-configurable split point.
- The ergonomic literature (Guiard's kinematic chain; Wessel & Wright on intimate control; Hunt & Wanderley on multiparametric mapping) supports the asymmetric-bimanual division: left hand sets a slow-changing reference frame, right hand performs the high-bandwidth musical content. This is the same division you find in violin (left hand fingers, right hand bow), guitar (left hand frets, right hand picks), kanun (left hand mandals, both hands pluck), and now: makam_studio (left hand maqam, right hand melody).

---

## 1. Suzuki Omnichord (1981–present)

### Origin and architecture

Suzuki Musical Instruments released the OM-27 in 1981, alongside a sister product called the Tronichord/Portachord. The Omnichord was explicitly aimed at "people without musical experience who might be intimidated by traditional keyboard instruments" — the canonical no-music-theory pitch ([Wikipedia: Omnichord](https://en.wikipedia.org/wiki/Omnichord); [Omnichord-Heaven OM-27](https://www.omnichord-heaven.com/models/om27.html)). The OM-27 had 27 chord buttons, a touch-sensitive strum plate (the *Sonic Strings*), preset drum machine rhythms, and a single "harp" tone. Crucially, the chord buttons sit centrally and the SonicStrings to the right, rotated 90° — establishing the *left = harmonic context, right = articulation* zoning that became a generic UX template.

The OM-36 (1984) expanded to 36 chord shapes, and the OM-84 to 84; the OM-100 / OM-200M (1989) added a 4-octave strum plate, multiple tones (guitar, banjo, jazz organ, flute, organ, chime, brass, vibe, synth), MIDI Out, transpose, and chord memory ([Omnichord-Heaven OM-36/84](https://www.omnichord-heaven.com/models/om36-84.html); [Perfect Circuit Signal](https://www.perfectcircuit.com/signal/suzuki-omnichord-history)).

### The OM-108 reissue (2024)

For Suzuki's 70th anniversary, the OM-108 was released in July 2024 at ~$934 ([Designboom 2024-01-29](https://www.designboom.com/technology/suzuki-omnichord-om-108-electronic-musical-instrument-01-29-2024/); [Gearnews](https://www.gearnews.com/suzuki-omnichord-om-108-hands-on/)). It has 38 chord buttons (major, minor, 7th, maj7, m7, augmented, diminished, sus4, add9), 10 tones (mixing the original analog timbres with PCM harp/celeste/guitar/piano/FM-piano/organ/vibes/banjo), 10 rhythm patterns including a new trap/hip-hop beat, MIDI out, and a layer mode. The reissue is a faithful re-implementation of the OM-84 architecture plus modern conveniences.

### Cultural lineage

The Omnichord's enduring fame comes from its role in indie/alt production. Damon Albarn revealed that the entire instrumental hook of Gorillaz's *Clint Eastwood* (2001) was the Omnichord's "Rock 1" preset, played essentially as-is ([MusicRadar](https://www.musicradar.com/news/damon-albarn-gorillaz-clint-eastwood-omnichord-preset); [DJ Mag](https://djmag.com/news/gorillaz-clint-eastwood-riff-omnichord-preset-damon-albarn-reveals-watch); [EDM.com](https://edm.com/gear-tech/gorillaz-damon-albarn-clint-eastwood-omnichord-preset/)). The Omnichord's signature shimmering chord-pad sound recurs across Albarn's *Plastic Beach* (2010). Phoebe Bridgers performed *Kyoto* on a (Q-)Chord on Jimmy Kimmel Live! during her Punisher era and uses the Suzuki QChord live and in the studio ([Equipboard: Phoebe Bridgers](https://equipboard.com/pros/phoebe-bridgers); [Mixdown gear rundown](https://mixdownmag.com.au/features/gear-rundown-phoebe-bridgers/)).

### Why the Omnichord works

- **Zero music-theory friction.** Press one chord button. The chord appears. There is no minimum competence required.
- **Pleasant idle texture.** Even noodling sounds musical — the chord buttons constrain the harmonic space.
- **Predictable chord-to-strum gesture.** The motor program is stable: hold a chord, swirl on the strum plate. The user's finger never needs to "find" a note.
- **Two-zone layout is grokkable in seconds.** Left selects context, right plays in context.

### Documented criticisms

- Limited harmonic vocabulary (no Neapolitan sixths, no ninths beyond add9, no extended jazz voicings).
- Fixed timbre per tone — no resonance modeling, no per-string articulation.
- No microtuning of any kind — purely 12-TET.
- The chord buttons enforce *vertical harmonic stacking*, which is Western-tonal and not what maqam needs.

The Omnichord's chord-pad metaphor is the most influential piece of consumer-music UX of the last 45 years. **For makam_studio, we adopt the spatial division (left context / right articulation) and reject the chord vocabulary itself.**

## 2. HiChord (Pocket Audio / DOMO, 2024–2026)

The HiChord is a recent indie-synth re-imagining of the Omnichord idea, built on the Electrosmith Daisy platform and developed by Pocket Audio (the project went live on Kickstarter in 2024 and shipped through several batches into 2025–26) ([HiChord Kickstarter](https://www.kickstarter.com/projects/hichord/hichord-pocket-chord-synthesizer); [Synth Anatomy 2025-10](https://synthanatomy.com/2025/10/pocket-audio-hichord-a-pocket-sized-chord-machine.html); [Yanko Design 2025-09-11](https://www.yankodesign.com/2025/09/11/hichord-pocket-synth-makes-music-creation-effortless/); [Electrosmith blog](https://electro-smith.com/blogs/seeds-n-circuits/daisy-in-the-wild-hichord)).

### Architecture

- **Seven chord buttons** (not 36/84) mapped diatonically using the **Nashville Number System** in the user's chosen key. Press button 1 for the I, 2 for the ii, etc. The vocabulary is automatically in-key.
- **Joystick** for real-time chord modifications: shift major↔minor, add sus, extend with 7/9. The joystick replaces the "and which voicing?" decision with a continuous gestural axis.
- **Four sound engines**: analog waveforms, FM, real-instrument samples, hybrid layers.
- **Built-in microphone** for sampling; sampled material gets pitched to the chord-button choice.
- **882 built-in chords**; integrated drum machine and looper; MIDI out; USB-C.

### Design lessons

- **Diatonic-by-default beats chromatic-by-default.** The Omnichord exposed all 84 chord types and made the user pick the right one. The HiChord exposes seven *in-key* slots, which is enough for most Western pop. Direct analogue for makam_studio: don't show all 100+ maqams flat — filter by tradition, then present 12–24 high-traffic ones, with deeper catalog one tap away.
- **A modulator joystick wrapped around a discrete grid** is more expressive than either alone. Maqam analogue: a karar *slider* (continuous chromatic transposition) wrapped around the discrete *maqam grid*.
- **Pocket-sized still wants two zones.** Even at HiChord's <100×60mm form factor, the design preserves a left/right division.

## 3. Casio CT-S1000V and arranger keyboards generally

### Auto-chord lineage

Single-finger / fingered chord modes have been built into virtually every consumer arranger keyboard since the late 1980s. The user designates a *split point* on the keyboard — typically C3 or below — and presses 1–3 keys in the chord zone; the system fills in a full chord and triggers the auto-accompaniment, while the right hand plays unconstrained melody above the split.

The Casio CT-S1000V offers six fingering modes: *CASIO Chord*, *Fingered 1*, *Fingered 2*, *Fingered On Bass*, *Fingered Assist*, *Full Range* ([Casio CT-S1000V product page](https://www.casio.com/us/electronic-musical-instruments/brands/casiotone/cts1000v/); [Casio CTK manual](https://www.manualslib.com/manual/595359/Casio-Ctk-6200.html?page=28); [Sand Software Sound tips](https://sandsoftwaresound.net/casio-ct-s1000v-quick-tips/)). The split point is user-configurable in the Settings menu.

Yamaha's PSR series mirrors this with *Single Finger*, *Fingered*, *Fingered On Bass*, *Multi Finger*, *AI Fingered*, *Full Keyboard*, and *AI Full Keyboard* modes, plus the new *Smart Chord* on the SX900/SX920/SX720 that recognises tonic/dominant relationships from one-key input ([PSR Tutorial fingering](https://psrtutorial.com/lessons/start/s50_fingering.html); [Yamaha FAQ U0002033](https://faq.yamaha.com/usa/s/article/U0002033); [Yamaha PSR-SX920 product page](https://usa.yamaha.com/products/musical_instruments/keyboards/arranger_workstations/psr-sx920/index.html)). Korg PA, Roland EA-7, and Wersi all ship variations on the same idea.

### The "amateur enabler" framing

Arranger keyboards are explicitly designed for solo entertainers, hobbyists, and worship-band keyboardists who don't have a pianist's two-handed independence. The split-point + auto-fill enables a credible-sounding performance from a player who can manage one-finger left-hand input and modest right-hand melodies. It's the bar for "what counts as approachable" in mass-market keyboard design.

### Convention notes for makam_studio

- A user-set split point is a near-universal expectation in the keyboard space. We should expose one for MIDI input.
- C3 / middle-C-and-below is the conventional default. Hardware keyboardists' fingers will look for it there.
- Auto-accompaniment / drum-machine integration is **not** something we replicate. BeatForge owns rhythm; makam_studio is melodic.

## 4. Appalachian autoharp

### The closest historical precedent

The autoharp is the *exact* historical analogue of what we are building. A 21-bar autoharp has 21 chord-bar levers; pressing a chord-bar mutes every string *except* those that belong to the chord, leaving an in-chord palette. The player then strums (or fingerpicks) across the entire string array — every audible string is automatically correct ([Wikipedia: Autoharp](https://en.wikipedia.org/wiki/Autoharp); [Dresslands history](https://dresslands.com/autoharp/); [Harpers Guild chord-bar layouts](https://harpersguild.com/autoharp_tweaking/folk_friendly/chord_layouts.pdf)).

Substitute *maqam* for *chord* and *retune* for *mute* and you have makam_studio. **The autoharp says "given a chord, here are the strings that survive." makam_studio says "given a maqam, here are the pitches the keys produce."** The architectural symmetry is striking.

### The players

- **Maybelle Carter** brought the autoharp to prominence as a *lead* (not just rhythm) instrument with the Carter Family in the late 1940s ([Pasadena Folk Music Society](https://pasadenafolkmusicsociety.org/autoharp-traditional-singing-and-stories-of-bryan-bowers-on-saturday-may-30/)).
- **Bryan Bowers** developed a five-finger right-hand technique allowing simultaneous bass, chord, melody, and counter-melody — the "father of modern autoharp playing" ([California Autoharp Gathering 2026 bio](https://calautoharp.com/bryan-bowers/); [Autoharp Talk forum](http://autoharpworks.com/phpbb/viewtopic.php?t=52)).
- **Roy Acuff** popularised the instrument earlier in country/Grand-Ole-Opry contexts.
- The "Bryan Bowers" chord-bar layout (majors centre row, V7 directly under the ring finger, relative minor in bass row directly below) is one of the most influential ergonomic designs in folk-instrument history. It put the *commonest harmonic motion* under the most efficient finger geometry.

### Chord-bar layouts

The 21-bar autoharp typically arranges its bars in three rows. The "Bryan Bowers" layout was a re-allocation that prioritised V7-resolution gestures. **Different autoharps have radically different bar arrangements** (15-bar diatonic, 21-bar, 27-bar chromatic, "Prizim" experimental layouts) and players choose based on the keys they live in ([Hal Weeks PRIZIM](https://halweeks.com/whats-a-prizim); [Wendy Grossman autoharp guide](https://www.pelicancrossing.net/autoharp.htm)). **Lesson:** the *layout itself* should be customisable. makam_studio should allow users to reorder their maqam-button grid and save the layout.

### The scholarship

Becky Blackley, *The Autoharp Book* (1983, IAD Publications, 256pp, ISBN 0912827017), is the comprehensive history. From 1980–93 Blackley edited *The Autoharpoholic*, an international journal dedicated to the instrument; her research collection is now archived at UNC Chapel Hill ([UNC finding aid](https://finding-aids.lib.unc.edu/catalog/20282); [Goodreads listing](https://www.goodreads.com/book/show/5099628-the-autoharp-book)). The journal *Autoharp Quarterly* (Mary Lou Orthey, 1988–) is the ongoing community of practice.

## 5. Suzuki QChord QC-1 (1999–present)

The QChord is Suzuki's 1999 successor to the Omnichord. Three-section layout: touch-sensitive strum plate, rhythm section, chord-button section ([Vintage Synth Explorer](https://www.vintagesynth.com/suzuki/qchord_QC-1); [Equipboard QC-1](https://equipboard.com/items/suzuki-qc-1-qchord); [Suzuki QChord manual PDF](https://www.omnichord-heaven.com/downloads/manuals/qchord-manual.pdf)).

Specs: 84 chord combinations, 100 instrument voices, pitch-bend wheel, MIDI out on twelve channels (melody on 1, Chord Plus on 3–4, Strumplate on 14–16 — notoriously hairy to filter into a DAW), expansion-slot for QCard song cartridges. Less culturally famous than the Omnichord but functionally a strict superset.

The earlier OM-300 (Suzuki, mid-1990s) introduced a chord *sequencer* — the user records a progression and steps through it with a single button, so even the chord-selection load is offloaded. Phoebe Bridgers's specific instrument is the QChord, not the OM-X-series Omnichord ([Mixdown gear rundown](https://mixdownmag.com.au/features/gear-rundown-phoebe-bridgers/)).

**Lesson for makam_studio:** if v3 ever introduces a "play through this seyir progression" feature (a sequencer of karar/maqam states), it has direct precedent in the QChord and OM-300.

## 6. Software / DAW patterns

### Native Instruments Komplete Kontrol "Scale" mode

NI's Smart Play / Scale system locks the keyboard to over 100 scales and modes ([NI A-Series quickstart](https://www.native-instruments.com/en/a-series-quickstart/using-smart-play/); [NI Komplete Kontrol manual: scales](https://www.native-instruments.com/ni-tech-manuals/komplete-kontrol-manual/en/using-scales-and-the-arpeggiator); [ADSR Sounds tutorial](https://www.adsrsounds.com/komplete-kontrol-tutorials/komplete-kontrol-mk2-scale-chord-explained/); [MusicRadar tutorial](https://www.musicradar.com/how-to/how-to-use-the-komplete-kontrol-s-midi-keyboards-scale-mode)). It exposes three modes:

- **Easy mode**: scale notes mapped to the *white keys only*; black keys silent. Any selected scale can be played using only white keys. Maximum guard rails.
- **Mapped mode**: scale notes mapped at expected positions; if you press a wrong (out-of-scale) note, Komplete Kontrol shifts it to the closest in-scale pitch. Notes still come from anywhere on the keyboard, but you can't play a wrong one.
- **Guide mode**: scale notes are *illuminated* via the keyboard's RGB lighting; nothing is forced. Best for practising.

The three modes form a spectrum: Easy (compress), Mapped (correct), Guide (visualise). makam_studio should expose all three. **Per-pitch microtonal retuning is the makam analogue of "scale-note" mapping** — but with the additional dimension that the pitches themselves shift, not just which notes are silent.

### Ableton Live Scale device + Live 12 Scale Awareness

Ableton's Scale MIDI effect snaps incoming notes to a chosen scale. Live 12 (2024) deepened this: scale-aware MIDI tools now treat pitch parameters in *scale degrees* rather than semitones, and the global scale of a clip propagates to randomisers, voicing tools, and pitch shifts ([Ableton: Keys and Scales FAQ](https://help.ableton.com/hc/en-us/articles/11425083250972-Keys-and-Scales-in-Live-12-FAQ); [Ableton MIDI Tools](https://www.ableton.com/en/live-manual/12/midi-tools/); [Ableton: MIDI Tools FAQ](https://help.ableton.com/hc/en-us/articles/11535349458588-MIDI-Tools-and-Device-Updates-in-Live-12-FAQ)). **The DAW industry has converged on "scale is a first-class authoring concept."**

### GarageBand iPad — chord strips

GarageBand's iPad Smart Strings/Smart Guitar/Smart Bass instruments expose a vertical *chord strip* per chord. Touch the top to play the full chord; swipe down to strum; tap individual strings for note articulation; touch-and-hold-then-swipe-vertically on Smart Strings for bow articulation with velocity from speed ([Apple Support: Strings](https://support.apple.com/guide/garageband-ipad/play-the-strings-chsf2f99a20/ipados); [Apple Support: Custom Chords](https://support.apple.com/guide/garageband-ipad/add-custom-chords-chsab9d1c4c/ipados); [Apple Support: Guitar](https://support.apple.com/guide/garageband-ipad/chs39282a88/ipados); [Midnight Music GarageBand Chords](https://midnightmusic.com/2019/06/garageband-chords-how-smart-instruments-helped-my-kids-grasp-music-theory/)). The Chord wheel UI lets users build custom chord sets per song, swiping for root/quality/extension/bass.

### Logic Pro for iPad — Chord Trigger MIDI plug-in

Logic's Chord Trigger plug-in offers Single Chord Mode (memorise one chord, transpose by trigger key — the classic chord-memo synth pattern) and Multi Chord Mode (assign a different chord per key) ([Apple Support: Chord Trigger overview](https://support.apple.com/guide/logicpro-ipad/chord-trigger-overview-lpipdcde4fee/ipados); [Apple Support: Chord Trigger usage](https://support.apple.com/guide/logicpro-ipad/use-tips-lpip768c92e5/ipados)). Range controls let users define a *trigger zone* — a software split-point — separate from the playing zone. Smart Tempo handles tempo detection orthogonally.

### FL Studio — Stamping Chord + Scale Highlighting

FL Studio's piano roll combines two ideas: *chord stamps* (drop a major/minor/7/9/11/13/sus2/sus4/add9 chord with one click) and *scale highlighting* (tell the piano roll your key/scale, dim out-of-scale rows, optionally enable Snap-to-Scale to force every drawn note in-key) ([Audeobox shortcuts guide](https://www.audeobox.com/learn/fl-studio/fl-studio-piano-roll-shortcuts-guide/); [Audeobox piano roll guide](https://www.audeobox.com/learn/fl-studio/how-to-use-the-piano-roll-in-fl-studio/); [EDMProd tips](https://www.edmprod.com/fl-studio-piano-roll/)). FL's idiom is closer to a sequencing-grid than a live keyboard, but the design philosophy is identical: separate harmonic-context selection from per-note placement.

### iOS apps: Animoog, Animoog Z, ThumbJam

ThumbJam is the strongest scale-locked iOS instrument — hundreds of bundled scales, *Input Scale Lock* forces incoming MIDI to the active scale, with adjacent white keys playing adjacent in-scale notes; it imports Scala (.scl) files for microtonal coverage ([ThumbJam App Store](https://apps.apple.com/us/app/thumbjam/id338977566); [Loopy Pro forum: industry standard scales](https://forum.loopypro.com/discussion/45496/industry-standard-scales)).

Animoog (2011) introduced a configurable touch-keyboard with scale-locking; Animoog Z (free, 2021–) ships customizable scales, key distances, pitch correction, and glide ([App Store: Animoog Z](https://apps.apple.com/us/app/animoog-z-synthesizer/id1586841361); [Engadget Animoog Z review](https://www.engadget.com/moog-animoog-z-i-os-softsynth-music-app-170019893.html); [TapSmart classic-app coverage](https://www.tapsmart.com/apps/the-classic-app-animoog/)). The original Animoog's framing — "you can't play a wrong note" — is the marketing crystallisation of the scale-lock idea.

## 7. MPE / continuous-pitch controllers

### LinnStrument, ROLI Seaboard, Continuum

The MPE family treats the playing surface as a 2-D continuous field with X = pitch, Y = timbre (often), Z = pressure/amplitude. **Their relationship to scale-mode UX is instructive: most don't have one in any strong sense.** The instruments are designed for free-pitch playing — vibrato, glides, microtonal melismas, pitch-bend.

The exception is the **LinnStrument**, which lights its pads in user-customisable scale colors with all-C-pads in an accent color ([Roger Linn: panel settings](https://www.rogerlinndesign.com/support/linnstrument-support-panel-settings); [Roger Linn: chord and scale shapes](https://www.rogerlinndesign.com/support/support-linnstrument-chord-and-scale-shapes); [LinnStrument community wiki](https://linnstrument.miraheze.org/wiki/Software); [Ben Fuhrman LED controls](https://benfuhrman.com/linnstrument-led-controls/)). Out-of-scale pads can be coloured "off" (unlit), which is the exact UX precedent for "fade out non-maqam pitches" in the qanun-honor mode. The LinnStrument's Row Offset can also be set to any value −16..+16, so even-row vs odd-row tunings can produce quarter-tone overlays — a hardware-side proof that mixed-tuning row layouts are playable ([Roger Linn LinnStrument FAQ](https://www.rogerlinndesign.com/support/support-linnstrument-faqs); [KVR LinnStrument microtonal](https://www.kvraudio.com/forum/viewtopic.php?t=440695)).

The **ROLI Seaboard** has been hacked into a 31-EDO microtonal split-key surface by community projects (e.g. euwbah/microtonal-seaboard on GitHub); its Glide dimension is pure pitch-bend, so the keyboard becomes a ney/oud-like continuous pitch surface when scale mode is off ([ROLI Seaboard Wikipedia](https://en.wikipedia.org/wiki/ROLI_Seaboard); [microtonal-seaboard GitHub](https://github.com/euwbah/microtonal-seaboard); [ROLI Support: MPE](https://support.roli.com/en/support/solutions/articles/36000027933-what-is-mpe-)).

The **Haken Continuum** is a true continuous-pitch fingerboard — X is pitch, Y is timbre, Z is amplitude, tracked per-finger by Hall-effect sensors. The EaganMatrix synth engine treats every patch parameter as targetable from any axis ([Continuum Fingerboard Wikipedia](https://en.wikipedia.org/wiki/Continuum_Fingerboard); [Haken Audio Continuum page](https://www.hakenaudio.com/continuum); [EaganMatrix presets PDF](https://s9.imslp.org/files/imglnks/usimg/5/5c/IMSLP433900-PMLP705301-EaganMatrix_Presets_for_the_Haken_Continuum_-_Keyboard.pdf)). The Continuum is the closest thing to a digital ney — and its *absence* of scale-lock is itself a design statement.

### Lessons for makam_studio

- For ney/oud emulation (a future v2 voice), continuous pitch is the right surface; LinnStrument-style "fade out-of-scale pitches but allow continuous gestures between them" is a strong middle-ground.
- For qanun emulation (v1 voice), discrete pre-tuned pitches are correct — a qanun *is* a fixed-pitch instrument once the mandals are set.
- The split between "discrete keyboard for qanun voice" and "continuous surface for ney voice" should map cleanly to the layout-mode toggle: the right zone is one or the other, not both at once.

## 8. Academic / NIME literature on bimanual modal-input music interfaces

### Wessel & Wright (2002) — the foundational frame

David Wessel and Matt Wright, "Problems and Prospects for Intimate Musical Control of Computers," *Computer Music Journal* 26(3):11–22, originally NIME 2001 ([CNMAT PDF](https://cnmat.berkeley.edu/sites/default/files/attachments/2002_problems-and-prospects-for-intimate-musical-control-of-computers.pdf); [MIT Press CMJ](https://direct.mit.edu/comj/article-abstract/26/3/11/94758/Problems-and-Prospects-for-Intimate-Musical); [arXiv 2010.01570](https://arxiv.org/abs/2010.01570)). Their three design criteria for a digital instrument — (1) initial ease of use coupled with long-term virtuosity potential; (2) minimal and low-variance latency; (3) clear strategies for mapping gesture to musical result — are precisely the criteria a chord-and-melody UI must meet. The Omnichord scores high on (1) and (3) but is a closed cul-de-sac for (1)'s second clause: there is no virtuosity ceiling. makam_studio's qanun-honor mode + per-pitch overrides exists exactly to create that ceiling.

### Hunt, Wanderley, Kirk — the multiparametric mapping tradition

Andy Hunt and Marcelo Wanderley's "The Importance of Parameter Mapping in Electronic Instrument Design" (NIME 2002, *Organised Sound* 7:2) and "Towards a Model for Instrumental Mapping in Expert Musical Interaction" (ICMC 2000) showed empirically that *complex, multiparametric, energy-coupled mappings* beat *one-parameter-per-control mappings* on long-term musical engagement, even though the latter is faster to learn ([Hunt & Wanderley researchgate](https://www.researchgate.net/publication/243774325_Mapping_Strategies_for_Musical_Performance); [Towards a Model PDF](http://recherche.ircam.fr/equipes/analyse-synthese/wanderle/Gestes/Externe/Hunt_Towards.pdf); [Mapping performer parameters to synthesis engines](https://web.media.mit.edu/~rebklein/downloads/papers/Organised%20Sounds%20V7-n2/02-%20Mapping%20performer%20parameters%20to%20synthesis%20engines.pdf)). The implication for our split layout: the *left zone* (preset selection) can have a simple one-control-per-action mapping (clear); the *right zone* (melody) should support multiparametric coupling (velocity → both volume and timbre; long-press → mandal-flip; release-time → damping) for virtuosity headroom.

### Jordà — the Reactable and tabletop tangibles

Sergi Jordà (with Kaltenbrunner, Geiger, Alonso) developed the Reactable at Universitat Pompeu Fabra's MTG, presented at NIME and ICMC 2005 ([Reactable Wikipedia](https://en.wikipedia.org/wiki/Reactable); [UPF MTG page](https://www.upf.edu/web/mtg/reactable); [ACM TEI 2007](https://dl.acm.org/doi/10.1145/1226969.1226998); [ACM CACM 2010](https://dl.acm.org/doi/10.1145/1753846.1753903)). The Reactable's bimanual model assigns *both hands continuous, equal-status manipulation roles*. This is symmetric bimanual — interesting as a contrast: makam_studio is *asymmetric* bimanual (left = slow context, right = fast articulation).

### Malloch — DMI ergonomics

Joseph Malloch's T-Stick papers (NIME 2007, NIME 2021) document the multi-year process of moving a DMI from "interface" to "instrument" via repertoire, technique transmission, and sustained performer practice ([NIME 2007 PDF](https://www.nime.org/proceedings/2007/nime2007_066.pdf); [NIME 2021 T-Stick community pub](https://nime.pubpub.org/pub/7c4qdj4u/release/1); [IDMIL T-Stick page](https://www.idmil.org/project/the-t-stick/)). The lesson for makam_studio is that the qanun *already has* a 1000-year repertoire and a transmissible technique — we do not need to invent one. We need to make our digital surface *legible* to that lineage.

### Bimanual-action theory: Yves Guiard

Outside NIME, Yves Guiard's "Asymmetric Division of Labor in Human Skilled Bimanual Action: The Kinematic Chain as a Model" (*Journal of Motor Behavior* 19:486–517, 1987) is the foundational HCI/ergonomics reference for two-handed input ([Semantic Scholar](https://www.semanticscholar.org/paper/Asymmetric-division-of-labor-in-human-skilled-the-a-Guiard/02577799e42ca27be18e0d37476b658f552b5be3); [Xu et al. 2007 Springer](https://link.springer.com/chapter/10.1007/978-3-540-73333-1_44); [DGP Toronto Balakrishnan](https://www.dgp.toronto.edu/~ravin/papers/chi2000_symmetricbimanual.pdf)). Guiard's three principles for asymmetric bimanual skill:

1. **Right hand operates within a frame set by the left.** (Painter's left hand holds the canvas; right hand paints. Violinist's left hand stops the string; right hand bows. Qanun player's left hand sets mandals; both hands pluck — but with the left-hand override authority preserved.)
2. **Left hand precedes right.** (Set the frame *first*, then act within it. In maqam_studio: select karar+maqam *first*, then play melody.)
3. **Left hand operates at coarser scales of space and time.** (Slow, large movements. The maqam-button grid lives at this temporal scale; the keyboard at the fine-motor scale.)

This is a *clean* fit for our design. The split-keyboard pattern is a hardware crystallisation of Guiard's kinematic chain.

### Jane Davidson — performance ergonomics

Jane Davidson's *MoMM* / *Psychology of Music* corpus (in particular her 2001 "Meaningful musical performance: A bodily experience" with Salgado Correia, and 2012 "Bodily movement and facial actions in expressive musical performance" in *Psychology of Music*) treats musical performance as a whole-body bodily skill, and shows that even monomanual instruments produce structured bilateral postural patterns ([SAGE: Davidson 2012](https://journals.sagepub.com/doi/full/10.1177/0305735612449896); [SAGE: Davidson & Correia 2001](https://journals.sagepub.com/doi/10.1177/1321103X010170011301); [Taylor & Francis: Body in Performance](https://www.taylorfrancis.com/chapters/edit/10.4324/9781315095509-6/body-performance-eric-clarke-jane-davidson)). Her work supports the idea that *the bilateral interface is felt as a single integrated bodily motion*, not as two independent sub-tasks. Implication: latency between left-zone and right-zone updates must be inaudible (<10ms) — they are perceived as one gesture.

## 9. The mandal-as-chord-button mapping for makam_studio

This is the load-bearing design move. We re-read every UX precedent through the substitution:

| Source instrument | "Chord button" means | "Strum / play" means | makam_studio analogue |
| --- | --- | --- | --- |
| Omnichord | A chord (set of pitches) plays | Strum-plate articulates them | Maqam-button retunes the keyboard; keys articulate |
| Autoharp | A chord-bar mutes non-chord strings | Strum across surviving strings | Maqam-button retunes all keys; strike keys |
| Arranger keyboard | Single-finger chord triggers full chord | Right-hand melody plays freely | Single button retunes keyboard; right-hand melody plays freely |
| Komplete Kontrol Mapped | Scale forces correction of out-of-scale notes | All keys remain useful | Maqam *retunes* keys (continuous, not corrected) |

The crucial differences are two:

1. **The maqam-button does not play notes.** Pressing it is *silent*; it changes the *available* pitches for subsequent right-hand presses. (The Omnichord chord-button plays the chord as a sustained pad; the autoharp chord-bar is silent until you strum. We follow the autoharp.)
2. **The "mute" or "scale-correct" operation is replaced by *continuous-pitch retuning*.** Each key in the right zone *plays* under all maqams, but with different microtonal cents values per maqam. There are no "missing" notes; instead, the pitch lattice deforms.

This second difference is what makes maqam_studio *not* a scale-mode app. We are not asking "is this note in the scale?" — we are asking "given this maqam, what cents value does this key produce?" The whole keyboard remains live.

### Power-user mode: per-pitch mandal flips

A Turkish qanun player flips individual mandals mid-melody to chromaticise a passing tone or to modulate to an adjacent maqam without retuning the whole instrument. We map this to:

- **Long-press (~500ms hold)** on any right-zone key opens a small per-pitch radial menu offering the available mandal positions for that pitch under the current tradition. Selecting one re-pitches that single key.
- **Per-string editor strip** — a horizontally scrollable advanced drawer below the main right zone showing every pitch's current cents value, with sliders, in qanun-honor mode.

This preserves the mandal-flip *gesture vocabulary* while letting the default behavior remain piano-like.

## 10. Two-hand ergonomics — the body of the player

Real qanun players pluck with alternating index fingers (both hands), and use the left hand mid-melody for mandal flips; right-hand-only plucking is also common. The instrument itself is *reentrant* in left-hand use: the left hand both plucks (alongside the right) and steers (mandals). Our digital version is naturally inverted because we are not constrained by a 1m-wide trapezoid: the left hand becomes purely a controller, and both hand zones are dedicated.

### Why this works ergonomically

Per Guiard's kinematic chain (Section 8): the right hand is the high-bandwidth motor at the leaf of the chain; the left hand at the coarser-scale parent. In keyboard-style UIs the right hand is conventionally the dominant for melody (matched to most users' handedness statistics) and the left hand handles slower context. **Left-handed users** should be supported via a layout flip (mirror the split: preset right, melody left).

### Latency budget

Davidson's bilateral-experience finding (Section 8): the two hands feel like one motion. The left-zone press → right-zone tuning update path must complete within audible latency (<10 ms; ideally <5 ms inside the audio engine, with the UI optimistically updating in parallel). This is achievable in pure Web Audio with AudioWorklet-side parameter ramping.

### Mobile two-thumb model

On mobile portrait, the two hands become two thumbs (or one thumb + one finger). The 50/50 vertical split below maps to: thumb on left hand controls preset selection (top half), thumb on right hand controls melody (bottom half). This is exactly the GarageBand iPad chord-strip ergonomics.

## 11. A proposed v1 split-keyboard layout for makam_studio

Below is the recommended v1 layout, defended.

### Desktop (≥1024px wide)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [makam_studio]  [Practice] [Studio] [Library]   [⚙] [?] [About]   <-- 48px │ <- top chrome
├──────────────────────────────────────────────────────────────────────────────┤
│ [ TR · AR · FA · + ]                                                          │ <- tradition tabs (40px)
├────────────────────────────────────┬─────────────────────────────────────────┤
│ LEFT ZONE                          │ RIGHT ZONE                              │
│ (~30% width, ≈384px @1280)         │ (~70% width, ≈896px @1280)              │
│                                    │                                         │
│ MAQAM GRID                         │  [Octave -]   [Octave +]                │
│ ┌────┬────┬────┬────┐              │                                         │
│ │Rast│Hijaz│Saba│Bayati│           │  (microtonal piano, 2.5 octaves)        │
│ ├────┼────┼────┼────┤              │  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─...        │
│ │Niha│Kürdi│Karci│Hüzz │            │  │ │ │ │ │ │ │ │ │ │ │ │ │ │           │
│ ├────┼────┼────┼────┤              │  │ │ │ │ │ │ │ │ │ │ │ │ │ │           │
│ │Segâh│Hüseyni│Uşşak│...│           │  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─...        │
│ └────┴────┴────┴────┘              │                                         │
│  16 pads (4×4) for v1, 24 (6×4)    │  Each key labelled: perde + Western    │
│  for advanced view                 │  + (cents on hover)                     │
│                                    │                                         │
│ KARAR SLIDER                       │  Velocity = press strength (MIDI) /     │
│ [ ◄ A♭ B♭ C D E F G ► ]            │            keystroke duration (QWERTY)  │
│                                    │                                         │
│ [ Per-string overrides ▾ ]          │  Long-press = mandal-flip menu          │
│                                    │                                         │
│ [Layout: Default | Single | Qanun] │                                         │
└────────────────────────────────────┴─────────────────────────────────────────┘
   (2 zones; vertical separator is a 1px coral line; left zone has soft gray bg)
```

#### Left zone breakdown (≈384px wide @1280 viewport)

- **Tradition tabs** (40px tall): Turkish (TR), Arabic/Levantine (AR), Persian (FA), and a `+` placeholder for Egyptian/Azeri/Shashmaqam in v2. Active tab is coral; others are warm gray.
- **Maqam grid** (~280×280px): 4×4 grid of 88px-square pads in v1 (16 pads = the most-played maqams within the active tradition); long-press the grid header to open a 6×4 expanded grid (24 pads), a "Full catalog…" search drawer, and a "Customize this layout…" reorder mode (autoharp-layout precedent).
  - Each pad shows the maqam name in tradition-correct script (Vazirmatn for Persian, IBM Plex Sans Arabic for Arabic, Inter for Turkish/transliteration), with a small color-coded jins-family chip in the corner.
  - Tap = activate (instant retune of right zone, brief animated highlight, optional click sound).
  - Active pad: filled with coral; others: light gray fill, dark text.
  - 88×88 hit target comfortably exceeds the 44×44 WCAG/Apple HIG minimum and the 48×48 Material 3 target.
- **Karar slider** (full width × 56px): horizontal chromatic strip showing the 12 chromatic karars (or 17 if Turkish-AEU is selected — the wider tab' choices), with the active karar highlighted. Tap the strip to set; drag to scrub. A small text readout to the right shows "Hijaz on D" / "Hijaz fî Re" depending on language preference.
- **Per-string overrides** (collapsible): a `▾` drawer that, when open, exposes every pitch in the current maqam with its current cents value and a slider/button row for available mandal flips. Closed by default.
- **Layout-mode toggle** (icon group, 32×32 each): three states — *Default* (this 30/70 split), *Single* (hide left, expand right to 100%), *Qanun-honor* (replace right with literal trapezoid view).

#### Right zone breakdown (≈896px wide @1280)

- **Octave-up / octave-down chrome** (top-right, 32×32 each).
- **The keyboard itself**: 2.5 octaves visible by default (≈18 white keys + black-key analogues, accounting for microtonal accidentals). Total visible pitches in a typical 24-tone Turkish maqam range: ~21 keys per octave × 2.5 = ~52 keys.
- **Key dimensions**: 48px wide × 240px tall for white-equivalent keys; black-equivalent (microtonal accidentals) 32px × 144px stacked, in the standard piano arrangement but with non-12-EDO cents values.
- **Key labels**: each key shows perde name (top, larger), Western letter equivalent (middle, smaller), and cents-from-12-EDO (bottom, hover-only). Microtonal accidental glyphs (½♭, koron, sori, AEU comma marks) render in coral.
- **Velocity**: MIDI input passes through; QWERTY input maps to a fixed velocity (configurable). Touch screens use Pointer Events `pressure` where available.
- **Long-press (≥500ms)**: opens a per-pitch radial mandal-flip menu (this pitch's available cents alternatives in the current tradition).
- **Sustain**: a foot-pedal or spacebar toggle (off by default in v1).

### Mobile (portrait, <768px wide)

```
┌────────────────────────┐
│ [makam_studio]   [⚙]   │
├────────────────────────┤
│ [ TR · AR · FA · + ]    │
├────────────────────────┤
│ MAQAM GRID (top half)  │
│ ┌──┬──┬──┬──┐          │
│ │  │  │  │  │          │
│ ├──┼──┼──┼──┤          │
│ │  │  │  │  │          │
│ └──┴──┴──┴──┘          │
│ [ Karar:  C  ▼ ]        │
│ [ ◄ chromatic strip ► ]│
├────────────────────────┤
│ KEYBOARD (bottom half) │
│ ┌─┬─┬─┬─┬─┬─┬─┬─┬─...  │
│ │ │ │ │ │ │ │ │ │      │
│ └─┴─┴─┴─┴─┴─┴─┴─┴─...  │
│  1.5 octaves visible    │
│  swipe to scroll octave │
└────────────────────────┘
```

- **50/50 vertical split** (the GarageBand chord-strip pattern). Top half: maqam grid (4×4) + karar slider. Bottom half: 1.5 octaves of microtonal piano.
- **Two-thumb ergonomics**: left thumb on top half, right thumb on bottom half.
- **Pinch on the keyboard zone**: zoom in (1 octave) / out (2 octaves max on mobile).
- **Swipe horizontally** on the keyboard zone: scroll octave.
- **Layout toggle** lives in the gear menu (`⚙`) on mobile; single-surface mode hides the maqam grid and expands the keyboard to the full screen, with a floating "M" button to summon the maqam picker as a bottom sheet.

### Computer-keyboard mapping (no MIDI)

This is critical for users without hardware. The mapping mirrors the layout: top rows = preset (left-zone analogue), bottom rows = melody (right-zone analogue).

| QWERTY zone | Function | Notes |
| --- | --- | --- |
| `1` `2` `3` `4` | Tradition tabs (TR / AR / FA / +) | One-press tradition switch |
| `q w e r t y u i` | Maqam grid row 1 (8 pads) | Top row of grid |
| `Q W E R T Y U I` (shift) | Maqam grid row 2 | Second row |
| `Tab` | Toggle between row 1 and row 2 of grid | Quick access without shift |
| `← → ↑ ↓` | Karar slider step / octave | Left/right = chromatic; up/down = octave |
| `a s d f g h j k l` | Melody, white-equivalent keys (lower octave) | a = lowest visible degree, l = 9 keys up |
| `z x c v b n m` | Melody, lower-octave continuation | 7 more keys |
| `w e t y u o p` (alt-layer) | Microtonal accidentals if activated by `Caps` | Black-equivalent |
| `Space` | Sustain | Hold for sustain |
| `Shift + click` on any melody key | Mandal-flip menu | Discoverable via tooltip |
| `⌘+1..9` / `Ctrl+1..9` | Quick-recall preset slot | LinnStrument-style 9 favourite-tunings |

### MIDI input

- **Default split point**: MIDI note 60 (middle C). Notes ≤59 → preset zone (one-finger maqam selection, indexed by chromatic position within the active tradition's catalog), notes ≥60 → melody zone.
- **User-configurable** in settings, mirroring Casio/Yamaha convention.
- **MIDI velocity**: passed through to right zone; ignored in left (a maqam press is binary).
- **MIDI sustain (CC64)**: passed through to right zone.
- **MIDI program change**: maps to maqam preset index.
- **Optional "perde-keyed" mode**: maps each MIDI key to a fixed perde-name (so a hardware controller's C key always plays "Rast" in Turkish), independent of the active maqam — for muscle-memory continuity.

### What the layout deliberately is *not*

- **Not a chord pad.** No major/minor/7/9 vocabulary on the left. The Omnichord's chord buttons are wrong for maqam.
- **Not a strum surface.** No multi-string articulation gesture by default. The right zone is per-key, like a piano. (Qanun-honor mode opens up the literal harp-stroke; default mode does not.)
- **Not an arranger.** No drum machine; no auto-bass; no chord progression engine. These are BeatForge's domain.
- **Not a free-pitch fingerboard.** The default right zone is discrete keys; users wanting continuous pitch can opt into a future ney/oud voice mode (post-v1).

---

## Implications for makam_studio

The split-keyboard chord-and-melody mode is the **default for v1**. Concretely:

1. **Ship the 30/70 horizontal split as the home screen.** Single-surface and qanun-honor are opt-in toggles, accessible via a layout button in the left zone or via URL parameters (`?layout=single`, `?layout=qanun`).
2. **Inherit the autoharp metaphor for the left zone.** The maqam grid is a chord-bar grid in spirit. Keep it visually quiet (low-saturation, gray background, coral active state); the keyboard should be the visual hero.
3. **Make the right zone a piano, not a qanun, by default.** This is the design-direction Pivot 1 corollary. The piano layout is the universal music-tech metaphor; the qanun is honored elsewhere.
4. **Mobile uses vertical 50/50 split.** Two-thumb ergonomics. Don't try to preserve horizontal split below 768px wide.
5. **Anti-patterns to actively avoid:**
   - Don't expose major/minor/7/9 vocabulary anywhere in the maqam UI (chords are wrong).
   - Don't add a strum-plate gesture by default (we want individual keypresses).
   - Don't add a drum machine, chord-progression sequencer, or auto-bass (BeatForge owns rhythm).
   - Don't force scale-correction of "wrong" notes (we retune; we don't snap).
   - Don't pretend continuous-pitch playing is the right default for the qanun voice (it isn't — qanun is fixed-pitch once mandals are set).
6. **Long-press on any right-zone pitch = mandal-flip menu.** This is the bridge between piano-canonical default and qanun-honor power-user mode. It also satisfies Hunt & Wanderley's multiparametric-mapping criterion: a single key now has *two* output behaviours (note vs. retune-self) selected by gesture duration.
7. **Computer-keyboard mapping must work out of the box for non-MIDI users.** This is the largest fraction of the audience. The QWERTY layout above is recommended.
8. **MIDI split point defaults to middle C.** Hardware keyboardists will look for it there (Casio/Yamaha/Korg convention).
9. **Treat Guiard's three principles as constraints on layout:** left zone always operates at a coarser temporal scale than right zone (the right zone never *forces* a left-zone change); left precedes right semantically (a maqam must be active before any note can sound — there is no "blank" state); the right zone is high-bandwidth (real-time continuous), the left is gestural-discrete.
10. **Ship persistent "favorite tuning" quick slots** (LinnStrument and Komplete Kontrol precedent). Cmd+1..9 / Ctrl+1..9 saves the current tradition+maqam+karar+per-string-overrides as a recallable preset slot. Stored in IndexedDB.

---

## Open questions

1. **Should the right zone show all maqam pitches as identically-sized keys, or preserve a piano-style "white-key vs black-key" visual rhythm?** The piano-canonical pivot says preserve the rhythm; but Turkish makam isn't anchored to 12-EDO, so the "black keys" are arbitrary in a way they aren't on a piano. Empirical user-testing: show three mockups (uniform keys / piano-rhythm / piano-rhythm-with-coma-marks) and observe which one users fluently navigate.
2. **What is the right number of maqam buttons in v1's left zone?** 16 (4×4) feels canonical and matches the autoharp-21-bar mental model. 24 (6×4) covers the deepest tradition (Turkish AEU has 50+ historical makams, but the practical playing repertoire is closer to 30). Recommendation: 16 in v1 with a "More…" catalog drawer; revisit for v2.
3. **Is karar a slider or a grid?** A horizontal chromatic strip is intuitive; a vertical "12-position dial" is qanun-evocative. Recommendation: horizontal strip in v1 with a tooltip; circular dial in qanun-honor mode.
4. **Should we surface MIDI-input split-point in v1 settings UI, or only as a URL parameter / hidden config?** Probability low that v1 ships with rich MIDI hardware support given audience profile. Recommendation: ship it but in advanced settings.
5. **Should long-press on a maqam pad open a context menu (rename, reorder, edit)?** Conflicts with "press = activate." Recommendation: enter Customize mode via the grid-header `⋯`, not via long-press; long-press on a pad in Customize mode = drag-to-reorder.
6. **How do we honor non-piano traditions whose theory contradicts the keyboard metaphor — Persian dastgāh in particular?** Persian classical theory is *not* tonal-keyboard-shaped. Recommendation: the FA tradition tab can introduce a *gushe-strip* as a third UI element below the maqam grid (showing the 7 dastgāh's gushe contour); ship in v2.
7. **Mandal-flip radial menu — what triggers should it accept?** Long-press obviously; right-click on desktop; two-finger-tap on mobile. Recommendation: all three.

---

## Sources

### Suzuki Omnichord / QChord / HiChord

- [Wikipedia: Omnichord](https://en.wikipedia.org/wiki/Omnichord)
- [Omnichord-Heaven: OM-27](https://www.omnichord-heaven.com/models/om27.html)
- [Omnichord-Heaven: OM-36 / OM-84](https://www.omnichord-heaven.com/models/om36-84.html)
- [Omnichord-Heaven: model index / history](https://www.omnichord-heaven.com/models/index.html)
- [Perfect Circuit Signal: History of the Suzuki Omnichord](https://www.perfectcircuit.com/signal/suzuki-omnichord-history)
- [The Pro Audio Files: Omnichord 101](https://theproaudiofiles.com/suzuki-omnichord/)
- [MusicRadar: Blast from the Past — Suzuki Omnichord](https://www.musicradar.com/news/blast-from-past-suzuki-omnichord)
- [Designboom: Suzuki OM-108 reissue (2024-01-29)](https://www.designboom.com/technology/suzuki-omnichord-om-108-electronic-musical-instrument-01-29-2024/)
- [Gearnews: OM-108 hands-on](https://www.gearnews.com/suzuki-omnichord-om-108-hands-on/)
- [Gearnews: Suzuki to re-release Omnichord (announcement)](https://www.gearnews.com/suzuki-to-re-release-omnichord-for-70th-anniversary/)
- [MusicRadar: Damon Albarn Clint Eastwood Omnichord preset](https://www.musicradar.com/news/damon-albarn-gorillaz-clint-eastwood-omnichord-preset)
- [DJ Mag: Clint Eastwood Omnichord preset](https://djmag.com/news/gorillaz-clint-eastwood-riff-omnichord-preset-damon-albarn-reveals-watch)
- [EDM.com: Damon Albarn Clint Eastwood Omnichord](https://edm.com/gear-tech/gorillaz-damon-albarn-clint-eastwood-omnichord-preset/)
- [Music Tech: Damon Albarn Omnichord Clint Eastwood](https://musictech.com/news/gear/gorillaz-blur-damon-albarn-omnichord-clint-eastwood-boss-vt-1-yamaha-qy10/)
- [Equipboard: Phoebe Bridgers gear](https://equipboard.com/pros/phoebe-bridgers)
- [Mixdown: Gear rundown — Phoebe Bridgers](https://mixdownmag.com.au/features/gear-rundown-phoebe-bridgers/)
- [Vintage Synth Explorer: Suzuki QChord QC-1](https://www.vintagesynth.com/suzuki/qchord_QC-1)
- [Equipboard: Suzuki QC-1 QChord](https://equipboard.com/items/suzuki-qc-1-qchord)
- [Suzuki QChord QC-1 Owner's Manual (PDF)](https://www.omnichord-heaven.com/downloads/manuals/qchord-manual.pdf)
- [HiChord — Pocket Audio shop](https://hichord.shop/)
- [HiChord Kickstarter](https://www.kickstarter.com/projects/hichord/hichord-pocket-chord-synthesizer)
- [Synth Anatomy: Pocket Audio HiChord (2025-10)](https://synthanatomy.com/2025/10/pocket-audio-hichord-a-pocket-sized-chord-machine.html)
- [Yanko Design: HiChord Pocket Synth (2025-09-11)](https://www.yankodesign.com/2025/09/11/hichord-pocket-synth-makes-music-creation-effortless/)
- [Electrosmith: Daisy in the Wild — HiChord](https://electro-smith.com/blogs/seeds-n-circuits/daisy-in-the-wild-hichord)

### Casio / Yamaha / Korg arrangers

- [Casio CT-S1000V product page](https://www.casio.com/us/electronic-musical-instruments/brands/casiotone/cts1000v/)
- [Casio CT-S1000V Canada](https://www.casio.com/ca-en/electronic-musical-instruments/product.CT-S1000V/)
- [Casiotone CT-S1000V (en)](https://music.casio.com/en/products/casiotone/cts1000v/)
- [Casio CTK-6200 manual: chord fingering](https://www.manualslib.com/manual/595359/Casio-Ctk-6200.html?page=28)
- [Casio LK50 auto-accompaniment manual (PDF)](https://support.casio.com/pdf/008/lk50_e_08.pdf)
- [Sand Software Sound: CT-S1000V quick tips](https://sandsoftwaresound.net/casio-ct-s1000v-quick-tips/)
- [PSR Tutorial: chord fingering](https://psrtutorial.com/lessons/start/s50_fingering.html)
- [PSR Tutorial home](https://psrtutorial.com/)
- [Yamaha PSR-SX920 product page](https://usa.yamaha.com/products/musical_instruments/keyboards/arranger_workstations/psr-sx920/index.html)
- [Yamaha FAQ: Single Finger and Fingered methods](https://faq.yamaha.com/usa/s/article/U0002033)
- [Yamaha Europe: Arranger Workstation history](https://europe.yamaha.com/en/musical-instruments/keyboards/explore/pk-45th/history/arranger-workstation/)

### Autoharp

- [Wikipedia: Autoharp](https://en.wikipedia.org/wiki/Autoharp)
- [Dresslands: Autoharp guide](https://dresslands.com/autoharp/)
- [Harpers Guild: chord-bar layouts (Bob Lewis)](https://harpersguild.com/autoharp_tweaking/folk_friendly/chord_layouts.pdf)
- [Autoharp Talk: Bryan Bowers chord layout](http://autoharpworks.com/phpbb/viewtopic.php?t=52)
- [California Autoharp Gathering 2026: Bryan Bowers bio](https://calautoharp.com/bryan-bowers/)
- [Pasadena Folk Music Society: Bryan Bowers](https://pasadenafolkmusicsociety.org/autoharp-traditional-singing-and-stories-of-bryan-bowers-on-saturday-may-30/)
- [Hal Weeks: PRIZIM autoharp layout](https://halweeks.com/whats-a-prizim)
- [Wendy M. Grossman: autoharp guide](https://www.pelicancrossing.net/autoharp.htm)
- [UNC: Becky Blackley Collection finding aid](https://finding-aids.lib.unc.edu/catalog/20282)
- [Goodreads: The Autoharp Book](https://www.goodreads.com/book/show/5099628-the-autoharp-book)

### DAW / app patterns

- [NI Komplete Kontrol manual: scales and arpeggiator](https://www.native-instruments.com/ni-tech-manuals/komplete-kontrol-manual/en/using-scales-and-the-arpeggiator)
- [NI A-Series quickstart: Smart Play](https://www.native-instruments.com/en/a-series-quickstart/using-smart-play/)
- [NI Kontrol S MK3 manual: scales](https://www.native-instruments.com/ni-tech-manuals/kontrol-s-mk3-manual/en/scales)
- [MusicRadar: Komplete Kontrol Scale mode tutorial](https://www.musicradar.com/how-to/how-to-use-the-komplete-kontrol-s-midi-keyboards-scale-mode)
- [ADSR: Komplete Kontrol mk2 Scale & Chord](https://www.adsrsounds.com/komplete-kontrol-tutorials/komplete-kontrol-mk2-scale-chord-explained/)
- [ADSR: Kontrol S Keyboard Scale Modes](https://www.adsrsounds.com/komplete-kontrol-tutorials/kontrol-s-keyboard-scale-modes-explained/)
- [Ableton: Keys and Scales in Live 12 FAQ](https://help.ableton.com/hc/en-us/articles/11425083250972-Keys-and-Scales-in-Live-12-FAQ)
- [Ableton: MIDI Tools and Device Updates in Live 12 FAQ](https://help.ableton.com/hc/en-us/articles/11535349458588-MIDI-Tools-and-Device-Updates-in-Live-12-FAQ)
- [Ableton Reference Manual: MIDI Tools](https://www.ableton.com/en/live-manual/12/midi-tools/)
- [Apple Support: GarageBand iPad — Strings](https://support.apple.com/guide/garageband-ipad/play-the-strings-chsf2f99a20/ipados)
- [Apple Support: GarageBand iPad — Add Custom Chords](https://support.apple.com/guide/garageband-ipad/add-custom-chords-chsab9d1c4c/ipados)
- [Apple Support: GarageBand iPad — Guitar](https://support.apple.com/guide/garageband-ipad/chs39282a88/ipados)
- [Apple Support: Logic Pro iPad — Chord Trigger overview](https://support.apple.com/guide/logicpro-ipad/chord-trigger-overview-lpipdcde4fee/ipados)
- [Apple Support: Logic Pro iPad — Chord Trigger usage](https://support.apple.com/guide/logicpro-ipad/use-tips-lpip768c92e5/ipados)
- [Apple Support: Logic Pro iPad — Smart Tempo](https://support.apple.com/guide/logicpro-ipad/use-smart-tempo-lpip99743e51/ipados)
- [Audeobox: FL Studio Piano Roll Shortcuts](https://www.audeobox.com/learn/fl-studio/fl-studio-piano-roll-shortcuts-guide/)
- [Audeobox: How to Use the Piano Roll in FL Studio](https://www.audeobox.com/learn/fl-studio/how-to-use-the-piano-roll-in-fl-studio/)
- [EDMProd: 25 Tips for the FL Studio Piano Roll](https://www.edmprod.com/fl-studio-piano-roll/)
- [App Store: ThumbJam](https://apps.apple.com/us/app/thumbjam/id338977566)
- [App Store: Animoog Z](https://apps.apple.com/us/app/animoog-z-synthesizer/id1586841361)
- [Engadget: Animoog Z review](https://www.engadget.com/moog-animoog-z-i-os-softsynth-music-app-170019893.html)

### MPE / continuous-pitch surfaces

- [Roger Linn Design: LinnStrument FAQs](https://www.rogerlinndesign.com/support/support-linnstrument-faqs)
- [Roger Linn Design: panel settings](https://www.rogerlinndesign.com/support/linnstrument-support-panel-settings)
- [Roger Linn Design: chord and scale shapes](https://www.rogerlinndesign.com/support/support-linnstrument-chord-and-scale-shapes)
- [LinnStrument community wiki](https://linnstrument.miraheze.org/wiki/Software)
- [Ben Fuhrman: LinnStrument LED controls](https://benfuhrman.com/linnstrument-led-controls/)
- [KVR: Microtonal use of LinnStrument](https://www.kvraudio.com/forum/viewtopic.php?t=440695)
- [Wikipedia: ROLI Seaboard](https://en.wikipedia.org/wiki/ROLI_Seaboard)
- [GitHub: euwbah/microtonal-seaboard](https://github.com/euwbah/microtonal-seaboard)
- [ROLI Support: What is MPE?](https://support.roli.com/en/support/solutions/articles/36000027933-what-is-mpe-)
- [Wikipedia: Continuum Fingerboard](https://en.wikipedia.org/wiki/Continuum_Fingerboard)
- [Haken Audio: Continuum](https://www.hakenaudio.com/continuum)
- [EaganMatrix Presets PDF (Kram)](https://s9.imslp.org/files/imglnks/usimg/5/5c/IMSLP433900-PMLP705301-EaganMatrix_Presets_for_the_Haken_Continuum_-_Keyboard.pdf)

### Qanun / mandals

- [Wikipedia: Qanun (instrument)](https://en.wikipedia.org/wiki/Qanun_(instrument))
- [Ethnic Musical: Differences between Arabic and Turkish Qanun](https://www.ethnicmusical.com/kanun/differences-between-arabic-qanun-and-turkish-qanun/)
- [Sala Muzik: How to Learn the Qanun](https://salamuzik.com/blogs/news/how-to-learn-to-play-the-qanun-easily)
- [Met Museum: Turkish Qanun in collection](https://www.metmuseum.org/art/collection/search/500957)

### NIME / academic

- [NIME proceedings index](https://nime.org/papers/)
- [NIME 2023: Hapstrument bimanual haptic interface](https://nime.org/proc/nime2023_77/)
- [NIME 2007: Malloch & Stewart — T-Stick (PDF)](https://www.nime.org/proceedings/2007/nime2007_066.pdf)
- [NIME 2021: T-Stick Music Creation Project](https://nime.pubpub.org/pub/7c4qdj4u/release/1)
- [IDMIL: T-Stick project page](https://www.idmil.org/project/the-t-stick/)
- [Wessel & Wright 2002: Problems and Prospects (CNMAT PDF)](https://cnmat.berkeley.edu/sites/default/files/attachments/2002_problems-and-prospects-for-intimate-musical-control-of-computers.pdf)
- [Wessel & Wright 2002: MIT Press Computer Music Journal](https://direct.mit.edu/comj/article-abstract/26/3/11/94758/Problems-and-Prospects-for-Intimate-Musical)
- [Wessel & Wright 2002: arXiv mirror](https://arxiv.org/abs/2010.01570)
- [Hunt, Wanderley, Kirk — mapping strategies (ResearchGate)](https://www.researchgate.net/publication/243774325_Mapping_Strategies_for_Musical_Performance)
- [Hunt & Wanderley — towards a model (PDF)](http://recherche.ircam.fr/equipes/analyse-synthese/wanderle/Gestes/Externe/Hunt_Towards.pdf)
- [Wanderley — mapping performer parameters to synthesis engines (PDF)](https://web.media.mit.edu/~rebklein/downloads/papers/Organised%20Sounds%20V7-n2/02-%20Mapping%20performer%20parameters%20to%20synthesis%20engines.pdf)
- [Hunt & Wanderley 2002 — Importance of Parameter Mapping (Springer chapter)](https://link.springer.com/chapter/10.1007/978-3-319-47214-0_3)
- [Wikipedia: Reactable](https://en.wikipedia.org/wiki/Reactable)
- [UPF MTG: Reactable](https://www.upf.edu/web/mtg/reactable)
- [Jordà et al. — Reactable (TEI 2007)](https://dl.acm.org/doi/10.1145/1226969.1226998)
- [Jordà — Reactable: tangible and tabletop performance (CACM 2010)](https://dl.acm.org/doi/10.1145/1753846.1753903)
- [Jordà — Sonigraphical Instruments: from FMOL to reacTable (2003 chapter)](https://link.springer.com/chapter/10.1007/978-3-319-47214-0_7)
- [Guiard 1987 — Asymmetric division of labor (Semantic Scholar)](https://www.semanticscholar.org/paper/Asymmetric-division-of-labor-in-human-skilled-the-a-Guiard/02577799e42ca27be18e0d37476b658f552b5be3)
- [Xu et al. 2007 — Evaluation of Guiard's theory (PDF)](http://hci.cs.umanitoba.ca/assets/publication_files/2007-LNCS-Xu-BimanualControl.pdf)
- [Balakrishnan 2000 — Symmetric bimanual interaction (DGP Toronto PDF)](https://www.dgp.toronto.edu/~ravin/papers/chi2000_symmetricbimanual.pdf)
- [Davidson 2012 — Bodily movement in expressive musical performance (SAGE)](https://journals.sagepub.com/doi/full/10.1177/0305735612449896)
- [Davidson & Salgado Correia 2001 — Meaningful musical performance (SAGE)](https://journals.sagepub.com/doi/10.1177/1321103X010170011301)
- [Clarke & Davidson — The Body in Performance (Taylor & Francis)](https://www.taylorfrancis.com/chapters/edit/10.4324/9781315095509-6/body-performance-eric-clarke-jane-davidson)

---

## References

- Albarn, D. (2024). Interview comments on Gorillaz's *Clint Eastwood* and the Suzuki Omnichord (reported in MusicRadar, DJ Mag, and EDM.com, August–September 2024).
- Apple Inc. (2024). *Logic Pro for iPad: Chord Trigger MIDI plug-in.* Apple Support documentation.
- Apple Inc. (2024). *GarageBand for iPad: Play the Strings; Add Custom Chords; Play the Guitar.* Apple Support documentation.
- Balakrishnan, R., & Hinckley, K. (2000). Symmetric bimanual interaction. In *Proceedings of CHI 2000*, 33–40. ACM.
- Blackley, B. (1983). *The Autoharp Book.* IAD Publications, 256 pp. ISBN 0912827017.
- Blackley, B. (Ed.) (1980–1993). *The Autoharpoholic* (international quarterly journal). Becky Blackley Collection, UNC Chapel Hill.
- Casio Computer Co. (2022). *CT-S1000V Casiotone Vocal Synthesizer User Manual.*
- Davidson, J. W. (2012). Bodily movement and facial actions in expressive musical performance by solo and duo instrumentalists: Two distinctive case studies. *Psychology of Music* 40(5):595–633.
- Davidson, J. W., & Salgado Correia, J. (2001). Meaningful musical performance: A bodily experience. *Research Studies in Music Education* 17(1):70–83.
- Designboom (2024-01-29). *Suzuki Omnichord OM-108: Reviving '80s Electronic Sounds.*
- Guiard, Y. (1987). Asymmetric division of labor in human skilled bimanual action: The kinematic chain as a model. *Journal of Motor Behavior* 19(4):486–517.
- Haken, L. (2008–2026). *Continuum Fingerboard / EaganMatrix.* Haken Audio product documentation.
- Hunt, A., & Kirk, R. (2000). Mapping strategies for musical performance. In M. Wanderley & M. Battier (Eds.), *Trends in Gestural Control of Music.* Ircam — Centre Pompidou.
- Hunt, A., Wanderley, M. M., & Paradis, M. (2002). The importance of parameter mapping in electronic instrument design. In *Proceedings of NIME 2002*, 149–154.
- Hunt, A., & Wanderley, M. M. (2002). Mapping performer parameters to synthesis engines. *Organised Sound* 7(2):97–108.
- Jordà, S., Geiger, G., Alonso, M., & Kaltenbrunner, M. (2007). The reacTable: Exploring the synergy between live music performance and tabletop tangible interfaces. In *Proceedings of TEI 2007*, 139–146. ACM.
- Jordà, S. (2010). The Reactable: Tangible and tabletop music performance. In *Proceedings of CHI EA 2010*, 2989–2994. ACM.
- Linn, R. (2014–2026). *LinnStrument User Guide.* Roger Linn Design.
- Malloch, J., & Wanderley, M. M. (2007). The T-Stick: From musical interface to musical instrument. In *Proceedings of NIME 2007*, 66–69.
- Malloch, J., et al. (2021). The T-Stick Music Creation Project: An approach to building a creative community around a DMI. In *Proceedings of NIME 2021.*
- Native Instruments (2024). *Komplete Kontrol Manual.* Sections on Smart Play, Scale, Easy / Mapped / Guide modes.
- Pocket Audio (2024). *HiChord Kickstarter campaign documentation.* Updated September–October 2025 in Synth Anatomy and Yanko Design.
- Suzuki Musical Instrument Mfg. (1981–2024). Omnichord OM-27 / OM-36 / OM-84 / OM-100 / OM-200M / OM-300 / OM-108 product manuals; QChord QC-1 owner's manual (1999).
- Wanderley, M. M. (2001). *Performer-Instrument Interaction: Applications to Gestural Control of Sound Synthesis.* PhD thesis, University Paris VI.
- Wessel, D., & Wright, M. (2002). Problems and prospects for intimate musical control of computers. *Computer Music Journal* 26(3):11–22.
- Yamaha Corporation (2023). *PSR-SX920 / SX720 Reference Manual.*
