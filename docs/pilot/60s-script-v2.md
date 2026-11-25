# Pilot-Skript V2 – „Hurricanes: Powered by the Ocean“ (2026-Fassung)

**BlueDotAtlas · Nacharbeit zur 048-Abnahme ([Issue #72](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/72)) · Stand 25.11.2026**
**Status:** Text und Aufhänger vom Betreiber freigegeben („ja, freigabe“, 25.11.2026). Es handelt sich um eine **Planung**: Render, TTS, neue Medien und Veröffentlichung sind damit **nicht** freigegeben.
**Maschinenlesbar:** [`60s-script-v2.scene.json`](60s-script-v2.scene.json), gültig nach dem [Scene-Director-Vertrag V1 (049)](../../packages/core/scene-schema/v1/README.md). Der Test `packages/core/tests/pilot-script-v2.test.mjs` prüft dazu die messbaren [Story-Regeln (050)](../video/scene-director-rules.md).

## Dramaturgie und Text (Englisch, 75 Wörter)

| Zeit | Beat | Bild | Sprechtext |
| --- | --- | --- | --- |
| 0–2,5 s | Intro | Brand-Intro | – |
| 2,5–6 s | Ankommen | Erde aus dem Orbit (ISS), Vollbild, Push-in | *(nur Musik)* |
| 6–15 s | **Kontext** | Gleiche Einstellung, Infobox „Warm oceans supply heat and moisture“ | „Hurricanes are giant heat engines, powered by warm ocean water.“ |
| 15–18 s | Atempause | Offenes Meer, Schwenk | – |
| 18–23 s | **Die Nachricht** | Karte: Meerestemperatur-Anomalie El Niño 2026 | „This year, a strong El Niño heated the eastern Pacific.“ |
| 23–29 s | | Satellitenbild Hurrikan Polo, Infobox „2026: record season in the central & eastern Pacific“ | „It brought the most active hurricane season on record there.“ |
| 29–39 s | **Was es bedeutet** | Animierte Infografik: Windgeschwindigkeit von Polo baut sich auf, „+90 knots in 24 hours“ | „With warm water, moist air and calm winds aloft, storms can explode in strength – sometimes faster than forecasts expect.“ |
| 39–47 s | **Zukunft** | Flug durchs Auge (Hurricane Hunter), Infobox „Projected: a larger share of Category 4–5 storms“ | „As the planet warms, models project a larger share of the strongest hurricanes – with heavier rain.“ |
| 47–49 s | Atempause | Polo aus dem All | – |
| 49–54 s | **Mitnehmen** | Ruhiges Meer, Titel „The ocean powers the storm.“ | „The ocean powers the storm. And the ocean is changing.“ |
| 54–60 s | Outro | Brand-Outro (6 s), Musik läuft durch | – |

**Übergänge:**
- Brand-Rahmen: je 9 Frames.
- Zwischen den Beats: Crossfade oder Dip-to-Black mit 12–18 Frames.
- Innerhalb eines Beats: harter Schnitt nur bei einem Bildwechsel.

**Pausen:** mindestens 0,8 s zwischen Sätzen und mindestens 1,1 s zwischen Beats.

## Aussagen und Belege (V08)

| Aussage im Film | Quelle |
| --- | --- |
| Hurrikane beziehen ihre Energie aus warmem Meerwasser, Wärme und Feuchte | [NOAA National Ocean Service](https://oceanservice.noaa.gov/facts/how-hurricanes-form.html), [NOAA JetStream](https://www.noaa.gov/jetstream/tropical/tropical-cyclone-introduction) |
| Starkes El Niño 2026 im östlichen Pazifik; aktivste Saison im zentralen und östlichen Pazifik seit Beginn der Aufzeichnungen (ACE 359,5, alter Rekord 318 aus 2018) | [NOAA-Saisonbilanz, 24.11.2026](https://www.noaa.gov/news-release/hurricane-season-wrap-up-el-nino-fueled-record-number-of-pacific-storms-but-calmed-atlantic) |
| Hurrikan Polo: +90 Knoten in 24 Stunden, Kategorie 5 am 22.09.2026; Bedingungen warmes Wasser, viel Feuchte, schwache Windscherung | [NASA Earth Observatory](https://science.nasa.gov/earth/earth-observatory/explosive-intensification-for-hurricane-polo/) |
| Rasche Intensivierung ist schwer vorherzusagen; laut NOAA die größte Fehlerquelle bei Intensitätsprognosen | [NOAA AOML](https://www.aoml.noaa.gov/hurricane-modeling-prediction/) |
| Mit Erwärmung projizieren Modelle einen größeren Anteil von Kategorie-4–5-Stürmen und höhere Regenraten | [NOAA GFDL](https://www.gfdl.noaa.gov/global-warming-and-hurricanes/) |

**Bewusste Abgrenzung:** Die Rekordsaison 2026 wird – wie von NOAA – **El Niño** zugeschrieben, nicht direkt dem Klimawandel. Klimawandel kommt nur im Beat „Zukunft“ vor, als Modellprojektion mit Quelle.

**Prüfstand:** Die Belege wurden am 25.11.2026 per Websuche geprüft. Vor einer Veröffentlichung wird der genaue Wortlaut jeder Quelle noch einmal gegen die Originalseite gelesen und das Prüfdatum aktualisiert.

## Benötigtes Bildmaterial

| Asset | Verwendung | Status | Nächster Schritt |
| --- | --- | --- | --- |
| P60-VID-001 NASA ISS „Oma“ | Ankommen, Kontext | privat testfreigegeben (036) | – |
| P60-VID-005 NOAA offenes Meer | Atempause 1, Mitnehmen | privat testfreigegeben (036) | – |
| P60-VID-003 NOAA Hurricane Hunter (Helene 2024) | Zukunft, mit Credit „Helene 2024“ | privat testfreigegeben (036) | – |
| **V2-VID-SVS5683-ELNINO-SSTA** NASA SVS 5683: Meerestemperatur-Anomalie 2026 vs. 2025, ohne Beschriftung, 1920×1080, 60 fps, 20 s | Nachricht (S04) | **gemeinfrei** laut NASA-SVS-FAQ, Credit „NASA's Scientific Visualization Studio“; SHA-256 `5ae6bb05…7133` | Sichtfreigabe durch den Betreiber; Beschriftung „2026/2025“ und Farbskala als eigene Overlays |
| **V2-VID-CIRA-POLO-RI** CIRA: GOES-18 GeoColor/IR, rasche Intensivierung 20.–22.09.2026, 1920×1080, 7,6 s | Nachricht (S05) | **nur privater Test:** Credit „CSU/CIRA & NOAA“ verlangt, aber keine Lizenz genannt; CIRA- und NOAA-Logo eingebrannt; SHA-256 `6abd058c…7651` | Sichtfreigabe für den privaten Test; vor einer Veröffentlichung CIRA-Erlaubnis einholen oder durch NOAA/NESDIS-GOES-Bild ersetzen |
| **V2-VID-SVS5681-POLO-GPM** NASA SVS 5681: Polo, GPM-3D-Niederschlag, ohne Datum, 1920×1080, 30 fps, 103 s | Atempause 2 (S08) | **gemeinfrei** laut NASA-SVS-FAQ, Credit „NASA SVS · NASA/JAXA GPM“; SHA-256 `4bc61ec6…72c9` | Sichtfreigabe durch den Betreiber |

Alle drei Dateien wurden am 25.11.2026 einmal in einen privaten, temporären Arbeitsordner geladen, um Bytes, SHA-256, Streams (keine Tonspur) und Kontaktabzüge zu prüfen. Nichts davon liegt im Git-Repository. Details stehen im [Rechte-Manifest V2](../../assets/pilot/rights-manifest-v2.json).

## Was noch fehlt, bis der Film neu gerendert werden kann

1. **Neue Medien:** gefunden und technisch geprüft (siehe oben); es fehlen noch die Sichtfreigabe durch den Betreiber und das private Staging auf dem VPS mit SHA-Prüfung (wie 036/046).
2. **Sprachaufnahme V2:** Kokoro lokal, 0 €; die echte Audiodauer wird Master-Timeline (053), die Frame-Fenster oben sind Planwerte.
3. **Musikbett:** aus einer geklärten Quelle, z. B. CC0, Rechte geprüft; mit Ducking nach 043.
4. **Renderer für den Vertrag:** Der heutige FFmpeg/SVG-Renderer kennt nur den alten 9-Shot-Plan. Für V2 braucht er Karten- und Infografik-Szenen (055/056), weiche Übergänge und Kamerabewegung (057) sowie Infobox-Overlays (058). Er rendert dann direkt aus dem Szenendokument.
5. **Erneute 048-Abnahme** am großen Bildschirm und am Handy.
