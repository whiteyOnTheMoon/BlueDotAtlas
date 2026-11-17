# BlueDotAtlas — Web UI-Kit V0.1 · Roadmap 008

**Status:** **DESIGNVORSCHLAG**, noch nicht durch den Nutzer freigegeben. `main` bleibt unverändert, bis Review, Tests und Abnahme abgeschlossen sind.  
**Issue:** [#19](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/19)  
**Arbeitsbranch:** `design/008-ui-kit-v01`  
**Roadmap-Ergebnis:** `design/ui-kit-v01` plus `packages/ui/tokens/ui.ts`.

## Den Entwurf ansehen

- **[Interaktive HTML-Vorschau](index.html)** — lokale Datei im Browser öffnen (am besten über einen kleinen lokalen HTTP-Server).
- **[Gemeinsame CSS-Komponenten](ui-kit.css)** — Vorschau mit Dark/Light und Responsive Layouts.
- **[Wiederverwendbare TypeScript UI-Tokens](../../packages/ui/tokens/ui.ts)** — Spacing, Radii, Typografie, Buttons, Layout, Fokus und Status-Semantik.
- **[Verbindliche Farb-Tokens (Aufgabe 004)](../../packages/ui/tokens/colors.ts)** — die CSS-Vorschau spiegelt diese Werte, ersetzt sie aber nicht.
- **[Automatisierte Browser-QA](../../scripts/check-ui-kit.mjs)** und [GitHub Action](../../.github/workflows/ui-kit-check.yml) — echte Chromium-Screenshots und responsive Checks.

**Lokal starten:**

```bash
# Vom Repository-Wurzelordner aus:
python3 -m http.server 8000
# Danach öffnen: http://localhost:8000/design/ui-kit-v01/
```

Es sind **keine Accounts, Internetverbindungen, Datenbank und kein Backend nötig**. Der Prototyp hat keinen echten Save/Publish-Mechanismus; Filter, Theme-Umschalter und Tab-Wechsel sind als lokale Vorschau interaktiv.

## Designprinzip

**Eine Designsprache, zwei Anwendungsbereiche:** Öffentliche Videothek und geschütztes Admin-Studio teilen dieselben Farbsemantiken, Typografie, Ränder, Buttons, Formulare und Zustände, aber die Seitengestaltung unterscheidet sich nach Aufgabe. Öffentlich: große Bildkacheln, kurze Entdeckungstexte und ein ruhiges filmisches Titelmotiv. Admin: Informationsdichte, Workflow-Navigation, eindeutige Statusmeldungen und Formulare.

**Desktop zuerst**, responsive bis mindestens **375 px** mit getesteten Zwischenbreiten. Die Entwurfs-Gestaltung ist bewusst leichtgewichtig, nicht eine zweite komplette Seitenarchitektur und **keine öffentliche Live-Website**.

## Komponenten

| Komponente | Vorschau / Interaktion | Gemeinsame Regel |
| --- | --- | --- |
| **Buttons** | Primary, Secondary, Quiet, Disabled | 44px Mindesthöhe (kompakt 40px), Primärfarbe mit lesbarem Text und sichtbarer Tastatur-Fokuslinie |
| **Eingabefelder** | Label, Textfeld, Textarea, Hint, Error | Klare sichtbare Beschriftung, `aria-invalid`/Beschreibungen, border semantisch aus der Palette |
| **Karten** | Editorial-/Projektkarte und Video-Kachel | Einheitliche Padding-/Radius-Tokens; Information über Bilddekor |
| **Status-Badges** | Draft, In review, Ready, Published | Beschriftung plus Punktform; niemals nur Farbe. **Demo-Status**, kein echtes Publishing |
| **Stepper** | 7 Stufen Admin; 3 Stufen Komponententest | `ol` und aktueller Step markiert, responsiv verkleinert; nicht als bereits funktionsfähiger Wizard missverstehen |
| **Galerie-Kacheln** | 16:9 Video-Thumbnails, drei illustrative Themen | Original **einziges** Thumbnail-Masterlayout aus 006; kein neues Template |

## Bestehendes Branding bleibt geschützt

- **Logo:** Ausschließlich Original-`assets/brand/logo/logo-dark.svg` (dunkler UI-Hintergrund) und `logo-light.svg` (heller UI-Hintergrund) als *externe SVG-Referenzen*. Keine Logo-Redraws/Veränderungen.
- **Farbwelt:** `Deep Ocean / Glacial Light`; die Vorschau nutzt `colorTokens.light/dark` aus den freigegebenen [Farben](../../docs/brand/colors.md). Der helle Primary-Button bleibt aus Kontrastgründen **`#026E9E`**, nicht das dekorative hellblaue Markenlogo.
- **Schriften:** **Inter** für UI-Fließtext/Kontrollen und **Space Grotesk** für Überschriften, siehe [Typography 005](../../docs/brand/typography.md). In der Minimal-HTML-Datei werden zunächst die systemeigenen Fallbacks genutzt, wenn Inter/Space Grotesk lokal nicht installiert sind. **Keine unlizenzierten Font-Binaries** werden neu eingeführt.
- **Thumbnails:** Nur bestehende freigegebene thematische **Illustrations-Mockups** aus `assets/brand/thumbnails/mockups/`; alle basieren auf **einem** Master unter `assets/brand/thumbnails/template.svg`. Dies sind keine echten Satellitenbilder.
- **Nicht produktiv:** Texte, Hero-Planet, Beispielprojekte und Statuswerte sind UI-Demos, **keine realen Filmveröffentlichungen oder Messwerte**.

## UI-Bedienung / Accessibility

- Theme-Button schaltet zwischen **Dark** und **Light**.
- Zwei Tabs `Public library` / `Admin studio` verwenden Tab-/Tabpanel-ARIA, Pfeiltastensteuerung und sichtbaren Tastatur-Fokus.
- Thematische Filter zeigen drei verschiedene Beispiel-Kacheln, die jeweils ausgewählte Filter-Statusanzeigen haben.
- Formularfelder besitzen echte Labels; fehlerhafte Felder eine sichtbare Erklärung mit `aria-describedby`.
- Statuslabels sind auch ohne Farbwahrnehmung verständlich.
- Bei `prefers-reduced-motion` werden dekorative Transitions praktisch ausgeschaltet.

## Qualitätsprüfung / Gate

- [x] Sechs von der Roadmap verlangte Komponententypen als Designvorschlag vorhanden.
- [x] Öffentliche und Admin-Vorschau verwenden **dieselben Tokens, Styles und Komponenten**.
- [x] Bereits freigegebene Logos/Brandfarben/Typografieregeln als Quelle verknüpft, nicht neu erfunden.
- [ ] Browser-QA an **1440 / 960 / 375 px** in zwei Themes und beiden Ansichten bestanden. [Ergebnisse siehe GitHub Action](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/workflows/ui-kit-check.yml).
- [ ] Nutzer hat **visuellen Entwurf ausdrücklich freigegeben** oder Anpassungen benannt.
- [ ] PR-Merge, Issue-Abschluss und Gate nach dem Review.

## Nicht Teil von 008

Kein produktives `apps/web`-Routing, kein Login, keine echten Projektkarten mit Datenbank, kein Publish-Automatismus, kein vollwertiger Film-Wizard. Diese Funktionen folgen erst in späteren Roadmap-Aufgaben.

**Dokumentationsregel DEC-022:** Bei jeder Genehmigung oder Statusänderung auch die zentrale [`README.md`](../../README.md) und ggf. den [Entscheidungslog](../../docs/project/decision-log.md) im selben PR aktualisieren.
