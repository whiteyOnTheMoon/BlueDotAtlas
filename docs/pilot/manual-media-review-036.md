# Roadmap 036 – Drei offizielle Quellvideos für den privaten Test

**Status: Betreiber hat die drei Videos gesehen und für den PRIVATEN INTERNEN TEST akzeptiert (20.11.2026); umfassendes Audio-/Drittrechte-/Publikationsreview bleibt offen.**  
[Issue #60](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/60) · [Prüfakte als JSON](../../assets/pilot/manual-review-036.json) · [Rechtemanifest](../../assets/pilot/rights-manifest.json) · [echter technischer Byte-Proof](media-byte-proof-036.md) · [Rechtematrix 014](../legal/rights-matrix.md).

Diese Seite hält die **bereits erfolgte pragmatische Testauswahl** fest – keine weitere große Reviewrunde notwendig. Drei Video-Originale wurden früher in CI technisch vollständig heruntergeladen/gehasht und sofort gelöscht. Der Betreiber hat die Videos laut eigener Aussage angesehen; er fand sie für ein Testvideo passend. Es wird weder ein Bild-für-Bild-Vollreview noch eine Ton-/Personen-/Logo- oder spätere Veröffentlichungsgenehmigung behauptet. Die offizielle NASA-/NOAA-Quellenherkunft und allgemeine Wiederverwendung mit Credits sind verifiziert; Fremdanteile bleiben die Ausnahme.

**Zulässiger Scope:** `PRIVATE_INTERNAL_TEST_ONLY` als **stumme Bildquellen** mit exakten Credits und klarer Kennzeichnung der unterschiedlichen Ereignisse. Vor tatsächlichem Einfügen in die Test-Timeline muss eine lokale Originaldatei den bekannten SHA-256 erfüllen. `approved_for_timeline=false` bis zur separaten Dateistaging-Prüfung; **öffentliche Publikation weiterhin nicht freigegeben**.

## 1. Bereits ausgewählte drei Originalclips – direkte Referenzlinks

**Direkte Original-MP4-Links zur späteren lokalen Beschaffung und zur Kontextkontrolle.** Für die rein interne Testauswahl ist kein erneutes Anschauen durch den Betreiber vorgesehen.

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

## 2. Nur bei späterer Veröffentlichung: offene Drittinhalte prüfen

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

## 4. Grenzen der abgeschlossenen internen Source-Auswahl

**Ausgeschlossen:** NOAA Ernesto (`P60-VID-002`, 183.440.133 Byte, noch ohne vollständigen Originalhash) und Saildrone (`P60-VID-ALT-004`, Drittanbieterrechte `BLOCKED`). Nur **Oma**, **Helene** und **NOAA offene See** sind für einen **nicht öffentlichen** Test als Bildquellen ausgewählt.

Die [JSON-Prüfakte](../../assets/pilot/manual-review-036.json) enthält die tatsächliche **Betreiber-Rückmeldung „Videos angesehen, für den Test passend“**, ohne eine vollständige Ton-/Drittmaterialprüfung zu erfinden. Die [Rechtematrix](../legal/rights-matrix.md) gilt weiterhin für eine spätere Veröffentlichung. Kein ungeklärter Originalton und keine irreführende NASA-/NOAA-Partnerschaft.

**Das ist der Abschluss der Medienquellen-Auswahl in 036.** Dateistaging und tatsächliche Hashprüfung am späteren lokalen Medienroot folgen erst in den filmtechnischen Roadmap-Aufgaben. Es wurden keine Original-MP4s auf den VPS geladen oder ins Git-Repo übernommen.
