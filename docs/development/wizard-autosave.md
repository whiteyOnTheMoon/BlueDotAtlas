# Roadmap 032 – Sieben Schritte und sichere Entwurfs-Autosaves

**Status:** Feature-Branch `feat/032-wizard-autosave`, Issue [#49](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/49); technischer Test-/Reviewstand, **keine Betreiberfreigabe, kein Live-Admin-VPS-Deploy**.

## Zweck und Benutzeroberfläche

Die 031-Projektansicht verlinkt auf `/admin/projects/:id/wizard`. Dort erscheinen genau die sieben unveränderlichen offiziellen Schritt-Namen aus PRD 010. Der geschützte Admin kann in jedem Schritt **rein redaktionelle Notizen bis 4000 Zeichen** verfassen. Ein Autosave versucht nach 800 ms Eingabepause zu persistieren, prüft ein serverseitiges Änderungszähler-Token und zeigt erst nach erfolgreicher Antwort „Saved to database“. Während ausstehender/fehlgeschlagener Änderungen darf ein Wechsel auf einen anderen Schritt nicht versehentlich lokale Daten verlieren; beim Neuladen ohne bestätigten Save gibt es keine Persistenzgarantie. Ein beständig bestätigter Save überlebt vollständiges Schließen/Öffnen des Browsers ohne `localStorage` oder Cloudabonnement.

Ein expliziter Button **Submit for editorial review** markiert den redaktionellen Entwurf als **eingereicht, nicht genehmigt**. Sobald die Notizen erneut bearbeitet werden, springt diese reine Vorprüfung wieder auf `draft`. Der Schrittstatus aus dem bestehenden Datenmodell wird unverändert gezeigt; automatische `complete`-, Rechte-`approved`-, Render- oder Publish-Aktionen **finden nicht statt**. Fachlich echte Quellen-, Skript-, Medienrechts-, Voice-/Render-Formulare sind spätere Roadmap-Aufgaben.

## Datenmodell und Mehrtab-Konflikte

Eine neue SQL-Migration ist nicht nötig: Die vorhandenen `step_progress.draft`-JSONB-Slots werden um `editorNotes`, `editRevision` und `reviewState` ergänzt; künftige, sonstige Draftkeys werden beim Schreiben beibehalten und nie direkt über die API ausgeliefert. Die erste Revision ist `0` (alter leerer `{}`-Slot), nach jeder inhaltlichen Änderung folgt `1,2,...`. Die vollständige ProjectVersion-Snapshotnummer ist **eine andere Größe** und bleibt erhalten.

Bei `PATCH /api/v1/projects/:id/wizard/steps/:step` hält PostgreSQL die Projektzeile und dann die Schrittzeile in einer Transaktion gesperrt. Wird die `expectedRevision` einer zweiten veralteten Tabkopie nicht bestätigt, antwortet der Server mit **`409 edit_conflict`** und schreibt **nichts**. Browser B zeigt die Warnung und lässt den lokalen Text stehen. Erst nach Nutzerbestätigung lädt die Oberfläche die aktuell gespeicherte Version und ersetzt lokale Notizen. Eine neue Notiz nach einer Einreichung setzt `reviewState` auf `draft`. Das Audit protokolliert nur Schritt-/Revisionsnummer und Reviewzustand – **niemals den Notiztext**.

Geschützte Leseseite: `GET /api/v1/projects/:id/wizard` mit sicherem DTO. Archivierte, offiziell freigegebene oder im Projekt-Review befindliche Projekte sind im Wizard nur lesbar; alle Mutationen werden generisch mit 409 verweigert. Keine frei gewählte Approval-Aktion oder Datenbankschemamigration und kein Queue-/Provider-Start. Das spätere tatsächliche `approvals`-Modell bleibt unverändert und leer, sofern zuvor keine echte separate Freigabe existierte.

## Technische Gates und Reproduktion

- **Core:** strikte Schema-Negativtests für die sieben Stufen, 4000-Zeichen-Limit, gültige revisionsbasierte Save-/Submit-Befehle, keine unbekannten oder Approval-Felder.
- **DB:** `pnpm --filter @bluedotatlas/db test:integration` nur gegen `BDA_DB_TEST=1` und `localhost/bda_test`: sieben persistierte Slots; Save/Submit/Re-Edit-Audit; parallele Transaktionen mit **exakt einem Sieger**; Wiederaufnahme mit neuem Connection Pool; Archivieren verhindert Schreiben; keine neuen Projektversionen, Renderjobs oder Rechtefreigaben.
- **HTTP:** `node scripts/check-wizard-032.mjs` im CI mit synthetischem Passwort-Hash, lokalem Next.js-Production-Server und eigener PostgreSQL-16-DB. Verifiziert Auth-/CSRF-/Methoden-/JSON-/Limit-Schranken, 409 bei veraltetem Token und nicht verletzte Projekt-/Job-/Approval-Gates.
- **Echter Browser:** Chromium (1440px Desktop dunkel + 375px mobil hell), sieben Navigationsschritte, zwei Schritt-Entwürfe unabhängig autosaven, **Browser schließen/neu öffnen** lädt nur bestätigte Notizen, zwei geöffnete Tabs bekommen einen sichtbaren `409`-Konflikt mit erhaltenen lokalen Notizen, explizite Neuladung, redaktionelle Einreichung und Rücksetzung bei erneutem Edit. Chromium-Fehler, Mobil-Overflow und 5 echte Screenshots als verpflichtendes GitHub-Actions-Artefakt `bda-032-wizard-autosave-qa`.
- **Regression/Drift:** frozen PNPM, TypeScript, ESLint, Prettier, Build, vorhandene 022/023/024/025/026/027/029/030/031-Checks, Drizzle-`db:check` und `db:generate` ohne neue Migration. Ergebnisse erst nach tatsächlichem CI-Lauf mit Head-SHA vermerken.

## Unveränderte Betriebsschranken

Kein Admin auf der öffentlich sichtbaren `studio.ap-pixels.com`-Vorschau aktiviert (DEC-042/043), keine zusätzlichen VPS-Checkout-Verzeichnisse (DEC-041), keine Bezahlprovider oder AI-/TTS-Ausgaben über bereits vereinbartes Limit (DEC-032), kein wirkliches Restoreszenario (034). Der hier hinzugefügte 032-Code kann nach Merge auf `main` bereitliegen, ohne damit eine VPS-Aktualisierung, Container-Neustart, Produktivmigration oder Adminfreigabe zu autorisieren. Keine fremden Docker-Projekte berühren.

**Entscheidung:** Issue #49 → Featurebranch → CI/Screenshot-/Sicherheitsreview → konkreter Draft-PR → ausdrückliche Betreiberfreigabe → erst dann Merge und Issue-Abschluss. 031 wurde durch die separate Freigabe DEC-045 bereits abgenommen; dies ist kein impliziter 032-Beschluss.
