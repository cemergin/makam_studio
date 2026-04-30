---
title: "Persian classical music — dastgāh, āvāz, koron/sori, and the radif"
audience: "makam_studio designers and engineers; future contributors writing Persian-mode presets, microtonal interval models, or qanun/santur-inspired control surfaces"
tldr: |
  Persian classical music is organized into 7 dastgāh and 5 āvāz — but a dastgāh is NOT a scale.
  It is a hierarchical collection of gushehs (melodic modules) with characteristic intervals,
  shâhed/ist/motaghayyer pitches, and modulatory paths. The microtones koron (~quarter-flat)
  and sori (~quarter-sharp) are notation invented by Vaziri (~1935); in *practice* they vary
  ~30–70 cents depending on dastgāh, gusheh, melodic direction, and performer. Farhat (1990)
  rejects the 24-EDO model and proposes 5 interval categories. For a synth, this means Persian
  mode cannot be a single fixed preset — it must expose per-string microtonal sliders, ideally
  templated by dastgāh+gusheh, and probably calibrated against Talai's measurements rather
  than Vaziri's theory.
skip_if: "you are already a Persian-music practitioner — this is a designer's compression of the literature, not a scholarly contribution"
date: 2026-04-30
status: draft
---

# TL;DR

- **A dastgāh is not a scale.** It is a hierarchical *collection of gushehs* — short melodic modules — unified by characteristic intervals, a tonic (ist), a witness pitch (shâhed), and modulatory paths to other modes. Treating it as a scale is the single most common Western misunderstanding.
- **Seven primary dastgāhs** (Shur, Mahur, Homayoun, Segah, Chahargah, Nava, Rast-Panjgah) plus **five āvāz** (Abu-Ata, Bayat-e Tork, Afshari, Dashti — all under Shur — and Bayat-e Esfahan under Homayoun). Most theorists subordinate the āvāz; some (Vaziri) treat them as 12 equal dastgāhs.
- **Koron (~quarter-flat) and sori (~quarter-sharp)** are notational symbols invented by Ali-Naqi Vaziri ca. 1935. In Vaziri's theory they are 50 cents (24-EDO). In practice — measured by Farhat, Talai, During — they vary roughly 30–70 cents, are NOT equal-tempered, and shift with dastgāh, gusheh, and melodic direction. Talai gives ~40 cents for koron; LilyPond/persian.ly defaults to 60 cents koron / 40 cents sori, with a ~20-cent further drop on the note immediately following a koron in certain contexts.
- **Farhat (1990) rejects the 24-EDO model.** He posits five interval sizes (~90, 135, 165, 204, 270 cents) and an unequal 17-tone palette inspired by Safi al-Din al-Urmawi (13th c.). This is the canonical English-language critique and should be the theoretical anchor for any synth that wants to be honest about Persian.
- **The radif** — Mirza Abdullah's mid-19th-c. compilation, his brother Mirza Hosseingholi's parallel radif, and later vocal radifs (Davami, Karimi, Saba) — is the canonical curriculum: ~150–250 gushehs total, transmitted orally, UNESCO-inscribed (2009).
- **Implication for makam_studio:** Persian cannot ship as a single "press the button, get the maqam" preset. The honest path is a *per-string microtonal slider mode*, with dastgāh+gusheh templates as starting points, plus disclaimers about context-dependent intonation. The santur (movable bridges, 9 courses per side) is a more honest physical metaphor than the qanun for Persian specifically.

---

## 1. The dastgāh system — what it is, what it is not

Persian classical music is organized around **dastgāh** (lit. "apparatus" or "system") — a modal complex that comprises:

1. A **collection of gushehs** (lit. "corner" or "niche") — short melodic models, each with its own pitch contour, range, characteristic intervals, and expressive quality.
2. A **set of distinguished pitches** within each gusheh: âghâz (beginning), ist (stop), shâhed (witness — the most prominent pitch), motaghayyer (changeable — a variable pitch, usually direction-dependent), and forud-tone (cadential goal, often the finalis).
3. A **structural arc** in performance: the **darâmad** (introduction, establishing the mode), middle gushehs that ascend in tessitura and may modulate to other modes, the **oj** (climax in the upper register), and a **forud** (cadential return) to the tonic.

A dastgāh is therefore *both* a mode and a curriculum. The "scale" you can extract from it is reductive — it omits which notes are stable vs. ornamental, which are direction-dependent, and which appear only in specific gushehs.

Seven primary dastgāhs are recognized in modern Iranian practice: **Shur, Mahur, Homayoun, Segah, Chahargah, Nava, Rast-Panjgah**. Five **āvāz** — shorter, more melodic-fragment-like derivative modes — are usually subordinated under their parent dastgāh: **Abu-Ata, Bayat-e Tork, Afshari, Dashti** (all under Shur) and **Bayat-e Esfahan** (under Homayoun). Some 19th-c. and early-20th-c. theorists (notably Vaziri) treat the system as 12 equal dastgāhs; Farhat, Talai, and During subordinate the āvāz, giving 7+5. **Shur and Mahur are called the "mothers" of the system** — Shur because the largest number of derivative āvāz spring from it and because its melodic vocabulary is most central to Persian musical identity; Mahur because of its prominence and its rough analogy to Western major.

## 2. Microtones — koron, sori, and the gap between theory and practice

### Vaziri's 24-EDO theoretical framework

Around 1925–1935, Ali-Naqi Vaziri — the founding director of the Tehran Conservatory and a Western-trained theorist — proposed that Persian music could be analyzed as a **24-tone equal-tempered scale**: each octave divided into 24 equal quarter-tones of 50 cents each. He invented two new accidentals to notate the "in-between" pitches:

- **Koron** (کرن): a half-flat — looks like a flat sign with a vertical slash or a backwards/tilted flat. ~50 cents flat in theory.
- **Sori** (سری): a half-sharp — looks like a sharp with one vertical line missing. ~50 cents sharp in theory.

Vaziri's framework was institutionally enormously successful: it became the standard for music education in Iran, the basis for Persian-music transcription, and the de facto representation in software (LilyPond, MusicXML, Unicode 14.0 added the symbols in 2021). It is the framework most Western musicians encounter first.

It is also musicologically wrong, in the sense that no Persian master tunes or plays in 24-EDO.

### Farhat's critique (1990)

Hormoz Farhat's *The Dastgāh Concept in Persian Music* (Cambridge, 1990; revised 2004) is the canonical English-language critique. Farhat argues:

1. **There is no fixed scale in Persian music** — only a "palette of all possible pitches" from which gusheh-specific intervals are drawn.
2. **The 24-EDO model is a Western imposition.** It produces intervals that contradict measured practice and obscures direction-dependent intonation.
3. **Persian melodic intervals fall into five categories** (cents are approximate):
   - Minor 2nd: ~90 cents
   - Lesser neutral 2nd: ~135 cents
   - Greater neutral 2nd: ~165 cents
   - Major 2nd: ~204 cents
   - Plus tone (augmented 2nd): ~270 cents
4. **No interval smaller than ~90 cents** is structurally used; equal quarter-tones (50¢) and equal three-quarter-tones (150¢) do not appear as melodic steps in classical practice.
5. **The 17-tone heritage** of Safi al-Din al-Urmawi (13th c.) is a more honest theoretical antecedent than 24-EDO.

Farhat's neutral-2nd categories are *zones*, not points: he describes the lesser neutral 2nd as ranging 125–145 cents and the greater neutral 2nd as 150–170 cents. The actual cent value chosen depends on the gusheh, the melodic direction, and the performer's ear.

### Talai's measurements

Daryush Talai — student of Nour-Ali Borumand and Ali Akbar Shahnazi, author of *Traditional Persian Art Music: The Radif of Mirza Abdullah* (1995) and *Radif Analysis* — measured contemporary practice and proposed **koron at ~40 cents flat** (not 50). Talai's tunings are the basis for the persian.ly tuning model and LilyPond's default Persian intonation, which uses:

- **Koron: 60 cents flat** (LilyPond default — a compromise between Talai and traditional readings)
- **Sori: 40 cents sharp**
- **A note immediately following a koron is sometimes lowered by a further ~20 cents** when the interval before-koron-to-after-koron is a minor third. This is *not* notated; it is part of the unwritten tuning.

Different sources will give somewhat different cent values — there is no single canonical number, because there is no single canonical practice. The koron in Shur's lower tetrachord is not the same cent value as the koron in Segah's tonic, and a descending koron is typically lower than an ascending koron. **This direction-dependent and context-dependent intonation is not noise around an "ideal" value; it IS the music.**

### Other theoretical frameworks

- **Mehdi Barkešli (1940s):** 22-tone scale based on Pythagorean and just-intonation ratios. Less institutionally influential than Vaziri but theoretically more sophisticated.
- **Safi al-Din al-Urmawi (13th c.):** 17-tone scale built from a Pythagorean spiral of fifths plus neutral intervals. The medieval ancestor.
- **Modern micro-intonation studies** (Sepideh Shafiei, Farshad Sanati, et al.) use pitch histograms from recordings and largely confirm Farhat's qualitative claims — neutral seconds cluster in two zones and koron varies with context.

## 3. The radif — the canonical repertoire

The **radif** (lit. "row" or "order") is the corpus of gushehs organized by dastgāh. It is the core curriculum of Persian classical music: every serious student learns at least one radif by ear, often by setâr or târ first, then internalized as the basis for improvisation.

### Key radifs

- **Mirza Abdullah Farahâni (1843–1918):** The foundational instrumental radif, transmitted orally to a generation of târ and setâr players. ~250 gushehs across the 12 dastgāh/āvāz. Transcribed by Jean During (1970s) from Nour-Ali Borumand's recordings, and by Talai (1995). Considered the most authoritative.
- **Mirza Hosseingholi (his brother):** A parallel târ radif. Slightly different gusheh selection and emphasis. Both brothers studied with their father, Ali Akbar Farahâni.
- **Abolhasan Saba (1902–1957):** Pedagogically simplified violin and santur radifs; widely used for early training.
- **Abdollâh Davami (1891–1980):** The most influential **vocal** radif; ~92 gushehs, with many "concept" gushehs that recur across multiple dastgāhs.
- **Mahmud Karimi (1927–1984):** Davami's pupil; transmitted Davami's vocal radif through his recordings, with very stable melodic content across multiple sessions.

The radif was inscribed on the **UNESCO Representative List of the Intangible Cultural Heritage of Humanity in 2009**.

### Daramad, forud, oj — the performance arc

A traditional dastgāh performance moves through three phases:

1. **Darâmad** ("entry"): an opening gusheh in the home mode that establishes the dastgāh's tonic, characteristic intervals, and shâhed. Often unmetered (avâz).
2. **Middle gushehs**: the performer moves through gushehs of progressively higher tessitura, often modulating briefly to related modes via *modulatory gushehs* (e.g. Heṣar in Chahargah, Mokhâlef in Segah). The **oj** is the highest, most intense gusheh, typically near or at the octave.
3. **Forud** ("descent" or "cadence"): a return to the home mode, usually via stock cadential phrases that re-assert the shâhed and ist.

This arc is structural; it gives a dastgāh performance its narrative shape. Skipping the forud feels unfinished to a Persian listener.

## 4. The 7 dastgāh — portraits

Cents are given relative to a karar (root) of 0¢, using the conventions of Farhat/Talai for koron (~40–60¢ flat) and sori (~40¢ sharp). These are **default reference values, not performance-faithful tunings**.

### 4.1 Shur (شور) — "the mother"

- **Scale (relative to karar G):** G — A koron (~140¢) — B♭ (~290¢) — C (~500¢) — D♭ or D (motaghayyer, ~590¢ descending / ~700¢ ascending) — E♭ (~790¢) — F (~990¢) — G (1200¢)
- **Shâhed:** the 4th degree (C, when karar = G) — the primary melodic goal
- **Ist / finalis:** the karar (G), reached via forud
- **Motaghayyer:** the 5th degree — usually lowered by a microtone in descent, creating a sense of upper-tetrachord finalis on the 4th
- **Aghaz:** typically the 2nd or 3rd degree
- **Characteristic gushehs:** Darâmad, Salmak, Mollâ Nâzi, Golriz, Bozorg, Khârâ, Qajar, Ozzâl, Shahnâz, Qarache, Hoseyni, Bayât-e Kord, Gereyli
- **Aesthetic:** introspective, meditative, devotional. "Demands listener concentration." Diatonic-leaning movement; almost no leaps larger than a 4th.
- **Subordinated āvāz:** Abu-Ata, Bayat-e Tork, Afshari, Dashti
- **Cross-references:** Closest Arabic relative is Bayati (the lower-tetrachord neutral-2nd shape is shared); not equivalent — Persian Shur emphasizes the 4th differently and has different gushehs.

### 4.2 Mahur (ماهور) — the bright "mother"

- **Scale (relative to karar C):** C — D — E — F — G — A — B — C (effectively diatonic major, with a B♭ in the upper register's lower B)
- **Shâhed:** D (the 5th degree, in some readings the upper-tetrachord 5th)
- **Ist:** C
- **Aghaz:** F (the 4th)
- **Aesthetic:** joyful, festive, bright. Often compared to the Western Ionian mode but melodically and ornamentally distinct (ornamentation is Persian; the gushehs include modulations to neutral-second territory unavailable in Western major).
- **Characteristic gushehs:** Darâmad, Dâd, Khosrowâni, Delkash (a modulation toward Shur — adds koron), Shekasteh, Râk, Esfahanak, Saqi-nâmeh
- **Cross-references:** Lowest-overhead bridge to Western harmony; the Delkash modulation is the famous "Persianizing" pivot back into koron territory.

### 4.3 Homayoun (همایون) — the "royal" mode

- **Scale (relative to karar G):** G — A♭ (~100¢) — B (~400¢, raised — note the augmented 2nd between A♭ and B = ~300¢, the "plus tone" interval) — C — D — E♭ — F — G
- **Shâhed:** A koron (in Esfahan-area readings, A koron rather than A♭ — distinguishes Homayoun proper from Bayat-e Esfahan)
- **Ist:** F (intermediate stop)
- **Finalis:** G
- **Aghaz:** E koron
- **Aesthetic:** introspective, mystical, "transcendent / ecstatic." Used in **zurkhâneh** (traditional Iranian gymnasium / martial-arts) ritual music — meaning it carries strong heroic-spiritual associations.
- **Characteristic gushehs:** Darâmad, Châkâvak, Leyli-o-Majnun, Bidâd, Ney-Dâvud, Bâvi, Sho'r, Nowruz-e ʿArab, Nowruz-e Khârâ
- **Cross-references:** Strong family resemblance to Arabic Hijâz / Ottoman Hicaz — augmented 2nd between A♭ and B is the signature. But Persian Homayoun's neutral-2nd elsewhere in the scale and its specific shâhed/ist distinguish it sharply.

### 4.4 Segah (سه‌گاه) — the most "Persian-sounding" mode

- **Scale (relative to karar E koron):** E koron (~360¢ above C) — F (~430¢) — G (~620¢) — A♭ (~720¢) — B♭ (~920¢) — C (~1060¢) — D♭ — E koron
- **Shâhed:** typically E koron (the karar itself) or G
- **Ist / finalis:** E koron
- **Aghaz:** E koron
- **Motaghayyer:** the 5th
- **Aesthetic:** sweet, lyrical, strongly identified as "the Persian sound" — the koron tonic is unusual and deeply characteristic. Wedding music and folk music often draw on Segah.
- **Characteristic gushehs:** Darâmad, Zâbol, Mokhâlef (an Arabic-loanword gusheh — "contrary" — used in the upper range, modulatory), Mu-ye, Hesâr, Maglub
- **Cross-references:** Equivalent to the Arabic/Ottoman Sikâh / Segâh maqâm family, which also tonicizes a koron-pitch (Sikâh's E half-flat).

### 4.5 Chahargah (چهارگاه) — the heroic mode

- **Scale (relative to karar C):** C — D♭ (~90¢) — E (~400¢ — augmented 2nd of ~310¢ between D♭ and E) — F (~500¢) — G (~700¢) — A♭ (~800¢) — B (~1100¢) — C (1200¢)
- **Shâhed / finalis:** C
- **Ist:** A koron (in some readings)
- **Aesthetic:** epic, heroic, bold (ḥamāsi, pahlavāni). Used for Shâhnâmeh (Persian epic) recitation and zurkhâneh. The double-augmented-2nd structure (D♭→E and A♭→B) gives it a powerful, exotic character.
- **Characteristic gushehs:** Darâmad, Zâbol, Mokhâlef, Hesâr, Maglub, Mu-ye, Mansuri, Hodi, Pahlavi, Rajaz
- **Cross-references:** Closest Arabic/Ottoman relative is **Hijâz Kâr** (two Hijaz-style tetrachords stacked). The difference: Hijâz Kâr uses true flats (D♭, A♭), Chahargah uses **half-flats / quarter-flats in some readings** (Persian readings often soften the D♭ slightly toward D koron and similar for A♭). This is contested — some teachers play strict semitones, some play koron-inflected.

### 4.6 Nava (نوا) — quiet contemplation

- **Scale (relative to karar D):** D — E♭ — F — G — A — B♭ — C — D — same scale-pitches as Shur but with a different tonic and shâhed and a different gusheh inventory
- **Shâhed:** the 4th (G)
- **Ist:** D
- **Aghaz:** the 3rd (F)
- **Aesthetic:** quiet, transparent, meditative. Often described as best suited to late-night listening. Related to Shur but with a distinctly cooler emotional palette.
- **Characteristic gushehs:** Darâmad, Gardâniyeh, Naghmeh, Bayât-e Râje, Hoseyni, Tarz, Nahoft, Oj
- **Cross-references:** Same pitches as Shur — distinguishable only by tonic, shâhed, and gusheh-vocabulary. A useful illustration that **dastgāh ≠ scale**: identical pitch collections, two different musical universes.

### 4.7 Rast-Panjgah (راست‌ پنجگاه) — the pedagogical / modulatory mode

- **Scale (relative to karar F):** F — G — A — B♭ — C — D — E — F — diatonic-leaning, similar in surface to Mahur transposed
- **Shâhed:** typically the 5th
- **Ist:** F
- **Aesthetic:** balanced, intellectual, contemplative. Often described as conducive to thinking and concentration.
- **Characteristic gushehs:** Darâmad of Rast, Khosrowâni, Râk-e Hindi, Râk-e Kashmir, Bayât-e Ajam, Pankgâh, Neyshâburak, Mobarqa
- **Special role:** Rast-Panjgah is the most modulatorially flexible dastgāh — almost every other dastgāh's gushehs can be quoted within it. Used pedagogically to teach students how modulation works.
- **Cross-references:** Inherits the name from medieval Maqâm-e Râst (Safi al-Din), but the modern dastgāh is no longer the same modal entity — it absorbed gushehs from many neighbors over centuries.

## 5. The 5 āvāz — portraits (compressed)

These are usually subordinated under their parent dastgāh in modern teaching.

| Āvāz | Parent | Scale (rough) | Aesthetic |
|------|--------|---------------|-----------|
| **Abu-Ata** | Shur | G — A koron — B♭ — C — D — E♭ — F — G | Folk-tinged, popular |
| **Bayat-e Tork** | Shur | F — G — A♭ — B♭ — C — D — E♭ — F | Sweeter, more accessible |
| **Afshari** | Shur | F — G — A♭ — B♭ — C — D♭ — E♭ — F | Plaintive, melancholy |
| **Dashti** | Shur | G — A koron — B♭ — C — D♭ — E♭ — F — G | Pastoral, "shepherd's mode" |
| **Bayat-e Esfahan** | Homayoun | G — A♭ — B — C — D — E♭ — F — G | Romantic-mystical |

Important: in Talai/Farhat practice the cent values for these scales **differ** between the parent and the āvāz — the same notational pitch is tuned differently in Shur than in Dashti. This is a major reason a single fixed scale-preset is insufficient.

## 6. Lineage — Safi al-Din to Mirza Abdullah

- **Safi al-Din al-Urmawi (1216–1294):** Wrote *Kitab al-Adwâr* and *al-Risâla al-Sharafiyya*. Established a 17-tone-per-octave Pythagorean-derived system and described 12 maqâms via tetrachord and pentachord combinations. Foundational for *all* later Middle Eastern theory — Persian, Arabic, Ottoman.
- **Qutb al-Din al-Shirazi (1236–1311):** Refined Safi al-Din's intonation with a mix of super-particular and Pythagorean ratios. More data on individual maqâms.
- **The medieval system was māqâm-based** — the modern dastgāh concept does not appear before the 19th century.
- **The Qajar-era radif compilers** — Ali Akbar Farahâni and his sons Mirza Abdullah and Mirza Hosseingholi — are the proximate source of the modern system. They consolidated centuries of court-musician practice into the named dastgāh / āvāz / gusheh scheme we have today. **This is a 150-year-old codification of older living practice, not an ancient scale theory.** That's important: the modern system is younger than Western tonality is in its Riemann-formalized form.

## 7. Instruments and pitch practice

- **Târ** (long-necked lute, 6 strings in 3 courses, large skin-faced body): movable **gut frets**. The fret placement IS the tuning; the player adjusts frets when changing dastgāh. Standard Persian frets give a subset of the 17-tone palette plus options for koron/sori inflections per neck position. Mirza Abdullah's radif was originally a târ/setâr radif.
- **Setâr** (3-4 strings, smaller, lighter, more intimate): same fret system as târ, smaller voice. Often used for solo introspective performance.
- **Santur** (hammered dulcimer, ~72 strings in 18 courses of 4, two rows of 9 movable bridges per side): **fixed-pitch but bridge-relocatable** — to change dastgāh, the player moves bridges. Only C and G are typically "fixed" reference pitches; everything else gets repositioned to the dastgāh. The santur cannot bend pitch in real time, so its koron values are *whatever the player set the bridge to* — often a compromise between dastgāhs if the performance modulates.
- **Ney** (end-blown reed flute, no keys, no holes for half-steps): pitch is shaped by embouchure and partial fingering. Extremely flexible microtonally — koron and sori values are continuously variable.
- **Kamancheh** (spike fiddle): fretless, fully continuous pitch. Like the ney, it is the *most* flexible — but it offers no fret-positions to crystallize a tuning system.

The two ends of the spectrum — fretless (ney, kamancheh) and fixed-bridge (santur) — bracket the târ/setâr's hybrid: fixed but easily reconfigurable.

## Implications for makam_studio

Persian is the **hardest** of the major Middle Eastern traditions to "preset," for three structural reasons:

1. **Direction-dependent and context-dependent intonation.** A koron is not a single cent value; it shifts with melodic direction (descending koron is typically lower) and with gusheh. A naive synth that assigns one cent value per accidental loses the music's expressive core.
2. **Same pitches, different mode.** Nava and Shur share a pitch collection but are different dastgāhs. Tonic, shâhed, and gusheh-vocabulary make the difference. A scale-only model cannot represent this.
3. **Theoretical disagreement.** Vaziri (24-EDO, 50¢ koron), Barkeshli (22-tone), Farhat (5 interval categories, no scale), Talai (~40¢ koron) — these are not minor disagreements; they are different ontologies. Choosing one tunes the synth into one tradition's framing.

### Recommended design responses

**A. Per-string microtonal sliders are non-negotiable for a "Persian mode."**
The per-string-retunable affordance the project already plans is exactly right for Persian. *Don't* hide it behind dastgāh presets only; expose it as the primary mode of interaction for users who want to follow a recording or a teacher.

**B. Ship dastgāh templates as starting points, not as truth.**
Suggested MVP presets, in priority order of musical centrality:

1. **Shur** — non-negotiable; it is the single most central mode in the tradition.
2. **Mahur** — bridges to Western ears; lowest cognitive entry cost.
3. **Segah** — the most "Persian-sounding" mode; teaches users what koron actually is.

A reasonable v1.5 expansion: **Chahargah** (heroic, augmented 2nd), **Homayoun** (mystical, augmented 2nd), then the rest. Avoid shipping all 12 at MVP — each preset is a teaching commitment, and a half-baked Nava is worse than no Nava.

**C. Each dastgāh preset should expose:**
- The default scale (cents from karar) — clearly labeled "Talai/Farhat reference values; adjust to taste."
- The shâhed, ist, motaghayyer marked visually on the control surface.
- A **gusheh selector** that nudges the cent values when active (e.g. "Mokhâlef gusheh of Segah" raises specific notes).
- A **direction-dependent koron toggle** ("descending koron offset: -20¢") for users who want to follow Persian practice without rebuilding it manually.

**D. The santur is a more honest physical metaphor than the qanun for Persian specifically.**
The qanun's mandals are a Turkish/Arabic affordance for tuning *during* performance; Persian santur tuning is set *before* a performance via bridge relocation, then frozen. Both inform UI design, but if the synth's "Persian mode" needs a metaphor, the santur — fixed pitches, manually relocated, with karar-and-G as anchors — is closer to actual Persian practice. Consider a "Persian Santur Mode" with 9 bridge-positions per side and karar-relative tuning; it might be the most natural Persian UI.

**E. Honor disagreement; don't paper over it.**
Whichever cent values ship as defaults, label them ("Talai 1995" or "LilyPond/persian.ly defaults") and let users select alternatives ("Vaziri 24-EDO," "Farhat zones with random microvariation," "free / per-string"). This is consistent with BeatForge's "living archive" ethos: rhythms (and modes) as connection-engines, not museum-frozen objects.

**F. The 24-EDO trap.**
Web Audio's `frequency` parameter trivially handles arbitrary cents. Do NOT default Persian mode to 50/50 koron/sori cents — that is the one default that is *factually incorrect* per every modern Persian-music scholar. Use ~40¢ sori, ~40–60¢ koron, with documentation explaining why.

## Open questions

1. **How to represent direction-dependent intonation in a per-string control surface** — strings don't know melodic direction. Possible answers: a "descending mode" toggle, or a melodic-history-aware DSP layer, or simply leaving direction-dependent inflection as something the player produces by switching presets manually.
2. **How many dastgāh presets earn their complexity budget for MVP?** Three (Shur, Mahur, Segah) may be enough; five (+Chahargah, Homayoun) gives meaningful coverage; all twelve is probably too many for v1.
3. **Should we model gushehs at all, or only dastgāh-scales?** Modeling gushehs is expensive (each is a melodic template, not just a tuning). Probably out of scope for a synth — but a "current gusheh" selector that adjusts cent values is cheap and meaningful.
4. **How do we represent the augmented-2nd interval clearly in the UI?** It is the single most important interval in Homayoun and Chahargah; users coming from Western training may find ~270¢ confusing.
5. **Vocal radif vs. instrumental radif.** Saba's santur radif and Davami's vocal radif use slightly different gusheh sets. Whose values do we encode? (Likely answer: Mirza Abdullah's instrumental radif via Talai's transcriptions, since they are the most cited in the literature.)
6. **How to credit Talai vs. Farhat vs. During in-app.** Defaults must come from somewhere; the somewhere should be visible.
7. **Localization and naming.** Persian names use specific transliteration conventions; ASCII collapses information. We should pick a transliteration (probably the Iranica conventions) and stick with it, with native-script (شور) optionally shown.

## Sources

### Primary scholarly works (anchor sources)

- Farhat, Hormoz. *The Dastgāh Concept in Persian Music* (Cambridge Studies in Ethnomusicology, 1990; rev. paperback 2004). The canonical English-language critique of the 24-EDO model.
- Talai, Daryush. *Traditional Persian Art Music: The Radif of Mirza Abdullah* (Bibliotheca Iranica: Performing Arts Series, Mazda, 1995).
- Talai, Daryush. *Radif Analysis* (Iranian Book of the Year). Tetrachordal analysis of the radif.
- Nettl, Bruno. *The Radif of Persian Music: Studies of Structure and Cultural Context* (rev. ed. 1992). Includes case studies of Chahargah, Mahur, and Shur.
- During, Jean. *La musique iranienne: Tradition et Évolution* (1984). Major French-language synthesis.
- During, Jean. *Le répertoire-modèle de la musique iranienne* (1970s). Contains measurements of intervals in actual practice.

### Web sources consulted (this document)

- [Dastgāh — Wikipedia](https://en.wikipedia.org/wiki/Dastg%C4%81h)
- [Dastgāh-e Šur — Wikipedia](https://en.wikipedia.org/wiki/Dastg%C4%81h-e_%C5%A0ur)
- [Radif (music) — Wikipedia](https://en.wikipedia.org/wiki/Radif_(music))
- [Koron (music) — Wikipedia](https://en.wikipedia.org/wiki/Koron_(music))
- [Safi al-Din al-Urmawi — Wikipedia](https://en.wikipedia.org/wiki/Safi_al-Din_al-Urmawi)
- [DASTGĀH — Encyclopaedia Iranica](https://www.iranicaonline.org/articles/dastgah/)
- [BAYĀT-E EṢFAHĀN — Encyclopaedia Iranica](https://www.iranicaonline.org/articles/bayat-e-esfahan/)
- [ČAHĀRGĀH — Encyclopaedia Iranica](https://www.iranicaonline.org/articles/cahargah/)
- [ŠUR — Encyclopaedia Iranica](https://www.iranicaonline.org/articles/shur-modal-system/)
- [Persian Classical Music: System of Modes — Foundation for Iranian Studies](https://fis-iran.org/ebook/persian-system-of-modes/)
- [The Dastgah Concept in Persian Music — tuning.ableton.com](https://tuning.ableton.com/persian-radif/dastgah-concept/)
- [Dastgāh-e Māhur — tuning.ableton.com](https://tuning.ableton.com/persian-radif/dastgah-e-mahur/)
- [Dastgāh-e Homāyun — tuning.ableton.com](https://tuning.ableton.com/persian-radif/dastgah-e-homayun/)
- [Dastgāh-e Čahārgāh — tuning.ableton.com](https://tuning.ableton.com/persian-radif/dastgah-e-chahargah/)
- [Dastgāh-e Segāh — tuning.ableton.com](https://tuning.ableton.com/persian-radif/dastgah-e-segah/)
- [Dastgāh-e Navā — tuning.ableton.com](https://tuning.ableton.com/persian-radif/dastgah-e-nava/)
- [Dastgāh-e Rast-Panjgāh — tuning.ableton.com](https://tuning.ableton.com/persian-radif/dastgah-e-rast-panjgah/)
- [Dastgāh-e Bayāt-e Esfahān — tuning.ableton.com](https://tuning.ableton.com/persian-radif/dastgah-e-bayat-e-esfahan/)
- [LilyPond Notation Reference: Persian classical music](http://lilypond.org/doc/v2.25/Documentation/notation/persian-classical-music) — exact koron/sori cent values used in modern engraving.
- [An analysis of Iranian Music Intervals based on Pitch Histogram (Shafiei, 2021, arXiv 2108.01283)](https://arxiv.org/pdf/2108.01283)
- [A Rational Intonation Approach to Persian Music (Mofakham, Živá hudba 2023)](https://ziva-hudba.info/wp-content/uploads/2024/07/Mofakham_ZH14_Rational_Persian_4.pdf)
- [Majnuun Music & Dance — dastgāh primers](https://majnuunmusicanddance.com/) (Mahur, Segah, Homayoun, Esfahan articles).
- [Tapadum — Iranian traditional music overview](https://tapadum.com/iranian-traditional-music-history-dastgah-system-and-instruments/)
- [Center for Iranian Music — Concepts & Terminology](https://centerforiranianmusic.org/concepts/)
- [Arabic Maqam and Persian Dastgah Comparison — oudforguitarists.com](https://www.oudforguitarists.com/arabic-and-persian-music-maqam-dastgah-comparison/)
- [Setar — Wikipedia](https://en.wikipedia.org/wiki/Setar) and [Tar (string instrument) — Wikipedia](https://en.wikipedia.org/wiki/Tar_(string_instrument)) — fret/string information.
- [Santur — Wikipedia](https://en.wikipedia.org/wiki/Santur) — bridge layout and tuning practice.
- [How to Tune a Persian Santoor — Delaramm](https://www.delaramm.com/how-to-tune-a-persian-santoor-a-comprehensive-guide/)

### Note on cent values

Cent values throughout this document are *reference defaults*, drawn primarily from Talai's measurements and the LilyPond/persian.ly tuning model, with explicit acknowledgment of Farhat's range-based view. Persian musicians do not play these values exactly; the values are scaffolding, not score. Any synth implementation should make these adjustable and labeled by source.
