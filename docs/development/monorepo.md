# M02 / Roadmap 021 – Monorepo und Basistooling

**Status:** Implementierungsvorschlag auf dem 021-Featurebranch, bis CI und ausdrückliche Betreiberfreigabe geprüft sind. [Issue #38](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/38).

## Beabsichtigte Struktur

- `apps/web`: Next.js-App-Shell im gesonderten 022-Featurebranch vorbereitet; [Web-Shell-Anleitung](web-shell.md). Die reine Workspace-Grundstruktur aus 021 ist abgeschlossen.
- `apps/worker`: vorerst **nur Workspace**, ausführbarer Jobworker folgt **027**.
- `packages/core`: Businessregeln und gemeinsame Verträge in späteren Aufgaben.
- `packages/db`: PostgreSQL/ORM und Migrationen erst **023–024**.
- `packages/video`: Render-/Scene-Code erst in späteren Meilensteinen.
- `packages/providers`: Adapter ohne aktive Zugänge/Bezahldienste.
- `packages/ui`: **bestehende freigegebene** M00-Tokens bleiben in `tokens/` erhalten, nur das Workspace-Metadaten-/TypeScript-Buildgerüst ist neu.

## Toolchain

- Node.js **22 oder neuer**, Paketmanager **pnpm 11.28.12** (über `packageManager` festgelegt).
- TypeScript im Strict-Modus, ESLint + typescript-eslint und Prettier. Direkte Tool-Versionen in der Root-Package-Datei exakt gepinnt.
- **Einmalig:** `corepack enable` und `pnpm install --frozen-lockfile`; danach `pnpm typecheck`, `pnpm lint`, `pnpm build`, `pnpm format:check`, `pnpm test`.
- Lokal nur `.env.example` kopieren: `cp .env.example .env` und echte Werte ausschließlich außerhalb Git halten. **Es gibt hier noch keine laufende DB, Session oder App.**
- `pnpm-lock.yaml` muss im genehmigten PR fest committed und auf einem **frischen CI-Runner mit `--frozen-lockfile`** geprüft sein. Ohne Lockfile/CI **kein Done**.
- Bei `packages/ui` sind die M00-Originaltokens von der Prettier-Formatprüfung ausgenommen, um eine ungefragte Markenänderung zu vermeiden; sie werden weiter von TypeScript und ESLint erfasst.

## Nachweise und Grenzen

GitHub Actions `monorepo-bootstrap-check` prüft Workspace-Struktur, Paketinstallation, Lint, Format, Typecheck und Build getrennt. Das von GitHub Actions erstmalig erzeugte und überprüfte `pnpm-lock.yaml` wurde in den Featurebranch übernommen. Jeder neue CI-Lauf führt `pnpm install --frozen-lockfile` aus und prüft so eine reproduzierbare Installation. Lokal ohne Paket-Registry ist eine erfolgreiche pnpm-Installation **nicht** nachgewiesen.

**Kein Dienst wird gestartet oder deployt; kein Datenbankschema, kein `/admin`, keine Queue oder Medienverarbeitung.** Bestehende VPS-Projekte, Markenmedien und API-Zugänge werden nicht verändert. Die Vorgaben aus [Architektur 017](../architecture/overview.md), [Budget 016](../operations/budget-policy.md) und [Arbeitsvereinbarung 020](../project/working-agreement.md) bleiben verbindlich.
