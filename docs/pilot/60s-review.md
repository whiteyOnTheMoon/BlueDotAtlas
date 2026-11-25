# 048 – Filmische Abnahme des ersten 60s-Pilotfilms

**BlueDotAtlas · Roadmap 048 · [Issue #72](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/72) · Stand 25.11.2026**
**Geprüfter Film:** privater FFmpeg/SVG-Pilot „Hurricanes: Powered by the Ocean“, 1800 Frames / 30 fps / 60,000 s, 1920×1080, H.264/AAC. Gerendert über Admin → Queue → Worker (046, [Issue #70](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/70)), angesehen in der geschützten Admin-Vorschau (047, [Issue #71](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/71)).

## Urteil

> **NICHT BESTANDEN – Diashow-Wirkung.** Technisch ist der Film einwandfrei (Volldecode fehlerfrei, exakt 30/1, Stimmpegel −23,8 dB). Filmisch überzeugt er laut Betreiber nicht. Nach dem Roadmap-Abnahmetor („bei Diashow-Wirkung wird M03 nicht geschlossen“) bleibt **M03 offen**. Der Film wird mit den M04-Aufgaben überarbeitet und danach erneut nach diesem Dokument abgenommen.

## Betreiber-Eindruck (wörtlich, 24./25.11.2026)

- „das ergebnis ist ganz ok, also von der qualität her.“
- „filmisch gefällt er mir einfach noch nicht“
- „es sind zu harte schnitte, wenige sprechpausen“
- Gewünschter Ablauf: „nach dem intro ein hintergrundvideo vollflächig startet, dann beginnt die information, der hintergrundfilm bekommt vielleicht ein overlay um infoboxen anzuzeigen, dann kurz nur video, dann von mir aus infografik … es soll abwechselnd sein“
- Skript: „zuerst allgemeine info über das thema, dann die nachricht, was es bedeutet, was es für die zukunft bringt, was man davon mitnehmen sollte, outro“

## Prüfmatrix (Roadmap-Kriterien)

| Kriterium | Befund am Pilot | Bewertung |
| --- | --- | --- |
| **Bildrhythmus** | Über die Hälfte (≈ 31 s) sind Schema-Grafiken; nur ≈ 21 s echtes Bewegtbild aus 3 Clips. S03–S05 zeigen **dieselbe** Grafik ≈ 24 s am Stück; nur Bildunterschrift und Animation darin ändern sich. | ✗ Diashow-Wirkung |
| **Übergänge** | Außer Intro/Outro (je 9 Frames) nur harte Schnitte; keine Kamerabewegung (kein Push-in/Pan) auf Footage. | ✗ zu hart (Betreiber) |
| **Erklärwert** | Fachlich korrekt und NOAA-belegt (C01–C03), aber als Folienfolge mit viel Text erzählt. | ~ korrekt, wirkt schulisch |
| **Narration** | Sieben dicht aufeinanderfolgende Sätze (Kokoro `bm_george`); kaum Atempausen zwischen den Gedanken. | ✗ zu wenige Sprechpausen (Betreiber) |
| **Dynamik / Spannung** | Kein Musikbett im Film (nur Stimme + Intro-Ton); kein Spannungsbogen, kein „Nachrichten“-Moment. | ✗ |
| **Text / Overlays** | Dauerhafter Bildunterschriftenbalken und „PRIVATE … NOT PUBLISHED“-Hinweis über dem gesamten Footage. | ~ unruhig; für Privatfassung nötig, aber gestalterisch zu dominant |
| **Rechte** | Nur die drei privat testfreigegebenen NASA/NOAA-Clips, Original-Intro/-Outro, eigene Grafiken, lokale TTS. | ✓ für privaten Test; ✗ für Veröffentlichung (separates Gate) |
| **Große / kleine Screens** | 1080p scharf; auf dem Handy sind Grafiktexte (23–29 px bei 1080p) klein. | ~ Text auf Mobil zu klein |

## Ziel-Dramaturgie V2 (Vorgabe des Betreibers, als Beat-Sheet konkretisiert)

Inhaltlicher Bogen: **Kontext → Nachricht → Bedeutung → Zukunft → Mitnehmen → Outro**. Visuell **abwechselnd**: Vollbild-Video, Video mit Infobox-Overlay, reines Video als Atempause, Infografik. Richtwerte für 60 s:

| Zeit | Beat | Bild | Ton / Sprache |
| --- | --- | --- | --- |
| 0–2,5 s | Intro | Original-Brand-Intro | Intro-Ton |
| 2,5–7 s | **Ankommen** | Vollflächiges Hintergrundvideo, langsamer Push-in, **kein Text** | Musikbett setzt ein, noch keine Stimme |
| 7–17 s | **Kontext** (allgemeine Info zum Thema) | Dasselbe Video läuft weiter; halbtransparente **Infobox** blendet weich ein/aus | Stimme, Musik geduckt |
| 17–20 s | **Atempause** | Nur Video, Schnitt auf neue Einstellung per weicher Blende | Musik hoch, keine Stimme |
| 20–31 s | **Die Nachricht** | Aktuelles Ereignis-Footage (z. B. Helene) + Infobox mit Datum/Quelle | Stimme |
| 31–40 s | **Was es bedeutet** | **Eine** fokussierte, animierte Infografik (keine Folie, wenig Text) | Stimme |
| 40–47 s | **Was es für die Zukunft bringt** | Video oder Karte mit kurzem Overlay | Stimme |
| 47–50 s | **Atempause** | Nur Video | Musik |
| 50–54 s | **Was man mitnehmen sollte** | Ruhiges Schlussbild, ein kurzer Kernsatz als Textkarte | Stimme, ein Satz |
| 54–60 s | Outro | Original-Brand-Outro (6 s, V15) | Musik läuft durch den ganzen Outro-Bereich (V15) |

**Regeln:**
- Zwischen den Beats weiche Übergänge (Crossfade bzw. Dip-to-Black, 12–20 Frames) statt harter Schnitte; die beiden Brand-Übergänge bleiben fest 9 Frames (V14/V15).
- Sprechpausen von mindestens 0,6–1,0 s zwischen den Beats.
- Höchstens etwa 110–120 gesprochene Wörter in 60 s.
- Kein Grafik-Block länger als 10 s.
- Keine Grafik wiederholt sich.
- Textboxen nur kurz und nie dauerhaft.

## Erforderliche Nacharbeiten (zugeordnet zur Roadmap)

| # | Nacharbeit | Roadmap / Issue |
| --- | --- | --- |
| 1 | **Skript V2** nach dem Bogen Kontext → Nachricht → Bedeutung → Zukunft → Mitnehmen, mit eingeplanten Pausen, ≤ 120 Wörtern und jeder neuen Aussage (v. a. „Nachricht“ und „Zukunft“) mit offizieller Quelle (NOAA/NASA) belegt; neue TTS-Fassung | 050 Visuelle Story-Regeln ([#74](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/74)), 053 Audiodauer als Master-Timeline ([#77](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/77)) |
| 2 | **Abwechslungs- und Rhythmusregeln** (Vollbild-Video / Video + Overlay / reines Video / Infografik, max. Blocklänge, keine Wiederholung) als prüfbare Regeln im Shot-Planner | 052 Shot-Planner ([#76](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/76)), 051 Szenentypen ([#75](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/75)) |
| 3 | **Weiche Übergänge und Kamerabewegung** (Crossfade, Dip, langsamer Push-in/Pan) und einheitliche Farbkorrektur | 057 Übergänge/Farbkorrektur ([#81](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/81)) |
| 4 | **Infobox-Overlays** statt Dauerbalken: weich ein-/ausblenden, kurz, mobil lesbar | 058 Textgrafiken begrenzen ([#82](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/82)) |
| 5 | **Echte animierte Infografik** statt Folie: eine Aussage pro Grafik, wenig Text | 055 Animierte Wissenschaftsdiagramme ([#79](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/79)) |
| 6 | **Musikbett mit Ducking** im Film (Regeln aus 043 anwenden; Musik nur aus geklärter Quelle, 0 € bzw. Budgetgrenze) | 043-Regeln, Rechte separat |
| 7 | **Mehr Bewegtbild**: für 60 s mit Atempausen werden ca. 6–8 verschiedene Clips gebraucht; zusätzliche NASA/NOAA-Quellen mit Einzelrechteprüfung | 054 Medien-Auswahl ([#78](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/78)), Rechte-Workflow 036 |
| 8 | **Automatische Prüfung** gegen Diashow-Wirkung (Grafikanteil, Blocklänge, harte Schnitte, Sprechpausen) | 059 QA-Linter ([#83](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/83)) |

## Wiederholung der Abnahme

Die 048-Abnahme wird mit einem nach V2 überarbeiteten Pilotfilm wiederholt: Ansicht am großen Bildschirm und am Handy, dieselbe Prüfmatrix, ausdrückliches Betreiberurteil. Erst ein **„bestanden“** schließt M03. Veröffentlichung bleibt ein eigenes Rechte- und Freigabe-Gate.
