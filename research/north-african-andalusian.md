---
title: "North African Maghrebi Andalusi Music: Nawba, Tab', and the Politics of a Lost Paradise"
audience: "makam_studio designers and engineers extending the modal taxonomy westward; readers familiar with Mashriqi maqam who need to understand how Maghrebi practice differs (mode names, microtonal practice, suite-based listening). Useful as background for any preset, schema, or UI feature that touches Tunisian, Algerian, Moroccan, or Libyan repertoire."
tldr: |
  The Maghrebi traditions — Tunisian ma'lūf, Algerian San'a / Gharnāṭī / ma'lūf-Constantine, Moroccan al-āla, and Libyan ma'lūf — share a common ancestor in the lost music of al-Andalus, organized into multi-movement suites called nawba (each in a single tab' / mode), but each tradition codified independently in the 18th–20th centuries. Three things matter for makam_studio: (1) the mode names overlap with Mashriqi maqam names but the actual scales often differ (e.g., Maghrebi 'Irāq, Sīkāh, Iṣbahān are not identical to Cairo or Aleppo equivalents); (2) Maghrebi performance is widely reported as less microtonal than Mashriqi — locally adjusted neutral intervals appear in only a few modes (al-Iṣbahān, al-Ḥusayn, al-Māya); the rest is largely diatonic or 12-EDO-adjacent; and (3) the nawba is a *suite*, not a scale — the structural frame is mishālīya/istikhbar → tūshiya → m'sadar/btayhi/darj/inṣirāf/khlāṣ, accelerating across movements. This argues for a separate `arabic_maghrebi` tradition tag, simpler default tuning grids per region, and (eventually) a "session/playlist" feature beyond per-mode presets.
skip_if: "You are working on Mashriqi (Levantine, Egyptian) maqam, Ottoman makam, Persian dastgāh, or Azeri mugham specifically — those are wave-1 docs. Skip §6 (colonial framing) and §7 (Jewish role) if you only need the mode/tuning data for v1 presets."
date: 2026-04-30
status: draft
---

# TL;DR

- Four (sometimes five) "national" Andalusi traditions emerged from a shared 9th–15th-century al-Andalus inheritance, independently codified c. 1750–1950: Tunisian **ma'lūf** (13 nawba; al-Hāʼik / al-Rashīd 18th c.; Rashīdiyya Institute 1934); Algerian **San'a** of Algiers (12+4 nawba, 16 modes); Algerian **Gharnāṭī** of Tlemcen (8 mode categories); Constantinian **ma'lūf** (Tunisian-adjacent); Moroccan **al-āla** (11 nawba, *Kunnāsh al-Hāʼik* 1788–89, Tetouan); Libyan ma'lūf (smallest corpus).
- The "lost 24" — Ziryāb's mythical 24 nawba — is **partially myth**. Reynolds (2008, 2021) shows the Ziryāb-as-founder narrative was constructed by 17th-century writers (al-Maqqarī) selectively redacting earlier sources. Actual 9th-century practice is largely lost; 20th-century revival mixes preservation, reconstruction, and invention.
- The **tab'** is the Maghrebi cognate of the Mashriqi maqām, but many tab' names overlap with maqām names while denoting **different scales**. Maghrebi Sīkāh ≠ Mashriqi Sīkā; Maghrebi 'Irāq ≠ Mashriqi 'Irāq. Same shared-name problem as Azeri vs Persian — must namespace by tradition.
- **Tuning practice is reported as less microtonal than Mashriqi** (Davila 2013; Glasser 2016; Reynolds 2021): most modes are 12-EDO-adjacent; neutral intervals persist in a minority (al-Iṣbahān, al-Ḥusayn, al-Māya, Sīkāh family). Tunisian ma'lūf retains more microtonal inflection than Moroccan al-āla. Performers within a tradition disagree.
- The **nawba is a suite-as-listening-frame**: free-rhythm prelude → metric tūshiya → 5 accelerating vocal-led movements, each in its own rhythmic cycle (mīzān). A complete nawba runs an hour-plus. Structurally closer to Indian classical concert form than to a Western song.
- For makam_studio: add **`arabic_maghrebi` as its own tradition tag** with regional sub-tags. v1 tuning grid can be 12-EDO with optional per-mode neutral-interval flags — simpler than Mashriqi. Time-of-day metadata is canonical (shared with raga). The nawba suite structure argues for a "session/playlist" feature later.

---

## 1. The four (or five) national Andalusi traditions

The Maghrebi Andalusi family is plural by design. There is no pan-Maghrebi canon, no central conservatoire, no agreed mode-list across borders. Each modern nation codified its sub-tradition during the late colonial / early independence period (c. 1900–1960), drawing on older oral practice and a handful of late 18th- and 19th-century manuscript song-texts. Traditions overlap in repertoire roots and broad structure but diverge in nawba count, mode names, instruments, and tuning.

### 1.1 Tunisian ma'lūf

The Tunisian tradition is **al-ma'lūf** (المألوف, "the customary") — a name shared by the Constantinian and Libyan cousins. Its modern form is built around a canonical cycle of **13 nawbāt**, attributed to the 18th-century compiler-aristocrat **Muḥammad al-Rashīd Bāy** (r. 1756–1759). Earlier 18th-century compilation work — much of it associated with the al-Hāʼik manuscript family that also serves the Moroccan tradition (§1.4) — provides the textual base.

The 13 nawba list, in traditional order: **Dhīl, 'Irāq, Sīkāh, Ḥsīn, Raṣd, Raml al-Māya, Nawā, Aṣba'ayn, Raṣd al-Dhīl, Ramal, Iṣbahān, Mazmūm, Māya** (Davis 2004; Wikipedia *Tab'*). Each nawba is performed end-to-end in its principal tab', with internal modulations characteristic of the suite.

The codifying institution is the **Rashīdiyya Institute** (*La Rachidia*), founded **November 1934** under French protectorate but driven primarily by Tunisian musicians who saw ma'lūf as endangered both by Egyptian commercial music's dominance and by the deaths of older transmitters (Davis 2004). Foundational figures: the singer-composer **Khemaïs Tarnāne** (1894–1964; principal 'ūd 'arbī teacher), **Muḥammad Triki**, and patron-musicologist **Baron Rodolphe d'Erlanger** (1872–1932), French painter-musicologist of Sidi Bou Saïd, whose six-volume *La musique arabe* (1930–1959) provided the theoretical scaffolding.

Davis (2004) is precise about the Rashīdiyya's interventions: a **"showcase ensemble, modelled partly on the Western orchestra"** with bowed violins, cellos, double basses, and segregated male/female choruses; staff-notation transcriptions in *al-Turāth al-Mūsīqī al-Tūnisī*; lyric alterations to remove "profane" content; national distribution by the Ministry of Culture after 1956. Davis observes that by the early 1980s this institutionalization had paradoxically rendered the ma'lūf "a museum piece" divorced from popular entertainment — the authenticity-vs-codification tension recurs across the Maghreb.

A smaller-ensemble oral transmission line continued in parallel. Davis describes the master **Tāhar Gharsa** as embodying this alternative: weddings, circumcisions, cafés, hotels, teaching by 'ūd 'arbī accompaniment with the chorus repeating each phrase by ear. Authenticity here is **stylistic**, not melodic — proper Tunisian pronunciation, syllabic division, vocal articulation, ornamental detail.

### 1.2 Algerian: three regional schools

Algeria preserves three distinct Andalusi schools, conventionally mapped onto cities of presumed Iberian origin: **Algiers ↔ Córdoba**, **Tlemcen ↔ Granada**, **Constantine ↔ Seville**. The mapping is part-historical, part-mythopoetic; Glasser (2016) treats it skeptically as 20th-century revival mythology rather than verifiable lineage.

**Algiers — al-San'a.** *San'a* (الصنعة, "craft, mastery") names the Algiers school. The system uses **16 modes** divided into 7 *principal* modes — each defined by an *istiḥbār* (vocal/instrumental semi-improvisation) — and 9 *derived* modes:

| Principal | Derived |
|---|---|
| Mawwāl | Dīl, Raṣd ə-Dīl, Māya |
| Zīdān | Raml, Mǧənba |
| Raml əl-Māya | Raṣd |
| 'Iraq | Ḥsīn, Ġrīb, Ġrībat əl-Ḥsīn |
| Ǧārkā | — |
| Sīkā | — |
| Məzmūm | — |

The repertoire comprises **12 complete nawbāt** plus **4 incomplete**. Musicologist **Jules Rouanet** (1858–1944), working with Algerian-Jewish musician **Edmond Nathan Yafil** (1874–1928), documented additional "lost" modes — Asbaʿayn, Iṣbahān variants, Rahāwī — in Lavignac's *Encyclopédie de la musique* (1922). Yafil's transcription series *Musique arabe et maure* (1904 onward) is among the earliest printed Arabic-music corpora.

Key 20th-century San'a transmitters: **Sid Aḥmed Serrī** (1926–2015, the central modern Algiers master), **Yamina Drici**, **Abdelkrim Dali**, **Fadila Dziria**, **Beihdja Rahal** (b. 1962, Paris-resident performer-scholar; co-author of *La plume, la voix et le plectre*). The schism between Algiers San'a and Tlemcen Gharnāṭī as separately-named traditions is conventionally dated to Radio d'Alger's Arab-Andalusian orchestra c. 1946.

**Tlemcen — al-Gharnāṭī.** Gharnāṭī (غرناطي, "of Granada") spread from Tlemcen to Oran, Nedroma, Sidi-Bel-Abbès, and across into eastern Morocco (Oujda, Rabat) in the 20th century. The mode system is organized into **8 principal categories**:

1. Mawwāl (variants: Dīl, Raṣd ə-Dīl, Māya)
2. Zīdān (variants: Raml əl-ʿAšiyya, Mǧənba)
3. Raml əl-Māya (variant: Raṣd)
4. 'Iraq Maṭlūq (variants: Ḥsīn, Ġrībat əl-Ḥsīn)
5. Məzmūm
6. Sīkā
7. Ǧārkā
8. 'Irāq Maḥṣūr (variant: Ġrīb)

Defining figures: **Cheikh Larbi Bensari** (1872–1964) and son **Redouane Bensari** (recorded at the 1932 Cairo Congress); **Cheikha Tetma** (d. 1962), Tlemcen-born Hawfī singer turned Andalusi classical, one of few women publicly active in the male-dominated pre-mid-century scene.

Standard Tlemceni nawba: 5-movement *mṣeddar → bṭāyḥī → derǧ → inṣirāf → meẖles*. Auxiliary forms: *nubat əl-inqilābāt* (multi-mode suite), *slisla* (single-mizān suite), *qadriyya* (closing 6/8 vocal piece).

**Constantine — al-ma'lūf.** The Constantinian tradition shares the *ma'lūf* name with Tunisia and Libya, and is described as the closest Algerian variant to the Tunisian repertoire. Defining figure: **Mohamed-Tahar Fergani** (1928–2016).

### 1.3 Moroccan al-āla

The Moroccan tradition is **al-āla** (الآلة, "the instrument" — i.e., instrumental music, opposed to the unaccompanied religious **al-samāʿ wa-l-madīḥ** of Sufi contexts). The canonical corpus is **11 nawbāt**, surviving from a tradition reportedly originally numbering 24 (one per hour, on the Ziryāb-attributed model). Davila (2013, 2015) is the central English-language scholar; he is currently translating all 11 nawbāt into English.

The 11 surviving Moroccan nawbāt, by mode:

1. **Raṣd al-Dhīl** (رصد الذيل)
2. **al-Iṣbahān** (الأصبهان)
3. **al-Māya** (الماية)
4. **Raṣd** (الرصد)
5. **al-Iṣtihlāl** (الاستهلال)
6. **al-Ḥijāz al-Mashriqī** (الحجاز المشرقي, "Eastern Hijaz")
7. **al-Ḥijāz al-Kabīr** (الحجاز الكبير, "Great Hijaz")
8. **al-'Ushshāq** (العشاق)
9. **al-Gharībat al-Ḥusayn** (غريبة الحسين)
10. **al-Ramal al-Māya** (رمل الماية)
11. **al-'Irāq al-'Ajam** (العراق العجم)

The Moroccan 5-mizān cycle: **bsīṭ** (6/4) → **qā'im wa-niṣf** (8/4) → **btāyhī** (compound) → **darj** (4/4) → **quddām** (3/4 or 6/8).

The seminal manuscript is the **Kunnāsh al-Hāʼik** (كناش الحايك), a song-text compilation produced in **Tetouan in 1788–89** (1202 AH) by **Muḥammad al-Hāʼik al-Tiṭwānī**, significantly expanded by vizier **Muḥammad ibn al-'Arabī al-Jāmi'ī** at Sultan Hassan I's court (manuscript dated 1886 / 1304 AH). Copies survive in Morocco, Madrid, London, Paris; critical edition by Mālik Bannūna (Davila 2013).

Davila's central argument is that al-āla evolves through interaction between **oral and literary** transmission — the al-Hāʼik is not a fixed score but a set of song-texts whose musical realization is filled in by oral practice. He has also studied the rarer **al-Rawdat al-Ghannāʼ fī Uṣūl al-Ghināʼ** ("Lush Garden of the Principles of Song"), of which only three copies survive (one at the Bibliothèque Nationale, Rabat).

Major institutions: **Conservatoire de Tetouan** (c. 1956), and conservatories of Fez and Tangier. **Haj Abdelkrim Raïs** (Orchestre al-Brihi de Fès) led the major mid-20th-century Fez ensemble; **Idrīs Bin Jellūn at-Twīmī** produced a major revised edition of the Kunnāsh.

### 1.4 Libyan ma'lūf

Libyan *ma'lūf* is the smallest of the corpora and is consistently described as closest to Tunisian. English-language scholarship is thin; the principal anchors are Touma (1996) and passing references in Davis (2004) and Glasser (2016). Surviving practice is concentrated in Tripoli and Benghazi; Libya's Ottoman-era musical inheritance complicates a clean Andalusi attribution (some Libyan ma'lūf shares repertoire and structure with Ottoman *fasıl*). For makam_studio v1, treat Libyan ma'lūf as a sub-region of `arabic_maghrebi` rather than its own first-class tradition.

---

## 2. The tab' (mode) system

The Maghrebi modal unit is the **tab'** (طبع, pl. *ṭubūʿ* / *ṭbūʿ*), literally "nature, temperament" — the term reflects a late-medieval Arab-Galenic theory linking modes to humors, hours, and elements (al-Wansharissi, d. 1548, lists 17 modes by humor). This humoral-temporal scaffolding has receded but survives as time-of-day metadata in some Tunisian and Moroccan practice.

A tab' specifies, much like a Mashriqi maqām: scale (with permitted neutral-interval inflections), tonic (qarar), characteristic phrases, typical cadences, modulation tendencies, and register. It does *not* specify a tightly fixed cents tuning — see §3.

### 2.1 Shared-name, different-scale problem

Several Maghrebi tab' names are identical or nearly identical to Mashriqi maqām names but denote different scales — the same shared-name problem documented for Azeri vs Persian. Examples:

- **Maghrebi Sīkāh**: in Algerian San'a, a principal mode on G with mostly diatonic inflection; in Mashriqi practice, a family centered on E half-flat.
- **Maghrebi 'Irāq**: in Tunisian/Moroccan practice often realized close to 12-EDO Phrygian-adjacent; in Mashriqi practice, a maqām with half-flat third and fifth.
- **Maghrebi Iṣbahān**: in Moroccan al-āla, retains neutral-interval inflection (per Davila); in Mashriqi practice, a different maqām (Iraqi Iṣbahān is a Bayati relative).
- **Maghrebi Ḥijāz** (vs *Ḥijāz al-Kabīr*, *Ḥijāz al-Mashriqī*): the Moroccan distinction between "Eastern" Ḥijāz and "Great" Ḥijāz already encodes recognition that the *al-Mashriqī* form is the "imported" Mashriqi version.

**Mode names alone cannot disambiguate**. UI must namespace by tradition.

### 2.2 The Tunisian 13 tubu' (with intervallic notes)

English-language scholarship rarely publishes precise cents measurements for Maghrebi modes; the best theoretical reference remains d'Erlanger's *La musique arabe* vols 5–6 (1949, 1959), which gives scale-degree pitches in 24-EDO notation. The table below combines d'Erlanger, Davis (2004), and Wikipedia *Tab'*; cents are 24-EDO theoretical and should be read as approximations subject to performer variation.

| Tab' | Tonic | Step pattern (asc.) | 24-EDO cents | Notes |
|---|---|---|---|---|
| Dhīl | D | 1 — ½ — 1 — 1 — 1 — ½ — 1 | 0, 200, 300, 500, 700, 900, 1000, 1200 | ≈ Dorian-adjacent; ma'lūf opens here |
| 'Irāq | variable | ¾ — ¾ — 1 — 1 — ¾ — ¾ | 0, 150, 300, 500, 700, 850, 1000 | Retains neutral seconds in some realizations |
| Sīkāh | E♭ or G | ¾ — 1 — 1 (lower) | 0, 150, 350 | Neutral inflection less consistent than Mashriqi |
| Ḥsīn | A | Bayati-on-A adjacent | 0, 150, 300, 500 (lower) | Maghrebi realization often diatonic |
| Raṣd | C | 1 — ¾ — ¾ — 1 — 1 — ¾ — ¾ | 0, 200, 350, 500, 700, 900, 1050 | Closest parallel to Mashriqi Rāst |
| Raml al-Māya | variable | — | varies | Davila's main study mode (2014, 2015) |
| Nawā | D | 1 — 1 — ½ — 1 — 1 — 1 — ½ | 0, 200, 400, 500, 700, 900, 1100 | Effectively major-mode; one of the most diatonic tab' |
| Aṣba'ayn | variable | — | varies | "Two fingers"; often Sīkāh-family derivative |
| Raṣd al-Dhīl | D | compound (Raṣd in Dhīl register) | varies | Shared with Moroccan canon |
| Ramal | variable | — | varies | Andalusi family mode |
| Iṣbahān | F | 1 — ½ — 1+½ — ½ — 1 — 1 — ½ | 0, 200, 300, 600, 700, 900, 1100 | Hungarian-minor-adjacent; Moroccan version retains neutral inflection |
| Mazmūm | G or D | 1 — 1 — ½ — 1 — 1 — ½ — 1 | 0, 200, 400, 500, 700, 900, 1000 | Major-pentachord-with-flatted-7 |
| Māya | C | — | varies | Foundational Andalusi mode; tonally close to Raṣd in some realizations |

English-language technical literature usually uses tone/semitone rather than cents because (a) the 24-EDO grid is 50¢ resolution which oversells precision given 30¢+ performance variation, and (b) Maghrebi performers rarely speak in cents.

### 2.3 Moroccan modes (intervallic sketch)

Per Davila (2013) and Fez-conservatoire pedagogical materials:

- **Raṣd al-Dhīl**: D — E — F — G — A — B♭ — C — D (≈ natural minor on D)
- **al-Iṣbahān**: F — G — A♭ — B — C — D — E♭ — F (Hungarian/harmonic-minor adjacent; **retains neutral-interval inflection on the 3rd in performance**)
- **al-Māya**: C — D — E half-flat — F — G — A — B half-flat — C (preserves Mashriqi-style neutral seconds/thirds)
- **Raṣd**: D — E — F♯ — G — A — B — C — D (Mixolydian-adjacent)
- **al-Iṣtihlāl**: harmonic-minor-adjacent
- **al-Ḥijāz al-Mashriqī**: D — E♭ — F♯ — G — A — B♭ — C — D (recognizably "Hijaz"; the *mashriqī* tag advertises the import)
- **al-Ḥijāz al-Kabīr**: "Great Hijaz", augmented-second-rich
- **al-'Ushshāq**: D — E — F — G — A — B♭ — C — D (Aeolian-adjacent)
- **al-Gharībat al-Ḥusayn**: Gharīb-Ḥusayn fusion; **retains neutral inflection** per Davila
- **al-Ramal al-Māya**: Ramal/Māya compound; Davila (2015) monograph subject
- **al-'Irāq al-'Ajam**: 'Irāq with "Persian" ('ajam) inflection; major-adjacent

Davila (2013) is explicit that Moroccan tradition has, **over the 19th–20th centuries, shifted toward 12-EDO realization**, with neutral-interval inflection persisting only in al-Iṣbahān, al-Māya, parts of al-Gharībat al-Ḥusayn, and a few internal phrases. This is the strongest scholarly claim for the "Maghrebi is less microtonal" thesis.

### 2.4 Tlemceni Gharnāṭī modes

Tlemceni mode scales differ from Algiers San'a in the placement of variants and (per Tlemceni performers) in characteristic phrase intonation, but no published source gives cents measurements that distinguish them empirically. The 8-category system (§1.2) is the best taxonomy currently in print.

### 2.5 Time-of-day, color, humor

Davis (2004) reports that Tunisian *tubūʿ* "corresponded to the hours of the day, and were also associated with colors, moods, and elements" — a humoral-temporal scheme inherited from medieval Arab-Galenic theory. In contemporary practice this is more nostalgic than enforced: programs are not literally scheduled by mode-of-the-hour. But the metadata is canonical and traditional, not invented.

This is structurally similar to **raga** time-of-day association, more so than to Mashriqi maqām (where time-of-day is occasional rather than systematic). Schema implication: makam_studio should accommodate a `time_of_day` field on Maghrebi presets without it being a Maghrebi-only field — Indian classical and some Persian dastgāh contexts also use it.

---

## 3. Tuning practice: the "Maghrebi is less microtonal" thesis

The strongest claim across recent English-language scholarship (Davila 2013, 2015; Glasser 2016; Reynolds 2021) is that **contemporary Maghrebi practice realizes most modes with intervals close to 12-EDO**, with neutral-interval inflections persisting in only a minority of modes. This contrasts sharply with Mashriqi practice (Cairo, Aleppo, Damascus, Baghdad), where the half-flat third is the constitutive interval of the system.

Davila (2013) attributes the diatonization to: **instrumental codification** (revival ensembles imported Western bowed strings tuned in 12-EDO conservatoire pedagogy); **notation** (Rashīdiyya and Moroccan conservatoire transcriptions used modified Western staff notation, applying quarter-tone signs sparingly); and **manuscript transmission** (al-Hāʼik is a song-text corpus, so melody was always oral; once instrumental codification produced a fixed tuning, that became the new "tradition").

But this is not unanimous. Tunisian ma'lūf scholars and performers (Tāhar Gharsa's lineage, per Davis 2004) assert microtonal inflection persists in older oral practice — particularly in Sīkāh-family modes and vocal ornamentation — and is only flattened in conservatoire performance. Some Algerian San'a performers make the same claim. The empirical question is open: no published large-scale acoustic study of Maghrebi intonation exists comparable to work on Egyptian or Turkish maqam.

For makam_studio:
- **v1 default**: Maghrebi presets use a 12-EDO tuning grid by default. This matches conservatoire-canonical practice and the dominant scholarly view.
- **Per-mode neutral-interval flag**: A short list — al-Iṣbahān, al-Māya, al-Gharībat al-Ḥusayn (Moroccan), Sīkāh family across all Maghrebi traditions, Raṣd in some realizations — should accept a toggle that biases the relevant scale degree ~50¢ flatward.
- **Optional regional flavor parameter** (Tunisian / Algerian / Moroccan / Libyan) to bias neutral-zone inflection.

---

## 4. The "Andalusian mystery": Ziryāb, the lost 24, and 20th-century reconstruction

The Andalusi foundation myth attributes the system's origin to **Ziryāb** (ʿAlī ibn Nāfiʿ, c. 789–857), Mesopotamian-trained, emigrated to Córdoba in the 820s into Umayyad amir Abd al-Raḥmān II's service. Ziryāb is credited (in late, tertiary sources) with founding the first Iberian conservatory, adding a fifth string to the 'ūd, codifying performance etiquette, and composing 24 nawba (one per hour).

**Reynolds (2008, 2021) demolishes most of this as 17th-century mythmaking.** The legend's expansion culminates in **al-Maqqarī** (d. 1632), whose treatment "selected and suppressed materials in such a systematic way that it is difficult not to see his redaction as a purposeful and conscious effort to transform Ziryāb into a figure of mythic proportions" (Reynolds 2008). The earliest substantive account — **Ibn Ḥayyān** (d. 1076) drawing on an anonymous ~10th-century source — is much more modest: Ziryāb is one of several court musicians with achievements proportionate to elite patronage.

The implication: the 24-nawba claim is **not securely historical**. What survives in the Maghreb is not "the music of al-Andalus, preserved" but "the music codified in the Maghreb between c. 1750 and c. 1950, claiming Andalusi descent". Whether 9th-century Córdoban music sounded anything like contemporary Tunisian ma'lūf or Moroccan al-āla is unknowable.

Davila (2013) and Glasser (2016) make complementary arguments. Davila emphasizes the late-18th-century origin of the textual canon (al-Hāʼik) and the heavy 19th-/20th-century codification — what we have is a recent stabilization of a long-evolving repertoire, not a frozen survival. Glasser reads Andalusi music's self-presentation as patrimony itself as a 19th–20th-century phenomenon: the "anxiety about disappearance" is constitutive, not external commentary, and the rhetoric of loss organizes class, secrecy, and genealogy within the Andalusi-musician community.

Reynolds (2021) is the most up-to-date overall synthesis. He treats medieval al-Andalus on its own terms (without back-projecting modern Maghrebi practice) and shows how multiple inheritor traditions — Maghrebi Andalusi, Sephardic / Judeo-Spanish, Cantigas de Santa Maria, troubadour song — each refract the al-Andalus inheritance differently.

For makam_studio's living-archive ethos: present the Maghrebi traditions as 18th–20th-century codifications of a deeper, partly-recoverable inheritance, not as survivals of "the music of al-Andalus." Source and date the presets.

---

## 5. The nawba suite structure

The nawba (نوبة, "turn", "round") is the genre-defining suite. Each nawba is performed in a single tab' and lasts an hour or more in full performance — 13 nawbāt in Tunisia, 12 (+4 incomplete) in Algiers, 11 in Morocco. The suite progresses from heavy/slow to light/fast across a sequence of named movements (mawāzīn / sing. mīzān).

### 5.1 Skeletal structure

Every nawba opens with a free-rhythm prelude — names vary: *mishālīya* (Moroccan), *bughya* (Moroccan alternative), *istikhbār* (instrumental improvisation, pan-Maghreb), *daʼira* (Algerian short vocal prelude). Function: establish the mode and the listening attention. A metric instrumental introduction (*tūshiya*) sets the rhythmic cycle.

The five-movement core:

| Tradition | Movement 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Algerian San'a | mṣaddar (4/4) | btayhī (4/4) | darj (4/4) | inṣirāf (5/8) | khlāṣ (6/8) |
| Algerian Gharnāṭī | mṣeddar | bṭāyḥī | derǧ | inṣirāf | meẖles |
| Moroccan al-āla | bsīṭ (6/4) | qāʼim wa-niṣf (8/4) | btāyhī (compound) | darj (4/4) | quddām (3/4 or 6/8) |
| Tunisian ma'lūf | btayhī | barwal | darj | khafīf | khatm |

Tunisian ma'lūf actually fields **9 movements per nawba** in full Rashīdiyya canonical form (Davis 2004): *ishtiftāḥ / bashraf samāʼī / tshambar*, *mṣaddar*, *abyāt* (recited verses), *btāyḥī*, *barwal*, *darj*, *tūshiya*, *khafīf*, *khatm*. The structural principle is the same: preludes, vocal-led metric movements, accelerating across the cycle, instrumental interlude near the end, lighter closing material.

Acceleration is a defining feature. Moroccan nawba are so long that complete performances are rare; most live performance involves selecting movements from a single nawba ("pasticcio nawba") or a single mizān across several nawbāt.

### 5.2 Mode change within a nawba

Although a nawba is "in" a single tab', individual movements often touch related modes (similar to Mashriqi maqām modulation within a wasla). The principal mode is established by the prelude and reaffirmed in the close; intermediate movements may modulate. Davila (2014, 2015) treats modulation in Ramal al-Māya in detail.

### 5.3 Audience-as-performer; the zāwiya context

Maghrebi Andalusi audiences are **participatory, not passive**. Glasser (2016) describes the Algerian milieu as a community of *amateurs* (French sense — devotees) who learn repertoire across decades, sing along, follow lyrics in printed bayāt collections, and judge performers by internal criteria.

The **zāwiya** (Sufi lodge) context has been historically central to transmission. 'Isāwiyya, Shādhiliyya, and Ḥarrāqiyya orders use Andalusi-derived forms in *dhikr* and *samāʿ*. Moroccan *al-samāʿ wa-l-madīḥ* (unaccompanied sacred praise) is the religious sister to *al-āla*; both share modal material. Tunisian *nūbāt al-zāwiya* is performed in Sufi contexts.

For makam_studio: tag presets with **functional context** (concert / Sufi-zāwiya / wedding / café-aroubi), not only mode and tradition.

---

## 6. Instruments

The Maghrebi ensemble is recognizably distinct from the Mashriqi takht.

- **'ūd 'arbī** (العود العربي): the Maghrebi oud. **4 double courses** (vs Mashriqi 5–6), longer neck (24 cm ≈ 5/3 of string length). Re-entrant Tunisian tuning; the four courses are named after Tunisian modes — *dhīl, ḥsīn, māya, ramal*. Eagle-feather *risha*, distinct grip. Principal in Tunisian ma'lūf; surviving in some Algerian and Moroccan ensembles.
- **Kwitra** (الكويترة): the Algerian oud, 4 double courses, distinct body shape. Principal in San'a and Gharnāṭī.
- **Rabāb** (الرباب): two-stringed bowed lute, held vertically on the lap. Iconic and frequently lead instrument in Moroccan al-āla.
- **Kamānja** (الكمانجة): violin, traditionally held vertically (knee-balanced) rather than under the chin. Standard across the Maghreb; Western-conservatoire-trained players largely supplanted vertical-hold practice in 20th-century revival ensembles.
- **Qānūn** (القانون): plucked zither with mandals. Used in Tunisian and Algerian ensembles but more peripheral than in Mashriqi practice. Maghrebi qānūn typically uses fewer microtonal levers than Mashriqi (consistent with the diatonization argument in §3).
- **Nāy / f'hal** (الناي / الفحل): end-blown reed flute. *F'hal* is the Algerian colloquial name.
- **S'nitar / snitra**: mandolin-like plucked instrument in Algerian San'a.
- **Percussion**: *darbukka* (goblet drum), *ṭār* (jingled frame drum), *naqqarāt* (small kettle-drum pair), *ṭa'rīja* (small clay frame/goblet drum, Moroccan).

Classic ensemble cores:
- **Moroccan al-āla**: rabāb (lead) + 'ūd + kamānja + qānūn + ṭār + ṭa'rīja + chorus.
- **Algerian Algiers**: s'nitra + kwitra + qānūn + 'ūd + nāy + rabāb + kamānja + ṭār + darbukka + soloist & chorus.
- **Tunisian Rashīdiyya**: bowed violins, cellos, double basses + 'ūd 'arbī + qānūn + nāy + ṭār + naqqarāt + segregated male/female choruses.

For makam_studio, the existing voice palette can absorb Maghrebi presets without much stretching. The 'ūd 'arbī is genuinely different from Mashriqi 'ūd (different string count, re-entrant tuning, timbre) but a dedicated voice is v2; v1 can use the existing plucked-string voice with slight retuning and a brighter pluck.

---

## 7. Colonial / nationalist framing and the Jewish role

The Maghrebi Andalusi traditions crystallized into their modern codified forms during the late French/Spanish colonial period (c. 1900–1956) and were claimed by post-independence states as national patrimony.

### 7.1 Colonial co-production

The earliest systematic European documentation of Maghrebi Andalusi music was produced by French colonial scholars working with local musicians, often Jewish. Key figures:

- **Jules Rouanet** (1858–1944): the first major French-language synthesis of Algerian Andalusi music, in Lavignac's *Encyclopédie de la musique* (1922). Worked closely with **Edmond Nathan Yafil** (1874–1928), the Algerian-Jewish musician whose *Musique arabe et maure* transcription series (from 1904) is foundational.
- **Alexis Chottin** (1891–1975): *Tableau de la musique marocaine* (1939); foundational Moroccan al-āla scholarship; attended the 1932 Cairo Congress.
- **Baron Rodolphe d'Erlanger** (1872–1932): *La musique arabe* (6 vols, 1930–1959, posthumous completion). Suggested the 1932 Cairo Congress to King Fuad I; his Tunisian ensemble (Tarnāne on 'ūd 'arbī) represented Tunisia. The Rashīdiyya Institute (1934) was directly inspired by d'Erlanger and the Congress.
- **Christian Poché**: *La musique arabo-andalouse* (1995), standard French reference.
- **Mahmoud Guettat**: Tunisian musicologist; *La musique classique du Maghreb* (1980), comprehensive synthesis.

The 1932 Cairo Congress recorded substantial Maghrebi material — Tlemceni Gharnāṭī (Bensari père et fils), Tunisian ma'lūf (Ben Hassan, Cherif), Moroccan al-āla (Chouika, Jaïdi) — and proposed standardizing Arabic tuning to 24-EDO. Maghrebi delegations were broadly receptive (consistent with their relatively diatonic practice); Egyptian and Iraqi representatives were more resistant.

Earliest institutional forms of Algerian Andalusi codification: the **École de musique arabe** in Algiers (1909) and **El Moutribia** musical association (1911), both in the colonial-French institutional matrix.

### 7.2 Post-independence state recovery

After independence (Tunisia 1956, Morocco 1956, Algeria 1962), each state institutionalized Andalusi music as national-classical patrimony: Tunisia distributed Rashīdiyya transcriptions and established Testour Festival as the national ma'lūf competition; Algeria built state orchestras of Algiers / Tlemcen / Constantine and the Radio d'Alger Andalusian Orchestra; Morocco built the Conservatoire de Tetouan, with conservatories in Fez, Tangier, Rabat, and state-broadcast commitment to al-āla.

Glasser (2016) reads this national-patrimony framing skeptically. The Iberian-Muslim heritage is a politically resonant national symbol — claiming Andalusi descent signals a sophisticated Islamic-Mediterranean past against colonial denigration — but the same heritage is *contested* across borders (Morocco vs Algeria especially), and patrimonial claims have been mobilized in border politics and tourism-cultural diplomacy.

### 7.3 The Jewish role

Maghrebi-Jewish musicians were **central to the preservation, performance, and transmission** of Andalusi music in the late 19th and 20th centuries — not a footnote, but constitutive. Davila (2013), Seroussi, Eilam-Amzallag, and Zafrani all document the dense Jewish-Muslim co-practice; Glasser (2016) treats Jewish-Muslim musical intimacy in Algeria as a central theme. The 9th-century *Manṣūr al-Yahūdī* is named in early sources as one of Ziryāb's court colleagues — co-practice is documented from inception.

Twentieth-century Algerian-Jewish musicians indispensable to the tradition's survival:
- **Edmond Nathan Yafil** (1874–1928): Algiers; *Musique arabe et maure* transcriptions.
- **Saoud l'Oranais** (Messaoud Habib Médioni, 1886–1943): Oran teacher; murdered at Sobibor.
- **Reinette l'Oranaise** (Sultana Daoud, 1918–1998): blind singer, "the little queen of hawzī"; trained by Saoud, preserved a major chunk of the Algerian Judeo-Arabic and Andalusi repertoire after the 1962 dispersal.
- **Lili Boniche** (1921–2008): Algiers-born popular and classical singer, Paris-based from 1962.
- **Salim Halali** (Simon Halali, 1920–2005): Algiers-born North African star, Paris-based.

The mass departure of Algerian Jews in 1962 removed a substantial fraction of the carrying community; Tunisian, Algerian, and Moroccan Jewish lineages of Andalusi practice continue today in **Paris, Marseille, and Israel** as much as in home cities. Diaspora preservation is a real wing of the tradition. In Morocco, Jewish musicians similarly preserved melodies and texts, particularly in *al-samāʿ wa-l-madīḥ*; Moroccan Jewish communities in Israel maintain liturgical adaptations of al-āla today (Eilam-Amzallag; Seroussi).

For makam_studio's living-archive ethos: the Jewish-Maghrebi lineage **must be acknowledged at the preset/metadata level**, not erased.

---

## Implications for makam_studio

1. **Add `arabic_maghrebi` as its own tradition tag**, with sub-tags `tunisian`, `algerian-algiers`, `algerian-tlemceni`, `algerian-constantinian`, `moroccan`, `libyan` (and optional `judeo-maghrebi`). Maghrebi is a genuinely different lineage with different mode names, scales, ensemble, suite structure, and tuning practice — bundling under generic "Arabic" would erase real distinctions.

2. **Namespace mode names by tradition.** Maghrebi `Sīkāh`, `'Irāq`, `Iṣbahān`, `Ḥijāz` are not the same scales as their Mashriqi homonyms — the same shared-name problem as Azeri vs Persian. A key like `tradition:moroccan/mode:isbahan` should never collide with `tradition:arabic-egyptian/mode:isbahan`.

3. **v1 tuning grid: 12-EDO with per-mode neutral-interval flag.** The dominant scholarly view (Davila 2013; Glasser 2016; Reynolds 2021) is that Maghrebi practice is largely diatonic in conservatoire form. A short list of modes (al-Iṣbahān, al-Māya, Sīkāh family, parts of al-Gharībat al-Ḥusayn) should accept a `neutral_interval: true` toggle plus optional regional flavor parameter. **Simpler** than the Mashriqi tuning model — a good v1 scope.

4. **Time-of-day metadata is canonical**, not ornamental — Tunisian *tubūʿ* associate with hours, colors, humors (Davis 2004); Moroccan preserves attenuated form. Cross-tradition with raga and parts of Persian dastgāh; the schema's `time_of_day` field should not be Maghrebi-only.

5. **Functional-context tag.** Maghrebi traditions distinguish concert / Sufi-zāwiya / hawzī-aroubi-chaâbi (vernacular) / wedding-circumcision (domestic). A per-preset `functional_context` carries useful info cheaply.

6. **The nawba suite structure suggests a future "session" / "playlist" feature.** A complete Moroccan al-āla nawba is a 90-minute structured listening experience (prelude → tūshiya → 5 mawāzīn, accelerating). Per-mode presets don't capture this; a v2 feature.

7. **Honor the Jewish-Maghrebi lineage at the metadata level.** Cite Yafil, Saoud l'Oranais, Reinette l'Oranaise, Lili Boniche, Salim Halali in Algerian preset notes. Cultural-sensitivity obligation.

8. **'ūd 'arbī as v2 instrument voice.** Genuinely different from Mashriqi 'ūd (4 courses, re-entrant tuning, longer neck, different timbre). v1 can use the existing plucked-string voice with retuning.

9. **Lean into the lost-paradise / authenticity tension** in preset notes: "this is the Moroccan al-āla codification of a tradition whose claimed 9th-century origins are largely lost; what survives is a 1788 Tetouan compilation and 20th-century conservatoire practice." Honesty is more interesting than the museum-piece framing.

10. **Library-content priority**: one strong representative nawba per tradition with full backing notes — Tunisian *Nawba Dhīl*, Algerian San'a *Nawba Mawwāl*, Tlemceni Gharnāṭī *Nawba Raṣd al-Dhīl*, Moroccan al-āla *Nawba Ramal al-Māya* (Davila's monograph subject — best-documented in English).

---

## Open questions

- **Empirical cents data.** No published large-scale acoustic study of Maghrebi performance intonation exists in English (comparable to Bozkurt et al. for Turkish, Abu Shumays for Levantine). The "less microtonal" claim is well-attested qualitatively but lacks measured evidence to set neutral-zone widths quantitatively. Contact Davila / a Maghrebi conservatoire if pursuing v2 microtonal precision.

- **Libyan ma'lūf details.** English scholarship is genuinely thin (Touma 1996 sketches; nothing comparable to Davis 2004 for Libya). Defer Libyan as Tunisian sub-region for v1.

- **Tlemceni vs Algiers mode-by-mode differentiation.** The 16-mode (Algiers) vs 8-category (Tlemcen) systems are documented but empirical scale-degree differences are not catalogued in English. Likely needs a French source dive (Guettat 1980, Poché 1995, Glasser 2016 ch. 4).

- **The "lost modes."** Rouanet (1922) documented Asbaʿayn, Iṣbahān variants, Rahāwī as lost in Algerian practice. Recoverability from manuscripts/recordings unclear. Out of scope for v1.

- **Sephardic / Judeo-Spanish overlap.** Reynolds (2021) treats Sephardic music as a parallel inheritor of al-Andalus, not derived from Maghrebi Andalusi. Whether makam_studio should include Sephardic presets and how to relate them is a separate scoping question.

- **Modulation conventions within a single nawba.** Davila (2014, 2015) covers Ramal al-Māya in detail; equivalents for the other 10 Moroccan nawbāt and all Algerian/Tunisian nawbāt are not catalogued in English. v1 can treat each nawba as single-mode; v2 might want secondary-mode metadata.

---

## Sources

- Wikipedia: *Andalusi nubah*, *Andalusian classical music*, *Sanaa (music)*, *Gharnati music*, *Music of Algeria*, *Music of Morocco*, *Kunnash al-Haik*, *Cairo Congress of Arab Music*, *Reinette L'Oranaise*. Accessed 2026-04-30.
- Wikipédia (French): *Tab'* (https://fr.wikipedia.org/wiki/Tab'), *Musique arabo-andalouse*.
- ualberta Canadian Centre for Ethnomusicology wiki, *North African nawba*: https://www.artsrn.ualberta.ca/ccewiki/index.php/North_African_nawba
- Maghrib Podcast, "The 'Lush Garden' of Andalusian Music" (Carl Davila interview): https://www.themaghribpodcast.com/2022/05/the-lush-garden-of-andalusian-music.html
- Reynolds, "Al-Maqqarī's Ziryāb: The Making of a Myth" (PDF, UCSB): https://www.religion.ucsb.edu/wp-content/uploads/Ziryab.pdf ; "Ziryab and Us" (PMC): https://pmc.ncbi.nlm.nih.gov/articles/PMC8372298/
- Ruth Davis, *Music & Anthropology* 7 interview: https://www2.umbc.edu/MA/index/number7/davis/dav_03.htm
- University of Chicago Press page for Glasser 2016: https://press.uchicago.edu/ucp/books/book/chicago/L/bo22340510.html
- Davila, "East Winds and Full Moons" (Academia.edu PDF): https://www.academia.edu/5106427/
- Reynolds 2021 PDF: https://www.academia.edu/100917855/
- Davila, *Nūbat Ramal al-Māya in Cultural Context* (Brill): https://brill.com/view/book/9789004294530/B9789004294530_008.xml
- The Tunisian oud (oudmigrations, Beckles Willson 2017): https://om.rachelbeckleswillson.com/2017/08/14/the-oud-of-tunisia/
- Algerian Andalusian modes (French): https://musique-arabe.over-blog.com/article-les-modes-de-la-musique-andalouse-algerienne-61799622.html
- Bibliography on Arabo-Andalusian Music (bolingo.org): https://www.bolingo.org/audio/arab/nuba/nubabiblio.html
- IEMJ, *Songs by Jews from Algeria*: https://www.iemj.org/en/chants-des-juifs-dalgerie-1/
- Algerian Andalusian primer (sac-dz): https://sac-dz.ch/en/article/andalusian-music-what-you-need-to-know-about-its-origins-in-algeria

---

## References

(Chicago author-date)

Bannūna, Mālik, ed. n.d. *Kunnāsh al-Hāʼik* (critical edition of Muḥammad al-Hāʼik al-Tiṭwānī, *Kunnāsh*, c. 1788–1789).

Davila, Carl. 2009. "Fixing a Misbegotten Biography: Ziryab in the Mediterranean World." *Al-Masāq: Islam and the Medieval Mediterranean* 21 (2): 121–136.

Davila, Carl. 2013. *The Andalusian Music of Morocco: Al-Āla. History, Society and Text*. Literaturen im Kontext 36. Wiesbaden: Reichert. (Expanded 2nd ed., 2015.)

Davila, Carl. 2014. "East Winds and Full Moons: Ramal al-Māya and the Peregrinations of Love-Poetry Images." *Journal of North African Studies* 19 (1): 1–24.

Davila, Carl. 2015. *Nūbat Ramal al-Māya in Cultural Context: The Pen, the Voice, the Text*. Brill Studies in Middle Eastern Literatures 35. Leiden: Brill.

Davis, Ruth F. 2004. *Maʼlūf: Reflections on the Arab Andalusian Music of Tunisia*. Lanham, MD: Scarecrow Press.

Erlanger, Rodolphe d'. 1930–1959. *La musique arabe*, 6 vols. Paris: Geuthner. (Vols 5–6 give modal/rhythmic theory; posthumous completion.)

Glasser, Jonathan. 2016. *The Lost Paradise: Andalusi Music in Urban North Africa*. Chicago Studies in Ethnomusicology. Chicago: University of Chicago Press.

Guettat, Mahmoud. 1980. *La musique classique du Maghreb*. Paris: Sindbad.

Poché, Christian. 1995. *La musique arabo-andalouse*. Arles: Cité de la musique / Actes Sud.

Reynolds, Dwight F. 2008. "Al-Maqqarī's Ziryāb: The Making of a Myth." *Middle Eastern Literatures* 11 (2): 155–168.

Reynolds, Dwight F. 2021. *The Musical Heritage of al-Andalus*. SOAS Studies in Music. Abingdon: Routledge.

Rouanet, Jules. 1922. "La musique arabe" and "La musique arabe dans le Maghreb." In *Encyclopédie de la musique et dictionnaire du Conservatoire*, ed. Albert Lavignac and Lionel de la Laurencie, vol. 5. Paris: Delagrave.

Schuyler, Philip D. (compiler). 2017. *Music of Morocco from the Library of Congress: Recorded by Paul Bowles, 1959*. 4-CD set. Dust-to-Digital / Library of Congress.

Seroussi, Edwin. Various articles on Sephardic and Maghrebi-Jewish music. Jewish Music Research Centre, Hebrew University of Jerusalem.

Shiloah, Amnon. 1995. *Music in the World of Islam: A Socio-Cultural Study*. Aldershot: Scolar Press / Wayne State University Press.

Touma, Habib Hassan. 1996. *The Music of the Arabs*, trans. Laurie Schwartz. Portland, OR: Amadeus Press. (Original German ed. 1975.)

Yafil, Edmond Nathan, and Jules Rouanet. 1904ff. *Répertoire de musique arabe et maure*. Algiers.

Zafrani, Haïm. 1980, 1996. *Littératures dialectales et populaires juives en Occident musulman*. Paris: Geuthner.

---

*Document status*: draft, 2026-04-30. Wave-2 makam_studio research. Maghrebi tradition coverage; pairs with wave-1 docs on Levantine, Egyptian, Ottoman, Persian, and Azeri/Shashmaqam traditions.
