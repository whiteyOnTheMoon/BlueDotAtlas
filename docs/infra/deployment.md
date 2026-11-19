# Roadmap 029 – Compose/Proxy-Betrieb als isolierter Entwurf

**Stand:** Featurebranch `feat/029-compose-proxy-isolation`; [Issue #46](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/46). **Kein VPS-Deployment, kein tatsächlicher HTTPS-Nachweis, keine Roadmap-029-Abnahme.**

## Ausgangslage
Nach Roadmap 021–028 stehen Next.js-Webapp, Einzeladmin-Login, geschützte API, PostgreSQL/Drizzle-Migrationen, die synthetische PostgreSQL-Jobqueue und ein nur für private Testroots freigegebenes Storage-Modul bereit. **Der 027-Worker ist kein produktiver FFmpeg-/Remotion-Executor** und bleibt im Standardprofil deaktiviert. **Der 028-Storage erlaubt noch keinen produktiven `/srv/blueDotAtlas`-Root.** Render-, Publisher- und Medienrechte bleiben eigenständige Gates.

Der gemeinsame VPS beherbergt zahlreiche produktive Fremddienste. Die Messung aus M01 mit 4 logischen CPUs, 7,8 GiB RAM, ca. 3,9 GiB `MemAvailable`, 89G freiem Speicher und 43 laufenden Containern ist **historisch**. Vor dem ersten Live-Eingriff muss sie neu erhoben werden. Bestehende Container, Datenbanken, Volumes, Proxy-/Cloudflare-Tunnel und Domains dürfen nicht verändert werden.

## Lieferumfang des Entwurfs
- `compose.029.yml`: eigener Compose-Namensraum `bluedotatlas-029`; internes `private_db`-Netz für PostgreSQL ohne Host-Port; Web bindet an **ausschließlich `127.0.0.1:<expliziter geprüfter freier Port>`**. Kein angenommener echter öffentlicher Hostname, keine ungeprüfte Cloudflare-/TLS-Konfiguration.
- `deploy/Dockerfile` und Root-`.dockerignore`: Next.js Standalone mit Monorepo-Tracing, unprivilegierter Node-Prozess, Build-Context ohne `.env*`, Media-Dateien und lokale Daten. Worker-Image nur als gesondertes `future-renderer`-Profil, **nicht** als produktive Renderfreigabe. Migration unter eigenem `maintenance`-Profil, kein automatischer produktiver Schemaeingriff.
- Web mit Read-only-Root, kleinen tmpfs, eingeschränkten Capabilities, `no-new-privileges`, Healthcheck, Restart-Regel und Budget **384 MiB / 0,25 CPU**. PostgreSQL mit eigenem Named Volume, Healthcheck, **512 MiB / 0,25 CPU**. Worker zunächst aus, Planungsgrenze **1024 MiB / 0,5 CPU**. Speicherbudgets 20 GiB Medien, 12 GiB Scratch, 4 GiB DB/WAL/Backups, 1 GiB Web sowie 40 GiB Bestandsreserve plus 12 GiB Reserve sind **nicht** schon OS-erzwungene Quoten.
- `scripts/check-compose-029.mjs`, negative Unit-Tests und `.github/workflows/compose-029-check.yml` prüfen auf einem **wegwerfbaren GitHub-Runner** YAML-Konfiguration, isolierte Container-Netze, fehlende externe DB-Ports, Rechte-/Ressourcenregeln sowie Imagebuild und synthetischen Web-/DB-Smoke. Kein Live-Dienst, keine echten Admins/Medien/Provider.

## Noch nicht freigegebene Runtime-Secrets
Compose verlangt ausschließlich **außerhalb des öffentlichen Repos gespeicherte** Env-Dateipfade: `BDA_DB_ENV_FILE`, `BDA_WEB_ENV_FILE`, `BDA_WORKER_ENV_FILE` und den ausdrücklich geprüften freien `BDA_BIND_PORT`. DB-Datei: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`. Web-Datei: `DATABASE_URL` mit Host `db:5432`, `BDA_ADMIN_EMAIL`, `BDA_ADMIN_PASSWORD_HASH`, `APP_ORIGIN` auf später geprüften HTTPS-FQDN und `NODE_ENV=production`. Worker-Datei bleibt ungenutzt.

**Wichtig:** Normale Container-Env-Werte können für privilegierte Docker-Nutzer bei Container-Inspection sichtbar sein. Aufgabe **030** muss die reale Secretbereitstellung, Dateirechte, Rotation und Redaction separat freigeben; keine echte Konfiguration in Chat, Git, Browser oder CI-Logs ausgeben. Eine `docker compose config`-Ausgabe mit produktiven Werten gehört **nicht** in öffentliche Logs.

## Optionaler nächster Messschritt auf dem echten VPS (ohne Änderungen)

**Es gibt derzeit keinen SSH-Zugriff über die GitHub-Verbindung.** GitHub-Actions-Runner sind **nicht** der Produktiv-VPS. Alle oben beschriebenen bisherigen CI-Messwerte stammen ausschließlich aus isolierten Wegwerfcontainern. Erst ein durch den Betreiber *auf dem wirklichen VPS* ausgeführtes Audit ist ein neuer Betriebsnachweis.

Das bereits in 012 abgenommene Skript [`scripts/audit-vps.sh`](../../scripts/audit-vps.sh) liefert allgemeine, bereits datensparsame CPU-/RAM-/Disk-/Containerzahlen. Ergänzend wurde für 029 das [`scripts/audit-deploy-029.sh`](../../scripts/audit-deploy-029.sh) erstellt: Es **liest nur** `/proc`, `df`, `nproc`, `systemctl is-active`, `docker ps`/Docker-Netzwerkanzahlen und `ss -lnt` und **verändert keine Container, Dateien, Ports oder Proxy-Routen**. Es zeigt *ausschließlich aggregierte Zahlen*, mögliche Host-Reverse-Proxy-Services und den Beleg, ob ein vom Betreiber **selbst gewählter** Port aktuell als Listener/Mapping sichtbar ist. Es liest/zeigt keine IPs, Hostnamen, Container-/Compose-/Volume-/Netzwerknamen, TLS-Schlüssel, Env-Werte oder Tunnel-Konfiguration.

Nur **wenn diese Skripte bereits als geprüfte Kopie auf dem Ziel-VPS vorliegen**, können diese zwei lokalen Befehle ausgeführt werden:

```bash
bash scripts/audit-vps.sh
bash scripts/audit-deploy-029.sh
```

Optional nach privater Portwahl: `bash scripts/audit-deploy-029.sh <KANDIDATENPORT>`. **Nicht** zur Ausführung von ungeprüftem Code mit `curl | bash` oder zu einer GitHub-CI-Inventur auf dem falschen Host verleiten lassen. Falls der BlueDotAtlas-Checkout noch nicht existiert, zuerst einen vertrauenswürdigen, kontrollierten Transfer des überprüften Skripts organisieren und keine produktiven Verzeichnisse überschreiben.

**Auswertung ohne Veröffentlichung sensibler Infrastrukturdetails:** Ergebnisse lokal sichten und bei Bedarf vor Übermittlung bereinigen. Nicht als Rohdatei ins öffentliche Repository/PR oder in öffentliche CI-Artefakte schreiben. Die Ausgabe enthält keine Routendetails; die konkrete Host-/DNS-/Tunnel-/TLS-Konfiguration muss separat von der Betreiberseite unter Geheimhaltung geprüft werden. Ein Port mit „NONE OBSERVED“ ist **nicht reserviert** und die Erreichbarkeit eines hostseitigen Loopback-Ports aus Docker-/Cloudflare-Netzwerk-Namensräumen bleibt offen.

**Nachweise der 029-Audit-Vorbereitung:** CI kontrolliert `bash -n` und `scripts/check-deploy-audit-029.mjs` als rein statische, privacy-bewusste Prüfung, **führt das VPS-Audit aber ausdrücklich nicht auf einem GitHub-Runner aus**.

## Live-Gate vor jeder Änderung des VPS
1. **Read-only inventarisieren:** aktuelle CPU/RAM/Swap/SSD/Inodes/I/O, Docker-/Volume-/Netz-Namen, veröffentlichte Ports, bestehendes Reverse-Proxy-/Cloudflare-Tunnel-Routing, TLS-Zertifikate und bestehende Datenbanken. Das GitHub-Repo allein belegt diese Details nicht.
2. **Betreiber entscheidet separat:** exakter Domainname, freie Loopback-Portnummer, Proxy-/TLS-/Host-Header-Weg, Betreiber-/Service-UID, real isolierte Volumes und zulässige Änderungsliste. Host-Loopback ist **kein automatisch funktionierender Zugang aus einem fremden Proxy-Container**. Ohne geprüfte TLS-/Origin-/Cookie-Kette keine öffentliche Adminfreigabe.
3. **Vor Migration:** frische isolierte Migration/Drift-Prüfung, gesondert bestätigtes Backup-/Restore-Fenster, Rollback-Plan. Niemals `down -v`, Docker-Prune, Reset oder `DROP DATABASE` auf produktiven Diensten. Das CI-Cleanup mit `down --volumes` gilt **ausschließlich** für den disposable GitHub-Runner.
4. **Echte Abnahme messen:** vorgesehenes HTTPS-System erreichbar, sichere Admin-Session, fehlgeschlagene Fremdanmeldung, DB/Queue extern nicht erreichbar, kontrollierter Neustart, Healthchecks, keine fremden Beeinträchtigungen und eingehaltene Limits. Kein automatisches Publish, keine Realvideos. 030-Secretmanagement und 034-Backup/Restore bleiben eigene Aufgaben.

**Dieser GitHub-Entwurf ist nicht das vollständige 029-DoD.** Issue offen halten, bis das realistische Live-HTTPS-/Netz-/Restart-Gate mit konkreter Betreiberfreigabe bestanden ist.

Verbindlich: [Roadmap](../project/master-roadmap-v01-text.md), [Arbeitsvereinbarung](../project/working-agreement.md), [VPS-Audit](vps-audit.md), [Admin-Auth](../development/admin-auth.md), [Worker](../development/worker-queue.md), [Storage](../development/storage.md), [Kosten](../operations/budget-policy.md), [Rechte](../legal/rights-matrix.md).
