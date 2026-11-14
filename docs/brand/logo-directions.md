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
**Historischer Konzeptentwurf:** SVG-Dateien auf Wunsch des Auftraggebers aus dem Repository entfernt; die dokumentierte Richtung bleibt zum Vergleich erhalten.

## Entwurf B — Atlas Meridian
**Idee:** Eine zurückhaltende Weltkugel mit Meridian und Äquator; ein blauer Mess-/Positionspunkt als Akzent.  
**Eindruck:** Wissenschaftlich, global, vertrauenswürdig.  
**Stärke:** Der Atlas-Teil von BlueDotAtlas ist unmittelbar verständlich.  
**Risiko:** Globuslogos können austauschbar wirken; Reduktion auf 48px sorgfältig prüfen.  
**Historischer Konzeptentwurf:** SVG-Dateien auf Wunsch des Auftraggebers aus dem Repository entfernt; die dokumentierte Richtung bleibt zum Vergleich erhalten.

## Entwurf C — Earth Contour (ausgewählt)
**Idee:** Ein abstraktes, topografisches Linienzeichen mit einem markierten Datenpunkt.  
**Eindruck:** Forschend, origineller, kartografisch.  
**Stärke:** Deutlicher Bezug zu Erdsystemen und wissenschaftlichen Karten.  
**Risiko:** Feinere Linien können im kleinen Icon oder bei Video-Kompression verschwinden.  
**Entwurfsstand:** Frühere Prototyp-SVGs auf Wunsch entfernt; die vier weiterentwickelten Vektorvarianten liegen ausschließlich unter [`assets/brand/logo/`](../../assets/brand/logo/).

## Gewählte Richtung und neue SVG-Assets

Der Auftraggeber hat **C — Earth Contour** gewählt, da die organischen Linien gleichzeitig Höhenschichten, Erdbebenwellen oder andere Erdsystem-Muster vermitteln. Danach wurden die bereits als PNG ausgearbeiteten Logo-/Wortmarkenansichten für helle und dunkle Hintergründe als Vektorversion neu konstruiert, inklusive zwei Icon-only-Versionen.

**Ablage:** [`assets/brand/logo/`](../../assets/brand/logo/)

- [`logo-light.svg`](../../assets/brand/logo/logo-light.svg) — komplettes Logo für helle Hintergründe, transparent.
- [`logo-dark.svg`](../../assets/brand/logo/logo-dark.svg) — komplettes Logo für dunkle Hintergründe, transparent.
- [`icon-light.svg`](../../assets/brand/logo/icon-light.svg) — nur das Zeichen für helle Hintergründe, transparent.
- [`icon-dark.svg`](../../assets/brand/logo/icon-dark.svg) — nur das Zeichen für dunkle Hintergründe, transparent.
- **Ordnerstruktur bewusst vereinfacht:** Der Auftraggeber hat die ältere Dublette `assets/brand/logo.svg` und den nicht mehr benötigten `assets/brand/concepts/`-Ordner in zwei separaten Commits entfernt. Diese Dateien werden nicht erneut angelegt.

**Parität:** Die drei Konturpfade sind in allen vier SVG-Dateien exakt identisch; nur Tintenfarbe und Layout (`viewBox`) unterscheiden sich. Damit ist das Icon in den Wortmarken-SVGs und den Icon-only-SVGs konstruktiv dasselbe. Die neuen SVGs sind eine manuelle Vektorrekonstruktion der gewählten Bildvorlage, keine Pixel-für-Pixel-Nachzeichnung.

**Artboard-Anpassung:** Alle vier SVG-Zeichenflächen wurden bei unveränderten Pfaden, Textattributen, Farben und Positionen auf etwa 4 SVG-Einheiten Rand zugeschnitten. Vollständige Logos: `viewBox="93 133 1892 460"`; Icons: `viewBox="93 133 577 460"`. Das Icon-Artboard ist absichtlich nicht quadratisch, da eine quadratische Zeichenfläche ohne Motivänderung keinen allseitigen 4px-Rand erlauben würde. Für Text kann die sichtbare rechte Kante je nach SVG-Renderer variieren (Schrift und `textLength`-Unterstützung). Siehe [`assets/brand/logo/README.md`](../../assets/brand/logo/README.md).

**QA:** Statisch wurde die unveränderte Motivgeometrie beim reinen `viewBox`-Update geprüft. Finale Browser-/Rasterdarstellung und 48px-Prüfung für das neue Set stehen noch aus. Die bereits durchgeführte 48px-Prüfung weiter unten bezog sich auf die **frühen Entwurfssymbole**, nicht auf diese neue Rekonstruktion.

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
1. Historisch wurden sechs Entwurfs-SVGs (A/B/C jeweils hell/dunkel) erstellt und getestet. Diese Prototypen sind seit der Auswahl von C auf Wunsch des Auftraggebers aus dem aktiven Repository gelöscht.
2. **Technischer 48px-Test bestanden (13.11.2026):** Sechs SVG-Entwürfe wurden auf XML-Syntax geprüft und mit CairoSVG jeweils als 48×48-PNG gerendert. Die rasterisierten Motive wurden als Übersicht visuell verglichen. Alle sechs bleiben bei 48px erkennbar; A wirkt besonders reduziert, B klassischer, C etwas detailreicher. Technische Validierung ersetzt keine finale Design-/Markenfreigabe.
   - A Orbit Dot: helle/dunkle Icons je 48×48; Akzent und Orbit erkennbar.
   - B Atlas Meridian: helle/dunkle Icons je 48×48; Meridian- und Äquatorlinien erkennbar.
   - C Earth Contour: helle/dunkle Icons je 48×48; konzentrische Konturen erkennbar, Detailreduktion für die finale Wahl denkbar.
   - Test reproduzierbar durch SVG-Rasterisierung auf 48×48; ein Screenshot/PNG-Vergleich liegt als Review-Anhang im Projektchat vor.
3. Favorit explizit durch Auftraggeber auswählen. **Ein „Ok“ ist nur eindeutig, wenn unmittelbar zuvor genau eine Auswahl zur Freigabe vorgelegt wurde; bei mehreren Optionen A/B/C wird eine Angabe benötigt.**
4. Gewählte Richtung in den vier Vektor-Dateien unter `assets/brand/logo/` ausarbeiten und die dortige dokumentierte Struktur als einzigen Logo-Ablageort beibehalten. Bis zur finalen Prüfung kein abgeschlossenes Logo-Gate behaupten.
5. PR reviewen, mergen, Issue mit Nachweisen abschließen.

## Aktueller Status
- [x] Drei eigenständige Designrichtungen konzipiert.
- [x] Drei historische Hell-/Dunkel-Konzeptpaare angelegt, XML geprüft und bei 48px gerendert; anschließend auf Wunsch des Auftraggebers entfernt.
- [x] Entwurf C vom Auftraggeber ausgewählt.
- [x] SVG-Vektorfassung der gewählten Richtung als Wortmarken- und Icon-only-Set in hell/dunkel erstellt; auf etwa 4 Einheiten Artboard-Rand reduziert, ohne das Motiv zu verändern.
- [ ] Neue finale SVGs in 48px geprüft und Bildvergleich durchgeführt; anschließend finale visuelle Abnahme und PR-Merge.

**Rechtehinweis:** Eigenständige geometrische Entwürfe ohne bewusste Übernahme fremder Bestandteile; eine formelle Zeichen-/Markenrecherche steht aus.