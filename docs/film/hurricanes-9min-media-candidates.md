# Medienkandidaten für den 9-Minuten-Hurrikanfilm (Entwurf)

**BlueDotAtlas · Roadmap 063 ([Issue #87](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/87)) · zum [Skript V1](hurricanes-9min-script-v1.md) · Stand 27.11.2026**
**Status:** **Vorschlag zur Sichtung.** Nichts davon ist geladen, freigegeben oder im Repository. Bitte jeden Kandidaten über den Link auf der NASA-Seite ansehen und mit „passt“ oder „passt nicht“ bewerten.

## Rechtsgrundlage

- Die Inhalte des NASA Scientific Visualization Studio (SVS) sind laut [SVS-FAQ](https://svs.gsfc.nasa.gov/help/) gemeinfrei, „unless otherwise noted“. Credit lautet „NASA's Scientific Visualization Studio“, ergänzt um die jeweils genannten Visualizer und Missionen.
- Musik- und Fremdhinweise auf SVS-Seiten betreffen meist zusätzliche **produzierte** Videofassungen. Wir nutzen nur die reinen Visualisierungsdateien und **nie** deren Ton. Beim Staging wird jede Datei auf Tonspuren geprüft.
- Jede Seite wurde am 27.11.2026 über die SVS-API auf Credits und Fremdhinweise geprüft (Tabelle). Vor einer Veröffentlichung wird das erneut geprüft.

## Kandidaten

| # | Kap. | SVS | Inhalt | Datei (1080p) | Rechte-/Gestaltungshinweis |
| --- | --- | --- | --- | --- | --- |
| K1 | 2 | [5131](https://svs.gsfc.nasa.gov/5131/) Hurricane Ian | Feuchte-Volumen und bodennahe Windströmung im Hurrikan: zeigt „die Maschine“ | `Hurricane_Ian_comp_noOverlay_v03_30p_1080p30.mp4` | **Der Anfang enthält CIRA/NOAA-Wolkenbilder** („courtesy of CIRA and NOAA“). Wir nutzen nur den NASA-Volumenteil danach; der Einstiegsframe wird beim Staging festgelegt. |
| K2 | 2/5 | [5401](https://svs.gsfc.nasa.gov/5401/) Milton (GPM) | Regenstruktur aus dem All, Lebenszyklus | `milton_v02_1080p30.mp4` | keine Fremdhinweise |
| K3 | 2 | [4933](https://svs.gsfc.nasa.gov/4933/) Ida (GPM) | Blick in das Auge, 3D-Niederschlag | `ida2001_1080p30.mp4` | keine Fremdhinweise |
| K4 | 1/5 | [5575](https://svs.gsfc.nasa.gov/5575/) Erin 2025 (GPM) | Rasche Intensivierung im Atlantik | `Erin_v01_2025-08-18_141507.mp4` | keine Fremdhinweise; nur mit Bauchbinde „Erin 2025“, nicht als Polo |
| K5 | 3 | [5425](https://svs.gsfc.nasa.gov/5425/) Perpetual Ocean 2 | Meerestemperatur und Strömungen, Wirbel | `perpetual_ocean2_CLOSE_096_temperature_1080p30.mp4` | Blue-Marble-Daten „courtesy of Reto Stöckli (NASA/GSFC)“, also NASA |
| K6 | 3 | [5538](https://svs.gsfc.nasa.gov/5538/) SWOT | Meeresoberflächenhöhe mit Wirbeln in hoher Auflösung | `SWOT_ssha_31_1080p60.mp4` | Musikhinweis gilt nur der produzierten Fassung; wir nehmen die Visualisierung ohne Ton |
| K7 | 4 | [5688](https://svs.gsfc.nasa.gov/5688/) El Niño 2026 (Globen) | Meerestemperatur-Anomalie 2025 vs. 2026 auf Globen | `elnino_eic_ssta_globes_3340x1670_latest.mp4` | keine Fremdhinweise; Format 2:1, wird auf 16:9 zugeschnitten; „Updated daily“, also beim Staging die SHA pinnen |
| K8 | 5 | [4456](https://svs.gsfc.nasa.gov/4456/) Global Hawk / Edouard | Flugzeug über dem Hurrikan, Dropsonden-Messungen | `hs3_Eduardo_1080p30.mp4` | Musikhinweis gilt nur der produzierten Fassung; NASA-Global-Hawk, nicht NOAA, also im Bild korrekt beschriften |
| K9 | 5 | [5181](https://svs.gsfc.nasa.gov/5181/) Otis 2023 | Erste Kategorie 5 an Mexikos Pazifikküste, rasche Intensivierung | `Otis_001_1080p30.mp4` | keine Fremdhinweise; nur mit Bauchbinde „Otis 2023“ |
| K10 | 6 | [5611](https://svs.gsfc.nasa.gov/5611/) Global Mean Sea Level 1993–2025 | Anstieg des Meeresspiegels als Grafik | `seaLevelRise_2025_English_HD.mp4` | keine Fremdhinweise; englische Beschriftung eingebrannt (passt zum Film) |
| K11 | 5/6 | [5377](https://svs.gsfc.nasa.gov/5377/) Hurricane Tracks 1900–2023 | Zugbahnen über die Jahrzehnte | `hurricane_tracks_by_year_close_all_1080p30.mp4` | keine Fremdhinweise |

Bereits privat freigegeben und gestaged: P60-VID-001 (ISS), P60-VID-003 (Hurricane Hunter Helene), P60-VID-005 (offenes Meer), SVS 5683 (El Niño), SVS 5681 (Polo GPM) und CIRA Polo (nur privat).

## Noch offene Lücken

- **NOAA Hurricane Hunter von innen** (P-3, G-IV, Dropsonden-Abwurf): Die Videos liegen auf `omao.noaa.gov`, das aus der Sandbox gesperrt ist. Bisher gibt es nur P60-VID-003; weitere Clips suchen wir später über den VPS oder per Link vom Betreiber.
- **Polo-Satellitenbild von NOAA** als Ersatz für CIRA, nötig vor jeder Veröffentlichung.
- **Küste und Sturmflut** (Kapitel 6): Bisher gibt es nur die Meeresspiegel-Grafik.

## Ablauf nach der Sichtung

1. Freigegebene Kandidaten kommen in ein Rechte-Manifest V3 mit Status `PRIVATE_INTERNAL_TEST_ONLY`.
2. Ein Staging-Skript auf dem VPS lädt nur diese URLs. Es prüft Tonspuren und Länge, pinnt SHA-256 und Größe beim ersten Laden und meldet sie. Die Werte werden danach im Manifest festgeschrieben.
3. Danach folgen Szenendokument, TTS pro Kapitel und der private Render.
