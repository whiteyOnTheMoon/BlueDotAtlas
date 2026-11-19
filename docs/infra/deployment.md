# Roadmap 029 – Compose/Proxy-Betrieb als isolierter Entwurf

**Stand:** Featurebranch `feat/029-compose-proxy-isolation`; [Issue #46](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/46). **Kein VPS-Deployment, kein tatsächlicher HTTPS-Nachweis, keine Roadmap-029-Abnahme.**

## Ausgangslage
Nach Roadmap 021–028 stehen Next.js-Webapp, Einzeladmin-Login, geschützte API, PostgreSQL/Drizzle-Migrationen, die synthetische PostgreSQL-Jobqueue und ein nur für private Testroots freigegebenes Storage-Modul bereit. **Der 027-Worker ist kein produktiver FFmpeg-/Remotion-Executor** und bleibt im Standardprofil deaktiviert. **Der 028-Storage erlaubt noch keinen produktiven `/srv/blueDotAtlas`-Root.** Render-, Publisher- und Medienrechte bleiben eigenständige Gates.

Der gemeinsame VPS beherbergt zahlreiche produktive Fremddienste. **Betreiberbestätigter neuer Read-only-Snapshot, 19.11.2026, 18:08:36 UTC:** 7,8 GiB RAM gesamt, **3,0 GiB `MemAvailable`**, 4,8 GiB benutzt, 2 GiB Swap mit 1,3 GiB Belegung, Root-Dateisystem 116G/28G benutzt/**88G frei** (24 %), **43 laufende Container**, anhand der Docker-Image-Namen **4 Cloudflared-Tunnel-Container**, **keine** nach Nginx/Caddy/Traefik/HAProxy erkannten Proxy-Container und keine aktiven Standard-Hostservices Nginx/Apache/Caddy/Traefik/Cloudflared. Dieser Test beweist **nicht**, dass keine anderen Reverse-Proxys, Tunnel-Routen oder Host-Policies existieren. Vorheriger M01-Stand: 3,9 GiB verfügbar, 89G frei. Der kleinere aktuelle freie RAM-Spielraum ist ein Planungsgate, kein Produktions-Render-Go. Bestehende Dienste, Proxy-/Cloudflare-Tunnel, Volumes und Domains dürfen nicht verändert werden.

## Lieferumfang des Entwurfs
- **Sichere Standardvariante `compose.029.yml`:** **dauerhaftes einzelnes** Compose-Projekt `bluedotatlas` (keine Staging-Instanz), internes `private_db`-Netz ohne PostgreSQL-Host-Port; **Web veröffentlicht standardmäßig überhaupt keinen Host-Port**. Nur bei ausdrücklich gewähltem lokalem Smoke-/Host-Test ergänzt `compose.029.loopback.yml` eine Bindung `127.0.0.1:<geprüfter Port>` (nicht für die Cloudflare-Tunnelvariante).
- **Spätere Cloudflare-Tunnelvariante `compose.029.cloudflare.yml`:** optionaler eigener `cloudflared`-Service unter dem **standardmäßig deaktivierten Profil `future-tunnel`**. Er liegt ausschließlich im `edge`-Netz und soll über `http://web:3000` an die interne Web-App senden; **weder Web noch PostgreSQL noch cloudflared benötigen veröffentlichte Hostports**. Das Tunnel-Token wird nur als externes Docker-Compose-File-Secret über `--token-file` bereitgestellt. **Neu bestätigter Betreiberstatus:** Das BlueDotAtlas-Tunnelobjekt wurde inzwischen **im Cloudflare-Dashboard angelegt**. Ob bereits ein Connector verbunden ist, ein Public Hostname existiert und die Origin-Route erreichbar ist, ist **noch nicht verifiziert**.
- `deploy/Dockerfile` und Root-`.dockerignore`: Next.js Standalone mit Monorepo-Tracing, unprivilegierter Node-Prozess, Build-Context ohne `.env*`, Media-Dateien und lokale Daten. Worker-Image nur als gesondertes `future-renderer`-Profil, **nicht** als produktive Renderfreigabe. Migration unter eigenem `maintenance`-Profil, kein automatischer produktiver Schemaeingriff.
- Web mit Read-only-Root, kleinen tmpfs, eingeschränkten Capabilities, `no-new-privileges`, Healthcheck, Restart-Regel und Budget **384 MiB / 0,25 CPU**. PostgreSQL mit eigenem Named Volume, Healthcheck, **512 MiB / 0,25 CPU**. Worker zunächst aus, Planungsgrenze **1024 MiB / 0,5 CPU**. Speicherbudgets 20 GiB Medien, 12 GiB Scratch, 4 GiB DB/WAL/Backups, 1 GiB Web sowie 40 GiB Bestandsreserve plus 12 GiB Reserve sind **nicht** schon OS-erzwungene Quoten.
- `scripts/check-compose-029.mjs`, negative Unit-Tests und `.github/workflows/compose-029-check.yml` prüfen auf einem **wegwerfbaren GitHub-Runner** YAML-Konfiguration, isolierte Container-Netze, fehlende externe DB-Ports, Rechte-/Ressourcenregeln sowie Imagebuild und synthetischen Web-/DB-Smoke. Kein Live-Dienst, keine echten Admins/Medien/Provider.

## Noch nicht freigegebene Runtime-Secrets
Compose verlangt ausschließlich **außerhalb des öffentlichen Repos gespeicherte** Env-Dateipfade: `BDA_DB_ENV_FILE`, `BDA_WEB_ENV_FILE` und `BDA_WORKER_ENV_FILE`. **Nur die lokale Loopback-Variante** benötigt zusätzlich den ausdrücklich geprüften `BDA_BIND_PORT`. **Nur die noch deaktivierte Tunnelvariante** benötigt `BDA_CLOUDFLARED_IMAGE` als vom Betreiber geprüftes und gepinntes Cloudflared-Image (Version **≥ 2025.4.0** wegen `--token-file`) sowie `BDA_TUNNEL_TOKEN_FILE` als Pfad zu einem privat gelagerten Tokenfile (kein Tokenwert in einer Environment-Variable, im Kommando oder in Git). DB-Datei: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`. Web-Datei: `DATABASE_URL` mit Host `db:5432`, `BDA_ADMIN_EMAIL`, `BDA_ADMIN_PASSWORD_HASH`, `APP_ORIGIN` auf später geprüften HTTPS-FQDN und `NODE_ENV=production`. Worker-Datei bleibt ungenutzt.

**Wichtig:** Normale Container-Env-Werte können für privilegierte Docker-Nutzer bei Container-Inspection sichtbar sein. Aufgabe **030** muss die reale Secretbereitstellung, Dateirechte, Rotation und Redaction separat freigeben; keine echte Konfiguration in Chat, Git, Browser oder CI-Logs ausgeben. Eine `docker compose config`-Ausgabe mit produktiven Werten gehört **nicht** in öffentliche Logs.

## Cloudflare-Architekturentscheidung 029 – Entwurf, noch kein Betreiber-Gate

Der Betreiber bestätigte am **19.11.2026**, dass die Domain bereits über **Cloudflare** verwaltet wird und er **den Tunnel für BlueDotAtlas bereits im Cloudflare-Dashboard angelegt hat**. Es besteht **keine Notwendigkeit, einen weiteren Tunnel zu erstellen**. Ein **Betreiber-Screenshot der Cloudflare-Tunnel-Routentabelle vom 19.11.2026** bestätigt nun eine *Published application* mit **Destination `studio.ap-pixels.com`** und **Service `http://web:3000`**. Die Tunnel-Verwaltungsmethode sowie die Verbindung/Online-Health des Connectors sind weiterhin **nicht nachgewiesen**. Aktuell sind vier ältere als Cloudflared erkannte Container vorhanden. **Diese vier bestehend betriebenen Tunnel bleiben vollständig unangetastet.** Der für das Projekt gezeigte öffentliche Hostname ist **`studio.ap-pixels.com`** (Cloudflare-Routenkonfiguration, noch kein erfolgreicher End-to-End-HTTPS-Nachweis).

**Geplanter Pfad (keine tatsächliche Infrastruktur):**

```text
Browser --HTTPS--> Cloudflare (`studio.ap-pixels.com`; Access noch offen)
                         |
                 ausgehender Cloudflare-Tunnel
                         |
        cloudflared [eigenes BlueDotAtlas-Compose edge-Netz]
                         |
                    http://web:3000
                         |
                     Next.js/API
                         |
               private_db [intern]
                         |
               PostgreSQL 16 / Queue
```

Die Verbindung vom VPS zu Cloudflare ist **ausgehend**, es werden keine zusätzlichen öffentlichen HTTP/HTTPS-/PostgreSQL-Ports vorausgesetzt. Der Container `cloudflared` hat ausschließlich Anschluss an `edge`; PostgreSQL/Worker/Migrationen ausschließlich an `private_db`; die App verbindet beide internen Netze. Das Docker-Token wird später über das **separat genehmigte** File-Secret `bda_tunnel_token` bereitgestellt; **niemals** Token oder Token-beinhaltende Installationsbefehle in den Chat, ins öffentliche Repository oder in CI-Logs kopieren. Den **bereits angelegten** Cloudflare-Tunnel kann der Betreiber im Cloudflare-Dashboard (Networking → Tunnels → vorhandener BlueDotAtlas-Tunnel → Routes → Published application) später mit einer expliziten Public-Hostname-Route auf die Origin-URL `http://web:3000` konfigurieren – **nur wenn der Connector im BlueDotAtlas-Compose-`edge`-Netz läuft**. **Die Route ist inzwischen im Cloudflare-Dashboard als konfiguriert nachgewiesen (`studio.ap-pixels.com` → `http://web:3000`); eine aktive Connector-Verbindung oder tatsächliche Origin-Erreichbarkeit ist nicht nachgewiesen.** Für einen auf dem Host laufenden oder einem fremden Docker-Netz zugeordneten Connector ist `web:3000` **nicht automatisch erreichbar**. Keine neue Tunnelanlage und keine Änderung bestehender Tunnel; Aktivierung erst nach der konkreten Cloudflare-/VPS-Betriebsfreigabe. Ob die Adminoberfläche zusätzlich durch Cloudflare Access geschützt wird, welche Seiten öffentlich bleiben, und welche kostenfreien/vertragskonformen Features möglich sind, gehört vor Aktivierung zur gesonderten Sicherheitsabnahme; die eigene Admin-Authentifizierung bleibt erforderlich.

**Konfigurationstypen (alle nur für spätere freigegebene Nutzung):**
- Basis: `compose.029.yml` – **keine** Hostports und keine laufende Cloudflare-Verbindung.
- Lokales CI/Host-Testoverlay: `compose.029.yml` + `compose.029.loopback.yml` – **genau ein** Loopback-Web-Port, kein Tunnel.
- Künftiges Tunneloverlay: `compose.029.yml` + `compose.029.cloudflare.yml`, ausdrücklich `--profile future-tunnel` – **kein Web-Hostport**, Tunnel **nur** per geprüftem Image und externem Tokenfile. Das Worker-Profil `future-renderer` und die Wartungsmigration bleiben deaktiviert.

**Ausstehende Betreiberentscheide:** **bereits gezeigter Hostname `studio.ap-pixels.com`** als final beabsichtigte Admin-/Studio-Adresse bestätigen; Public-/Admin-Zugriffspfad, **vorhandenes Tunnelobjekt auf Verwaltungstyp und Connector-Status prüfen (NICHT neu anlegen)**; die angelegte Route **nicht voreilig ändern**; geprüftes Cloudflared-Image/Digest, Secret-Staging 030, Proxy-/Secure-Cookie-Abnahme, Restart-/DB-/Backup-Tests. **Keine** Zugangsdaten, neue DNS-Einträge, Domains oder Gebühren durch diesen Entwurf.

Technische Grundlage: [Cloudflare Tunnel](https://developers.cloudflare.com/tunnel/), [`--token-file` ab Version 2025.4.0](https://developers.cloudflare.com/tunnel/reference/run-parameters/), [Cloudflare Access für selbst gehostete Anwendungen](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/). Referenzen sind keine Belege für eine bereits laufende BlueDotAtlas-Route.

## Übergabe: vorhandener Cloudflare-Tunnel

Der Betreiber hat das Tunnelobjekt bereits im Cloudflare-Dashboard angelegt. **Status:** Tunnelobjekt **angelegt** und Route **`studio.ap-pixels.com` → `http://web:3000` im Betreiber-Screenshot belegt**; der Connector-Status **„Connected“**, erfolgreiche **HTTPS-Erreichbarkeit** und produktive Freigabe sind **noch offen**. Die konkrete Checkliste steht in [`cloudflare-existing-tunnel-029.md`](cloudflare-existing-tunnel-029.md). Dort wird ein **remote-managed** Dashboard-Tunnel vom abweichenden **locally-managed** Credentials-JSON-Verfahren unterschieden. Das vorhandene Compose-Overlay mit `--token-file` unterstützt nur **remote-managed** Tunnel und erfordert cloudflared **ab Version 2025.4.0**. Die laufenden vier älteren Tunnelcontainer liefern keinen Nachweis für einen neuen BlueDotAtlas-Connector.

**Nächster unsensibler Abgleich:** Im Cloudflare-Dashboard unter **Overview** prüfen, ob der vorhandene Tunnel/Connector bereits *Connected* ist. Die *Published application* `studio.ap-pixels.com` mit Origin `http://web:3000` ist im **Routes**-Screenshot bereits belegt; **keinen zusätzlichen DNS-/Tunnel-/Route-Schritt automatisch ausführen**. Der Hostname wird vor der endgültigen öffentlichen Adminfreigabe nochmals bestätigt. Nicht vorgreifen: die Origin `http://web:3000` funktioniert nur aus einem Connector im BlueDotAtlas-`edge`-Docker-Netz, **nicht** aus einem isolierten fremden Host/Compose-Netz. Für die Admin-Oberfläche braucht es vor dem öffentlichen Aktivieren einen geeigneten Cloudflare-Access-Schutz und einen geprüften Ende-zu-Ende-HTTPS-/SameSite-/Secure-Cookie-/CSRF-Test.

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

## CI-Regression: serielle Monorepo-TS-Builds

Im unabhängigen `monorepo-bootstrap-check` am 19.11.2026 trat unter parallelem `pnpm -r build` sporadisch ein TypeScript-Fehler auf: Worker und Web starteten gleichzeitig erneute `packages/db`-Builds, sodass `packages/db/dist/queue.d.ts` kurzzeitig als **kein Modul** gelesen wurde (`TS2306`). Die isolierte 029-Compose-CI hatte denselben Quellstand parallel bereits erfolgreich gebaut. Das Root-`package.json` führt deshalb `pnpm build` und `pnpm typecheck` mit `--workspace-concurrency=1` aus. Damit werden verschachtelte Build-Skripte nicht gleichzeitig auf denselben TypeScript-Output losgelassen. Diese Änderung betrifft den CI-/Monorepo-Ablauf, **nicht** den VPS oder produktive Container und benötigt die Wiederholung sämtlicher betroffener Checks auf dem finalen PR-Head.

## Live-Gate vor jeder Änderung des VPS
1. **Read-only inventarisieren:** aktuelle CPU/RAM/Swap/SSD/Inodes/I/O, Docker-/Volume-/Netz-Namen, veröffentlichte Ports, bestehendes Reverse-Proxy-/Cloudflare-Tunnel-Routing, TLS-Zertifikate und bestehende Datenbanken. Das GitHub-Repo allein belegt diese Details nicht.
2. **Betreiber entscheidet separat:** exakte Cloudflare-Zone und gewünschter Hostname, **eigenes BlueDotAtlas-Tunnelobjekt ohne Eingriff in bestehende Tunnel**, interne Service-URL `http://web:3000` im BlueDotAtlas-Compose-Edge-Netz, Cloudflare-Zugangsschutz für den Admin, HTTPS-/Origin-/Host-/Forwarded-Header-/Cookie-Kette, Betreiber-/Service-UID, isolierte Volumes und zulässige Änderungsliste. **Keine öffentliche Portfreigabe nötig oder geplant**. Ein optionaler Host-Loopback-Port ist nur ein separater CI-/lokaler Testpfad und nicht automatisch aus einem bestehenden Tunnelcontainer erreichbar. Ohne echten TLS-/Auth-End-to-End-Test keine Adminfreigabe.
3. **Vor Migration:** frische isolierte Migration/Drift-Prüfung, gesondert bestätigtes Backup-/Restore-Fenster, Rollback-Plan. Niemals `down -v`, Docker-Prune, Reset oder `DROP DATABASE` auf produktiven Diensten. Das CI-Cleanup mit `down --volumes` gilt **ausschließlich** für den disposable GitHub-Runner.
4. **Echte Abnahme messen:** vorgesehenes HTTPS-System erreichbar, sichere Admin-Session, fehlgeschlagene Fremdanmeldung, DB/Queue extern nicht erreichbar, kontrollierter Neustart, Healthchecks, keine fremden Beeinträchtigungen und eingehaltene Limits. Kein automatisches Publish, keine Realvideos. 030-Secretmanagement und 034-Backup/Restore bleiben eigene Aufgaben.

**Dieser GitHub-Entwurf ist nicht das vollständige 029-DoD.** Issue offen halten, bis das realistische Live-HTTPS-/Netz-/Restart-Gate mit konkreter Betreiberfreigabe bestanden ist.

Verbindlich: [Roadmap](../project/master-roadmap-v01-text.md), [Arbeitsvereinbarung](../project/working-agreement.md), [VPS-Audit](vps-audit.md), [Admin-Auth](../development/admin-auth.md), [Worker](../development/worker-queue.md), [Storage](../development/storage.md), [Kosten](../operations/budget-policy.md), [Rechte](../legal/rights-matrix.md).
