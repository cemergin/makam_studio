---
title: "Greek, Byzantine, and Balkan Modal Traditions: Octoechos, Dromoi, and Ottoman-Heritage Modality across the Eastern Mediterranean"
audience: "musicologists, makam_studio implementers, Byzantine-chant developers, Balkan-music UX designers"
tldr: >
  Three connected but theoretically distinct modal worlds sit along the same
  Ottoman-Byzantine fault line: (1) the eight-mode oktōēchos of Greek Orthodox
  chant — codified by the Three Teachers (Chrysanthos of Madytos, Gregorios
  Protopsaltes, Chourmouzios Khartophylax) in 1814 and re-tuned by the
  Patriarchal Music Committee of 1881–83 into a 72-moria (72-EDO-ish) octave
  with diatonic, soft-chromatic, hard-chromatic, and enharmonic genera;
  (2) the post-1922 Greek dromoi system, an equal-tempered, bouzouki-mediated
  refraction of Ottoman makam transmitted by Asia-Minor refugees through
  Smyrnéika and Rebetiko; (3) the Balkan modal-rhythmic complex (Bulgarian,
  Macedonian, Albanian, Serbian, and Roma) where Ottoman makam, asymmetric
  meters, and iso-polyphony coexist. The shared-name / shared-skeleton problem
  recurs: Byzantine "Plagal of 2" ≈ Greek dromos Hijaz ≈ Maqam Hijaz, but each
  uses a different microtonal grid and a different cadence vocabulary.
skip_if: "you only care about Mashriqi maqam at 24-EDO"
date: 2026-04-30
status: draft
---

# TL;DR

- **Byzantine octoechos** is the only adjacent tradition with a documented early-modern theoretical reform comparable to AEU and Bhatkhande: the **Three Teachers' New Method (1814)** and the Patriarchal Committee's **72-moria** octave (1881–83). Diatonic, soft chromatic, hard chromatic, and enharmonic genera give a four-genus model that is more rigorous than anything in Mashriqi maqam.
- **Greek dromoi** (sing. *dromos* = "road") are explicitly Ottoman makam re-fitted to the **equal-tempered fretted bouzouki** of post-1922 Athens/Piraeus. Pre-1950 Smyrnéika recordings preserve microtonal practice; post-Tsitsanis bouzouki rebetiko is essentially **12-EDO + characteristic intervals**.
- **Balkan rural music** binds modality to **asymmetric meter**: ruchenitsa 7/8 (2+2+3), kopanitsa 11/8 (2+2+3+2+2), daichovo 9/16, and others. This is the natural cross-product zone with BeatForge's pattern engine.
- The **Ottoman-Greek-Slavic-Roma makam network** is one network, not several. Same modes pass through every tradition with different microtonal precision and different cadence inflections. **Roma musicians are the principal transmission vector**; nationalist musicologies (Greek, Bulgarian, Turkish, Macedonian) routinely erase this.
- **Implication for makam_studio:** Byzantine modes can be a Phase-2/3 tradition tag with their own moria-grid tuning; Greek dromoi can be a "12-EDO + Smyrnéika preset" tier sitting on top of the Turkish/Arabic v1; Balkan music is best modeled as the rhythmic-modal cross-product with BeatForge.

---

## A. Byzantine octoechos (Greek Orthodox church chant)

### A.1 The eight echoi: lineage and structure

The Byzantine *oktōēchos* is the eight-mode system used to organise the chant
of Eastern Orthodox liturgy. Its earliest theoretical witness is the
ninth-century treatise *Hagiopolites* — surviving in a fourteenth-century copy,
nominally ascribed to John of Damascus but probably written about a century
after his death (Wellesz 1961, 67–69). The Hagiopolites already presents the
eight echoi as four *kýrioi* (authentic) and four *plágioi* (plagal),
explicitly all in the diatonic genus.

The modern (post-1814) classification is best summarised in tabular form. We
follow the Greek note-names of the Chrysanthine *parallage* (πα, βου, γα, δι,
κε, ζω, νη — corresponding roughly to Western D, E, F, G, A, B, C) (Wikipedia,
"Echos"; OrthodoxWiki, "Byzantine Chant").

| # | Name | Greek | Genus (modern) | Finalis | Ison (default) | Ambitus | Western analogue |
|---|---|---|---|---|---|---|---|
| 1 | First Authentic | *Echos prōtos* | Diatonic | πα (D) | πα (D) | C–a | D Dorian-like |
| 2 | Second Authentic | *Echos déuteros* | Soft chromatic | δι (G) (mesos) / βου (E) | δι (G) | F–c | Hüseyni-related |
| 3 | Third Authentic | *Echos trítos* | Enharmonic | γα (F) | γα (F) | F–f | Ottoman *çârgâh*-like |
| 4 | Fourth Authentic | *Echos tétartos* | Diatonic | νη (C) (legetos) / δι (G) | δι (G) | G–d | mixolydian-like |
| 5 | Plagal of First | *Plágios prōtou* | Diatonic | πα (D) | πα (D) | A–a (lower fifth) | D minor-like |
| 6 | Plagal of Second | *Plágios déuterou* | Hard chromatic | πα (D) (modern) | πα (D) | A–a | **Hijaz / double-harmonic** |
| 7 | Grave / Plagal of Third | *Echos varys* | Enharmonic / diatonic | γα (F) or ζω (B♮) | γα or ζω | F–f or G–g | F-tonic enharmonic |
| 8 | Plagal of Fourth | *Plágios tetártou* | Diatonic | νη (C) | νη (C) | G–g | C major-like |

(See OrthodoxWiki, "Byzantine Chant"; St Anthony's Greek Orthodox Monastery,
"Byzantine vs Western Notation"; Wikipedia, "Neobyzantine Octoechos.")

**Ison practice**: The *isokrátima* is a sustained drone sung beneath the
melody by the *isokrátes*. The default ison sits on the modal final, but it
**moves** as the melody moves into a different tetrachord; it is the harmonic
gravity of the mode, not a fixed pedal (Wikipedia, "Ison [music]"; Lingas
2003). Each mode has a default ison plus a small set of alternate isons used
for extended modulation. This makes the ison closer to a Hindustani
*sā/pa* drone than to Western tonic-only drone — but it is *moveable*, and
that mobility is fundamental to Byzantine practice.

### A.2 The three (or four) genera

Byzantine theory inherits Ptolemy's three classical *gene* — diatonic,
chromatic, enharmonic — but the modern (post-1881) system splits the
chromatic into two:

- **Diatonic** (DI): the foundational genus. The "soft diatonic" tetrachord is
  10–8–12 moria (≈189–151–226 ¢) ascending; the major tone has 12 moria, the
  minor tone 10, the minimum tone 8 (Chrysanthos 1832; PMC 1881; Panagiotopoulos
  1947 cited in Skoulios 2011; Mavroeidis 1999).
- **Soft chromatic** (CM, *chrōmatikon malakón*): characteristic of Echos
  Devteros. Tetrachord ≈ 8–14–8 moria (≈151–264–151 ¢) — a small step,
  stretched neutral second, small step. This is the genus whose middle
  interval falls between Western minor and major second — heard as a
  Hüseynî-like inflection.
- **Hard chromatic** (CS, *chrōmatikon sklirón*): characteristic of Plagal of
  Second. Tetrachord ≈ 6–20–4 moria (≈113–377–75 ¢) — a small semitone, an
  augmented second, a very small leading-tone semitone. This is essentially
  **Maqam Hijaz** as it sits in Byzantine ears (St Anthony's Monastery,
  "Plagal Second"; Skoulios 2011).
- **Enharmonic** (EN): Echos Tritos and Varys. Tetrachord ≈ 12–12–6 moria
  (≈226–226–113 ¢) — two whole tones and a small semitone, akin to
  *Lydian-like* Western intervals but with a sharper (12-comma) major third.

The Acoustical Society of America paper by Panteli, Purwins, and Bozkurt (or
similar; published in JASA EL 124[4], 2008) measured 520 scales from 13
practising chanters and confirmed that **deviation from theoretical PMC values
is large** — up to ±40 ¢ on individual intervals (Stamou et al., 2008). This
is the Byzantine equivalent of the Karaosmanoğlu–Bozkurt result that
performance and AEU theory diverge measurably; the same fact-pattern, the same
implication for synthesizer design.

### A.3 The 72-moria pitch division

The octave is divided into **72 equal *moria*** (sometimes called *cents* in
older anglophone musicology, but distinct from Ellis cents). 1 moria ≈ 16.67
cents. This division was set by the **Patriarchal Music Committee of 1881–83**
in Constantinople, a committee chaired by the Patriarchate to standardise
intervals for school instruction, replacing Chrysanthos's earlier **68-step**
division (Chrysanthos 1832 used a non-equal division based on 12-9-7 for the
"diatonic" genus tones; the PMC reform regularised 12-10-8) (Skoulios 2011;
Mavroeidis 1999; Stamou et al. 2008).

The 72-moria grid has a useful property: it embeds 12-EDO (every 6 moria) and
gives a ~16.67-cent quantum that is **close to but not identical with the
Holdrian comma** of AEU (22.64 ¢). Byzantine musicians moving into Ottoman
makam practice (the same musicians often did both) had to mentally shift
between two different microtonal grids — a fact that informs why the
Chrysanthine system is sometimes accused of being "secretly Ottoman" by
purist Byzantinists and "secretly Greek" by Turkish theorists. Tomotypes built
on 72-EDO can render Byzantine practice cleanly; AEU 53-EDO cannot, and vice
versa.

### A.4 The Three Teachers' Reform (1814)

The 1814 reform replaced the older Papadic / Koukouzeles notation — a system
that had become so dense that "ten years of study" was needed for what could
now be taught in **ten months** (OrthodoxWiki, "Chrysanthos of Madytos") —
with the **New Method** (*Néa Méthodos*), a stenographic system using
analytical neumes that explicitly indicate intervallic motion rather than
melodic *theseis*.

The three teachers were:

- **Chrysanthos of Madytos** (c. 1770–1846), Archbishop of Dyrrhachium,
  Patriarchal Music Teacher, theoretician;
- **Gregorios Protopsaltes** (c. 1778–1821), the head cantor of the
  Patriarchate, the practical-musical anchor;
- **Chourmouzios Khartophylax** (d. 1840), the archivist who undertook the
  vast labour of transcribing the older repertoire into the new system
  (OrthodoxWiki, "Chrysanthos"; Terzopoulos 2012).

In 1814 the Holy Synod under Patriarch Cyril VI authorised Chrysanthos to
teach according to the new system. The Third Patriarchal School of Music
(1815) was the institutional vehicle. Chrysanthos's *Eisagōgē eis to
theoretikon kai praktikon tēs ekklesiastikēs mousikēs* (1821) and the longer
*Theōrētikon Mega tēs Mousikēs* (Trieste, 1832) are the canonical
expositions; a critical English translation of Chourmouzios's revision of
Chrysanthos's *Eisagoge* was published by Konstantinos Terzopoulos in 2012.

This reform is the genuine equivalent of **Arel-Ezgi-Uzdilek** (1930s
Constantinople) and **V. N. Bhatkhande** (1909–1932 Bombay) — each a
turn-of-the-modern-era codification that simplified, regularised, and
notated an oral practice into a teachable system, and each is now both
indispensable and contested.

### A.5 Key scholarly voices (Byzantine)

- **Egon Wellesz** (1885–1974), *A History of Byzantine Music and
  Hymnography* (Oxford: Clarendon, 1949; 2nd ed. 1961). The foundational
  anglophone study; sets the field's terminology for *theseis*, modulation,
  and the medieval echoi (Wellesz 1961).
- **Diane Touliatos-Banker / Touliatos-Miles** (Univ. of Missouri-St Louis):
  "The Byzantine Amomos Chant of the Fourteenth and Fifteenth Centuries,"
  *Acta Musicologica* 56 (1984); "The Traditions of Women's Music in Greco-Roman
  and Early Christian Times" (1990s).
- **Christian Troelsgård** and the *Monumenta Musicae Byzantinae* (Copenhagen)
  — the source-critical edition project for Byzantine chant manuscripts.
- **Markos Ph. Dragoumis** (1934–2018), founder of the Music Folklore Archive
  at the Centre for Asia Minor Studies; wrote on the *survival of Byzantine
  chant in modern Greek monophony* and the Greek-Ottoman-Byzantine triangle
  (ASCSA, "Markos Dragoumis Papers").
- **Grigorios Stathis** (b. 1939, Athens), the modern centre of Byzantine
  musicology; founder of the Institute of Byzantine Musicology; major work on
  the *kalophonic* and *papadic* repertoires.
- **Lycourgos Angelopoulos** (1941–2014) and the Greek Byzantine Choir —
  performance-practice anchor for the modern revival movement.
- **Markos Skoulios** (Ionian University), bridges Byzantine theory and
  Near-Eastern musicology (Skoulios 2011).
- **Alexander Lingas** (Cappella Romana, City University of London),
  performance practice and politics of transcription (Lingas 2003).

### A.6 Representative chant motifs (a starting set)

For each mode a single short formulaic motif (an *enechema*, the
"intonation formula" sung at the start of each chant in that mode) provides
the motivic skeleton:

- *Echos prōtos*: A G A B♭ A — D ascending fifth then a return, characteristic
  closing on D.
- *Echos déuteros* (modern soft chromatic): G A♭+ B♭+ — the stretched neutral
  second over G that gives Devteros its plaintive character.
- *Echos trítos*: F G A B (high B) — bright, "arrogant" in Sanidopoulos's
  ethos vocabulary.
- *Echos tétartos*: legetos cadence on C, but the kyrios pentachord runs
  G–C–G with an Eastern Lydian inflection.
- *Plágios prōtou*: D F G A — the workhorse Resurrection mode; the
  *anastasimaton* is largely written here.
- *Plágios déuterou* (hard chromatic): D E♭ F♯ G A B♭ C♯ D — the **double
  harmonic** scale, Byzantine Hijaz, used for funeral and Holy Week chant.
- *Varys*: F G A B♮ — sometimes written tetraphonic with F as ison; the
  mode of "manliness and strength."
- *Plágios tetártou*: C D E F G A B C — the closest Byzantine echos to a
  Western major scale; used for the Christmas troparion *"E Parthenos
  semeron"* (Sanidopoulos 2019).

These can be exposed in makam_studio as **mode-card enechema previews** —
short audio playbacks that establish the modal idiom in 4–6 seconds, exactly
the way classical Indian music apps preview *aroha-avaroha*.

---

## B. Modern Greek dromoi (rebetiko, smyrnéika)

### B.1 Origins: 1922 and the Asia-Minor refugees

The modern *rebétiko* (sing.) / *rebétika* (pl.) tradition is conventionally
dated from the **1922 Asia-Minor catastrophe**, when the Greco-Turkish
population exchange brought roughly 1.2 million Anatolian Greeks (including
the entire population of Smyrna/İzmir) to mainland Greece (Pennanen 1999;
Holst-Warhaft 1975). They brought with them a hybrid Ottoman-Greek
café-aman tradition centred on *amanédes* (modal vocal improvisations
beginning with the cry "*aman aman*"), led by virtuosi like
**Roza Eskenazi** (b. Constantinople, c. 1890–1980), **Rita Abadzí** (b.
Smyrna 1914), and **Marika Papagika** (the major recording artist of the
New York Greek diaspora).

This **Smyrnéika** style — santouri, violin or oud, kanun, and voice —
preserved the microtonal makam practice of late-Ottoman urban music nearly
intact through the 1920s, and is captured on hundreds of 78 rpm sides from
Athens (Odeon, Columbia, His Master's Voice, Parlophon) and from the U.S.
Greek diaspora labels.

The post-1923 Piraeus (Athenian port) tradition layered over Smyrnéika a
*manges*-subculture sound centred on the **bouzouki** and *baglamás*. Its
canonical figures are **Markos Vamvakaris** (1905–1972), the "patriarch of
rebetiko," and **Vasilis Tsitsánis** (1915–1984), who codified the
3-course bouzouki and pushed rebetiko towards Western harmonisation.

### B.2 What is a dromos?

A *dromos* (lit. "road, way") is a melodic mode plus a small package of
characteristic phrases and cadences. The **rebetiko player** speaks of
"playing in the road of Hijaz" much as a Turkish saz player speaks of
"playing makam Hicaz" (Pennanen 1999; Ordoulidis 2011; Doctor-Dark
"Roads"). The crucial difference is that the bouzouki is **fretted in 12-EDO**
(27 frets giving a chromatic scale across the neck), so the dromos is the
Ottoman makam **collapsed onto a 12-EDO grid**, with microtonal nuance
re-introduced (when at all) through ornamentation — slides, vibrato, and
fingertip pressure on a free fret.

### B.3 The standard dromoi catalogue

A reasonable v1 catalogue of dromoi, with their bouzouki-tradition scale
forms (root C for clarity) and their Ottoman/Mashriqi origins:

| Dromos | Scale (12-EDO from C) | Ottoman parent | Character |
|---|---|---|---|
| **Rast** | C D E♭+ F G A B♭+ C (asc.) / C B♭ A G F E♭ D C (desc.) | Maqam Rast | bright, "major-ish" with neutral 3rd flattened to ♭3 in 12-EDO bouzouki |
| **Houseini** | C D E♭ F G A♭ B♭ C | Maqam Hüseynî | minor-pentatonic-extended, the workhorse |
| **Houzam** | C D♯ E F G A B♭ C (or built on E with C as ison) | Maqam Huzam | "Sigāh family" with raised-third inflection |
| **Pireotikos** (Piraeus mode) | C D♭ E F G A♭ B C | Bayati / Karcığar variant | the "Piraeus" voice; related to Bayati-Hijaz |
| **Hijaz** | C D♭ E F G A♭ B C | Maqam Hicaz / Hijaz | augmented-2nd between ♭2 and 3 |
| **Hijazkar** | C D♭ E F G A♭ B C — symmetric: D♭ E F G A♭ B♭ B | Maqam Hicazkâr / Shahnaz | double-harmonic, two augmented seconds |
| **Sabah** | C D E♭ F♭ G A♭ B♭ C (or built around the descending Saba tetrachord) | Maqam Saba | the "lament mode," characteristic flat-4 |
| **Niavent** | C D E♭ F♯ G A♭ B C | Maqam Nikriz / Nihavend hybrid | minor with raised 4th |
| **Kiourdi** | C D E♭ F G A♭ B♭ C | Maqam Kürdi | natural minor with ♭2 in the upper tetrachord cadence |
| **Tabachaniotikos** | C D E♭ F G♭ A♭ B C | Iraqi / Hicazeyn | Cretan / Iraqi-coloured Hijaz family |
| **Karsigar** | C D E♭ F♯ G A♭ B♭ C | Maqam Karcığar | Hicaz-on-the-fourth, Hüseyni below |
| **Pirgí / Bayati-related** | C D E♭+ F G A♭ B♭ C | Maqam Bayati | Bayati-coloured minor |

(Catalogue compiled from Pennanen 1999; Ordoulidis 2011; Doctor-Dark
"Roads"; Aydin 2008.)

The interaction between any given dromos and the **harmonic** vocabulary of
the rebetiko trio (bouzouki, baglamás, guitar / kithara) creates what Spiros
Delegos (2024) calls a *modal heterotopia*: a coexistence of two musical
ontologies — Ottoman makam modality and Western chordal harmony — neither of
which fully metabolises the other. Pennanen (1999, 2004) calls the same
phenomenon "westernisation and modernisation"; Ordoulidis (2011, 2017)
analyses it through Tsitsánis's recordings.

### B.4 The 12-EDO drift

A central historical fact: **pre-1950 recordings preserve more microtonal
practice than post-1950 ones**. The Smyrnéika 78s of Eskenazi, Abadzí, and
Marika Papagika carry intervals that the trichordo and (later) tetrachordo
bouzouki do not. The 1950s post-Tsitsánis bouzouki sound — amplified, set in
choro of Western harmony, sliding into laïkó — is essentially **Ottoman
makam at 12-EDO**, with the microtonal residue surviving only in vocal
ornamentation and clarinet (klarino).

This is exactly the kind of historical layering makam_studio's tuning
infrastructure should expose: a "Smyrnéika historical" preset (Ottoman
microtonal grid, kanun-scale tuning) versus a "Rebetiko Piraeus" preset
(12-EDO, dromos catalogue, bouzouki idiomatic phrasing). Same dromos names,
two different tuning grids.

### B.5 Key scholars (Greek dromoi)

- **Risto Pekka Pennanen** (Tampere): *Westernisation and Modernisation in
  Greek Popular Music* (PhD diss., Univ. of Tampere, 1999); "The
  Nationalization of Ottoman Popular Music in Greece," *Ethnomusicology* 48,
  no. 1 (2004): 1–25; further work on Balkan urban genres.
- **Nikos Ordoulidis** (Univ. of Leeds → Univ. of Ioannina): "The Greek
  Popular Modes" (BPM Network, 2011); *Musical Nationalism, Despotism and
  Scholarly Interventions in Greek Popular Music* (2021).
- **Gail Holst-Warhaft** (Cornell): *Road to Rembetika* (Athens: Anglo-Hellenic,
  1975; rev. ed. Limni: Denise Harvey, 2014). The first English-language
  monograph.
- **Stathis Gauntlett** (Melbourne), *Rebetika Carmina Graeciae Recentioris*
  (1985), the first systematic philological treatment.
- **Dafni Tragaki**, *Rebetiko Worlds: Ethnomusicology and Ethnography in the
  City* (2007).
- **Spiros Delegos**, "A Modal Heterotopia: Rethinking Makam Modality and
  Chordal Harmony in Interwar Rebetiko," *Yearbook for Traditional Music* 56,
  no. 1 (2024): 81–104.

---

## C. Balkan modal traditions

The Balkans north of Greece form a single modal-rhythmic continuum
articulated through Ottoman makam, Byzantine echos, Slavic vernacular song,
Albanian iso-polyphony, and the omnipresent transmission of Roma musicians
who play professionally in every tradition.

### C.1 Bulgaria

**Modal practice.** Bulgarian rural music carries a strong Ottoman-makam
inheritance, especially in the *čalgija* urban-instrumental tradition of the
nineteenth-century Bulgarian and Macedonian towns (Plovdiv, Ruse, Sofia,
Skopje, Bitola). Rural village song is generally diatonic but uses
characteristic neutral-third inflections in the *Pirin* and *Thracian*
regions that share more with Greek dromoi than with central Bulgarian song
(Rice 1994; Buchanan 2006).

**Asymmetric meters (*aksak* / *nepravilnaya*).** The defining Bulgarian
musical feature for any synthesizer / drum-machine integration:

| Meter | Standard grouping | Dance |
|---|---|---|
| 5/16 | 2+3 | Paidushko |
| 7/8 | 2+2+3 | Ruchenitsa |
| 7/8 | 3+2+2 | Chetvorno |
| 8/8 | 3+2+3 | not always named |
| 9/8 | 2+2+2+3 | Daichovo |
| 9/16 | 2+2+2+3 | Daichovo (faster) |
| 11/8 | 2+2+3+2+2 | Kopanitsa |
| 13/16 | 2+2+2+2+2+3 | Krivo Sadovsko / Pazardzhishko |
| 15/16 | 2+2+2+3+2+2+2 | Buchimish |
| 25/16 | (4+3)+(2+2)+(3+2+2)+(2+2+3) | Sedi Donka |

(See Bernacki, "Meter in Bulgarian Folk Music"; Singer 1974; Rice 1994.)

The **long-vs-short-beat** principle is universal: a long beat = 3
subdivisions, a short beat = 2 subdivisions; the meter is identified by the
ordering of L's and S's (L = trójka, S = dvójka). Dancers step on each
**beat group**, not each subdivision — so the perceptual unit is the beat
group, and the meter name encodes its sequence (Bernacki).

**Chalga / pop-folk.** From the 1990s, *chalga* (popfolk) commercialised the
Romani-Turkish-Bulgarian synthesis that *narodna muzika* (state-sponsored
"authentic" folk) had repressed. Buchanan (2006, *Performing Democracy*)
treats chalga as a re-emergence of the Ottoman Balkan urban legacy. The
prohibition of *kyuchek* (Romani-derived 9/8 belly-dance rhythm) under
socialism became the very thing that defined post-1989 popular music.

**Key scholars (Bulgaria).** Timothy Rice, *May It Fill Your Soul:
Experiencing Bulgarian Music* (Chicago: Univ. of Chicago Press, 1994); Donna
Buchanan, *Performing Democracy* (Univ. of Chicago Press, 2006); Lozanka
Peycheva (Sofia, on Roma musicians); Vergilij Atanassov (Sofia, on
instruments).

### C.2 Macedonia (North Macedonia, Greek Macedonia, Pirin Macedonia)

The Vardar (Yugoslav/North-Macedonian) and Pirin (Bulgarian) and Aegean
(Greek) Macedonian traditions are musically a single complex divided by
twentieth-century borders. Vocal music includes the **dolga / pesna /
"long song"** — slow, ornamented, often modal-makam — which sits closer to
Ottoman *uzun hava* and Greek *amanés* than to Western European folk song.
The urban *čalgija* ensemble (clarinet, violin, kanun or accordion, tarabuka,
tambura) plays modal music in 7/8, 9/8, 11/8, 12/8 (Music of North
Macedonia, Wikipedia; Rice & Porter 2000, *Garland*, vol. 8).

The *Phrygian-dominant* (≈ Hijaz / Hicaz) is the most-cited "Macedonian"
mode in casual sources; in practice the Macedonian instrumentalist plays the
full Ottoman makam family, with regional preference for *Hicaz*, *Karcığar*,
*Niavent*, and *Hüseynî*.

### C.3 Albania

The signal Albanian tradition is **iso-polyphony**, inscribed on UNESCO's
Representative List of the Intangible Cultural Heritage of Humanity in 2008
(originally Masterpiece, 2005). Two regional styles, both south Albanian:

- **Tosk** iso-polyphony: continuous drone (the *iso*) on the syllable "e,"
  sung with staggered breathing, beneath a melody (*marrës*) and a
  countermelody (*kthyes*). Sometimes a fourth voice (*hedhës*) is added.
- **Lab** iso-polyphony: the iso is intermittent and rhythmic, sung to the
  song's text rather than a vowel. More percussive overall.

Northern (Gheg) Albanian song is largely monophonic and epic-heroic
(*këngë kreshnike*), accompanied by the bowed *lahuta* — closer to Slavic
*gusle* practice (UNESCO 2008; Wikipedia, "Albanian iso-polyphony"; Trærup
1998).

Modally, Albanian song mostly sits in **diatonic minor / aeolian / phrygian**
with occasional Hijaz-coloured Tosk *kaba* lament. The tradition is more
pivotal for makam_studio as a **drone-modal** anchor — the Tosk continuous
iso is the closest western-Mediterranean analogue to a tanpura — than as a
new mode source.

**Key scholars (Albania).** Birthe Trærup, "Albanian Singers in
Yugoslav Macedonia: A Study in Vocal Repertoires" (1972); Beniamin Kruta
(Tirana); Spiro Shituni; Eno Koço (Leeds).

### C.4 Serbia and the western Balkans

Serbian and Bosnian modal traditions split between:

- **Rural diatonic** song (especially the *bele pesme* and Bosnian *ganga*
  yodel-style polyphony, both narrow-interval modal),
- **Urban *kafana*** song (Serbian, Vojvodinian, Bosnian-Sevdalinka), which
  carries the Ottoman makam inheritance through *sevdah* and the
  accordion / clarinet / *tamburica* ensemble (Forry 1986; Petrović 1968).

The Serbian *frula* (shepherd's flute) tradition, the *gusle* epic-singing
tradition, and the urban *kafana* song are three separate worlds inside one
border. Sevdalinka in particular is essentially makam-modal Bosnian urban
song with strong Ottoman-Turkish lineage, often in slow 4/4 or aksak.

### C.5 Roma transmission

Across the entire Balkans, **Roma musicians have been the principal
professional carriers of Ottoman-makam practice since the seventeenth
century at least** (Silverman 2012; Pettan 2002). The Romani Routes thesis
(Silverman 2012, *Romani Routes*, OUP, winner of the SEM Merriam Prize 2013)
is that the music we now label "Bulgarian," "Macedonian," "Serbian,"
"Albanian," and "Greek" — especially in their urban / wedding / brass
expressions — is in large part a Roma-mediated continuation of an
Ottoman-Balkan musical economy.

This is the single most important fact for cultural-sensitivity copy in
makam_studio. **The credits / about page should explicitly acknowledge Roma
musicians as a primary transmission vector**, naming a few canonical
figures: **Esma Redžepova** (Macedonia, "Queen of the Gypsies"), **Saban
Bajramović** (Serbia), **Ivo Papazov** (Bulgaria, "King of the Wedding
Music"), the **Kočani Orkestar** (Macedonia), **Goran Bregović**'s Roma
collaborators. Nationalist musicologies — Greek, Bulgarian, Macedonian,
Turkish — routinely erase Roma agency in their respective traditions.

---

## D. Cross-tradition mapping: the shared-name / shared-skeleton problem

A single mode can appear simultaneously in Byzantine chant, Greek dromos,
Bulgarian rural music, and Mashriqi maqam — with the same nominal name and a
recognisably common skeleton, but different microtonal precision and
different idiomatic cadences. The case studies:

### D.1 Hijaz family

| Tradition | Name | Tuning grid | Characteristic |
|---|---|---|---|
| Byzantine | *Plágios déuterou* (hard chromatic) | 72-moria | Sharp 3rd (~ +20m above 12-EDO E), sharp leading-tone (~ +20m above B) |
| Greek dromos | *Hijaz* | 12-EDO bouzouki | Phrygian dominant on D |
| Ottoman | *Hicaz* / *Hümâyûn* / *Uzzal* | AEU 53-EDO | Family of three Hijaz makams differentiated by upper tetrachord |
| Mashriqi | *Hijaz* | 24-EDO | Two augmented seconds optional (Hijaz vs Hijaz Kar) |
| Bulgarian | (no canonical name) | usually 12-EDO | "Hijaz horo" — Hijaz tetrachord over an asymmetric meter |

Same *skeleton* (D E♭ F♯ G); four different intonations of E♭ and F♯
(72-moria Byzantine vs 53-comma AEU vs 24-EDO Mashriqi vs 12-EDO Greek);
four different cadence vocabularies.

### D.2 The "second authentic" / Bayati / Hüseynî family

| Tradition | Name | Tuning grid | Characteristic |
|---|---|---|---|
| Byzantine | *Echos déuteros* (modern soft chromatic) | 72-moria | Stretched neutral 2nd (~14 moria, ≈ 233 ¢) on degree 2 |
| Greek dromos | *Pireotikos* (sometimes) / *Houseini* | 12-EDO | Houseini = Hüseynî collapsed to A minor pentachord |
| Ottoman | *Hüseynî* / *Uşşâk* / *Bayatî* | AEU | Segâh perde at ~2 commas above E♭ |
| Mashriqi | *Bayati* | 24-EDO | Half-flat 2nd at ~150 ¢ |

The "neutral second" is the diagnostic interval — and it is realised
differently in each grid. A maqam-studio that wants to be honest about this
must **expose the diagnostic interval as a per-mode tunable**.

### D.3 Saba family

| Tradition | Name | Realisation |
|---|---|---|
| Byzantine | (no exact equivalent; Plagal of 4 with phthora) | rare |
| Greek dromos | *Sabah* | bouzouki: D E♭ F G♭ G A♭ B C — characteristic flat-4 |
| Ottoman | *Saba* | AEU: low Hicaz tetrachord on D, with diminished 4th |
| Mashriqi | *Saba* | 24-EDO: half-flat 2nd, flat 4 (D E♭+ F G♭ A B♭ C) |

Saba is the case where **Greek and Ottoman versions disagree about whether
the 2nd is half-flat or fully flat**. Pre-1950 Smyrnéika recordings keep the
half-flat 2nd; post-1950 bouzouki rebetiko collapses it to a half step
(Pennanen 1999; Delegos 2024).

### D.4 The *Çârgâh* / Plagal-of-4 / "C-major" family

This is the only mode where Byzantine chant approximately coincides with
Western major: Plágios tetártou is essentially C major, and the resemblance
became politically convenient under Chrysanthos (it gave Byzantine notation
a face that could be exported to Western pedagogy). But the "diatonic" of
PMC 1881 is **12-10-8 moria** (≈189-151-226 ¢), not 200-200-100 ¢, so the
identity is approximate, not exact. This recurs in Turkish *Çârgâh* (which
AEU treats as the "natural" makam, the C-major analogue) and in Mashriqi
*Maqam ʿAjam* (closest to Western major).

### D.5 Implications of the cross-tradition map

1. **One mode-skeleton, many tuning grids.** A mode-card UI must support a
   "tradition" toggle that re-tunes the same mode skeleton to the active
   tuning grid (72-moria Byzantine, 53-EDO/24-perde AEU, 24-EDO Mashriqi,
   12-EDO Greek-bouzouki).
2. **The diagnostic interval is the variable.** Most modes have one interval
   that *is* the mode — the Saba 4th, the Hüseynî 2nd, the Hijaz 3rd. That
   interval should be the per-mode tunable.
3. **Cadence vocabularies are not interchangeable.** A Byzantine *enechema*,
   a rebetiko *taxim* opening, and a maqam *sayr* phrase live in different
   musical grammars even when on the same skeleton. They must be presented
   as tradition-specific motifs, not interchangeable scale-decoration.

---

## E. Key scholarly grounding

### Journals

- *Ethnomusicology* (SEM journal) — Pennanen 2004 is the canonical
  rebetiko-makam article here; substantial Bulgarian, Romanian, and Greek
  coverage.
- *Yearbook for Traditional Music* (formerly *Yearbook of the IFMC*,
  Cambridge) — Delegos 2024 on rebetiko's modal heterotopia; Rice's review
  of his own *May It Fill Your Soul*.
- *Plainsong & Medieval Music* (Cambridge) — Byzantine source studies.
- *Journal of the International Society for Orthodox Church Music*
  (Joensuu) — Skoulios, Lingas, Stathis appear here.
- *Acta Musicologica* (IMS) — Touliatos-Banker on Byzantine Amomos.
- *Music Theory Online* — recent computational work on Byzantine intervals.
- *Asian Music* — for the Ottoman-Asia Minor angle.
- *Yearbook of Balkan and Baltic Studies*; *Series Musicologica Balcanica*
  (Thessaloniki) — Delegos 2017; Pennanen 2010.

### Reference works

- Wellesz, *A History of Byzantine Music and Hymnography* (1949/1961).
- Rice and Porter, *Garland Encyclopedia of World Music*, vol. 8: *Europe*
  (2000).
- Grove Music Online: "Byzantine music" (Conomos, Lingas); "Greece §III:
  Modern" (Holst-Warhaft); "Bulgaria" (Rice); "Albania" (Sugarman); "Romani
  music" (Silverman).
- Touma, *The Music of the Arabs* (1996, 2003) — for the Mashriqi anchor.

### Performers / archives

- The Centre for Asia Minor Studies (Athens), Music Folklore Archive (Markos
  Dragoumis founder).
- The Greek Byzantine Choir, Lycourgos Angelopoulos.
- Cappella Romana (Lingas).
- Bulgarian National Folk Ensemble; Mystery of the Bulgarian Voices.
- Ivo Papazov & Trakija Orkestrasi.
- Kočani Orkestar, Esma Redžepova archive.

---

## Implications for makam_studio

1. **Byzantine mode bank as Phase-2/3 tag.** The eight echoi should ship as
   a self-contained tradition tag, not interleaved into the maqam catalogue.
   They have their own tuning grid (72-moria), their own genus system
   (diatonic / soft chromatic / hard chromatic / enharmonic), their own
   notation (Greek neumes + Western staff approximation), and their own
   ethos vocabulary. Byzantine cantors are a real audience: they often double
   as Ottoman-makam musicians.
2. **A 72-moria tuning grid is required.** Not just a pretty
   "approximation"; the Byzantine tradition has actual moria values,
   measured by acoustic studies of practising chanters (Stamou et al. 2008).
   This grid sits alongside 53-EDO (Turkish AEU), 24-EDO (Mashriqi), and
   12-EDO (Greek bouzouki) as a first-class option in the unified tuning
   schema (cf. `tuning-systems-formalization.md`).
3. **Greek dromoi as a 12-EDO simplified tier.** The bouzouki-tradition
   dromoi belong on the same screen as Turkish/Arabic makams but at a
   different tier: "12-EDO + characteristic intervals." This matches the
   product framing of "warm light, friendly, accessible" — dromoi are the
   easiest entry into the Eastern modal world for a Western-trained ear,
   exactly because they are already 12-EDO.
4. **A Smyrnéika historical preset.** Toggling a "Smyrnéika 1925" preset
   should re-tune dromoi back from 12-EDO to the underlying Ottoman-makam
   microtonal grid. This is a single-checkbox, high-value preservation
   feature: it lets users hear the same dromos as Roza Eskenazi recorded
   it versus as Tsitsánis recorded it.
5. **Asymmetric meters as the BeatForge cross-product.** Bulgarian
   ruchenitsa, kopanitsa, daichovo, buchimish, and the Ottoman-derived
   *kuçek* / *köçek* are exactly what BeatForge's beat-grouping engine
   already handles ("9/8 as 2+2+2+3 with colored dots"). The natural
   product collaboration is **a rebetiko / chalga / asymmetric-mode jam
   page** combining BeatForge's pattern library with makam_studio's mode
   library.
6. **Roma credit acknowledgement.** The about/credits page must
   explicitly acknowledge Roma musicians as a primary transmission vector
   for the modal practices the project encodes. Naming Esma Redžepova,
   Ivo Papazov, Saban Bajramović, and the Kočani Orkestar is good faith;
   citing Silverman (2012) is the scholarly anchor.
7. **Albanian iso as a drone-mode test bed.** The Tosk continuous-iso
   tradition is the closest Mediterranean analogue to a tanpura. It is
   therefore a useful *unit test* for the drone subsystem: if the engine
   can render a clean Tosk iso under a Lab *kaba* lament, it can render a
   Hindustani sā/pa drone under a khayāl.
8. **Cadence motif library.** Each mode-card should carry 3–6
   short *enechema* / dromoi-opening / sayr-opening motifs as audio
   previews. These are the user-facing equivalent of "preview a font":
   four seconds of the modal idiom, sung or played in the canonical voice
   of that tradition.
9. **The shared-name / shared-skeleton UI problem.** When the user
   selects "Hijaz" the system should show the three (or four) traditions
   that share that name, with a one-tap toggle between them. This is the
   single highest-value UX pattern this entire wave of research has
   surfaced.

---

## Open questions

- **Which Byzantine tuning grid to ship in v1?** Chrysanthos's pre-1881
  68-step (12-9-7 diatonic) is the historical original, but the 1881 PMC
  72-moria (12-10-8) is the modern standard. Probably both should be
  presets; the PMC 1881 should be default.
- **How to handle the moveable ison?** Byzantine ison is not a static
  drone; it shifts as the melody crosses tetrachords. A simple "drone on
  the final" is doctrinally wrong. Modelling ison-shift correctly means
  either (a) authoring per-piece ison maps, or (b) a heuristic that moves
  the ison to the nearest characteristic tone of the active tetrachord.
- **What is the canonical romanisation?** *Echos prōtos* vs *ekhos protos*
  vs *ihos protos* — the literature uses all three. We should pick one
  (probably *echos*, the most academic) and provide aliases.
- **How prominent should the Roma transmission framing be?** A short
  paragraph on the about page is the conservative answer; an explicit Roma
  modal-tradition tag (with mode preferences and idiomatic motifs) would
  be the activist answer. Likely the conservative approach in v1 and an
  invited Roma-musician advisory note for v2.
- **Should we ship a Smyrnéika "historical" tuning preset against an
  active rebetiko 12-EDO?** Yes, but the pedagogical copy needs to be
  careful: presenting 12-EDO as "the corruption" risks insulting living
  bouzouki tradition.
- **How to source enechemata recordings?** Cappella Romana (Lingas)
  and the Greek Byzantine Choir (Angelopoulos archive) are the two
  natural permission targets. Public-domain MMB transcriptions exist; a
  synthesised enechema preview is also viable.
- **Albanian iso as a drone option for non-Albanian modes?** Tempting,
  but probably culturally inappropriate. Better to ship Tosk iso only
  with Albanian song presets.

---

## Sources

- Wikipedia, "Octoechos." https://en.wikipedia.org/wiki/Octoechos
- Wikipedia, "Octoechos (liturgy)." https://en.wikipedia.org/wiki/Octoechos_(liturgy)
- Wikipedia, "Neobyzantine Octoechos." https://en.wikipedia.org/wiki/Neobyzantine_Octoechos
- Wikipedia, "Echos." https://en.wikipedia.org/wiki/Echos
- Wikipedia, "Ison (music)." https://en.wikipedia.org/wiki/Ison_(music)
- Wikipedia, "Byzantine music." https://en.wikipedia.org/wiki/Byzantine_music
- OrthodoxWiki, "Byzantine Chant." https://orthodoxwiki.org/Byzantine_Chant
- OrthodoxWiki, "Chrysanthos of Madytos." https://orthodoxwiki.org/Chrysanthos_of_Madytos
- St Anthony's Greek Orthodox Monastery, "Byzantine vs Western Notation." https://stanthonysmonastery.org/pages/byzantine-vs-western-notation
- St Anthony's Greek Orthodox Monastery, "The Intervals of the Soft Chromatic Modal Genre." https://stanthonysmonastery.org/pages/the-intervals-of-the-soft-chromatic-modal-genre
- St Anthony's Greek Orthodox Monastery, "History of Byzantine Chant." https://stanthonysmonastery.org/pages/history-of-byzantine-chant
- John Sanidopoulos, "The Meaning and Character of the Eight Modes or Tones." https://www.johnsanidopoulos.com/2019/10/the-meaning-and-character-of-eight.html
- Liturgica.com, "Byzantine Music History." https://www.liturgica.com/litEOLitMusDev1.html
- Holy Cross Orthodox Church, "Byzantine Chant." https://www.holycrossonline.org/byzantine-chant
- Markos Skoulios, "Modern Theory and Notation of Byzantine Chanting Tradition." https://www.academia.edu/113263070/Modern_theory_and_notation_of_Byzantine_chanting_tradition_a_Near_Eastern_musicological_perspective
- Alexander Lingas, "Performance Practice and the Politics of Transcribing Byzantine Chant." https://analogion.com/site/pdf/Lingas.pdf
- Stamou, Chryssovergis, and Apostolopoulos, "Acoustic Analysis of Musical Intervals in Modern Byzantine Chant Scales." https://www.academia.edu/37603376/Acoustic_analysis_of_musical_intervals_in_modern_Byzantine_Chant_scales
- Civilization in Contemplation, "Byzantine Music." https://www.civincont.com/civilizationincontemplation_byzantine_music.html
- ASCSA, "Markos Dragoumis Papers." https://www.ascsa.edu.gr/index.php/archives/markos-dragoumis-papers
- Wikipedia, "Rebetiko." https://en.wikipedia.org/wiki/Rebetiko
- Wikipedia, "Roza Eskenazi." https://en.wikipedia.org/wiki/Roza_Eskenazi
- Wikipedia, "Rita Abatzi." https://en.wikipedia.org/wiki/Rita_Abatzi
- Wikipedia, "Bouzouki." https://en.wikipedia.org/wiki/Bouzouki
- Risto Pekka Pennanen, "The Nationalization of Ottoman Popular Music in Greece." https://www.academia.edu/6276448/The_Nationalization_of_Ottoman_Popular_Music_in_Greece
- Risto Pekka Pennanen, "Westernisation of Rebetiko Modes: Dromoi Brightness and Darkness." https://www.academia.edu/78315174/Westernisation_of_rebetiko_modes_dromoi_brightness_and_darkness
- Spiros Delegos, "A Modal Heterotopia." https://www.cambridge.org/core/journals/yearbook-for-traditional-music/article/abs/modal-heterotopia-rethinking-makam-modality-and-chordal-harmony-in-interwar-rebetiko/97AA9D681B487B202407919DC8D3C4AD
- Nikos Ordoulidis, "The Greek Popular Modes." http://britishpostgraduatemusicology.org/bpm11/ordoulidis_the_greek_popular_modes.pdf
- Ali Fuat Aydin, "Melodic Characteristics of Greek Rebetika Music." https://www.academia.edu/29836993/The_Melodic_Characteristics_of_Greek_Rebetika_Music_A_Comparative_Study_on_the_Dromos_and_the_Maqams
- Doctor-Dark, "The Roads (Rebetiko)." https://www.doctor-dark.co.uk/rebetiko/roads.html
- h2g2, "Greek Bouzouki Scales." https://www.h2g2.com/entry/A831340
- Wikipedia, "Music of North Macedonia." https://en.wikipedia.org/wiki/Music_of_North_Macedonia
- Wikipedia, "Albanian iso-polyphony." https://en.wikipedia.org/wiki/Albanian_iso-polyphony
- UNESCO, "Albanian Folk Iso-Polyphony." https://ich.unesco.org/en/RL/albanian-folk-iso-polyphony-00155
- Nathan Bernacki, "Meter in Bulgarian Folk Music." https://musiccycles.arts.ubc.ca/meter-in-bulgarian-folk-music/
- Timothy Rice, *May It Fill Your Soul* (book page). https://press.uchicago.edu/ucp/books/book/chicago/M/bo3633856.html
- Donna Buchanan, *Performing Democracy* (book page). https://press.uchicago.edu/ucp/books/book/chicago/P/bo3641153.html
- Carol Silverman, *Romani Routes* — EEFC bio. https://eefc.org/teacher/carol-silverman/
- Carol Silverman, *Romani Routes* (Project MUSE review). https://muse.jhu.edu/article/523818/pdf

---

## References

(Chicago author-date.)

Aydin, Ali Fuat. 2008. "The Melodic Characteristics of Greek Rebetika Music: A Comparative Study on the Dromos and the Maqams." Working paper. https://www.academia.edu/29836993/.

Bernacki, Nathan. n.d. "Meter in Bulgarian Folk Music." *Cycles in the World of Music*, University of British Columbia. Accessed 30 April 2026. https://musiccycles.arts.ubc.ca/meter-in-bulgarian-folk-music/.

Buchanan, Donna A. 2006. *Performing Democracy: Bulgarian Music and Musicians in Transition*. Chicago Studies in Ethnomusicology. Chicago: University of Chicago Press.

Cantemir, Dimitrie. ca. 1700. *Kitâbü 'İlmi'l-Mûsîkî alâ Vechi'l-Hurûfât* [Book of the Science of Music According to the Letters]. Modern edition: Yalçın Tura, ed., Istanbul: Yapı Kredi, 2001.

Chrysanthos of Madytos. 1832. *Theōrētikon Mega tēs Mousikēs* [Great Theory of Music]. Trieste: Michele Weis.

Chrysanthos of Madytos. 2012. *Introduction to the New Method of Byzantine Chant Notation: An English Translation of Chourmouzios' Revision of Chrysanthos' Eisagoge*. Translated and edited by Konstantinos Terzopoulos. CreateSpace.

Conomos, Dimitri. n.d. "Byzantine Music." In *Grove Music Online*. Oxford University Press. Accessed 30 April 2026.

Delegos, Spiros. 2024. "A Modal Heterotopia: Rethinking Makam Modality and Chordal Harmony in Interwar Rebetiko." *Yearbook for Traditional Music* 56 (1): 81–104. https://doi.org/10.1017/ytm.2024.5.

Forry, Mark. 1986. *Becarac in Slavonia: An Eastern European Slavic Tradition*. PhD diss., University of California, Los Angeles.

Gauntlett, Stathis. 1985. *Rebetika: Carmina Graeciae Recentioris*. Athens: Denise Harvey & Co.

Holst-Warhaft, Gail. 1975. *Road to Rembetika: Music of a Greek Sub-Culture*. Athens: Anglo-Hellenic Publishing. Revised edition, Limni: Denise Harvey, 2014.

Lingas, Alexander. 2003. "Performance Practice and the Politics of Transcribing Byzantine Chant." *Acta Musicae Byzantinae* 6: 56–76.

Mavroeidis, Marios. 1999. *Oi mousikoi tropoi stin Anatoliki Mesogeio* [The Musical Modes in the Eastern Mediterranean]. Athens: Fagottobooks.

Ordoulidis, Nikos. 2011. "The Greek Popular Modes." *British Postgraduate Musicology Network* 11. http://britishpostgraduatemusicology.org/bpm11/.

Ordoulidis, Nikos. 2017. "The Recording Career of Vasilis Tsitsanis (1936–1983)." PhD diss., University of Leeds.

Pennanen, Risto Pekka. 1999. *Westernisation and Modernisation in Greek Popular Music*. Acta Universitatis Tamperensis 692. Tampere: University of Tampere Press.

Pennanen, Risto Pekka. 2004. "The Nationalization of Ottoman Popular Music in Greece." *Ethnomusicology* 48 (1): 1–25. https://doi.org/10.2307/30046238.

Pennanen, Risto Pekka. 2008. "Lost in Scales: Balkan Folk Music Research and the Ottoman Legacy." *Muzikologija/Musicology* 8: 127–47.

Petrović, Radmila. 1968. "The Concept of Genre in the Musical Folklore of Serbia." *Yearbook of the International Folk Music Council* 1: 79–91.

Pettan, Svanibor. 2002. *Roma Muzsikusok Koszovóban: Kölcsönhatás és Kreativitás* [Romani Musicians in Kosovo: Interaction and Creativity]. Budapest: Akadémiai Kiadó.

Rice, Timothy. 1994. *May It Fill Your Soul: Experiencing Bulgarian Music*. Chicago Studies in Ethnomusicology. Chicago: University of Chicago Press.

Rice, Timothy. 2004. *Music in Bulgaria: Experiencing Music, Expressing Culture*. Global Music Series. New York: Oxford University Press.

Rice, Timothy, and James Porter, eds. 2000. *The Garland Encyclopedia of World Music*, vol. 8: *Europe*. New York: Garland.

Sanidopoulos, John. 2019. "The Meaning and Character of the Eight Modes or Tones of Byzantine Music." *Mystagogy*. https://www.johnsanidopoulos.com/2019/10/the-meaning-and-character-of-eight.html.

Silverman, Carol. 2012. *Romani Routes: Cultural Politics and Balkan Music in Diaspora*. American Musicspheres. New York: Oxford University Press.

Singer, Alice. 1974. "The Metrical Structure of Macedonian Dance." *Ethnomusicology* 18 (3): 379–404.

Skoulios, Markos. 2011. "Modern Theory and Notation of Byzantine Chanting Tradition: A Near-Eastern Musicological Perspective." Working paper. https://www.academia.edu/113263070/.

Stamou, Lelouda, Spyridon Chryssovergis, and Theodoros Apostolopoulos. 2008. "Acoustic Analysis of Musical Intervals in Modern Byzantine Chant Scales." *Journal of the Acoustical Society of America* 124 (4): EL262–EL269. https://doi.org/10.1121/1.2968299.

Stathis, Grigorios Th. 1979. *Hē dekapentasullabos hymnographia en tē Byzantinē melopoiia* [The Fifteen-Syllable Hymnography in Byzantine Composition]. Athens: Hidryma Vyzantinēs Mousikologias.

Tragaki, Dafni. 2007. *Rebetiko Worlds: Ethnomusicology and Ethnography in the City*. Newcastle: Cambridge Scholars.

Touliatos-Banker, Diane. 1984. "The Byzantine Amomos Chant of the Fourteenth and Fifteenth Centuries." *Acta Musicologica* 56 (1): 71–87.

Trærup, Birthe. 1972. "Albanian Singers in Yugoslav Macedonia: A Study in Vocal Repertoires." In *Studia Instrumentorum Musicae Popularis II*, edited by Erich Stockmann, 234–47. Stockholm: Musikhistoriska Museet.

Trærup, Birthe. 1998. "Albanian Folk Music." In *The Garland Encyclopedia of World Music*, vol. 8, edited by Timothy Rice and James Porter. New York: Garland.

UNESCO. 2008. "Albanian Folk Iso-Polyphony." Representative List of the Intangible Cultural Heritage of Humanity. Inscribed 2008 (Proclaimed Masterpiece 2005). https://ich.unesco.org/en/RL/albanian-folk-iso-polyphony-00155.

Wellesz, Egon. 1949 [1961]. *A History of Byzantine Music and Hymnography*. 2nd ed. Oxford: Clarendon Press.

Yekta Bey, Rauf. 1922. "La musique turque." In *Encyclopédie de la musique et dictionnaire du Conservatoire*, edited by Albert Lavignac, 1st pt., vol. 5: 2945–3064. Paris: Librairie Delagrave.
