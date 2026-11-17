# BlueDotAtlas — Video-Qualitäts- und Abnahmematrix V0.1

**Status: ENTWURF / Roadmap 011 (M01). Von Nutzer noch NICHT abgenommen.**  
**Datum:** 17.11.2026 · [Issue #25](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/25) · Branch `docs/011-video-acceptance`  
**Vorher:** [Freigegebenes Produkt-PRD V0.1](../product/prd-v01.md) (DEC-026).  
**Zweck:** Ein **identisches, reproduzierbares Prüfverfahren** entscheidet bei jedem späteren BlueDotAtlas-Testfilm eindeutig über **bestanden / nicht bestanden**, mit eigenem Profil für einen **echten 60-Sekunden-Piloten** und einen **substanziellen Langfilm**.

> **Grenze von Aufgabe 011:** Wir **definieren** jetzt die Kriterien. **Wir führen noch keinen echten Filmtest, keine VPS-Render-Messung und keine Veröffentlichung durch.** Tests und technische Renderimplementation erfolgen in späteren Roadmap-Aufgaben (u. a. 013, 045, 048, 063). Die unten beschriebenen numerischen Grenzwerte sind ein **V0.1-Vorschlag zur Nutzerfreigabe**, keine angeblich bereits beschlossenen externen YouTube-Normen.

## 1. Ablauf und eindeutige Entscheidung

**Anwendung:** Immer dieselbe Kriterien-ID-Liste **V01–V18**, aber mit den profilabhängigen Spalten **P60** (= 60s-Pilot) beziehungsweise **LONG** (= Langfilm). Eine Projektfreigabe nutzt erst das tatsächlich zutreffende Profil, nicht ein zusammengerechnetes Punktesystem.

Pro Prüfkriterium gibt es genau vier Zustände:

| Status | Bedeutung | Konsequenz |
| --- | --- | --- |
| **PASS** | Gemäß vorgeschriebener Methode tatsächlich gemessen oder durch zuständige Person geprüft, Nachweis angegeben. | Kriterium bestanden. |
| **FAIL** | Nachweis zeigt Verletzung des Akzeptanzkriteriums. | **Gesamter Film nicht abgenommen.** Fehler mit Timecode/Issue protokollieren. |
| **BLOCKED** | Erforderlicher Nachweis fehlt, ist unvollständig, ungeklärt oder Prüfsystem versagt. | **Gesamter Film nicht abgenommen.** Kein stillschweigendes PASS. |
| **N/A** | Kriterium für diesen konkreten Prüfmodus ausdrücklich nicht anwendbar, **mit Begründung und Freigabe durch Prüfer**. | Nur zulässig, wenn die Matrix dieses Feld als **optional** markiert; kritische Kriterien nie aussetzen. |

**Gesamtergebnis:** Nur wenn **alle für das gewählte Profil verpflichtenden V01–V18-Kriterien PASS** sind und optionale Kriterien entweder PASS oder begründet N/A, lautet es **BESTANDEN**. Bei mindestens einem **FAIL** → **NICHT BESTANDEN**. Ohne FAIL, aber mit mindestens einem **BLOCKED** oder nicht dokumentiertem Pflichtstatus → **NICHT ABNAHMEFÄHIG**. **Eine hohe Durchschnittsbewertung kann einen Quellen-, Lizenz-, Audio- oder technischen Fehler nie kompensieren.** Das letzte Freigabewort liegt ausdrücklich beim Einzeladmin/Reviewer.

**Prüfarten:**
- **AUTO** = maschinell reproduzierbar (z. B. `ffprobe`, `ffmpeg -xerror`, Hash, Timeline-/Manifest-Linter).
- **HUMAN** = manuelle Bild-/Ton-/Redaktionskontrolle anhand eindeutiger Ja/Nein-Fragen mit dokumentiertem Tester/Timecode.
- **BOTH** = automatische Evidenz **und** menschliche Bild-/Tonprüfung müssen vorliegen.
- Ein von Software behauptetes „PASS“ ohne echte Ausführung gilt **nicht** als Nachweis; der Testbericht verlinkt den Run und das unveränderte geprüfte Artefakt.

## 2. Prüfmatrix — einheitliche IDs, zwei Filmprofile

Die Spalten **P60** und **LONG** markieren das Profil. **Pflicht** = keine N/A-Ausnahme. **Optional** = N/A mit schriftlicher Begründung möglich. Der Grenzwert/Prüfumfang steht in den jeweils folgenden Kriterien.

| ID | Bereich | Prüfverfahren | P60: echter ca. 60s-Pilot | LONG: 8–10-Min.-Ziel bei Substanz | Gate |
| --- | --- | --- | --- | --- | --- |
| **V01** | Exportformat und Lesbarkeit | AUTO | 1920×1080, MP4/H.264, 30 FPS, progressiv, decodierbar | Dasselbe über **gesamte Laufzeit** | **Pflicht** |
| **V02** | Laufzeit und komplette Timeline | BOTH | **55–65s** Testfenster als V0.1-Vorschlagsgrenze; kein abgeschnittenes Ende | **8–10 Min. Ziel, sofern inhaltlich begründet**; Abweichung redaktionell begründen, keine künstliche Streckung | **Pflicht** |
| **V03** | Audioformat und technische Integrität | AUTO | AAC, Stereo, 48 kHz; keine kaputten/fehlenden Audioströme | Dasselbe, auf gesamter Datei | **Pflicht** |
| **V04** | Bild/Ton-Synchronität | BOTH | Story/Voice/Lipsync sofern relevant; kein hörbarer Drift | Zusätzlich Anfang/Mitte/Ende gezielt prüfen | **Pflicht** |
| **V05** | Filmische Bewegung statt Diashow | HUMAN | Mindestens begründeter Bildwechsel/Informationsgewinn je Szene; keine bloße Still-Show | Dasselbe für **jedes Kapitel**, nicht nur Einleitung | **Pflicht** |
| **V06** | Schnittrhythmus, Übergänge, Wiederholungen | HUMAN | Keine abrupten, sinnlosen Sprünge, Untermalungs-Schleifen oder verwaisten Shots | Stichproben pro Kapitel **und** Gesamtdurchlauf; kein repetitives Füllmaterial | **Pflicht** |
| **V07** | Tatsächlicher Informationswert der Visuals | HUMAN | Footage, Karte, Animation oder grafische Erklärung trägt zum jeweiligen gesprochenen Claim bei | Für Kapitel fortlaufend nachvollziehbar; keine Deko-Daten als Messung | **Pflicht** |
| **V08** | Faktenbehauptungen und wissenschaftliche Quellen | BOTH | **100% aller prüfpflichtigen sachlichen Claims** besitzen konkrete verifizierbare Referenzen | Dasselbe über **gesamtes Skript und Datenstände** | **Pflicht** |
| **V09** | Medien-, Musik-, Karten- und TTS-Rechte | BOTH | **100% der verwendeten Drittassets** mit gültiger, dokumentierter Verwendungserlaubnis; ungeklärt = Blocker | Dasselbe pro Asset, Lizenz, Nutzung und Endpublikation | **Pflicht** |
| **V10** | Wissenschaftliche Grafik-Integrität | HUMAN | Einheiten, Labels, Datenstand, Unsicherheiten; keine erfundenen Messungen | Bei jeder Daten-/Karten-/Satellitenillustration dieselbe Anforderung | **Pflicht** |
| **V11** | Englische Narration und Aussprache | HUMAN | Sprachlich korrekt, verständlich, fachlich präzise, ruhiger filmischer Charakter | Einheitliche Sprecheridentität/Stil und terminologische Konsistenz über Kapitel | **Pflicht** |
| **V12** | Tonbalance, Störgeräusche, Sprachverständlichkeit | BOTH | Keine hörbare Übersteuerung, Klicks oder verlorene Wörter; Stimme verständlich auf Handy/Lautsprecher/Kopfhörer | Stichproben Anfang/Mitte/Ende und kritische Musikpassagen | **Pflicht** |
| **V13** | Untertitel/Screen-Text und Kontrast | HUMAN | Alle sichtbaren Texte lesbar, kurz, ohne abgeschnittene Safe-Areas; Untertitel falls vorhanden synchron | Dasselbe pro Kapitel, zusätzlich auf Mobilgerät | **Pflicht** |
| **V14** | Verbindliche Marken-Motion | BOTH | Original-Intro **2,5s**, Original-Outro **6s**, je **0,3s (= 9 Frames) Video-Crossfade** | Identisch; keine Ersatz-Logo-Clips | **Pflicht** |
| **V15** | Durchgehende Outro-Musik | BOTH | Film-BGM läuft **durch das stumme 6s-Outro**, Intro-Audio ist sauber zur Filmtonspur gemischt | Identisch; Musik beendet Film passend, nicht am Outro-Eingang | **Pflicht** |
| **V16** | Bedienbarkeit: Vorschau/Download | BOTH | Geschützte Vorschau, abspielbares MP4 und Originaldownload; keine vorausgesetzte Veröffentlichung | Lange Datei vollständig abspielbar/suchbar, Download vollständig | **Pflicht** |
| **V17** | Editorial Review und Projekt-Traceability | BOTH | Hash/Version, Prüfdatum, Reviewer und Quellen-/Lizenznachweise verknüpft; **manuelle Entscheidung** protokolliert | Zusätzliche Kapitelnachweise und finale Scope-Prüfung | **Pflicht** |
| **V18** | Zuschauerfreundliche Kapitelstruktur | HUMAN | **Optional:** In 60s nicht zwingend Kapitelmarken; N/A bei kurzem Proof begründen | **Pflicht:** nachvollziehbare Kapiteldramaturgie, kein künstliches Strecken | **P60 optional / LONG Pflicht** |

### Präzisierungen, damit die Matrix tatsächlich prüfbar ist

**V01 / V03:** Das aktuelle Produktprofil basiert auf freigegebenen **1920×1080 / 30fps / H.264/AAC / Stereo 48kHz**-Motion-Dateien. `ffprobe` prüft Container und Streams, `ffmpeg -xerror -i video.mp4 -f null -` prüft **alle** Frames/Streams auf Dekodierungsfehler. Ein Container-Header allein reicht nicht. Konkrete Bitrate, Ziel-GOP, Rec.709 und Export-Preset werden **erst in Aufgabe 045** technisch freigegeben. Keine VPS-Render-Dauer wird hier als erreicht behauptet.

**V02:** Für den **60s-Test** ist das Fenster **55–65 Sekunden ein Vorschlag** für die Abnahme-Messbarkeit, keine vom Nutzer bereits beschlossene Toleranz. Für den **Langfilm** gilt das **inhaltlich begründete Ziel 8–10 Minuten (480–600s)** aus dem freigegebenen PRD – **nicht** als Pflicht, einen fundierten kürzeren oder sinnvoll längeren Film künstlich zu beschneiden oder zu dehnen. Bei Abweichungen wird der sachliche Grund schriftlich dokumentiert und durch den Reviewer freigegeben.

**V04 / V12:** `ffprobe`-PTS/DTS und Timeline-Metadaten helfen nur bei der technischen Diagnose. Der tatsächliche Eindruck von Voice, Hintergrundmusik, Übergängen und Synchronität wird **gehört und gesehen**. Ein optionaler Lautheits-Messwert kann mit `ebur128`/`loudnorm` protokolliert werden; **es ist noch kein verbindlicher LUFS-Schwellenwert beschlossen**. **Keine Übersteuerung** und **verständliche Narration** sind trotzdem klare Gate-Pflichten.

**V05–V07:** „Keine Diashow“ lässt sich nicht zuverlässig allein durch automatische Schnittfrequenz ausdrücken. Prüfer müssen für **jede Szene** im Review-Manifest den Bildzweck und erkennbaren Bewegung-/Informationsgewinn angeben; ein statisches Chart darf ausnahmsweise sinnvoll sein, wenn die Information real erklärt wird. **Unbegründete lange Standbilder, redundante Dauerschleifen, bedeutungslose Zooms und reine Texttafeln** sind als FAIL zu markieren, mit Timecodes. Der Review ist ein überprüfbarer menschlicher Befund, kein Algorithmus, der Kunst mit einer einzigen Zahl bewertet.

**V08:** „Prüfpflichtiger Claim“ meint konkrete naturwissenschaftliche Aussagen, Datensätze, Orte, Ereignisse, Zeit-/Mengenangaben und kausale Erklärungen – nicht jedes überleitende Wort. Mindestnachweis pro Claim: **Satz-/Szenen-ID → zitierfähige Quelle/URL oder Archiv-ID → Datenstand → Reviewer → Status**. Widerspruch zwischen Darstellung und Quelle = **FAIL**, fehlende Quelle = **BLOCKED**.

**V09:** „Frei im Netz“ ist **keine Lizenz**. Alle Quellenbilder, Filme, Karten, Ton-/Musikstücke, Sprecher/TTS und sonstigen geschützten Inputs erhalten **Asset-ID, Urheber/Provider, Rechtegrundlage, Lizenzversion/Abrufdatum und zulässige Nutzungsform**. Ein geklärter Inhalt ist **nicht** automatisch YouTube-veröffentlichungsfähig, wenn etwa Namensnennung/Attribution fehlt. Ungeklärte Rechte blockieren eine tatsächliche Verwendung/Publikation. **Dies ist eine neue Aufgabe-011-/Produktqualitätsregel, nicht rückwirkend ein 007-Gate.**

**V10 / V13:** Satellitenbilder und Datenanimationen müssen ihre tatsächlichen Quellen, Maße und Datumsangaben tragen. Eine bewusst dekorative Illustration wird sichtbar **als Illustration** gekennzeichnet und darf keine fiktive Messung suggerieren. Typografie folgt Inter/Space Grotesk; Text safe areas bei mobiler Ansicht prüfen.

**V14 / V15:** Exakte Originalmedien sind [`BlueDotAtlas Intro.mp4`](../../assets/brand/motion/final/BlueDotAtlas%20Intro.mp4) (2,5 Sekunden, eigener AAC-Ton) und [`BlueDotAtlas_Outro.mp4`](../../assets/brand/motion/final/BlueDotAtlas_Outro.mp4) (6 Sekunden, **ohne** Audiospur). Die beiden Video-Überblendungen sind **0,3 Sekunden = 9 Frames je Übergang bei 30fps**, nicht 0,4s. Die Musik läuft durch den **gesamten Outro-Bereich**, mit einem ggf. sanften finalen Fade **erst zum Ende**; die Original-MP4s werden nicht verändert. Der einzelne 10s-R&D-Prototyp ist niemals Ersatz für diese zwei Dateien.

**V16:** Vor M05 können **Produkt-UI-Tests** noch nicht als bestanden gelten. In frühen M03-/M04-Tests darf der Reviewer die **lokale, nachweislich abspielbare MP4-Ausgabe und Downloadmöglichkeit** als vorläufige technische V16-Prüfung verwenden; für Release-Videos sind die **echte geschützte Admin-Vorschau und Originaldownload** vollständig erforderlich. Für jede solche Profile-Ausnahme muss im Prüfbericht `phase` und konkrete Nachweislage vermerkt sein; niemals daraus eine fertige App behaupten.

**V17:** Der Entscheid wird dokumentiert von **einer echten verantwortlichen Person**, nicht allein von automatisierten Tests. Fehlende Prüfbelege sind kein implizites PASS. `Published` darf erst nach vollständig bestandener Prüfung und einer **separaten manuellen Veröffentlichungsaktion** gesetzt werden.

## 3. Testabdeckung für Pilot und Langfilm

| Prüfpunkt | P60: ca. 60s Realfilm (Roadmap M03) | LONG: längere Vollfilm-Probe (M04/M13) |
| --- | --- | --- |
| Prüfumfang | Alle Frames, alle Claims/Assets und komplette Tonspur | Alle Frames maschinell; **alle** Claims/Assets redaktionell; Bild-/Audio-Stichproben pro Kapitel plus kompletter Durchlauf |
| Laufzeitziel | 55–65s **Entwurfstoleranz** | 8–10 Minuten nur **bei inhaltlicher Substanz**; Abweichung dokumentiert |
| Bild/Audio | 1080p/30fps, MP4 H264/AAC, 48kHz, visuell/akustisch geprüft | Identisch; längere Durchläufe, Drift, Speicher/Export besonders beobachten |
| Rhythmus | Mindestens tatsächlicher filmischer Szenen-/Shot-Wechsel mit Informationswert | Dramaturgische Variation, Perspektivwechsel und keine Füll-Loops in allen Kapiteln |
| Rechte/Quellen | Vollständige lückenlose Claim- und Asset-Liste | Gleiche 100% Anforderungen, nicht nur Stichproben |
| Bedienbarkeit | MP4 abspielen/herunterladen; tatsächliche UI-Funktion je Projektphase | Vollständige Admin-Vorschau, Seek im langen Video, Originaldownload |
| Freigabe | Reviewer protokolliert **Pilot PASS/FAIL/BLOCKED**; kein Autopublish | Reviewer protokolliert **Langfilm PASS/FAIL/BLOCKED**; separates manuelles Publish |

## 4. Kopierbare Prüfvorlage pro Video (ein Dokument pro Export)

```text
BlueDotAtlas Video Review V0.1
- Projekt-/Video-ID:
- Filmprofil: P60 | LONG
- Dateiname und SHA-256:
- Manifest-/Skript-/Quellen-/Rechte-Version:
- Render-Run/Job-ID:
- Reviewer / Datum / Testgerät(e), Browser/Player:
- ffprobe-Protokoll:
- Vollständiger ffmpeg-Decode-Log:
- Prüfsummen- und Schnitt-/Crossfade-Nachweis:
- Quelle/Claim-Liste:
- Rechte-/Lizenzinventar:
- Visuelle Szenen-Review-Timecodes:
- Sprach-/Tonprüfung und etwaige Messwerte:
- Wiedergabe- und Downloadnachweis:
- V01: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V02: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V03: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V04: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V05: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V06: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V07: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V08: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V09: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V10: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V11: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V12: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V13: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V14: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V15: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V16: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V17: PASS|FAIL|BLOCKED|N/A, Nachweis:
- V18: PASS|FAIL|BLOCKED|N/A, Nachweis (N/A nur bei P60 zulässig):
- Fehler mit Timecode / GitHub Issue:
- GESAMT: BESTANDEN | NICHT BESTANDEN | NICHT ABNAHMEFÄHIG
- Grund, redaktionelle Freigabeentscheidung, Name/Datum:
```

**Nachvollziehbarkeit:** Alle PASS-Zeilen müssen **echten** Dateihash, Run-/Artefaktlinks oder dokumentierten manuellen Test enthalten. Ein Template, leerer Link, generierter Bildschirm ohne Realfilm oder ungetestetes Testmaterial ist **kein PASS**.

## 5. Richtlinien / Versionierung

- Qualitätsmatrix V0.1 ist ein **veränderbarer Beschlussentwurf bis zur expliziten Abnahme von 011**. Neue numerische Toleranzen (Pilotdauer 55–65s, Audio-Lautheit, Szenenlängen) brauchen separat dokumentierte Freigabe; keine stillschweigende externe Normbehauptung.
- Offizielle Roadmap-Gates bleiben getrennt: **011 schreibt die Checkliste**, **013** misst den VPS, **045** finalisiert technische Exportprüfung, **048** prüft einen echten 60s-Pilotfilm, **063** beurteilt Scene Director/Langfilm und M12/M13 regeln die Veröffentlichung. Keine Doppelbeurteilung derselben Task.
- Bei späteren Änderungen: Issue/Branch/QA/PR + Entscheidungseintrag und zentrale [Repository-README](../../README.md) im selben PR aktualisieren (DEC-022).

## 6. Abnahme von Roadmap 011

- [x] Matrix deckt **technische Ausgabe, filmische Dynamik, Quellenbelege, Lizenzstatus, Sprache, Ton und Bedienbarkeit** ab.
- [x] **P60** und **LONG** als zwei klar unterscheidbare Prüfprofile mit **denselben 18 Kriterien-IDs** beschrieben.
- [x] Wiederholbares **PASS / FAIL / BLOCKED / N/A**, Evidence-Anforderungen und Gesamtergebnis definiert.
- [x] Für spätere echte Testfilme eine vollständige **Copy/Paste-Reviewvorlage** mit Versions-/Zeitcode-Nachweisen vorhanden.
- [ ] Dokumentations-Test der vollständigen Matrix erfolgreich; keine Behauptung eines bereits getesteten Films.
- [ ] Nutzer hat **diese konkrete neue V0.1-Prüfmatrix** ausdrücklich freigegeben. Die vorherige Freigabe von PRD 010 (DEC-026) genehmigt **nicht** automatisch Zahlen/Qualitätskriterien aus 011.
- [ ] Danach PR mergen und [Issue #25](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/25) schließen.

**Status bis zur Freigabe: DRAFT; kein reales Video wurde in Aufgabe 011 getestet oder bewertet.**
