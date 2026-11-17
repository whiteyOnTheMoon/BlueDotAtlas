# BlueDotAtlas — Brand-Kit V0.1 · M00 / Aufgabe 009

**Status: ZUSAMMENGESTELLTER BRAND-GATE-ENTWURF — die Gesamtfreigabe durch den Nutzer steht noch aus.**  
**Stand:** 17.11.2026 · [Issue #21](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/21) · Branch `design/009-brand-gate-v01`  
**Roadmap-Ergebnis:** `docs/brand/brand-kit-v01.md` — eine verbindliche, versionierte V0.1-Auswahl nach expliziter Abnahme.

Die Roadmap 009 verlangt die **gemeinsame Sichtprüfung** von Logo, Farbwerten, Typografie, Thumbnail, Voice-Charakter und einem **beispielhaften 1080p-Storyboard-Frame**. Die vorherigen Aufgaben 001–008 sind auf `main` abgeschlossen. **Nicht** weitere Brand-Alternativen erfinden; die freigegebenen Einzelergebnisse werden hier konsolidiert und auf Widersprüche geprüft.

**[Visuelles nebeneinander aufgebautes Brand-Gate-Board öffnen](../../design/brand-gate-v01/index.html)** · **[1920×1080 Storyboard-SVG ansehen](../../design/brand-gate-v01/storyboard-1080p.svg)**

## 1. Vergleich aller verbindlichen Markenbausteine

| Baustein | Bisher genehmigte V0.1-Richtung | Maßgebliche Quelle / Nachweis | Gate-009-Bewertung |
| --- | --- | --- | --- |
| **Name und Claim** | Exakt **BlueDotAtlas**; **The Planet Has a Story.**, keine öffentliche Kurzform. Englische Dokumentationen. | [Naming](naming.md) / DEC-001, DEC-008, DEC-009 | **Bereits freigegeben**; unverändert im Review-Board. |
| **Logo** | **Earth Contour / Richtung C**, drei unveränderte organische Konturlinien mit blauem Messpunkt. Varianten `logo-dark.svg`, `logo-light.svg`, `icon-dark.svg`, `icon-light.svg`. | [Logo-Originale](../../assets/brand/logo/README.md) / DEC-010 bis DEC-012. | **Bereits freigegeben**; Preview verlinkt die Originaldateien, keine Neuzeichnung. |
| **Farben** | Deep Sea **`#021934`**, Ice White **`#F2F9FF`**, Dark-Logo-Blue **`#19B7F4`**, Light-Logo-Blue **`#10AAEC`**, Glacier **`#37D6C4`**, Deep Night **`#071522`**. Semantische UI-Farben bleiben abweichend ausreichend kontrastreich, z. B. Primary Light `#026E9E`. | [Farbsystem](colors.md) / [Source Tokens](../../packages/ui/tokens/colors.ts) / DEC-014, Kontrastprüfung 18/18 aus Aufgabe 004. | **Bereits freigegeben**; die beiden Logo-Blauwerte sind nicht austauschbar. |
| **Typografie** | **Space Grotesk** für Headlines und **Inter** für UI/Untertitel/Erklärtexte. Beide SIL OFL 1.1; keine proprietären Fonts. | [Typografie](typography.md) / [OFL-Nachweise](../../assets/brand/fonts/README.md) / DEC-013/015/016. | **Bereits freigegeben**; Websystem nutzt sinnvolle Fallbacks, Original-Lizenznachweise bleiben bestehen. |
| **Thumbnail** | **Genau ein** Masterlayout `assets/brand/thumbnails/template.svg` mit Original-Logo oben links, großem Titel links, Motiv rechts und türkisem Akzent. Drei thematische Mockups sind **keine** weiteren Templates. | [Visual Language](visual-language.md) / [einziges Master-SVG](../../assets/brand/thumbnails/template.svg) / DEC-017, Chromium 12/12 (Task 006). | **Bereits freigegeben**; Board zeigt drei Inhaltsbeispiele desselben Masters. |
| **Filmische Motion** | **Original-Intro 2,5s / AAC**, **Original-Outro 6,0s / stumm**; **zwei Video-Crossfades 0,3s (9 Frames bei 30fps)** und **durchlaufende Film-Hintergrundmusik über das Outro**. | [Finale Originalmedien](../../assets/brand/motion/final/README.md) / [Motion Guidelines](motion-guidelines.md) / DEC-019 bis DEC-023; Medienprüfung [2/2 PASS](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068). | **Bereits freigegeben**; Originalclips unverändert; tatsächlicher Einbau in fertige Filme gehört nicht zum Branding-Gate. |
| **Web UI** | **Ein** Designsystem für Public-Videothek und Admin, Dark/Light, sechs Komponentenfamilien; Desktop, Tablet und Mobil. | [Freigegebenes UI-Kit](../../design/ui-kit-v01/README.md) / [12/12 Browser-QA](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44126245757) / DEC-024. | **Bereits freigegeben** nach explizitem „ok, einverstanden“. |
| **Voice-Charakter / Narration** | **Englisch, souverän, präzise, neugierig, zugänglich, bildstark, filmisch und seriös**, nicht monoton/schulbuchhaft oder alarmistisch. | **Bereits freigegebener Brand Brief** [Abschnitt 5](brand-brief.md), DEC-007. | **Redaktionelle Richtung bereits freigegeben.** **Kein** konkreter TTS-Anbieter, keine Sprecheridentität, kein Stimmklang oder synthetisches Voice-Preset ausgewählt; das folgt später. |
| **Storyboard-Frame** | **Ein beispielhaftes 1920×1080 SVG-Frame** mit kurzen Texten, großzügiger Bildfläche, Deep-Sea/Ice-White-Palette, türkisfarbener Betonung und dezentem Beobachtungspunkt. | [`design/brand-gate-v01/storyboard-1080p.svg`](../../design/brand-gate-v01/storyboard-1080p.svg) | **Neu für Aufgabe 009**; ist ausdrücklich eine **illustrative, datenfreie Konzeptszene**, **keine echte Satellitenaufnahme**. **Noch zur Sichtabnahme offen.** |

## 2. Narrations-/Voice-Charakter: vorhandene Freigabe vs. spätere Sprachentscheidung

Der originale [Brand Brief V0.1](brand-brief.md) hat die **Tonalität** bereits am 13.11.2026 festgelegt. Das ist die redaktionelle Voice-Richtung, die in diesem Brand-Gate **nicht neu entschieden** werden muss:

- **Haltung:** souverän, sachlich präzise, neugierig und zugänglich, filmisch-seriös.
- **Dramaturgie:** Frage/Beobachtung zu Beginn; gezielter Erkenntnisfortschritt, kein monotoner Faktenkatalog.
- **Nicht erlaubt:** sensationsheischender Alarmismus, erwiesenermaßen falsche Erzählungen, künstliche Wiederholung oder unnötig aufgeblähte Sprechertexte.
- **Sprache:** Englisch für öffentliche Film-Narration.

**Bewusst offen für spätere Roadmap-Aufgaben:** Auswahl eines konkreten Voice-Modells, einer Stimme, eines Sprechers, einer Stimmlage, eines TTS-Anbieters, Stimmproben, Lautheitstests und Narration-Rendering. In 009 wird **kein** bestimmtes Voice-Gender-/Altersideal und keine fiktive Sprachfreigabe behauptet.

## 3. 1920×1080 Storyboard-Filmframe (reines Designmuster)

**Datei:** [`design/brand-gate-v01/storyboard-1080p.svg`](../../design/brand-gate-v01/storyboard-1080p.svg).

- Canvas **exakt 1920×1080, 16:9**, keine Originalfoto-/Satellitenquelle erforderlich.
- Abstraktes Planetenmotiv und Liniengrafik: *vom Projekt geschaffenes dekoratives Layout*, keine behauptete Datendarstellung.
- Kurze sachliche Titelzone, **keine permanenten vollflächigen Texttafeln**.
- Für die Filmproduktion erlaubte UI-Ton- und Bildsprache, noch **kein tatsächlich verifiziertes Ozean-Skript**.
- Das gut sichtbare Label **„ILLUSTRATION ONLY — NO MEASURED OR SATELLITE DATA“** bleibt in der Designvorschau, damit niemand es für Beweismaterial halten kann. In realen Filmen ist der Einsatz einer solchen Illustration redaktionell angemessen zu kennzeichnen oder durch geprüftes Footage zu ersetzen.

**Abgrenzung:** Das Brand-Gate bewertet anhand **eines statischen Beispiel-Frames** nur Textdichte, Kontrast, Hierarchie und filmischen Gesamteindruck. Es prüft **nicht** eine wissenschaftliche Aussage oder die Ausgabe eines späteren Filmrenderers.

## 4. Motion-Gate M00: 10-Sekunden-Test vs. offiziell gewählte Intro-/Outro-Clips

Die ursprüngliche Roadmap nennt als **M00-Abnahmetor** ein „Brand-Kit V0.1“ plus einen **10-Sekunden-Motion-Test**, der erkennbar nach BlueDotAtlas aussieht.

**Vorhandener historischer Techniknachweis:** [10s Motion-Prototyp (Aufgabe 007)](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/43608120656) enthält Logo-Motion, Lower Third, Kartenmarker und Quellen-/Caption-Komponenten. **Der Nutzer hatte diese 10s-Präsentation ausdrücklich als tatsächliches Intro/Outro abgelehnt.** Sie bleibt also ausschließlich **Techniknachweis für In-Film-Grafiken**, nicht als offizielles Intro und nicht als Designabnahme einer separaten kombinierten 10s-Markenanimation.

**Verbindlich und bereits gewählt:** [Intro 2,5 Sekunden](../../assets/brand/motion/final/BlueDotAtlas%20Intro.mp4), [Outro 6 Sekunden](../../assets/brand/motion/final/BlueDotAtlas_Outro.mp4); Crossfade je 0,3s. Die zwei originalen Filmmedien bleiben unverändert.

Für die finale M00-Gesamtfreigabe ist noch zu entscheiden, ob **der historische 10s-Techniknachweis als reiner Motion-Test** das entsprechende ursprüngliche M00-Tor ausreichend belegt oder ob ein gesonderter aktualisierter Test **außerhalb** der Original-Intro-/Outro-Dateien gewünscht ist. **Keine stillschweigende Umdeutung der abgelehnten 10s-Brandpräsentation.**

## 5. Versions- und Änderungsregeln

1. Dieses Dokument wird als **Brand-Kit V0.1** versioniert und verweist auf **Originaldateien als Source of Truth**. Kopien, alternative neue Logos und zweite Thumbnail-Master sind ausgeschlossen.
2. Änderung an bereits festgelegter Marke erfordert: neues Issue/Branch, Gegenüberstellung der alten und vorgeschlagenen Werte, Tests, **ausdrückliche Nutzerentscheidung**, Entscheidungseintrag, PR-Merge; kein stilles Überschreiben.
3. Filmbezogene Quellen-/Rechteprüfung bleibt eine projektweite Pflicht **bei späteren Veröffentlichungen**, aber ist kein rückwirkend reaktivierter Gate-Blocker für Aufgabe 007.
4. Der zentrale [Repository-README](../../README.md)-Überblick wird bei jeder freigegebenen Änderung aktualisiert (DEC-022).
5. Vorlagen- oder Board-Daten sind ausdrücklich konzeptionell, **keine echten wissenschaftlichen Datensätze**.

## 6. Brand-Gate-009-Abnahme-Checkliste

- [x] Die acht vorherigen Roadmap-Aufgaben **001–008** wurden mit konkreten Original-Assets und QA-Nachweisen inventarisiert.
- [x] **Name, Claim, Original-Logo, Farben, Typografie, ein Thumbnail-Master, Motion und freigegebenes UI-Kit** mit maßgeblichen Dateien verlinkt.
- [x] Redaktioneller **Voice-Charakter** aus dem freigegebenen Brand Brief nachgewiesen und von der zukünftigen konkreten Sprecherauswahl sauber getrennt.
- [x] **1080p-Storyboard-Designmuster** als eigenständige editierbare SVG-Datei erstellt und als Illustration gekennzeichnet.
- [x] **Chromium-QA 4/4 PASS**: Brand-Board auf 1440/960/375px ohne horizontalen Überlauf, alle **7 visuellen Original-Assets** geladen; eigenständiges SVG mit **exakt 1920×1080** inklusive Illustration-Hinweis. [Run #44128980711](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44128980711), [4 PNG-Screenshots + QA JSON](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44128980711/artifacts/14348153207).
- [ ] Der Auftraggeber hat die **Gesamtschau, das einzelne Storyboard-Frame und den Status des historischen 10s-Motion-Tests** ausdrücklich geprüft und entschieden.
- [ ] **Brand-Kit V0.1 als verbindliches M00-Gate** durch Nutzer bestätigt, Entscheidung im Decision Log erfasst.
- [ ] [Issue #21](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/21) und PR nach Tests/Review/Merge schließen; danach in Roadmap M01 / Aufgabe 010 wechseln.

**Stand: vor finaler Nutzerprüfung, daher bewusst keine 009-Abnahme oder M00-Gate-Freigabe behauptet.**
