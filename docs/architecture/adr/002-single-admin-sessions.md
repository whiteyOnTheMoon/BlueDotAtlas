# ADR-002 – Einzeladmin-Login mit scrypt und widerrufbaren PostgreSQL-Sessions

**Status:** Proposed – Betreiberreview für [PR #190](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/190) ausstehend  
**Datum:** 2026-11-19 (UTC)  
**Roadmap / Issue:** [025 / Issue #42](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/42)  
**Betreiberentscheidung:** Die Einzeladmin-Anforderung ist im PRD (DEC-026) freigegeben; **die konkrete Sicherheitsimplementierung in 025 ist noch nicht abgenommen**.  
**Belege:** [Auth-Runbook](../../development/admin-auth.md), [PR #190](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/190), [Definition of Done](../../project/working-agreement.md).

## Kontext / Problem

BlueDotAtlas V0.1 benötigt exakt einen geschützten Administrator, kein öffentliches Self-Service-Login. Die Architektur verwendet Next.js und PostgreSQL, der bereits ausgelastete VPS beherbergt weitere unabhängige Projekte. Ein Cookie allein darf weder den Admin-Serverlayoutschutz noch zukünftige Admin-API-Rechte ersetzen. Live-HTTPS-/Proxy-/Secret-Betrieb kommt erst mit Roadmap 029–030.

## Vorgeschlagene Entscheidung

- Ein **ausschließlich serverseitig** konfiguriertes Konto über `BDA_ADMIN_EMAIL` und `BDA_ADMIN_PASSWORD_HASH`. Der CLI-Hashgenerator liest das Passwort per stdin; Hashformat scrypt mit **N=32768, r=8, p=3**, zufälligem 16-Byte-Salt und 64-Byte-Ergebnis.
- Beim Login wird ein zufälliges **32-Byte-Sessiontoken** ausgegeben. PostgreSQL speichert nur seinen SHA-256-Hash; die Sitzung gilt maximal **12 Stunden** und kann per `revoked_at` sofort widerrufen werden. Admin-Seiten und jede geschützte API prüfen die Sitzung serverseitig gegen PostgreSQL **und** gültige Admin-Konfiguration. Keine Signaturprüfung allein anhand eines Cookies.
- Produktionscookie `__Host-bda-session` mit Secure, HttpOnly, SameSite=Strict, Path=/ ohne Domain; auf lokalem HTTP nur `bda-session-dev`. POST Login/Logout prüfen den Origin gegen den Host; Fehlversuchskonto wird **nach fünf Versuchen für 15 Minuten** gesperrt.
- Die Sessions sind **opaque**, daher braucht dieses Modell kein globales `SESSION_SECRET` zum Cookie-Signieren. Der frühere Scaffold-Platzhalter ist kein aktiver Sicherheitsschlüssel. Konfigurationsentzug verweigert Zugriff, löscht aber noch keine vorhandenen Sitzungen; bei Rotation ist explizite Session-Revocation in der eigenen DB erforderlich.
- Kein neuer Provider, keine automatische Registrierung, kein Multiuser, kein OAuth, kein Live-Deploy. **PR-Merge nur nach ausdrücklicher Betreiberfreigabe.**

## Erwogene Alternativen

| Alternative | Abwägung |
| --- | --- |
| Signierte zustandslose JWT-/Cookie-Sessions | Keine zentrale sofortige Widerrufbarkeit ohne zusätzliche Blacklist; Logout-/Revocation-Ziel schwieriger |
| Fertiger OAuth-/Multiuser-Provider | Für exakt einen lokalen Admin zusätzlicher Account-, API-, Kosten- und Security-Scope |
| Passwort oder Klartext-Bearertoken in der DB | Unnötiges Risiko bei Datenbankabfluss; nicht zulässig |
| Eigenes globales JWT-`SESSION_SECRET` | Für zufällige, serverseitig gespeicherte opaque Tokens unnötig; ein sichtbarer Dummywert könnte falsche Sicherheit suggerieren |

## Folgen und Risiken

**Positiv:** Keine Klartextpasswörter oder Bearertokens in der Datenbank; Logout sofort; Berechtigungsprüfung über Neustarts und Prozesse hinweg; Fail-closed bei fehlender Konfiguration/DB. **Risiken:** Kontosperre ist absichtlich global und kann von Dritten als temporärer Denial-of-Service ausgelöst werden; scrypt-Verifikation kostet CPU/RAM. Deshalb gehören IP-/Edge-Drosselung, Host-/Origin-/TLS-Proxyschutz und Ressourcenlimits zwingend zum späteren Deploy-Gate 029–030. Alte Sitzungsdatensätze müssen bereinigt oder explizit widerrufen werden, insbesondere bei Credential-Rotation. Sicherheits- und Migrationsregressionen brauchen eine isolierte PostgreSQL-Testinstanz.

## Nachweise / Verifikation

- [Integrationstest](https://github.com/whiteyOnTheMoon/BlueDotAtlas/blob/feat/025-single-admin-auth/packages/db/tests/admin-auth.integration.test.ts): Passwortprüfung, Sperre, Hash-only, TTL, Logout und fehlende/malformed Konfiguration.
- [Chromium-/CSRF-Check](https://github.com/whiteyOnTheMoon/BlueDotAtlas/blob/feat/025-single-admin-auth/scripts/check-admin-auth.mjs): anonyme/falsche Cookie-Requests, Formularfehler, Login/Logout und zwei Bildschirmbreiten.
- [GitHub Actions](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/workflows/admin-auth-check.yml): PostgreSQL 16, Migration/Drift, Build, Browser/Produktionscookie. Testläufe des **letzten** PR-Commits vor Abnahme erneut prüfen.
- Nicht umfasst: produktive TLS-/Host-Kette, Proxy-IP-Rate-Limit, Deployment, Secretrotation oder Backup/Restore.

## Änderungshistorie

- 2026-11-19: Vorgeschlagen und zur Sicherheits-/Betreiberprüfung mit Roadmap 025 verknüpft. Keine Abnahme behauptet.
