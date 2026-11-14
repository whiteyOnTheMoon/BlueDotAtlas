# BlueDotAtlas — Logo Directions V0.1

**Roadmap:** M00 · Aufgabe 003  
**Status:** **C — Earth Contour ausgewählt** durch Nutzer; vier transparente SVG-Vektorvarianten erstellt. Finale visuelle 48px-/PNG-Vergleichsabnahme noch offen.  
**GitHub:** [Issue #5](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/5)  
**Abhängigkeiten:** Aufgaben 001 und 002 freigegeben.

## Verbindlicher Rahmen
- Offizielle Schreibweise: **BlueDotAtlas**.
- Öffentlicher Claim: **The Planet Has a Story.**
- Keine öffentliche Namensabkürzung in V0.1.
- Hochwertige, cineastische Earth-&-Climate-Dokumentation; wertige und ruhige Identität.
- Ein Logo soll als kleines **48px-Icon** funktionieren, ohne einen generischen NASA/ESA/anderen Anbieterauftritt nachzuahmen.
- **Schrift- und Farbpalette sind hier ausdrücklich nur Platzhalter**: Entscheidungen erfolgen in M00 004 und 005.

## Entwurf A — Orbit Dot
**Idee:** Ein kräftiger blauer Punkt als Erde im Zentrum einer asymmetrischen Orbitlinie.  
**Eindruck:** Sehr kompakt, digital, einprägsam, bewegungsfreundlich.  
**Stärke:** Einfach als Icon und für kurze Logo-Motion.  
**Risiko:** Punkt + Orbit ist verbreitet; Eigenständigkeit, Markenkollisionen und konkrete Vektorform nach Auswahl prüfen.  
**Entwürfe:** [hell](../../assets/brand/concepts/orbit-dot-light.svg) · [dunkel](../../assets/brand/concepts/orbit-dot-dark.svg)

## Entwurf B — Atlas Meridian
**Idee:** Eine zurückhaltende Weltkugel mit Meridian und Äquator; ein blauer Mess-/Positionspunkt als Akzent.  
**Eindruck:** Wissenschaftlich, global, vertrauenswürdig.  
**Stärke:** Der Atlas-Teil von BlueDotAtlas ist unmittelbar verständlich.  
**Risiko:** Globuslogos können austauschbar wirken; Reduktion auf 48px sorgfältig prüfen.  
**Entwürfe:** [hell](../../assets/brand/concepts/atlas-meridian-light.svg) · [dunkel](../../assets/brand/concepts/atlas-meridian-dark.svg)

## Entwurf C — Earth Contour (ausgewählt)
**Idee:** Ein abstraktes, topografisches Linienzeichen mit einem markierten Datenpunkt.  
**Eindruck:** Forschend, origineller, kartografisch.  
**Stärke:** Deutlicher Bezug zu Erdsystemen und wissenschaftlichen Karten.  
**Risiko:** Feinere Linien können im kleinen Icon oder bei Video-Kompression verschwinden.  
**Entwürfe:** [hell](../../assets/brand/concepts/earth-contour-light.svg) · [dunkel](../../assets/brand/concepts/earth-contour-dark.svg)

## Gewählte Richtung und neue SVG-Assets

Der Auftraggeber hat **C — Earth Contour** gewählt, da die organischen Linien gleichzeitig Höhenschichten, Erdbebenwellen oder andere Erdsystem-Muster vermitteln. Danach wurden die bereits als PNG ausgearbeiteten Logo-/Wortmarkenansichten für helle und dunkle Hintergründe als Vektorversion neu konstruiert, inklusive zwei Icon-only-Versionen.

**Ablage:** [`assets/brand/logo/`](../../assets/brand/logo/)

- [`logo-light.svg`](../../assets/brand/logo/logo-light.svg) — komplettes Logo für helle Hintergründe, transparent.
- [`logo-dark.svg`](../../assets/brand/logo/logo-dark.svg) — komplettes Logo für dunkle Hintergründe, transparent.
- [`icon-light.svg`](../../assets/brand/logo/icon-light.svg) — nur das Zeichen für helle Hintergründe, transparent.
- [`icon-dark.svg`](../../assets/brand/logo/icon-dark.svg) — nur das Zeichen für dunkle Hintergründe, transparent.
- [`assets/brand/logo.svg`](../../assets/brand/logo.svg) — kanonischer Pfad laut Roadmap, entspricht `logo-light.svg`.

**Parität:** Die drei Konturpfade sind in allen vier SVG-Dateien exakt identisch; nur Tintenfarbe und Layout (`viewBox`) unterscheiden sich. Damit ist das Icon in den Wortmarken-SVGs und den Icon-only-SVGs konstruktiv dasselbe. Die neuen SVGs sind eine manuelle Vektorrekonstruktion der gewählten Bildvorlage, keine Pixel-für-Pixel-Nachzeichnung.

**QA:** Statisch wurde SVG-Struktur/transparentes Asset ohne Rasterobjekte geprüft; finale Rasterdarstellung und 48px-Prüfung für die neuen finalen SVGs stehen noch aus. Die bereits durchgeführte 48px-Prüfung weiter unten bezog sich auf die **frühen Entwurfssymbole**, nicht auf diese neue Rekonstruktion.

## Entwurfsfarben (nur zur Konzeptdarstellung)
- Heller Hintergrund: #F5FAFF; dunkelblaue Linien #09283F, Akzentblau #1588CF.
- Dunkler Hintergrund: #081824; eisweiße Linien #E9F6FF, Akzentblau #49B9F0.
- **Keine Farbfestlegung für Aufgabe 004.**

## Vergleich (vorläufige Designhypothesen)
| Kriterium | A Orbit Dot | B Atlas Meridian | C Earth Contour |
| --- | --- | --- | --- |
| 48px-Einfachheit | voraussichtlich hoch | mittel | mittel/niedriger |
| Thematische Eindeutigkeit | mittel | hoch | hoch |
| Eigenständigkeit | zu prüfen | zu prüfen | zu prüfen |
| Motion-Potenzial | hoch | hoch | mittel |
| Premium-Ästhetik | hoch bei sauberer Ausführung | hoch bei Reduktion | hoch bei guter Strichführung |

**Hinweis:** Dies sind gestalterische Einschätzungen, keine gemessenen Werte.

## Abnahmeplan
1. Sechs Entwurfs-SVGs sind vorhanden: A/B/C jeweils hell/dunkel.
2. **Technischer 48px-Test bestanden (13.11.2026):** Sechs SVG-Entwürfe wurden auf XML-Syntax geprüft und mit CairoSVG jeweils als 48×48-PNG gerendert. Die rasterisierten Motive wurden als Übersicht visuell verglichen. Alle sechs bleiben bei 48px erkennbar; A wirkt besonders reduziert, B klassischer, C etwas detailreicher. Technische Validierung ersetzt keine finale Design-/Markenfreigabe.
   - A Orbit Dot: helle/dunkle Icons je 48×48; Akzent und Orbit erkennbar.
   - B Atlas Meridian: helle/dunkle Icons je 48×48; Meridian- und Äquatorlinien erkennbar.
   - C Earth Contour: helle/dunkle Icons je 48×48; konzentrische Konturen erkennbar, Detailreduktion für die finale Wahl denkbar.
   - Test reproduzierbar durch SVG-Rasterisierung auf 48×48; ein Screenshot/PNG-Vergleich liegt als Review-Anhang im Projektchat vor.
3. Favorit explizit durch Auftraggeber auswählen. **Ein „Ok“ ist nur eindeutig, wenn unmittelbar zuvor genau eine Auswahl zur Freigabe vorgelegt wurde; bei mehreren Optionen A/B/C wird eine Angabe benötigt.**
4. Gewählte Richtung in einer Vektor-Endfassung `assets/brand/logo.svg` mit weiteren Varianten ausarbeiten. Bis dahin kein finales Markenzeichen behaupten.
5. PR reviewen, mergen, Issue mit Nachweisen abschließen.

## Aktueller Status
- [x] Drei eigenständige Designrichtungen konzipiert.
- [x] Drei Hell-/Dunkel-SVG-Paare angelegt, XML geprüft und bei 48px gerendert.
- [x] Entwurf C vom Auftraggeber ausgewählt.
- [x] SVG-Vektorfassung der gewählten Richtung als Wortmarken- und Icon-only-Set in hell/dunkel erstellt.
- [ ] Neue finale SVGs in 48px geprüft und Bildvergleich durchgeführt; anschließend finale visuelle Abnahme und PR-Merge.

**Rechtehinweis:** Eigenständige geometrische Entwürfe ohne bewusste Übernahme fremder Bestandteile; eine formelle Zeichen-/Markenrecherche steht aus.