# Anbieterregister V0.1 – Roadmap 015

**BlueDotAtlas · Prüftag: 18.11.2026 (UTC) · Status: Vom Betreiber am 19.11.2026 (UTC) ausdrücklich freigegeben (DEC-031).**  
**Quelle:** [Master Roadmap V0.1, S. 5](../project/BlueDotAtlas_Roadmap.pdf) · [Issue #32](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/32).  
**Erweiterung durch den Betreiber:** **Unsplash** für Fotos ausdrücklich ergänzen.

## Leseregeln

- **„Dokumentiert“** bedeutet: Die **offizielle** Richtlinie oder API-Dokumentation wurde am Prüftag öffentlich eingesehen. Es bedeutet **nicht**, dass ein API-Key vorliegt, ein Testaufruf erfolgreich war oder jeder Asset für BlueDotAtlas lizenziert ist.
- **„Kandidat“** bedeutet: grundsätzlich für einen späteren, **nach Nutzungsart individuell geprüften** Einsatz erwägenswert; **keine produktive Aktivierung** durch diese Aufgabe.
- **„Optional / eingeschränkt“** bedeutet: Zugang, Nutzer-/Assetrechte, Lizenz, Geld oder Nutzungsform benötigen vor Aktivierung eine weitere Freigabe. **„Nicht als Pflichtabhängigkeit“** heißt: Der MVP darf auch ohne diesen Anbieter funktionieren.
- Die freigegebene [Rechtematrix 014](../legal/rights-matrix.md) gilt weiterhin **pro Bild/Clip/Datensatz/Stimme und konkretem Publikationszweck**. Unklar = **BLOCKED**, nicht automatisch `APPROVED`.

## Wissenschaft und Earth-Material

| Anbieter | Geprüfte offizielle Bedingungen und Zugriff | V0.1-Entscheidung |
| --- | --- | --- |
| **NASA** | [NASA Images & Media Usage](https://www.nasa.gov/nasa-brand-center/images-and-media/). Viele Medien können für Information/Bildung verwendet werden; **NASA-Logos, Personenrechte, Werbung/Endorsement und fremdes Drittmaterial** sind getrennt zu prüfen. Der Archivzugang ist öffentlich beschrieben, **kein eigener automatisierter Abruf getestet**. | **Kandidat – redaktionelle Quellen und ausgewählte Medien**, mit Prüfung pro Datei; keine pauschale NASA-Rechtefreigabe |
| **NOAA** | [NOAA/OMAO Image Licensing](https://www.omao.noaa.gov/image-licensing-usage-info). US-Bundesmaterial häufig nutzbar; **NOAA-Emblem nicht frei verwendbar**, keine implizite Unterstützung, Copyright-Drittmaterial und erkennbare Personen separat prüfen. Kein API-Key/Feedabruf getestet. | **Kandidat – Klima/Wetter/Ozean**, Asset- und Quellenprüfung |
| **USGS** | [USGS Copyrights and Credits](https://www.usgs.gov/information-policies-and-instructions/copyrights-and-credits), [Topo-Maps-Rechte](https://www.usgs.gov/faqs/are-usgs-topographic-maps-copyrighted). Eigenes USGS-Werk meist gemeinfrei, **Drittgrafiken/Fotos und bestimmte Karten-Zulieferdaten** sind Ausnahmen. Keine konkrete Schnittstelle technisch getestet. | **Kandidat – Geodaten und wissenschaftliche Visualisierung**, Herkunft pro Datensatz beachten |
| **ESA (Website-Medien)** | [ESA-Bild-/Videobedingungen](https://www.esa.int/cs/terms-and-conditions/terms-and-conditions-for-images-and-videos). Redaktionelle/informatorische Dokumentationen unter Bedingungen (Credits/Endorsement/Urheber) möglich. **Kommerzielle Nutzungen bedürfen laut ESA gesonderter schriftlicher Genehmigung**; Drittmaterial gesondert. | **Eingeschränkt** – keine allgemeine Freigabe für einen kommerziellen/monetarisierten BlueDotAtlas-Film; pro Asset/Nutzungsart klären |
| **Copernicus Sentinel / CDSE** | [Copernicus Data Space Terms](https://dataspace.copernicus.eu/terms-and-conditions), dort verlinkte *Sentinel Data Legal Notice*. **Sentinel-Daten** werden frei, vollständig und offen unter jener Legal Notice angeboten; **andere Website-Inhalte** unterliegen abweichenden, teils nichtkommerziellen Regeln. EO-Datenzugang setzt Registrierung voraus; kein Konto/Download getestet. | **Kandidat – rohe Earth-Observation-Daten**; Portalbilder/Maps separat prüfen, Registrierung erst bei konkreter Integration |

## Stock-Bilder und Videomaterial

| Anbieter | Geprüfte offizielle Bedingungen und Zugriff | V0.1-Entscheidung |
| --- | --- | --- |
| **Pixabay** | [Content License](https://pixabay.com/service/license-summary/) und [API-Dokumentation](https://pixabay.com/api/docs/). Bilder, Video und teilweise Ton grundsätzlich für redaktionelle/kommerzielle Medienprojekte verwendbar, **nicht unverändert als eigenes Produkt weiterverkaufen**; Personen, Marken, andere Rechte und konkrete Assets prüfen. API mit Schlüsseln/Quoten und Rate-Limits; kein Key getestet. | **Kandidat – Bild/Footage**, manueller oder späterer API-Adapter nach Freigabe |
| **Pexels** | [Pexels License](https://www.pexels.com/license/) und [API-Key-Hilfe](https://help.pexels.com/hc/en-us/articles/900004904026-How-do-I-get-an-API-key). Fotos/Videos häufig kostenfrei auch kommerziell nutzbar, jedoch Personen/Marken und Nutzungsverbote beachten. **Pexels meldet am 18.11.2026: Vergabe neuer API-Keys derzeit pausiert.** Kein vorhandener Key beim Betreiber bestätigt. | **Optional, nicht MVP-kritisch** – keine automatische Pexels-Integration voraussetzen; bereits lizenzierte Einzelmedien ggf. manuell |
| **Unsplash – Fotos** | [Unsplash License](https://unsplash.com/license), [Release-/Trademark-Hinweise](https://help.unsplash.com/en/articles/2612329-releases-and-trademarks). **Kostenlose auch kommerzielle Fotoverwendung** grundsätzlich erlaubt; Lizenz allein sichert **Persönlichkeits-, Marken- und Eigentumsrechte** nicht pauschal. Unsplash+ hat gesonderte [Abo-Lizenz](https://unsplash.com/plus/license), hier **nicht** automatisch enthalten. | **Kandidat – Fotos/Stills/Thumbnails**, kein Videoclip-Provider, Rechte je Foto prüfen |
| **Unsplash – API** | [API-Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines), [API-Dokumentation](https://unsplash.com/documentation). Im **API-Kontext** sind u. a. **Hotlinking**, Fotografen-/Unsplash-Attribution samt Links und Aufruf von `photo.links.download_location` beim Download gefordert; Schlüssel geheim halten. **Demo-Limit laut aktueller Doku 50 Anfragen/Stunde**, höherer Produktionszugang nur nach Freigabe. Es wurde **kein API-Key beantragt oder geprüft**. | **API-Kandidat, noch nicht aktiviert** – manueller Fotoeinsatz unabhängig von späterer API-Integration möglich |
| **Wikimedia Commons** | [Reusing content outside Wikimedia](https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia/en). Lizenz **pro Datei** (CC BY, CC BY-SA, Public Domain usw.), Urheber-/Attributionsangaben und gegebenenfalls Weitergabe-/Bearbeitungsbedingungen beachten. **Wikimedia ist keine einheitliche „alles frei“-Lizenz**. | **Kandidat – manuell prüfbare Einzelassets**, spätere Adapteroption; pro Datei Lizenz-Snapshot |

## Rendering und Stimme

| Anbieter / Tool | Geprüfte offizielle Bedingungen | V0.1-Entscheidung |
| --- | --- | --- |
| **Remotion** | [Lizenz und Preise](https://www.remotion.dev/docs/license/pricing), [Lizenz-FAQ](https://www.remotion.dev/docs/license/faq). Laut aktueller Preisseite **Free License für Einzelpersonen und Unternehmen mit höchstens drei Personen**, auch kommerziell, unter den jeweiligen Bedingungen; größere Firmen/andere Fälle erfordern eine Company License. **Projekt-/Team-Eignung und eventuelle Kosten vor produktiver Aktivierung gemäß Aufgabe 016 klären.** | **Technischer Kandidat**, kein pauschaler Lizenz-/Kostenfreibrief; FFmpeg-Proof 013 allein ist kein Remotion-Test |
| **Piper TTS (lokal)** | [Piper-Projektwechsel](https://github.com/rhasspy/piper) und [Piper1-Lizenzhinweise](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/LICENSING.md). **Aktueller Piper1-Engine-Code GPL-3.0-or-later**; **Stimmenmodelle besitzen eigenständige, teils unklare Herkunfts-/Nutzungsrechte**, Lizenzzeile in Model Cards ist nicht automatisch umfassender kommerzieller Freibrief. | **TTS-Kandidat nach Prüfung eines konkret ausgewählten Voice-Modells**, nicht als fertige kommerzielle Stimme freigegeben |
| **ElevenLabs TTS** | [Terms of Use](https://elevenlabs.io/terms-of-use). Laut den aktuellen Bedingungen **kostenfreie Nutzung nur nichtkommerziell**, kommerzielle Nutzung über passende Bezahlpläne und vorbehaltlich weiterer Voice-/Output-Regeln. **Keine API-Keys, Vertragsrechte oder Kosten genehmigt.** | **Optionaler TTS-Kandidat, derzeit nicht aktiviert**; erst Anbieter-/Stimmenrechte und Kostenbudget 016 freigeben |

## Entscheidung für den nächsten Arbeitsschritt

**Manuell kuratierbar nach Einzelfreigabe:** NASA/NOAA/USGS, Copernicus Sentinel, Pixabay, Unsplash-Fotos und passende Commons-Dateien. **Nicht** gleichzusetzen mit einer pauschal erlaubten produktiven Nutzung oder aktivem API-Zugang.

**Vorbehalt / nicht als Pflichtabhängigkeit:** ESA-Website-Medien bei kommerzieller Nutzung, Pexels-API ohne bereits vorhandenen Schlüssel, Unsplash-API ohne geprüften Zugang, Unsplash+, lizenz-/kostenabhängiges TTS. **Remotion** ist ein technischer Lizenzkandidat, keine hier aktivierte Produktionssoftware.

**Noch nicht auf dem Betreiberkonto geprüft:** tatsächliche API-Keys, Live-API-Antworten, projektbezogene Verträge, laufende Quoten, kommerzielle Nutzungsrechte einzelner konkreter Assets und Stimmen. Diese Dinge nicht als „getestet“ oder „freigeschaltet“ darstellen. **Aufgabe 015 ist Bestandsaufnahme aktueller Dokumentation, nicht die Erstellung von 13 kostenpflichtigen Konten.**

## Kleine Abnahmeprüfung

- [x] Offizielle Anbieterlinks, Zugangswege und Stand **18.11.2026** dokumentiert.
- [x] NASA, NOAA, USGS, ESA/Copernicus, Pixabay, Pexels, Wikimedia, **Unsplash**, Remotion und zwei TTS-Kandidaten getrennt erfasst.
- [x] Fehlende oder eingeschränkte API-Zugänge/Kosten sichtbar gemacht, keine automatische Aktivierung/Provider-Zusage.
- [x] Wichtige Nutzungsregeln einschließlich Unsplash-Lizenz **vs. API-Anforderungen**, ESA, Copernicus-Datentrennung und Pexels-API-Pause dokumentiert.
- [x] **Inhaltliche Nutzerabnahme** am 19.11.2026 (UTC) durch „Ok“ auf die konkrete Freigabefrage erteilt; PR-Merge und Issue-Abschluss dokumentiert.

**Wichtige Folgeaufgaben:** [014 Rechte](../legal/rights-matrix.md), **016 Budget und Freigabegrenzen**, 035–036 Pilot/Einzelasset-Rechte, M06/M08 für echte Quellen-/Mediendienste. Verfügbarkeit oder Bedingungen können sich vor Implementierung ändern; vor echter Aktivierung einen kurzen gezielten Recheck durchführen.
