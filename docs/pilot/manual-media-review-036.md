# Roadmap 036 – Vollbild-, Ton- und Rechteprüfung der Pilotvideos

**Status: Drei Prüfakten VORBEREITET, alle menschlichen Prüfungen AUSSTEHEND.**  
[Issue #60](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/60) · [Prüfakte als JSON](../../assets/pilot/manual-review-036.json) · [Rechtemanifest](../../assets/pilot/rights-manifest.json) · [echter technischer Byte-Proof](media-byte-proof-036.md) · [Rechtematrix 014](../legal/rights-matrix.md).

Diese Seite ist eine **kurze Review-Anleitung** für den Betreiber auf Handy oder PC. Die drei Clips wurden früher tatsächlich in kurzlebigen GitHub-CI-Runnern vollständig heruntergeladen, mit SHA-256/`ffprobe` identifiziert und anschließend gelöscht. **Ich habe die Videos hier nicht vollständig gesehen oder gehört.** Deshalb wird ausdrücklich **kein** menschlicher Bild-/Ton-/Rechte-PASS protokolliert.

## 1. Alle drei Originalclips vollständig ansehen

**Drei direkte offizielle MP4-Links; jeweils vom Anfang bis zum Ende abspielen, auch Ton nicht überspringen.**

| Asset / tatsächliche Laufzeit | Offizielle Datei, technischer Nachweis | Worauf besonders achten? |
| --- | --- | --- |
| **NASA Oma**, 27,84 s | [NASA-JSC-Original-MP4](https://eol.jsc.nasa.gov/Videos/CrewEarthObservationsVideos/videos/HurricaneOma_ISS058_2019-02/HurricaneOma_ISS058_2019-02.mp4) · [NASA-Quellseite](https://eol.jsc.nasa.gov/Videos/CrewEarthObservationsVideos/Special.htm) | ISS-Zeitraffer. **1080×720 (3:2)** und 25 fps – für den 16:9-/30fps-Film später Bildqualität/Crop prüfen. **Keine Audiospur**. NASA benennt das Video „Hurricane Oma“, korrekt im Film **Tropical Cyclone Oma** (Südpazifik 2019). |
| **NOAA Helene**, 34,83 s | [NOAA-OMAO-Original-MP4](https://www.omao.noaa.gov/sites/default/files/2024-09/09252024%20N43%20Eye%20of%20Helene%20Credit%20Nick%20Underwood.mp4) · [NOAA-Quellseite mit individuellem Credit](https://www.omao.noaa.gov/aircraft-operations/news-media/video/view-eye-helene-seen-noaa-wp-3d-orion-hurricane-hunter-credit-nick-underwood-noaa) | **4K, 59,94 fps, AAC-Ton**. Auf Personen, Marken/Logos, Flugzeug-Overlays, gesprochene Inhalte/Musik und ggf. zu entfernenden Originalton achten. Credit **Nick Underwood/NOAA**. Kein Oberflächen-/Meeresclip. |
| **NOAA offene See**, 17,48 s | [NOAA-Ocean-Exploration-Original-MP4](https://oceanexplorer.noaa.gov/wp-content/uploads/2012/09/072121-highseas-1920x1080-1.mp4) · [NOAA-Quellseite mit Credit](https://oceanexplorer.noaa.gov/ocean-fact/waves/) | **1920×1080, 29,97 fps, AAC-Ton 44,1 kHz**. Wasser/Wellen aus einer **Forschungsexpedition 2021**, **KEIN Hurrikan** und **kein Temperaturbeleg**. Auf Musik, Stimmen, Logos, Credits oder Fremdmaterial prüfen. |

**Technische Identität der damals abgerufenen Dateien (nur als Referenz):**

| Asset | SHA-256, ermittelt im originalen CI-Download |
| --- | --- |
| NASA Oma | `54ecdba5d5899fc7a2e8ee0f544359f59ddc45c13a26b919c3412b633416802c` |
| NOAA Helene | `8deebf2acf159ab91b3d9c6383de76bbbdb0069acffb9eb2f2c78dc478cd22c8` |
| NOAA offene See | `e341bba65deafbf5857f7913af45cef74de2effe0e431323884e88f88574443b` |

**Wichtig:** Ein Stream im mobilen Browser garantiert **keinen Hash-Abgleich mit einer später verwendeten lokalen Mediendatei**. Vor tatsächlicher Auswahl als Filmasset müssen die exakten Bytes des später verwendeten Originalfiles erneut lokal unter einem gesondert freigegebenen Medienverzeichnis mit dem Referenzhash verglichen und abgelegt werden. **Keine** Videos oder Screenshots in das öffentliche Git-Repositorium kopieren.

## 2. Prüffragen je Clip – erst nach vollständigem Anschauen beantworten

- [ ] **Vollständiges Bild:** Sind der **gesamte Clip** und seine Anfangs-/Endsequenzen geprüft, eventuelle Blenden/Overlays/Abweichungen mit Zeitstempel notiert?
- [ ] **Vollständiger Ton:** Bei Helene und NOAA-Meeresclip **gesamte** Original-Tonspur angehört; Musik, fremde Stimmen oder andere nicht zuordenbare Töne mit Timecodes erfasst? Bei Oma ohne Audiospur **begründet N/A**.
- [ ] **Drittinhalte/Personen/Logos:** Erkennbare Personen, fremde Marken, Senderlogos, Einblendungen, Dritt-Bildmaterial oder Datensätze untersucht? Unklare Bestandteile **nicht freigeben**.
- [ ] **Bildqualität und Tatsachenbezug:** Ist der für den 60s-Piloten geeignete Originalausschnitt nachvollziehbar und wird kein Sturm mit einem anderen verwechselt? Insbesondere NOAA-Meeresfilm als **allgemeine Wellenaufnahme**, nicht Hurrikan oder Warmwasser-Messung verwenden.
- [ ] **Konkret geplante Nutzung und Credits:** Den späteren Kontext (Website, YouTube, ggf. Monetarisierung, Schnitte, Credits und Non-Endorsement) mit **den speziellen offiziellen Bedingungen** abgeglichen? Keine geschützten Embleme als angebliche BlueDotAtlas-Partnerschaft verwenden.
- [ ] **Prüfer/Entscheid:** Erst nach dokumentierter kompletter Prüfung Datum, verantwortlichen Reviewer, bestätigten Original-Dateihash und nachvollziehbaren begründeten Einzelstatus im Folge-PR festhalten. Keine Freigabe per CI- oder Rechtsseiten-Link allein.

**Vorläufige Audio-Vorgabe:** **Originalton aus den beiden NOAA-Clips nicht in den Film übernehmen**, solange Drittton/Sprecher/Musik und Nutzungskontext nicht individuell freigegeben wurden. Damit wird **keine** Freigabe des Bildmaterials vorweggenommen.

## 3. Rechtliche Referenzen und konkrete Credits

- **NASA Oma:** [NASA JSC Earth-Imagery FAQ](https://eol.jsc.nasa.gov/faq/). Im späteren Film/Abspann: **Video courtesy of the Earth Science and Remote Sensing Unit, NASA Johnson Space Center**, genauer Videotitel/Quelllink. Keine implizite NASA-Partnerschaft und erkennbare Personen/Drittinhalte gesondert prüfen.
- **NOAA Helene:** [Originalseite](https://www.omao.noaa.gov/aircraft-operations/news-media/video/view-eye-helene-seen-noaa-wp-3d-orion-hurricane-hunter-credit-nick-underwood-noaa), [OMAO-Nutzungshinweise](https://www.omao.noaa.gov/image-licensing-usage-info). Individuellen Credit **Nick Underwood / NOAA** erhalten. NOAA-Emblem nicht als kommerzielles Gütesiegel verwenden.
- **NOAA offene See:** [Individueller Videocredit](https://oceanexplorer.noaa.gov/ocean-fact/waves/), [Ocean-Exploration-FAQ](https://oceanexplorer.noaa.gov/faqs/). Im Film/Abspann **Video courtesy of NOAA Ocean Exploration, 2021 North Atlantic Stepping Stones: New England and Corner Rise Seamounts** samt Originalseite nennen. Website-Inhalte grundsätzlich Public Domain, **ausdrücklich markierte Drittbeiträge ausgenommen**.

**Keine Pauschallizenz:** Dass ein Video von einer Behörde veröffentlicht wird, deckt nicht automatisch jeden hörbaren Ton, jede erkennbare Person oder jedes Fremdmaterial ab. Der endgültige Projektfreigabebeschluss ist vom Rechte-/Qualitätsreview und der tatsächlichen Filmverwendung getrennt.

## 4. Noch nicht auswählbar und Review-Ablauf

**Nicht in dieser Drei-Clip-Prüfung:** NOAA Ernesto (`P60-VID-002`, Original 183.440.133 Byte, über dem bisherigen 100-MB-CI-Limit, kein vollständiger Hash-/Byte-Proof) und NOAA-/Saildrone-Hurricane-Sam (`P60-VID-ALT-004`, **BLOCKED** wegen Drittanbieterrechten).

Du kannst die drei MP4s über die obigen Direktlinks auf dem Handy vollständig prüfen und mir anschließend beispielsweise **„Oma: Bild OK; Helene: Ton unklar ab 00:xx; Meer: Bild OK, Ton nicht verwenden“** mit etwaigen Timecodes zurückmelden. Das ist ein **Review-Input**, noch keine automatische Freigabe: Ich kann anschließend die tatsächlichen Beobachtungen sachlich in der Akte dokumentieren und offene Rechtefragen markieren.

Die [strukturierte Prüfakte](../../assets/pilot/manual-review-036.json) bleibt bis dahin **dreimal `PENDING`**, ohne fingierte Reviewer, Zeitstempel, vollständige Wiedergabe oder Timelinefreigabe. Der separate [technische SHA-/ffprobe-Beleg](media-byte-proof-036.md) bleibt unverändert; das originale [Rechtemanifest](../../assets/pilot/rights-manifest.json) bleibt `UNREVIEWED`. **Issue #60 bleibt offen**, ebenso Film-/V09-/Publikations-Gate. Keine VPS-/Provider-/Renderänderungen.
