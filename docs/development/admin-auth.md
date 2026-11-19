# Roadmap 025 – Einzeladmin-Login / Session-Sicherheit

**Status:** Featurebranch `feat/025-single-admin-auth`; PR muss technisch und vom Betreiber freigegeben werden. [Issue #42](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/42).

## Architektur

Nur **ein** konfiguriertes Admin-Konto `BDA_ADMIN_EMAIL` + `BDA_ADMIN_PASSWORD_HASH`. Kein Registrieren, kein Account-Reset, kein OAuth, keine Nutzerverwaltung. Der gespeicherte Hash verwendet salzgebundenes, speicherhartes **scrypt** mit `N=32768, r=8, p=3`, 16-Byte-Zufallssalt, 64-Byte-Ableitung und konstantzeitlicher Prüfung. Ein Passwort ist mindestens 12 und höchstens 256 Zeichen lang. Es wird niemals gespeichert oder protokolliert.

Eine erfolgreiche Authentifizierung erstellt ein 32-Byte-kryptografisches Zufallstoken. **Nur sein SHA-256-Hash** wird in der PostgreSQL-Tabelle `admin_sessions` gespeichert, mit Ablauf nach **12 Stunden** und optionaler sofortiger `revoked_at`-Sperre. Bei jedem Aufruf von `/admin` und `/api/admin/session` wird der Cookie gegen die Datenbank **und die vorhandene, gültige Einzeladmin-Konfiguration** geprüft. Der Next-Proxy ist nur ein erster Filter und **nie der einzige Schutz**. Fehlendes oder unerreichbares PostgreSQL sowie fehlende/ungültige `BDA_ADMIN_EMAIL`- oder `BDA_ADMIN_PASSWORD_HASH`-Konfiguration führen **auch bei noch gültigem Sessiontoken** zur Zugriffsverweigerung. Da zufällige Sitzungstokens nur als SHA-256-Hash in PostgreSQL liegen, wird kein separates globales `SESSION_SECRET` zum Signieren benötigt; der gleichnamige alte Scaffold-Platzhalter in `.env.example` ist für diese Auth-Variante nicht aktiv. Entfernen der Konfiguration sperrt aktuelle Zugriffe, ist aber kein dauerhafter Widerruf: Für einen unumkehrbaren Session-Widerruf müssen die betroffenen Datensätze in der eigenen Admin-Datenbank widerrufen werden (späteres Betriebs-Runbook 029–030).

Bei fünf Fehlversuchen wird das Einzelkonto für **15 Minuten** in der persistenten `admin_login_state` gesperrt. Für V0.1 ist das eine einfache Brute-Force-Schranke; ein fremder Angreifer könnte so auch eine temporäre Sperre auslösen. Zusätzliche IP-/Edge-Drosselung und TLS-Proxy-Konfiguration sind **vor Livebetrieb** in 029–030 abzusichern.

Das Produktionscookie heißt `__Host-bda-session`, ist **HttpOnly, Secure, SameSite=Strict, Path=/, ohne Domain**. Im lokalen `next dev` wird der Name `bda-session-dev` mit demselben Sicherheitsmodell außer Secure verwendet, weil lokale HTTP-Entwicklung andernfalls nicht funktioniert. **Keinen HTTP-Produktivzugang bereitstellen.** Seiten-/API-Antworten werden nicht gecacht.

Login und Logout sind ausschließlich `POST`, erlauben nur den gleichen HTTP-Origin und haben bei Erfolg einen `303`-Redirect. Auf Logout wird das Token in PostgreSQL **widerrufen**, anschließend der Cookie gelöscht. Alle zukünftigen Admin-APIs müssen die Session unabhängig vom Cookie-Vorhandensein prüfen. Der öffentliche Videobereich erhält keinerlei Auth-Daten.

## Sichere lokale Ersteinrichtung

1. Eine **eigene** lokale PostgreSQL-16-Instanz verwenden; keine vorhandenen Fremd-DBs/Volumes verändern.
2. `pnpm install --frozen-lockfile && pnpm build` und `pnpm --filter @bluedotatlas/db db:migrate` in der eigenen Testdatenbank.
3. Im Terminal **ohne Kommandozeilen-Passwortargument und ohne Shell-History** einen starken Passwort-Hash erzeugen:

```bash
read -rsp 'New admin password (12+ characters): ' BDA_PASSWORD; echo
export BDA_ADMIN_PASSWORD_HASH="$(printf '%s' "$BDA_PASSWORD" | node packages/db/scripts/hash-admin-password.mjs)"
unset BDA_PASSWORD
```

4. Zusätzlich `BDA_ADMIN_EMAIL` auf die eigene Adminadresse setzen; `DATABASE_URL` nur im Serverprozess bereitstellen. Hash und DB-URL niemals committen, veröffentlichen, in Browser-JavaScript oder Actions-Logs ausgeben.
5. Lokal `pnpm --filter @bluedotatlas/web dev` und `/admin/login` öffnen. Fehlendes Passwort-Hash/DB-Konfiguration führt zu **503**, nicht zu Admin-Zugriff.
6. Unter `/admin` den eingeloggten Status, erneutes Laden, **Sign out**, erneuten Login und abgelaufene/falsche Sessions prüfen. `/api/admin/session` antwortet anonym mit **401** und angemeldet mit **200**.

## CI / Verifikation

Eine **wegwerfbare** PostgreSQL-Service-DB `localhost/bda_test` und nur synthetische Admin-Testzugangsdaten. Prüfung: `0002`-Migration neu und erneut, Hash/Lockout, DB-Expiry/Revocation, falscher Cookie, CSRF-Cross-Origin, echtes Browser-Login mit Screenshots (Desktop/Mobil), Logout und bestehende 022–024-Regressionen; `pnpm --frozen-lockfile` und Drizzle-Kit-Drift. **Keine** echte Betreiberadresse, kein Passwort und kein Auth-Token wird eingecheckt.

## Offene Produktionsgates

Noch keine reale Admin-URL, kein TLS-Reverse-Proxy, kein Secret-Manager und kein produktiver DB-Deploy. Aufgaben 029–030 konfigurieren HTTPS, Secret-Rotation und Zugangsschutz. Aufgabe 034 prüft Restore. M02 ist bis dahin nicht produktiv abgenommen.

**Origin-Gate:** Mutation per Form-POST wird nur bei exakt passendem Browser-`Origin` und `Host` akzeptiert. Im Produktionsmodus ist HTTPS für nicht lokale Hostnamen obligatorisch. Der vorangestellte Reverse Proxy muss die erlaubten Hostnamen/TLS korrekt erzwingen (029), nicht nur Header blind durchreichen. Passwortverifikation erfolgt nach persistenter Sperrprüfung unter Kontosperre, um CPU-Last durch parallele Login-Versuche zu begrenzen.

**Parameterbegründung:** Die [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) nennt scrypt **N=2^15, r=8, p=3** als gleichwertige Konfiguration zu N=2^17, r=8, p=1 mit kleinerem (ca. 32 MiB) RAM-Peak pro Verifikation. Die Verifikation läuft erst nach dem DB-Lockout-Check unter einer PostgreSQL-Kontosperre; der gemeinsame VPS erfordert vor Produktivbetrieb gesonderte Lastgrenzen und IP-Drosselung (029–030).
