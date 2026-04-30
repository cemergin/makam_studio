---
title: "Egyptian maqam practice and the 1932 Cairo Congress"
audience: "makam_studio designers and engineers shaping the synth's tuning model, preset taxonomy, and cultural framing"
tldr: |
  Egypt has its own maqam dialect, not just a copy of the Levantine one. The famous tell is the
  Cairene sikah / half-flat E, which most ethnomusicologists hear as roughly 340 cents above the
  tonic — markedly lower than the ~360 cents of Iraqi/Aleppine practice. The 1932 Cairo Congress
  is the formative event: it canonized 24-tone equal temperament in pedagogy (50¢ steps) while
  simultaneously recording 360 sides of music that contradict it. Practice never followed the
  textbook. The synth must let "Sikah on Egyptian" and "Sikah on Aleppine" be different presets
  while honoring their shared lineage.
skip_if: |
  You only care about Turkish makam, the Persian dastgāh system, or the Maghreb (Andalusi nūba).
  Those overlap but have separate research docs.
date: 2026-04-30
status: draft
---

# TL;DR

- **Egyptian maqam is a regional dialect, not the default Arab maqam.** Cairene sikah sits noticeably lower than Aleppine, Damascene, or Iraqi sikah; the canonical "Egyptian Eb" is around 340¢ vs. the Iraqi/Levantine ~360¢ above the tonic. Most secondary sources phrase this in narrative ("Egyptian Eb sounds lower than Syrian"), with measured cents values varying by performer and recording.
- **The 1932 Cairo Congress canonized 24-EDO in pedagogy but not in performance.** Egyptian theorists (descended from Mishaqa's mid-19th-century *Risāla*) pushed equal quarter-tones; Iraqi, Tunisian, and Syro-Lebanese delegates resisted. Conservatories adopted 24-EDO notation; practitioners kept playing variable just intonation.
- **The Congress produced two artifacts that still matter.** First, the *Recueil des travaux du Congrès de musique arabe* (1934, ~711 + 77 pp.). Second, ~360 wax recordings of Egyptian, Syrian, Iraqi, Tunisian, Algerian, and Moroccan ensembles, divided between the Bibliothèque nationale de France (Paris) and the Berlin Phonogramm-Archiv. The 78 rpm pressings (162 sides released by HMV) are the closest thing the Arab world has to a "Library of Congress recordings."
- **Egypt's identity as the modern center of Arab music was both real and contested.** From Sayed Darwish (d. 1923) through Umm Kulthum, Sunbati, Qasabji, Abdel Wahab, Farid al-Atrash, Baligh Hamdi, and Mounir, Cairo was the production hub — but Aleppo, Baghdad, and Tunis kept their own intonational schools alive, and Aleppine singers mocked Cairene "flat" sikah as much as Cairenes scoffed at Aleppine "sharp" intonation.
- **The qanun is the standardization battleground.** Egyptian qanuns use 4 mandals (quarter-tone levers) per course, Turkish kanuns use 7 (comma-based). Mohammed Abdo Saleh (1912–1970), Umm Kulthum's lead qanunist, set the reference for Egyptian mandal practice — and that reference, not Mishaqa's grid, is what an Egyptian player still hears in their head.
- **For makam_studio:** treat "Egyptian," "Aleppine," "Damascene," "Baghdadi," and "Turkish-influenced" as a regional-flavor axis sitting *underneath* the maqam name, not above it. Each preset bundles a tuning, a default ornament repertoire, and an instrumentation hint. Cairo Congress recordings deserve a "listen to the source" link inside the app — not as an authority but as evidence that recorded practice has always argued with the textbook.

---

## Egyptian maqam practice from Sayed Darwish to Mohammed Mounir

The standard textbook says Arabic music has 72 maqamat built from a shared catalog of *ajnās* (tetrachords/pentachords). What the textbook tends to elide is that within that shared catalog, Egypt has been running its own variant since at least the 1880s — and that variant is most of what the world now thinks of as "Arabic music."

**Sayed Darwish (1892–1923, Alexandria)** is the inflection point. Darwish composed ~260 songs, 10 *adwār*, 20 *muwashshaḥāt*, and 26 operettas in a 31-year life. He pulled Egyptian song away from late-Ottoman, Aleppo-centric *tarab* (where ecstatic improvisation was the goal) toward what he called "expression" — short, through-composed songs in colloquial Cairene Arabic, often political, often in character. He kept the maqam vocabulary but began the takht-to-orchestra transition the firqa would later complete.

**Mohammed Abdel Wahab (c. 1902–1991)** carried Darwish's revolution forward, layering cinema, Western harmony, and orchestral textures over maqam structure. **Umm Kulthum (c. 1898/1904–1975)** is the central column. Her ensemble started in 1926 as a takht (oud, qanun, ney, kamanjah, riqq) and grew into one of the first true firqas — by the 1960s, ~15 violins, cellos, double bass, accordion, sometimes flute or vibraphone. Her composers — **Mohammad al-Qaṣabjī**, **Riad al-Sunbatī**, **Zakariyya Ahmad**, later **Abdel Wahab** himself, **Sayyed Mekawi**, and **Baligh Hamdi** — are the second-generation Cairene canon. Sunbati's arrangements treat maqam as a dramatic device: long monothematic developments through tightly chosen modulations (Rast → Sikah → Bayati → Rast is a Sunbati signature).

**Farid al-Atrash (1910–1974)**, Druze-Syrian by birth and Cairene by residence, was the era's virtuoso oudist. **Abdel Halim Hafez (1929–1977)** pulled Egyptian song toward romantic crooning. **Baligh Hamdi (1931–1993)** brought electric guitar, accordion, and synthesizer into the firqa while keeping the maqam structures intact. **Mohammed Mounir (b. 1954)**, the Nubian Egyptian, kept Cairene phrasing but added Nubian rhythms and an African vocal placement — proof that "Egyptian sound" is itself plural.

What defines the **Egyptian sound** is a cluster of habits more than a single rule:

1. **A particular sikah pitch.** The Cairene "Eb half-flat" sits noticeably lower than its Aleppine and Iraqi counterparts. Marcus, Touma, and Farraj/Abu Shumays all describe this narratively ("Egyptian Ed lower than Syrian"). Hand-measured cents on Umm Kulthum recordings place Egyptian sikah around 335–345¢; Iraqi and Aleppine cluster around 355–365¢. The 24-EDO textbook value is 350¢ — Egypt is flat, Iraq/Aleppo is sharp, the textbook is a Cairene compromise.
2. **A particular bayati second.** Less discussed but real: Egyptian bayati's half-flat second (E half-flat above D) tends to sit a few cents lower than its Levantine equivalent in slow vocal genres.
3. **Dramatic, unhurried modulation.** Egyptian *qaṣīda* and *waṣla* unfold over 30–60 minutes; modulation is theatrical and selective. Aleppine practice modulates more rapidly; Iraqi *maqām* obeys stricter formal conventions.
4. **Heavy violin, light qanun.** As the firqa expanded, the qanun became coloristic and the prelude/taqsim soloist; violins carried the bed.
5. **Romantic Hijaz.** Egyptian Hijaz lands its augmented second clearly (not as wide as Turkish Hicaz, not as restrained as some Maghrebi versions) and dominates film music.

## Maqam Sikah and the Egyptian "low third"

Sikah is the maqam most identified with Egyptian musical identity, partly because its tonic *is* the half-flat note that Western notation cannot represent and that 24-EDO theory treats as an equal-quarter-tone neighbor of E and Eb. In Egyptian practice, that note has a sound — it is not 350¢, it is "the sikah pitch," and the entire mode rises and falls relative to it.

Marcus's *Arab Music Theory in the Modern Period* (1989, UCLA dissertation) is the foundational English-language analysis. Marcus argues that the Cairene sikah pitch is a learned aural reference, transmitted by ear, and that Egyptian musicians can detect a 10–15¢ deviation from "their" sikah without difficulty. He documents that this sikah is consistently lower than what Iraqi, Aleppine, or Damascene ensembles play. Subsequent work by Sami Abu Shumays, Johnny Farraj (*Inside Arabic Music*, 2019), and Habib Touma corroborates the regional split.

A frequently cited rule of thumb in the literature:

- **Egyptian/Cairene sikah:** ~340¢ above the tonic (range ~335–345¢).
- **24-EDO theoretical sikah:** 350¢ exactly.
- **Iraqi / Aleppine sikah:** ~360¢ above the tonic (range ~355–365¢).
- **Turkish *segâh* (Pythagorean / 53-EDO–derived):** ~362¢ above the tonic, but the tuning logic is different (komas, not quarter-tones) and *segâh*'s function inside Turkish makam is also different.

These numbers are approximate. Performance varies by singer, key, mood, and whether the moment is melismatic or syllabic. But the *direction* is robust: the Egyptian sikah is the low one, the Iraqi/Aleppine is the high one. This is the single most important regional fingerprint in the Mashriq Arab maqam world, and any synthesizer that flattens it into one "Sikah" preset has erased the thing that makes the music sound Egyptian (or Iraqi).

The "ghost interval" in 1932 debates is exactly this: the gap between an Egyptian sikah (~340¢) and a 24-EDO sikah (350¢) is real, audible, and mathematically inconvenient if you want a single grid.

## The 1932 Cairo Congress — *Mu'tamar al-Mūsīqā al-'Arabīya*

### Convening and committees

King Fuad I convened the First Congress of Arab Music in Cairo from 14 March to 3 April 1932, at the National Academy of Arab (Oriental) Music in the Azbakeya district. A royal commission appointed 20 January 1932 ran the planning: Muhammad Hilmi Isa Pasha (Minister of Public Education) chaired, with Baron **Rodolphe d'Erlanger** as vice-chair (d'Erlanger died later that year; his six-volume *La musique arabe* was published posthumously between 1930 and 1959).

The Congress's stated aims were five: (1) survey and record the state of Arab music across the region; (2) standardize the scale and notation; (3) reform instruments, especially the qanun and oud; (4) modernize music pedagogy; (5) document everything for posterity in a published *Recueil*.

### European participants

A who's-who of comparative musicology and Western avant-garde music attended:

- **Erich Moritz von Hornbostel** (Berlin Phonogramm-Archiv).
- **Curt Sachs** (Musikinstrumenten-Museum, Berlin).
- **Robert Lachmann** (Prussian State Library) — co-led the recording programme.
- **Béla Bartók** — submitted a paper, recorded, and later wrote about the experience.
- **Paul Hindemith** (Berlin).
- **Henry George Farmer** (Glasgow), the Anglophone authority on Arab music history.
- **Alexis Chottin** (French, Maghrebi music) and **Father Xavier Maurice Collangettes** (Jesuit).
- **Alois Hába** (Prague) and pianist **Karel Reiner** — bringing the Förster quarter-tone piano (1931).
- **Henri Rabaud** (Paris Conservatoire).

### Arab and Turkish participants

Delegations came from Egypt (the host), Syria, Lebanon, Iraq, Tunisia, Algeria, Morocco, and Turkey. Notable individuals: **Muhammad Fathī**, **Sami al-Shawwa** (Aleppo, violin), **Muhammad Abdel Wahab**, **Muhammad al-Qubanchi** (Iraq, the era's leading Iraqi *maqām* singer), **Khemaïs Tarnane** (Tunisia), **Larbi Bensari** (Algeria), **Rauf Yekta Bey** (Turkey, who left detailed published *Notes*), **Mesut Cemil** (Turkey, the Tanburi Cemil's son), **Wadī'a Ṣabrā** (Lebanon, who composed the future Lebanese national anthem and led the Levantine resistance to 24-EDO). The nay player **Ali al-Darwish** (Aleppo) was reportedly highly influential in committee discussions but is barely visible in the official record. Gulf, Yemeni, and Persian delegations were absent; the Congress's working definition of "Arab music" was Mashriq + Maghreb urban art music, not the wider region.

### The scale committee — the central debate

The fight everyone remembers is the scale debate. Two camps:

- **Equal-temperament camp (24-EDO):** mostly Egyptian. The argument descended directly from **Mikhail Mishaqa's** mid-19th-century *Risāla al-Shihābiyya fī al-Sinā'a al-Mūsīqiyya* (written c. 1820s–1840s in Mount Lebanon, but absorbed into Egyptian conservatory teaching by the early 20th century). Mishaqa proposed dividing the octave into 24 equal quarter-tones, each ~50¢. Egyptian theorists liked this because it played well with conservatory pedagogy, with notation, and with potential Western collaboration.
- **Just-intonation / variable-pitch camp:** Syro-Lebanese (Wadī'a Ṣabrā, Tawfīq al-Ṣabbāgh), Turkish (Yekta Bey, working in a Pythagorean/53-EDO frame), and Iraqi (al-Qubanchi's school). Their position: the actual sikah, the actual bayati second, the actual hijaz augmented are *not* equal quarter-tones. They are intervals tuned by ear to specific melodic functions. Locking them into a 24-EDO grid would falsify what the music actually does.

The Egyptians effectively won the pedagogical war. The Congress's final recommendation pushed 24-EDO as the notational standard, and Cairene, Damascene, and Baghdadi conservatories adopted it through the mid-20th century. This is the **long shadow** of 1932: a textbook intonation that has never matched recorded practice, taught for almost a century to students whose ears tell them something different.

### The piano scandal

Hába arrived with the Förster quarter-tone piano (1931, the second of its kind), expecting it to demonstrate the future of microtonal music. The instrument's fixed pitches were 50¢ apart — exactly the 24-EDO grid. To Yekta Bey, Ṣabrā, and the Iraqis, it was the embodiment of the wrong answer. The Congress's European members ultimately voted (by majority) to *ban* the piano, the cello, and the double bass from "authentic" Arab ensembles — a striking moment: Europeans demanding that Arabs reject Western instruments. Behind the vote was a comparative-musicology aesthetic ("preserve the authentic") more than an Arab consensus. In Cairo's actual practice, the firqa kept its cellos and double basses anyway.

### Instrument standardization

The instrument committee debated qanun mandal layouts and oud fretlessness. The agreed result for the qanun: the **Egyptian/Arabic system of 4 mandals per course**, each producing a quarter-tone shift, became the standard for Mashriq qanuns. The Turkish kanun kept its much finer comma system (7 mandals per course, 1/9-tone resolution). The decision aligned with the 24-EDO scale recommendation: if the theoretical scale is equal quarter-tones, the qanun should snap to them.

### Recording programme — the field tape of pre-modern Arab music

Lachmann and Bartók, working with the Egyptian branch of His Master's Voice (Alexandria), recorded **~360 performances** during the Congress. 162 sides were pressed by HMV (78 rpm) for limited circulation; King Fuad donated copies to the Musée Guimet in Paris. Masters and unpublished recordings went to the Berlin Phonogramm-Archiv and the Bibliothèque nationale de France's Phonothèque (the BnF holding is the most complete public-access set, partially digitized via Gallica). The corpus includes Egyptian takht and small firqa, Aleppine and Damascene ensembles, Iraqi *maqām* (al-Qubanchi extensively), Tunisian *ma'lūf*, Algerian and Moroccan Andalusi, and Turkish *fasıl*. It is the single most important pre-WWII corpus of Arab music — and it documents the regional variability the scale committee was about to officially flatten. The **AMAR Foundation** (Lebanon) has been the most active institution working with the recordings since 2009; Bernard Moussali's posthumous *Le Congrès du Caire de 1932* (Geuthner, 2024, ed. Jean Lambert) is the standard recent secondary source.

### The *Recueil des travaux*

The proceedings were published in 1934 as *Recueil des travaux du Congrès de musique arabe qui s'est tenu au Caire en 1932 (hég. 1350) sous le haut patronage de S. M. Fouad Ier, roi d'Égypte* (Cairo, Imprimerie nationale; xii + 711 + 77 pp.). The book contains committee reports, debate transcripts, scale tables, instrument descriptions, lists of records made, and bibliography. It is partially in French and partially in Arabic. It is the Rosetta Stone of modern Arab music theory: every later Arab theorist and ethnomusicologist either explicitly cites it or quietly assumes its conclusions.

## Egyptian instrumental tradition: takht to firqa

The **takht** (lit. "platform," referring to the raised seating) is the canonical late-19th-century Cairene chamber group: oud, qanun, ney, violin (kamanjah, replacing the older spike fiddle rabāba), riqq (frame drum). Five players, sometimes a small chorus, sometimes a tablah added. Sayed Darwish recorded with takht. Umm Kulthum's first stable ensemble (1926) was a takht, with al-Shawwa on violin and al-Qaṣabjī on oud.

The **firqa** is the takht's industrial-era successor. Started informally around 1910, it consolidated in the 1930s–40s under the influence of Egyptian radio (Cairo Radio launched 1934), film, and the demands of large halls. Instrumentation expansion:

- The riqq stayed solo (it is the time-keeper).
- Violins multiplied (sometimes 12–15 by the 1960s).
- Cello and double bass were added, despite the Cairo Congress's European delegates' disapproval.
- The tablah (darbukah/dumbek) entered formal ensembles for the first time.
- Western additions: flute, accordion (a signature of Baligh Hamdi's sound), occasionally vibraphone.
- Western harmony entered carefully: most Egyptian firqa harmony of the 1940s–60s is sustained drones, parallel thirds in the violins, or thinly disguised pedal points — anything that doesn't force a specific key.

## Egyptian qanun practice

The qanun is the standardization battleground because, unlike the oud or ney, it has discrete pitches. Whatever you decide about quarter-tones gets built into the mandal layout.

- **Egyptian / Mashriq qanun: 4 mandals per course.** Each mandal raises the open-string pitch by ~25¢ (a quarter-tone, in 24-EDO theory). With four levers, the player can move from a flat note to a quarter-flat to a natural to a quarter-sharp to a sharp. The grid matches the Cairo Congress's adopted scale — and thus matches what conservatory students are taught.
- **Turkish kanun: 7+ mandals per course.** Each mandal step is roughly a Pythagorean comma (~23.5¢, sometimes finer). The full layout supports Turkish *makam* practice, which depends on intervals like Bb-koma-flat and Bb-bakiyye-flat that are not equal quarter-tones.

**Mohammed Abdo Saleh (Muḥammad 'Abduh Ṣāliḥ, 1912–1970)** is the modern Egyptian qanun reference. Born in Cairo, he started performing publicly at age 7 and joined Umm Kulthum's takht in 1929 (replacing Ibrahim Erian/al-'Aryan). He worked with Sayed Darwish, Saleh Abdel Hay, Abdel Wahab, and Sunbati. He composed solo qanun pieces (~20 surviving), eventually became Director of Oriental Music at Egyptian Radio and TV (1964), and taught at the Arab Music Academy. His mandal practice — exactly which lever to use for a Cairene sikah, a bayati second, a hijaz half-flat — is the de facto standard for Egyptian qanun pedagogy. His student lineage includes **Magdy al-Husseini** (later mainly a keyboardist, but trained on qanun) and others who carried the Cairo style into the late 20th century. **Abdel Fattah Mansy** is a less-documented but cited figure in the same lineage.

A subtle point: even an Egyptian qanun set up with 4 quarter-tone mandals per course can produce the lower Cairene sikah. The trick is in *string tuning*, not in the mandals. Saleh and his successors are reported to slightly flatten the F-natural string (the source of the sikah note when raised one mandal) to land closer to the desired Cairene pitch. So the standardization is honored on paper while practice quietly adjusts.

## Quarter-tone reform: Mishaqa and the long shadow

**Mikhail Mishaqa (Mīkhā'īl Mishāqa, 1800–1888)** was a Lebanese Greek Catholic physician, intellectual, and chancellor at the court of the Shihab emirs in Mount Lebanon. His *Risāla al-Shihābiyya fī al-Sinā'a al-Mūsīqiyya* ("Epistle on the Musical Art, dedicated to Emir Shihāb"), composed in the 1820s and circulated in the 1840s, proposed dividing the octave into 24 equal quarter-tones. Mishaqa himself credited his teacher, Sheikh Muḥammad al-'Aṭṭār (1764–1828), with the underlying idea; Mishaqa systematized and published it.

Why did 24-EDO stick pedagogically, despite being acoustically inaccurate to actual practice? Several reasons:

- **It is teachable.** A 24-position chromatic grid maps onto Western staff notation (with quarter-flat / quarter-sharp accidentals) and onto fretted/levered instruments. Twelve unequal scale-degree pitches with regional variation do not.
- **It is portable.** A Damascene student, a Cairene student, and a Baghdadi student studying from the same conservatory book learn the "same" maqam, even if their teachers play it three different ways.
- **It rhymes with European tonal hegemony.** In the Nahda (Arab Renaissance, late 19th–early 20th c.), Arab modernizers wanted a musical theory legible to Europeans. 24-EDO — equal-tempered, Pythagorean, mathematical — felt like science.
- **It was politically convenient at the 1932 Congress.** Egypt was the host and the cultural superpower. Adopting Egyptian theory as "Arab" theory affirmed Egyptian centrality.

The cost is a permanent gap between conservatory theory and lived practice — which is exactly the gap that ethnomusicologists from Marcus onward have been measuring.

## Modern Egyptian theoretical writing

- **Yusuf Shawqi** (Yūsuf Shawqī, 1969 and later) — the most cited modern Egyptian theorist. Argued, against the strong 24-EDO line, that *fewer than 24 distinct tones are actually used*; the rest are pedagogical fictions. His work re-opened the variable-pitch case after 1932 had closed it. (Sources largely in Arabic; bibliography to be confirmed.)
- **Abdel Hamid Hamdi** — Egyptian music-education theorist; sometimes confused with the composer Baligh Hamdi. English sources thin.
- **Salah al-Mahdi** (Tunisian, in dialogue with Cairo) — co-edited continuations of d'Erlanger's *La musique arabe*; represents the Maghrebi reading.
- **Salim al-Helou** (Lebanese) and **Tawfiq al-Sabbagh** (Syrian) — the Levantine theoretical pole, post-1932.
- **Scott Marcus** (UCSB), **Habib Hassan Touma** (Palestinian-German, 1934–1998), and **A. J. Racy** (Lebanese-American, UCLA) — non-Egyptian but the canonical English-language secondary references. Marcus's 1989 dissertation, Touma's *The Music of the Arabs* (1975/1996), and Racy's *Making Music in the Arab World* (2003) are cited by all of the above.

## The Egyptian–Levantine relationship

The two traditions share most of the canonical maqam catalog: Bayati, Rast, Sikah, Hijaz, Nahawand, Saba, Kurd, 'Ajam, Nawa Athar, plus a hundred derivatives. They differ in:

- **Pitch.** Aleppine and Damascene sikah/bayati run higher than their Cairene equivalents (the famous 340¢ vs. 360¢ axis).
- **Tempo and form.** Aleppine *waṣla* tradition (the Sabah Fakhri school is the famous late example) is more dense, more ornament-heavy, faster-modulating. Egyptian Sunbati arrangements are slower, more architectonic.
- **Vocal placement.** Aleppine voices tend to sit higher in the chest with more nasal resonance; the Egyptian tradition (Umm Kulthum onward) cultivated a fuller, lower vocal placement.
- **Repertoire emphasis.** Aleppo holds the *qudūd ḥalabiyya* tradition; Cairo holds the *adwār* and modern *uġniya* (long-form song) tradition; Damascus sits between.
- **Take on the Cairo Congress.** Aleppine and Damascene practitioners have always quietly noted that Cairo "won" the standardization fight without Cairo's intonation actually being correct.

A pithy version of the Aleppine view, attributed to several singers: "The Egyptians have the radio, the cinema, and the textbook. We have the music." The Cairene reply, also attributed to several composers: "Aleppo sings prettily. Cairo says something." Neither is wrong.

## Implications for makam_studio

This is the actionable part. Five concrete recommendations.

### 1. Treat regional flavor as a first-class axis

Don't ship one "Sikah" preset. Ship at least:

- **Sikah · Egyptian (Cairene)** — sikah ≈ 340¢, slow modulation defaults, firqa-style instrumentation hint.
- **Sikah · Aleppine** — sikah ≈ 360¢, denser ornamentation defaults, takht instrumentation.
- **Sikah · Damascene** — interpolated between the above, distinct ornament catalog.
- **Sikah · Baghdadi (Iraqi)** — sikah ≈ 360¢, with the *maqām al-'irāqī* formal frame.
- **Sikah · Turkish-influenced (Segâh)** — separate tuning logic (komas), tagged as a different system.

Architecture-wise, this implies **two orthogonal dimensions**: maqam name (Sikah, Bayati, Rast, Hijaz...) × regional flavor (Egyptian / Aleppine / Damascene / Baghdadi / Turkish). The same axis applies to Bayati, Rast, Saba, and Hijaz, and probably to a smaller number of derivatives. "Tradition" is not a top-level category that excludes others; it is a setting on every preset.

This mirrors BeatForge's "9/8 as 2+2+2+3" decision: refuse the false simplicity of a single label and surface the structural difference that practitioners actually hear.

### 2. Cents, not 24-EDO

Internal pitch representation should be **cents above tonic**, not 24-EDO step indices. Each preset stores its tunings as a list of cents values (e.g. Egyptian Sikah scale: 0, 200, 340, 500, 700, 845, 1045, 1200) — not as a vector of {semitones, quarter-tones}. This lets the synth honor 340¢ vs. 350¢ vs. 360¢ exactly. It also opens the door to per-string microtuning on the qanun control surface.

If the user wants the textbook view, the UI can render the same scale in 24-EDO accidentals (Eb half-flat, etc.) — but the underlying number is the cents value.

### 3. Per-preset ornament repertoire

Tuning is necessary but not sufficient. The Egyptian sikah only sounds Egyptian if you also play it with Egyptian phrasing — slower, more sustained, fewer ornaments per beat than Aleppine practice. A preset should be more than "scale + tuning"; it should bundle (a) scale, (b) tuning in cents, (c) default ornament density, (d) a default vibrato rate/depth, (e) an instrumentation hint (takht / firqa / Egyptian-modern / Aleppine), (f) a default tempo range. The user can override anything; the preset captures a *style*, not just a scale.

### 4. Honor the Cairo Congress without endorsing its flattening

The Congress's recordings are too important not to surface. Recommendation:

- Every regional preset gets an **optional "listen to historical reference" link** citing the relevant 1932 Cairo recording (Egyptian takht, Aleppine takht, Iraqi *maqām*, etc.). Link out to the BnF Gallica or AMAR Foundation streams; do not host audio (BeatForge's "no samples" ethos applies).
- A short **"Cairo 1932" footnote** on the maqam picker (60–80 words) explains that pedagogy was contested, the recordings document what people actually played, and our regional variants exist *because* the textbook doesn't capture practice. A citation, not a manifesto.
- A **"show 24-EDO grid"** toggle that snaps any preset to Mishaqa's equal quarter-tones — useful for teaching, conservatory collaboration, and a respectful bow to the standard without forcing it.

### 5. Cultural sensitivity in copy and naming

- Do not write "Egyptian Sikah is the *correct* sikah." It isn't. Neither is the Aleppine. Both are valid lineages.
- Do not name the regional axis "authenticity." Use "regional flavor" or "tradition."
- When citing Cairo Congress recordings, name the original ensemble and city, not just the country.
- Use Arabic transliterations consistently. Maqam Sīkāh in transliteration; Sikah in lowercase common usage; the Arabic مقام السيكاه as a tooltip.
- Note that Egyptian-vs-Aleppine is a *friendly* historic disagreement. Avoid framing it as conflict. They are dialects of one shared language.

## Open questions

1. **Exact cents values.** The 340¢ / 360¢ figures are commonly cited but the empirical literature is thinner than one would like. A graduate project measuring sikah pitch across Umm Kulthum vs. Sabah Fakhri vs. al-Qubanchi recordings would give us defensible numbers. For makam_studio v1, we should ship round numbers and document the uncertainty.
2. **What does "Damascene sikah" sound like distinct from "Aleppine sikah"?** The cities are 350 km apart; recorded practice differs. Need a Damascus-specific source.
3. **Egyptian Bayati second.** Less documented than the Egyptian sikah; needs measurement.
4. **The Mounir question.** Is Nubian-Egyptian a fourth flavor, or does it sit inside Cairene? The pitches are similar but the rhythmic feel is very different. Probably a separate axis (rhythm) but worth flagging.
5. **Mishaqa's *Risāla* in primary form.** Has anyone fully translated it into English? The Arabic editions are in print; the English literature mostly cites it secondhand via Marcus and El-Shawan. Worth checking if a primary translation exists.
6. **Cairo Congress recordings — full discography.** The AMAR Foundation and BnF have done substantial work but the full discography (which ensemble plays which maqam on which side) appears to live across multiple specialist sources. A consolidated index would be a research contribution in itself.
7. **The Persian / Azeri overlap.** Egyptian Sikah and Persian *Segāh* / Azeri *Segah-Mugham* share a name but are different systems. We need a separate research doc for that boundary.
8. **Oud tuning conventions.** Egyptian oud is typically tuned C–F–A–D–G–C (or the lower variant), Iraqi oud differs. Worth documenting alongside the qanun.

## Sources

**Primary**

- Mikhail Mishaqa. *Risāla al-Shihābiyya fī al-Sinā'a al-Mūsīqiyya* [Epistle on the Musical Art, for Emir Shihāb]. Mount Lebanon, c. 1820s–1840s. Multiple Arabic editions (e.g. Cairo, 1899; Beirut, modern reprints). Translated and discussed in Eli Smith, "A Treatise on Arab Music," *Journal of the American Oriental Society* 1 (1849): 173–217.
- *Recueil des travaux du Congrès de musique arabe qui s'est tenu au Caire en 1932 (hég. 1350) sous le haut patronage de S. M. Fouad Ier, roi d'Égypte.* Cairo: Imprimerie nationale, 1934. xii + 711 + 77 pp.
- Rodolphe d'Erlanger. *La musique arabe.* 6 vols. Paris: Geuthner, 1930–1959.
- Cairo Congress 1932 recordings. ~360 sides recorded by Lachmann, Bartók, and HMV (Alexandria branch). Held: Bibliothèque nationale de France, Paris (Phonothèque); Berlin Phonogramm-Archiv; Musée Guimet, Paris (HMV pressings).

**Secondary — English**

- Scott Lloyd Marcus. *Arab Music Theory in the Modern Period.* PhD diss., UCLA, 1989. Plus Marcus's articles, e.g. "Modulation in Arab Music," *Ethnomusicology* 36, no. 2 (1992): 171–195.
- A. J. Racy. *Making Music in the Arab World: The Culture and Artistry of Ṭarab.* Cambridge: Cambridge University Press, 2003.
- Habib Hassan Touma. *The Music of the Arabs.* 1st German ed. 1975; English trans. Laurie Schwartz, Portland: Amadeus Press, 1996.
- Johnny Farraj and Sami Abu Shumays. *Inside Arabic Music: Arabic Maqam Performance and Theory in the 20th Century.* Oxford: Oxford University Press, 2019.
- Sami Abu Shumays. "Maqam Analysis: A Primer." *Music Theory Spectrum* 35, no. 2 (2013).
- Amnon Shiloah. *Music in the World of Islam: A Socio-Cultural Study.* Detroit: Wayne State University Press, 1995.
- Israel J. Katz, with Sheila Blair and Jonathan Bloom. *Henry George Farmer and the First International Congress of Arab Music (Cairo 1932).* Leiden: Brill, 2015. (The standard English-language monograph on the Congress.)
- Salwa El-Shawan Castelo-Branco. "The Socio-Political Context of *al-Mūsīkā al-'Arabīyyah* in Cairo, Egypt." *Asian Music* 12, no. 1 (1980): 86–128. And related articles.
- Virginia Danielson. *The Voice of Egypt: Umm Kulthūm, Arabic Song, and Egyptian Society in the Twentieth Century.* Chicago: University of Chicago Press, 1997.

**Secondary — French**

- Bernard Moussali. *Le Congrès du Caire de 1932.* Edited posthumously by Jean Lambert. Paris: Geuthner, 2024. The most thorough recent monograph.
- Christian Poché and Jean Lambert. *Musiques du monde arabe et musulman: bibliographie et discographie.* Paris: Geuthner, 2000.

**Secondary — Arabic (selected; English bibliography is denser)**

- Yūsuf Shawqī. *Risāla al-Shihābiyya: Dirāsa wa-tahqīq.* Cairo, 1969 (and Shawqī's other studies on Arab music theory).
- Maḥmūd al-Ḥifnī, ed. *Mu'tamar al-Mūsīqā al-'Arabīya 1932.* Cairo, 1933 (Arabic counterpart to the *Recueil*).
- Salīm al-Ḥilū. *al-Mūsīqā al-naẓariyya.* Beirut, multiple editions.

**Web references consulted** (April 2026)

- *Cairo Congress of Arab Music.* Wikipedia. https://en.wikipedia.org/wiki/Cairo_Congress_of_Arab_Music
- *First Congress of Arab Music in 1932.* Qantara.de.
- *Microtones: The Piano and Muhammad Al-Qubanshi.* Qatar Digital Library.
- *Bernard Moussali and the Echoes of 1932.* Beyond 1932 (KCL). https://1932muscon.kcl.ac.uk
- *Is it Sikah or Segâh?* TAQS.IM. https://taqs.im/sikah-or-segah/
- *Section 7.9: Maqamat.* Offtonic Theory. https://www.offtonic.com/theory/book/7-9.html
- *Mikhail Mishaqa* / *Arab tone system* / *Arabic maqam* / *Sayed Darwish* / *Umm Kulthum* / *Firqa*. Wikipedia.
- *Muḥammad 'Abduh Ṣāliḥ (1912–1970).* AMAR Foundation. https://www.amar-foundation.org/muhammad-abduh-salih/
- Cairo Congress Discography (Michael Kinnear). https://bajakhana.com.au/congres-de-musique-arabe-du-caire-1932-discography/
