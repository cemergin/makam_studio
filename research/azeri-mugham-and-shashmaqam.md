---
title: Azerbaijani Mugham & Bukharan/Tajik/Uzbek Shashmaqam
audience: makam_studio designers, engine architects, preset curators; readers comfortable with maqam vocabulary but not specialists in Caucasian or Central Asian traditions
tldr: |
  Two classical traditions descended from the broader Persian/Islamic music-theoretical lineage.
  Both share root names with Ottoman, Arabic, and Persian systems (Rast, Segah, Chahargah, Bayati)
  but mean different things in each. Azerbaijani mugham is a 7-mode system codified by
  Uzeyir Hajibeyli in 1945 and performed primarily by a vocal-tar-kamancha trio; Bukharan
  Shashmaqam is a six-suite cycle with vocal (nasr) and instrumental (mushkilot) halves,
  long preserved by Bukharan Jewish musicians and now jointly claimed by Tajikistan and
  Uzbekistan. English-language scholarship is thinner here than for Ottoman/Arabic traditions —
  flag this as a known gap.
skip_if: you are only building Ottoman/Turkish or Arabic/Levantine support and have already decided not to ship Azeri or Shashmaqam presets
date: 2026-04-30
status: draft
---

# TL;DR

- Azerbaijani mugham has **7 main modes** (Rast, Shur, Segah, Chahargah, Shushtar, Bayati-Shiraz, Humayun) plus **3 auxiliary modes** (Shahnaz, Chahargah-2, Sarendj) per Hajibeyli's 1945 codification. Each mugham is a multi-part suite of **shöbə** (subsections, the rough analogue of Persian gusheh) bracketed by a **bardaşt** opening and **ayaq** closing.
- Hajibeyli's *Principles of Azerbaijani Folk Music* (1945) tempered the system to 12-TET for harmonization with Western orchestras, but Jean During's measurements on Malik Mansurov's tar show **actual practice uses ~27 frets/octave**, with neutral-third positions around **149 cents** above the lower note and Pythagorean-leading-tone semitones around **64 cents** — meaningfully different from both 24-TET Arabic theory and Iranian practice.
- Bukharan **Shashmaqam** is a corpus of **~250 pieces in six suites** (Buzruk, Rast, Nava, Dugah, Segah, Iraq), each split into **mushkilot** (instrumental, opens with tasnif/tarje/gardun/mukhammas/sakil) and **nasr** (vocal, sarakhbar → talqin → nasr → ufar). Lyrics are largely Sufi (Hafiz, Rumi, Navoi, Bedil) — the music carries devotional weight even in secular contexts.
- The Shashmaqam survived the 20th century chiefly through **Bukharan Jewish musicians** (Babakhanov dynasty, Mullokandov, Tolmasov, Levi Yahudi, Barno Iskhakova) and the Soviet codifier **Yunus Rajabi** (1897–1976), who notated >1000 pieces. After 1991 the tradition forked into competing **Tajik** (Dushanbe) and **Uzbek** (Tashkent) canons; the Bukharan Jewish thread largely emigrated to Queens, NY.
- The shared-name problem is severe: **Rast in Turkish, Arabic, Iranian, Azeri, and Shashmaqam are five different scales** with overlapping but non-identical pitch sets, modulation paths, and aesthetic personalities. A single "Rast" preset is misleading.
- For makam_studio: ship a **tradition selector** that disambiguates at the preset level ("Rast (Turkish AEU)" vs "Rast (Azeri Mansurov)" vs "Rost (Shashmaqam)"); when sources disagree, default to a named authority and surface that authority in the UI.

---

## A. Azerbaijani Mugham

### Origin, scope, and recognition

Mugham (muğam, муғам) is the classical art-music of Azerbaijan, performed primarily in Baku and historically in three regional schools: **Shusha** (in Karabakh — long the dominant school until 2020), **Shamakhi**, and **Baku**. UNESCO proclaimed it a Masterpiece of the Oral and Intangible Heritage of Humanity in **2003** and inscribed it on the Representative List in **2008**. The state-sponsored International Mugham Center opened in Baku in 2008.

The word *mugham* operates in two registers, much like *maqam* elsewhere: it is the name of a **modal scale** (e.g. "Rast" as a mode), and it is also the name of a **multi-movement suite form** built on that mode (e.g. "Rast" as a half-hour performance). Composer Gara Garayev formalized the distinction; Azerbaijani theorists also call the modal sense "lad" (after the Russian музыкальный лад / Azeri *lad*).

### The seven main mughams + auxiliary modes

Per Hajibeyli's 1945 codification (still the official theory):

| # | Main mode | Tonic role / character | Persian/Arabic cousin |
|---|---|---|---|
| 1 | **Rast** | Bright, "epic", confident; central to Azeri repertoire | Rast (Persian-influenced) |
| 2 | **Shur** | Lyrical, melancholic, the most-performed mugham | Shur (Persian) — distinct from Iranian Shur in detail |
| 3 | **Segah** | Tender, heartfelt; characteristic neutral-third on a non-Pythagorean degree | Segah/Sehgah |
| 4 | **Chahargah** | Heroic, active; with augmented-second character | Persian Chahargah, Arabic Hijaz family |
| 5 | **Shushtar** | Sad, restrained; relates to Persian Avaz-e Shushtari | Persian Shushtari |
| 6 | **Bayati-Shiraz** | Lyrical, tender | Persian Bayat-e Shiraz |
| 7 | **Humayun** | Solemn, dignified | Persian Homayoun |

Auxiliary modes per Hajibeyli: **Shahnaz**, **Chahargah of the second type**, and **Sarendj**.

A separate category of **zarbi mughams** ("rhythmic mughams" — fixed-meter pieces over which the singer improvises mugham phrases) includes Heyrati, Arazbari, Samayi-Shams, Mansuriyya, Mani, Ovshari, Heydari, Karabakh Shikastasi, and Kasma Shikastasi. The shikastasi pieces are particularly Karabakh-rooted.

### Shöbə structure (subsections)

Every mugham is a sequence of named **shöbə** (شعبه, "branch" — Russian *shobe*, often Latinised *shu'be*). The shöbə is the rough analogue of the Persian *gusheh*, but Azeri shöbə have stronger structural identity — each has a fixed melodic skeleton, an expected register, and (often) its own internal modulation logic.

A canonical performance template:

1. **Bardaşt** — instrumental opening, establishes mode and tonic (*maye*).
2. Sequence of **shöbə** climbing in tessitura, each modulating progressively higher; each shöbə may itself be named for a distantly related mugham (so Segah-mugham contains a *Mukhalif* shöbə that nods toward another mode).
3. **Tasnif** and **rəng** — composed lyrical and instrumental interludes between shöbə, providing structural rest.
4. Climax in **zil** (high) register.
5. **Ayaq** — descending closing section returning to the maye.

For example, Segah-mugham unfolds (one common ordering) as: Bərdaşt → Maye → Manandi-Mükhalif → Segah → Yetim-Segah → Şikəsteyi-Fars → Mübərriqə → Hisar → Aşıq-Küşü → Ayaq.

### Hajibeyli, *Principles of Azerbaijani Folk Music* (1945)

Uzeyir Hajibeyli (Üzeyir Hacıbəyli, 1885–1948) — composer, opera pioneer, founder of Baku Conservatory — published *Azərbaycan xalq musiqisinin əsasları* in 1945 after roughly 25 years of research. English translation appeared in 1985. The book's project was simultaneously **theoretical** (build a tetrachord-based grammar that could be taught in conservatories), **practical** (let Azerbaijani composers write in tempered Western forms without losing modal identity), and **political** (legitimize Azerbaijani art music inside the Soviet cultural project).

Core claims:

- Azerbaijani modes are built from **tetrachord chains** (combinations of 2 or 3 tetrachords, sometimes more). Five tetrachord types combine in four canonical ways to generate the 7 main modes.
- The system is presented in **tempered (12-TET) terms**, ostensibly to enable harmonization. Hajibeyli avoided four-part chordal harmony in modal contexts (which would distort the modal voice-leading) and preferred **contrapuntal polyphony and unison/octave doubling** in the "tricky" modal passages — a technique still audible in symphonic mugham (Fikrat Amirov's *Shur*, 1949; Niyazi's works).
- Each mode has a **maye** (tonic) typically located in the *middle* of the scale — not the bottom. This is a critical point of difference from Western tonic-centric thinking and from much Arabic theory: melodic motion in mugham is centripetal rather than scalar-from-below.

The big asterisk: Hajibeyli's tempering was **prescriptive for composition**, not descriptive of practice. Performers on tar and kamancha continued to play traditional microtonal pitches. Jean During's *The Intervals of the Azerbaijani Mugam* (academia.edu) documents this directly:

- Mid-Soviet "standard" tar (state philharmonic / ensemble use) flattened toward ~24-TET-ish or even 12-TET-ish positions.
- Malik Mansurov's late-Soviet/post-Soviet tar restores up to **27 frets within an octave**, with neutral-third frets sitting near **149 cents** (≈37 savarts) above the lower neighbor — close to but not identical with Iranian *koron* practice — and small leading-tone semitones near **64 cents** (a comma below a Pythagorean diatonic semitone). The 100-cent fret is reserved for harmonic/strict-third uses where Iranian-style intonation is wanted.
- During notes the post-1991 Azerbaijani aesthetic has **drifted slightly Turkward** as cultural ties with Iran loosened — but it remains distinct from both Turkish AEU and Iranian dastgah.

Implication: Hajibeyli's text gives names and structures, but for *pitches* the makam_studio engine should follow performer-instrument practice (Mansurov, Qasimov-trio recordings) rather than Hajibeyli's tempered presentation.

### The Mugham Trio and key performers

The standard ensemble since the second half of the 19th century is the **mugham trio** (or mugham triad): **xanəndə** (vocalist, who plays the **qaval/daf** frame drum) + **tar** + **kamança** (Azerbaijani spiked fiddle). The trio Jabbar Garyaghdioglu / Gurban Pirimov (tar) / Sasha Okanezashvili (kamancha) was active from ~1905 and became the prototype.

The Azerbaijani **tar** itself is a Sadigjan-redesigned (~1870) instrument, distinct from the Persian tar: pericardium-of-ox (not lamb) membrane, **11 playing strings** (vs 6 on Persian tar), three principal courses plus drone and resonance strings, ~17 fixed tones in the "standard" form (more in performer-modified instruments like Mansurov's). It's held against the chest, not in the lap. Kamança (kamancheh) is louder and more cutting than the Iranian variant and is foundational to mugham's dramatic register.

Modern key performers:

- **Alim Qasimov** (b. 1957) — internationally the most visible mugham vocalist; performs with daughter **Fərqanə Qasımova**. Aga Khan Music Initiative collaborator. Documented on *Music of Central Asia Vol. 6: Spiritual Music of Azerbaijan* (Smithsonian Folkways, 2007).
- **Aghakhan Abdullayev** (1950–2016) — "Guardian of mugham," conservatory-trained khananda; recordings preserved in National TV/Radio Golden Fund.
- **Arif Babayev**, **Yagub Mammadov**, **Janali Akbarov** — older generation reference singers.
- **Habil Aliyev**, **Adalat Vezirov** — kamancha masters.
- **Ramiz Quliyev**, **Möhlət Müslümov**, **Malik Mansurov** — tar masters; Mansurov's instrument and intonation choices are particularly important for any synthesis project.

### Soviet codification: what was preserved, what was reformed

Soviet musical policy on mugham was ambivalent. Stage 1 (1920s–early 1930s): mugham was tolerated as "national folk." Stage 2 (mid-1930s): pressure to absorb it into Western symphonic and operatic forms — Hajibeyli's *Koroglu* (1937), the founding of Baku State Conservatory (1921, by Hajibeyli), Niyazi conducting symphonic mugham. Stage 3 (post-WWII): institutional codification — the 1945 *Principles* book, the State Philharmonic Mugham Trio formalization. Stage 4 (post-Stalin): a recognized canonical performer caste (People's Artists), regional Karabakh schools officially valorised.

What was preserved: the trio format; the named-shöbə structure; vocal style (melismatic, register-climbing); core repertoire.

What was filtered: improvisational latitude (state-recorded versions tend to be more fixed than oral practice); some regional and "vulgar" or aşıq-tradition pieces; the more intensely Sufi/devotional dimensions (compared to Persian or Shashmaqam, Azeri mugham reads as more secular today, partly the Soviet legacy).

The Mugham Triad concept also refers to the symphonic-mugham tradition — works like Amirov's *Shur*, *Kürd-Ovşarı* (1949), and *Gulustan-Bayati-Shiraz* (1968) — three orchestral mugham symphonies that became the genre's flagship.

### How Azeri mugham diverges from Persian dastgah

Despite shared root, the divergences are real:

| Axis | Persian dastgāh | Azerbaijani mugham |
|---|---|---|
| Number of primary modes | 7 dastgah + 5 avaz | 7 main + 3 auxiliary modes |
| Sub-units | gusheh (open-ended catalogue) | shöbə (more fixed, more named) |
| Tonic position | varies (shahed/ist on functional notes) | **maye** typically mid-scale |
| Ensemble | tar+setar+santur+ney+vocal+tombak; soloist-driven | **mugham trio** (vocalist+tar+kamancha+daf) standard |
| Tar instrument | Persian tar — 6 strings, lap, lamb membrane | Azerbaijani tar — 11 strings, chest, ox membrane, 17+ frets |
| Tempo / energy | generally slower, more contemplative | denser, more dramatic, faster passages including zarbi |
| Microtonal vocabulary | koron/sori system, Vaziri 24-TET vs Farhat performer-reality | More positions on tar; Mansurov ~27/octave; Hajibeyli tempered as theoretical compromise |
| Vocal aesthetic | tahrir ornament; restrained | xanəndə voice often louder, more declamatory; daf in vocalist's hand |
| Sufi vs secular framing | overtly mystical via radif texts | more secular nationalist framing post-1920s |

Azeri Shur ≠ Persian Shur (different shöbə paths, different intonation defaults); Azeri Chahargah is closer to Iranian Chahargah than to Arabic Hijaz; Azeri Humayun has a different opening shöbə than Persian Homayoun. Treating them as a single mode label across traditions will produce sonically wrong presets.

---

## B. Bukharan / Tajik / Uzbek Shashmaqam

### Definition and scope

**Shashmaqam** (Tajik *shashmaqom*, Uzbek *shashmaqom* — literally "six maqams") is the classical court music of the Bukharan emirate, evolved over many centuries in the trans-Oxus urban triangle of Bukhara–Samarkand–Khujand. It is performed today in Tajikistan and Uzbekistan, by Bukharan Jewish musicians in diaspora (especially Queens, NY), and increasingly in transnational ensembles. UNESCO inscribed it in **2003** (Masterpiece) and on the Representative List in **2008**, jointly between Tajikistan and Uzbekistan.

The corpus comprises **~250 individual pieces** organized into **six modal suites**. Texts are predominantly Persian (with Uzbek and Chagatai additions), drawing on the great Sufi poets — Hafiz, Jami, Rumi, Bedil, Navoi, Mashrab. The performance ethos sits between concert music and devotional Sufi *sama* — secular in venue, sacred in lyric.

### The six maqams

| Maqam | Tajik / Uzbek spelling | Character (broad) |
|---|---|---|
| **Buzruk** | Buzruk / Buzruk | "Great"; dignified, opens the canon |
| **Rast** | Rost / Rast | Bright, central |
| **Nava** | Navo / Navo | Lyrical, plaintive |
| **Dugah** | Dugoh / Dugoh | Tender |
| **Segah** | Segoh / Segoh | Neutral-third "intermediate" register |
| **Iraq** | Iroq / Iroq | High, often climactic in the cycle |

These names overlap with the Ottoman, Arabic, and Persian families but diverge in scale degrees and modulation paths. *Rost* in Shashmaqam, for instance, is functionally close to a Pythagorean-leaning Rast with neutral third near 5/4 territory — but is realised on tanbur and dutar with their fixed tied-fret positions, not on the freely-fretted Persian tar.

### Two-part structure: mushkilot and nasr

Each of the six maqams is split in two large halves:

**Mushkilot** ("difficult / instrumental") — opens the suite. Composed of formally named pieces, mostly instrumental, in fixed rhythmic cycles (*usul*):
- Tasnif
- Tarje
- Gardun
- Mukhammas (5-cycle)
- Saqil (Sakil)

**Nasr** ("vocal / prose") — the larger half, vocal with instrumental accompaniment. Two sub-cycles (*shuba*):
- First shuba (the "great" forms, by leading hofiz/hafiz singer): Sarakhbar → Talqin → Nasr → Ufar
- Second shuba: ancillary vocal pieces (Tarona, Naqsh, Savt, Mughulcha, Ufari-X variants)

Each large vocal form has named **internal sections** — the *sarkhona* (head-section, lower-tessitura statement), *miyon-khona* (middle, modulating), *bozguy* (return), and the climactic **awj** (high-register apex, where the singer shifts to a higher modulation). Musicologist Alexander Djumaev and others identify the awj as the structural-emotional summit.

So a full performance of, say, Maqam Buzruk is a 90-minute-or-more arc: Mushkilot suite (instrumental composed pieces in usul cycles) → Sarakhbar (slow vocal with instrumental ritornello) → Talqin (3/4 or 3/8 metered) → Nasr (6/4) → Ufar (light, dance-inflected close).

### Bukharan Jews: the preservation thread

A historically unusual thing about the Shashmaqam: for several centuries, the **Bukharan Jewish** community of Central Asia was disproportionately responsible for its transmission. Why: under emirate-era restrictions on Muslim Sufi musical performance in some periods, and persistent demand for court entertainment, Bukharan Jewish musicians (and *chalas* — coerced converts to Islam) became the professional caste at the Bukharan emir's court.

Key dynasties and figures:

- **Levi Bobokhonov** (Levi Yahudi, "Levicha", 1873–1926) — court singer for the last two emirs of Bukhara; founded a teaching school. Probably the most important transmitter of late-19th-c. classical Shashmaqam practice.
- **Babakhanov dynasty** — Levi → his son **Moshe Babakhanov** (1909–1983) → grandson **Ari Babakhanov** (b. 1934). Ari studied at the Tashkent Conservatory in the 1950s, collaborated with his father to arrange >300 Shashmaqam pieces, founded the Shashmaqam Ensemble at the Bukhara Philharmonic in 1991, then emigrated to Germany where he has worked with musicologist Angelika Jung since 2002.
- **Mullokandov / Mullakandov dynasty** in Samarkand and **Tolmasov dynasty** likewise.
- **Barno Iskhakova** (Itzhakova) — first woman to become a professional Shashmaqam singer; Sadriddin Aini called her "Levicha among women."

Why this matters for the project: large parts of the surviving recorded Shashmaqam repertoire come through Jewish singers, and the diaspora ensemble (e.g. **Ensemble Shashmaqam** in NYC, founded 1983, supported by the Center for Traditional Music and Dance) preserves a slightly different performance lineage than the Soviet-codified Tashkent and Dushanbe versions. Theodore Levin's *The Hundred Thousand Fools of God: Musical Travels in Central Asia (and Queens, New York)* (Indiana UP, 1996) documents this thread directly — it's the indispensable English-language source.

### Soviet codification: Yunus Rajabi and the freezing problem

**Yunus Rajabi** (1897–1976) was a Tashkent-based composer, singer, and ethnomusicologist who, beginning in the 1920s and through the late Soviet period, **transcribed and notated >1000 Shashmaqam pieces**. His multi-volume notation series (Tashkent, 1959–1971) is the canonical Soviet edition of the Uzbek branch.

This work was simultaneously a salvage operation (by 1951 Stalin's "anti-formalism" decree had outright suppressed Shashmaqam as feudal) and a freezing operation (notation reduces oral variability; the Tashkent radio ensemble he led performed Rajabi's specific versions, which became the de facto standard).

Faizullah **Karomatov** (1925–2014) — the major Uzbek musicologist of the second half of the 20th century — published a 3-volume *Shäshmäqam* (1966–1970), *Uzbekskaya instrumental'naya muzyka* (1972), and many articles on regional Uzbek styles. His student-tradition continues Rajabov's notation lineage.

The problem with Soviet codification: the Bukharan oral practice — full of micro-ornamentation, regional intonation, and improvised connective tissue — was crystallized into fixed scores playable by conservatory ensembles. Some practitioners (notably Ari Babakhanov, the diaspora Bukharan Jewish ensembles, and the Aga Khan Music Initiative's Academy of Maqâm in Dushanbe under **Abduvali Abdurashidov**) have pushed back toward oral-tradition restoration.

### The Tajik–Uzbek fork

After Stalin's 1951 decree, Shashmaqam was suppressed; ideological rehabilitation came in the mid-1950s. From that point, **Tajikistan embraced Shashmaqom as national heritage** (in Dushanbe, with the Persian-language identity foregrounded — most lyrics are Persian/Tajik), while **Uzbekistan developed its own Tashkent-centered version** (with greater emphasis on Uzbek-language pieces and Ferghana-Tashkent maqom alongside Bukharan). Through the 1970s, "Tajik books made no mention of Uzbek shashmaqam and vice versa." The 1980s saw some thawing; 1991 independence reignited cultural-ownership tensions but did not produce a clean "fork." UNESCO's 2008 joint inscription is partly an attempt to suture this.

The political weight is real and ongoing: under late-Karimov-era Uzbek nationalism, Bukharan radio shifted toward exclusively Uzbek-language texts; the Tajik-speaking population of Bukhara and Samarkand — historically the lifeblood of the tradition — has been progressively marginalized. **Razia Sultanova** (Cambridge), **Theodore Levin** (Dartmouth), and **Jean During** (CNRS) have all written sensitively on this; the project should not take sides but should not erase the layered identity claims either.

### Instruments

Core instruments (with brief tuning notes):

- **Tanbur** (Tajik/Uzbek) — long-necked fretted lute, 4 metal strings, played with metal plectrum on index finger. **Distinct from Turkish tanbur** (which is much larger and used in Ottoman classical). The Central Asian tanbur is the principal melody instrument of Shashmaqam. Frets are tied (gut/nylon) and **movable** in principle, though in practice positioned per maqam-cycle. Typical tuning includes a melody string + drone strings.
- **Sato** (Setar in some sources, distinct from the Iranian setar) — bowed tanbur; carries melodic lead in instrumental sections, plays with the singer in vocal sections.
- **Dutar** — two-string long-necked lute, gut/silk strings (now nylon); softer, often pairs with tanbur. Different family from Iranian setar; closer to the Khorasan dotar via the Central Asian dotar family (see Jean During, "The Dotar Family in Central Asia").
- **Doira** (dayra, dap, frame drum) — wooden frame, single skin head, jingle rings; carries the **usul** (rhythmic cycle), often played by the singer.
- **Gijak** (ghichak) — small spike fiddle, sometimes substitutes/accompanies the sato.
- **Ney** (reed flute) and **rubab** (short-necked lute) — secondary roles.
- Modern ensembles often add **violin**, **clarinet**, **chang** (hammered dulcimer; not the same as Persian chang harp), and (in radio-ensemble Soviet contexts) **accordion**.

### Tuning and the comma

Honest answer: **English-language measurements of Shashmaqam tuning are scarce.** What we know:

- Shashmaqam's nominal scale system is **Pythagorean-derived** (in the lineage of the medieval treatises of Safi al-Din Urmawi, Qutb al-Din Shirazi, and Abd al-Qadir Maraghi — the same Perso-Arab theoretical stem that gave rise to the 17-tone Pythagorean octave used as a reference in much later Persian and Ottoman thought).
- **Neutral thirds and neutral seconds** are present and characteristic, particularly in Rost and Segah modes. Whether they are exact 24-TET quarter-tones (as Mishaqa-style Arabic theory codifies) or unequal positions varies by performer and mode. The Pamir falak tradition (mountain Tajikistan) has been measured as **microtonal-chromatic** even where its theory is nominally diatonic-Shashmaqam.
- The tanbur's tied movable frets are positioned per maqam cycle but are not freely adjusted within a piece. This means Shashmaqam intonation is *categorical* (a fixed set of fret positions per maqam) rather than *gradient* (the way Iranian tar players slide pitches contextually).
- Concrete cents-level catalogues for each Shashmaqam mode in Western academic literature: **incomplete**. Karomatov's three-volume work (Russian) and During's Central Asian dotar-and-tanbur measurements are the closest. **This is a real research gap** for makam_studio — for high-fidelity presets we may need to derive intonation from recordings (Smithsonian Folkways volumes 2 and 7, Yunus Rajabi archival recordings) rather than from notation.

### Modern theoretical frameworks

- **Faizullah Karomatov** — *Шäшмäqам* (3 vols, 1966–70); *Uzbek Instrumental Music* (1972). Russian-language; the structural analytical foundation.
- **Aslam Rajabov** — Tajik musicologist; advocate of the Tajik-language Shashmaqom canon.
- **Theodore Levin** — *The Hundred Thousand Fools of God* (1996); editor (with Saida Daukeyeva and Elmira Köchümkulova) of *The Music of Central Asia* (Indiana UP, 2016) — currently the best one-volume English-language reference, includes online audio/video.
- **Jean During** — French ethnomusicologist (CNRS, Strasbourg); *Le répertoire-modèle de la musique iranienne* (1995, with Mirabdolbaghi); essays on the tanbur, dotar, and Central Asian intonation. Indispensable for measurement work.
- **Razia Sultanova** — Cambridge Centre for Central Asian Music; *From Shamanism to Sufism: Women, Islam and Culture in Central Asia* (I.B. Tauris, 2011); foregrounds Ferghana Valley women's traditions, which intersect with but are distinct from urban Shashmaqam.
- **Walter Feldman** — "CENTRAL ASIA xvi. Music," *Encyclopaedia Iranica* V/3, 240–242.
- **Aga Khan Music Initiative** — Smithsonian Folkways "Music of Central Asia" series (12 vols, 2005–2017): Vol. 2 *Invisible Face of the Beloved* (Academy of Maqâm, 2006) is the flagship Shashmaqam recording with extensive liner notes.

### Key performers (modern)

- **Yunus Rajabi** himself and the Yunus Rajabi Ensemble (radio archival recordings).
- **Munojot Yo'lchiyeva (Munajat Yulchieva)** (b. 1960) — the most internationally renowned female Uzbek classical singer; Ferghana-tradition rooted; long collaboration with rubab master **Shavkat Mirzaev**.
- **Ozoda Ashurova**, **Nodira Pirmatova**, **Saodat Kabulova** — major women singers of the late 20th century.
- **Abduvali Abdurashidov** — Tajik sato master, director of the Aga Khan-supported Academy of Maqâm in Dushanbe.
- **Ari Babakhanov** — last major living tradent of the Bukharan Jewish line in Central Asia until his emigration; collaborator with Angelika Jung.
- **Ensemble Shashmaqam** (NYC, founded 1983) — Bukharan Jewish diaspora ensemble; Smithsonian Folkways recording.
- **Shavkat Mirzaev** (rubab) — accompanist to Yo'lchiyeva and many Ferghana-Tashkent singers.
- Note also **Sato Movlon** referenced as Tajik sato player; **Shahnoz Madaliev** as Tajik vocalist.

---

## C. Comparative table: shared names, different meanings

For four root names that appear across all five traditions (Ottoman, Arabic, Persian, Azeri, Shashmaqam):

### Rast

| Tradition | Tonic / "C" position | Third | Seventh | Source / character |
|---|---|---|---|---|
| **Ottoman/Turkish** (AEU) | Rast = G (yegah-rast) | Segah perde, ~5 commas above F (≈383 cents) | Acem perde or Eviç, contextual | Bright, "majestic," paradigmatic mode for first lessons |
| **Arabic** (Mishaqa 24-TET) | C | Half-flat E (~350 cents, between minor-and-major) | Half-flat B | Bright, central; Egyptian and Levantine variants of E♭½ differ subtly |
| **Persian** (no "Rast" as primary dastgah, but Rast-Panjgah exists) | varies | mid-third related to Mahur in Iranian theory | — | Less central than in Ottoman/Arab |
| **Azerbaijani** (Hajibeyli + Mansurov) | varies, maye mid-scale | neutral around 149 cents above lower neighbor (Mansurov) | neutral | "Epic, confident"; first mugham taught |
| **Shashmaqam Rost** | varies (often C/G) | Pythagorean-leaning neutral, fixed by tanbur fret | — | Bright; suite opens with mushkilot tasnif |

Key takeaway: the *direction of the third* (above or below 12-TET) is roughly consistent, but the **exact cents value differs**, the **tonic-position convention differs** (Ottoman names a scale degree, Azeri names a maye in the middle), and the **modulation grammar differs** (Ottoman Rast modulates to Nikriz; Arabic Rast modulates to Suznak/Nahawand; Azeri Rast moves through specific shöbə; Shashmaqam Rost progresses through Sarakhbar→Talqin→Nasr→Ufar within the suite).

### Segah / Sehgah / Segoh

| Tradition | Tonic | Notes |
|---|---|---|
| **Ottoman** | Segah perde (E ½-flat region in AEU notation) | Called "Sigah"; tonicizes the perde itself; emotional, intimate |
| **Arabic** | E ½-flat | Most regional variation of any maqam; Egyptian sikah (huzam-leaning), Iraqi sikah (lower 3rd), Aleppo sikah |
| **Persian** | Sehgah dastgah | Tonicizes the neutral third of Shur; gusheh-rich |
| **Azeri** | Segah, with Zabul-Segah variant | Muye-anchored; the Mukhalif shöbə is structurally important |
| **Shashmaqam** | Segoh | One of the six suite-modes; Persian-poetic lyrical tradition |

The shared feature: all five Segah variants center their identity on a **neutral third** as tonic or near-tonic. The differences are in *which other degrees* are neutral, and in *what register* the mode lives.

### Chahargah

| Tradition | Notes |
|---|---|
| **Ottoman** | Çargah — paradoxically a near-major-scale in modern AEU; very different feel from other traditions |
| **Arabic** | Chahargah = Hijaz family relative; augmented-second character |
| **Persian** | Chahargah dastgah — heroic, augmented second between scale-degrees 3 and 4, 6 and 7 |
| **Azeri** | Chahargah — closer to Persian; a "main" mugham; auxiliary "Chahargah of the second type" exists |
| **Shashmaqam** | Not one of the six core maqams (though Hijaz-family relatives appear in shu'ba/sub-modes) |

Chahargah is the *clearest case* of the same name meaning fundamentally different scales. Ottoman Çargah ≠ Persian/Azeri Chahargah.

### Bayati / Bayati-Shiraz / Bayot

| Tradition | Notes |
|---|---|
| **Ottoman** | Beyati — D-tonic neutral-second mode |
| **Arabic** | Bayati — D-tonic, half-flat 2 and half-flat 6, central Arabic mode (Bayati family encompasses Bayati Shuri, Husayni, etc.) |
| **Persian** | Bayat-e Tork, Bayat-e Esfehan, Bayat-e Shiraz — *avaz* sub-modes derived from Shur; Bayat-e Shiraz is distinctive lyrical |
| **Azeri** | **Bayati-Shiraz** is one of the seven main mughams — note the elevated structural status |
| **Shashmaqam** | Bayot appears as a shoba, not a primary maqam |

In Azerbaijani mugham, Bayati-Shiraz is *primary*; in Persian theory it is *derivative* (an avaz of Shur). Same name, different rank.

---

## D. The "shared name problem"

This is a UI design problem, not just a musicological one.

A user types "Rast." We can't show them one preset, because there is no one Rast. We have at minimum:
1. Rast (Ottoman/Turkish AEU) — Arel-Ezgi-Uzdilek 24-Pythagorean-comma defined
2. Rast (Turkish HSU/Yarman 79-tone) — alternative Turkish theoretical revision
3. Rast (Arabic Egyptian) — sikah-leaning third
4. Rast (Arabic Levantine/Aleppo) — slightly higher sikah
5. Rast (Persian Rast-Panjgah dastgah) — Vaziri-tempered or Farhat-naturalist
6. Rast (Azerbaijani standard tar) — tempered-leaning
7. Rast (Azerbaijani Mansurov tar) — restored microtonal
8. Rost (Shashmaqam) — tanbur-defined fret positions

These are eight distinct presets, all called "Rast," and a user choosing the wrong one will hear something subtly or dramatically off from what they expect.

**Approaches considered (will be elaborated in the UX research doc):**

A. **Tradition-first navigation.** Top-level: pick a tradition (Turkish / Arabic / Persian / Azeri / Shashmaqam / Egyptian). Then pick a mode within that tradition. Pro: avoids ambiguity. Con: exotifies traditions; users browsing cross-tradition lose discovery; "Rast" doesn't exist as an idea, only as a tradition-bound thing.

B. **Mode-first navigation with disambiguator.** "Rast" is a thing; clicking it shows a tradition picker. Pro: respects the user's mental model. Con: pretends a unified meta-Rast exists when it doesn't.

C. **Cluster-by-name with explicit authority labels.** Show all Rast variants on one page, grouped by tradition, each with an authority annotation: "Rast (Turkish, AEU)," "Rost (Shashmaqam, after Yunus Rajabi)." Each preset names its source. Pro: educational; preserves comparison. Con: cognitive load; clutter for naive users.

D. **Tradition-first with cross-tradition "compare" affordance.** Default to A (tradition-first) but expose a "show this name in other traditions" link from any preset.

The recommended direction (subject to the UX review's findings) is **D**, with **C** as the developer/researcher inspector view. This frames the traditions as first-class without requiring users to become musicologists, and provides a path from any preset to its cousins.

A meta-point: the project's "living archive" ethos (per BeatForge) requires that we **resist flattening**. The right thing is not to ship one Rast and parametrically transform it; it's to ship explicit named variants from named authorities, and let users compare. This is also defensible philosophically — these traditions are not parameter-perturbations of each other, they are distinct cultural practices with shared etymology.

---

## Implications for makam_studio

### Don't ghettoize the less-documented traditions

The temptation, with thinner English-language sources for Azeri mugham and Shashmaqam, is to ship Ottoman + Arabic + a handful of Persian presets and call it done. **Resist this.** The right move is:

- Ship Azeri and Shashmaqam presets with the same UI weight as Ottoman/Arabic.
- For each preset, surface its **authority** (e.g. "Azeri Rast — after Mansurov tar measurements (During)"; "Shashmaqam Rost — after Yunus Rajabi notations + Bukhara Philharmonic recordings"). Make the source transparent.
- Where intonation data is uncertain, **mark it as such** in the preset metadata. Better to show a "low-confidence intonation, derived from recordings" badge than to fake precision.

### Preset-shipping recommendations

**Azerbaijani mugham (recommended Phase 2 ship):**
- Rast (after Mansurov-tar intonation; karar = G)
- Shur (after Qasimov-trio recordings; karar = D)
- Segah / Zabul-Segah (Karabakh Shusha-school inflection; karar = E half-flat region)
- Chahargah (karar = C)
- Bayati-Shiraz (karar = D, Persian-leaning intonation)
- Optional Phase 3: Shushtar, Humayun, Shahnaz auxiliary

For each, ship the **shöbə progression** as a lightweight melodic-fragment library (think: BeatForge "patterns" but for melody-fragments) so users can hear how a mugham unfolds, not just what its scale is.

**Shashmaqam (recommended Phase 3 ship):**
- Rost (Tajik canonical, after Academy of Maqâm; karar = C/G)
- Buzruk (karar = G)
- Segoh (karar = E half-flat region)
- Iroq (karar = high)
- Optional: Navo, Dugoh

For Shashmaqam, **also include the dual-tradition labels** ("Maqom-i Rost" Tajik / "Maqom Rast" Uzbek) and document the joint UNESCO inscription context. Don't claim it for one nation.

### Tradition selector in the UI

Yes, expose it. Recommended top-level navigation:
- Turkish (AEU + Yarman alternates)
- Arabic — Egyptian
- Arabic — Levantine
- Persian (Vaziri / Farhat selectable)
- Azeri (default Mansurov; tempered alternate)
- Shashmaqam (joint Tajik/Uzbek; show both labels)

Treat each tradition as a "personality" with its own default tar/qanun string layout, default karar pitches, and default intonation. The cross-tradition comparison view is a secondary affordance.

### Instrument modeling considerations

The **Azerbaijani tar** is a meaningful instrument-model in its own right. If the qanun is the primary playing surface, an Azeri-tar **voice** (different timbre — pericardium membrane, brighter, more cutting) could be a pluck-sound preset paired with Azeri mugham presets. Similarly, **tanbur/dutar** voice presets pair with Shashmaqam.

The shöbə / nasr-mushkilot suite logic suggests a **structural-progression** feature beyond simple scale-mode tuning: a "play through the suite" mode that walks the user through the named subsections in order, briefly previewing each. This would distinguish makam_studio from any existing maqam app.

### Resources and people worth contacting

For community input and accuracy validation:

- **Theodore Levin** (Dartmouth) — Aga Khan Music Initiative; gold standard for Central Asia.
- **Razia Sultanova** (Cambridge) — Centre for Central Asian Music.
- **Jean During** (CNRS / Strasbourg, emeritus) — primary intonation-measurement authority for the region.
- **Abduvali Abdurashidov** — Academy of Maqâm, Dushanbe; can validate Tajik Shashmaqam presets.
- **Ari Babakhanov** (Hannover, Germany) and **Angelika Jung** — Bukharan Jewish lineage.
- **Azerbaijan State Conservatoire (Baku) / Mugham Center** — Hajibeyli scholarship; tar masters Möhlət Müslümov and Malik Mansurov.
- **Center for Traditional Music and Dance (NYC)** — Bukharan Jewish diaspora ensemble; archival recordings; community contact point.
- **Smithsonian Folkways / Aga Khan Music** — licensing and curation conversations may be worth opening early.

These names should be treated as expertise-and-blessing contacts when presets are ready for review, not just as bibliography.

### Cultural sensitivity caveats

- **Don't take sides** in the Tajik-Uzbek Shashmaqam ownership question. Use joint UNESCO framing; show both spellings; credit both lineages.
- **Don't elide the Bukharan Jewish thread.** It is core to Shashmaqam history and easily forgotten in nationalist framings (in either direction).
- **Karabakh is contested.** The Shusha mugham school is rooted in territory whose status is geopolitically active in 2026. Acknowledge the school by name; don't editorialize.
- **Soviet legacy is double-edged.** Codification preserved repertoire; it also flattened oral practice and aligned music with state aesthetics. Note this honestly in any explanatory copy.
- **Don't romance "authenticity."** The Mansurov-style microtonal restoration is one current; the conservatory tempered tradition is another; both are living.

---

## Open questions

1. **Cents-level catalogue for Shashmaqam modes.** Best English-language source we found is Levin/During fragments. Is there a Karomatov-derived Russian-language measurement table that could be translated and used as preset ground-truth? Worth reaching out to Sultanova or Abdurashidov.

2. **Hajibeyli's tetrachord algebra in machine-readable form.** His 5 tetrachords × 4 combination rules → 7 main + 3 auxiliary modes is a tractable formal grammar. Has anyone published it as a tuning-system schema (Scala .scl etc.)? If not, makam_studio could be the first.

3. **Mansurov tar fret positions.** During lists ~27 frets/octave but does not publish the full table. Direct measurement (or contact with Mansurov / Azerbaijan Conservatory) is needed for high-fidelity Azeri presets.

4. **Pamir falak vs Shashmaqam intonation.** Pamir mountain music is described as "microtonal-chromatic despite diatonic Shashmaqam theory." How distinct is this from urban Bukhara-Samarkand Shashmaqam in actual cents? Relevant if we want regional sub-presets.

5. **Bukharan Jewish vs Soviet-codified Shashmaqam intonation differences.** Are there measurable pitch differences between the Babakhanov-line oral tradition and the Yunus-Rajabi-notation tradition? Anecdotal accounts suggest yes; published measurements unclear.

6. **Naming convention for the UI: transliteration choices.** Tajik (Cyrillic-Latin), Uzbek (Latin), Russian-English transliterations all coexist. Do we ship "Shashmaqom" (Tajik), "Shashmaqom" (Uzbek), or "Shashmaqam" (English-academic)? Recommend academic English with native-script tooltips.

7. **Whether to expose suite-progression UI for Azeri shöbə and Shashmaqam mushkilot/nasr.** This is a Phase 1+ scope question. The temptation to model only scale-tuning is strong; the right thing might be more structural.

8. **Soviet-era recording rights.** Yunus Rajabi archival material, Melodiya Shashmaqam-of-Bukhara box set (1987, 16 LPs), state-radio Azeri mugham — most are tangled IP. If we want to surface listening references in the app, we need a licensing path (Smithsonian Folkways and Aga Khan are the cleanest).

---

## Sources

### Primary / authoritative
- Hajibeyli, Uzeyir. *Principles of Azerbaijan Folk Music* (Azərbaycan xalq musiqisinin əsasları). Baku, 1945. English translation 1985. Catalog: HathiTrust 001527966.
- Levin, Theodore. *The Hundred Thousand Fools of God: Musical Travels in Central Asia (and Queens, New York)*. Indiana University Press, 1996.
- Levin, Theodore, Saida Daukeyeva, and Elmira Köchümkulova, eds. *The Music of Central Asia*. Indiana University Press, 2016. Companion website: musicofcentralasia.org.
- Sultanova, Razia. *From Shamanism to Sufism: Women, Islam and Culture in Central Asia*. I.B. Tauris, 2011.
- During, Jean. *The Intervals of the Azerbaijani Mugam: Back to the Sources*. (academia.edu PDF, n.d. — measurements on Mansurov tar.)
- During, Jean. "The Dotar Family in Central Asia." (academia.edu PDF.)
- Karomatov, Faizullah. *Шäшмäqам* (3 vols, 1966–70); *Uzbekskaya instrumental'naya muzyka* (1972). Russian.
- Feldman, Walter. "CENTRAL ASIA xvi. Music." *Encyclopaedia Iranica* V/3, pp. 240–242.

### Recordings
- Smithsonian Folkways. *Music of the Bukharan Jewish Ensemble Shashmaqam* (1991). [folkways.si.edu/shashmaqam](https://folkways.si.edu/shashmaqam/music-of-the-bukharan-jewish-ensemble/central-asia-judaica-world/album/smithsonian)
- *Music of Central Asia Vol. 2: Invisible Face of the Beloved — Classical Music of the Tajiks and Uzbeks*. Academy of Maqâm. Smithsonian Folkways / Aga Khan Music Initiative, 2006.
- *Music of Central Asia Vol. 6: Spiritual Music of Azerbaijan*. Alim and Fargana Qasimov. Smithsonian Folkways / Aga Khan, 2007.
- *Music of Central Asia Vol. 7: In the Shrine of the Heart — Popular Classics from Bukhara and Beyond*.
- Yunus Rajabi archival recordings (Tashkent radio, 1950s–70s).
- Melodiya box set, *Shashmaqam of Bukhara* (16 LPs, 1987 Samarkand symposium).

### UNESCO and institutional
- UNESCO Intangible Cultural Heritage. "Azerbaijani mugham" (2003 / 2008). [ich.unesco.org/en/RL/azerbaijani-mugham-00039](https://ich.unesco.org/en/RL/azerbaijani-mugham-00039)
- UNESCO ICH. "Shashmaqom music" (2003 / 2008, joint Uzbekistan + Tajikistan). [ich.unesco.org/en/RL/shashmaqom-music-00089](https://ich.unesco.org/en/RL/shashmaqom-music-00089)
- Aga Khan Music Initiative. [the.akdn](https://the.akdn/en/how-we-work/our-agencies/aga-khan-trust-culture/aga-khan-music-programme)
- Center for Traditional Music and Dance, *Ensemble Shashmaqam Study Guide*. [ctmd.org/programs/touring-artists/shashmaqam](https://ctmd.org/programs/touring-artists/shashmaqam)
- Voices on Central Asia. "Shashmaqam: Music and Poetry of Central Asia." [voicesoncentralasia.org/shashmaqam-music-and-poetry-of-central-asia](https://voicesoncentralasia.org/shashmaqam-music-and-poetry-of-central-asia/)

### Encyclopedic / reference
- Wikipedia, "Mugham." [en.wikipedia.org/wiki/Mugham](https://en.wikipedia.org/wiki/Mugham)
- Wikipedia, "Shashmaqam." [en.wikipedia.org/wiki/Shashmaqam](https://en.wikipedia.org/wiki/Shashmaqam)
- Wikipedia, "Mugham triads." [en.wikipedia.org/wiki/Mugham_triads](https://en.wikipedia.org/wiki/Mugham_triads)
- Wikipedia, "Tar (string instrument)." [en.wikipedia.org/wiki/Tar_(string_instrument)](https://en.wikipedia.org/wiki/Tar_(string_instrument))
- Wikipedia, "Uzeyir Hajibeyov." [en.wikipedia.org/wiki/Uzeyir_Hajibeyov](https://en.wikipedia.org/wiki/Uzeyir_Hajibeyov)
- Wikipedia, "Munojot Yo'lchiyeva." [en.wikipedia.org/wiki/Munojot_Yo%CA%BBlchiyeva](https://en.wikipedia.org/wiki/Munojot_Yo%CA%BBlchiyeva)
- Wikipedia, "Aghakhan Abdullayev." [en.wikipedia.org/wiki/Aghakhan_Abdullayev](https://en.wikipedia.org/wiki/Aghakhan_Abdullayev)
- Encyclopaedia Iranica, "BUKHARA vii. Bukharan Jews." [iranicaonline.org/articles/bukhara-vii](https://www.iranicaonline.org/articles/bukhara-vii/)

### Secondary / online
- Naroditskaya, Inna. *Mugham Jazz* (Miami University Havighurst Center paper).
- Naroditskaya, Inna. *Music of Azerbaijan: From Mugham to Opera* (JSTOR).
- KuzinTheCaucasus blog, "Azerbaijan Mugham" (2014). [kuzinthecaucasus.wordpress.com](https://kuzinthecaucasus.wordpress.com/2014/01/29/azerbaijan-mugham/)
- "Importance of Mode Tetrachords in The Tonal and Modal Music Education." *Procedia — Social and Behavioral Sciences* 186 (2015): 560–565. [sciencedirect.com](https://www.sciencedirect.com/science/article/pii/S1877042815022910)
- Stephen Jones blog, "Central Asia: shashmaqom at SOAS" (2024). [stephenjones.blog/2024/03/24/shashmaqom](https://stephenjones.blog/2024/03/24/shashmaqom/)
- Voices on Central Asia / Alexander Djumaev essays.
- Golden Threads, "Shashmaqam devotional music in Central Asia: Shared heritage of Jews and Muslims." [goldenthreads.uk](https://www.goldenthreads.uk/blog/shashmaqam-music-a-shared-culture-muslims-and-jews)

### Source-honesty note

English-language scholarship on Azerbaijani mugham and Shashmaqam is **markedly thinner** than for Ottoman/Turkish or Arabic maqam traditions. Most rigorous primary work is in Russian (Karomatov, Soviet-era Baku conservatory output), Azerbaijani, Uzbek, Tajik, and French (During). Where this document makes specific cents-level claims, those derive from During's published measurements on Mansurov; broader Shashmaqam intonation claims should be treated as *directional*, not authoritative, until cross-validated against recordings or direct measurement. This is a known gap and a real research debt for the project.
