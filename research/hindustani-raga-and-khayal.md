---
title: "Hindustani classical music — the raga system, the khayal genre, and the gap between 22-shruti theory and performed pitch"
audience: "makam_studio designers and engineers; future contributors writing Hindustani-mode presets, drone synthesis, microtonal interval models, time-of-day metadata, or any extension of the project beyond Middle-Eastern maqam into South-Asian modal practice"
tldr: |
  Hindustani classical music organizes ragas under Bhatkhande's 10 thaats (parent scales),
  but a raga is much more than a scale: it has vādī/saṃvādī notes, a pakaḍ (signature
  phrase), characteristic ascending/descending shapes, time-of-day, and rasa. The 22-shruti
  theory descended from Bharata's Natyashastra is theoretically venerable but empirically
  broken — Jairazbhoy (1971), van der Meer, and Rao show performed intonation is
  raga-specific and continuous-with-inflections, not 22 equal microtones. Khayal replaced
  dhrupad as the dominant vocal genre in the 18th c. (Sadarang/Adarang at Muhammad Shah's
  Mughal court) and is transmitted through gharanas (Gwalior, Agra, Kirana, Patiala,
  Jaipur-Atrauli, Bhendi Bazaar, Mewati, Indore). The fundamental difference from maqam:
  raga is melody-over-tanpura-drone, and the drone shapes pitch perception absolutely.
  For makam_studio: Hindustani cannot ship as scale-only presets without misleading users;
  the right v1.5 path is 5–10 popular ragas with explicit "the raga is more than this"
  disclaimers, plus a tanpura drone module (which generalizes back to a useful feature
  for some maqam contexts), plus time-of-day metadata as a UX layer.
skip_if: "you are a Hindustani practitioner — this is a designer's compression of academic literature, not a contribution to the field"
date: 2026-04-30
status: draft
---

# TL;DR

- **Bhatkhande's 10 thaats** (Bilawal, Khamaj, Kafi, Asavari, Bhairavi, Bhairav, Kalyan, Marwa, Purvi, Todi) are the dominant *pedagogical* framework for Hindustani ragas, codified ca. 1909–1932 in *Hindustani Sangeet Paddhati*. They are scale-skeletons, not ragas. Bhatkhande chose 10 of 32 mathematically possible thaats as those most populated by living ragas; the framework is universally taught and universally critiqued (see Powers, Jairazbhoy).
- **A raga is not a scale.** It has ārohī (ascent), avarohī (descent), vādī (most prominent note), saṃvādī (second-most), pakaḍ (signature melodic phrase, in solfa), characteristic chalan (movement), time-of-day (samay), and rasa (aesthetic mood). Two ragas can share a thaat and even an ascent/descent and still be unmistakably different in performance — this is the gap pedagogy struggles to encode.
- **The 22-shruti theory is theoretically ancient (Bharata's *Natyashastra*, ~200 BCE–200 CE) but empirically false** as a description of modern performance. Jairazbhoy (1971), van der Meer (1980, 2000), and Rao (Rao & van der Meer 2010) measure performed intonation and find it raga-specific, melodically-contextual, glide-saturated, and *NOT* 22 equally-spaced steps. The honest description is: 12-tone framework with raga-specific microtonal inflections (and meend/gamak ornaments that traverse continuous pitch).
- **Khayal replaced dhrupad as the dominant vocal genre in the 18th c.** Sadarang (Niamat Khan) and Adarang at the court of Mughal emperor Muhammad Shah Rangile (r. 1719–1748) are the conventional codifiers. A khayal performance has a vilambit (slow) bada khyal followed by a drut (fast) chhota khyal, both built on bandiśh (fixed compositions) elaborated through alāp, bol-ālāp, sargam, and tāns. (Wade 1984.)
- **Gharanas** — Gwalior (oldest), Agra, Kirana, Patiala, Jaipur-Atrauli, Bhendi Bazaar, Mewati, Indore — are stylistic + genealogical lineages. They differ in voice production, pace of unfolding, ornament density, repertoire, and aesthetic priorities. Neuman (1980) is the canonical sociology.
- **The tanpura drone is the fundamental schema-difference from maqam.** Maqam is melody over no drone (or over a percussive bed); raga is melody over an unbroken sa-pa-sa or sa-Ma-sa drone whose harmonic content (the jivari "buzz" of the tanpura's bridges) shapes pitch perception. For makam_studio: ship a drone module.

---

## 1. Foundations: swara, shruti, and Bhatkhande's thaats

### Swaras — the seven notes

Hindustani music names seven notes (swaras), abbreviated by their first syllables in solfa: **Sa Re Ga Ma Pa Dha Ni** (often written **S R G M P D N**). They correspond loosely to do-re-mi-fa-sol-la-ti, with Sa as movable tonic. Sa and Pa are *achala* — fixed; the other five have variants:

- **Shuddh** (natural): the default pitch.
- **Komal** (lowered, a semitone below shuddh): applies to Re, Ga, Dha, Ni. Notated by lowercase or by an under-line in Bhatkhande notation.
- **Teevra** (raised, a semitone above shuddh): applies *only* to Ma. Notated with an over-line or apostrophe (M').

So: shuddh Re/komal Re, shuddh Ga/komal Ga, shuddh Ma/teevra Ma, shuddh Dha/komal Dha, shuddh Ni/komal Ni. That is 12 named pitches total within the octave — the same chromatic palette as the Western 12-tone system, but framed differently (no enharmonic equivalence; each komal/shuddh is a distinct *swara identity*, not just a label for a piano key).

### Shruti — the contested microtones

Bharata's *Natyashastra* (Sanskrit treatise on performing arts, conventionally dated ~200 BCE – 200 CE; Ghosh's English translation is the standard) describes the octave as containing **22 shrutis** (literally "that which is heard," or microtonal divisions). The seven swaras of the *shadja-grama* are placed at intervals of 4-3-2-4-4-3-2 shrutis between successive notes — a tetrachordal scheme with deep resonance to Greek tetrachordal theory (Rowell 1992, ch. 7).

Modern interpretations of the 22 shrutis range over:

- **Just-intonation explanations** (Bhatkhande, Deval, Clements, early 20th c.): shrutis as 5-limit ratios such as 16/15 (~112 cents), 9/8 (~204 cents), 6/5 (~316 cents), etc.
- **Equal-temperament myths** (popular but unsupported): 22 equally-spaced steps of ~54.5 cents each. No theorist seriously defends this; no performer plays it.
- **Critical/empirical position** (Jairazbhoy 1971; van der Meer 1980, 2000; Rao & van der Meer 2010): the 22 shrutis are an *intellectual relic* of the *Natyashastra*'s pre-modal grama theory, useful as a conceptual reminder that pitch is more than 12 steps but **not** descriptive of contemporary performance. What performers actually do is: hold most notes within ~10 cents of 12-EDO, but inflect specific notes in specific ragas by 20–60 cents (komal Re of Bhairav is "lower" than komal Re of Bhairavi; komal Ga of Darbari is held with andolan oscillation across ~50 cents), and traverse continuous pitch territory through meend (glide) and gamak (oscillation).

Rao and van der Meer's 2010 case study — same vocalist, komal Dha across five ragas (Darbari, Bhairavi, Puriya Dhanashri, Jaunpuri, Bhairav) — is the empirical anchor: komal Dha is *not* a single pitch. It varies systematically by raga, and its variation is reproducible and stylistically meaningful, but it does not form a 22-step grid. Their conclusion: "explaining contemporary intonation on the basis of the ancient 22-shruti system [is] a meaningless endeavour."

For makam_studio, the most honest summary is: **Hindustani performance is rooted in 12-tone identities with raga-specific, melodic-context-specific microtonal inflections of typically 10–60 cents on certain swaras, plus continuous-pitch ornaments**. This is structurally similar to the gap between Vaziri's 24-EDO theory and Farhat's measured Persian practice (see `persian-dastgah.md`).

### Bhatkhande's 10 thaats

Pandit Vishnu Narayan Bhatkhande (1860–1936) produced *Hindustani Sangeet Paddhati* in four volumes between 1909 and 1932. His project was synthetic and pedagogical: traveling extensively, interviewing ustads, transcribing bandishes, and producing the first modern Hindi-language theoretical framework for North Indian music. His **10 thaats** classify the ~150–300 ragas of practice into parent scales:

| Thaat    | Note pattern (S=Sa, P=Pa fixed; lowercase=komal; '=teevra) | Example raga(s)   | Mnemonic mood/time |
|----------|------------------------------------------------------------|-------------------|--------------------|
| Bilawal  | S R G M P D N (all shuddh)                                 | Bilawal, Alhaiya  | "Major-like," morning |
| Kalyan   | S R G M' P D N (teevra Ma)                                 | Yaman, Bhupali    | Evening, lydian-like |
| Khamaj   | S R G M P D n (komal Ni)                                   | Khamaj, Des       | Light/evening, mixolydian-like |
| Bhairav  | S r G M P d N (komal Re, komal Dha)                        | Bhairav           | Sober/devotional, dawn |
| Kafi     | S R g M P D n (komal Ga, komal Ni)                         | Kafi, Bageshri    | Dorian-like, late night |
| Asavari  | S R g M P d n (komal Ga, Dha, Ni)                          | Asavari, Darbari  | Late morning, serious |
| Bhairavi | S r g M P d n (komal Re, Ga, Dha, Ni — all "minor")        | Bhairavi          | Closing raga, deep emotion |
| Purvi    | S r G M' P d N (teevra Ma; komal Re, Dha)                  | Purvi, Puriya Dhanashri | Sunset, austere |
| Marwa    | S r G M' P D N (teevra Ma; komal Re)                       | Marwa, Puriya     | Sunset, no-Pa, austere |
| Todi     | S r g M' P d N (teevra Ma; komal Re, Ga, Dha)              | Miyan-ki-Todi     | Mid-morning, intense |

Critiques of the 10-thaat framework, well-summarized by Powers (Grove entries) and Jairazbhoy (1971):

1. **Underdetermined.** Many ragas don't fit cleanly. Raga Hindol (S G M D N) shares notes between Kalyan and Marwa; Raga Bhinna Shadja blurs Bilawal/Kalyan; numerous "mixed" ragas combine swaras from multiple thaats.
2. **Borrowed from Carnatic.** Bhatkhande's project parallels — and post-dates — Venkatamakhi's 17th-c. Carnatic *Chaturdandi Prakashika* with its mathematically complete 72 *melakarta* scheme. Hindustani didn't have an indigenous comprehensive scale-classification before Bhatkhande, who effectively imported a Carnatic-style classificatory ambition.
3. **Scale ≠ raga.** A thaat tells you which 7 notes the raga uses, but says nothing about: ārohī/avarohī shape, vādī/saṃvādī, pakaḍ, time, rasa, characteristic chalan. Two ragas in the same thaat (Yaman and Bhupali in Kalyan; Bhairav and Kalingada — both komal Re/Dha but with different pakaḍs and times) are unmistakably distinct in performance.

Despite these critiques, the 10-thaat system is the universal pedagogical default in Indian music education today — exactly the way 12-EDO is for Western music, and similarly leaky.

---

## 2. What a raga actually is

Beyond the parent thaat, a raga has:

- **Ārohī** (ascending pattern): which notes appear in ascending phrases, in what order. Ragas commonly omit a note in ascent that they include in descent (or vice versa).
- **Avarohī** (descending pattern).
- **Jāti**: the count of notes used. Sampurna (7 notes), shadav (6), audava (5). Often asymmetric — e.g., audava-sampurna means 5 ascending, 7 descending.
- **Vādī**: the "king" note, most often dwelled-on, around which improvisation gravitates.
- **Saṃvādī**: the "minister," the second-most prominent, usually a 4th or 5th from the vādī.
- **Pakaḍ**: the signature phrase that identifies the raga even out of context. A few notes in solfa — e.g., Yaman's *NRGR, NRS* — that immediately tell a listener "this is Yaman."
- **Chalan**: the characteristic movement, including which transitions are emphasized and which are forbidden (varjya).
- **Samay**: prescribed time of day (more in §6).
- **Rasa**: aesthetic mood (more in §7).
- **Vakra phrases**: zigzag movements (e.g., Darbari's *ndmpgmrs* descent rather than straightforward).
- **Forbidden notes/transitions**: a note may be allowed only in specific phrases or only in descent.
- **Andolan-bearing notes**: pitches held with a slow, wide oscillation (e.g., the komal Ga and komal Dha of Darbari).

A working definition (after Jairazbhoy and Bor): **a raga is a melodic identity recognizable to listeners trained in the tradition, defined by the joint constraints above plus countless sub-conventions transmitted by oral tradition through gharanas**. The thaat tells you almost nothing about this identity.

---

## 3. Selected major ragas

The following are the "first-ten" ragas any beginner encounters, with intervals expressed via the swara-letters above. All assume Sa as movable tonic.

### Yaman (Kalyan thaat — evening)
- **Ārohī**: N R G M' D N S' (Pa often skipped or weak in ascent)
- **Avarohī**: S' N D P M' G R S
- **Vādī**: Ga (some say Ga; some sources Ni)
- **Saṃvādī**: Ni
- **Pakaḍ**: N R G R, N R S; PRG (M')GR; the teevra Ma is the diagnostic
- **Time**: First prahar of night (sunset to ~9 PM)
- **Rasa**: Shringara (love), shanta (peace) — peaceful, romantic
- **Notes**: Often the first raga taught. Lydian-like (teevra Ma). "Yaman Kalyan" admits occasional shuddh Ma; "pure" Yaman uses only teevra Ma.

### Bhairav (Bhairav thaat — dawn)
- **Ārohī**: S r G M P d N S'
- **Avarohī**: S' N d P M G r S
- **Vādī**: Dha
- **Saṃvādī**: Re
- **Pakaḍ**: G M d, d P, G M r r S; the andolan on komal Re and komal Dha is signature
- **Time**: Pratham prahar of day (dawn, sunrise–~8 AM)
- **Rasa**: Karuna, bhakti, shanta (devotional, sober)
- **Notes**: "Hijaz-related" by interval but distinct in feel — shuddh Ma not teevra; the slow, wide oscillation on komal Re/Dha is what makes it Bhairav rather than Hijaz. Associated with Shiva.

### Bhairavi (Bhairavi thaat — late morning, but conventionally any time as closing raga)
- **Ārohī**: S r g M P d n S'
- **Avarohī**: S' n d P M g r S
- **Vādī**: Ma
- **Saṃvādī**: Sa
- **Pakaḍ**: M d n S', S' n d, P M g
- **Time**: Late morning (10 AM–12 PM) traditionally; concertically, used as the closing raga of any performance regardless of time
- **Rasa**: Karuna (compassion, pathos)
- **Notes**: All five mutable swaras komal — the "all-flat" raga. As a closing raga, performers freely use shuddh Ga, shuddh Ni, shuddh Dha for color (this is "mishra Bhairavi"). Considered the queen of morning ragas.

### Malkauns (Bhairavi thaat — late night)
- **Ārohī**: S g M d n S' (no Re, no Pa — pentatonic)
- **Avarohī**: S' n d M g M S (S g M S in some treatments)
- **Vādī**: Ma
- **Saṃvādī**: Sa
- **Pakaḍ**: d n S', g M, g M g S, M g S
- **Time**: Madhya-ratri (deep night, 12–3 AM)
- **Rasa**: Vira (heroic), serious, meditative
- **Notes**: Pentatonic. All komal where applicable. No Pa, no Re. Powerful, dark. Tanpura tuned sa-Ma-sa-sa (because no Pa).

### Bhupali (Kalyan thaat — early evening)
- **Ārohī**: S R G P D S' (no Ma, no Ni — pentatonic)
- **Avarohī**: S' D P G R S
- **Vādī**: Ga
- **Saṃvādī**: Dha
- **Pakaḍ**: G R S, R G P G, D P G R S
- **Time**: First prahar of night (early evening)
- **Rasa**: Shanta, shringara — calm, gentle
- **Notes**: Major-pentatonic-like (but in Kalyan thaat, not Bilawal — because the komal/teevra Ma is unused, the ambiguity is moot in performance; classified Kalyan by convention). Often an early-learner raga.

### Khamaj (Khamaj thaat — late evening, semi-classical)
- **Ārohī**: S G M P D N S' (komal Ni in descent only — variable)
- **Avarohī**: S' n D P M G R S
- **Vādī**: Ga
- **Saṃvādī**: Ni
- **Pakaḍ**: G M P D, M P D n, D N S'
- **Time**: Late evening
- **Rasa**: Shringara (light, romantic)
- **Notes**: Mixolydian-like. Often used in thumri, ghazal, and other semi-classical genres.

### Darbari Kanada (Asavari thaat — late night)
- **Ārohī**: S R g M P d n S' (vakra: SR, gMR; gMP)
- **Avarohī**: S' d n P, M P g M R S
- **Vādī**: Re
- **Saṃvādī**: Pa
- **Pakaḍ**: g M R S, d n P
- **Time**: Late night (after midnight)
- **Rasa**: Gambhira (gravity), karuna; deeply serious
- **Notes**: Slow, wide andolan on komal Ga and komal Dha — these notes are *never* held steady; they always oscillate. Tansen association (legendary court of Akbar). The slow-andolan komal Ga is one of the most unmistakable sounds in Hindustani music.

### Marwa (Marwa thaat — sunset)
- **Ārohī**: N r G M' D N S' (Pa omitted entirely; Sa de-emphasized)
- **Avarohī**: S' N D M' G r S (or D M' G r N r S)
- **Vādī**: Re (komal)
- **Saṃvādī**: Dha
- **Pakaḍ**: D M' G r, N r S
- **Time**: Sunset (last prahar of day, ~5–7 PM)
- **Rasa**: Austere, restless, twilight unease
- **Notes**: No Pa. Sa is so de-emphasized that some treatments say the "tonic" is effectively Dha. The teevra Ma + komal Re + missing Pa makes Marwa unmistakable — there's nothing else like it.

### Miyan-ki-Todi (Todi thaat — mid-morning)
- **Ārohī**: S r g M' P d N S' (sometimes vakra: Sr g, M'd N)
- **Avarohī**: S' N d P M' g r S
- **Vādī**: Dha (komal)
- **Saṃvādī**: Ga (komal)
- **Pakaḍ**: d N S', r g r S; M' d N S'
- **Time**: Mid-morning (~9 AM–12 PM)
- **Rasa**: Karuna, intense, almost crying
- **Notes**: Three komals (r, g, d) plus teevra Ma — maximum dissonance among "main" ragas. The classic raga where 22-shruti partisans claim raga-specific microtonal inflections are most audible: the komal Re and komal Ga are alleged to be lower than in other ragas. Empirical measurements (van der Meer) confirm raga-specific tendencies but not 22-step grid.

### Bageshri (Kafi thaat — late night)
- **Ārohī**: S g M D n S' (Pa weak/omitted in ascent; Re weak)
- **Avarohī**: S' n D M, g M g R S
- **Vādī**: Ma
- **Saṃvādī**: Sa
- **Pakaḍ**: M D n D, M g R S
- **Time**: Late night (~12–3 AM)
- **Rasa**: Shringara (longing, romantic)
- **Notes**: Re very weak; Pa weak in ascent. "Romantic" association strong in performance reception.

These ten alone — a v1.5 makam_studio shipping list — illustrate how thin the "scale" view of raga is. Yaman and Bhupali both live in Kalyan thaat with shuddh ambiguity, but they sound nothing alike. Bhairav and Kalingada both have komal Re/Dha and Bhairav thaat, but differ in vādī and pakaḍ. Marwa and Puriya share thaat and most notes; only chalan and emphasis distinguish them.

---

## 4. Khayal as the dominant vocal genre

### From dhrupad to khayal

**Dhrupad** is the older (12th–17th c.) North Indian classical vocal genre — solemn, austere, slow, devotional, with a four-part structure (sthayi-antara-sanchari-abhog), accompanied by pakhawaj drum and tanpura, performed traditionally by male singers in temple or court settings. Tansen (c. 1500–1589), legendary musician at Akbar's court, was a dhrupadiya (likely Dagar-bani lineage). Dhrupad emphasizes alāp (unmetered raga exposition) and bandiśh in chautal or other slow tals; ornamentation is restrained and gamak-heavy.

**Khayal** (Persian *khayāl*, "imagination") emerged in the 14th–15th c. (some traditions credit Amir Khusrau) but became dominant only in the 18th c. The conventional codifiers are **Niamat Khan "Sadarang"** (c. 1670–1748) and his nephew Firoz Khan "Adarang," court musicians of Mughal emperor Muhammad Shah Rangile (r. 1719–1748). Sadarang composed numerous bandishes, established the structural template, and trained the first major lineage of khayal singers (whose disciples founded several of the 19th-c. gharanas).

By the late 19th c., khayal had eclipsed dhrupad as the main concert genre, though dhrupad survives as a revivalist tradition (Dagar brothers, Gundecha brothers).

### Anatomy of a khayal performance

Bonnie Wade's *Khyāl* (1984) is the canonical English-language monograph. A modern khayal performance comprises:

1. **Bada khyal** (literally "big" khyal) in **vilambit laya** (slow tempo, often 12–40 BPM with a long tala cycle of 12 or 16 beats — ektal at vilambit feels like a 60-second cycle). Built on a vilambit bandiśh — a fixed composition of two parts, sthayi (recurring main theme) and antara (counter-theme). The singer expounds the raga through:
   - **Alāp / vistaar** — slow, unmetered or loosely-metered melodic expansion, building from low register upward.
   - **Bol-ālāp** — alāp using the words of the bandiśh.
   - **Bol-bant** — rhythmic play with the words.
   - **Sargam** — improvisation in solfa syllables (S R G M P D N).
   - **Tāns** — fast melismatic runs that resolve on the sam (downbeat).
2. **Chhota khyal** (literally "small" khyal) in **drut laya** (fast tempo, 200+ BPM, often in fast tintal or ektal). Built on a separate fast bandiśh. Same elaboration tools, but compressed and accelerated; tāns become the centerpiece.

A full khayal can run 30–90 minutes for the bada khyal alone, plus 10–20 for the chhota — far longer than dhrupad's 20–40 minutes. The structural arc — slow exposition, gradual acceleration, climactic resolution — has clear parallels to maqam taqsīm and Persian dastgāh performance shape (āghāz / oj / forud), but with the harmonic ground of the tanpura constantly present.

### Talas

Common khayal talas:
- **Tintāl / Trital**: 16 matras, 4+4+4+4. Theka: *Dha Dhin Dhin Dha | Dha Dhin Dhin Dha | Dha Tin Tin Ta | Ta Dhin Dhin Dha*.
- **Ektāl**: 12 matras, 2+2+2+2+2+2. Common in vilambit, where each beat may stretch to 4–5 seconds.
- **Jhumra**: 14 matras, 3+4+3+4. Vilambit specialty.
- **Tilwāḍā**: 16 matras, 4+4+4+4 (different bols from tintal). Vilambit specialty.
- **Jhaptāl**: 10 matras, 2+3+2+3.
- **Rūpak**: 7 matras, 3+2+2; starts on khali (not sam).
- **Aḍacautāl**: 14 matras.

Tabla accompaniment plays the theka (basic pattern) most of the time, with shorter solo interludes negotiated with the singer.

### Ensemble

A standard khayal ensemble:
- **Lead voice** (the khayal singer).
- **Tanpura** (drone, usually two — one tuned higher, one lower; often played by accompanists or students).
- **Tabla** (rhythm).
- **Sarangi** OR **harmonium** (melodic accompaniment, "shadowing" the voice).

The sarangi/harmonium choice is loaded (see §3 of instruments below). Sarangi is preferred by purists because it can meend; harmonium has dominated since the early 20th c. because it's portable and easier to play, but its 12-EDO fixed pitch is the focus of the harmonium controversy (§7).

---

## 5. Gharanas — the lineage system

A **gharana** (literally "household") is a stylistic + genealogical lineage. To belong to a gharana, you must (traditionally) either be a blood descendant of its founder or have undergone many years of guru-shishya-parampara training under a recognized lineage holder (a *talim* of decades, with formal *ganda-bandhan* initiation). Daniel Neuman's *The Life of Music in North India* (1980) is the canonical sociological study; he documents the gharana system as a finely-tuned organization of specialized knowledge with many parallels to guild systems.

The system is **patrilineal** in most cases (Muslim ustad lineages especially), with women historically marginalized as performers (though the 20th c. saw major women khayalists: Kesarbai Kerkar, Mogubai Kurdikar, Kishori Amonkar, Hirabai Barodekar, Gangubai Hangal). The **Hindu/Muslim cross-influence** is structural, not incidental: most ustad lineages are Muslim (descended from court musicians of Mughal and successor Hindu princely courts); the patronage chain runs through Mughal emperors, Hindu maharajas, and post-Independence All India Radio. Many compositions are in Brajbhasha (Hindu devotional language) sung by Muslim musicians; the syncretic *ganga-jamuni tehzeeb* of the courts is integral to khayal's identity. Erasing either side falsifies the history.

The major khayal gharanas:

**Gwalior gharana**. The oldest. Often called the "mother" of khayal gharanas. Codified at the court of Gwalior (Madhya Pradesh) in the early 19th c. by Haddu, Hassu, and Nathu Khan. Style: clarity of swara, balanced ornamentation, methodical raga exposition, dhrupad-derived gamak with khayal-style tāns, full-throated voice. Exemplars: V.D. Paluskar (founder of Gandharva Mahavidyalaya, parallel theorist to Bhatkhande), Krishnarao Shankar Pandit, Omkarnath Thakur, Veena Sahasrabuddhe.

**Agra gharana**. Founded in the 18th c., consolidated by Faiyaz Khan (1886–1950). Style: bold, full-throated, robust voice production; favors low register (mandra); dhrupadic origins evident in extensive use of broad gamak and meend; emphasis on bandiśh exposition (*nom-tom alāp* before bol-ālāp). Exemplars: Faiyaz Khan, Sharafat Hussain Khan, K.G. Ginde.

**Kirana gharana**. Founded in the late 19th–early 20th c. by Abdul Karim Khan (1872–1937) and his cousin Abdul Wahid Khan. Style: meditative, slow, swara-purity-centered, extensive meend, emotional depth; ornamental restraint; tones held long. Exemplars: Abdul Karim Khan, Sawai Gandharva, Bhimsen Joshi (perhaps the most famous khayal singer of the 20th c.), Gangubai Hangal, Hirabai Barodekar.

**Patiala gharana**. Founded by Fateh Ali Khan and Ali Baksh "Jarnail" Khan in late 19th c. at Patiala court. Codified by Bade Ghulam Ali Khan (1902–1968). Style: vivacious, decorative, fast tāns, intricate melismas, smooth high-low transitions, light-classical (thumri, ghazal) integration. Exemplars: Bade Ghulam Ali Khan, Barkat Ali Khan, Ajoy Chakrabarty.

**Jaipur-Atrauli gharana**. Founded in the late 19th c. by Alladiya Khan (1855–1946). Style: intellectually sophisticated, technically precise, austere; preference for rare/complex ragas (Nat Bhairav, Sampurna Malkauns, Hindolat); intricate layakari (rhythmic complexity); long, architectural raga elaboration. Exemplars: Alladiya Khan, Kesarbai Kerkar, Mogubai Kurdikar, Kishori Amonkar (a major reformer who incorporated Bhakti aesthetics).

**Bhendi Bazaar gharana**. Founded ca. 1890 in Mumbai by brothers Chhajju Khan, Nazir Khan, and Khadim Hussain Khan. Style: technical mastery of breath control, long-line phrasing, sargam virtuosity, blended Carnatic and Hindustani elements. Exemplars: Aman Ali Khan (whose style influenced Amir Khan), Anjanibai Malpekar, Suhasini Mulgaonkar.

**Mewati gharana**. Founded in the late 19th c. by Ghagge Nazir Khan and Wahid Khan at the Holkar court of Indore. Style: emphasis on bhakti rasa (devotional emotion), use of khayal as quasi-spiritual practice, integration of Krishna-bhakti compositions. Exemplars: Pandit Jasraj (1930–2020) is the gharana's most globally recognized voice.

**Indore gharana**. Founded by Amir Khan (1912–1974), who synthesized elements of Bhendi Bazaar (his early training under Aman Ali Khan), Kirana (slowness, swara-purity), and his own merukhand-based improvisational mathematics. Style: extreme vilambit, precise sargam, spacious phrasing, "intellectual" khayal. Exemplars: Amir Khan, Amarnath, Akhtar Sadmani, Kankana Banerjee.

A few features cut across gharanas: the importance of *bandiśh* over improvisation in some (Agra, Gwalior), of improvisation over bandiśh in others (Kirana, Indore); the role of *tān* virtuosity (Patiala, Jaipur-Atrauli) versus restraint (Kirana, Mewati); the preference for low-register (Agra) versus mid-to-high register (Kirana, Patiala).

The 20th c. saw partial *deterritorialization* of gharanas: All India Radio, recordings, and migration to metropolitan centers (Mumbai, Pune, Delhi, Kolkata) made multi-gharana training common, and modern singers often draw from several styles. Purists lament this; pragmatists call it healthy evolution.

---

## 6. Time-of-day (samay) — the prahar system

Hindustani prescribes a specific time of day for each raga. The day is divided into **8 prahar** (each ~3 hours):

| Prahar    | Time           | Example ragas                              |
|-----------|----------------|--------------------------------------------|
| 1st day   | ~6–9 AM        | Bhairav, Ramkali, Lalit, Kalingada         |
| 2nd day   | ~9 AM–12 PM    | Todi, Bhairavi, Bilawal, Asavari, Komal Rishabh Asavari |
| 3rd day   | ~12–3 PM       | Bhimpalasi, Sarang, Madhuvanti, Multani    |
| 4th day   | ~3–6 PM        | Bhimpalasi, Patdeep, Madhuvanti            |
| 1st night | ~6–9 PM        | Yaman, Bhupali, Marwa, Purvi, Puriya       |
| 2nd night | ~9 PM–12 AM    | Bageshri, Khamaj, Des, Hamir, Kedar        |
| 3rd night | ~12–3 AM       | Malkauns, Darbari, Bageshri, Adana, Kanada |
| 4th night | ~3–6 AM        | Lalit, Paraj, Bhatiyar                     |

The system is itself contested. Powers (Grove) and Slawek (in Garland Encyclopedia, Hindustani volume) note that the time-theory was systematized by Bhatkhande himself; pre-modern treatises (the *Sangita Ratnakara* of Sharngadeva, 13th c.) mention seasonal but not always time-of-day associations; Nanyabhupala (c. 12th c.) is sometimes cited as the earliest source linking ragas to *yamas* (~3-hour periods). In modern concert practice, time-rules are honored in the breach: a 9 PM concert may begin with a Yaman (correct), continue with a Bageshri (correct), and end with a Bhairavi (technically morning, but ritually accepted as the closing raga regardless of time).

For makam_studio: time-of-day is a UX-surfaceable metadata layer that makes the tool feel rooted in tradition without committing the engine to enforce it. (Cross-tradition note: Arab maqam has loose time/season associations but nothing like the systematic prahar grid; Persian dastgāh has even less.)

---

## 7. Instruments and pitch

### Tanpura — the drone

The tanpura is a 4–5-stringed long-necked lute, plucked continuously to produce an unbroken drone of the tonic-and-fifth (or tonic-and-fourth, or tonic-and-seventh, depending on the raga). Standard tunings:

- **Sa-Pa-Sa-Sa** (most common): 5–8–8–1 in scale degrees; the fifth string plays Pa (5th), strings 2–3 play upper Sa (8va), string 4 plays the fundamental Sa.
- **Sa-Ma-Sa-Sa**: for ragas without Pa (Marwa, Malkauns).
- **Sa-Ni-Sa-Sa** or **Sa-Dha-Sa-Sa**: for some unusual ragas.

The **jivari** — the cotton thread placed under the strings on the bridge — produces a buzzing, harmonic-rich drone where the upper partials are unusually present. The drone is not a clean sine; it's a dense harmonic field. This is acoustically critical: the drone provides not just a tonic reference but a constant harmonic context that *shapes pitch perception*. Performers tune their swaras against the drone's overtone structure; what the listener perceives as "in tune" is partially constructed by the drone's harmonics.

For makam_studio: a tanpura drone module is non-trivial but tractable. A plausible architecture:
- 4 plucked-string voices (Karplus-Strong or modal synthesis).
- Per-voice slow attack envelope (~100ms), long decay (~3–5 s), small inter-pluck variation in attack time.
- A "jivari" parameter that boosts and detunes upper partials.
- Tunable to Sa-Pa, Sa-Ma, Sa-Ni etc.
- Tempo (pluck rate) ~1 Hz (one cycle of all 4 strings per ~3–5 seconds).

The BeatForge Karplus-Strong code (per `web-audio-plucked-string-synthesis.md`) is a starting point.

### Sarangi

The sarangi is a short-necked bowed lute with three main playing strings (gut) and ~35 sympathetic resonance strings underneath. It is **the most vocal of Hindustani instruments**: its tone, articulation, and meend-capability mimic the human voice with uncanny fidelity. Sarangi players were the traditional accompanists for khayal singers — they "shadow" the vocal line, often anticipating phrases through long association. Sarangi-playing was historically associated with courtesan-class musicians, which led to social stigma and a decline in the instrument's status; the harmonium displaced it for accompaniment in the 20th c. The 1970s–2010s saw a sarangi revival driven by Sultan Khan, Ram Narayan, and Murad Ali Khan among others.

### Sitar, sarod

Plucked lutes. **Sitar** (long-necked, movable frets, ~6–7 main strings + ~13 sympathetic strings) is the most globally recognized Hindustani instrument, codified by Vilayat Khan and Ravi Shankar. **Sarod** (fretless, metal fingerboard, gut-and-metal strings) is structurally similar but un-fretted, allowing continuous-pitch meend; codified by Ali Akbar Khan and Amjad Ali Khan. Both use **meend** (slide) extensively — the left-hand pulls the string laterally across the fretboard (sitar) or slides along the fingerboard (sarod) to glide through pitches without re-articulating.

### Bansuri

Bamboo transverse flute, 6–7 finger holes. Pitch is flexed by partial-hole-covering and embouchure adjustment, allowing meend and microtonal inflection. Codified by Pannalal Ghosh and Hariprasad Chaurasia.

### Tabla

Pair of small drums (right-hand dayan, tuned to the Sa or Pa; left-hand bayan, providing variable bass). Bols (syllables) such as *Dha, Dhin, Tin, Ta, Na, Ge, Ke, Tirakita* structure rhythm. Pitch on the tabla is real (the dayan is tuned), but the role is rhythmic — pitch shifts on the bayan provide expressive emphasis but don't carry melodic content.

### Harmonium — the controversy

The harmonium is a hand-pumped reed organ introduced to India by European missionaries in the mid-19th c. It became extremely popular as accompaniment because: (1) portable; (2) loud enough for outdoor performance; (3) easier to learn than sarangi; (4) one player can accompany themselves while singing.

It is also, problematically, **fixed at 12-EDO** (or close: most harmoniums use a tempering very near 12-EDO, sometimes very slightly compromised). It cannot meend. It cannot inflect a single swara to be slightly higher in one raga and slightly lower in another. In a tradition where raga-specific microtonal inflection is integral to identity, the harmonium is an active accomplice to the flattening of intonation.

The result: a long-running political-musicological battle. **All India Radio banned the harmonium in 1940** (effective until 1971), driven by Rabindranath Tagore, A.H. Fox-Strangways, K.B. Deval, and Ananda Coomaraswamy, who argued the instrument was anti-shruti, foreign, and corrupting. The ban also had nationalist coloring (anti-colonial, pro-indigenous-instrument). In 1971, the ban was partially lifted; today harmonium is the default accompaniment for most khayal performances, and the controversy is largely (though not entirely) historical.

For makam_studio, the harmonium debate is a **direct analog of the qanun/santur 12-EDO problem in our own design**: a fixed-pitch instrument is *easier to deploy* but *forecloses microtonal honesty*. Our piano-canonical UI is similarly compromised; the path through is to expose per-degree microtonal sliders, not to pretend 12-EDO is sufficient.

---

## 8. Bibliography priorities — which sources to anchor in

Wave-2 priorities for any future Hindustani-related work in makam_studio:

**Primary historical sources:**
- Bhatkhande, *Hindustani Sangeet Paddhati* (4 vols., 1909–1932; multiple Hindi editions, partial English).
- Bhatkhande, *Kramik Pustak Malika* (6 vols., catalog of 1,800+ bandishes with notation).
- Bharata, *Natyashastra* (Manomohan Ghosh translation, Asiatic Society, 1950–1961).
- Sharngadeva, *Sangita Ratnakara* (13th c.; Subhadra Chaudhary translation).

**Modern English academic anchors:**
- Jairazbhoy 1971 — the canonical English structural study of ragas, with the strongest critique of the 22-shruti theory.
- Bor 1999 — *The Raga Guide* (Nimbus Records), 74 ragas with notation and recordings, the practical reference.
- Wade 1984 — *Khyāl* (Cambridge), the canonical English monograph on khayal as genre.
- Powers — Grove Music Online entries ("India," "Raga," "Hindustani music," "Tāla"); *The Background of the South Indian Raga System* (1958, dissertation; 1979 monograph).
- Neuman 1980 — *The Life of Music in North India*, the sociology of gharanas.
- Slawek 1987 — *Sitar Technique in Nibaddh Forms*; Garland Encyclopedia chapters on Hindustani instrumental music.
- Rowell 1992 — *Music and Musical Thought in Early India*, ancient theory through ~13th c.
- Farrell 1997 — *Indian Music and the West*.
- Wade 1998 — *Imaging Sound: An Ethnomusicological Study of Music, Art, and Culture in Mughal India*.

**Empirical pitch / computational musicology:**
- van der Meer 2000 — "The Construction, Reconstruction, and Deconstruction of Shruti."
- Rao & van der Meer 2010 — "Theory and Practice of Intonation in Hindustani Music."
- Krishnaswamy 2003 — "On the Twelve Basic Intervals in South Indian Classical Music."
- Bel & Bor (Music in Motion project, 1980s–) — early measurement work.
- Ross, Vinutha & Rao (IIT Bombay group, 2010s–) — melodic motif detection.
- Gulati, Serra, Ishwar & Rao 2016 — pitch histograms and raga recognition.

**Histories of gharanas + khayal:**
- Rāmeshwar Sharmā 1979 — *Gharanedar Gayaki*.
- Daniel Neuman 1990 — "Indian Music as a Cultural System."
- Lakshmi Subramanian 2006 — *From the Tanjore Court to the Madras Music Academy*.
- Janaki Bakhle 2005 — *Two Men and Music* (on Bhatkhande and Paluskar's modernizing projects).
- Allyn Miner 1993 — *Sitar and Sarod in the 18th and 19th Centuries*.

For makam_studio's purposes, the trio of **Bor 1999** (practical raga reference), **Jairazbhoy 1971** (structural theory + intonation critique), and **Rao & van der Meer 2010** (measured pitch in performance) form a sufficient working triangle.

---

## Implications for makam_studio

1. **Hindustani is structurally similar to Persian dastgāh: a thaat (or dastgāh) is not a scale.** The same per-string microtonal slider design we'd build for Persian generalizes to Hindustani komal Re of Bhairav vs. komal Re of Bhairavi. **Reuse the dastgāh slider architecture** for Hindustani if/when we ship it.

2. **Should v1 ship Hindustani at all?** Two honest options:
   - **Defer entirely.** Ship maqam (Arab/Turkish/Persian/Egyptian/Azeri) in v1; revisit Hindustani in v2 with proper drone module + microtonal sliders + time-of-day metadata + raga-specific intonation profiles.
   - **Ship a modest 5–10 raga subset in v1.5** as scales-only, with prominent UI disclaimers ("the raga is more than this scale — see notes on pakaḍ, vādī, time"). The Yaman-Bhairav-Bhupali-Khamaj-Bhairavi-Malkauns-Darbari-Marwa-Todi-Bageshri set above is a plausible starter list.

   **Recommendation: defer to v1.5 minimum.** Hindustani-without-drone is misleading; Hindustani-with-drone needs a tanpura module, which is a substantial audio-engine increment.

3. **The tanpura drone is non-optional for honest Hindustani.** Building it is mostly tractable using the BeatForge Karplus-Strong fork (see `web-audio-plucked-string-synthesis.md`):
   - 4 plucked voices (Karplus-Strong with jivari-style upper-partial enhancement).
   - Slow rolling pattern (Pa–Sa–Sa–Sa or Ma–Sa–Sa–Sa over ~3–5 s).
   - Tunable per raga.
   - This is also a useful general feature: optional drone for Arab/Turkish settings (some Sufi traditions use ney/tanbur drone), for Persian ney drone, for Western "modal" practice.

4. **Time-of-day (samay) metadata is a UX win.** A sun-position widget that highlights "morning" / "evening" / "late night" ragas is a small surface change with high user-feedback value, and it generalizes back to maqam (some Arab/Turkish maqams have loose time/season associations: Hijaz with mourning, Saba with sorrow, Rast with morning).

5. **Should the project be renamed?** "Makam_studio" denotes Middle-Eastern modal practice, not South Asian. If we ship Hindustani, the name becomes inaccurate. Options:
   - **Stay narrow.** Keep makam_studio focused on maqam (Arab/Turkish/Persian/Azeri/Egyptian); defer Hindustani indefinitely. Most-honest path; smallest scope.
   - **Rename.** Something like *modal_studio*, *raga_makam*, *intonation_lab*, or a new identity entirely. Worth flagging for product/founder discussion.
   - **Keep the name, ship Hindustani as an explicit "extension."** Pragmatic but linguistically-imperfect.

6. **Empirical pitch data exists.** If we want raga-specific intonation profiles, the Rao & van der Meer measurements, the Music in Motion corpus, and the IIT-Bombay computational-musicology group's published pitch histograms (CompMusic, TISMIR papers) are usable references for setting per-raga, per-degree cents offsets. This is more effort than 12-EDO presets but significantly more honest.

7. **Cross-tradition design payoff.** Building Hindustani support generalizes the engine: drone module, microtonal sliders, time-of-day metadata, and raga/dastgāh/maqam-as-richer-than-scale data model are all features that improve every tradition we ship, not just Hindustani.

---

## Open questions

1. **What is the right v1 scope?** Maqam-only seems safest; 5-raga v1.5 risks misleading users about what a raga is.
2. **How do we represent raga "more than scale"?** A pakaḍ field is straightforward; a chalan or "characteristic phrases" field is harder. Some kind of per-raga "exemplar audio loop" might be the most honest UX — let users hear the difference between Yaman-as-scale and Yaman-as-played.
3. **What microtonal-inflection data set do we use?** The Rao/van der Meer figures cover ~5 ragas in detail; the Music in Motion / CompMusic corpus is broader but unevenly annotated. Do we hand-curate cents offsets per raga, or do we ship a generic "shuddh/komal/teevra" 12-EDO model with a "performance-honest mode" toggle?
4. **What is the smallest viable tanpura module?** 4 voices + jivari-modeling + tuning options is a reasonable v1; it shares ~70% of code with a generic plucked-string synth.
5. **Naming.** If the project ships Hindustani — rename, keep, or fork into a sibling?
6. **Carnatic?** South Indian classical (72 melakarta, ragam-tanam-pallavi, kriti structure) is a sibling tradition with overlap (raga, drone, gamakam) and major differences (gamakam-as-mandatory-pitch-deviation, 72-mela completeness, kriti-centered repertoire). If we ship Hindustani, a sibling Carnatic chapter feels natural; if we don't, deferring both is more coherent.
7. **Khayal as performance template, not just modal preset.** Arab taqsīm, Persian dastgāh-performance, Turkish makam-taksim, and khayal all share an arc: slow exposition → ascending tension → climactic resolution. Could makam_studio surface a "performance template" UI affordance — a structural arc that adapts per tradition? Probably out of scope for v1 but worth flagging.

---

## Sources

- [Vishnu Narayan Bhatkhande — Wikipedia](https://en.wikipedia.org/wiki/Vishnu_Narayan_Bhatkhande)
- [Thaat — Wikipedia](https://en.wikipedia.org/wiki/Thaat)
- [Khyal — Wikipedia](https://en.wikipedia.org/wiki/Khyal)
- [Bhairav (raga) — Wikipedia](https://en.wikipedia.org/wiki/Bhairav_(raga))
- [Bhairavi (Hindustani) — Wikipedia](https://en.wikipedia.org/wiki/Bhairavi_(Hindustani))
- [Bhoopali — Wikipedia](https://en.wikipedia.org/wiki/Bhoopali)
- [Tanpura — Wikipedia](https://en.wikipedia.org/wiki/Tanpura)
- [Indian harmonium — Wikipedia](https://en.wikipedia.org/wiki/Indian_harmonium)
- [Sadarang — Wikipedia](https://en.wikipedia.org/wiki/Sadarang)
- [Tansen — Wikipedia](https://en.wikipedia.org/wiki/Tansen)
- [Dhrupad — Wikipedia](https://en.wikipedia.org/wiki/Dhrupad)
- [Gharana — Wikipedia](https://en.wikipedia.org/wiki/Gharana)
- [Agra gharana — Wikipedia](https://en.wikipedia.org/wiki/Agra_gharana)
- [Bhendibazaar gharana — Wikipedia](https://en.wikipedia.org/wiki/Bhendibazaar_gharana)
- [Mewati gharana — Wikipedia](https://en.wikipedia.org/wiki/Mewati_gharana)
- [Teental — Wikipedia](https://en.wikipedia.org/wiki/Teental)
- [Prahar — Wikipedia](https://en.wikipedia.org/wiki/Prahar)
- [Shruti (music) — Wikipedia](https://en.wikipedia.org/wiki/Shruti_(music))
- [Natya Shastra — Wikipedia](https://en.wikipedia.org/wiki/Natya_Shastra)
- [Rasa (aesthetics) — Wikipedia](https://en.wikipedia.org/wiki/Rasa_(aesthetics))
- [Melakarta — Wikipedia](https://en.wikipedia.org/wiki/Melakarta)
- [The Raga Guide — Wikipedia](https://en.wikipedia.org/wiki/The_Raga_Guide)
- [Jairazbhoy, *The Rags of North Indian Music* (Internet Archive)](https://archive.org/details/ragsofnorthindia00jair)
- [Wade, *Khyal* (Cambridge, 1984) — Google Books](https://books.google.com/books/about/Khyal.html?id=MiE9AAAAIAAJ)
- [Neuman, *The Life of Music in North India* (Chicago)](https://press.uchicago.edu/ucp/books/book/chicago/L/bo3627509.html)
- [Rowell, *Music and Musical Thought in Early India* (Chicago)](https://press.uchicago.edu/ucp/books/book/chicago/M/bo3612674.html)
- [van der Meer, "The Construction, Reconstruction, and Deconstruction of Shruti"](https://www.academia.edu/40292422/The_Construction_Reconstruction_and_Deconstruction_of_Shruti)
- [Rao & van der Meer, "Theory and Practice of Intonation in Hindustani Music"](https://www.academia.edu/3427820/Theory_and_Practice_of_Intonation_in_Hindustani_Music)
- [van der Meer, "Microtonality in Indian Music: Myth or Reality"](https://www.academia.edu/2343949/Microtonality_in_Indian_Music_Myth_or_Reality)
- [Music in Motion / Automated Transcription for Indian Music](https://autrimncpa.wordpress.com/)
- [Slawek, "Hindustani Instrumental Music" (Garland Encyclopedia)](https://music.arts.uci.edu/abauer/148_2018/readings/Slawek_Hindustani_Instrumental_Music_Garland.pdf)
- [Powers, "Theory and Practice in the Study of Indian Music" (Society for Ethnomusicology)](https://cdn.ymaws.com/www.ethnomusicology.org/resource/resmgr/Files/Symposium_1963_02_Powers.pdf)
- [Khayal — Britannica](https://www.britannica.com/art/khayal)
- [Ragakosh: Yaman](https://ragakosh.com/raga/yaman)
- [Ragakosh: Malkauns](https://ragakosh.com/raga/malkauns)
- [Ragakosh: Bhairavi](https://ragakosh.com/raga/bhairavi)
- [Ragakosh: Darbari](https://ragakosh.com/raga/darbari)
- [Ross et al., "Distinguishing Raga-Specific Intonation of Phrases" (Semantic Scholar)](https://www.semanticscholar.org/paper/DISTINGUISHING-RAGA-SPECIFIC-INTONATION-OF-PHRASES-Rao-Ross/be7035fcd01c36470745a25381b52d91794cced3)
- [Gulati et al., "On the Distributional Representation of Ragas" (TISMIR)](https://transactions.ismir.net/articles/10.5334/tismir.11)
- [Rahaim, "That Bane of Indian Music" (Journal of Asian Studies — harmonium)](https://www.cambridge.org/core/journals/journal-of-asian-studies/article/abs/that-bane-of-indian-music-hearing-politics-in-the-harmonium/7A9AC6197EF4E1395E02591FE1C0DAB5)
- [Tanpura Samples — Raga Junglism](https://ragajunglism.org/ragas/tanpuras/)
- [Bhatkhande's *Hindustani Sangeet Paddhati* (Internet Archive)](https://archive.org/details/in.ernet.dli.2015.326018)

---

## References (Chicago author-date)

- Bakhle, Janaki. 2005. *Two Men and Music: Nationalism in the Making of an Indian Classical Tradition*. Oxford University Press.
- Bhatkhande, Vishnu Narayan. 1909–1932. *Hindustani Sangeet Paddhati*. 4 vols. Sangeet Karyalaya, Hathras (multiple later editions).
- Bhatkhande, Vishnu Narayan. 1937–1958. *Kramik Pustak Malika*. 6 vols. Sangeet Karyalaya, Hathras.
- Bharata. c. 200 BCE – 200 CE. *Natyashastra*. Translated by Manomohan Ghosh, 2 vols. Calcutta: Asiatic Society of Bengal, 1950–1961.
- Bor, Joep, ed. 1999. *The Raga Guide: A Survey of 74 Hindustani Ragas*. With Suvarnalata Rao, Wim van der Meer, and Jane Harvey. Monmouth: Nimbus Records / Rotterdam Conservatory of Music.
- Clayton, Martin. 2000. *Time in Indian Music: Rhythm, Metre, and Form in North Indian Rāg Performance*. Oxford: Oxford University Press.
- Farrell, Gerry. 1997. *Indian Music and the West*. Oxford: Clarendon Press.
- Gulati, Sankalp, Joan Serra, Vignesh Ishwar, and Preeti Rao. 2016. "Phrase-based Raga Recognition Using Vector Space Modeling." *IEEE ICASSP*.
- Jairazbhoy, Nazir Ali. 1971. *The Rags of North Indian Music: Their Structure and Evolution*. London: Faber and Faber. (Reprinted Bombay: Popular Prakashan, 1995.)
- Krishnaswamy, Arvindh. 2003. "On the Twelve Basic Intervals in South Indian Classical Music." *AES 115th Convention*.
- Miner, Allyn. 1993. *Sitar and Sarod in the 18th and 19th Centuries*. Wilhelmshaven: Florian Noetzel.
- Neuman, Daniel M. 1980. *The Life of Music in North India: The Organization of an Artistic Tradition*. Detroit: Wayne State University Press. (2nd ed., Chicago: University of Chicago Press, 1990.)
- Neuman, Daniel M. 1990. "Indian Music as a Cultural System." *Asian Music* 17 (2): 98–113.
- Powers, Harold S. 1958. *The Background of the South Indian Raga-System*. Ph.D. diss., Princeton University.
- Powers, Harold S. 1980. "India, §III: Theory and Practice of Classical Music." In *The New Grove Dictionary of Music and Musicians*. London: Macmillan. (Updated in subsequent editions; Grove Music Online.)
- Rahaim, Matthew. 2011. "That Ban(e) of Indian Music: Hearing Politics in the Harmonium." *The Journal of Asian Studies* 70 (3): 657–682.
- Rao, Suvarnalata, and Wim van der Meer. 2010. "The Construction, Reconstruction, and Deconstruction of Shruti." In *Hindustani Music: Thirteenth to Twentieth Centuries*, edited by Joep Bor, Françoise Delvoye, Jane Harvey, and Emmie te Nijenhuis, 673–696. New Delhi: Manohar.
- Rao, Suvarnalata, and Wim van der Meer. 2010. "Theory and Practice of Intonation in Hindustani Music." In *The Ratio Book*, edited by C. Barlow. Feedback Studio Verlag.
- Ross, Joel C., T. P. Vinutha, and Preeti Rao. 2012. "Detecting Melodic Motifs from Audio for Hindustani Classical Music." *ISMIR*.
- Rowell, Lewis. 1992. *Music and Musical Thought in Early India*. Chicago: University of Chicago Press.
- Sharngadeva. 13th c. *Sangita Ratnakara*. Translated by R.K. Shringy and Prem Lata Sharma, 2 vols. Delhi: Motilal Banarsidass, 1978–1989.
- Slawek, Stephen. 1987. *Sitar Technique in Nibaddh Forms*. Delhi: Motilal Banarsidass.
- Slawek, Stephen. 2000. "Hindustani Instrumental Music." In *The Garland Encyclopedia of World Music, Volume 5: South Asia: The Indian Subcontinent*, edited by Alison Arnold, 188–208. New York: Garland.
- Subramanian, Lakshmi. 2006. *From the Tanjore Court to the Madras Music Academy*. New Delhi: Oxford University Press.
- van der Meer, Wim. 1980. *Hindustani Music in the 20th Century*. The Hague: Martinus Nijhoff.
- van der Meer, Wim. 2000. "Microtonality in Indian Music: Myth or Reality?" Paper, Frankfurt; subsequently published in *Hindustani Music: Thirteenth to Twentieth Centuries* (Bor et al., eds., 2010).
- Wade, Bonnie C. 1984. *Khyāl: Creativity Within North India's Classical Music Tradition*. Cambridge Studies in Ethnomusicology. Cambridge: Cambridge University Press.
- Wade, Bonnie C. 1998. *Imaging Sound: An Ethnomusicological Study of Music, Art, and Culture in Mughal India*. Chicago: University of Chicago Press.
