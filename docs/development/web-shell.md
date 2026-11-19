# Roadmap 022 – Next.js-App-Shell und geschützte Admin-Routen

**Status:** Featurebranch-Entwurf; erst nach CI und Betreiberabnahme in `main`. [Issue #39](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/39).

## Lokal starten

1. Node 22 und pnpm 11.28.12 bereitstellen.
2. Im Repo `pnpm install --frozen-lockfile` ausführen.
3. `pnpm --filter @bluedotatlas/web dev` startet die öffentliche Route `/` und die Login-Seite `/admin/login`.
4. **`/admin` bleibt absichtlich gesperrt**, bis mit Roadmap 025 serverseitige Sessions eingeführt werden.
5. Ausschließlich lokal in `next dev` ist unter `/preview/admin` die **datenfreie UI-Vorschau** abrufbar. In Produktion ist diese Route `404`; sie liest keine geschützten Daten.

## Architektur und UI

- Next.js 16 App Router, serverseitige React-Komponenten und TypeScript aus M02/021. Der Next.js-Proxy und ein serverseitiges Admin-Layout leiten alle Admin-Routen ohne validierte Session zum Login um.
- `/admin/login` enthält deaktivierte, korrekt beschriftete Felder. **Kein Password-Service, keine Credentials, Cookies oder Sessions** werden hier verarbeitet; solche Funktionen sind Teil von 025.
- Root `loading.tsx`, `error.tsx` und `not-found.tsx` liefern barrierearme Status-, Fehler- und 404-Seiten.
- Alle Farben, Radien und UI-Kontraste orientieren sich an den bereits genehmigten [M00-UI-Tokens](../../packages/ui/tokens/colors.ts) und [UI-Kit](../../design/ui-kit-v01/README.md).
- Original-SVG-Logos werden **byteidentisch** unter `apps/web/public/brand` als ausschließlich statische Asset-Kopien eingebunden; die originalen Dateien unter `assets/brand/logo` bleiben unverändert.
- Kein gefälschtes veröffentlichtes Video und keine irreführende funktionierende Projektverwaltung.

## Test-/Abnahmeplan

Frische CI: `pnpm install --frozen-lockfile`, Typecheck, Lint, Format, Build, Playwright-Chromium-Screenshots auf mindestens 1440 und 375 px, funktionierende öffentliche/Login-Route und Admin-Redirect, kein Overflow; Produktionsmodus darf die Entwicklungs-UI nicht öffnen.

Kein VPS-Deploy, keine neuen Provider/Kosten, keine PostgreSQL-/Queue-/CRUD- oder Renderimplementierung. Der geschützte Admin wird erst mit 025 erreichbar. Proxy ist **nicht** die einzige Sicherheitskontrolle; alle späteren Datenoperationen benötigen eigene serverseitige Prüfung.
