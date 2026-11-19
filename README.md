# BlueDotAtlas

**Earth & Climate Video Studio** — hochwertige, englischsprachige Wissenschaftsdokumentationen über unseren Planeten.

> Projektphase: **M01 – Produktgrenzen und technische Vorprüfung** · **Aufgaben 001–014 abgeschlossen** · 013 synthetischer 1080p-VPS-Render-Proof bestanden und vom Betreiber freigegeben (DEC-029; [Issue #29](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/29), [PR #30](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/30)).

## Projektziel

BlueDotAtlas entwickelt ein redaktionell kontrolliertes Webstudio zur Recherche, Planung und Produktion wissenschaftlich fundierter Earth-&-Climate-Dokumentarfilme. Die öffentliche Seite ist eine Videothek; Produktion und redaktionelle Freigabe erfolgen im geschützten Admin-Bereich.

**Technischer Qualitätsnachweis zuerst:** ein echter 60-Sekunden-Film in 1920 × 1080 mit lizenziertem Footage, Narration und erklärender Animation. Erst danach Ausbau zum vollständigen Produktionsworkflow und zu inhaltlich gerechtfertigten längeren Filmen.

## Verbindliche Projektentscheidungen

| Datum | Entscheidung | Status |
| --- | --- | --- |
| 2026-11-13 | Markenname und verbindliche Schreibweise: **BlueDotAtlas** (ersetzt die frühere Roadmap-Schreibweise `blueDotAtlas`). | Festgelegt |
| 2026-11-13 | Primäre Produktions- und Veröffentlichungssprache der Filme: **Englisch**. | Festgelegt |
| 2026-11-13 | Hauptziel bei Distribution und Erzählweise: **hohe Klickrate und lange, echte Zuschauerbindung**. | Festgelegt |
| 2026-11-13 | Filmischer Stil: **hochwertig, cineastisch, dokumentarisch**. | Festgelegt |
| 2026-11-13 | Wissenschaftliche Sorgfalt, nachprüfbare Quellen, echte Visuals und geklärte Medienrechte bleiben Pflicht. Reichweitenoptimierung darf Inhalte nicht verfälschen. | Roadmap-Leitplanke |

**Abgrenzung:** Ziel sind starke, wahrheitsgemäße Titel, Thumbnails, Hooks und Spannungsbögen; keine irreführenden Versprechen, künstlich aufgeblähten Filme oder Sensationsbehauptungen.

Der Brand Brief und das englische Markenversprechen sind am **13.11.2026 freigegeben** worden. Für Aufgabe 002 wurde die öffentliche englische Tagline **„The Planet Has a Story.“** ausgewählt. Es gibt in V0.1 **keine öffentliche Kurzform**; die Naming-/Einsatzregeln wurden am **13.11.2026 per „Ok“ freigegeben**.

## Projektdokumentation
- [**Master Roadmap V0.1 – Original-PDF**](docs/project/BlueDotAtlas_Roadmap.pdf) und [durchsuchbare Textfassung aller 28 Seiten](docs/project/master-roadmap-v01-text.md) — Originalplan vom 13.11.2026 mit **14 Meilensteinen und 158 Aufgaben**; die PDF ist mit dem vom Betreiber hochgeladenen Original bytegenau identisch (verifizierter Git-Blob-SHA).
- [**GitHub-Issue-Backlog M00–M02 (001–034)**](docs/project/roadmap-backlog-m00-m02.md) — vollständige Zuordnung der 34 vorhandenen Issues zu den ersten drei Meilensteinen, inklusive Roadmap-Gates, Abhängigkeiten und offengelegtem Unterschied zwischen synthetischem Task-013-Test und dem weitergehenden ursprünglichen Remotion-/Lizenzmedien-Proof.
- [**Rechte- und Nutzungsrisiken V0.1 – Aufgabe 014 freigegeben**](docs/legal/rights-matrix.md) — getrennte Risiken für Quellen, Bild, Video, Musik, Daten, Karten, Marken, Personen, TTS und Veröffentlichung; unklare Rechte sind harte Blocker. Anbieter-spezifische, aktuelle Bedingungen werden erst in 015 geprüft. **Abgenommen (DEC-030); [PR #54](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/54).** [Issue #31](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/31).
- [**Anbieterregister V0.1 – Aufgabe 015 im Review**](docs/providers/vendor-registry.md) — offizielle Nutzungsbedingungen und Zugang für NASA, NOAA, USGS, ESA/Copernicus, Pixabay, Pexels, **Unsplash**, Wikimedia, Remotion, Piper und ElevenLabs am 18.11.2026 geprüft. **Unsplash-Fotolizenz ≠ API-Regeln**; Pexels-Neu-API-Keys derzeit pausiert; keine produktiven API-Zugänge oder kostenpflichtigen Accounts freigegeben. [Issue #32](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/32).

- [VPS-Inventur und Ressourcenbudget – **Aufgabe 012 abgenommen**](docs/infra/vps-audit.md) — Betreiber-VPS nach Bereinigung **4 logische CPUs**, **7,8 GiB RAM (zuletzt 3,9 GiB verfügbar)**, **89G freier ext4-Speicher (24 % belegt)**, **43 laufende Docker-Container**, **Build-Cache 0B**; fünf PostgreSQL-Checks OK und AP Pixels PROD/DEV running. Vorsichtige Planungsgrenzen für Web/DB/Renderer und Reserven sind dokumentiert; **kein 1080p-Render-Go**, dies ist Aufgabe 013. Anbieter-Bandbreite/SSD-Typ weiterhin nicht garantiert. [Issue #27](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/27) · [PR #28](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/28).
- [1080p-VPS-Render-Proof – **Aufgabe 013 abgenommen**](docs/infra/render-proof-013.md) — Betreiber meldet **PASS** für synthetische 8s H.264/AAC, 1920×1080/30fps, **6,30s Renderzeit**, **229036 KiB Peak-Prozess-RSS**, **89G weiterhin frei** (18.11.2026, 23:42 UTC); **Freigabe am 19.11.2026 (DEC-029)**. Kein vollständiger Pilotfilm und keine produktive Rendererfreigabe. [Issue #29](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/29), [PR #30](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/30).
- [Video-Erfolgskriterien V0.1 – **Aufgabe 011 freigegeben**](docs/quality/video-acceptance.md) — **18 prüfbare Kriterien** für Technik, Schnitt/Dynamik, Quellen/Medienrechte, Englisch/Ton, Original-Intro/Outro, Vorschau und manuelle Entscheidung; **separate P60- und Langfilm-Profile**, klare PASS/FAIL/BLOCKED/N/A-Regel mit Reviewvorlage. [41/41 Dokumentationschecks PASS](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44134380259), [PR #26](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/26) **gemergt**, [Issue #25](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/25) **geschlossen**; **alle 18 Kriterien und das 55–65s-P60-Fenster ausdrücklich genehmigt (DEC-027)**. **Noch kein realer Film getestet**.
- [Produkt-PRD V0.1 – **Aufgabe 010 freigegeben**](docs/product/prd-v01.md) — öffentliche Videothek, geschützter Einzeladmin mit sieben Wizard-Schritten, **8–10 Minuten nur mit ausreichender Storysubstanz**, vorher echter 60s-Film-Proof, **manuelle** Veröffentlichungsfreigabe; **Autopublish, Multiuser und grafischer Voll-Editor in V0.1 ausgeschlossen**. Featureklassifikation **MVP / später / ausgeschlossen**; **[21/21 PRD-Dokumentationschecks PASS](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44131321849)**. [Issue #23](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/23), [PR #24](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/24); **vom Nutzer ausdrücklich freigegeben (DEC-026), [PR #24](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/24) gemergt, [Issue #23](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/23) geschlossen**.
- [Brand Brief V0.1](docs/brand/brand-brief.md) — Aufgabe 001, inhaltlich freigegeben und mit Abnahmecheckliste
- [Entscheidungsprotokoll](docs/project/decision-log.md) — fortlaufend versionierte verbindliche Beschlüsse und offene Fragen
- [Naming & Wordmark Guidelines](docs/brand/naming.md) — Aufgabe 002; Claim, Verzicht auf Kurzform und Naming-Regeln freigegeben
- [Logo Directions V0.1](docs/brand/logo-directions.md) — Aufgabe 003; Richtung C ausgewählt und SVG-Set auf `main` gemergt
- [Visual Language & Thumbnail Rules](docs/brand/visual-language.md) — Aufgabe 006; **genau ein freigegebenes Ozean-Layout für alle Thumbnails** (DEC-017), Test 12/12 bestanden
- [Official Thumbnail Template](assets/brand/thumbnails/template.svg) — **einziger 1280×720-Master**; [drei Inhaltsbeispiele](assets/brand/thumbnails/) mit identischer Anordnung
- [Motion Design Guidelines](docs/brand/motion-guidelines.md) — Aufgabe 007; **beide Original-MP4s vom Nutzer ausgewählt**, **beide Crossfades fest auf 0,3 s (9 Frames/30 FPS)**, Hintergrundmusik läuft ins stumme Outro durch (DEC-020/021/023)
- [Motion Clip QA](docs/brand/motion-qa.md) — **echte Nutzer-Originale** Intro **2,5s** mit AAC-Ton und Outro **6,0s ohne Ton**, beide 1080p/H.264/30fps; [GitHub-Medienprüfung erfolgreich](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068)
- [Finale Motion-Medien](assets/brand/motion/final/README.md) — [Intro · 2,5 s](assets/brand/motion/final/BlueDotAtlas%20Intro.mp4) und [Outro · 6,0 s](assets/brand/motion/final/BlueDotAtlas_Outro.mp4), beide Originale auf **`main`** (PR #17); frühere Assistenz-Demos sind nicht die gewählten Clips.
- [UI Kit V0.1 — Vorschau und Komponenten](design/ui-kit-v01/README.md) — **Aufgabe 008 freigegeben (DEC-024):** ein Designsystem für Videothek und Admin mit Buttons, Inputs, Karten, Status-Badges, Stepper, 16:9-Galerie; [klickbare HTML-Vorschau](design/ui-kit-v01/index.html), [UI-Tokens](packages/ui/tokens/ui.ts) und [Browser-QA](.github/workflows/ui-kit-check.yml). **[12/12 Chromium-QA bestanden](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44126245757)**; [12 Screenshots](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44126245757/artifacts/14347681682). **Nutzerfreigabe am 17.11.2026 erteilt (DEC-024); [PR #20](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/20) gemergt, [Issue #19](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/19) geschlossen.**
- [Brand-Kit V0.1 – **Task 009 freigegeben**](docs/brand/brand-kit-v01.md) — Logo C, Farben, Typografie, **ein** Thumbnail-Master, englischer Voice-Charakter, originale Intro-/Outro-MP4s und [illustratives 1920×1080-Storyboard-Frame](design/brand-gate-v01/storyboard-1080p.svg) in einem [Brand-Gate-Review-Board](design/brand-gate-v01/index.html). **[4/4 Browser-/Storyboard-Checks bestanden](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44128980711)** · [Bildnachweise](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44128980711/artifacts/14348153207). **Gesamtes M00-Brand-Kit vom Nutzer einschließlich Storyboard-Frame und klarem technischem Status des alten 10s-Tests am 17.11.2026 freigegeben (DEC-025).** [PR #22](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/22) ist der entsprechende Merge-/Gate-Nachweis, [Issue #21](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/21) wird geschlossen.
- [Color System V0.1](docs/brand/colors.md) — Aufgabe 004; freigegebene Deep Ocean / Glacial Light-Palette mit Kontrastnachweisen
- [Brand Colors Assets](assets/brand/colors/) — SVG-Farbpalette; maschinenlesbare UI-Tokens unter `packages/ui/tokens/colors.ts`

## Verbindlicher Film-Intro-/Outro-Standard (Aufgabe 007)

**Originalmedien des Auftraggebers** — seit Merge von PR #17 unverändert auf **`main`** archiviert:

| Baustein | Datei / Länge | Audio |
| --- | --- | --- |
| **Intro** | [`BlueDotAtlas Intro.mp4`](assets/brand/motion/final/BlueDotAtlas%20Intro.mp4) · **2,5 s** | **Eigene AAC-Tonspur vorhanden** |
| **Outro** | [`BlueDotAtlas_Outro.mp4`](assets/brand/motion/final/BlueDotAtlas_Outro.mp4) · **6,0 s** | **Ohne Tonspur** |

Beide Videos sind **Full HD (1920 × 1080), H.264, 30 FPS**; [technisch auf GitHub verifiziert](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068) mit exakten Blob-Prüfsummen und vollständiger Decodierung (**PASS**).

**Schnittregel (DEC-021):** Intro **per Video-Crossfade in den Film**, letzte Filmszene **per Video-Crossfade ins Outro**. Die später lizenzierte **Hintergrundmusik läuft während des gesamten stummen Outros weiter**; erst am eigentlichen Filmende passend ausblenden. Das Originalintro hat eigenen Ton, der beim Übergang sachgerecht mit dem Filmmix verbunden wird. **Beide Crossfades dauern verbindlich 0,3 Sekunden = 9 Frames bei 30 FPS** (DEC-023). Die technische Montage in einem späteren echten Film ist **kein Gate von Aufgabe 007**.

**YouTube:** Der echte klickbare Abonnieren-Endscreen wird **in YouTube Studio**, nicht im MP4, ergänzt. Der 6-s-Clip kann dafür genutzt werden. Die endgültige Platzierung ist beim Upload zu prüfen; V0.1 publiziert nicht automatisch.

Die aktuellen Schnitt- und Audioregeln stehen in [Motion Guidelines](docs/brand/motion-guidelines.md), Byte-/Tonspur-Details im [Archiv](assets/brand/motion/final/README.md); **alte generierte Logo-Vorschauen gelten ausdrücklich als verworfen**. **Aufgabe 007 inhaltlich freigegeben**: die zwei früher offenen Punkte zum späteren Film-Montagetest und zur Rechteprüfung zukünftiger Filme gehören **nicht** zum Gate von 007. **PR #17 und der Dokumentations-Nachtrag [PR #18](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/18) schließen Aufgabe 007 ab**; Issue #16 ist der entsprechende Gate-Nachweis. Die allgemeinen Rechtepflichten für spätere Veröffentlichungen bleiben bestehen.

## Roadmap und Arbeitsregeln

Grundlage: *BlueDotAtlas Master Roadmap V0.1* (13. November 2026), 14 Meilensteine, 158 fortlaufende Aufgaben und verbindliche Abnahmetore.

- Aufgaben behalten ihre stabilen Nummern `001` bis `158`.
- Für jede Aufgabe gilt: **Issue → Umsetzung auf Branch → Tests/Review → Pull Request → Merge → Gate-Nachweis**.
- Ein Issue oder ein Entwurfsdokument allein bedeutet **nicht**, dass eine Aufgabe abgeschlossen ist.
- **README-Pflicht bei jeder freigegebenen Entscheidung:** Diese zentrale README wird mit jeder beschlossenen inhaltlichen Änderung und relevanten Projektstatusänderung **im selben PR** aktualisiert (DEC-022); ausführliche Beschlüsse, Begründungen und Historie stehen im [Decision Log](docs/project/decision-log.md), fachspezifische Details unter `docs/`.
- Filme werden **nur nach manueller Freigabe** veröffentlicht; YouTube-Autopublishing ist nicht Bestandteil von V0.1.
- **Freigaberegel:** Ein „Ok“ im Projektchat bedeutet die ausdrückliche Freigabe des jeweils zur Entscheidung vorgelegten Ergebnisses, nicht zukünftiger oder anderer Aufgaben.
- **Schrift-Vorgabe:** Nur kostenfrei nutzbare und für Branding, Website, Video geeignete Fonts mit nachprüfbarer Lizenz (Entscheidung DEC-013).
- Die ursprüngliche Roadmap-Schreibweise des Produktnamens wurde ausdrücklich durch **BlueDotAtlas** ersetzt; Aufgabennummern und Meilensteine bleiben unverändert.

**Abgeschlossen:** [001 – Markenversprechen und Tonalität](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/1) über [PR #2](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/2). **Abgeschlossen:** [002 – Wortmarke und Schreibweise](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/3) über [PR #4](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/4). **Abgeschlossen:** [003 – Logorichtungen](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/5) über [PR #6](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/6). **Abgeschlossen:** [004 – Farbwelt und Kontraste](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/7) über [PR #8](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/8). **Abgeschlossen:** [005 – Typografie und Schriftlizenzen](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/9) über [PR #10](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/10) und [PR #11](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/11), mit [3/3 bestandenen Browser-Testgrößen](docs/brand/typography-qa.md). **Aktuell:** [006 – Bildsprache und Thumbnail-Regeln](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/13) **abgeschlossen** mit einem einzigen Master; [12/12 Tests bestanden](docs/brand/thumbnail-qa.md), [PR #14](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/14) gemergt und Issue #13 geschlossen. **Abgenommen:** [007 – Motion-Design-Basics](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/16) mit [PR #17](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/17) auf `main`, den zwei originalen Nutzer-MP4s, [2/2 Medien-Checks PASS](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44007341068), festen 0,3s-Crossfades und durchgehender Musik über dem stummen Outro (DEC-023); formaler Abschluss über [PR #18](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/18) und Issue #16.

**Stand:** Roadmap 012 (VPS-Inventur, [Issue #27](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/27)) und Roadmap 013 (isolierter 1080p-Render-Proof, [Issue #29](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/29)) sind abgeschlossen. Die technischen 013-Messwerte belegen einen synthetischen 8-Sekunden-Encode, noch keinen vollständigen 55–65-Sekunden-Pilotfilm.

## Geplante technische Basis (noch nicht implementiert)

- Web/App: Next.js, React, TypeScript
- API: Node.js
- Datenhaltung: PostgreSQL
- Rendering: Remotion, FFmpeg/ffprobe und separater Worker
- Betrieb: eigener VPS, Docker Compose und HTTPS
- Inhalt: geprüfte wissenschaftliche Quellen, lizenziertes Original-Footage, TTS und redaktionelle Prüfungen

**Hinweis:** Diese README wurde als einmalige initiale Repository-Datei angelegt, da das GitHub-Repository zuvor leer war. Die weiteren Aufgabenänderungen laufen regulär über Issue und Pull Request.
