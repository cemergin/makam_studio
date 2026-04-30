---
title: "Arabic (Levantine) Maqam: Jins, Family Tree, and Pitch Flexibility"
audience: "makam_studio designers and engineers; readers with Western music-theory literacy who are new to maqam. Useful as background for any Arab-music feature decision."
tldr: |
  Levantine Arabic maqam is best understood not as a fixed list of scales but as a generative system where ~25 ajnas (3- to 5-note cells) stack into named maqamat, with a tonic (qarar), a structural pivot (ghammaz), and a melodic itinerary (sayr). The 24-quarter-tone notation introduced by Mikhail Mishaqa (1820s, Mt Lebanon) is a useful approximation but not an acoustic equality: the half-flat third (e.g. Sikah on E½♭) is performed at meaningfully different cents in Cairo, Aleppo, Damascus, and Baghdad, and even varies by performer within a city. For makam_studio, this argues strongly for a two-tier preset model — jins as the primary modular unit, maqamat as named macros over jins — plus a regional-flavor parameter and per-string overrides.
skip_if: "You are working on Turkish makam, Persian dastgāh, or Azeri mugham specifically — those have separate docs. Skip the historical sections if you only need a feature spec."
date: 2026-04-30
status: draft
---

# TL;DR

- The atomic unit of Arabic maqam is the **jins** (pl. ajnas): a 3-, 4-, or 5-note cell with a fixed internal interval pattern that names itself and persists when transposed. There are roughly 25 canonically named ajnas; a maqam is built by stacking 2 (occasionally 3) of them at a defined join point.
- A maqam is **not just a scale**. It is `(qarar, ajnas-stack, ghammaz, sayr)` — the tonic, the cell decomposition, the structural pivot (usually the join note between ajnas), and a culturally-specified melodic itinerary that includes characteristic ascending vs descending paths and modulation tendencies.
- The 24-equal-quartertone (24-EDO) notation is a **20th-century pedagogical compromise**, not an acoustic truth. Mikhail Mishaqa proposed it ~1840 in Mt Lebanon, and the 1932 Cairo Congress effectively cemented its use over Syrian and other objections. In actual performance the half-flat third (Sikah note) clusters around different centers per region: Egyptian ≈ 345–355 ¢, Aleppine/Damascene ≈ 335–345 ¢ (lower), Iraqi ≈ 355–365 ¢ (higher), all relative to tonic.
- The Levantine practice (Aleppo, Damascus, Beirut, Jerusalem, Iraq adjacent) is closest to Egyptian classical but with distinctive contributions: the **muwashshah / qudud halabiyya** repertoire, denser modulation in the wasla (suite), and slightly lower neutral-third tunings in the Aleppine school. Iraq sits adjacent and shares maqamat-Awj/Iraq/Bastanikar with Levantine practice while having its own Iraqi maqām art form.
- **Maqam World** (maqamworld.com) is the de-facto reference English-language taxonomy. It is excellent on structure (jins → maqam family) and audio examples but does not publish cents values or codify regional intonation. Treat it as canonical for naming + structure, editorial elsewhere.
- For makam_studio: **organize presets by jins as the primary unit; maqamat are named macros that stack ajnas onto a chosen qarar**. Layer a regional-flavor parameter (Cairene / Aleppine / Damascene / Iraqi / "neutral 24-EDO") that biases the half-flat zones. Per-string override is essential — performers do this on the qanun via mandals already.

---

## 1. The jins: atomic unit of the system

A **jins** (جنس, pl. ajnas, "genus") is a small ordered set of pitches — usually 3, 4, or 5 — with a fixed pattern of intervals. Its interval pattern is invariant under transposition; its name attaches to that pattern, and crucially to the *role* it plays in melodic discourse, not merely to the scale fragment as an inert object. Move a jins to a new tonic and it is the same jins; play the same notes with a different sense of structural emphasis and — in some cases — it is a *different* jins (e.g. the Sikah trichord and the bottom three notes of Bayati share two of three pitches but are categorized differently because the third behaves differently).

Western readers should resist the urge to map "jins" onto "tetrachord" too tightly. Greek tetrachords were structural fourths, period. Ajnas range over thirds, fourths, and fifths and are categorized by **size** (3/4/5 notes) but are not bounded by an octave-defining interval. They are also fundamentally *behavioral* — each jins has typical melodic gestures, points of repose, and a characteristic note-to-emphasize-second (the ghammaz). On unfretted instruments (oud, voice, violin, qanun-with-mandal) the same physical pitch is tuned slightly differently inside Rast vs Bayati vs Sikah, *because* it is doing different work.

### 1.1 Canonical ajnas with intervals

The list below tabulates the ajnas requested in the brief plus a few near-essential cousins. Intervals are given two ways:

- **Step pattern** in tones (`1` = whole tone ≈ 200 ¢, `½` = semitone ≈ 100 ¢, `¾` = three-quarter tone ≈ 150 ¢, `½+½` = augmented second ≈ 300 ¢ ).
- **24-EDO cents** as a notational convenience (precise to within ±15 ¢ of typical performance for unambiguous notes; the half-flat zone is given as a range, not a point).

| Jins | Type | Standard tonic | Step pattern (ascending) | 24-EDO cents from tonic | Notes |
|---|---|---|---|---|---|
| Rast | Pentachord | C | 1 — ¾ — ¾ — 1 | 0, 200, 350, 500, 700 | Third = neutral; performance varies (340–360 ¢) |
| Bayati | Tetrachord | D | ¾ — ¾ — 1 | 0, 150, 300, 500 | Second = neutral; root jins of Bayati family |
| Sikah | Trichord | E½♭ | ¾ — 1 | 0, 150, 350 | Tonic *is* a half-flat note — only such jins |
| Hijaz | Tetrachord | D | ½ — 1+½ — ½ | 0, 100, 400, 500 | "Augmented second" central interval; performed *narrower* than written (≈ 270–290 ¢) |
| Hijaz Murassa' | Tetrachord | D | ½ — 1+½ — ¾ — ¼ | (variant) | Decorated Hijaz; has own page on Maqam World |
| Nahawand | Pentachord | C | 1 — ½ — 1 — 1 | 0, 200, 300, 500, 700 | = lower half of natural minor |
| Kurd | Tetrachord | D | ½ — 1 — 1 | 0, 100, 300, 500 | = lower half of Phrygian; ghammaz often on 4th, not 5th |
| Nikriz | Pentachord | C | 1 — ½ — 1+½ — ½ — 1 | 0, 200, 300, 600, 700 | Wholetone-then-Hijaz; basis of Nawa Athar |
| Ajam | Pentachord | B♭ (or C) | 1 — 1 — ½ — 1 | 0, 200, 400, 500, 700 | = lower half of major; Maqam World standard tonic is B♭ |
| Ajam Murassa' | Pentachord | B♭ | (decorated) | — | Variant with internal half-flat decoration |
| Saba | Tetrachord (compressed) | D | ¾ — ¾ — ½ | 0, ~150, ~290, ~390 | Spans *less than a perfect fourth*; melancholic; fourth degree is G♭ |
| Saba Zamzam | (variant) | D | ½ — 1 — ½ | 0, 100, 300, 400 | "Westernized" Saba with no quarter-tones |
| Hijazkar | (compound) | C | ½ — 1+½ — ½ — 1 — ½ — 1+½ — ½ | symmetric Hijaz–Hijaz | Two Hijaz tetrachords joined; sometimes treated as a maqam, sometimes a jins |
| Athar Kurd | Pentachord | D | ½ — 1 — 1+½ — ½ — 1 | 0, 100, 300, 600, 700 | = Kurd lower + Nikriz upper |
| Nawa Athar | Pentachord | C | 1 — ½ — 1+½ — ½ — 1 | 0, 200, 300, 600, 700 | Same intervals as Nikriz but different role/ghammaz; Hungarian-minor-like |
| Lami | Tetrachord | D | ½ — 1 — ½ — 1 (descending) | 0, 100, 300, 400 | Locrian-like; imported from Iraqi practice; treated as "modern" |
| Husseini | (jins/maqam) | A | (≈ Bayati on A with characteristic 6→5 emphasis) | — | More commonly named as a maqam in the Bayati family; in Iraqi/Turkish usage often the *primary* form |
| Mukhalif (Sharqi) | (irregular) | F | — | — | Iraqi-tradition jins; intervals contested; Maqam World lists "Mukhalif Sharqi" but does not size-category it |
| Sikah Baladi | (irregular) | E½♭ | — | — | Egyptian/folk variant, not size-categorized |
| Upper Rast | Tetrachord | G | 1 — ¾ — ¾ | 0, 200, 350, 500 | Used as the *upper* jins above Jins Rast in Maqam Rast |
| Upper Ajam | Tetrachord | F | 1 — 1 — ½ | 0, 200, 400, 500 | Used as upper jins above Rast in Maqam Suznak's daughter forms |
| Jiharkah | Pentachord | F | 1 — 1 — ½ — 1 — 1 | 0, 200, 400, 500, 700 | Major-with-flatted-7th pentachord; standalone family |
| Sazkar | Pentachord | C | 1 — ¾ — ¾ — 1 — ½ | similar to Rast top-end | Decorated Rast variant |
| Mustaar | Trichord | E½♭ | 1 — ½ | 0, 200, 300 | Sikah cousin with raised second |
| Huzam | (functions as maqam) | E½♭ | (Sikah + Hijaz) | — | Most popular Sikah-family maqam; treated as a maqam, not a standalone jins |

Maqam World currently lists 26 ajnas total in its index page, organized by size category (3-note, 4-note, 5-note, "undefined size"). The "undefined" category — Hijazkar, Mukhalif Sharqi, Nahawand Murassa', Saba, Saba Dalanshin, Saba Zamzam, Sikah Baladi — flags items that don't slot cleanly into trichord/tetrachord/pentachord, often because their span is irregular (Saba's compressed third) or because they're really compound structures (Hijazkar).

### 1.2 The neutral interval and the cents problem

The three-quarter tone (¾, ≈ 150 ¢) is the characteristic Arab interval. It is often called a "neutral second"; the resulting ¾ + ¾ stack on top of a tonic produces the **neutral third** (≈ 350 ¢), the third of Jins Rast and the upper bound of Jins Sikah. This neutral third is *the* thing 12-EDO cannot do.

Critically: the neutral third does **not** sit at exactly 350 ¢ in performance. It is a **zone**, not a point. Sami Abu Shumays's "fuzzy boundaries" framing (2009, 2013) is now the consensus modern view: ajnas have characteristic intonational regions, performers move within them contextually, and the same singer may inflect the same scale-degree differently depending on melodic direction or which jins is "active" at the moment. The 24-EDO grid is a staff-notation crutch, not a metric truth. We return to this in §3.

---

## 2. The maqam family tree

A **maqam** is built by joining ajnas at a structural pivot. The lower jins occupies the bottom of the scale starting on the tonic (qarar). The upper jins begins at the **ghammaz** — usually scale degree 4 or 5 — and continues up to the octave (or a degree shy, or a degree past, depending on the maqam). When a third jins is involved, its tonic typically lands on the second jins's ghammaz. The system is generative: name the lower jins, the join point, and the upper jins, and you have specified most of a maqam.

Maqam World classifies maqamat into **eight families** by lower jins: Ajam, Bayati, Hijaz, Kurd, Nahawand, Nikriz, Rast, Sikah. Five maqamat sit *outside* family structure: Jiharkah, Lami, Saba, Saba Zamzam, Sikah Baladi. Some scholars also treat **Nawa Athar** as a family head (the Nikriz family in Maqam World terms); this doc follows the brief and treats Nawa Athar as its own family for clarity.

### 2.1 Rast family

The aesthetic anchor of the system: Rast is to Arab music roughly what C major is to Western. It evokes "pride, power, and soundness of mind" (Touma's gloss).

| Maqam | Tonic | Lower jins | Upper jins (at degree) | Notes |
|---|---|---|---|---|
| Rast | C | Rast (5-note) | Upper Rast or Nahawand on 5 | Canonical form |
| Suznak | C | Rast | Hijaz on 5 | Practically obligatory modulation in performance |
| Nairuz | C | Rast | Bayati on 5 | Same scale as Yakah, different sayr |
| Yakah | G | Rast | Bayati on 5 (= Nairuz transposed down a fifth) | "Archaic" Nairuz |
| Mahur | C | Rast | Ajam on 5 | Brighter, more major-feeling Rast |
| Kirdan | C | (variants on 8) | — | Octave-displaced Rast |

### 2.2 Bayati family

Bayati is the workhorse of vocal repertoire, especially religious (Quranic recitation, mawlid). Its character is yearning, lyrical, "vital, joyful, feminine" (Touma).

| Maqam | Tonic | Lower jins | Upper jins | Notes |
|---|---|---|---|---|
| Bayati | D | Bayati | Nahawand or Rast on 4 | Canonical |
| Husseini | D (or A) | Bayati | (with characteristic 6→5 motion) | Effectively Bayati with extended sayr; in Iraqi practice often the primary form |
| Bayati Shuri | D | Bayati | Hijaz on 4 | Common modulation form |
| Muhayyar | D | Bayati (high octave start) | — | Sayr begins at the octave; descending-emphasized variant |

### 2.3 Sikah family

The only family rooted on a half-flat note. Sikah is the most variable in performance, the most regionally distinctive, and central to piyut/worship traditions in the Aleppine and Jerusalem-Aleppine Jewish communities. Maqam World lists 7 sub-modes: Sikah, Sikah Baladi, Huzam, Iraq, Awj (Iraq), Bastanikar, Mustaar, plus Rahat al-Arwah.

| Maqam | Tonic | Lower jins | Stack | Notes |
|---|---|---|---|---|
| Sikah | E½♭ | Sikah | Upper Rast on 3, Rast on 6 | "Pure" form, rare in repertoire |
| Huzam | E½♭ | Sikah | Hijaz on 3, Rast on 6 | Most common Sikah-family maqam |
| Iraq | B½♭ | Sikah | Bayati on 3, Rast on 6 | Iraqi-tradition flagship |
| Awj (Iraq) | E½♭ | Sikah | Hijaz on 3, Sikah on 8 | Same ajnas as Huzam, different sayr |
| Bastanikar | E½♭ | Sikah | Saba on 3, Hijaz on 5, Nikriz on 8 | Compound; ≈ Sikah + Maqam Saba |
| Mustaar | E½♭ | Mustaar | Hijaz on 3 | Raised-2nd Sikah variant |

Sikah-family maqamat are distinguished by extending the trichord upward differently. Whether Hijaz, Bayati, or Saba sits above the Sikah trichord changes the entire upper character even though the bottom three notes are shared.

### 2.4 Hijaz family

Hijaz scales are immediately recognizable to Western ears as "Middle Eastern" (the augmented-second cliché). Performance practice narrows the augmented second somewhat: the second degree raises slightly, the third degree drops slightly, producing ≈ 270–290 ¢ rather than 300 ¢.

| Maqam | Tonic | Lower jins | Upper jins (at degree) | Notes |
|---|---|---|---|---|
| Hijaz | D | Hijaz | Nahawand or Rast on 4 | Canonical |
| Hijazkar | C | Hijaz | Hijaz on 5 (compound) | Symmetric — Hijaz tetrachord + Hijaz tetrachord; sometimes treated as a single jins-shape |
| Hijaz Kar Kurd | C | Hijaz | Kurd on 5 | Hybrid |
| Shahnaz | D | Hijaz | Nahawand on 5 | Ghammaz on 5 not 4 |
| Shadd Araban | G | Hijaz | Nahawand-on-C descending; Hijaz on 8 | Shadd-Araban is the *third* jins being Hijaz |
| Suzidil | A | Hijaz | Nawa Athar on 4 | Ghammaz on 4 |
| Zanjaran | D | Hijaz | Ajam on 5 | Major-flavored upper |

### 2.5 Nahawand family

Effectively the Arab-music expression of natural / harmonic / melodic minor. Most accessible to Western ears.

| Maqam | Tonic | Lower jins | Upper jins | Notes |
|---|---|---|---|---|
| Nahawand | C | Nahawand | Hijaz or Kurd on 5 | Canonical (Hijaz upper = harmonic minor; Kurd upper = natural minor) |
| Nahawand Murassa' | C | Nahawand Murassa' | (decorated) | Ornamented variant |
| Farahfaza | G | Nahawand | (transposition of Nahawand to G) | Common transposition |

### 2.6 Kurd family

Phrygian-derived. Often the ghammaz is on degree 4, not 5 — a structural difference from most other families.

| Maqam | Tonic | Lower jins | Upper jins | Notes |
|---|---|---|---|---|
| Kurd | D | Kurd | Kurd on 4, then Nahawand or Kurd higher | Canonical |
| Hijaz Kar Kurd | C | Kurd | Hijaz on 4 | Hybrid; sometimes filed under Hijaz family in other taxonomies |

### 2.7 Saba (standalone)

Maqam Saba is one of the most distinctive — and **non-octave-equivalent** — maqamat in the system. The fourth degree (G♭ from D) gives the lower jins a compressed span (less than a perfect fourth). The full scale: D — E½♭ — F — G♭ — A — B♭ — C — D♭. Note the D♭ at the top: ascending to the upper octave, the seventh degree is half-flat *and* the "octave" itself sits a half step below where it "should" — Saba does not return to the same pitch class an octave up. It is the canonical example, but not the only example, of non-octave equivalence in maqam.

| Maqam | Tonic | Stack |
|---|---|---|
| Saba | D | Saba on 1, Hijaz on 3, Ajam or Nikriz on 6 |
| Saba Zamzam | D | "Quarter-tone-free" Saba (½ — 1 — ½) for piano accessibility |
| Saba Dalanshin | D | (variant; see Maqam World) |

### 2.8 Ajam family

Ajam is "the major scale," with a slightly lowered third by Arab-music practice (≈ 390 ¢ rather than 400 ¢). Important in folk and lighter repertoire.

| Maqam | Tonic | Lower jins | Upper jins |
|---|---|---|---|
| Ajam | B♭ (or C) | Ajam | Ajam on 5 |
| Ajam Ushayran | A♭ | Ajam | (transposition) |
| Shawq Afza | C | Ajam | Hijaz on 5 (≈ "harmonic major") |

### 2.9 Nawa Athar / Nikriz family

Hungarian-minor-like. Sometimes filed as a single Nikriz family; we follow the brief.

| Maqam | Tonic | Lower jins | Upper jins |
|---|---|---|---|
| Nawa Athar | C | Nawa Athar (5-note) | Hijaz on 5 (overlapping) |
| Nikriz | C | Nikriz (5-note) | Rast on 5 | Same lower interval pattern as Nawa Athar but different upper structure and sayr |
| Athar Kurd | D | Athar Kurd | (Nikriz upper) | Kurd lower + Nikriz upper |

---

## 3. The half-flat varies — and other pitch-flexibility issues

This is the single most important section for makam_studio's tuning model.

### 3.1 The 24-EDO origin story

In 1820s Mt Lebanon, Mikhail Mishaqa (1800–1888) — Greek-Catholic physician, historian, and music theorist working under the patronage of the emirs of Hasbayya — wrote *Al-Risala al-Shihabiyya fi al-Sina'a al-Musiqiyya* ("The Shihabian Epistle on the Musical Craft"). In it he proposed dividing the octave into 24 equal quarter tones (50 ¢ each). The idea was already circulating — his teacher Sheikh Muhammad al-Attar (1764–1828) had taught it orally — but Mishaqa wrote it down, and the Levant adopted it.

The 24-EDO proposal is **the most consequential single decision** in modern Arab music theory. It made staff notation possible (with two new accidentals: the half-flat and the half-sharp), let conservatories standardize, and underwrote the eventual mass-media exportability of Arab music. It also encoded a falsehood: that the half-flat is a precise pitch.

The 1932 Cairo Congress (briefly: a King-Fuad-I-convened pan-Arab music conference at which European ethnomusicologists, North African and Levantine musicians, and Egyptian scholars debated standardization for three weeks) **failed to formally agree** on the 24-EDO division. Syrian and other Levantine delegations objected on the grounds that it didn't match practice. Despite the lack of formal consensus, 24-EDO entered the Arab conservatory system over the following decades and is now the de facto literacy standard. (See sister doc `egyptian-maqam-and-cairo-1932.md` for full treatment.)

### 3.2 Where the Sikah note actually sits

There is no single answer. The literature converges on something like:

- **Egyptian (Cairene) Sikah**: ≈ 345–355 ¢ above tonic (close to the notational ideal of 350 ¢).
- **Aleppine / Damascene Sikah**: ≈ 335–345 ¢ — **lower** than the Cairene reading. The Aleppine school is consistently described as having a "lower" or "flatter" neutral third.
- **Iraqi Sikah**: ≈ 355–365 ¢ — **higher** than Cairene, brighter.
- **Turkish Segâh** (a related but distinct mode, in Turkish makam, not maqam): ≈ 384 ¢ in Arel-Ezgi-Uzdilek 53-comma theory (1 koma = ~22.6 ¢, segâh sits 5 komas below F natural).

The numerical ranges above are generalizations; individual performers in each city deviate. Abu Shumays's recorded experiments demonstrate that even within Egyptian practice the same note varies up to 30 ¢ between singers, and that what listeners perceive as "in tune" is a probability distribution over that zone, weighted by context.

This is **not** a flaw in the music. It is the music. The flexibility is part of what carries regional, institutional, and individual identity.

### 3.3 Other variable notes

- **Hijaz augmented second** (between scale degrees 2 and 3 in Hijaz): notated as 300 ¢ (1+½ tones) but performed at ≈ 270–290 ¢. The 2 raises ~10–15 ¢, the 3 drops ~10–15 ¢.
- **Bayati second degree** (E½♭ on D tonic): same Sikah-zone variation as above. Often Aleppine performers tune Bayati's E½♭ noticeably *lower* than Rast's E½♭, even though both are notated identically.
- **Saba third degree**: typically ~140 ¢ above the second (smaller than the 150 ¢ neutral second), giving Saba's signature "compressed" feel.
- **Rast third in Cairo vs Aleppo**: the same difference as Sikah.

### 3.4 Theory vs practice: the takeaway

The cleanest summary, from offtonic.com and corroborated by Abu Shumays: *"On unfretted instruments like oud you can tune the F (for example) lower when you play in one maqam than when you play in another."* Pitches are jins-relative, not scale-relative. The qanun is the relevant edge case here — it is fretted but each note has 4–8 mandals (small levers) per string-course, allowing per-pitch microtonal adjustment mid-piece. Maqam practice on the qanun *requires* the player to flip mandals to access the right tuning of "the same" note for the active jins.

---

## 4. Modulation (intiqāl) and melodic itinerary (sayr)

A maqam is not a static collection of notes. It is a *path*. The **sayr** specifies which scale degrees are emphasized when (typically a starting region, an emphasis area in the middle, and an arrival/cadence area), characteristic ascending-vs-descending differences, and which neighbor maqamat are eligible modulation targets.

Key terms:

- **Qarar** (قرار, "settling"): the tonic, and usually the final note. Also called **rukuz**.
- **Ghammaz** (غمّاز): the structural pivot. The note where the upper jins begins. The most-emphasized note besides the tonic. The default landing point of a modulation.
- **Sayr** (سير, "journey"): the maqam's specified itinerary — what to emphasize and when, ascending-vs-descending differences, modulation candidates.
- **Intiqāl** (انتقال, "transition"): modulation. The most common move is to redefine the ghammaz as the new tonic and treat the upper jins as the new lower jins of a different maqam. Modulating from Rast to Nahawand-on-G (i.e. the ghammaz of Rast) is canonical.
- **Wasla** (وصلة): the suite form in which classical Arabic vocal music is traditionally performed. Multiple compositions in related maqamat with planned modulations between them.
- **Ajnas-substitution**: a subtler form of modulation where the lower jins remains but the upper jins is swapped (e.g. Rast with Nahawand-on-5 → Rast with Hijaz-on-5 = Suznak).

The Levantine (especially Aleppine) wasla tradition is **denser in modulation** than the Egyptian. A single Aleppine muwashshah may pass through 4–6 maqamat with multiple sub-modulations within sections, whereas an Egyptian dawr or qasida is typically more anchored. The qudud halabiyya — short folk-song-form pieces refined into art-song repertoire by Aleppine musicians — extend this. Modulations in Levantine practice often lean on the sikah/huzam gateway (going from Bayati to Huzam via shared E½♭) more readily than Cairene practice.

### 4.1 Difference from Turkish *geçki*

Turkish makam *geçki* (a near-cognate term) is more explicitly catalogued and theorized — Arel-Ezgi-Uzdilek-era theorists drew up exhaustive tables of compatible makam pairs. Arabic *intiqāl* is more performative-oral: which modulations are "good" is determined by tradition and ear, not by codified compatibility tables. There is also a notational difference: Turkish makam practice in the AEU framework writes pitches in a 53-comma, mostly-unequal system; Arabic notation uses 24-EDO. The same pitch-class label means different things in each.

---

## 5. Maqam World (maqamworld.com) — what it is, what it isn't

Maqam World is the most-cited English-language maqam reference. It is the work of Johnny Farraj and (later) Sami Abu Shumays. Both are practitioners; the site is opinionated and good. For a builder it is invaluable, with caveats.

**Strengths**:

- Comprehensive **structural taxonomy** — every maqam page lists lower jins, upper jins, ghammaz, related maqamat, family.
- Clear **family taxonomy** — eight families plus standalones, by lower jins.
- Good **audio examples** for nearly every maqam and jins.
- Cross-references between jins pages and maqam pages.
- Companion book *Inside Arabic Music* (Farraj & Abu Shumays, OUP 2019) extends the site to a full reference.

**Weaknesses / editorial choices**:

- **No cents values published** anywhere on the site. Intervals are described as "1, ¾, ¾, 1" or via interactive notation, never as 0/200/350/500/700.
- **No regional intonation map**. Cairene/Aleppine/Iraqi differences are not surfaced.
- **No microtonal flexibility framing** in the structural pages. (Abu Shumays's "fuzzy boundaries" research lives in his academic papers and in *Inside Arabic Music*, not on the maqamworld.com structural pages.)
- **Egyptian-leaning bias**. The default tonic positions, default modulations, and emphasized sayr patterns reflect 20th-century Egyptian classical practice (Umm Kulthum era) more than Aleppine or Iraqi practice. This is *the* default in published English-language Arab music theory broadly, not a Maqam World quirk — but for an instrument that aspires to plural tradition, worth flagging.
- The size-categorization ("trichord / tetrachord / pentachord / undefined") is editorial: Hijazkar in particular is sometimes a maqam, sometimes a jins, depending on context, and Maqam World assigns "undefined."

**Verdict for makam_studio**: use as the canonical naming + structural map. **Do not** use as the cents reference. Layer your own intonation map on top. Cite Maqam World as the structural authority but credit Abu Shumays's papers for pitch flexibility.

---

## 6. Key theorists and references

### Mikhail Mishaqa (1800–1888)
Greek-Catholic physician/historian/theorist, Mt Lebanon and Damascus. *Al-Risala al-Shihabiyya* (~1840). Proposed 24-equal-quartertone division. Levantine origin matters — the system that became pan-Arab originated in the same region we are calling out as having distinctive intonational practice. Mishaqa was systematizing what was already taught orally by his teacher al-Attar.

### Habib Hassan Touma (1934–1998)
Palestinian musicologist (Nazareth, Berlin, Vienna); *Die Musik der Araber* (1975), translated as *The Music of the Arabs* (Amadeus Press, 1996). Long the standard English-language overview of pan-Arab music (Arabia, Levant, Egypt, Maghreb). Brief on technical maqam details but excellent on cultural/historical context, instrumentation, regional practice, and the *role* of music. Includes a partial maqam list (~120 of the ~600+ named ones in the historical literature). Touma's emotional/aesthetic glosses on each maqam ("Rast = pride, power"; "Bayati = vitality") are widely cited and probably overstated, but they are common pedagogical shorthand.

### Scott Marcus
UCSB ethnomusicology. *Arab Music Theory in the Modern Period* (PhD dissertation, UCLA 1989). Extensive published work on maqam pedagogy in Egypt and on the structural analysis of jins. Marcus is *the* reference for understanding how 20th-century Egyptian conservatory practice formalized maqam — and where that practice diverges from older oral tradition. Treat Marcus as the bridge between Mishaqa-era theory and contemporary practice.

### Sami Abu Shumays
Palestinian-American violinist, composer, scholar; co-author of *Inside Arabic Music* (OUP 2019, with Johnny Farraj); developer of MaqamLessons.com. Two key papers:
- **"The Fuzzy Boundaries of Intonation in Maqam"** (2009) — argues that maqam pitches occupy *zones*, not points, and that the obsession with measuring exact cents misses how the system actually works.
- **"Maqam Analysis: A Primer"** (Music Theory Spectrum 35, 2013) — clean structural treatment of the jins-stacking model, plus detailed accounting for non-octave-equivalence (Saba and others).

Abu Shumays's "decolonization" essays on Substack (2023+) push further: the Cairo-Congress-derived systematization was an act of imposing Western mathematical norms on a flexible oral practice. For makam_studio's design philosophy, this is the most relevant living scholar.

### Shireen Maalouf
Lebanese music theorist. *History of Arabic Music Theory: Change and Continuity in the Tone Systems, Genres, and Scales* (Wasteland Press, 2011, 256 pp). The most comprehensive recent English-language history of Arab music theory from al-Kindi (9th c.) through Safi al-Din (13th c.) through Mishaqa to the 20th century. Useful for understanding how each generation revised the system and how the "current" theory came to be the current theory.

### Owen Wright
SOAS, London. *The Modal System of Arab and Persian Music A.D. 1250–1300* (Oxford University Press, 1978). The standard reference on medieval Perso-Arabic theory — Safi al-Din al-Urmawi, Qutb al-Din al-Shirazi, al-Maraghi. Tells you what the system looked like before the Ottoman / Mishaqa-era transformations and clarifies which modern features are old (the modal idea, the role of "shadd"/"jins") vs new (24-EDO, the family taxonomy). For makam_studio, Wright matters mainly as historical grounding: the system is much older than the 20th-century formalization.

### Cairo Congress 1932 (gestural)
Pan-Arab music conference convened by King Fuad I, March 14–April 3, 1932. European ethnomusicologists (Curt Sachs, Robert Lachmann, Erich von Hornbostel, Henry George Farmer, Alois Hába among them) plus Arab delegations from Egypt, Syria, Iraq, Tunisia, Morocco, Algeria. Massive recording effort (~360 78-rpm records), still being remastered as of 2025. Failed to formally codify 24-EDO over Syrian objections. Cemented the 24-EDO system in conservatories nonetheless. (Full coverage: sister doc `egyptian-maqam-and-cairo-1932.md`.)

---

## Implications for makam_studio

### Preset organization: by jins *and* by maqam

The brief asks: by jins (modular) or by maqam (named)? **Both — explicitly tiered**:

1. **Tier 1: jins as the atomic preset unit.** The user can drop any jins onto any tonic on the qanun-like surface and have its interval pattern apply. This is what the system is *actually* about. Naming the unit "jins" — not "tetrachord" — preserves cultural framing.

2. **Tier 2: maqam as a named macro that stacks ajnas.** A maqam preset is a recipe: `{lower_jins: Rast, ghammaz_degree: 5, upper_jins: Hijaz}` etc. Selecting a maqam preset auto-tunes the strings according to the recipe at the chosen qarar. Selecting a different qarar preserves the maqam structure and re-applies it.

3. **Tier 3: family browser as discovery UI.** Show the eight families (plus Nawa Athar/Nikriz, plus standalones) as the top-level browse organization, matching Maqam World's taxonomy.

### Regional flavor: a parameter, not separate presets

Don't ship "Aleppine Sikah" and "Cairene Sikah" as separate preset entries. That doubles the catalog and obscures the underlying unity. Instead:

- Ship **one** Sikah preset (and one of every maqam).
- Add a **regional flavor** parameter at the global instrument level — e.g. `{Egyptian | Aleppine | Damascene | Iraqi | Neutral 24-EDO}`.
- The flavor parameter biases the half-flat zones: Aleppine drops Sikah's E½♭ ~10 ¢, Iraqi raises it ~10 ¢, etc.
- Apply biases by interval *function*, not just by note name: when E½♭ is the third of Rast or the third of Sikah it gets the regional bias; when it appears as the second of Bayati it may get a different (slightly lower in Aleppine practice) bias.

The "Neutral 24-EDO" flavor should be the default — it is the literacy standard, what conservatories teach, what notation specifies, and what most users will expect.

### Per-string override: essential

This is non-negotiable for cultural fidelity. The qanun *literally* exposes per-pitch microtonal adjustment via mandals. The makam_studio control surface should mirror this:

- Selecting a maqam preset auto-tunes all strings.
- The user can then drag any individual string to any cent value.
- Per-string overrides should be visible and persistent (they are part of the patch).
- A "reset to maqam preset" affordance should restore the unmodified preset.
- Saving a tuning state should save both the maqam choice + the overrides.

This handles the case where a user wants Bayati but with the second degree tuned the way *they* tune it — which is exactly what an experienced Arab musician does with a qanun.

### The Saba problem (non-octave equivalence)

Saba doesn't return to the same pitch class an octave up. If makam_studio's surface assumes octave equivalence (e.g. one row of strings per octave with identical tuning per row), Saba breaks the assumption. Solutions:

- Per-row tuning, where each octave-region of strings is tuned independently — closer to how the qanun actually works.
- Or: explicitly model the maqam's full register (often 1.5–2 octaves) and only that register, with extension above/below as octave-transposition of the bottom octave.

Recommendation: the qanun's actual register is ~3.5 octaves and qanun players *do* re-tune in different octaves for Saba and similar maqamat. Mirror this — give each octave-row independent tuning state.

### Naming and notation

- Use Arabic-script names alongside transliteration: "بيات / Bayati". This matters for cultural respect and for users who are reading Arabic source material.
- Use the **half-flat (½♭)** symbol (Unicode U+1D132 or visually rendered) and **half-sharp (½♯)**. Don't fall back to "E quarter-flat" or "Ehd" notations — those are confusing and non-canonical.
- When showing cents, display them as a **range** for half-flat-zone pitches when in non-Neutral flavors (e.g. "E½♭ ≈ 340 ¢ (Aleppine)"). This is honest about the system.

### What to skip in v1

- **Don't** try to ship the full ~120 Maqam World maqam catalog in v1. Ship ~25: the heads of each family, plus 1–3 popular daughters per family. (Bayati, Husseini, Bayati Shuri / Rast, Suznak, Nairuz, Mahur / Hijaz, Hijazkar, Shadd Araban / Nahawand, Farahfaza / Kurd / Saba / Ajam, Shawq Afza / Nawa Athar, Nikriz / Sikah, Huzam, Iraq, Bastanikar.) Add more in subsequent releases.
- **Don't** ship sayr (melodic itinerary) as a hard rule. It's a description, not a constraint. A future "guided practice" mode could show the sayr; the synthesizer itself shouldn't constrain the player's notes.
- **Don't** try to model Turkish makam or Persian dastgah as variants of Arabic maqam. They are sister systems; they get their own preset banks (per the brief's parallel docs).

---

## Open questions

- **Aleppine vs Damascene as separate flavors, or one Levantine flavor?** Consensus literature treats both as "Levantine school" with subtle differences. Argues for one combined "Levantine" flavor in v1; refine if user research demands.
- **Where does Husseini sit — in Bayati family or as its own thing?** Maqam World lists it as a Bayati family member. Iraqi practice elevates it to primary. For makam_studio, ship it under Bayati family.
- **Do we need the Hijazkar / Hijaz Murassa' / Sazkar / Ajam Murassa' decorated variants in v1?** They are subtle. Probably skip in v1, add in v1.1.
- **How do we handle the Sikah-as-tonic-on-half-flat case in the keyboard layout?** If the keyboard maps to a chromatic 12-EDO octave, Sikah's tonic doesn't have a key. Need: a layer that shifts the tonic position by per-maqam metadata. This intersects with the qanun control surface design — punt to `qanun-instrument-design.md`.
- **Should the regional flavor parameter affect *all* half-flats globally, or only the structurally significant ones?** Strong recommendation: only structurally significant ones — i.e. Sikah notes (E½♭ as third of Rast / third of Sikah / etc.) get the regional bias, but a passing E½♭ used as a chromatic ornament doesn't. This is harder to implement and might be a v2 problem.
- **How do we present cents values without overweighting the precision they don't really have?** Probably: show cents as informational/approximate in the UI, never as the user-facing edit unit. User edits in semitone-fractions or in "raise/lower" gestures, with cents shown as the result.

---

## Sources

### Best primary sources

- **Farraj, Johnny & Abu Shumays, Sami. *Inside Arabic Music: Arabic Maqam Performance and Theory in the 20th Century*. Oxford University Press, 2019.** The single best modern English-language reference. Combines Maqam World's structural taxonomy with rigorous treatment of pitch flexibility. *Required reading for makam_studio's audio engine spec.* https://www.amazon.com/Inside-Arabic-Music-Performance-Century/dp/0190658355

- **Abu Shumays, Sami. "Maqam Analysis: A Primer." *Music Theory Spectrum* 35:2 (2013), 235–255.** The cleanest structural treatment of jins-based theory in academic English. Online: https://maqamlessons.com/analysis/media/MaqamAnalysisAPrimer_2013WebFormat.pdf

- **Abu Shumays, Sami. "The Fuzzy Boundaries of Intonation in Maqam: Cognitive and Linguistic Approaches." 2009.** The pitch-flexibility paper. Online: https://www.maqamlessons.com/analysis/media/FuzzyBoundaries_MaqamIntonation2009.pdf

- **Maqam World — https://maqamworld.com/en/** The de-facto English-language structural reference. Best for: family taxonomy (https://maqamworld.com/en/maqam.php), jins index (https://maqamworld.com/en/jins.php), per-maqam structure pages.

- **Marcus, Scott. *Arab Music Theory in the Modern Period*. PhD dissertation, UCLA, 1989.** Foundational on 20th-century Egyptian conservatory formalization.

### Key secondary references

- **Touma, Habib Hassan. *The Music of the Arabs*. Amadeus Press, 1996.** Pan-Arab cultural/historical overview. https://www.amazon.com/Music-Arabs-Habib-Hassan-Touma/dp/0931340888

- **Maalouf, Shireen. *History of Arabic Music Theory: Change and Continuity in the Tone Systems, Genres, and Scales*. Wasteland Press, 2011.** Long-arc theoretical history. https://www.amazon.com/History-Arabic-Music-Theory-Continuity/dp/1600475442

- **Wright, Owen. *The Modal System of Arab and Persian Music A.D. 1250–1300*. Oxford University Press, 1978.** Medieval grounding.

- **Mishaqa, Mikhail. *Al-Risala al-Shihabiyya fi al-Sina'a al-Musiqiyya* (~1840).** The 24-EDO foundational treatise. English-language secondary source via Wikipedia: https://en.wikipedia.org/wiki/Mikhail_Mishaqa

### Useful supplementary sources

- **Abu Shumays, Sami. "The Politics of Maqam Scales and the Decolonization of Music Studies." Substack essay.** https://samiabushumays.substack.com/p/the-politics-of-maqam-scales-and
- **MaqamLessons.com** — Abu Shumays's pedagogical site. https://maqamlessons.com
- **Cairo Congress of Arab Music (Wikipedia).** https://en.wikipedia.org/wiki/Cairo_Congress_of_Arab_Music
- **Arab tone system (Wikipedia).** https://en.wikipedia.org/wiki/Arab_tone_system
- **Arabic maqam (Wikipedia).** https://en.wikipedia.org/wiki/Arabic_maqam
- **Jins (Wikipedia).** https://en.wikipedia.org/wiki/Jins
- **TAQS.IM blog: "Is it Sikah... or Segâh?"** — useful comparison Arab vs Turkish. https://taqs.im/sikah-or-segah/
- **Offtonic Theory §7.9: Maqamat.** Very thorough, opinionated, technically literate. https://www.offtonic.com/theory/book/7-9.html
- **BabaYaga Music: Makams and Cents.** https://babayagamusic.com/Music/Makams-and-Cents.htm
- **Qudud Halabiya (Wikipedia).** Aleppine repertoire context. https://en.wikipedia.org/wiki/Qudud_Halabiya
- **An Open Research Dataset of the 1932 Cairo Congress of Arab Music (arXiv 2506.14503, 2025).** Recent remastering project. https://arxiv.org/pdf/2506.14503

### Sources NOT used / treated cautiously

- Generic "maqam piano scales" pages (cooperpiano.com, pianoscales.org, etc.) — flatten 24-EDO and lose the entire flexibility argument. Useful for audience-building, harmful for engineering reference.
- Auto-summarized PDFs that returned garbled output during research (the Maqam Analysis Primer PDF and the U-Alberta MAQAM chart PDF). Their content is available cleanly via the Abu Shumays website and Maqam World respectively.
