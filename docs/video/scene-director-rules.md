# Visuelle Story-Regeln V1 (Scene Director)

**BlueDotAtlas · Roadmap 050 · [Issue #74](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/74) · Stand 25.11.2026**
**Bezug:**
- [Qualitätsmatrix 011](../quality/video-acceptance.md): V05–V08, V13–V15.
- [048-Abnahme des Piloten](../pilot/60s-review.md): „Diashow-Wirkung“, „zu harte Schnitte, wenige Sprechpausen“.
- [Scene-Director-Vertrag V1 (049)](../../packages/core/scene-schema/v1/README.md): Begriffe Beat, Shot-Art, Overlay, Transition, Animation.

**Zweck:** Diese Regeln legen fest, wann ein Bild **Information trägt** und wann es nur dekoriert. Sie gelten für jeden BlueDotAtlas-Film (60 s bis 10 min). Die Zahlenwerte sind Richtwerte, die der Shot-Planner (052) erzeugt und der QA-Linter (059) prüft. Das letzte Wort hat das menschliche Review nach 011 (V05–V07).

## 1. Grundsatz: Footage zuerst, Grafik nur mit Mehrwert

1. **Echtes Bewegtbild ist der Normalfall.** Mindestens **50 %** der Laufzeit ohne Brand-Intro/-Outro sind echte Aufnahmen (`footage_fullscreen`, `footage_with_overlay`, `breathing_video`).
2. **Grafik ist die Ausnahme mit Begründung.** `infographic` und `map` zusammen höchstens **30 %**, `text_card` höchstens **8 %** der Laufzeit.
3. **Jede Grafik muss den Informationstest bestehen** (Abschnitt 5). Fällt sie durch, wird sie durch Footage ersetzt oder gestrichen.
4. **Keine Wiederholung.** Dieselbe Grafik bzw. dieselbe Asset-Stelle (gleiches `assetId` und überlappender `assetInFrame`-Bereich) erscheint nur einmal pro Film. Ein Wiederaufgreifen braucht eine sichtbare Veränderung, z. B. einen neuen Zustand derselben Karte.

## 2. Dramaturgie und Abwechslung

**Inhaltlicher Bogen (Standard für Nachrichtenfilme, Vorgabe 048):** `intro → arrival → context → news → meaning → future → takeaway → outro`. Zwischen den Beats stehen `pause`-Szenen.

**Visueller Wechsel:**
- **Nie zwei gleiche Shot-Arten hintereinander**, mit einer Ausnahme: `footage_fullscreen` → `footage_with_overlay` derselben Einstellung, weil dort nur die Infobox dazukommt.
- **Grundmuster:** Vollbild-Video → Video mit Infobox → Atempause → Infografik/Karte → Video …
- **Ankommen:** Direkt nach dem Intro folgt **3–5 s Vollbild-Video ohne Text und ohne Sprache**, die Musik trägt.
- **Atempausen:** mindestens **eine `pause` (2–4 s, nur Video, keine Sprache, kein Overlay) je 20–30 s** Laufzeit. In langen Filmen zusätzlich eine an jedem Kapitelwechsel.

**Blocklängen pro Shot:**

| Shot-Art | Min | Max | Bemerkung |
| --- | --- | --- | --- |
| `footage_fullscreen` / `footage_with_overlay` | 3 s | 12 s | Längere Einstellungen nur mit sichtbarer Kamera- oder Motivbewegung |
| `breathing_video` | 2 s | 4 s | Ohne Sprache und ohne Overlay |
| `infographic` / `map` | 4 s | 10 s | Längere Erklärungen werden in mehrere Zustände geteilt, nie ein Standbild |
| `text_card` | 2 s | 5 s | Höchstens ein Satz |

## 3. Schnitt, Übergänge und Kamerabewegung

**Übergänge:**
- **Zwischen Beats weich:** `crossfade` mit 12–20 Frames oder `dip_to_black` mit 10–15 Frames. Harte Schnitte (`cut`) nur **innerhalb** eines Beats und möglichst auf Bewegung.
- **Brand-Rahmen bleibt fest (V14/V15):** Intro → erster Shot und letzter Shot → Outro sind je eine **9-Frame-Überblendung**. Das Outro dauert 6 s, die Musik läuft durch den gesamten Outro-Bereich.

**Kamerabewegung auf Footage:**
- Ruhige Kamerabewegung ist erlaubt und erwünscht: `push_in`, `pull_out`, `pan_*`, `ken_burns` mit höchstens **8 % Zoom über die Shotdauer** und Easing.
- Keine Wackel-, Wirbel- oder Sprungzooms.

**Farbe:** Footage verschiedener Quellen erhält eine einheitliche Grundkorrektur (057). Echtfarben werden nicht „aufgehübscht“, wenn das Bild dann eine Messung vortäuschen würde.

## 4. Sprache und Pausen

- **Tempo:** im Mittel höchstens **2,3 Wörter pro Sekunde** Sprechzeit. Für 60 s mit Intro, Outro und Pausen sind das etwa **90–120 Wörter**.
- **Pausen:** zwischen Sätzen mindestens **0,6 s** Stille, zwischen Beats mindestens **1,0 s**.
- **Ein Gedanke pro Satz.** Ein Satz kommt über eine Einstellung hinweg ohne Schnitt mitten im Satz aus.
- **Bild und Wort gehören zusammen.** Das Bild zeigt, worüber gerade gesprochen wird; neue Bildinhalte kommen mit dem passenden Satz.
- **Musikbett:** Es wird unter der Sprache geduckt (Regeln 043). In `arrival` und `pause` ist es nicht geduckt.

## 5. Informationswert: echte Information oder Deko?

Jede Animation, Grafik und jedes Overlay muss eine Frage mit **Ja** beantworten:

> „Versteht der Zuschauer danach etwas, das die Sprache allein nicht zeigt?“

| Zählt als **Informationsgewinn** ✓ | Ist **dekorativ** ✗ |
| --- | --- |
| **Prozess/Ablauf:** Schritte erscheinen in der Reihenfolge der Sprache (`diagram_build`) | Text, der sich dreht, springt oder pulsiert |
| **Vergleich/Größenordnung:** zwei Zustände nebeneinander, Maßstab | Partikel, Glitzer oder Lichtflecken ohne Bedeutung |
| **Ort:** Karte bzw. Lage des Ereignisses mit Datum | Endlos-Loop derselben Animation über mehrere Sätze |
| **Veränderung über Zeit** mit belegter Datenbasis (`DataRef` + Quelle) | Grafik, die nur die gesprochenen Worte als Text wiederholt |
| **Kamerabewegung, die den Blick auf das Gemeinte lenkt** | Zoom auf ein Bild, ohne dass dort etwas zu sehen ist |
| **Kurze Infobox mit Zahl, Ort, Datum oder Quelle**, die die Sprache entlastet | Dauerhafte Balken, Logos oder Hinweise über dem Bild |

Weitere Pflichten:
- **Schemata sind gekennzeichnet.** Eine schematische Darstellung trägt sichtbar „Schematic“ oder „Illustration“ und zeigt keine erfundenen Messwerte (V07/V10).
- **Zahlen und Daten nur mit Beleg.** Jede Zahl in Grafik oder Overlay hat eine `DataRef` mit `SourceRef` (V08).

## 6. Overlay-Dichte und Text

- **Gleichzeitigkeit:** höchstens **eine** Infobox gleichzeitig, dazu höchstens ein `source_credit`.
- **Kurz:** **≤ 12 Wörter** pro Infobox, ≤ 140 Zeichen (Vertrag 049).
- **Lesezeit:** sichtbar mindestens `1 s + 0,3 s × Wörter`, höchstens 6 s. Ein- und Ausblenden weich, 8–12 Frames.
- **Freiräume:** keine Overlays in `arrival` und `breathing_video` (vom Vertrag 049 erzwungen) und nicht in der ersten Sekunde eines Shots.
- **Quellenangabe:** als dezentes `source_credit`, 2–4 s, nicht dauerhaft.
- **Private Kennzeichnung:** Ein Hinweis wie „PRIVATE … NOT PUBLISHED“ ist nur in privaten Testfassungen erlaubt, klein und an einer Ecke.
- **Lesbarkeit:** Safe-Area 5 % Rand. Mindestschrift entspricht bei 1080p 36 px für Infoboxen und 28 px für Credits, damit der Text auch auf dem Handy lesbar ist (V13).

## 7. Bewusste Ausnahmen

Ein Thema darf von diesen Regeln abweichen, wenn es das inhaltlich verlangt. Beispiel: ein Datenthema ohne verfügbares Footage, mit höherem Grafikanteil. Dann gilt:
- Die Ausnahme wird **im Szenendokument begründet**, als Szenentitel bzw. Notiz und im Review-Manifest. Sie gilt nur für die genannten Szenen.
- Sie hebt **nie** die Pflichten zu Quellen, Rechten, Kennzeichnung von Schemata und Brand-Rahmen auf (V08–V10, V14/V15).
- Der menschliche Review nach 011 bestätigt die Ausnahme ausdrücklich.

## 8. Umsetzung und Prüfbarkeit

| Regel | Heute erzwungen | Später |
| --- | --- | --- |
| Atempause ohne Sprache/Overlay, Infobox nur bei Video mit Overlay, Footage braucht Asset, keine blockierten Assets | ✓ Vertrag 049 | — |
| Anteile Footage/Grafik/Text, Blocklängen, kein gleicher Shot-Typ hintereinander, keine Wiederholung | — | Shot-Planner 052, QA-Linter 059 |
| Weiche Übergänge zwischen Beats, 9-Frame-Brand-Übergänge, Zoom ≤ 8 % | teilweise (Transition-Länge, Skalierung ≤ 1,5) | 052 / 057 / 059 |
| Wörter pro Sekunde, Sprechpausen | — | 053 (Audiodauer als Master-Timeline), 059 |
| Informationstest, Kennzeichnung, Belege | Quellen- und Datenverweise im Vertrag | Menschliches Review 011 (V05–V08) |

**Abnahme 050 (Roadmap):** „Regeln unterscheiden echten Informationsgewinn von dekorativer Bewegung.“ Das leisten Abschnitt 5 und die messbaren Grenzen in den Abschnitten 1–6.
