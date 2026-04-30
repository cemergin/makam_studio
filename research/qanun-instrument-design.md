---
title: "The Qanun as Physical Instrument: Construction, Mandals, Tuning, and Idiom"
audience: "makam_studio designers and developers; anyone designing a digital control surface that abstracts the qanun. Also useful as background for someone new to maqam-based instrument idioms."
tldr: "The qanun is a trapezoidal plucked zither with ~26 courses of 3 strings each. Its defining feature is the mandal — a stack of small levers under each course that subdivide the playing length to access microtones instantly during performance. Turkish mandals (≈12 per course, 1 Holdrian comma ≈ 22.6 cents each) trade range for fineness; Arabic mandals (4–7 per course, ¼-tone ≈ 50 cents each) trade fineness for ergonomic simplicity. The instrument is, in effect, a per-string microtonal preset bank operated mid-phrase by the left hand. Any digital surface should treat the mandal grid — not the keyboard — as the central control metaphor, and treat 'select a karar + maqam' as a one-gesture, full-instrument retune."
skip_if: "You already know what mandals are, why Weiss built a 79-tone qanun, and what Turkish vs Arabic granularity implies for a digital data model."
date: 2026-04-30
status: draft
---

# TL;DR

- The qanun is a flat trapezoidal plucked zither, played on the lap or a small table, with ~26 courses of 3 strings each (~78 strings total) and a range of roughly 3.5 octaves from A2/D2 (yegah) to E6/A5.
- Each course sits over a stack of small levers — **mandals** (Turkish), **urab/ʿarab/orab/mandalāt** (Arabic) — that, when flipped, shorten the speaking length of all 3 strings together, instantly raising pitch by a fixed micro-interval.
- **Turkish mandals**: typically up to ~12 per course, each step ≈ one **Holdrian comma** (~22.64 cents); Turkish makers commit to subsets of 72-edo, with comma-precise fingerings rooted in the AEU (Arel-Ezgi-Uzdilek) theoretical system.
- **Arabic mandals**: typically 4–7 per course, each step ≈ a quarter tone (~50 cents); coarser, faster to operate, fits the 24-tone Arabic maqam catalog.
- The mandal mechanism only became standard in the early 20th century. Before mandals, players retuned strings between pieces or used the left thumbnail to bend pitch — the mandal turned the qanun from a tradition-specific instrument into a universal maqam instrument.
- Famous practitioners (Abraham Salman, Göksel Baktagir, Halil Karaduman, Erol Deran, Ruhi Ayangil, Mohammed Abdo Saleh, Abdullah Chhadeh, Maya Youssef, and especially Julien Jalâl Ed-Dine Weiss with Ejder Güleç's custom 79-tone "Al-Kindî" qanun) have stretched the mandal idiom in different directions; their work defines what a digital surface should be able to express.

---

## 1. Construction

### 1.1 Body and geometry

The qanun is a right-trapezoidal box zither — a wooden frame with one parallel pair of sides (the bass side is short, the treble side is long), a thin resonant soundboard on top, and a flat back. It sits flat: on the player's lap (cross-legged, or in a chair) or on a small low table.

Typical Turkish qanun dimensions:
- Long side ~95–100 cm (~37–39 in)
- Short side ~38–40 cm wide tapering to ~4–8 cm at the narrow treble end
- Height ~4–6 cm
- Weight light enough to balance on the lap

Arabic qanuns are generally a few centimeters larger in every dimension to accommodate longer bass strings and slightly extended treble. Turkish models are correspondingly more compact and pegged for tighter tension and brighter tone.

### 1.2 Woods

A qanun is a stack of woods chosen for distinct acoustic and structural roles:
- **Soundboard**: thin plane (sycamore), spruce, or sometimes Lebanese cedar. The soundboard's thinness — only a few millimeters — is what makes the qanun's attack so present and bell-like.
- **Body sides and frame**: walnut, beech, maple, or rosewood. Heavy hardwoods to anchor string tension.
- **Back**: lime/linden or compressed plywood — light, stiff, dampens unwanted modes.
- **Pegbox (auger board)**: lime/linden where the wooden tuning pegs go; the pegs themselves are turned from boxwood, rosewood, or ebony.
- **Mandal block**: a separate plate of hardwood at the player's left, drilled and fitted with the metal lever assemblies.
- Decorative inlays, sound-hole rosettes (the **kafes**), and edge bindings are typical and instrument-specific.

### 1.3 Skin-covered windows and bridge

The most acoustically distinctive feature is a long bridge that does not sit on wood — it sits on **skin**. A row of cutouts in the soundboard near the treble side is covered with stretched membranes (traditionally goat or fish skin; on contemporary instruments often calf, parchment, or PVF/PET synthetic film for stability). The bridge — a single long piece of wood — rests on small posts that pass through these skin "windows."

- **Arabic qanuns**: typically **5 skin insets / 5 bridge posts**. The wider window count gives a slightly broader, warmer bass response and supports a longer-bridged instrument.
- **Turkish qanuns**: typically **4 skin insets / 4 bridge posts**. Slightly tighter, brighter, with more of the upper midrange.

The skin behaves like a tiny drumhead under each post; the resulting sound is part-string, part-membrane — a percussive shimmer that no purely wooden zither produces. This is the timbral signature any synthesis must address.

### 1.4 Strings and courses

- **Number of courses**: Turkish qanuns standardize at **26 courses of 3 strings** each (= 78 strings). Arabic qanuns are commonly described with **24–26 melodic courses** plus a few extra-low bass courses (the practical literature often cites "78" or "81 strings"; 81 = 24 trebles × 3 + extras). Egyptian and Iraqi makers have shipped 25 and 27-course variants. The Weiss/Ejder Güleç "Al-Kindî" instruments are custom: same course count, vastly more mandals.
- **Material**: historically gut. Modern instruments use **nylon** (most courses) and **PVF / fluorocarbon** (treble) plus **wound bass strings** (silver or copper on nylon core) for the lowest 5–8 courses.
- **Tension**: relatively low compared to a piano; comparable to a harp. Strings break and detune frequently — a working qanun is a serial-retuning experience.
- **Wooden pegs vs. metal tuners**: many modern instruments add screw-in metal fine-tuners on the bridge side as well as the traditional friction pegs on the pegbox side. This is essential for fast pre-show fine-tuning.

### 1.5 Plectra: tırnak vs. rīsha

The player wears a pick on each index finger:

- **Turkish tırnak**: a metal ring (often silver or steel) holding a stiff plectrum tongue — historically tortoise-shell or buffalo horn (now plastic/synthetic). The Turkish ring + hard tongue gives a **harder attack** and a brighter, more articulate sound.
- **Arabic rīsha**: a softer, often horn or thicker leather plectrum, sometimes threaded into a leather sleeve (yüksük) rather than a metal ring. The Arabic rīsha gives a **rounder, warmer attack**, suited to the more sustained Arabic phrasing.
- **Variants**: ox-bone, water-buffalo horn, cow horn, modern plastic. George Sawa's documented setup uses water-buffalo picks held by rings on the index fingers.

Bare-fingernail playing (without picks) is occasionally used for soft, intimate sections. The **left thumbnail** is also used as a quick pitch-bender, pressing on a string just behind the bridge to raise pitch slightly without flipping a mandal.

---

## 2. Tuning conventions

### 2.1 Range and reference

The qanun spans roughly **3.5 octaves**. Common Turkish range: **yegah (D2, the lowest)** to **tiz neva (A5)** — the AEU/perde naming system. Arabic literature often quotes A2 to E6, depending on instrument size and stringing. The exact bottom note varies by maker; Egyptian and Lebanese instruments sometimes go a tone or two lower than Turkish.

A qanun is normally tuned **diatonically with mandals down** (i.e., the "open" position of every mandal gives a basic scale, like Rast on C, with all natural notes plus a default set of accidentals/comma adjustments suited to the most-used maqam family). This is critical for the digital metaphor: the *open* state of the instrument is *already* a maqam (typically Rast or Bayati), not a chromatic scale.

### 2.2 Turkish: AEU and the Holdrian comma

Turkish maqam theory, codified in the early 20th century by Arel, Ezgi, and Uzdilek (the **AEU system**), divides the octave conceptually into **53 commas** (Pythagorean / Holdrian commas). One Holdrian comma ≈ **22.6415 cents** — the step of 53-EDO. AEU uses 24 named perdes drawn from this 53-comma grid.

In practice, Turkish qanun makers don't physically build 53 mandals per course. They commit to a *subset of 72-EDO* — the equal-tempered semitone of 100 cents divided into 6 equal parts of ~16.67 cents — and **affix mandals only for the comma steps performers actually request**. A typical professional Turkish kanun has **6–12 mandals per course**, with the most common count clustered around **9–12** for working instruments, and the layout asymmetric (more mandals on courses where common modulations land, fewer on courses that mostly stay diatonic).

This is the most-misunderstood point about Turkish kanun tuning: **the mandal grid is sparse and idiomatic, not uniform**. A maker affixes mandals "for intervals demanded by performers" (Karaduman tradition). Two Turkish qanuns from different makers will have different mandal *counts* and *positions* on the same course. Standardization is the player's responsibility, not the instrument's.

The Turkish mandal step is approximately one Holdrian comma (~22.6 cents), or the slightly-tempered 72-edo equivalent (~16.67 cents) when makers use that grid. There is real, ongoing controversy about whether the practical step is "comma," "72-edo," or "AEU's idealized comma" — see Yarman's writings.

### 2.3 Arabic: quarter tones and the 24-tone catalog

Arabic maqam practice in the 20th century settled (with notable dissent) on a 24-tone catalog: 12 semitones plus 12 quarter-tone "in-between" pitches (the half-flats: sika, kurdi, etc.). The Cairo Congress of Arab Music (1932) effectively standardized this notation.

Accordingly, the Arabic qanun's mandals are **coarser and fewer**: typically **4–7 mandals per course**, each step ≈ a **quarter tone** (~50 cents). The set covers the practical accidentals: natural ↔ half-flat ↔ flat ↔ flat-and-comma ↔ etc., depending on the course.

The **urab** / **orab** / **ʿarab** / **mandalāt** terminology is used interchangeably; "mandal" itself is a Persian/Turkish loan now broadly understood.

Egyptian, Lebanese, and Syrian schools differ in nuance, not category:
- **Egyptian** instruments (Cairo / Alexandria tradition) tend to favor a fuller, slightly lower range and a strong open tuning oriented to the maqam Bayati / Rast / Hijaz cluster typical of the Umm Kulthum repertoire.
- **Lebanese / Syrian** instruments (Damascus, Beirut, Aleppo) often have slightly higher tension, brighter top end, and may include marginally more mandal positions per course to support the modulations of the wasla / muwashshah literature.
- **Iraqi** tradition (Baghdad maqam) sits between Arabic and Turkish in feel, with players like Abraham Salman comfortable across both lever schemes — Iraqi qanuns sometimes carry extra mandals to support Iraqi maqam pitches that don't fit cleanly into either 24-tone or 72-edo.

### 2.4 Armenian, Greek, and the equal-tempered drift

- **Armenian kanon** typically uses **equidistant half-tones** (12-EDO chromatic) — the mandals operate as ordinary sharp/flat lifts with no microtonal subdivisions. This is a 20th-century simplification driven by integration with Western harmony.
- **Greek kanonaki** sits between Turkish and Armenian — full mandal stacks in the Turkish style for traditional Smyrnaic / Byzantine / Sephardic repertoire, or simplified for popular contexts.

---

## 3. The mandal — the idiom-defining detail

### 3.1 What a mandal physically is

A mandal is a small metal lever, typically brass or steel, mounted on a pivot in the wooden mandal block on the left side of the instrument, just past the pegbox. When the lever is pressed *down* (or *up*, depending on maker), a small fret-like ridge contacts all 3 strings of its course at a specific point along their length, **shortening the speaking length** of those 3 strings together. The pitch jumps up by a fixed interval determined by where the ridge is positioned.

A course's stack of mandals is laid out **in pitch order**, like a small piano keyboard rotated 90°. The bottom mandal is the lowest pitch (open string when nothing is engaged); each successive mandal raises the pitch one micro-step further.

Critically, **only one mandal is engaged at a time per course** (or none). Engaging a higher mandal supersedes any lower ones — the highest engaged mandal wins because it makes the shortest speaking length. The player flips the desired mandal *down* (engaged) and the prior one *up* (released) — often in the same fluid motion of a single fingertip.

### 3.2 Granularity by region (specifics)

| Region | Mandals per course (typical) | Step size | Theoretical reference |
|---|---|---|---|
| Turkish | 6–12 (commonly ~10) | ~22.6 cents (1 Holdrian comma) ≈ 16.67 cents (1/6 semitone, 72-edo) | AEU / 53-edo / 72-edo |
| Arabic (Egyptian/Levantine) | 4–7 | ~50 cents (1 quarter-tone) | 24-EDO catalog |
| Iraqi | 5–8 | mixed (¼-tone primary, with a few comma adjustments) | Baghdad maqam |
| Armenian | 2–3 (sharp/flat) | 100 cents (semitone) | 12-EDO |
| Weiss "Al-Kindî" (Yarman 79-tone) | up to **~26 per course** in some sources, with 7 below + 8 above + 12 doubles around each natural; total mandals on the instrument exceed 600 | ~15.09 cents (1/79 of an octave, derived from 159-edo MOS) | 79 MOS 159-edo |

(The popular "79 mandals per course" claim associated with Weiss appears to be a popular conflation: the 79-tone *system* assigns 79 pitches to the octave, but the *mandals per course* are organized as a symmetric stack of about 27 — 7 down, 8 up, 12 doubles — depending on course position. The total number of mandals across the whole instrument is what's astronomical.)

### 3.3 History: from retuning between pieces to the lever

Pre-mandal qanuns required the player to retune strings between pieces — a slow process that committed the instrument to one maqam family per performance. Two changes turned the qanun into a universal maqam instrument:

1. **The left-thumbnail technique** (still used) for in-piece pitch bends without retuning.
2. **The mandal lever**, generally credited to early 20th-century Damascus and Istanbul makers. **Omer Efendi**, a musician who brought qanuns from Damascus to Istanbul during the reign of Sultan Mahmud II (1818–1839), is sometimes cited as the earliest practitioner of a primitive lever system on the qanun. The fully-realized modern mandal mechanism is broadly credited to early-20th-century Damascus makers — luthiers in the orbit of the Nahat family and other Damascene craftsmen, all rooted in the late-19th-century revolution in Levantine instrument-making that the Nahats led on the oud. Documented sources reliably attribute the modern lever to "early 20th century" Levantine and Turkish builders without naming a single inventor; the Nahat → Damascus → Istanbul lineage is the consensus origin region.

Before mandals, every taqsim was prepared. After mandals, the instrument could modulate live — and so could the music written for it. The qanun's 20th-century repertoire (Egyptian film music, Umm Kulthum's takht, Lebanese and Syrian wasla composition, Turkish AEU classical) is in a real sense *post-mandal music*.

### 3.4 The mandal flip as a musical gesture

A mandal flip is *audible*: it produces a glissando-like portamento (because the strings keep ringing as their length suddenly changes) and an unmistakable mechanical click. Master players exploit both:

- **Mid-phrase modulation**: a single course's mandal flips just before a target note arrives — the listener hears the previous pitch ring out, then snap to the new pitch.
- **The "wah" effect**: rapid alternation of a single mandal on a sustained ringing course — the listener hears a fluctuating microtonal vibrato that no fixed-pitch instrument can produce. Halil Karaduman and Göksel Baktagir are particularly associated with this idiom in Turkish playing.
- **Block flips**: re-keying a *whole maqam family* in one gesture. Some players use the side of the left palm or the heel of the hand to flip multiple mandals simultaneously; a few advanced players have used a knee or even a small foot pedal to engage mandal banks on the bass side.
- **Two-handed mandal play**: in Turkish virtuosic taqsim, the *right* hand (the picking hand) can also be diverted from picking to flip a mandal mid-phrase, with the left hand picking a held note — a technique sometimes called *mandal taksimi* in practice circles.

These gestures are central to the qanun's expressive idiom. Any digital surface that can't reproduce them — at minimum the mid-phrase flip and the wah — has lost the instrument.

---

## 4. Playing technique

### 4.1 Posture and hand role

The qanun lays flat on the lap (legs crossed on the floor, traditional) or on a small low table (concert / chair seating, modern). The instrument is angled slightly with the bass side toward the body, treble side away.

Both hands have **picking** roles — left and right index-finger plectra alternate, like the alternating mallets of a santur, but plucked. In addition:
- The **left hand** owns the mandal levers (close to the body on the bass side).
- The **left thumbnail** owns the in-piece pitch-bend (pressing strings just past the bridge).
- The **right hand** owns the upper-octave virtuosity, runs, and tremolo.
- Both hands together produce the rapid right-left-right alternation that gives qanun runs their characteristic shimmer.

Glissandi from the wrist (a sweep of the plectrum across many courses) are a common ornamental gesture and often punctuate cadences.

### 4.2 Role in the takht ensemble

In the Arabic **takht** (oud, qanun, kamanjah/violin, ney, riq, sometimes darabukkah, plus a vocalist), the qanun is the **harmonic and tuning anchor**:
- The qanun establishes intonation — other melodic instruments tune to it.
- The qanun "translates" (the term is *tarjamah*) the singer's line, doubling and embellishing.
- The qanun fills harmonic space in pauses and transitions, often improvising a brief *dulab* or *tahmilah* between vocal sections.
- The qanun leads the ensemble through modulations: when the qanun player flips mandals to a new maqam, the rest of the takht follows.

In the Turkish **fasıl** ensemble (kanun, ney, ud, kemençe, percussion, vocalist), the kanun's role is similar but more soloistic: extended *taksim* (improvised preludes) on the kanun are a defining feature of the form.

### 4.3 The taqsim / taksim as the proving ground

The qanun's improvised solo form — *taqsim* in Arabic, *taksim* in Turkish — is the demonstration of mastery. A taqsim establishes a maqam, modulates through 2–5 related maqams via mandal flips, and resolves home. The mandal flips are not hidden — they are part of the rhetoric. A good taksim makes the audience *hear* the modulation as a physical click + glide.

---

## 5. Famous players

### Iraqi
- **Abraham (Avraham / Ibrahim) Salman** (b. 1931, Baghdad; d. 2014) — graduate of the Baghdad School for the Blind, principal qanun in the Royal Iraqi Radio Orchestra, later in Israel after 1951. Memorized thousands of pieces; known for fluency across Iraqi maqam, Arab classical, Turkish style, and Western classical. Often described as the *king of the qanun* in his generation. His mandal usage is fluent across Arabic and Turkish granularities — Iraqi instruments often carry hybrid mandal stacks because of his and his peers' demands.

### Turkish
- **Erol Deran** (b. 1937) — among the founding generation of post-AEU virtuosi; recorded *Kanun Soloları* (1993). Restrained, conservatory-precise mandal usage, deeply rooted in classical Turkish makam.
- **Ruhi Ayangil** (b. 1953, Istanbul; began kanun at 10) — academic and concert player, scholar of Turkish makam theory, conductor of the Ayangil Türk Müziği Orkestrası.
- **Halil Karaduman** (d. 2012) — pedagogue and recording artist whose *Qanun Method* (KBH-303) is a standard pedagogical text. Known for an emphatic, articulate mandal style — every flip is heard and meant.
- **Göksel Baktagir** (b. 1966, Kırklareli) — perhaps the most internationally visible Turkish kanun player; expansive, lyrical, with many duo recordings (notably with oudist Yurdal Tokcan). His Turkish-style "wah" and his speed in mid-phrase mandal flips have set the contemporary standard.
- Also: **Aytaç Doğan** (modern crossover); **Tahir Aydoğdu**; **Sema Erkan** (one of the senior women in the Turkish kanun lineage).

### Syrian / Lebanese
- **Abdullah Chhadeh** (b. Damascus, based London) — Conservatoire of Damascus + UK career. Studied with **Selim Sarwa** (also called Salim Hallaq / Selim Serwah — the central late-20th-century Syrian master). Founder of *Nara*. Has redesigned aspects of his kanun and adapted Western classical works to it.
- **Maya Youssef** (b. Damascus, based London) — *Syrian Dreams* (2017), *Finding Home*. Studied at Sulhi Alwadi Institute under **Salim Sarwa** and Azerbaijani Elmira Akhundova. Jazz / classical / Latin crossings with rooted Arabic technique.
- **Salim Sarwa** (Selim Serwah / Salim Hallaq) — the pedagogical anchor of the Damascus school; teacher of both Chhadeh and Youssef.

### Egyptian
- **Mohammed Abdo Saleh** (1912–1970) — Umm Kulthum's qanunist for decades; arguably the most-recorded qanun in 20th-century music by sheer airplay.
- **Abdel Fattah Mansy** — Cairo school of the mid-century, Arabic Music Ensemble.
- **Magdy al-Husseini** — contemporary Egyptian.
- **Abdel Halim Nuwayra** — director of the Arabic Music Ensemble; also a qanunist.

### French-Syrian
- **Julien Jalâl Eddine Weiss** (1953–2015) — French-born convert to Islam, founder of *Ensemble Al-Kindi* (1983). Commissioned a series of custom qanuns from **Ejder Güleç** of İzmir starting 1990, culminating in the **2005 Yarman 79-tone qanun** — a 79-tone-per-octave instrument tuned from a 159-EDO MOS subset, with mandals organized symmetrically (~7 below, ~8 above, ~12 double-sharps per course), color-coded naturals in royal fuchsia, and individual fine-tuners on every string. Weiss's project was to escape the "compromise" of either 24-edo or 72-edo and represent maqam practice with low-prime-limit, just-intonation–based pitches. The Al-Kindi instrument is the most extreme microtonal qanun ever built and remains the reference for "what's the upper bound of mandal density?"

(**Ozan Yarman** — Turkish theorist and composer — is the architect of the 79-tone system that Güleç built into the Weiss instrument; he is a player as well as a scholar, and his published work is the canonical technical document.)

---

## 6. Comparable instruments

### Santur (Persian, Iraqi)
A **hammered**, not plucked, trapezoidal zither of similar size. The playing metaphor is fundamentally different: two thin wooden mallets (*mezrab*) strike the strings. The Persian santur uses **movable bridges** for tuning, but the bridges move *between pieces* — they are not levers operated mid-performance. The Iraqi santur (related but distinct, used in Iraqi maqam) has 3 specific bridges that can be moved during a piece for B half-flat / E half-flat / B half-flat jawaab adjustments, but this is a far slower gesture than a mandal flip. The santur is the qanun's *cousin*, not its analog: same family of trapezoidal box zither, completely different control idiom.

### Kanonaki (Greek)
The Greek kanun. Same construction; in the Smyrnaic / rebetiko / Byzantine lineage, the mandal stack mirrors the Turkish (these traditions share modal vocabulary). For modern Greek popular use, simplified mandal stacks are common — closer to Armenian half-tone-only.

### Armenian kanon
Closely related to the qanun; in modern Armenia the kanon has settled on **equidistant half-tones** (12-EDO) — the mandals are essentially sharp/flat lifts. Armenian players such as Khachik Sahakyan represent a soloistic concert tradition that has integrated with Western classical norms more thoroughly than Arabic or Turkish lineages. The microtonal capability is *available* on more conservative instruments but not the norm.

### Indian svaramandal / swarmandal
Visually a small, simpler trapezoidal plucked zither (often 21–36 strings). It is **not** played as a melodic lead instrument — it accompanies vocal khayal and thumri singers, providing a shimmering swept drone of the raga's notes between phrases. There are **no mandals**; tuning is set per-raga before the performance and stays fixed. The svaramandal's job is to *be* the raga's pitch set, not to navigate among them — the conceptual inverse of the qanun.

---

## 7. Visual description: what a mandal panel looks like

Stand a player up and look at the qanun from above, with the bass side near you. Your eye sees, left-to-right (bass to treble):

1. **The pegbox** — a strip of pegs (wooden friction pegs) at the far left, one peg per string (so 3 per course; ~78 pegs in a row).
2. **The mandal block** — a wooden plate ~6–10 cm wide running along the left edge, just inboard of the pegbox. This is where the mandals live.
3. **The soundboard** — the long open expanse of strings, with the kafes rosette(s) cut into it.
4. **The bridge on skin windows** — near the right edge, the long bridge resting on its 4 (Turkish) or 5 (Arabic) skin-covered windows.
5. **The hitch pins / fine-tuners** — the right edge where strings are anchored.

Now zoom into the mandal block. For each course (top-to-bottom from bass to treble — there are 26 of them), you see a **horizontal row** of small metal levers, each row is the mandal stack for that one course. Levers are typically:
- Brass (yellow), nickel-plated (silver), or both.
- Numbered or color-coded by maker (Yarman/Weiss instruments use **royal fuchsia** for the "open" / natural position).
- ~5–15 mm long each, packed tightly so you can flip one with a fingertip.
- Spring-loaded into either an "up" (off) or "down" (engaged) position.

Reading top-to-bottom (bass courses at the top in playing position):
- A bass course might have only **3 mandals** because the playing range needed there is narrow.
- A middle-register course (where most modulations happen) might have **8–12 mandals**.
- A treble course might have **5–6 mandals**.

The result is a **sparse, jagged grid** — 26 rows of varying widths, like a stairstep silhouette. **This jagged-grid is the visual signature of a real qanun, and is the right starting point for the makam_studio UI.**

On Arabic instruments the rows are visibly shorter (4–7 mandals per course) and more uniform. On Turkish instruments they are longer and more irregular per course. On the Weiss/Al-Kindi instrument, the rows are dramatic — long, dense, and color-coded so the player can navigate by hue rather than by counting.

---

## 8. Implications for makam_studio

This is the most actionable section. Take everything above as constraints and design choices for the digital instrument.

### 8.1 The mandal grid is the central UI

Not a piano keyboard. Not a fretboard. **A 26-row grid of mandal stacks**, one row per course, jagged-edged (variable mandals per row), with each cell being a tappable lever. This grid is the qanun's distinctive control surface and should be the user's home view.

Each cell shows:
- The pitch it produces (in cents from the open string, in maqam pitch name, or both — user-toggleable).
- Engaged state (down/up). Visually obvious — high contrast.
- Optional color hue indicating "maqam family" the cell belongs to in the current preset.

### 8.2 Maqam preset = saved configuration of all 26 mandal stacks

A maqam preset is a function that, for each of the 26 courses, selects exactly one mandal-down state (or none). Loading a preset *animates* every mandal into its new position; the user sees the qanun retune itself. This is a beautiful gesture and should be performative — not instant.

UX implications:
- Presets should be named (Rast, Bayati, Hijaz, Saba, Nahawand, Kürdi, Hicaz, Uşşak, ...) and ideally categorized by tradition (Egyptian-Bayati, Turkish-Uşşak, Iraqi-Saba, ...).
- Presets should be diff-comparable — "what changed when I went from Rast to Suzinak?"
- The diff itself is a teaching tool: 3 courses changed, 6 mandals flipped — *that's the modulation*.

### 8.3 Karar selection = transposition of the entire mandal config

Karar = the tonic / reference pitch. Selecting "Bayati on D" vs "Bayati on G" is a transposition of every mandal position. Critical UX requirement: **karar is an axis orthogonal to maqam**.

Surface this as a two-control top bar:
- **Karar dropdown** (or scrollable wheel) — the available karars in the current tuning system (yegah, hüseyni-aşiran, dügah, segah, çargah, neva, ... in Turkish naming; the equivalent in Arabic naming).
- **Maqam dropdown** — the maqam name.
- "Apply" gesture (or live as you scroll) snaps every mandal to its computed position for that karar+maqam.

Karar transposition is **not** a simple semitone shift — Turkish maqams especially have non-12-EDO interval structures that do not transpose by integer semitones. The data model must compute the actual cent positions per course per (karar, maqam) pair.

### 8.4 Per-string microtune override (off-grid)

Some pitches in real maqam practice are not on either the Turkish 72-edo grid *or* the Arabic 24-edo grid. To honor this:
- Each mandal cell carries a default cent value (from the system's grid).
- Long-press / right-click a mandal cell exposes a **micro-cent fine-tune** slider (-30 to +30 cents from the grid value, say).
- These overrides are saved per-preset, so users can build a *Weiss-style* preset over the standard grid.
- Visually, off-grid cells should be marked (a small dot, or a different border color) so the user knows the preset is non-default-grid.

### 8.5 Visual: literal trapezoid vs. abstract row layout

Recommendation: **abstract row layout primary, literal trapezoid secondary (toggleable)**.

Reasoning:
- The literal trapezoidal shape is beautiful and the user should see it (probably the entire app's hero / splash). But the trapezoid wastes screen real estate on rectangular displays and pushes mandals into a tiny strip on the left edge — exactly the wrong place for the central UI.
- An abstract horizontal-rows layout (each row = one course, mandals as cells along the row, courses stacked top-to-bottom from low to high) gives every course the full screen width and makes mandals tappable.
- A "show me the qanun" toggle reveals the trapezoid skeuomorph for context, with the mandal stack faithfully positioned where it really lives.
- Mobile: the abstract layout collapses to a vertical scrolling list of courses; the user is always looking at one course's mandal stack at a time, with a global "current maqam preset" header.

### 8.6 Variable mandal counts per course: unify or mirror reality?

The key data-model question. Three options:

1. **Unify to finest granularity.** Internally store every course as a vector of N positions where N = max(Turkish_count, Arabic_count, Weiss_count) ≈ 27. Empty slots are just unused. *Pro*: simple, lets users switch tradition without data migration. *Con*: visually unfaithful to a real Turkish or Arabic qanun.

2. **Mirror reality per-tradition.** Each tradition has its own mandal layout schema — Turkish 6–12 per course (variable), Arabic 4–7, Armenian 2–3. The user picks a tradition; the UI renders its actual mandal grid. Switching traditions reloads the layout. *Pro*: faithful to instrument; teaches the user the real shape. *Con*: more layout code; cross-tradition presets are awkward.

3. **Hybrid.** Internally unified (option 1's data model), but the UI **renders only the mandals that exist for the selected tradition** — Arabic mode hides ¾ of the Turkish mandals; Weiss mode shows all of them. *Pro*: one data model, faithful UI. *Con*: requires explicit per-tradition layout metadata.

**Strong recommendation: Option 3 (hybrid).** Store everything on the finest grid (the Yarman 159-EDO MOS or a similar dense grid is a clean choice — it accommodates both Turkish 72-edo subsets and Arabic 24-edo). At each render, project that grid onto the current tradition's mandal layout. This is what makes a "Weiss-style ultra mode" cheap to add (see 8.7).

### 8.7 Should we offer a Weiss-style ultra-microtonal mode?

**Yes** — but as an opt-in advanced mode, clearly labeled.

Reasoning:
- The Weiss/Yarman 79-tone qanun is a real, documented instrument with a real repertoire and a clear theoretical basis. It belongs in the project's "living archive" framing.
- Hiding it would suggest the qanun is only its 20th-century mass-market form. It isn't.
- Offering it teaches the user that "Turkish 72-edo" and "Arabic 24-edo" are themselves *settlements*, not the full theory.

Implementation: a "tradition" picker with at least four options:
- **Arabic (24-edo)** — 4–7 mandals per course, ¼-tone steps.
- **Turkish (AEU / 72-edo)** — up to ~12 mandals per course, comma-step granularity.
- **Armenian (12-edo)** — sharp/flat only.
- **Weiss (79-tone / 159-edo MOS)** — ~27 mandals per course, ~15-cent granularity, color-coded naturals.

Each tradition ships with a default preset library. Users can build custom presets in any tradition.

### 8.8 The mandal flip as a first-class musical event

The mandal flip is not a UI change — it is a *musical event* with audible consequences (the click + the portamento on still-ringing strings). The audio engine should:

- When a mandal is engaged, *if the course is currently ringing*, perform a glide from the previous pitch to the new pitch over a short, parameterized time (10–80 ms). This is the qanun's signature.
- Optionally play a subtle mechanical click sample.
- Silent flips (when the course is not ringing) are also valid and frequent — pre-flipping for an upcoming phrase.

This sits at the intersection of UI and audio: the user's tap on a mandal cell is both a control event and a sonic event.

### 8.9 The wah / vibrato mode

A dedicated gesture: hold a course ringing, then **tap a single mandal repeatedly** (or hold and shake) to produce the Turkish-style wah. UI surface:
- A note ringing on a course exposes that course's mandal column for rapid alternation.
- Optionally a "lock to oscillate between mandal X and X+1" mode for the user to pluck once and let the wah continue, controlled by a tempo/depth knob.

This is *the* idiomatic gesture; without it the simulator is just a microtonal harp.

### 8.10 Open visualization for a "lesson" view

Beyond the player, a teaching view that shows:
- Real-time which mandals are engaged.
- The current maqam name and karar.
- A pitch-class diagram (octave wheel) with active pitches lit.
- For modulation moments: a "diff" overlay showing which mandals just changed.

This serves the BeatForge-sibling "living archive" framing — the instrument explains itself as you play it.

---

## 9. Open questions

1. **Mandal counts per course on real instruments.** Sources are inconsistent: maqamworld says "small brass levers" without numbers; xen.wiki gives "up to 12" for Turkish; Yarman's 79-tone documentation specifies symmetric 7+8+12 stacks. We need actual measurements from a working luthier (Eken, Çetin, or Levent Güleç in 2026 — Ejder passed in 2014). Recommend: photographs of three real instruments (Egyptian, Turkish, Yarman) annotated with mandal positions and cent values.

2. **Standard "open tuning" cent values per course.** Both Turkish and Arabic standard tunings are described in the literature but I have not located a single authoritative cent-by-cent table. The makam_studio data model needs this nailed down per-tradition. Likely sources: the AEU standard reference, MaqamWorld's Arabic tuning charts, Yarman's published tables.

3. **Egyptian vs. Lebanese vs. Syrian default tunings.** The literature consistently says these "differ slightly" but doesn't quantify. The Egyptian (Umm Kulthum era) tuning is probably the de-facto Arabic default for an MVP; we should document that explicitly and treat the Levantine variants as Phase 2.

4. **Dual-handed mandal idiom and "block flips."** How common is two-handed mandal play, knee/foot operation, and palm-block flipping? Worth a follow-up agent exploring video sources of Baktagir and Salman taqsims for documented technique.

5. **Naming conventions.** Turkish perde names (yegah, dügah, çargah, neva, hüseyni, ...) vs. Arabic note names (do, re, mi, with sika/half-flat suffixes) vs. Western pitch names (D, E, F#, half-flat). The UI must handle all three; which is default?

6. **Is "Weiss mode" truly used by anyone but Weiss / Al-Kindi?** Or is it a one-off that should live in a museum corner of the app rather than as a top-level tradition? Cultural deference suggests we ship it as a tradition equal to the others, but with a "Weiss-tradition" label that credits him.

7. **Skin window timbre.** The 4-vs-5 skin windows give Turkish vs Arabic their distinct timbre. For the synth engine: is this worth a "Turkish vs Arabic body" toggle that swaps an impulse response or a model parameter? Probably yes; needs a separate audio-engine research agent to specify.

---

## 10. Sources

### Primary scholarly / technical
- Ozan Yarman, *Expanded Ph.D. Thesis: 79-Tone Tuning & Theory for Turkish Maqam Music* (2008+). https://www.academia.edu/44935064/
- Ozan Yarman, *79-tone qanun recipe.* http://www.ozanyarman.com/79toneqanun.html
- Ozan Yarman et al., *Julien Jalâl Ed-Dine Weiss: A Novel Proposal for the Middle Eastern Qānūn.* https://www.academia.edu/78568395/
- *Tuning systems for qanun.* Xenharmonic Wiki. https://en.xen.wiki/w/Tuning_systems_for_qanun
- *Qanun.* Xenharmonic Wiki. https://en.xen.wiki/w/Qanun
- *Holdrian comma.* Microtonal Encyclopedia. https://microtonal.miraheze.org/wiki/Holdrian_comma

### Encyclopedic and reference
- *Qanun (instrument).* Wikipedia. https://en.wikipedia.org/wiki/Qanun_(instrument)
- *Kanun (Qanun).* Organology.net. https://organology.net/instrument/kanun-qanun/
- *Julien Jalâl Eddine Weiss.* Wikipedia. https://en.wikipedia.org/wiki/Julien_Jal%C3%A2l_Eddine_Weiss
- *Takht (music).* Wikipedia. https://en.wikipedia.org/wiki/Takht_(music)
- *Swarmandal.* Wikipedia. https://en.wikipedia.org/wiki/Swarmandal
- *Santur.* Wikipedia. https://en.wikipedia.org/wiki/Santur

### Player-focused and cultural
- *The Qanun.* MaqamWorld. https://www.maqamworld.com/en/instr/qanun.php
- George Sawa, *The Qanun.* http://www.georgedimitrisawa.com/the-qanun
- *Muhammad ʿAbduh Ṣāliḥ (1912–1970).* AMAR Foundation. https://www.amar-foundation.org/muhammad-abduh-salih/
- *Egyptian Musician: Qanun Player In Umm Kulthum Band.* http://egyptian-musician.blogspot.com/2012/10/qanun-player-in-umm-kulthum-band.html
- *Abraham Salman.* Jewish Music Research Center, Hebrew University. https://jewish-music.huji.ac.il/en/content/abraham-salman
- *Blind musician who became 'King of the Qanun.'* Point of No Return. https://www.jewishrefugees.org.uk/2022/08/blind-musician-who-became-king-of-the-qanum.html
- Maya Youssef. https://mayayoussef.com/about/ ; https://en.wikipedia.org/wiki/Maya_Youssef
- Abdullah Chhadeh. https://www.abdullahchhadeh.com/
- *Ejder Gulec — Premiere Kanun maker passes.* HYE Times. https://hyetimesmusic.com/2014/07/06/ejder-gulec-premiere-kanun-maker-passes/
- *Kanun Method by Halil Karaduman (KBH-303).* Sala Muzik. https://salamuzik.com/products/qanun-method-by-halil-karaduman-kbh-303
- *Ruhi Ayangil.* Turkish Cultural Foundation. http://www.turkishculture.org/whoiswho/music/conductor/ruhi-ayangil-140.htm
- *An Introduction to the Kanun, the Versatile Plucked Zither.* World Music Central. https://worldmusiccentral.org/an-introduction-to-the-kanun-the-versatile-plucked-zither/
- *Famous 19th Century Oud Makers and Their Legacy* (Nahat family context). Sala Muzik. https://salamuzik.com/blogs/news/famous-19th-century-oud-makers-and-their-legacy

### Construction and pedagogy
- *Tips for Playing the Qanun.* Middle Eastern Dance. http://www.middleeasterndance.net/music/kanun/playkanun.html
- *About Qanun and Other Zither like Instruments.* http://www.middleeasterndance.net/music/kanun/aboutkanun.html
- *Differences Between Arabic Qanun and Turkish Qanun.* Ethnic Musical. https://www.ethnicmusical.com/kanun/differences-between-arabic-qanun-and-turkish-qanun/
- *Tips For Purchasing A Turkish Qanun.* Sala Muzik. https://salamuzik.com/blogs/news/tips-for-purchasing-a-turkish-qanun
- *How To Tune Qanun Easily.* Sala Muzik. https://salamuzik.com/blogs/news/how-to-tune-qanun-easily

### Sources to chase next (not retrieved this round)
- Stewart Carter's organology articles on the qānūn — print-only or behind paywalls.
- *Encyclopaedia of Islam* entry on the qānūn — Brill, paywalled.
- Grove Music Online — qanun and kanun entries — paywalled.
- Cambridge *Tempo* — Anton Rovner, "Epistemology of Tone: An Obituary for Julien Jalâl Ed-Dine Weiss." https://www.cambridge.org/core/journals/tempo/article/abs/epistemology-of-tone-an-obituary-for-julien-jalal-eddine-weiss/1D66B8ADFC5D65A973481BB5BD5E25B0
- Direct interviews with current luthiers: Levent Güleç (Ejder's son), Erdal Çetin, Ali Eken.

---

*This document is intentionally biased toward what the digital instrument's designer and developer need to know. It under-covers ornamental and ensemble repertoire, regional tuning histories, and the qanun's 17th–19th century European reception — all worth their own follow-up agents.*
