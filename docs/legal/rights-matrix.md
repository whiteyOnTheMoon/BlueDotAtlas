# Rechte- und Nutzungsrisiken – Matrix V0.1

**BlueDotAtlas · Roadmap 014 · Entwurf zur Nutzerabnahme**  
**Quelle:** [Master Roadmap V0.1, S. 5](../project/BlueDotAtlas_Roadmap.pdf) · [Issue #31](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/31).  
**Zweck:** Vor Nutzung von Quellen, Bildern, Videos, Musik, Karten, Daten und Stimmen Risiken erkennen und Entscheidungen nachvollziehbar festhalten. **Kein Rechtsgutachten und keine pauschale Freigabe einzelner Anbieter.**

## Grundregel und Status

**Kostenlos auffindbar, öffentlich zugänglich oder „für Bildungszwecke“ heißt nicht automatisch für BlueDotAtlas nutzbar.** Auch ein technisch abrufbarer Download oder eine API-Antwort stellt keine Nutzungserlaubnis dar.

| Status | Bedeutung | Folge |
| --- | --- | --- |
| `UNREVIEWED` | Herkunft, Lizenz oder Nutzungszweck noch nicht vollständig geprüft | **BLOCKER** für Verwendung in freizugebenden Filmprojekten und öffentliche Publikation |
| `APPROVED` | Nachweise liegen vor und decken die **konkrete Nutzung** ab (ggf. mit Pflichten) | Nur im dokumentierten Umfang verwenden; Credits und Bedingungen einhalten |
| `BLOCKED` | Wichtiger Nachweis fehlt, unklare Auslegung oder Konflikt | Nicht für finale Timeline oder Veröffentlichung freigeben; recherchieren, ersetzen oder Nutzung ausschließen |
| `REJECTED` | Ausdrücklich unzulässig oder rechtlich/vertraglich ungeeignet | Nicht verwenden; anderen Asset/Provider wählen |

Status gilt **pro Asset, Version und Nutzungskontext**; ein früheres `APPROVED` ist keine Blankoerlaubnis für andere Plattformen, Bearbeitungen oder Werbeformen. **Automatische Veröffentlichung gibt es nicht**: Vor `Published` bleibt eine separate manuelle, redaktionelle Freigabe notwendig.

## Risikomatrix

| Bereich | Zu prüfen | Typisches Risiko / harter Blocker | Maßnahmen und Nachweis |
| --- | --- | --- | --- |
| **Quellenzugriff / Texte** | Herkunft, Zugangs-/API-Regeln, Abruf-/Speicher-/Zitat-/Vervielfältigungsrechte, zulässige Wiederverwendung von Texten | Offen lesbare Nachricht wird ungeprüft kopiert, gespiegelt oder weitergegeben; Abruf-/Nutzungsbedingungen fehlen | Quell-URL, Zugriffsdatum, erlaubte Nutzung, Zitatform und ggf. Einschränkungen erfassen. Fakten belegen, **fremde Formulierungen nicht als eigenes Werk übernehmen** |
| **Bilder / Satellitenfotos** | Urheber, Agentur/Quelle, Drittmaterial, Bearbeitung/Crop, kommerzielle Video- und Thumbnail-Nutzung, Credit | Foto ist auffindbar, aber Lizenz, Dritturheber oder zulässige Bearbeitung sind unklar | Original-Link, Lizenz-/Freigabetext, Version/Datum, Credit, geplante Verwendung und ggf. Bildzuschnitt dokumentieren; **ungeklärt → BLOCKED** |
| **Videoclips / Footage** | Filmmaterial-, Ton-, Rechteinhaber-, Model-/Location-/Markenrechte, Kürzung, Color-Grading, Plattform-/Monetarisierungsrechte | Clip kann heruntergeladen werden, enthält aber Drittton, Personen oder beschränkte Nutzung | Pro Clip und relevanter Spur Rechte/Quellen nachweisen; Original-Datei/Hash, In/Out, Bearbeitung und Freigabe festhalten; **fehlender Nachweis → BLOCKED** |
| **Musik / Soundeffekte / Ambience** | Komposition, Aufnahme, Synchronisation mit Bild, Bearbeitung, Nutzungsplattform und Credits, Laufzeit/Ablauf | „Royalty free“ wird mit „ohne Lizenzbedingungen“ verwechselt; Musik darf nicht mit Film synchronisiert werden | Track-ID, Urheber/Anbieter, exakte Lizenz-/Kaufbedingungen, Freigabe von Sync/Veröffentlichung und Credits dokumentieren; **ungeklärt → BLOCKED** |
| **Karten / Tiles / Geodaten** | Kartenanbieter-/Tile-Regeln, Kartenstil, Attribution, Offline-/Videoexport und Ableitungen | Screenshot oder Kartenkacheln werden ohne erlaubten Export/Attribution in Film gerendert | Daten- und Kartenstil-Lizenzen getrennt erfassen; zulässige Videoausgabe und Kartenhinweise nachweisen |
| **Wissenschaftliche Daten / Diagramme** | Datenlizenz, Quelle, Messzeitraum/Version, erlaubte Visualisierung und Weitergabe | Offene Daten werden fälschlich als frei von Nutzungs-/Creditpflichten behandelt; Diagramm verschleiert Datenstand | Datensatz-ID/URL, Version, Zeitraum, Lizenz/Attribution und Ableitungsregeln erfassen; für konkrete Zahlen zusätzlich Belegprüfung gemäß **V08** |
| **Marken / Logos / Institutionen** | Markeninhaber, Benutzungskontext, zulässige Namensnennung/Logo-Einblendung, mögliche falsche Partnerschaftsanmutung | NASA-/NOAA-/ESA-Logo oder fremde Marke wirkt wie eine offizielle Unterstützung | Institution möglichst sachlich benennen; fremde Logos nur nach geklärter Nutzung und ohne irreführende Zugehörigkeit; **ungeklärt → BLOCKED** |
| **Personen / Aufnahmen** | Bildnis-/Persönlichkeits- und Datenschutzaspekte, Kontext, Einwilligung/sonstige Grundlage, sensible Situationen | Erkennbare Personen werden aus Stock- oder Dokumentaraufnahmen in unpassenden Kontext gestellt | Nutzungskontext und Berechtigung prüfen; keine irreführende Zuschreibung oder entwürdigende Darstellung; unklare Personenrechte **BLOCKED** |
| **TTS-Stimmen / Sprecher** | Provider-/Modell-/Stimmenrechte, kommerzielle Audio-/Videonutzung, Speicherung, Bearbeitung, Widerrufs-/Vertragsbedingungen | Stimme wird ohne bestätigte Nutzungsrechte oder als täuschende Imitation eingesetzt | Stimme/Modell/Version, Rechtsgrundlage, Datum, Ausgabebedingungen und ggf. erforderliche Einwilligung festhalten; **keine unautorisierte Stimmenimitation** |
| **Film- und Plattformveröffentlichung** | Rechte für fertiges MP4, Website, manuellen YouTube-Upload, ggf. Monetarisierung, Teaser/Thumbnail, Credits, Dauer/Ablauf | Einzelassets sind nur für interne Vorschau oder nicht für die geplante Plattform freigegeben | Vor Veröffentlichung alle verwendeten Assets gegen den **konkreten Veröffentlichungszweck** prüfen; Credits, Auflagen, Ablauf/Entzug dokumentieren; **ein ungeklärtes Pflichtasset verhindert Publish** |

**Priorität:** Die Kombination aus unklarem Rechteinhaber, fehlender Erlaubnis oder ausgeschlossener Nutzungsart ist ein **harter Freigabeblocker**. Kein numerischer Gesamtscore darf diesen Blocker überstimmen. Technische Vollständigkeit des MP4 ist dafür unerheblich.

## Minimaler Prüfdatensatz (für spätere Media Library)

Ein einzelner Nachweis pro fremdem Asset / Quelle genügt als Beginn; zusätzliche Tabellen- und Workflowautomation wird **nicht** in Aufgabe 014 gebaut.

| Feld | Beispielwert / Erwartung |
| --- | --- |
| `asset_id`, `asset_type` | Interne Referenz und Typ (Bild, Clip, Musik, Karte, Daten, Stimme usw.) |
| `source_url`, `creator`, `provider` | Originalherkunft, Urheber, Plattform/Organisation |
| `license_basis`, `license_url_or_evidence`, `checked_at` | Exakte Rechtsgrundlage, Beleg/Vertragsversion und Datum |
| `intended_use` | Film-Szene, Thumbnail, Website, Video-Plattform, ggf. kommerzieller Einsatz, Bearbeitung |
| `conditions`, `attribution`, `expiry` | Auflagen, erforderliche Namensnennung, Laufzeit/Entzug |
| `file_hash_or_version`, `reviewer`, `decision`, `reason` | Welche Datei/Version, verantwortliche Person, Status und nachvollziehbare Begründung |

**Entscheidungsablauf:** Asset/Quelle erfassen → genaue Verwendung definieren → Beleg zur Berechtigung und zu Auflagen prüfen → `APPROVED` / `BLOCKED` / `REJECTED` protokollieren → vor finalem Render/Publish die zugehörige Version und nötige Credits bestätigen. Bei Unklarheit **kein stilles Freigeben**.

## Abgrenzung und spätere Aufgaben

- **Roadmap 014:** Risikoarten und Blockierregeln festlegen (dieses Dokument). **Keine** konkrete Freigabe aller Anbieter und keine vollständige juristische Einzelprüfung.
- **015:** Offizielle, aktuelle Nutzungsbedingungen und Zugriff für NASA, NOAA, USGS, ESA/Copernicus, Pixabay, Pexels, Wikimedia, Remotion und TTS-Kandidaten mit Prüfdatum/Links feststellen. **Keine NASA-/NOAA-/CC-Pauschalfreigabe vor diesem Check.**
- **036, 097–110:** Konkrete Pilotmedien prüfen und später Rechte-/Assetfelder sowie echte technische Sperren implementieren.
- **011 / V08 & V09:** Wissenschaftliche Claims müssen gesondert belegt sein (**V08**); Medien-/Musik-/Karten-/TTS-Rechte für jedes verwendete Drittasset geklärt (**V09**). **Faktenbeleg ersetzt keine Nutzungsrechte und Nutzungsrechte ersetzen keinen Faktenbeleg.**
- **M12:** Manuelle Veröffentlichungsprüfung mit finalem Asset-Verzeichnis und Credits; kein Autopublish.

## Abnahme für 014

- [x] Quellenzugriff, Bilder, Videos, Musik, Marken, Personen, Karten, Daten, TTS-Stimmen und Veröffentlichung **getrennt** erfasst.
- [x] Ungeklärte oder ausgeschlossene Nutzungsrechte als harte **BLOCKER** festgelegt.
- [x] „Gratis / öffentlich / herunterladbar“ ausdrücklich **nicht** mit Nutzungsfreigabe gleichgesetzt.
- [x] Einheitlicher minimaler Nachweis und Status je konkreter Nutzung beschrieben.
- [ ] **Inhaltliche Nutzerfreigabe** und anschließender PR-Merge / Issue-Abschluss.

**Hinweis:** Dies sind interne Produktions- und Prüfrichtlinien; bei schwierigen Einzelfällen oder strittigen Rechten muss eine geeignete fachliche Rechtsprüfung erfolgen.
