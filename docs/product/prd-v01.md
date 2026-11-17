# BlueDotAtlas — Product Requirements Document (PRD) V0.1

**Status: DRAFT — Roadmap 010 / M01. Nutzerfreigabe steht aus.**  
**Datum:** 17.11.2026 · [Issue #23](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/23) · Branch `docs/010-prd-v01`  
**Voraussetzung:** Roadmap 009 / [Brand-Kit V0.1](../brand/brand-kit-v01.md) wurde als M00-Gate abgenommen (DEC-025).

## 1. Zweck und Produktziel

**BlueDotAtlas** ist ein **englischsprachiges Earth-&-Climate-Video-Studio** zur **redaktionell kontrollierten** Recherche, Planung und Herstellung wissenschaftlich fundierter, cineastischer Dokumentationen über unseren Planeten.

Das Produkt bietet **zwei klar getrennte Bereiche**:

1. **Öffentliche Videothek:** Besuchende entdecken und spielen ausschließlich **ausdrücklich freigegebene und veröffentlichte** Videos ab. Keine unfertigen Inhalte, Projektdateien, Quellenregister oder Admin-Ansichten öffentlich anzeigen.
2. **Geschütztes Einzeladmin-Studio:** Eine verantwortliche Person erstellt Projekte in einem **siebenstufigen Produktions-Wizard**, prüft Aussagen und Medienrechte, erzeugt eine abspielbare Video-Datei und entscheidet **manuell** über die Veröffentlichung.

**V0.1 ist ein MVP mit klaren Stopps und menschlicher Kontrolle**, keine autonome Content-Fabrik, kein Multiuser-SaaS und kein vollständiges Videoschnittprogramm.

**Wichtig:** Dieses PRD beschreibt **angestrebte Produktfunktionen**, **nicht bereits implementierte Systeme**. Im Repository sind derzeit Design-/Brand-Artefakte und ein UI-Kit-Prototyp, aber noch kein produktiver vollständiger End-to-End-Wizard vorhanden.

## 2. Zielgruppen und Jobs to be done

| Nutzerrolle | Hauptaufgabe | Sichtbarkeit / Entscheidungsrecht |
| --- | --- | --- |
| **Öffentliche Zuschauerinnen und Zuschauer** | Dokumentarfilme entdecken, verstehen und abspielen | Nur genehmigte öffentliche Videos samt überprüften Metadaten |
| **Einzeladmin / Redaktion** | Thema auswählen, recherchieren, Quellen belegen, Material und Skript prüfen, Stimme/Video erzeugen, Ergebnis freigeben | Authentifizierter geschützter Zugang; finale manuelle Entscheidung |
| **Rendering-/Provider-Dienste** | Aufträge der Redaktion technisch ausführen | Kein selbständiges Publikationsrecht und kein Ersatz redaktioneller Bewertung |

**Zielqualität:** Hohe authentische Zuschauerbindung durch gute Geschichten, starke echte Bilder, wissenschaftliche Korrektheit und klares Audio – niemals durch erfundene Ereignisse, täuschende Thumbnail-Texte oder künstliche Länge.

## 3. MVP-Erfahrung (Sollzustand, noch nicht gebaut)

### 3.1 Öffentliche Videothek

- Ruhige, wiedererkennbare BlueDotAtlas-Startseite mit Original-Logo, Claim und **Videokacheln**.
- Jede Kachel führt zur Videodetailansicht mit verifizierten Angaben (Titel, Beschreibung, Poster/Thumbnail, Veröffentlichungsdatum, Sprache, Dauer) und Browser-Player.
- Ausschließlich Datensätze im **manuell freigegebenen, veröffentlichten Zustand** sind öffentlich sichtbar. Ein erratener Slug darf nicht an einen unveröffentlichten Film oder Rohmedien führen.
- Responsiv, zugänglich und im visuellen System aus [UI-Kit V0.1](../../design/ui-kit-v01/README.md) (DEC-024). Ein sinnvoller Empty State bei leerer Videothek.

### 3.2 Geschütztes Einzeladmin-Studio

- **Genau ein** primärer Administrations-/Redaktionsbenutzer in V0.1, keine Team-Rollenverwaltung.
- Projektliste mit nachvollziehbaren Status- und Bearbeitungsinformationen.
- Persistenter Projektstand und erkennbarer manueller Schrittwechsel; keine stillschweigend kostenpflichtige oder irreversible Operation.
- Skript, Claim-Belege, Medienherkunft und geplante Szenen sind vor der Freigabe nachvollziehbar.
- Video aus manueller Produktion kann im geschützten Studio abgespielt, geprüft, heruntergeladen und archiviert werden, auch ohne es zu publizieren.

### 3.3 Der verbindliche siebenstufige Wizard

| Nr. | Roadmap-Name | Erwartete Produktfunktion in V0.1 | Freigabe-/Sicherungsprinzip |
| --- | --- | --- | --- |
| **01** | **New Video** | Neues Projekt, Arbeitsziel, Thema und redaktionellen Rahmen festlegen | Projektanlage startet **keinen automatischen Render** |
| **02** | **News Sources** | Relevante vertrauenswürdige Quellen konfigurieren/auswählen und ihre Abrufe erkennen | Herkunft, Aktualität und Quelle protokollieren |
| **03** | **Discover Topics** | Recherche- und Themenvorschläge prüfen; Aussagen mit Quellen verbinden | Unsichere oder nicht belegte Claims werden gekennzeichnet |
| **04** | **Media Library** | Bilder und Footage ansehen, selektieren und Quellen-/Lizenzinformationen zuordnen | Unklare Nutzungsrechte sind **Blocker** für produktive Verwendung |
| **05** | **Script Studio** | Englisches Drehbuch redaktionell überprüfen und Szenen strukturiert planen | Story-Fakten, Quellen, Zeitangaben und Laufzeit nicht erfinden |
| **06** | **Voice Studio** | Englische Sprecherfassung hören, prüfen und zeitlich an Szenen abstimmen | Kein ungeprüfter Provider-/Stimmenzwang; Kostenfreigabe vor Nutzung |
| **07** | **Video Production** | Bild-, Grafik- und Tonspuren als Vorschau/1080p-MP4 rendern; Ergebnis prüfen | Technische und redaktionelle Prüfung vor **manueller Veröffentlichung** |

**Späteres System-Design:** Die sieben Schritte sind eine **durchgehende Navigation mit eindeutigem Datenzustand**, nicht sieben unabhängige Datenkopien. API-Schutz, Datenmodell, Provider-Adapter und Renderworker werden in späteren Roadmap-Aufgaben umgesetzt und verifiziert.

## 4. Videoziel und Qualitätsreihenfolge

- **Inhaltliches Längenziel für reguläre BlueDotAtlas-Dokumentationen: 8–10 Minuten**, **nur sofern Thema, Quellen und Storytelling diese Länge rechtfertigen**. Kein hartes Quota- oder Stretching-Gebot.
- **Bevor ein Langfilm-Workflow behauptet werden darf**, wird in Roadmap M03 ein **echter, nachvollziehbarer 60-Sekunden-Pilotfilm** erstellt und abgenommen (Bild, Quellen, Rechte, Narration, Ton und technisch gültiges MP4). M04 entwickelt anschließend den Scene Director und prüft die längere Produktion.
- **Ausgabe-Richtung:** Full HD **1920×1080, 30 FPS**, H.264/AAC im MP4-Container als vorhandener Motion-/Brand-Standard. Endgültige technische Akzeptanzgrenzen und der VPS-Render-Check werden **nicht** in 010 erfunden, sondern in Aufgaben 011–013, 045 und 048 geprüft.
- **Filmkontinuität:** [Original-Intro 2,5s](../../assets/brand/motion/final/BlueDotAtlas%20Intro.mp4) und [Original-Outro 6,0s](../../assets/brand/motion/final/BlueDotAtlas_Outro.mp4) werden beim späteren Rendern verwendet; **beide visuelle Crossfades 0,3s / 9 Frames**, die Film-Hintergrundmusik spielt über das stumme Outro (DEC-023). Keine Veränderung der Originaldateien.
- **Publikation:** Nur ein gültiges, redaktionell akzeptiertes Video mit geklärter Rechtekette und ausdrücklicher manueller Freigabe darf `Published` werden.

## 5. Entscheidbare Feature-Klassifikation

**Regel:** Jede spätere Idee erhält einen Status; **MVP** bedeutet *in V0.1 vorgesehen*, **nicht bereits implementiert*. **Später** bedeutet *möglicher Ausbau nach separatem Ziel/Beschluss*, **Ausgeschlossen V0.1** bedeutet *bewusst kein Bestandteil oder aktiv verboten im aktuellen Release*. Ein späterer Ausbau ist **keine** automatische Freigabe.

| Funktion / Produktwunsch | Klassifikation | Begründung und Abgrenzung |
| --- | --- | --- |
| Öffentliches Video-Grid, Detailseite und Player | **MVP** | Kernnutzen für Zuschauer; nur explizit veröffentlichte Medien |
| Geschützter Zugang für **einen Admin** | **MVP** | Klare Einzelredaktion; Authentifizierung und API-Schutz werden später technisch implementiert |
| Projektliste, Zustände und **7 Wizard-Schritte** | **MVP** | Durchgehender redaktioneller End-to-End-Pfad |
| Quellenbasierte Recherche und Faktenbelege | **MVP** | Wissenschaftliche Glaubwürdigkeit / redaktionelle Kontrollierbarkeit |
| Medienvorschau, Medienwahl und Rechte-Blocker | **MVP** | Ungeprüftes Footage darf nicht als freigegeben gelten |
| Englische Skriptprüfung, Stimmvorschau, Szenenplanung | **MVP** | Kontrollierte dokumentarische Produktion |
| Videoerzeugung, Vorschau, geschützter MP4-Download | **MVP** | Messbares Ergebnis, nicht nur Texte/Screens |
| **60-Sekunden-Realfilm-Proof vor Langfilm** | **MVP / Entwicklungs-Gate** | Nachweis der Filmtechnik in M03 |
| Reguläre englische Doku mit Ziel **8–10 Minuten bei Substanz** | **MVP / Qualitätsziel** | Keine künstliche Länge; Langfilm erst nach verifizierter Engine |
| **Manuelle** redaktionelle Freigabe und **manuelles** Publish | **MVP** | Mensch behält die Veröffentlichungskontrolle |
| Ein verbindliches Logo-/Thumbnail-/UI-/Motion-Brand-Kit | **MVP / bereits als Design freigegeben** | M00 erledigt, Implementierung folgt |
| Vollständige wissenschaftliche Daten-/Quellenvisualisierung und aufwendiger Globe | **Später** | Erweiterung nach Basis-Engine; datengetriebene Layer brauchen eigene Prüfung |
| Zusätzliche Sprachen und Untertitel-Mehrsprachigkeit | **Später** | V0.1 primär englischsprachig; Weiterentwicklung separat freigeben |
| Produktionsanalytik / detaillierte CTR-Optimierungsautomatik | **Später** | Erst nach Pilot und echter Nutzung valide |
| Automatisierte Varianten von Titeln und Thumbnails | **Später** | Separate redaktionelle/Qualitätssicherung notwendig |
| Mehrere Kanäle, Rollen, Nutzerkonten und Teams | **Ausgeschlossen V0.1** | Einzeladmin ist bewusstes Produktlimit; möglicher späterer Scope benötigt eigenen Beschluss |
| **Automatisches Veröffentlichen**, Autopublish, YouTube Data API-Upload | **Ausgeschlossen V0.1** | Upload/Endscreen zunächst manuell; kein Renderjob darf direkt publizieren |
| Vollwertiger freier Timeline-/Drag-and-Drop-Videoeditor | **Ausgeschlossen V0.1** | Gezielter Wizard und reproduzierbare Film-Engine statt vollwertigem NLE |
| Unüberprüfte Claims, ungeklärte Medienlizenzen, erfundene Satellitendaten | **Ausgeschlossen – dauerhaftes Qualitäts-No-Go** | Widersprechen den bereits freigegebenen redaktionellen Standards |
| Kostenpflichtige APIs/Provider ohne Budget-Genehmigung | **Ausgeschlossen – ohne Freigabe** | Finanz- und Provider-Gates folgen M01 / Aufgaben 015–016 |

### Prüffragen für neue Features

1. Hilft es dem **öffentlichen Ansehen veröffentlichter** Dokus oder dem **geschützten siebenstufigen Einzeladmin-Workflow**?
2. Lässt es sich mit **redaktioneller Kontrolle, Quellen-/Rechtenachweis und manueller Publikation** vereinbaren?
3. Ist es ein Teil des **erforderlichen 60s-Proofs** beziehungsweise des begründeten 8–10-Minuten-Ziels, statt technischer Luxus?
4. Fügt es Multiuser, Autopublish, vollwertigen Videoschnitt, neue Sprachen/Provider/Kosten oder ungeprüfte Fakten hinzu? Dann **nicht automatisch MVP**; explizite neue Entscheidung erforderlich.
5. Fehlt eine Roadmap-Grundlage oder Nutzungsklarheit? Markierung **„Vorschlag – noch nicht entschieden“**; nicht stillschweigend als akzeptiertes V0.1-Feature eintragen.

## 6. Ausdrückliche Nicht-Ziele für V0.1

**Nicht enthalten:** YouTube-Autopublishing und Kanalautomatik, mehrere Nutzer/Teams oder Mandanten, komplette Timeline-Schnittsoftware, unüberprüftes automatisches Render→Publish, beliebige externe Medienverwertung ohne dokumentierte Rechte und erzwungenes Füllen von Laufzeit.

**Nicht vorweg entschieden:** VPS-Dimensionierung und Dienst-Auswahl, Redis/BullMQ, konkreter TTS-Provider/Sprecher, echte API-Schlüssel, Provider-Preise, monatliches Kostenlimit, Langfilm-Laufzeit-Garantie, Echtzeit-Engagement-Schwellen. Dafür gibt es eigenständige spätere M01- und Produktionsaufgaben.

## 7. Nachvollziehbare Produkt-Schranken und spätere Gates

| Risiko / Entscheidung | Verbindliche V0.1-Schranke | Zuständiger späterer Roadmap-Nachweis |
| --- | --- | --- |
| Technische 1080p-Renderfähigkeit | Nicht als bewiesen behaupten; real messen und Go/No-Go entscheiden | **011–013, 045, 048** |
| Quelle / wissenschaftlicher Claim | Quelle, Aktualität, Belegbarkeit und Unsicherheit sichtbar | **014–015**, später Research/Topics |
| Bild/Video/Musik/TTS-Rechte | Unklarer Status blockiert produktive Nutzung/Publikation | **014**, später Rechte- & Publish-Kontrollen |
| Providerkosten | Kein automatischer kostenpflichtiger Einsatz ohne Budget-/Auftrags-Freigabe | **016** |
| Geschützter Admin / nicht öffentliche Medien | Zugriff unabhängig von sichtbarer UI serverseitig schützen | M02 & M05 |
| Durchgängiger Wizard und Szenenrender | Stabile Zustandsverwaltung, Renderjobs und definierter Fortschritt | M02–M04, M11 |
| Veröffentlichung | **Manuelle Freigabe**, nur genehmigte Bilder, Skript, Voice, Metadaten, MP4 | M12 |

## 8. Roadmap-010-Abnahmekriterien

- [x] Öffentliche Videothek und **geschützter Einzeladmin** als unterschiedliche Nutzerflächen beschrieben.
- [x] Alle **sieben** Wizard-Schritte mit ihren offiziellen englischen Roadmap-Namen aufgeführt.
- [x] **8–10-Minuten-Ziel mit Inhaltsvorbehalt** und technische **60-Sekunden-Erstprobe** abgegrenzt.
- [x] **Autopublish, Multiuser und grafischer Voll-Editor** aus V0.1 ausdrücklich ausgeschlossen.
- [x] **MVP / später / ausgeschlossen** als Entscheidungsregel und Feature-Klassifikation formuliert.
- [x] **Statischer Roadmap-/Scope-/Link-Check 21/21 PASS**, einschließlich aller sieben Wizard-Stufen, MVP-/Später-/Nicht-Ziele und Original-Asset-Referenzen: [GitHub Actions Run #44131321849](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44131321849). **Das ist eine Dokumentationsprüfung, kein technischer MVP-Implementierungstest.**
- [ ] **PRD-V0.1-Vorschlag durch den Nutzer ausdrücklich abgenommen.** Das „ok, einverstanden“ vom 17.11.2026 galt ausschließlich Aufgabe 009 / M00, **nicht** diesem neuen PRD.
- [ ] Nach Freigabe PR mergen und [Issue #23](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/23) schließen.

**Versionierungsprinzip:** Neue Wünsche durch explizite Entscheidung, Änderung dieses PRD und der zentralen [README](../../README.md) im selben PR (DEC-022). Vor einer bestätigten Abnahme ist diese Datei **ein prüfbarer Entwurf**, keine bereits freigegebene Produkt-Spezifikation.
