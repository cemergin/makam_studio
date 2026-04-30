---
title: "Ottoman / Turkish Makam: Theory, Practice, and Implications for a Browser-Based Maqam Synthesizer"
audience: "musicologists, audio engineers, makam-curious users, makam_studio implementers"
tldr: >
  Turkish art music codifies its melodic universe in the 24-tone Arel-Ezgi-Uzdilek
  (AEU) Pythagorean system, theorized as a subset of 53-tone equal temperament with
  the Holdrian comma (~22.64 ¢) as the smallest unit. Performance practice — by ney,
  tanbur, kemençe, kanun and voice — diverges measurably from AEU; this is
  documented quantitatively by Karaosmanoğlu, Bozkurt, Akkoç and Yarman (whose
  79-tone system is the most-cited corrective). A makam is not a scale: it is a
  scale plus a *seyir* (melodic trajectory) plus *durak/güçlü* function plus a
  catalogue of conventional modulations (geçki). For a browser-based maqam
  synthesizer this means: ship 53-EDO as the underlying grid, expose 24 named
  perdes, but allow per-string offsets so users can dial in tanbur-school or
  kanun-school deviations.
skip_if: "you only care about Arabic 24-EDO maqam, or you already know AEU and seyir cold"
date: 2026-04-30
status: draft
---

# TL;DR

- **Tuning grid:** Theory uses 24-of-53-EDO with a Holdrian comma of ~22.64 ¢; performance does not. Plan for both.
- **Naming layer:** The named **perdes** (Yegâh, Rast, Dügâh, Segâh, Çârgâh, Nevâ, Hüseynî, Eviç, Gerdâniye, Muhayyer …) are the lingua franca; AEU sharps/flats sit on top of those names. Use perde names as primary labels, AEU notation as secondary.
- **A makam is a scale + a seyir + a function map.** Static synths can ship the scale and tonal-function metadata (durak, güçlü, leading tone, asma karar) but cannot enforce seyir.
- **Critical perdes are *not* fixed in performance.** The Uşşâk segâh (~145 ¢ above Dügâh in theory but ~120–135 ¢ in practice) and the Hicaz/Saba "augmented second" (~250–270 ¢ in practice, not the theoretical 271 ¢) are the most contested. A v1 should expose them as user-tunable.
- **Recommended v1 maqam preset set (Turkish):** Çârgâh, Bûselik, Kürdî, Rast, Uşşâk, Hüseynî, Hicaz, Hümâyûn, Uzzal, Zirgüle'li Hicaz, Hicazkâr, Şedaraban, Saba, Segâh, Hüzzam, Müsteâr, Nihavend, Nikriz, Karcığar, Sûzinâk, Mahur, Acemaşîrân — 22 makams covers ~95 % of the standard repertoire's modal vocabulary.
- **Default qanun layout:** 26 courses × 3 strings = 78 strings, range A2–E6 (3.5 octaves), each course assigned to a perde from Kaba Yegâh upward. Mandals quantized to multiples of the comma.

---

## 1. Lineage: from Urmawi to Arel-Ezgi-Uzdilek

Turkish theoretical writing on makam is unusually self-conscious about its own history. The modern theorist's frame of reference is a chain of treatises:

- **Safi al-Din al-Urmawi** (1216–1294, Kitâb al-Adwâr): a 17-tone-per-octave Pythagorean scale built by stacking 11 fifths up and 5 down, written using the alphabet (*ebced* / abjad). Urmawi's intervals are limmas (Pythagorean diatonic semitone, ~90 ¢), apotomes (~114 ¢), and Pythagorean whole tones (~204 ¢). Already in Urmawi's time it was acknowledged that the 17-tone grid was an idealization: practitioners played "neutral" intervals (around 11/10, 12/11, 13/12 — between 138 and 165 ¢) that the system handled awkwardly.
- **Abdülbâki Nâsır Dede** (late 18th c., *Tedkîk u Tahkîk*) and **Dimitrie Cantemir** (~1700, *Kitâbü 'İlmi'l-Mûsîkî*) extend Urmawi's letter-notation and codify what's playable on the long-necked **tanbur** of their day. Cantemir's surviving repertoire of *peşrev* and *saz semâisi* in his own letter-notation is the largest pre-modern Ottoman score corpus. Murat Bardakçı's modern scholarship has been central to bringing these sources back into circulation.
- **Rauf Yekta Bey** (1922 *Encyclopédie de la Musique*): proposes a 24-tone Pythagorean scale extending Urmawi (11 fifths up + 12 down), explicitly *to differentiate Turkish theory from Arabic 24-EDO* — a politically motivated decision in the early Republican period. Yekta puts the system on a Western five-line staff with new accidentals.
- **Hüseyin Sadettin Arel, Suphi Ezgi, Murat Uzdilek** (1930s–40s) systematize Yekta's grid into what is now called the **Arel-Ezgi-Uzdilek (AEU) system**, which has been the conservatory standard since Türk Musikisi Devlet Konservatuvarı opened in 1976.

The AEU "innovation" is actually conservative: it preserves Urmawi's Pythagorean approach and extends it by a few more fifths. It does *not* equalize quarter-tones the way Mansour Awad's Arabic 24-EDO does. The political subtext — Turkish art music must be *not* Arab and *not* Byzantine — is now openly discussed in the literature (cf. Yarman 2008).

## 2. The AEU 24-tone system

### 2.1 The Holdrian comma and 53-EDO

AEU treats the octave as 53 equal "commas" (the **Holdrian comma**, named after William Holder, 1694), each of which is `1200/53 ≈ 22.6415 ¢`. This is famously close to both:

- the **Pythagorean comma** (`(3/2)^12 / 2^7 ≈ 23.46 ¢`)
- the **syntonic comma** (`81/80 ≈ 21.51 ¢`)

— hence 53-EDO's reputation as a near-perfect representation of 5-limit just intonation. Turkish theory uses *only* the Pythagorean reading: the natural notes form a chain of pure fifths.

Of the 53 possible pitches AEU only labels **24 per octave**. The whole tone (tanini, 9 commas) is divided into intervals named:

| Name (Turkish) | Commas | Cents (53-EDO) | Pythagorean ratio | Western analogue |
|---|---|---|---|---|
| koma / fazla | 1 | 22.64 | (Pythagorean comma) | (no equivalent) |
| eksik bakiye | 3 | 67.92 | — | (small semitone, rare) |
| **bakiye** | **4** | **90.57** | **256/243 (limma)** | diatonic semitone |
| **küçük mücenneb** | **5** | **113.21** | **2187/2048 (apotome)** | chromatic semitone |
| **büyük mücenneb** | **8** | **181.13** | **65536/59049** | "neutral / minor" tone |
| **tanini** | **9** | **203.77** | **9/8** | major (whole) tone |
| artık ikili (augmented 2nd) | 12–13 | 271.7–294.3 | 19683/16384 ≈ 12 commas | augmented second |

The four bolded intervals (bakiye, küçük mücenneb, büyük mücenneb, tanini) are the structural "cins" intervals from which all tetrachords/pentachords are built; their AEU accidentals (1, 4, 5, 8 koma sharp/flat) are the standard signs you see in Turkish scores.

### 2.2 The accidentals

Modern AEU notation overlays five accidentals on top of the Western staff:

- 1-koma flat / sharp: small wedge or backwards flat (rare in practice, used for inflection)
- **4-koma flat (bakiye flat)** — slashed flat, lowers a pitch by a Pythagorean limma
- **5-koma flat (küçük mücenneb flat)** — standard flat, lowers by an apotome
- **8-koma flat (büyük mücenneb flat)** — bracketed/double flat
- 4 / 5 / 8-koma sharps: dual / triple-tipped versions of the standard sharp

So a "Segâh" perde — the third degree of Rast — is written as B with a *1-koma flat* (because it is one comma below B-natural, sitting at 22 commas above the Rast tonic G, equivalent to ~498.0 ¢). In Uşşâk the same literal pitch slot is treated differently in performance (see §4.2). This is the first hint that *the same staff symbol can name different played pitches depending on the makam.*

### 2.3 The principal critiques

The AEU system has two famous failure modes, both well-documented empirically:

1. **It cannot encode the Uşşâk neutral second.** AEU's büyük mücenneb (8 commas, ~181 ¢) and küçük mücenneb (5 commas, ~113 ¢) bracket the "neutral second" but neither *is* it. Performers play Uşşâk's segâh perde at ~120–135 ¢ above the durak, which AEU writes as 5 commas but which performers actually realize larger.
2. **It cannot encode the Saba lowered fourth and the Hicaz augmented second consistently.** The Hicaz "augmented second" lives at ~270–290 ¢ in performance; AEU's 12-comma reading (~272 ¢) is the closest grid point but performers often play sharper.

The two best-known proposed fixes:

- **Yarman 79-tone (PhD thesis, ITÜ MIAM, 2008)**: divides the just fifth (3/2) into 33 equal parts → ~21.21 ¢ each, then takes 79 of those steps to span an octave (= 79-of-159-EDO MOS). Yarman's corresponding "79-tone qanun" prototype distributes mandals so that each course supports up to 7 flats and 8 sharps (15 settings). The system is rigorous and does represent measured intonation better than AEU, but it is not used in conservatories.
- **Karaosmanoğlu** (Yıldız Technical University, 2009 onward): rather than propose a tighter grid, he proposes calibrating AEU's *named* perdes to whatever the master performers actually play, measured by f0 histogramming of recordings (Niyazi Sayın on ney, Necdet Yaşar on tanbur, etc.). His pitch-histogram method, developed jointly with Barış Bozkurt and Can Akkoç, is now the gold standard for empirical makam analysis (see Bozkurt 2008, Gedik & Bozkurt 2010, Akkoç 2002).

The takeaway for any synthesizer: **53-EDO is a good underlying grid, AEU is a usable labelling system, but if you want the music to sound right, expose per-perde fine offsets.**

## 3. The named perdes

Named perdes are the practical layer that musicians actually use. They are positional names referenced to a fixed nominal pitch (the tanbur's lowest open string, *Kaba Yegâh*, traditionally tuned somewhere between A2 and D3 — there is no absolute reference). Below: the canonical 24 perdes between Yegâh and Tîz Çârgâh, with their commas above Kaba Çârgâh (the conceptual "C") and their AEU staff letter.

| Perde | Region | AEU staff | Commas above Kaba Çârgâh |
|---|---|---|---|
| Kaba Çârgâh | low | C3 | 0 |
| Kaba Nim Hicaz | low | D♭3 (4-koma) | 4 |
| Kaba Hicaz | low | D♭3 (5-koma) | 5 |
| Yegâh | low | D3 | 9 |
| Pest Hisar | low | E♭3 (4-koma) | 13 |
| Hüseynî Aşîrân | low | E3 | 18 |
| Acem Aşîrân | low | F3 | 22 |
| Irak | mid-low | F♯3 (1-koma) | 27 |
| Gevest | mid-low | F♯3 (4-koma) | 26 |
| **Rast** | mid | G3 | 31 |
| Nim Zirgüle | mid | A♭3 (4-koma) | 35 |
| Zirgüle | mid | A♭3 (5-koma) | 36 |
| **Dügâh** | mid | A3 | 40 |
| Kürdî | mid | B♭3 (5-koma) | 45 |
| **Segâh** | mid | B♭3 (1-koma) | 49 |
| Bûselik | mid | B3 | 49 |
| **Çârgâh** | mid | C4 | 53 |
| Nim Hicaz | mid-high | D♭4 (4-koma) | 57 |
| Hicaz | mid-high | D♭4 (5-koma) | 58 |
| **Nevâ** | mid-high | D4 | 62 |
| Hisar | mid-high | E♭4 (4-koma) | 66 |
| **Hüseynî** | high | E4 | 71 |
| Acem | high | F4 | 75 |
| **Eviç** | high | F♯4 (1-koma) | 80 |
| Mahur | high | F♯4 (5-koma) | 81 |
| **Gerdâniye** | high | G4 | 84 |
| Nim Şehnaz | high | A♭4 (4-koma) | 88 |
| Şehnaz | high | A♭4 (5-koma) | 89 |
| **Muhayyer** | high | A4 | 93 |
| Sünbüle | high | B♭4 (5-koma) | 98 |
| **Tîz Segâh** | high | B♭4 (1-koma) | 102 |
| Tîz Bûselik | high | B4 | 102 |
| **Tîz Çârgâh** | high | C5 | 106 |

Bolded perdes are the most-named ones in repertoire. Note the asymmetry:

- *Acem Aşîrân* is below Rast, *Acem* is above Nevâ — both at literal F natural one octave apart, but with different scale-functional names.
- *Mahur* is the chromatic neighbour of Eviç and is not the same as the makam called Mahur.
- The "tîz" prefix means "high"; "kaba" means "low/heavy"; "nim" means "half" (used for the lower of two semitone neighbours).

This nomenclature is older than AEU and survives because it carries scale-degree meaning, not absolute pitch. **For makam_studio: name the courses by perde, not by pitch.**

## 4. The makam catalog (v1 set, 22 makams)

For each makam: ascending and descending scales (where they differ); the constituent **çeşni** (tetrachord / pentachord); durak (final), güçlü (dominant), tîz durak (octave above the durak); seyir type; and a one-line melodic personality.

I use the AEU convention of writing scales starting from **Dügâh (A) or Rast (G)** as appropriate to the makam's actual durak. Half-flat = 1-koma flat, "k4" = 4-koma flat (bakiye), "k5" = 5-koma flat (küçük mücenneb).

### 4.1 Çârgâh (the "theoretical major")

- Scale: C – D – E – F – G – A – B – C (all naturals, equivalent to Western major)
- Tetrachord/Pentachord: Çârgâh pentachord on Çârgâh + Çârgâh tetrachord on Gerdâniye
- Durak C, güçlü G, tîz durak C′
- Seyir: ascending (çıkıcı)
- Personality: AEU "ground zero." Almost never played as a primary makam in actual repertoire — it exists mostly to demonstrate the system. Real Turkish music gravitates to neutral-tone modes.

### 4.2 Rast — "the natural makam"

- Ascending: G – A – B(1-koma flat = Segâh) – C – D – E – F♯(1-koma flat = Eviç) – G
- Descending: same, but the leading-tone Eviç often resolves down through Acem (F♮) so the upper tetrachord becomes Bûselik
- Çeşni: Rast pentachord on Rast + Rast tetrachord on Nevâ
- Durak G (Rast), güçlü D (Nevâ), tîz durak G′ (Gerdâniye)
- Seyir: ascending; "dignified"; majors-adjacent but not major (the third and seventh are neutral)
- The C of the system. Rast literally means "right / true." If you only ship one makam, ship this.

### 4.3 Uşşâk

- Scale: A – B(small lowered ≈ "Uşşâk segâh") – C – D – E – F – G – A
- Çeşni: Uşşâk tetrachord on Dügâh + Bûselik pentachord on Nevâ
- Durak A (Dügâh), güçlü D (Nevâ), tîz durak A′ (Muhayyer)
- Seyir: ascending; "longing"
- The famous **"Uşşâk segâh perdesi"** problem: AEU writes B with a 1-koma flat (so 4 commas below B♮, = ~498 ¢ above C and ~158 ¢ above A). Karaosmanoğlu's measurements show performers actually play this around 120–145 ¢ — *significantly flatter* than AEU specifies. This is the single most-cited example of theory/practice mismatch.

### 4.4 Hüseynî

- Scale: A – B(1-koma flat) – C – D – E – F♯(1-koma flat) – G – A; descending often substitutes F♮ (Acem)
- Çeşni: Hüseynî pentachord on Dügâh + Uşşâk tetrachord on Hüseynî
- Durak A (Dügâh), güçlü E (Hüseynî), tîz durak A′
- Seyir: descending–ascending (inici-çıkıcı)
- Bedrock of folk and classical alike. The fifth degree (Hüseynî perde) carries enormous identity weight — a piece that doesn't dwell on it doesn't sound like Hüseynî.

### 4.5 The Hicaz family

All durak A (Dügâh), but distinguished by upper-tetrachord choice:

**Hümâyûn**
- Scale: A – B♭(k5) – C♯ – D – E – F – G – A
- Hicaz tetrachord on Dügâh + Bûselik pentachord on Nevâ
- Avoids Eviç; descending-ascending. Most "minor"-sounding of the family.

**Hicaz** (proper)
- Scale: A – B♭(k5) – C♯ – D – E – F♯(1-koma flat = Eviç) – G – A
- Hicaz tetrachord on Dügâh + Rast pentachord on Nevâ
- Güçlü E, tîz durak A′. The Eviç is the structural marker that distinguishes Hicaz from Hümâyûn.

**Uzzal**
- Hicaz pentachord on Dügâh + Uşşâk tetrachord on Hüseynî
- Güçlü E. Has the augmented-second prominently in the lower pentachord.

**Zirgüle'li Hicaz**
- Hicaz pentachord + Hicaz tetrachord on Hüseynî (two augmented seconds!)
- Güçlü E. Descending-ascending. The most "exotic" sounding member.

**Hicazkâr**
- Notes: G – A♭(k5) – B(k4 = 1 comma below B♮) – C – D – E♭(k4) – F♯ – G
- Hicaz pentachord on Rast + Hicaz tetrachord on Nevâ (transposed Zirgüle'li Hicaz)
- Durak G (Rast), güçlü D
- A *şed* (transposition) that placeholders a different durak. Bright, almost flamenco-adjacent.

**Şedaraban**
- Like Hicazkâr but built down on Yegâh (D)
- Hicaz pentachord on Yegâh + Hicaz tetrachord on Nevâ
- Durak D (Yegâh), güçlü A (Dügâh)
- Heavy, low, ceremonial.

### 4.6 Saba — the unique downward-resolving makam

- Scale: A – B(1-koma flat) – C – D♭(k4) – E♭(k5) – F – G – A
- Çeşni: Saba *trichord* (rare!) A–B(half-flat)–C, then Hicaz tetrachord transposed to Çârgâh: C–D♭–E♭(or natural)–F, then a high segment
- Durak A (Dügâh), güçlü C (Çârgâh)
- Seyir: descending (inici)
- The fourth degree (perde *Hicaz*) sits *below* what AEU notates as the fourth above Dügâh — a "lowered fourth" that's the makam's calling card. Saba is the makam of *yearning* (the name itself means "morning breeze" / "longing"); it's the only canonical makam whose identity *requires* a downward resolution.

### 4.7 The Segâh family

All centered on **Segâh perde** (B 1-koma flat) as durak — a microtonal tonic. This is the family that most distinguishes Turkish from Western theory.

**Segâh**
- Durak B(1-koma flat) (Segâh!), güçlü E (Hüseynî), tîz durak B(1-koma flat)′ (Tîz Segâh)
- Lower segment: Segâh trichord on Segâh; upper: Hicaz tetrachord on Eviç
- Seyir: ascending. Mystical, often used in Sufi repertoire.

**Hüzzam**
- Durak B(1-koma flat) (Segâh), güçlü E♭(k5) (Hisar) or Hüseynî
- Segâh pentachord + Hicaz tetrachord rooted on the third (Nevâ → Eviç)
- Famously melancholic.

**Müsteâr**
- Durak B(1-koma flat) (Segâh), güçlü E (Hüseynî)
- Identical to Segâh but the F is sharpened — Uşşâk tetrachord on Segâh ("Müsteâr tetrachord")
- Heard transitionally; usually resolves back to Segâh.

### 4.8 Other essentials

**Nihavend**
- Scale: G – A – B♭(k5) – C – D – E♭(k5) – F♯ – G (Western harmonic minor on G when ascending; natural minor with Kürdî tetrachord on D when descending)
- Bûselik pentachord on Rast + Hicaz (or Kürdî) tetrachord on Nevâ
- Durak G, güçlü D
- Seyir: descending-ascending. The most "Western minor"-sounding makam — beloved in late-Ottoman / early-Republican song and the obvious gateway for Western-trained ears.

**Kürdî**
- Scale: A – B♭(k5) – C – D – E – F – G – A (Western Phrygian on A)
- Kürdî tetrachord on Dügâh + Bûselik pentachord on Nevâ
- Durak A, güçlü D
- Plain, modal, somber.

**Nikriz**
- Scale: G – A – B♭(k5) – C♯ – D – E – F♯ – G (Nikriz pentachord = T-S-A-S in 9-5-12-5 commas)
- Nikriz pentachord on Rast + Rast or Bûselik tetrachord on Nevâ
- Durak G, güçlü D
- Heroic, "marching" character. Shared genus with Persian *Chahargah*.

**Sûzinâk** (basit / simple)
- Scale: G – A – B(1-koma flat = Segâh) – C – D – E♭(k5) – F♯ – G
- Rast pentachord on Rast + Hicaz tetrachord on Nevâ
- Durak G, güçlü D
- Hybrid: Rast colour below, Hicaz colour above.

**Karcığar**
- Scale: A – B(1-koma flat) – C – D – E♭(k5) – F♯ – G – A
- Uşşâk tetrachord on Dügâh + Hicaz pentachord on Nevâ
- Durak A, güçlü D
- Folk-adjacent, danceable. "Türkü flavour."

**Mahur**
- Scale: G – A – B – C – D – E – F♯ – G (Western major on G — *the* Western-major makam)
- Çârgâh pentachord transposed to Rast + Çârgâh tetrachord on Gerdâniye
- Durak G, güçlü D, descending in character
- Surprisingly common in late-Ottoman repertoire. Rast's "harder," brighter sister.

**Acemaşîrân**
- Çârgâh transposed down to Acem Aşîrân (F)
- Durak F, güçlü C (Çârgâh)
- Descending. Same intervals as Çârgâh, lower tessitura.

## 5. Seyir — the missing dimension

**Seyir** ("route, movement, contour") is the rule that two makams sharing identical scales are still distinct. The classic example: Hüseynî and Muhayyer share their entire pitch collection, but Hüseynî *unfolds upward from the durak* (descending–ascending shape, lower tessitura), while Muhayyer *enters from the octave above* and works its way down. They sound and feel completely different.

Three canonical seyir types:

- **Çıkıcı (ascending)** — opens at or near the durak, climbs to the güçlü, eventually reaches the tîz durak, descends to close on the durak. Examples: Rast, Nikriz, Çârgâh, Segâh.
- **İnici (descending)** — opens at or near the tîz durak (octave) or even above, descends through the güçlü to the durak. Examples: Mahur, Saba (peculiarly, the pure descender), Acemaşîrân.
- **İnici-çıkıcı (descending-ascending)** — opens around the güçlü, dips below it, then climbs to the tîz durak before final descent. Examples: Hüseynî, Hicaz, Hümâyûn, Nihavend, Hüzzam.

Adjacent to seyir is the concept of **asma karar** (suspended cadence) — momentary pauses on degrees other than the durak. Each makam has its own catalogue of "approved" asma karar pitches with their conventional çeşni colourings (e.g. Sûzinâk's asma karar on Dügâh with Karcığar flavour).

A static synth — one that just sounds notes when you press them — cannot enforce seyir. But it *can*:

- Mark which degrees are durak / güçlü / tîz durak / yeden (leading tone) / asma karar in the UI
- Offer a "seyir hint" overlay that animates the conventional contour
- Provide a Practice mode (à la BeatForge's Speed Trainer) that walks a learner through the canonical opening of each makam

## 6. Modulation (geçki)

Geçki = modulation; *çeşni* = "flavour," a borrowed tetrachord/pentachord that briefly recolours the current makam without permanently switching. The conventions are dense, but the high-leverage observations:

- **Modulations attach at the durak, the güçlü, or the octave** — these are the only "safe" hinges because they are also the boundary points between cins (tetrachord/pentachord units).
- **Pivot through shared cins.** Because Turkish makam vocabulary is built from a small set of named tetrachords (Çârgâh, Bûselik, Kürdî, Rast, Uşşâk, Hüseynî, Hicaz, Nikriz, Saba, Segâh, Hüzzam) and pentachords (mostly the same names extended), any two makams sharing a cins on a common pitch can pivot. E.g. Rast's upper Rast tetrachord on Nevâ can become Sûzinâk's Hicaz tetrachord on Nevâ simply by lowering the third.
- **Common pairs:** Rast ↔ Sûzinâk (upper tetrachord swap); Rast ↔ Mahur (sister majors); Uşşâk ↔ Bayatî (durak shift, same scale); Uşşâk ↔ Karcığar (upper tetrachord change); Hüseynî ↔ Muhayyer (seyir flip); Hicaz ↔ Hümâyûn ↔ Uzzal ↔ Zirgüle'li Hicaz (within-family family swaps); Segâh ↔ Hüzzam ↔ Müsteâr (Segâh-family); Nihavend ↔ Bûselik (transposition).
- **Long-distance modulations** (e.g. Rast → Saba, Hicaz → Segâh) are dramatic and usually structural — they mark formal boundaries like the *meyan* (B section) of a *şarkı*.

## 7. Performance practice vs theory

The Karaosmanoğlu / Bozkurt / Akkoç / Yarman line of empirical work (2002–present) consistently shows:

- The **Uşşâk segâh** sits ~120–135 ¢ above the durak, not the AEU-prescribed 158 ¢. This is closer to the *eksik bakiye + bakiye* sum (~158 ¢) than to *küçük mücenneb* (~113 ¢) but is in fact distinctively neither — it's a measurably variable "neutral second" that depends on direction (lower when ascending into Çârgâh, higher when settling onto the durak).
- The **Saba fourth** (D♭ above A) is played sharper than the AEU 4-koma flat would suggest — closer to ~430 ¢ above the durak than the theoretical 384 ¢.
- The **Hicaz augmented second** ranges from ~250 to ~290 ¢ depending on player and direction.
- **Tanbur intonation** (tied frets, 36 frets per octave on Cantemir's instrument, more on modern tanburs) tends to sit closer to AEU than ney intonation.
- **Ney intonation** is the most flexible — neyzens routinely shift a perde by 10–20 ¢ between movements.
- **Kanun (qanun) intonation** is partially "frozen" by the mandal system, but Turkish-school qanuns use 6 or 7 mandals per course (each ≈ 1 koma) and therefore sit on a 72-EDO grid — a third grid that is *neither* AEU 53-EDO *nor* Yarman 79-EDO.

The methodological gold here is **f0 histogramming** of recordings of master performers (Niyazi Sayın on ney; Necdet Yaşar, Kemal Niyazi Seyhun on tanbur; İhsan Özgen on kemençe; Ercüment Batanay on kanun). Histogram peaks reveal *empirical perdes* that consistently differ from AEU's predicted positions.

The cultural / political subtext is unavoidable: AEU was a Republican-era project that aimed to *modernize and notate* a historically oral tradition, and to differentiate it from Arabic music. Master performers learned by *meşk* (oral transmission) and never read AEU's microtonal accidentals as binding pitch instructions — they read them as *names* for nuanced pitch behaviours that the player executes from cultivated taste. **A digital instrument that reproduces AEU literally will sound theoretically correct and culturally wrong.**

---

## Implications for makam_studio

### What to ship in v1

**Tuning grid.** Implement the underlying scale as 53-EDO with the Holdrian comma as the smallest unit. Each named perde is then a labelled subset (24 of 53) of that grid. Internally, store every pitch as `(perde_id, fine_offset_cents)`. The fine_offset defaults to 0 (= AEU canonical) but can be overridden globally (per makam preset) or per-string (per user).

**Perde-first naming.** The qanun UI should label courses by perde (Yegâh, Hüseynî Aşîrân, …) not by Western pitch. AEU notation appears as a secondary tooltip/badge. This is both more accurate and more idiomatic.

**Default qanun layout: 26 courses × 3 strings = 78 strings.** Range Kaba Yegâh (D2) to Tîz Çârgâh (C5) — about 3.5 octaves, matching a real Turkish qanun. Each course gets a primary perde assignment; 6 mandals per course allows ±3 koma fine-adjustment without ever leaving the 53-EDO grid.

**Karar + makam selection.** "Select a karar (root) + a makam preset and the whole instrument tunes itself" is the core feature. The UX flow:
1. User picks **karar** from the perde menu (defaults to Dügâh / A).
2. User picks **makam** from a categorised list (Rast family / Uşşâk family / Hicaz family / Segâh family / Nihavend-Kürdî / Saba / Çârgâh-Mahur).
3. Each course is auto-tuned to the nearest in-makam perde; mandals snap to the makam's preferred fine offsets.
4. A "Karaosmanoğlu mode" toggle replaces AEU-canonical fine offsets with empirically-measured ones (controversial, ship with the toggle off by default but make it discoverable).

**v1 makam preset set (22).** Listed in §0 above. Covers basit (simple), şed (transposed), and the most-played mürekkeb (compound) makams; together these account for the overwhelming majority of named pieces in the standard CMM (Conservatory) repertoire.

**Function metadata.** Each preset stores: durak (degree), güçlü (degree), tîz durak (degree), yeden (degree), asma karar list (degrees + flavours), seyir type. The UI highlights these on the qanun: durak gets a visual "anchor," güçlü gets a "dominant" badge, asma karar pitches get faint markers.

**Seyir as guidance, not enforcement.** Don't try to constrain what the user plays. Do offer:
- A small ascending/descending arrow icon labelled with the seyir type
- A "Practice" mode (BeatForge-style) that animates the canonical seyir contour for a chosen makam, one note at a time
- Audio examples of master performers (link out to existing recordings rather than hosting; keep the "no samples" constraint)

**The "freely retunable string" feature.** Independent from preset mode: every individual course can be retuned to any 53-EDO step (or any cent value, in a power-user mode). This is the qanun-as-microtonal-laboratory affordance — useful for both research (testing Yarman 79 against AEU) and creative work. Save these as user presets.

### What *not* to ship in v1

- **Yarman 79-tone mode.** Tempting but a footgun: 79 tones means the UI must accommodate ~7-mandals-per-course that don't align to AEU's accidentals. Defer to v2; ship a "future-mode" placeholder.
- **A "polyphony with chord support" mode.** Turkish makam is monophonic (or heterophonic-in-unison) by tradition. Adding triadic harmonic stacking creates a music-theory category error. If users want to play chords, they can — don't help them.
- **Automatic geçki suggestions.** Encoding the modulation graph is doable but it's a v2/v3 feature; the v1 win is making the static makam world tunable and explorable.

### Cultural sensitivity guardrails

- Acknowledge in the UI copy that AEU is *one* theoretical model among several, and that empirical practice diverges from it.
- Credit the empirical work (Karaosmanoğlu, Bozkurt, Akkoç, Yarman) when offering "performance-tuned" presets.
- Do not present Turkish makam as a "subset" of Arabic maqam or vice-versa. They are sister traditions with different theoretical foundations and different empirical practices.
- Use Turkish names (Hicaz, Segâh, Hüzzam) in the Turkish presets; use Arabic names (Hijaz, Sikah, Huzam) in any future Arabic preset set. This matters.

---

## Open questions

1. **Empirical-perde dataset licensing.** Karaosmanoğlu's pitch-histogram data is published in journal articles but not, to my knowledge, released as a CSV under a permissive licence. Can we either (a) cite specific peak positions from the published papers (fair use), or (b) measure our own from public-domain recordings? Compmusic (UPF Barcelona) hosts an open Turkish makam corpus — that's the likely path.
2. **Qanun mandal grid: 53-EDO or 72-EDO?** Real Turkish qanuns are de facto 72-EDO instruments (6 mandals per semitone). AEU is 53-EDO. Which grid should mandals snap to in our default? My read: 53-EDO for theoretical correctness, with a "qanun-realistic" 72-EDO mode toggle. Needs prototyping.
3. **Karar reference frequency.** Real Turkish ensembles tune Dügâh anywhere from A=415 (early-music revival) to A=440 (mixed ensembles) to A=465 (some pop / arabesk). Should we expose a user-facing reference-pitch dial? Probably yes; default A=440 for Dügâh.
4. **Seyir representation for non-experts.** How to show a "melodic contour" rule without overwhelming a beginner UI? Animation? Glow trail along a melodic phrase? The visual idiom is unsolved.
5. **Folk vs art music repertoire scope.** This document covers Türk Sanat Müziği (TSM, Turkish art music). Türk Halk Müziği (TFM, folk) shares many makams but uses different intonations (often closer to Pythagorean, sometimes wholly outside AEU). v1 should focus on TSM.
6. **Persian and Azeri families.** The seven mugham of Azerbaijani tradition and the twelve dastgah of Iranian classical music share a theoretical heritage with Turkish makam but are *not the same system*. Out of scope for this document — needs its own research agent.

---

## Sources

Trust ranking (most → moderate). Asterisks mark the sources I'd centre any v1 implementation on.

### Primary musicological / empirical work

- ★ **Yarman, Ozan (2008).** *79-Tone Tuning & Theory for Turkish Maqam Music: A Solution to the Non-Conformance Between Current Model and Practice.* PhD thesis, Istanbul Technical University MIAM. https://www.academia.edu/44935064 — the most rigorous critique of AEU and a complete alternative system.
- ★ **Yarman, O. & Karaosmanoğlu, M. K. (2014).** "Yarman-36 Makam Tone-System for Turkish Art Music." *TWMS Journal of Applied and Engineering Mathematics.* https://jaem.isikun.edu.tr/web/images/articles/vol.4.no.2/05.pdf
- ★ **Bozkurt, Barış (2008).** "Pitch-frequency histogram-based music information retrieval for Turkish music." *Signal Processing.* https://www.sciencedirect.com/science/article/abs/pii/S0165168409002898 — empirical pitch measurement methodology, jointly with Karaosmanoğlu.
- ★ **Gedik, A. C. & Bozkurt, B. (2010).** "Pitch-frequency histogram based music information retrieval for Turkish music." (See Bozkurt 2008 and follow-up papers on Compmusic.) https://compmusic.upf.edu/node/55
- ★ **Akkoç, Can (2002).** "Non-deterministic scales used in traditional Turkish music." *Journal of New Music Research.* (Seminal empirical histogram paper.) https://sethares.engr.wisc.edu/paperspdf/MP3204_02_Akkoc.pdf
- **Bardakçı, Murat (1986).** *Maragalı Abdülkadir.* Pan Yayıncılık. — Modern reissue/study of the Maragha-Urmawi line; the key Turkish-language source for pre-modern theory.

### English-language reference

- ★ **Signell, Karl L. (1977/2008).** *Makam: Modal Practice in Turkish Art Music.* Asian Music Publications, reissued by Usul Editions. — The foundational English-language monograph; still the best single book for non-Turkish readers.
- **Ederer, Eric (2015).** *The Theory and Praxis of Makam in Classical Turkish Music 1910–2010.* PhD dissertation, UC Santa Barbara. https://www.scribd.com/document/294033687 — direct, well-organized survey of the theory/practice tension.
- **Wikipedia, "Turkish makam."** https://en.wikipedia.org/wiki/Turkish_makam — surprisingly accurate for the AEU mechanics; the perde table and accidentals table are usable as a reference.
- **Wikipedia, "List of Turkish makams."** https://en.wikipedia.org/wiki/List_of_Turkish_makams — fast lookup for the ~600 named makams.

### Practitioner / teaching sources

- **Şahaney (Turkish ney workshop) makam pages.** https://www.sahaney.com/en/ — clean, practitioner-written one-pagers per makam (Rast, Uşşâk, Hicaz family, Sûzinâk, Nihavend, Kürdî, etc.). Useful sanity check.
- **Microtonal Theory: Turkish Makams.** https://www.microtonaltheory.com/microtonal-ethnography/turkish-makams — best concise explanation of the AEU comma system in English.
- **Sufi.gen.tr makamlar.** https://www.sufi.gen.tr/makamlar/en — Turkish-music portal with brief scale entries.
- **Turkish Music Portal (Turkish Cultural Foundation).** http://www.turkishmusicportal.org/en/types-of-turkish-music/turkish-classical-music-makams — semi-official overview.
- **Hines, "What Are Makams? Part 2."** https://www.hinesmusic.com/What_Are_Makams.html — ney-pedagogy-flavoured but quite accurate.
- **Garrett, Jim. "Tetrachords of Turkish makams."** https://we.riseup.net/assets/545041/Turkish-tetrachords.pdf — practical tetrachord-by-tetrachord cheatsheet; direct PDF download.

### Specific instrument references

- **Wikipedia, "Qanun (instrument)."** https://en.wikipedia.org/wiki/Qanun_(instrument) — strings, mandals, range.
- **Yarman, Ozan. "79-tone qanun recipe."** http://www.ozanyarman.com/79toneqanun.html — physical implementation of the 79-tone system on a qanun.
- **Xenharmonic Wiki, "Qanun."** https://en.xen.wiki/w/Qanun — useful summary of Turkish qanun's *de facto* 72-EDO mandal layout vs. AEU's 53-EDO theoretical grid.
- **Penn Museum, "The Ottoman Tanbûr."** https://www.penn.museum/sites/expedition/the-ottoman-tanbur/ — Cantemir-era tanbur context.

### Historical primary

- **Cantemir, Dimitrie (~1700).** *Kitâbü 'İlmi'l-Mûsîkî 'alâ vechi'l-hurûfât.* (Modern Turkish edition: Yalçın Tura, Pan Yayıncılık, 2001.)
- **Urmawi, Safi al-Din (13th c.).** *Kitâb al-Adwâr.* (English summaries: Wright, *The Modal System of Arab and Persian Music, 1250–1300*, Oxford 1978.)
- **Yekta Bey, Rauf (1922).** "La musique turque." In Lavignac & La Laurencie (eds.), *Encyclopédie de la musique et dictionnaire du Conservatoire,* Pt. 1, vol. V. Paris: Delagrave.
- **Arel, H. S. (1968).** *Türk Mûsıkîsi Nazariyatı Dersleri.* Hüsnütabiat Matbaası. (Posthumous; defines AEU canonical accidentals.)

### Background / lineage of critique

- **Wright, Owen (1978).** *The Modal System of Arab and Persian Music, A.D. 1250–1300.* Oxford University Press. — The standard English reference for Urmawi.
- **Powers, Harold (1980).** "Mode" entry in *The New Grove Dictionary of Music and Musicians.* — Comparative-modal frame.
- **Feldman, Walter (1996).** *Music of the Ottoman Court.* VWB-Verlag. — Performance-practice ethnography for the post-Cantemir period.
