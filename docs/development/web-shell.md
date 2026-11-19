# Roadmap 022 – Next.js-App-Shell und geschützte Admin-Routen

**Status:** Aufgaben 022–024 in `main`; der Auth-Ausbau 025 ist vorerst ein Featurebranch bis zur separaten Abnahme. [Issue #39](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/39).

## Lokal starten

1. Node 22 und pnpm 11.28.12 bereitstellen.
2. Im Repo `pnpm install --frozen-lockfile` ausführen.
3. `pnpm --filter @bluedotatlas/web dev` startet die öffentliche Route `/` und die Login-Seite `/admin/login`.
4. **`/admin` ist ohne serverseitig validierte Session gesperrt**. Task 025 aktiviert ein Login erst bei sicher gesetzten Auth-Env-Variablen und ausgeführter Migration. Ohne Konfiguration ist die Anmeldung nicht verfügbar.
5. Ausschließlich lokal in `next dev` ist unter `/preview/admin` die **datenfreie UI-Vorschau** abrufbar. In Produktion ist diese Route `404`; sie liest keine geschützten Daten.

## Architektur und UI

- Next.js 16 App Router, serverseitige React-Komponenten und TypeScript aus M02/021. Der Next.js-Proxy und ein serverseitiges Admin-Layout leiten alle Admin-Routen ohne validierte Session zum Login um.
- Die ursprünglich in 022 **deaktivierten** Login-Felder sind im **noch nicht gemergten Featurebranch 025** mit dem serverseitigen Passwort- und Sessiondienst verbunden. Ohne valide Runtime-Konfiguration bleibt die Authentifizierung gesperrt; Zugangsdaten gehören niemals in Git. Siehe [Admin-Auth](admin-auth.md).
- Root `loading.tsx`, `error.tsx` und `not-found.tsx` liefern barrierearme Status-, Fehler- und 404-Seiten.
- Alle Farben, Radien und UI-Kontraste orientieren sich an den bereits genehmigten [M00-UI-Tokens](../../packages/ui/tokens/colors.ts) und [UI-Kit](../../design/ui-kit-v01/README.md).
- Original-SVG-Logos werden **byteidentisch** unter `apps/web/public/brand` als ausschließlich statische Asset-Kopien eingebunden; die originalen Dateien unter `assets/brand/logo` bleiben unverändert.
- Kein gefälschtes veröffentlichtes Video und keine irreführende funktionierende Projektverwaltung.

## Test-/Abnahmeplan

Frische CI: `pnpm install --frozen-lockfile`, Typecheck, Lint, Format, Build, Playwright-Chromium-Screenshots auf mindestens 1440 und 375 px, funktionierende öffentliche/Login-Route und Admin-Redirect, kein Overflow; Produktionsmodus darf die Entwicklungs-UI nicht öffnen.

Kein VPS-Deploy, keine neuen Provider/Kosten, keine Queue-/CRUD- oder Renderimplementierung. Die reine 022-App-Shell enthielt noch keine Authentifizierung; 025 ergänzt den Login und benutzt die bereits in 023–024 vorbereitete PostgreSQL-Testdatenbank. Proxy ist **nicht** die einzige Sicherheitskontrolle; alle späteren Datenoperationen benötigen eigene serverseitige Prüfung.
