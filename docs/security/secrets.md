# Roadmap 030 – Secrets und Konfiguration: Sicherheits- und Rotationsregeln

**BlueDotAtlas · M02 · GitHub-Issue [#47](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/47) · Stand: 19.11.2026 · Status: technische Vorlage zur Betreiberabnahme.**  
**Quellen:** [Master-Roadmap V0.1, 030](../project/BlueDotAtlas_Roadmap.pdf), [Arbeitsvereinbarung DEC-036](../project/working-agreement.md), [Architektur 017](../architecture/overview.md), [Login 025](../development/admin-auth.md), [Deploy 029](../infra/deployment.md), [Budget DEC-032](../operations/budget-policy.md). **Die öffentliche Vorschau 029 ist abgenommen (DEC-043), nicht der produktive Adminbetrieb.**

## 1. Ist-Architektur / Zuständigkeiten

**Keine neue Secret-SaaS-Lösung und kein neuer Vault für V0.1:** BlueDotAtlas verwendet bereits **projektlokale, Git-ignorierte und 0600-geschützte Hostdateien im einen vorhandenen VPS-Checkout** als begrenzte Startlösung. Für den laufenden öffentlichen Vorschau-Stack wurden sie vom Betreiber selbst im vorhandenen Ordner erstellt. Neue Dienste, neue Verzeichnisse pro Branch oder ein zweites Compose-Projekt werden nicht eingerichtet.

| Secret / Konfiguration | Server-only Quelle / Verbraucher | Aktuelle Freigabegrenze |
| --- | --- | --- |
| PostgreSQL-Benutzer und Passwort | `.env.bda.db` via `BDA_DB_ENV_FILE` an den dedizierten DB-Container | Nur eigenes BlueDotAtlas-Compose-Projekt; keine Host-Portfreigabe |
| `DATABASE_URL`, `APP_ORIGIN` und `NODE_ENV` | `.env.bda.web` via `BDA_WEB_ENV_FILE` an Next.js **Server** | `APP_ORIGIN` ist eine öffentliche URL, **kein** Secret. DB-URL/Passwort bleiben privat |
| Cloudflare-Tunnel-Token | `.env.bda.tunnel.token` via `BDA_TUNNEL_TOKEN_FILE` als Docker-Compose-**File-Secret** an `cloudflared --token-file` | Nur bestehender BlueDotAtlas-Tunnel, keine zweite Tunnelanlage |
| `BDA_ADMIN_EMAIL` / `BDA_ADMIN_PASSWORD_HASH` | Später ausschließlich in privater Server-Konfiguration; **aktuell nicht gesetzt** | Kein echter Admin-Login in öffentlicher Vorschau; Produktivfreigabe separat |
| Provider-API-Keys / KI / TTS | **Noch nicht konfiguriert**, später nur im serverseitigen Provideradapter/Worker | Keine Provideraktivierung ohne Rechte-/Budget-/Planfreigabe (gemeinsames Limit 25 €/Monat KI+TTS, andere APIs 0 €) |
| `.env.example` | Lesbare **Vorlage** mit leeren Feldern bzw. nicht geheimen Hinweisen | Keine echten Passwörter, API-Keys, Tokens, Hashwerte oder produktive URLs eintragen |

**Wichtiges Restrisiko:** Compose `env_file` setzt DB-/Web-Konfiguration als **Container-Umgebungsvariablen**; Benutzer mit privilegiertem Docker- oder Hostzugriff können diese beispielsweise über Container-Inspektion auslesen. `0600` ist kein Schutz vor Root-/Docker-Administratoren. Der Tunnel-Token liegt anders als die Web-/DB-Variablen als File-Secret vor. Dies ist **kein vollständig isolierter Secret-Manager**. Ein späterer Umstieg auf DB-/App-File-Secrets erfordert geprüfte Runtime-/Migrationskompatibilität und eine **eigene Betreiberfreigabe**.

## 2. Verbindliche Regeln vor jeder Freischaltung

1. **Kein Secret im Git:** Niemals echte `.env`-Dateien, Tokenfiles, private Schlüssel, Datenbank-Dumps mit Credentials oder unmaskierte Debugreports committen. `.gitignore`, `.dockerignore` und der automatisierte 030-Scanner sind nur zusätzliche Barrieren; auch gelöschte Git-Commits können Geheimnisse enthalten.
2. **Nur serverseitig:** Keine `NEXT_PUBLIC_`-Credentialvariable, Client-Component, `public/`-Datei, Browserantwort, HTML/JS-Bundle, Thumbnail, Video-Metadaten, GraphQL-/API-DTO oder Redirect-URL mit Secretwerten. Spätere Adapter greifen ausschließlich aus Server-/Worker-Prozessen zu. Noch nicht genehmigte Provider bleiben deaktiviert.
3. **Minimalrechte:** Private Hostdateien sind reguläre Dateien (keine Symlinks), gehören dem nicht privilegierten Betreiberkonto und sind `0600`; im Git nur `.env.example`. Die privaten Pfade dürfen nicht in Docker-Build-Kontexte oder GitHub-Uploads gelangen. Die Cloudflared-File-Secret-Datei muss dem Container-Eigentümer-UID/GID zugänglich sein; Token **nicht** als CLI-Argument oder Umgebungswert übergeben.
4. **Konfiguration ohne Ausgabe prüfen:** `docker compose config --quiet` ist zulässig, wenn es auf das **eigene** geprüfte Projekt beschränkt bleibt; das volle Ergebnis von `docker compose config`, `docker inspect`, `printenv`, `set`, Shell-`-x` oder ungefilterte Containerlogs **nicht** in Chat, Screenshots, CI-Artefakte oder Tickets übertragen. Pfad-/Besitzer-/Modusprüfungen dürfen nur **Metadaten** ausgeben.
5. **Fail closed:** Fehlende Konfiguration gibt **keinen** Adminzugang und startet keine API-/LLM-/TTS-Provideraufrufe. Keine automatischen Fallback-Keys, Live-Testanmeldungen oder bezahlten Probeaufrufe. `/api/admin/session` muss anonym 401 liefern.
6. **Keine unautorisierten Betriebsänderungen:** Secretwechsel können Web-/DB-/Tunnel-Neustarts und Session-Widerrufe erfordern; dies ist für 030 **nicht** automatisch genehmigt. Keine DB-/Volume-Resets, keine fremden VPS-Projekte, keine neue Tunnelroute.

## 3. Fehlerlogs, Debugging und Redaction

**Primärer Schutz: Daten erst gar nicht loggen.** Strukturierte, eng begrenzte Diagnoseinformationen dürfen nur Eventname, grobe Fehlerkategorie, Ergebnisstatus, Dauer, internen korrelationsfähigen Zufalls-Identifier und nicht sensitive Zahlwerte enthalten. Debugmodus auf gemeinsamem VPS standardmäßig **aus**; vor Aktivierung Ablauf, Aufbewahrungsdauer und Zugriffsrechte einzeln prüfen.

**Nie** Roh-HTTP-Header (`Authorization`, `Cookie`, `Set-Cookie`), Passwort-/Token-Eingaben, Request-Bodies von Login/API-Requests, Provider-URLs mit Query-Keys, `DATABASE_URL`, `BDA_ADMIN_PASSWORD_HASH`, Tunneldatei-Inhalte, rohe `Error`-/Stack-Objekte, unbereinigte Providerantworten oder DB-Verbindungsfehler in Console/HTTP-Response/Job-Audit übernehmen. Die existierenden Auth-/API-Routen antworten bewusst mit generischen Fehlercodes ohne Exceptioninhalt; Worker-Fehler werden generisch protokolliert. Neue Routen/Provider müssen dies beibehalten.

**Redaction-Fallback bei notwendiger Diagnose:** Nur *bekannte* sensitive Felder auf `[REDACTED]` setzen, inklusive URL-Userinfo, `Authorization`, `Cookie`, `Set-Cookie`, `api_key`, `token`, `password`, `secret` und Credential-Queryparameter. Danach ausschließlich die bereinigten, explizit erlaubten Felder ausgeben; eine Regex auf beliebigen Logtext ist **keine Garantie** und ersetzt das Nichtloggen nicht. Bei Unsicherheit gesamten Fehlertext unterdrücken und nur eine allgemeine Fehlerkategorie ausgeben. Kein „Redaction erfolgreich“ behaupten, wenn unbekannte Providerformate nicht geprüft wurden.

**Incident:** Bei Verdacht auf Exposition sofort den betroffenen API-/Admin-/Tunnel-Zugang über die zuständige **private** Betreiberkonsole widerrufen/rotieren, abhängige Sessions und Providerbudgets prüfen, eventuell betroffene Logs/Git-Historie untersuchen, Nachweise nur ohne Werte dokumentieren. Git-Commit-Löschen **allein** widerruft keine Zugangsdaten. Niemals das vermutete Secret zur „Verifikation“ in ein Ticket oder eine Chatnachricht kopieren.

## 4. Rotation / Wiederherstellung – geplant, nicht durchgeführt

- **Tunnel-Token:** Betreiber legt nach gezielter Freigabe im **bestehenden** Cloudflare-Tunnel einen sicheren Rotations-/Revocation-Zeitpunkt fest, aktualisiert nur die eigene lokale Token-Datei über einen sicheren interaktiven Weg und startet ausschließlich den zugehörigen Connector kontrolliert neu. Vorher/nachher HTTPS- und Fail-closed-Probe; keine neuen Tunnel oder Eingriffe in andere Connectoren.
- **DB-Identität/Passwort:** Ein Env-Datei-Edit allein ändert **nicht** das PostgreSQL-Rollenpasswort und könnte die Anwendung aussperren. Erst Backup-/Restore-Gate 034, Wartungs-/Rollbackplan und konsistenter DB-Rollenwechsel, anschließend autorisierter Web-Neustart und Healthcheck. Kein automatischer SQL-/Migrationslauf in diesem Task.
- **Admin-Zugang:** Derzeitig **nicht aktiviert**. Eine spätere Hashänderung muss mit Session-Widerruf in der **eigenen** Datenbank, erneuter Prüfung von TLS/Cookies/CSRF und einem zusätzlichen Missbrauchsschutz am öffentlichen Login verknüpft werden. Kein Admin-Testaccount auf dem Live-VPS.
- **Provider:** Noch keine produktiven Providerkeys; vor der ersten Einrichtung Anbieter, Rechte, Quoten, Kosten und Stoppschwellen separat abnehmen. Bei Rotation neuen Wert privat einspielen, alten Schlüssel beim Provider widerrufen, kontrollierten Test nur nach Freigabe.

## 5. Prüfpfade und Aussagegrenzen

**Repository/CI (synthetisch):** `node --test scripts/check-secrets-030.test.mjs` und `node scripts/check-secrets-030.mjs` prüfen erlaubte/gesperrte Pfade, bekannte Tokenformate, verbotene Client-Variablen und Git-/Docker-Ignore-Regeln. Die 029-Compose-CI injiziert einen **künstlichen, nicht verwendbaren Canarywert** in die Wegwerf-Webumgebung und prüft vier anonyme Browser-/API-Antworten sowie Testcontainerlogs; keine produktive Secretdatei wird gelesen. Binärdateien und unbekannte Tokenformate sind durch den Scanner **nicht vollständig erfasst**. Ein Scan-PASS bedeutet **nicht**, dass die gesamte Git-Historie, alle Provider oder Live-Logs garantiert geheimnisfrei sind.

**Betreiber auf dem bereits existierenden VPS (nur nach Review, read-only):** Im **einzigen** Checkout kann `bash scripts/verify-secrets-030.sh` Eigentümer, Typ, Rechte und Git-Ignore für die **drei bestehenden** Dateien prüfen, ohne Werte auszugeben. Das Script erwartet ausdrücklich den öffentlichen Vorschau-Modus **ohne** Admin-Konfiguration; einen späteren Admin-Produktivbetrieb darf es nicht unter diesem PASS melden. Keine Shell-`-x`-Ausführung, kein Upload der privaten Dateien. Ein PASS beweist **nur** die geprüften Dateimetadaten und das Fehlen gesetzter Admin-Zeilen, **nicht** die sichere Rotation oder die Abwesenheit von Secrets in allen Laufzeitlogs.

**Offen bis zur separaten Abnahme:** Betreiber-Live-Metadatencheck, echte Passwort-/Tokenrotation, Admin-Edge-Schutz, Live-Response-/Logreview mit bewusst eingesetztem unschädlichem Marker und DB-/Host-Backup/Restore (034). Keine M02-Gesamtproduktionsfreigabe aus einem 030-PR ableiten.
