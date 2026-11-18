# BlueDotAtlas — VPS-Inventur und Ressourcenbudget (M01 / 012)

**Status: ZWEI VPS-BETREIBER-SNAPSHOTS (vor und nach Bereinigung) VORHANDEN; 94 % Speicherauslastung weiterhin kritisch. Providerdaten, Ressourcenbudget und Nutzerfreigabe OFFEN. Aufgabe 012 ist noch NICHT abgenommen.**  
**Roadmap-Ergebnis:** `docs/infra/vps-audit.md` · [Issue #27](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/27) · Branch `infra/012-vps-audit`.  
**Roadmap-Quelle:** `BlueDotAtlas_Roadmap.pdf`, M01, Aufgabe 012, Seite 5: CPU-Kerne, RAM, SSD-Freiraum, I/O, OS, Docker-Version, Netzwerk, Bandbreite, vorhandene Dienste und Ressourcenpuffer dokumentieren. **Abnahme:** Messwerte sowie nutzbare Ressourcen für **Web, DB und Renderer** müssen nachvollziehbar sein. **Vorher: 010** (erfüllt, PRD DEC-026).

## 1. Was wir wissen und was wir noch nicht wissen

**Bereits bekannt (nur Projektvorgabe):** BlueDotAtlas V0.1 soll auf **einem eigenen VPS** betrieben werden; eine öffentliche Videothek, ein geschützter Einzeladmin, eine Datenbank und ein separater Renderworker sind geplant. Die Render-Zielausgabe ist zunächst Full HD 1920×1080/H.264; ein echter VPS-Render-Test ist erst **Aufgabe 013**. Diese Projektvorgaben sind **kein gemessener VPS-Nachweis**.

**Tatsächlich über den VPS bekannt:** Der Betreiber hat am **17.11.2026 um 18:40:28 UTC** die **bereinigte Ausgabe des read-only Skripts vom vorgesehenen Linux-VPS** im Projektchat bereitgestellt. Das sind **vom Betreiber mitgeteilte Host-Snapshot-Werte**, keine von dieser GitHub-Verbindung selbst verifizierten VPS-Metriken und kein Render-Benchmark. Die **gezielte Betreiber-Bereinigung von VideoNewsStudio und GoldenOracle** ist anhand von Terminal-Rückmeldungen protokolliert; die **Nachmessung am 17.11.2026 19:21:09 UTC** belegt **+0,92 GiB freien Speicher, +282 MiB verfügbaren RAM, acht weniger aktive Container**. Der Datenträger ist trotzdem **94 % belegt**; Provider- und Busy-Hour-Angaben stehen aus. GitHub Actions laufen in gehosteten Test-Runnern und dürfen **niemals** als VPS-Messung ausgegeben werden.

## 2. VPS-Betreiber-Snapshot vom 17.11.2026 (noch vor Bereinigung)

Alle Werte gehören zum **tatsächlichen Ziel-VPS**, nicht zum eigenen Laptop/Cloud-Runner. Die öffentliche Repository-Dokumentation verwendet nur die für Kapazitätsplanung erforderlichen **bereinigten Aggregatwerte**, **keine IPs, Hostnamen, Usernamen, Schlüssel, Tokens, private Ports, Container-/Kundennamen oder Umgebungsvariablen**.

| Merkmal (Roadmap 012) | Ist-Wert | Messmethode / Nachweis | Relevanz |
| --- | --- | --- | --- |
| Messzeitpunkt UTC und VPS-Tarif/Provider (Tarifbezeichnung optional anonymisiert) | **2026-11-17 18:40:28 UTC**; VPS-Vertrags-/Tarifdetails **OFFEN** | Ausgabe von `scripts/audit-vps.sh` + Provider-Vertragsdaten | Kontext / Nachprüfbarkeit |
| OS + Kernel, Architektur | Ubuntu **24.04.4 LTS**, Kernel **6.8.0-137-generic**, **x86_64** | `/etc/os-release`, `uname` | Laufzeitkompatibilität |
| CPU: verfügbare vCPU/logische CPUs, ggf. Cgroup-Quota und CPU-Typ | **4** logisch für Prozess verfügbar; **128** im Gastsystem konfiguriert (KEIN VPS-Budget); **2** Gast-„physical cores“ gemeldet (keine Host-Garantie); Cgroup-CPU-Limit **nicht auslesbar**; Load 1/5/15 **0,58 / 0,51 / 0,60** | `nproc`, `lscpu`, `cpu.max`, Providervertrag | Web/DB/Render-Verteilung |
| RAM gesamt und verfügbar, Swap, ggf. Memory-Limit | RAM **7964 MiB gesamt, 2409 MiB verfügbar**; Swap **2048 MiB gesamt, 989 MiB frei (1059 MiB belegt)**; Cgroup-RAM-Limit **nicht auslesbar** | `/proc/meminfo`, `memory.max` | Vermeidung von OOM / Swap-Spitzen |
| SSD-Typ und Gesamt- / belegter / freier Speicher | **ext4: 115,20 GiB gesamt, 108,16 GiB belegt, 7,02 GiB frei, 94% belegt**. Laufwerk meldet **rotational guest flag**; **SSD/NVMe/HDD daraus NICHT sicher bestimmbar** | `df`, `lsblk` plus SSD-Nachweis vom Provider | OS, DB, Render-Scratch, MP4s |
| Speicherort/-filesystem für temporäre Renderdateien | **OFFEN**: Root/ausgewähltes Dateisystem gemessen; tatsächliches Render-Scratch-Dateisystem nicht bestimmt | `df` am vorgesehenen Renderverzeichnis; ohne Pfadoffenlegung | Platz und I/O-Konkurrenz |
| I/O: Basislast, Stalls, verfügbare Durchsatz-/IOPS-/Latenzdaten | I/O-Stall-Pressure **avg10=0.00, avg60=0.00, avg300=0.00** im Snapshot; **keine Throughput-, IOPS-, Latenz- oder Busy-Hour-Messung** | `/proc/pressure/io`; ggf. `iostat`/Provider-Metriken bei ausdrücklicher Zustimmung | Renderer und DB dürfen einander nicht blockieren |
| Docker CLI + Engine Version, Zugriffsstatus | Docker CLI/Engine **29.1.3**, Zugriff funktionierte | `docker --version`, `docker version` | spätere Laufzeit |
| Vorhandene Dienste und Docker-Auslastung | **51 aktive Docker-Container** im Snapshot, Docker-Dienst aktiv; mehrere unabhängige App-Stacks; zu entfernende VideoNewsStudio-Instanz **noch aktiv**. Andere Dienste nicht als frei gebbar einplanen | gekürzte Whitelist aus `systemctl`, Anzahl laufender Container; Betreiber prüft weitere Dienste | Reserven für bereits belegte Kapazität |
| Netzwerk: Schnittstellen, Nutzung, realer Durchsatz/Latenz | **83** vom Skript gezählte Netzwerkschnittstellen, RX **223729,2 MiB** und TX **225843,1 MiB** seit Boot; **24 TCP-Listen-Sockets**. Zähler sind keine Geschwindigkeit oder monatliche Abrechnung | aggregierte RX/TX-Zähler plus später ggf. ausdrücklich genehmigter Bandbreitentest | Medien-Downloads/Player/API |
| Bandbreite/Traffic-Paket: Provider-Limit und egress/Monat | **OFFEN**: Providervertrag, monatliches Transferlimit, Egress-Cap und Linkgeschwindigkeit fehlen | **Providerportal/Vertrag**, keine belastbare Aussage durch lokale RX/TX-Zähler | Video-Hosting-/Traffic-Budget |
| Betriebslast zu Hauptnutzungszeiten | **OFFEN**: nur ein Betreiber-Snapshot; Nachmessung nach Deinstallation + Busy-Hour-Baseline erforderlich | zumindest zweiter Zeitpunkt und vorhandenes Provider-Monitoring | Einzel-Snapshot ist nicht zuverlässig |

### Nachbereinigungs-Snapshot: Vergleich mit dem ersten Betreiber-Messlauf

**Gemessen am 17.11.2026 um 19:21:09 UTC**, nach der gezielten VideoNewsStudio-/GoldenOracle-Bereinigung. Der Betreiber bestätigt **keine verbliebenen Container oder Docker-Volumes mit den entfernten Projektpräfixen**. Diese Werte stammen aus dem Terminal des VPS-Betreibers, **nicht** aus GitHub-CI oder einem eigenen SSH-Zugriff.

| Messgröße | Vorher, 18:40:28 UTC | Nachher, 19:21:09 UTC | Veränderung |
| --- | ---: | ---: | --- |
| Verfügbare logische CPUs | 4 | 4 | Unverändert; 128 konfigurierte CPUs sind **keine** VPS-Kapazität |
| CPU-Load 1/5/15 min | 0,58 / 0,51 / 0,60 | 0,26 / 0,51 / 0,63 | Momentaufnahme |
| RAM gesamt | 7964 MiB | 7964 MiB | Unverändert |
| RAM verfügbar (MemAvailable) | 2409 MiB | **2691 MiB** | **+282 MiB**, keine garantierte Renderreserve |
| Swap frei | 989 MiB | **1119 MiB** | **+130 MiB**; 929 MiB weiter belegt |
| ext4 gesamt | 115,20 GiB | 115,20 GiB | Unverändert |
| ext4 belegt | 108,16 GiB | **107,24 GiB** | **−0,92 GiB** |
| ext4 frei | 7,02 GiB | **7,94 GiB** | **+0,92 GiB** |
| ext4 Auslastung | 94 % | **94 %** | **Weiterhin kritisch** |
| Aktive Docker-Container | 51 | **43** | **−8**; insgesamt 55 Container, davon 12 inaktiv |
| I/O-PSI avg10/60/300 | 0 / 0 / 0 | 0 / 0 / 0 | Kein IOPS-/Latenznachweis |
| OS / Docker | Ubuntu 24.04.4 / Docker 29.1.3 | Gleich | Unverändert |

**Netzwerkzähler sind NICHT vergleichbar:** Die Zahl der Netzinterfaces fiel von **83 auf 73**; gleichzeitig fielen die aggregierten RX/TX-Zähler „seit Boot“, weil entfernte virtuelle Interfaces nicht mehr mitgezählt werden. Daraus keine Traffic- oder Bandbreitenersparnis ableiten.

#### Docker-Datenträgerdiagnose nach Bereinigung: `docker system df`

| Bereich | Gesamt / aktiv | Reported size | Reclaimable |
| --- | --- | ---: | ---: |
| Images | **704 / 32** | **66,31 GB** | **40,96 GB (61 %)** |
| Containers | **55 / 43** | **901,9 MB** | **372,3 MB (41 %)** |
| Local Volumes | **7 / 4** | **541,8 MB** | **53,12 MB (9 %)** |
| Build Cache | **1892 / 0 in use** | **53,96 GB** | **11,67 GB** |

**Nicht addieren oder als garantiert freigebbaren Speicher verbuchen:** Docker-Images teilen Layer, Cache/Images können sich überschneiden. „Reclaimable“ berücksichtigt nicht alle Anforderungen anderer Projekte an Rollbacks/Builds. **Kein globales `docker system prune -a`, `docker volume prune` oder `docker builder prune -a`** ohne eigene Zuordnungsprüfung und gesonderte Entscheidung. Erst lesend verwaiste Image-/Buildcache-Kandidaten und betroffene Deployments identifizieren.

#### Nachtrag – gezielte Bereinigung der alten VideoNewsStudio-Images

Der Betreiber zeigte **16 eindeutig über ihre Repository-Namen zuordenbare alte VideoNewsStudio-Web-/API-Images** (unter `ghcr.io/whiteyonthemoon/videonews-studio-api` und `ghcr.io/whiteyonthemoon/videonews-studio-web`, jeweils mit Tag `<none>`) und hat die **Entfernung aller VideoNewsStudio-Reste ausdrücklich freigegeben**. **Diese Images sind nun als gelöscht nachgewiesen**: Betreiber hat alle **16** per Repository-Namen selektierten VNS-Images nach Prüfung auf referenzierende Container ohne `--force` entfernt, und die erneute Docker-Image-Abfrage meldete **keine** benannten VideoNewsStudio-Images. Empfohlene gezielte Vorgehensweise: Nur Images der zwei exakt benannten Repositories selektieren, `docker ps -aq --filter "ancestor=<ID>"` vor jedem Löschversuch prüfen, anschließend ggf. `docker image rm <ID>` **ohne `--force`**. **Nachmessung durchgeführt:** Images **704 → 688**, davon aktiv **32 → 30**; Images-Größe **66,31 → 65,75 GB**, von Docker als reclaimable ausgewiesen **40,96 → 40,61 GB**; `df -h /` zeigt **116G insgesamt, 107G verwendet, 8.6G frei, 93 % ausgelastet**. Dies ist eine gerundete `df -h`-Momentaufnahme, nicht exakt mit der 7,94-GiB-Skriptmessung vergleichbar. Nach Abschluss der Restbereinigung Inventur erneut ausführen.

**Noch vorhandene VideoNewsStudio-Reste:** drei eindeutig benannte Docker-Netzwerke `videonews-studio_backend`, `videonews-studio_feed_egress`, `videonews-studio_frontend` und ein dedizierter Konfigurationsordner unter dem Benutzer-Home-Verzeichnis. Sie sind **noch NICHT entfernt**. Netzwerk-Container-Endpunkte zunächst prüfen; die gemeinsame Cloudflare-Compose-Konfiguration und andere Projekte nicht pauschal löschen.

**Nicht automatisch zuordnen:** **632 ungetaggte Images** und der Buildcache mit `docker buildx du`-Werten **Shared 42,29 GB, Private 11,67 GB, Reclaimable 53,96 GB** sind **nicht als VideoNewsStudio-Reste bewiesen**. Keine globale Image-, Cache- oder Volume-Prune-Aktion und keine Eingriffe in laufende bzw. wiederherstellbare andere Projekte. Gemeinsame Cloudflare-Tunnel-/Netzkonfigurationen separat überprüfen.

**Fazit:** Vier verfügbare CPUs und 2691 MiB kurzfristig verfügbarer RAM stehen **nur 7,94 GiB freiem Festplattenplatz bei 94 % Belegung** gegenüber. Ohne verlässliche Reserven für OS, Web, DB, WAL/Backups, temporäre Medien und FFmpeg-Scratch **kein Render-Go**. Providerlimits, SSD-Typ und Busy-Hour-Baseline bleiben offen.

### Auswertung des ersten Betreiber-Snapshots

- **CPU:** Planbare logische CPUs zunächst höchstens **4 verfügbar**; die angezeigten **128 konfigurierten CPUs** sind keine 128 nutzbaren VPS-Kerne. Spätere Cgroup-/Provider-Limits können enger sein.
- **RAM:** **2409/7964 MiB (~30%)** zum Zeitpunkt verfügbar. **1059/2048 MiB Swap (~52%)** bereits belegt. Die verfügbare RAM-Menge ist **keine sichere, garantierte Renderreserve**.
- **Massenspeicher: KRITISCH.** Lediglich **7,02 GiB** frei bei **94% Auslastung**; **keine 1080p-Renderjobs** starten, solange OS-/DB-Puffer und Render-Scratch nicht nachweisbar gesichert sind. Der vom Gast gemeldete Rotationsstatus bestätigt **weder physische HDD noch SSD**.
- **Konkurrenzlast:** **51 laufende Container**, darunter ein vom Nutzer zur vollständigen Löschung bestimmter ehemaliger VideoNewsStudio-Stack. **Zusätzlich vom Nutzer zur vollständigen Löschung vorgesehen:** das ausschließlich GoldenOracle enthaltende WordPress-Projektverzeichnis (private Hostpfade nicht veröffentlicht), dessen eigenständiger WordPress-/MariaDB-Container samt benanntem DB-Volume und der gesonderte GoldenOracle-Tunnel-Container. **Wichtig:** `cloudflared_goldenoracle` gehört zum **gemeinsamen** Compose-Projekt `cloudflared`, daher darf das gesamte `cloudflared`-Projekt nicht gestoppt oder gelöscht werden. **AP Pixels**, **AP Pixels Dev**, **Kurvenfunk**, **FootballStudio** und weitere Anwendungen bleiben erhalten. **Die gezielte Betreiberbereinigung wurde danach laut Terminalausgaben ausgeführt (siehe Abschnitt oben); Nachprüfung ausstehend.** Nach gezielter Bereinigung erneut messen.
- **I/O/Netz:** Null-PSI in diesem kurzen Snapshot belegt **keinen** ausreichenden Disk-Durchsatz; RX/TX seit Boot sind **keine** Bandbreiten-/Provider-Tarifmessung.

**Vorläufiges Urteil:** Der VPS ist für den geplanten Video-Renderer **noch nicht abnahmefähig** (kritisch knapper Speicher, RAM-/I/O-/Traffic-/Spitzenlast-Budget offen). Es ist **kein endgültiges Render-No-Go**, weil nach der gezielten Bereinigung und Task 013 neue Messwerte erforderlich sind. **Keine Hardware- oder Monatskosten-Grenzwerte erfinden.**

### Betreiber-Bereinigung nach dem ersten Snapshot (Nachweis aus Terminalausgabe)

**Status am 17.11.2026: vom Betreiber ausgeführte und als erfolgreich zurückgemeldete Teilschritte; hier keine unabhängige Serverprüfung.** Der Auftraggeber hat die gezielte Löschung von **VideoNewsStudio** und der **WordPress-Instanz GoldenOracle** einschließlich ihrer Daten ausdrücklich bestätigt. AP Pixels, AP Pixels Dev, Kurvenfunk, FootballStudio und sonstige Projekte sollen erhalten bleiben.

| Teilschritt | Sichtbarer Nachweis | Stand |
| --- | --- | --- |
| Docker-Container des Compose-Projekts VideoNewsStudio stoppen und entfernen | `docker ps --filter label=com.docker.compose.project=videonews-studio` mit `docker stop` und `docker rm`: Container-IDs wurden als erfolgreich gestoppt/entfernt ausgegeben | **Vom Betreiber als durchgeführt gemeldet** |
| Separat verwalteten VideoNewsStudio-Tunnel und GoldenOracle (Web, DB, Tunnel) entfernen | `docker stop` und `docker rm` meldeten die vier explizit bezeichneten Container erfolgreich | **Vom Betreiber als durchgeführt gemeldet** |
| Zugeordnete Docker-Daten-Volumes entfernen | `docker volume rm` meldete erfolgreich: **2 GoldenOracle-Volumes** (DB und WordPress) und **3 VideoNewsStudio-Volumes** (PostgreSQL und zwei Redis-Volumes) | **5 von 5 angefragten Volumes erfolgreich entfernt** |
| Zugehörige Host-Projektordner löschen | Vorher `du -sh`: **572 MiB** VideoNewsStudio, **80 MiB** GoldenOracle; anschließend `rm -rf` und `rmdir` ohne Fehlermeldung | **Vom Betreiber als durchgeführt gemeldet**, keine Nachprüfung der Pfadexistenz |
| Verbleibende Images, Docker-Netze, gemeinsame Tunnel-/Cloudflare-Service-Einträge und außerhalb liegende Geheimnis-/Konfigurationsdateien | **Nicht geprüft oder belegt entfernt**; das Cloudflare-Compose-Projekt wird auch von anderen Apps genutzt und darf nicht pauschal entfernt werden | **Offen; nur gezielt und nach Zuordnung ändern** |
| Tatsächlich gewonnener Dateisystem-Freiraum und verfügbarer RAM nach Bereinigung | Zweiter Betreiber-Snapshot **19:21:09 UTC**: **+0,92 GiB** freier Speicher, **+282 MiB** verfügbarer RAM, Swap frei **+130 MiB**; **8 weniger aktive Container** | **Erfasst; Speicher weiterhin 94 % voll** |

**Sicherheitsgrenze:** Kein globales `docker system prune`, `docker volume prune` oder gemeinsames `cloudflared`-Compose-Down als Teil dieser Aufgabe. Die aktuelle Bereinigung stammt ausschließlich aus vom Betreiber im Chat geteilten Terminalresultaten; **dieses GitHub-Tool hat keinen Zugriff auf den Host**.

**Die Nachmessung am 2026-11-17T19:21:09Z liegt vor.** Die vom Betreiber ausgeführten Docker-Abfragen ergaben **keine verbleibenden Container oder Volumes mit den entfernten Projektpräfixen**. Andere Anwendungen dürfen nicht von pauschalen Bereinigungen betroffen sein.

### Sicheres Erfassungsskript

[`scripts/audit-vps.sh`](../../scripts/audit-vps.sh) ist **read-only** und soll **auf dem tatsächlichen Linux-VPS** durch eine berechtigte Betreiberperson nach Prüfung des Skriptinhalts ausgeführt werden. Es erfasst nur grobe Systemressourcen und ausgewählte Dienste. Es installiert nichts, benötigt kein `sudo`, ändert keine Konfiguration, führt **keinen** Schreib-/CPU-Stresstest und **keinen** Internet-Speedtest aus.

**Beispiel von der Repository-Wurzel auf dem VPS:**

```bash
bash scripts/audit-vps.sh > vps-audit-output.txt

# Wenn das spätere Renderverzeichnis bereits existiert und auf einem
# getrennten Dateisystem liegt, optional dessen Kapazität erfassen:
bash scripts/audit-vps.sh /vorhandenes/renderverzeichnis > vps-render-disk-output.txt
```

**Vor dem Teilen:** Ausgabe lokal durchlesen, ggf. kürzen/anonymisieren; **nicht direkt als ungeprüften Anhang ins öffentliche GitHub committen**. Das Skript selbst darf nicht eigenmächtig über SSH oder durch GitHub Actions auf fremden Hosts ausgeführt werden. **GitHub Actions prüft nur die Syntax und Dokumentation, niemals die reale VPS-Leistung.**

### Was das Skript ausdrücklich NICHT messen kann

- Vertragsgarantierte **SSD-/NVMe-Qualität**, CPU-Steal-/Shared-vCPU-Zusage und monatliches **Traffic-/Bandwidth-Limit**: Providerportal/Vertrag.
- **Realen Netzwerk-Durchsatz**: nur mit bewusst genehmigtem externem Test oder Provider-Monitoring.
- **Disk-I/O-Leistung unter Renderlast**: separat später in Aufgabe **013** messen; aktuelle I/O-Stall-Werte sind nur ein **Baseline-Indikator**, keine IOPS-Garantie.
- **Konkurrierende Produktionslast** oder Peaks aus einem einzelnen Zeitpunkt: Betreiber-/Monitoringdaten erforderlich.
- **Realistische 1080p-Rendergeschwindigkeit/Spitzen-RAM**: ebenfalls **013**, kein Ergebnis dieser Tabelle.

## 3. Ressourcenbudget und Reserve (vorerst unbestimmt)

**Jüngster Snapshot nach Bereinigung (19:21:09 UTC):** 4 verfügbare logische CPUs, 7964 MiB RAM gesamt / **2691 MiB verfügbar**, ext4 115,20 GiB / **7,94 GiB frei bei 94 % Auslastung**, **43 aktive Container**. **Noch kein verlässlich zuordenbares Ressourcenbudget.**

**Regel:** Reserven für bereits laufende Systeme/OS und temporäre Medien werden **vor** der Renderer-Kapazität abgezogen. Erst auf Basis realer Zahlen dürfen ein zulässiger Renderjob, Parallelität oder ein Render-Go/No-Go vorgeschlagen werden. **Es gibt noch keine freigegebenen MB-, CPU- oder SSD-Zuteilungen.**

| Dimension | Tatsächlich nutzbare VPS-Ressource (nach Limits) | Bestehender Betrieb / OS-Puffer | Reserviert Web/API | Reserviert PostgreSQL/DB | Render-Worker + temporäre Medien | Freie Reserve | Bewertung |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **vCPU / CPU-Zeit** | **4 derzeit für Prozess verfügbar; Tarif-/Quotenlimit OFFEN** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: keine CPU-Basiswerte** |
| **RAM / MiB** | **7964 MiB gesamt, 2691 MiB im jüngsten Snapshot verfügbar; effektive Limits OFFEN** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: keine RAM-/Peak-Werte** |
| **SSD / GiB (dauerhaft)** | **115,20 GiB gesamt, 7,94 GiB frei; Medium nicht bestätigt** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: keine SSD-Freiraum-/Wachstumsdaten** |
| **Render-Scratch / GiB (temporär)** | **OFFEN – Root-Dateisystem nur 7,94 GiB frei** | OFFEN | n/a | n/a | OFFEN | OFFEN | **BLOCKED: Temp-Verzeichnis/Spitzen noch unbekannt** |
| **I/O / IOPS + Latenz** | **OFFEN** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: keine Lastbaseline** |
| **Netzwerk / Gbit oder Mbit/s** | **OFFEN** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: kein Tarif/kein Throughput-Nachweis** |
| **Monatlicher Transfer / GiB** | **OFFEN** | OFFEN | OFFEN | n/a | Medienstreaming OFFEN | OFFEN | **BLOCKED: Providerlimit und Zieltraffic fehlen** |

**Budgetprüfung (erst mit Messwerten):**

- `nutzbare_CPU` = das **strengere** Limit aus zugewiesenen vCPU und ggf. wirksamer Cgroup-Quote. `OS/Bestandsdienste + Web + DB + Render + freier Puffer` dürfen die vertretbare Dauerlast nicht überschreiten. Welche **CPU-Budgets** sicher sind, ist **noch nicht entschieden**.
- `nutzbarer_RAM` = kleinster plausibler Host-/Cgroup-RAM-Rahmen, abzüglich bereits belegtem RAM und OS-/Cache-Reserve. **RAM-Budget für einen Renderjob** muss später nach Spitzen-RAM aus Aufgabe 013 festgelegt werden; `MemAvailable` im Leerlauf ist keine garantierte Renderreserve.
- `nutzbarer_SSD_Freiraum` = verfügbarer Platz auf **dem tatsächlichen Render-/DB-Dateisystem**, abzüglich OS/Logs, Web, DB inklusive Backup/WAL, vorhandenen Medien, Render-Artefakten und explizitem Sicherheitspuffer. Bei getrennten Dateisystemen **jede Belegung getrennt** berechnen, nicht freien Speicher über Laufwerke hinweg addieren.
- **I/O und Bandbreite** sind eigenständige Engpässe. Selbst bei ausreichender CPU/RAM darf Renderbetrieb bestehende DB/Web-Last nicht verdrängen.
- **Parallelität** bis zum realen VPS-Render-Spike: **nicht freigegeben/noch nicht festgelegt**, keine als tatsächlich tragfähig behaupteten gleichzeitigen 1080p-Jobs.

## 4. Entscheidungspunkte (echte Daten fehlen noch)

| Frage | Stand |
| --- | --- |
| Welche Linux-/Docker-Version und welche CPU-/RAM-/SSD-Grenzen hat das tatsächliche System? | **OFFEN** |
| Welche Web-, DB- und anderen Produktionsdienste laufen schon? | **OFFEN** |
| Gibt es genügend dauerhaft freie SSD-Kapazität samt Render-Scratch, DB-Wachstum und Backup-Reserve? | **OFFEN** |
| Gibt es einen niedrigen I/O- und RAM-Basisverbrauch auch zu üblichen Spitzenzeiten? | **OFFEN** |
| Welche **Traffic- und Netzwerkgrenzen** gelten für die öffentliche Videothek? | **OFFEN** |
| Welche Kapazität bleibt **nach** reserviertem Betrieb, Web, DB und Scratch für einen Renderworker? | **OFFEN – Grundlage für Task 013** |
| Wie groß darf die Renderparallelität sein? | **NICHT in 012 freigeben; nach Task 013 entscheiden** |

## 5. Abnahme 012 und Übergabe an 013

- [x] Roadmap-Vorgaben 012 vollständig in Messliste und Ressourcenbudget überführt.
- [x] Ein **nichtinvasives, read-only** Inventur-Skript mit Datenschutz-Hinweisen vorbereitet.
- [x] **Shell-Syntax und Inventurvorlage einschließlich der zwei gemessenen VPS-Snapshots mit 28/28 statischen Prüfungen bestanden** ([GitHub Actions Run #44158710858](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44158710858)); **GitHub Actions hat keinen VPS kontaktiert oder unter Renderlast getestet**. [Draft PR #28](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/28) dokumentiert den Zwischenstand.
- [x] **Erster vom VPS-Betreiber übermittelter Messlauf** mit UTC-Zeitpunkt (17.11.2026, 18:40:28Z) dokumentiert; unabhängiger Direktzugriff/Vertragsabgleich nicht verfügbar.
- [x] **Nachmessung nach VideoNewsStudio-/GoldenOracle-Löschung am 17.11.2026 19:21:09Z dokumentiert**; keine zugehörigen Container-/Volume-Präfixe mehr sichtbar.
- [ ] **Provider-Vertragsdaten, SSD-Typ, Busy-Hour-/I/O-/Netzlast und Render-Scratch-Kapazität** nachweisen sowie gegebenenfalls selektive Docker-Image-/Cache-Bereinigung prüfen.
- [ ] **CPU/RAM/Dateisystem/OS/Docker/Containerzahl und I/O-Basiswerte im ersten Snapshot erfasst**, aber **SSD-Typ, tatsächliche I/O-/Netzbandbreite, Provider-Tarif, laufende Dienste-Lastspitzen und Ressourcenlimits** noch unvollständig.
- [ ] **Ressourcen für Web, DB, Renderer plus OS-/Betriebspuffer** anhand dieser Zahlen nachvollziehbar zugeteilt.
- [ ] **Nutzer hat die ausgefüllte 012-Inventur und das Budget ausdrücklich freigegeben.**
- [ ] Erst dann PR mergen, Issue #27 schließen und die reale 1080p/H.264-Render-Erprobung in **013** starten.

**Status: BLOCKED trotz erfolgter Nachmessung: 94 % Festplattenbelegung. Eine gezielte, anderen Projekten nicht schadende Speicherbereinigung, Providergrenzen und ein nachweisbares OS/Web/DB/Renderer-Budget fehlen weiterhin.** Der Entwurf darf nicht als bestandenes M01-Architektur- oder Render-Go/No-Go-Gate missverstanden werden. Das **Monatskosten-/API-Freigabebudget** ist eine separate Entscheidung in **016**, kein Bestandteil dieser Hardware-Kapazitätsaufnahme.

### Betreiber-Update: Drei VNS-Docker-Netzwerke entfernt (17.11.2026)
- Vor der Löschung bestätigte der Betreiber für `videonews-studio_backend`, `videonews-studio_feed_egress` und `videonews-studio_frontend` jeweils **0 verbundene Container**.
- `docker network rm` gab alle drei Netzwerknamen als erfolgreich entfernt zurück. Anschließende Kontrolle mittels `docker network ls` mit Filter auf `videonews|goldenoracle`: **keine passenden Netzwerke**.
- `df -h /` zeigt danach `116G` gesamt, `107G` belegt, **`8.5G` frei, `93%` ausgelastet** (gerundete Momentaufnahme; kein kausaler Nachweis einer Speicheränderung durch die Netzwerklöschung).
- **Offen:** dedizierte VideoNewsStudio-Konfigurationsreste erst lesend zuordnen; gemeinsame Cloudflare- und andere Projektkonfigurationen schützen. Danach erneute Messung, nichtinvasive Analyse des Speicherverbrauchs, Provider- und Lastdaten, echtes OS/Web/DB/Renderer-Budget und explizite Nutzerabnahme. **PR #28 bleibt Draft, Issue #27 offen; kein Render-Go.**

### Betreiber-Update: Weitere vier Projektpfade gefunden (17.11.2026)
- Eine read-only Suche im Betreiber-Home (`find ... -maxdepth 5`) meldete **drei Verzeichnisse**: `.config/videonews-studio`, `videonews-pilot-481`, `videonews-previews`; zudem **eine Datei**: `tools/cloudflared/config/config-goldenoracle.yml`.
- Dies ist **keine vollständige VPS-weite Inventur** und belegt noch nicht die Größe, Nutzung oder Löschbarkeit der Pfade. Die Cloudflare-Datei könnte durch die gemeinsam betriebene Tunnel-Konfiguration referenziert sein; **keine Inhalte/Secrets veröffentlicht**.
- **Nächste Betreiberprüfung read-only:** Größen/Typen, Docker-Bind-Mounts und Konfigurationsreferenzen kontrollieren. Bis dahin nichts davon löschen; andere Cloudflare-Tunnel/Projekte erhalten. PR #28 bleibt Draft; Issue #27 offen.

### Betreiber-Update: Größe verbliebener Projektpfade und YAML-Referenzsuche (17.11.2026)
- Auf dem VPS gemeldete Größen mit `stat`/`du -sh`: `$HOME/.config/videonews-studio` **16K** (Verzeichnis), `$HOME/videonews-pilot-481` **550M** (Verzeichnis), `$HOME/videonews-previews` **27M** (Verzeichnis), `$HOME/tools/cloudflared/config/config-goldenoracle.yml` **4.0K** (Datei). Zusammen grob **577 MiB** VNS-Verzeichnisse, ohne gesicherte tatsächliche Freisetzung.
- `grep -RIlF --include='*.yml' --include='*.yaml' 'config-goldenoracle.yml' $HOME/tools/cloudflared` meldete **keine direkten Dateireferenzen**. Diese begrenzte Suche ist **kein Beweis für Nichtnutzung** (Container-Mounts, andere Dateitypen und Laufzeitkonfigurationen noch ungeprüft).
- **Nächster Schritt:** read-only Prüfung aktiver Docker-/Prozess-Verwendung; keine Verzeichnisse oder Konfigurationsdateien voreilig entfernen. Geteilte Cloudflare-Konfiguration und andere Projekte schützen. PR #28 bleibt Draft, Issue #27 offen.

### Betreiber-Update: Alle vier Restpfade ohne Docker-Mount oder Cloudflare-Referenz (17.11.2026)
- Betreiber hat **alle vorhandenen Docker-Container** mit `docker ps -aq` gesammelt und deren Mount-Quellen per `docker inspect` mit den vier bekannten Pfaden abgeglichen. Jeweils **0 potenzielle Docker-Mount-Referenzen** für `.config/videonews-studio`, `videonews-pilot-481`, `videonews-previews`, `tools/cloudflared/config/config-goldenoracle.yml`.
- Rekursive **Dateinamen-/Treffersuche ohne Inhaltsausgabe** innerhalb von `$HOME/tools/cloudflared` (ohne `config-goldenoracle.yml` selbst) auf `goldenoracle|videonews`: **keine weiteren Referenzen**. Vorherige direkte YAML-Referenzsuche ebenfalls ohne Treffer.
- **Grenze:** Keine vollständige Prüfung von Prozessen außerhalb Docker oder Verweisen außerhalb des geprüften Verzeichnisbaums. Die Ergebnisse erlauben eine gezielte, vom Nutzer zuvor freigegebene Bereinigung der bekannten Restpfade mit anschließender Kontrolle; tatsächliche Löschung ist **noch nicht durch Terminalausgabe belegt**.
- Festplatte zuletzt nach Netzwerklöschung `df -h /`: **8.5G frei, 93% ausgelastet** (gerundet). Noch kein Kapazitäts- oder Render-Go; PR #28 bleibt Draft und Issue #27 offen.

### Betreiber-Update: Vier Restpfade entfernt und Speicher nachgemessen (17.11.2026)
- Betreiber führte die vorher autorisierte gezielte Entfernung mit `rm -r` für `$HOME/.config/videonews-studio`, `$HOME/videonews-pilot-481`, `$HOME/videonews-previews` sowie `rm` für `$HOME/tools/cloudflared/config/config-goldenoracle.yml` **ohne angezeigte Fehler** aus. Keine anderen Dateien, Tunnel oder Projekte gezielt gelöscht.
- **Zwei anschließende Prüfungen:** `find "$HOME" -maxdepth 5` mit Namensfilter auf `*videonews*` / `*goldenoracle*` ergab **keine Treffer**. Diese Suche ist auf Home-Verzeichnis und Suchtiefe begrenzt, nicht VPS-weit.
- `df -h /` danach zweimal identisch: **116G gesamt, 107G belegt, 9.1G frei, 93 % belegt**. Verglichen mit unmittelbar zuvor **8.5G frei** ist dies **~0.6G mehr freier Speicher, gerundet**, keine bytegenaue Kausal-/Differenzmessung.
- **Noch offen:** Datenträger mit 93 % weiterhin kritisch; Zuordnung sicherer weiterer Bereinigung, Providerlimits (SSD/Traffic/Netz), I/O-/Busy-Hour-Baseline, Web/DB/Renderer-Ressourcenbudget, explizite Nutzerfreigabe. **Kein globales Docker-Prune, kein Render-Spike, PR #28 bleibt Draft, Issue #27 offen.**

### Betreiber-Update: Docker- und Home-Verbrauch nach gezielter Bereinigung (17.11.2026)
- Neuer Betreiber-Check `docker system df`: **688 Images / 30 aktiv**, `65.75GB` davon `40.61GB` als reclaimable gemeldet; **55 Container / 43 aktiv**, `901.9MB` (reclaimable `372.3MB`); **7 Volumes / 4 aktiv**, `541.8MB` (reclaimable `53.12MB`); **1892 Build-Cache-Einträge**, `53.96GB` (Docker system df: `11.67GB` reclaimable). `docker buildx du` zeigt `Shared 42.29GB`, `Private 11.67GB`, `Reclaimable 53.96GB`. **Werte wegen Layer-Sharing und abweichender Kategorien nicht summieren; kein allgemeines Prune autorisiert.**
- `du -xhd1 $HOME`: Home gesamt `9.6G`, `$HOME/.vscode-server` `4.1G`, `$HOME/www` `3.3G`, `$HOME/.local` `1.5G`, `$HOME/.cache` `517M`, `$HOME/.npm` `148M`. Aktive Projekte und VS-Code-Verbindung schützen.
- Weitere mutmaßliche VideoNewsStudio-Restordner ohne ausgeschriebenen Projektnamen: `$HOME/vns-p3-18-private-candidates` `157M`, `$HOME/vns-offline-previews` `1.9M`. **Noch nicht auf Zuordnung, Mounts, Prozesse oder Löschbarkeit geprüft; nicht als bereits entfernt darstellen.**
- Letzte bestätigte Root-`df -h /`-Messung nach gezielter Restdateibereinigung: **9.1G frei / 93 % belegt**. Der erneute `df -h /`-Aufruf am Ende der letzten Betreiber-Ausgabe war abgeschnitten, daher **kein neuerer Wert behauptet**.
- **Nächste Schritte read-only:** VNS-Verzeichnisse und Mounts/Prozessbezüge prüfen, Platzfresser in `.vscode-server`, `.local`, `.cache` grob zuordnen und Cache-/Image-Rollback-Bedarf der anderen Projekte klären; keine globale Docker-Bereinigung. Task 012 / PR #28 bleiben ungeprüft und offen bis Ressourcenbudget, Providerdaten und Nutzerabnahme.

### Betreiber-Snapshot nach weiterer manueller Bereinigung (18.11.2026, 03:47:45 UTC)

Der Betreiber hat erneut ein **read-only** Audit am Ziel-VPS ausgeführt; Messwerte wurden als Terminalausgabe im Projektchat übermittelt (kein SSH-Zugriff über GitHub).

| Größe | Messwert |
| --- | --- |
| Root-Dateisystem `/dev/vda1` | `116G` gesamt, `106G` genutzt, **`9.3G` verfügbar, `93%` belegt** (`df -h /`; gerundet) |
| Gegenüber letzter Snapshot `9.1G` frei | **rund +0.2G frei**; manuelle Bereinigung nicht detailliert inventarisiert |
| Inodes | **3,310,019 von 15,597,568 = 22 %** verwendet |
| CPU | **4** verfügbare logische CPUs; Load 1/5/15 **0.29 / 0.47 / 0.61** |
| RAM | **7.8 GiB** total, **2.9 GiB verfügbar** zum Zeitpunkt (`free -h`); Swap **2.0 GiB** total, **890 MiB** belegt |
| Docker | **43 laufende / 55 gesamte Container**; **688 Images / 30 aktiv**, `65.75GB` Image-Größe, `40.61GB` Docker-reclaimable |
| Docker-Buildcache | **1892** Einträge, `53.96GB`; `docker system df` meldet `11.67GB` reclaimable, `docker buildx du` meldet Shared `42.29GB`, Private `11.67GB`, Reclaimable `53.96GB`; **nicht addieren oder pauschal prunen** |
| Home | **`9.4G`** gegenüber zuvor `9.6G`; `.vscode-server` `4.1G`, `.local` `1.5G`, `.cache` `517M`, `www` `3.3G` |
| Verbliebene VNS-Pfade | Namenssuche bis Tiefe 5 fand **`.local/share/vns-piper-venv`, `vns-piper-voices`, `vns-visual-assets`**. Größen/Abhängigkeiten noch **nicht geprüft**, keine Löschung belegt |
| Alte Netzwerke | Namensfilter `videonews|goldenoracle`: **keine Treffer** |

**Einordnung:** Inodes unkritisch, Load in dieser Momentaufnahme niedrig, Docker-Mengen unverändert. **Root weiterhin 93 % voll**; Render-Scratch und Web/DB/Renderer-Reserve **nicht freigegeben**. Nächste sichere Betreiberaktion: die drei VNS-Verzeichnisse per `du` auf Größen und per Docker-Mount-/Prozess-Prüfung auf Verwendung kontrollieren; keine globale Prune-Aktion. Providerlimits, Busy-Hour-Baseline und Ressourcenbudget offen; PR #28 bleibt DRAFT, Issue #27 offen.

### Betreiberprüfung: Drei verbliebene VNS-Assetverzeichnisse (18.11.2026)
- Drei in `$HOME/.local/share` identifizierte VideoNewsStudio-Restverzeichnisse wurden per `stat` / `du -sh` auf dem VPS nachgemessen: `vns-piper-venv` **202M**, `vns-piper-voices` **61M**, `vns-visual-assets` **13M** (zusammen **276M** gerundet).
- Betreiber hat alle **55 Docker-Container** mit `docker ps -aq` / `docker inspect .Mounts[].Source` geprüft. Der Präfix-Abgleich ergab **jeweils 0 Docker-Mount-Referenzen**.
- **Noch nicht geprüft:** außerhalb von Docker aktive Prozesse/offene Dateien, ggf. indirekte Skriptreferenzen. **Keine Löschung der drei Verzeichnisse nachgewiesen.** Vor der bereits grundsätzlich genehmigten gezielten Entfernung abschließenden Prozesscheck vornehmen. Keine globale Docker-Prune-Aktion, bestehende Projekte schützen.
- Root-Festplatte zuletzt **9.3G frei bei 93 % Belegung** (18.11.2026 03:47 UTC). Ressourcenbudget/Providerdaten weiterhin offen; Issue #27 bleibt offen, PR #28 Draft.

### Betreiberprüfung: VNS-Prozessnutzung nicht erkannt (18.11.2026)
- Betreiber prüfte `/proc/[0-9]*/cwd`, `exe` und `fd/*` per `readlink` auf Dateipfade unter den drei verbleibenden `$HOME/.local/share/vns-*`-Verzeichnissen. Ergebnis **„Keine offenen Prozesspfade erkannt“**.
- `pgrep -af 'vns-|vns_|piper'` lieferte **keine gemeldeten PIDs**. Bereits zuvor: drei Verzeichnisse mit **202M + 61M + 13M = ~276M** und **je 0 Docker-Mount-Referenzen**.
- **Grenzen:** Prüfung ist eine Momentaufnahme und kann mangels Berechtigungen und bei indirekten Referenzen Nutzungen übersehen. **Die Löschung wurde noch NICHT ausgeführt oder bestätigt**. Gemäß früherer Nutzerfreigabe für vollständige VNS-Entfernung sind die drei exakt bekannten Pfade Kandidaten für gezielte Entfernung mit Nachmessung. Andere Services und gemeinsame Docker-Ressourcen bleiben unberührt; kein globales Prune.
- Issue #27 bleibt offen und PR #28 Draft; weiterhin kein sicheres OS/Web/DB/Renderer-Ressourcenbudget.



### Betreiber-Update: VNS-Piper-Reste entfernt, 9.5G frei (18.11.2026)
- Betreiber entfernte pfadspezifisch mit `rm -r` und ohne gemeldete Fehler: `$HOME/.local/share/vns-piper-venv` (zuvor 202M), `vns-piper-voices` (61M), `vns-visual-assets` (13M). Anschließendes `find "$HOME/.local/share" -maxdepth 1 -iname 'vns-*'` fand keine Einträge.
- `df -h /` danach: 116G gesamt, 106G genutzt, **9.5G frei, 92%** genutzt; zuvor 9.3G und 93% (gerundete Werte). **43 Docker-Container** weiterhin aktiv.
- Betreiber hat eine neue, read-only Cache-Inventur und die gezielte Entfernung von `$HOME/backups` und `$HOME/cloudflared-backup` freigegeben; Entfernung **noch nicht belegt**. `$HOME/.kurvenfunk-dev-backups` und laufende Dienste nicht anfassen.
- Kein pauschales Docker-Prune oder Render-Go. PR #28 Draft; Issue #27 offen.

### Betreiber-Update: Backup-Ordner entfernt und Cache-Inventur (18.11.2026)
- Betreiber hat die zwei ausdrücklich freigegebenen Pfade `$HOME/backups` (1.4M) und `$HOME/cloudflared-backup` (16K) mit pfadgebundener Prüfung gelöscht. Ausgabe meldet beide als **nicht mehr vorhanden**; andere Backup-Pfade (insbesondere `$HOME/.kurvenfunk-dev-backups`) nicht angefasst. `df -h /` nachher **9.5G frei, 92 % belegt** (gerundet).
- Read-only Home-/Systemcache-Inventur: `$HOME/.vscode-server` **4.1G** (`cli` **3.9G**), `/var/log` **2.8G** (`journal` **2.4G**), `$HOME/.cache` **517M** (`pnpm` **457M**, `node` **39M**, `prisma` **22M**), `$HOME/.npm` **148M** (`_cacache` 148M), `/var/cache` **330M** (`apt` 288M), `/tmp` **255M** (VNS-Benchmarks **215M** + **11M**), `$HOME/.local` **1.2G** (`share` **1.1G**).
- Docker Buildx default builder running v0.26.2. `docker system df`: 688 Images/30 aktiv, 65.75GB images/40.61GB reclaimable; 1892 Build-Cache-Einträge 53.96GB (11.67GB reclaimable laut system df); `docker buildx du` zeigt Shared 42.29GB, Private 11.67GB, Reclaimable 53.96GB. Diese Zahlen sind **nicht additiv**, keine globalen Prunes.
- Weitere Analyse ausstehend: `journalctl --disk-usage`, VS-Code-Server-Versionen und tatsächliche Nutzung, pnpm/npm/apt Cache-Inhalte und VNS-Temp-Prozessbezüge. Keine Systemlogs/Caches oder Docker-Ressourcen auf Verdacht gelöscht. Task 012 weiterhin nicht abgenommen, PR #28 Draft.

### Betreiber-Update: VS-Code-CLI, pnpm, Journal und VNS-Temp geprüft (18.11.2026)
- Weitere read-only Betreiber-Messung: `$HOME/.vscode-server/cli/servers` **3.9G**, auf sechs `Stable-<SHA>`-Versionen mit Einzelgrößen **629M, 656M, 657M, 658M, 663M, 675M** verteilt; `pgrep -fc 'vscode-server|server-main|code-server'` meldete **2** potenziell passende Prozesse, aber welche Version aktuell verwendet wird ist **nicht belegt**. Keine Version ohne weitere Prüfung löschen.
- `$HOME/.cache/pnpm` **457M** (v11/metadata **360M**, metadata-full **91M**, metadata-full-filtered **6.2M**); `$HOME/.local/share/pnpm/store` **1.0G**. Store kann von anderen Projekten benötigt werden. `/var/cache/apt` **288M** (archives **165M**).
- `/var/log/journal` per voriger `du`-Ausgabe ca. **2.4G**, aber `journalctl --disk-usage` als nichtprivilegierter Benutzer nur **189.3M** mit Berechtigungswarnung; offenbar abweichende Sichtbarkeit, nicht als gleichwertige Gesamtmessungen behandeln. Nichts am Journal gelöscht.
- Unter `/tmp` sind weiterhin `vns-bench10m-PLKAfo86` (zuvor **215M**) und `vns-bench-D2E9nJ0u` (zuvor **11M**) vorhanden. Noch nicht auf Prozesse/Mounts geprüft, bisher **keine Löschung**.
- Letzte bestätigte Root-Auslastung **9.5G frei / 92 %**, Docker 43 aktiv, Cache-Zahlen unverändert. Weitere read-only Nutzungsprüfung vor gezielten Bereinigungen; keine Docker-Prunes und keine Löschung aktiver Serverversionen. Issue #27 offen, PR #28 Draft.

### Betreiber-Prüfung: sechs VS-Code-Server-Versionen und VNS-Benchmarkreste (18.11.2026)
- Sechs VS-Code-CLI-Versionen unter `$HOME/.vscode-server/cli/servers/Stable-*` nachgemessen: `Stable-690471...` 675M (11.11.), `Stable-6bab64...` 657M (06.11.), `Stable-6d62b1...` 629M (17.11.), `Stable-7debcd...` 658M (13.10.), `Stable-c4453...` 663M (06.11.), `Stable-dcd3ad...` 656M (10.11.). Jede per `/proc/[0-9]*/cmdline` und `grep -aFl` ermittelte Prozessargument-Referenzzahl = **1**; wegen möglichem Selbsttreffer des `grep`-Prozesses **kein verlässlicher Nutzungsnachweis**. Noch nichts am VS-Code-Server gelöscht.
- Zwei VNS-Testverzeichnisse in `/tmp`: `vns-bench-D2E9nJ0u` **11M**, `vns-bench10m-PLKAfo86` **215M**, jeweils Referenzzahl **1** im gleichen möglicherweise selbstreferenziellen Grep-Test; bisher **keine nachgewiesene Löschung**. Betreiber bestätigt ausdrücklich: „Vns kann normal immer gelöscht werden, das gehört alles zu VideoNewsStudio.“ Die frühere Freigabe zur vollständigen gezielten VNS-Entfernung ist erneuert; konkrete Entfernung dieser zwei Pfade wird dem Betreiber zur Ausführung angeboten.
- Letzter bestätigter Speicherstand weiterhin `df -h /`: **9.5G frei, 92 % belegt**. Nach VNS-Temp-Entfernung erneut prüfen. Kein globales Docker-Prune, kein Mergen von Draft PR #28, Issue #27 offen.

### Betreiber-Update: VNS-Benchmarkreste entfernt, Docker-Neuaufbau nur als Vorschlag (18.11.2026)
- Betreiber bestätigte gezielte Löschung der zwei VNS-Testordner in `/tmp`: `vns-bench-D2E9nJ0u` (zuvor 11M) und `vns-bench10m-PLKAfo86` (215M); anschließender Namensfilter in `/tmp` ergab keine `vns-*`-Treffer. `df -h /`: **116G gesamt, 106G belegt, 9.7G frei, 92 % belegt**; rund +0.2G gegenüber der vorigen gerundeten Messung.
- Betreiber erwägt einen umfassenden Docker-Clean-Rebuild: AP Pixels PROD/DEV schützen, übrige Dienste ggf. neu bauen. **Dies ist noch kein autorisierter globaler Löschplan und nicht umgesetzt.** Vor Eingriffen müssen Container, Stacks, persistente Daten, Compose-Konfigurationen, Cloudflare-Tunnel und Wiederherstellbarkeit geprüft werden. Keine Volume-/Netz-/System-Prune-Aktion ohne konkreten Umfang und überprüfte Backups.
- Task 012 weiterhin offen, PR #28 Draft, kein Ressourcenbudget und kein Render-Go.

### Betreiber-Update: Docker-Projektinventur und datenbewahrender Clean-Rebuild-Vorschlag (18.11.2026)
- Betreiber meldet mit `docker ps -a` **55 Container insgesamt / 43 aktiv**, gruppiert nach Compose-Labels: `kurvenfunk-dev` 11, `kurvenfunk-staging` 9, `kurvenfunk-prod` 8, ohne Compose-Projekt 8, `kurvenfunk` 5, `footballstudio` 4, `ap-pixels-dev` 3, `cloudflared` 2, `ap-pixels` 2, `torio` 1, `lofi-stream01` 1, `cafe-bruen` 1. **7 Docker-Volumes** gemeldet.
- Docker-Image-Statistik unverändert: 688 Images (30 aktiv), 65.75GB; Docker-Build-Cache 1892 Einträge / 53.96GB. Root-FS nach gezielter VNS-Temp-Entfernung **9.7G frei, 92 % belegt**, 43 Container weiter aktiv.
- Betreiber erwägt vollständigen Docker-Clean-Rebuild bei **Erhalt der Datenbanken** und AP Pixels PROD/DEV. **Nicht pauschal löschen:** Datenbanken können Docker-Volumes oder Host-Bind-Mounts nutzen; zusätzlich persistente Uploads/Medien, App-Konfigurationsdateien, Secrets, Cloudflare-Tunnel, Compose-Dateien und benötigte Images/Buildquellen berücksichtigen. **Noch kein globaler Stopp, keine Löschung und kein Rebuild bestätigt oder freigegeben.**
- Nächster Schritt: read-only Inventur nach Container/Service/Image und Mount-Zielen, danach Sicherungs- und Wiederherstellbarkeitsplan, separater expliziter Löschumfang. Task 012 / PR #28 weiterhin offen bzw. Draft; keine Kapazitätsabnahme.

### Betreiber-Inventur: Dienste und Datenträger vor möglichem Docker-Rebuild (18.11.2026)
- Betreiber meldete `docker ps -a` mit 55 Containern / 43 aktiv. Projektverteilung: kurvenfunk-dev (11), kurvenfunk-staging (9), kurvenfunk-prod (8), ohne Compose-Projekt (8), kurvenfunk (5), footballstudio (4), ap-pixels-dev (3), cloudflared (2), ap-pixels (2), torio (1), lofi-stream01 (1), cafe-bruen (1). Unter den acht unlabeled Containern sechs gestoppte VNS-Testcontainer sowie zwei andere gestoppte Container.
- Erfasste persistente **Mount-Ziele**, ohne private Host-Quellpfade oder Secret-Dateinamen: AP Pixels PROD/DEV WordPress unter `/var/www/html` (Bind-Mount), MariaDB unter `/var/lib/mysql` (benannte Volumes), FootballStudio PostgreSQL unter `/var/lib/postgresql/data` (Volume), Kurvenfunk PostgreSQL (sowohl Volume als auch Bind-Mounts je Umgebung), Redis `/data` (Bind-Mount), Meilisearch `/meili_data` (Bind-Mount), MinIO `/data` (Bind-Mount), DEV-Mailpit `/data` (Bind-Mount), Keycloak DEV Theme als Bind-Mount. Gestoppte VNS-Testcontainer hatten Host-Bind-Mounts u.a. für Daten und sensible Laufzeitdateien (deren Pfade/Inhalte bewusst nicht dokumentiert).
- Sieben Docker-Volumes gemeldet; zwei MariaDB-Volumes von AP Pixels, ein PostgreSQL-Volume von FootballStudio, ein anonymes/Hash-Volume von Kurvenfunk und weitere zunächst nicht eindeutig zugeordnete Volumes. **Keine Volumes gelöscht, kein globales Stoppen oder Docker-Prune ausgeführt.**
- Betreiber wünscht Datenbanken zu erhalten und sonst weitreichend bereinigen/neu aufbauen. **Datenbankerhalt reicht nicht:** WordPress-Uploads/Plugins, MinIO-Objektdaten, Meilisearch-Indizes, Redis-Persistenz, Keycloak-Konfiguration/Themes, Tunnelkonfiguration, Secrets und Compose-Rebuild-Quellen müssen einzeln nach Wiederherstellbarkeit bewertet und ggf. gesichert werden. Host-Quellpfade nicht öffentlich committen.
- Root `df -h /` zuletzt **9.7G frei / 92 % Belegung**. Bevor destruktive Schritte erfolgen, lokalen read-only Mount-/Datenbesitz-/Backup-Audit durchführen, Auswirkungen und dauerhafte Ziel-Apps definieren. Task 012 bleibt offen; PR #28 Draft.

### Betreiber-Snapshot nach manueller Bereinigung (18.11.2026, 23:02:53 UTC)
- Neues read-only Betreiber-Audit: `/dev/vda1` **116G Gesamtgröße, 105G genutzt, 11G verfügbar, 91 % belegt** (`df -h /`; gerundet). Gegenüber 9.7G freiem Speicher und 92 % vorher ungefähr **+1.3G verfügbar**, genaue Byte-Differenz nicht gemessen. Inodes **3,261,130 / 15,597,568** genutzt (**21 %**).
- CPU **4** verfügbar, Load 1/5/15 = **0.64 / 0.70 / 0.68**, RAM **7.8 GiB total, 3.0 GiB available**, Swap **997 MiB used / 2.0 GiB total**.
- Docker weiterhin **43 aktiv / 55 insgesamt**; unveränderte Projektverteilung, **688 Images / 30 aktiv**, **65.75GB** Images (40.61GB Docker-reclaimable); Buildcache **1892 Einträge / 53.96GB** (11.67GB reclaimable laut `docker system df`, 53.96GB reclaimable laut `buildx du` bei 42.29GB Shared/11.67GB Private). **Nicht addieren; kein globales Prune**.
- AP Pixels PROD und DEV: WordPress-/DB-Container jeweils **running**, Root-Mounts für WordPress und DB-Volume gemeldet. Kurvenfunk-/FootballStudio-PostgreSQL-Container laut Statusprüfung up/healthy. Abschnitt mit DB-Namensfilter erfasst `ap_pixels_db` nicht, dieser wurde separat als running bestätigt. Datenvollständigkeit/Backup-Wiederherstellbarkeit **nicht verifiziert**.
- Home **8.1G**, VS-Code-Server **4.7G** (zuvor 4.1G), `/var/cache` **329M**, `/var/log` **2.8G**, `/tmp` **29M**. Keine `videonews`/`goldenoracle`/`vns-*` Treffer in begrenzter Home-Namenssuche oder `/tmp`; **sechs gestoppte VNS-Testcontainer** weiterhin sichtbar. Alte VNS-Netze nicht gefunden.
- Noch **kein Docker-Rebuild** und keine neuen Docker-Löschungen belegt. Als nächstes sicherer, auf explizit benannte gestoppte VNS-Container begrenzter Aufräumschritt und getrennte Prüfung von VS-Code-Servern und Buildcache; Datenbanken, andere Volumes, Tunnel und Projekte erhalten. Providerdaten, Busy-hour-Baseline und Web/DB/Renderer-Budget offen; PR #28 Draft, Issue #27 offen.

### Betreiber-Update: Docker-Cache-Speicherort und manuelle Bereinigung (18.11.2026, 23:07 UTC)
- Nach einer weiteren manuellen Home-Bereinigung meldet der Betreiber `df -h /`: **116G total, 100G used, 16G available, 87 % genutzt**. `du -xhd1 $HOME` **3.4G**, zuvor 8.1G. Docker-Statistik unverändert (43/55 Container, 688 Images, 1892 Cache-Einträge). Sechs VNS-Testcontainer sind weiterhin sichtbar, keine neue Docker-Löschung belegt.
- Docker Data Root `docker info --format '{{.DockerRootDir}}'`: `/var/lib/docker`. Betreiber maß unter `/var/lib/docker/buildkit` **601M**. Die folgende umfangreiche `du`-Ermittlung wurde mit Ctrl+C abgebrochen, daher **keine verlässliche Overlay2-/Containerd-Verzeichnisgröße gemessen**.
- `docker buildx du`: **53.96GB Total**, davon **42.29GB Shared** und **11.67GB Private**; `Reclaimable` Buildx-seitig 53.96GB. Diese logischen Layer-/Cache-Werte sind nicht mit der Dateiverzeichnisgröße 601M gleichzusetzen und nicht additiv. **Keine manuelle Löschung in DockerRootDir, kein Prune**. Nächster Schritt ist read-only Prüfung des Docker-Storage-Backends und der Cache-Metadaten, bevor ein gezielter Cache-Prune in Betracht kommt.
- Der VPS hat weiterhin nur einen unbewiesenen Kapazitätspuffer für einen Renderer; Task 012 nicht abgenommen, PR #28 Draft.

### Betreiber-Nachweis: gezielte VNS-Container- und Docker-Cache/Image-Bereinigung (November 2026)
- Betreiber führte die zuvor im Chat bereitgestellte Bereinigung aus: sechs eindeutig benannte, zuvor gestoppte VNS-Testcontainer entfernt; danach `docker buildx prune --all --force` und `docker image prune --all --force`. Der Betreiber übermittelte den **Nachher**-Abschnitt des Scripts als Terminalausgabe. Es fand **kein globaler Volume-Prune** statt.
- `df -h /` nachher: **116G gesamt, 27G verwendet, 89G verfügbar, 24 % belegt**. Gegenüber der letzten Messung mit **16G frei / 87 % belegt** ergibt dies **ca. +73G freien Speicher** (gerundete `df -h`-Angaben; nicht als exakter Byte-Wert interpretieren).
- `docker system df` nachher: **28 Images / 28 aktiv, 9.211GB (Docker meldet 100% reclaimable, widersprüchliche Semantik trotz 28 aktiver Images; nicht als Löschfreigabe verstehen)**; **49 Container / 43 aktiv, 901.9MB, 372.3MB reclaimable**; **7 Volumes / 4 aktiv, 541.8MB, 53.12MB reclaimable**; **Build Cache 0/0, 0B**. Image-Anzahl zuvor 688, danach 28 (−660); Container zuvor 55, danach 49 (−6).
- Kontrolle `docker ps -q | wc -l`: **43 laufende Container**; `ap_pixels`, `ap_pixels_db`, `ap-pixels-dev-wordpress-1`, `ap-pixels-dev-db-1` wurden alle mit `docker inspect` als **running** bestätigt. **Kein End-to-End-Funktionstest** der Web-Anwendungen/DB-Daten oder der weiteren Dienste belegt; Sicherungen und Wiederherstellbarkeit weiterhin separat prüfen.
- Die drastische Plattenbereinigung reduziert die frühere SSD-Speicherblockade, beweist aber **kein belastbares CPU/RAM-/I/O-/Busy-Hour-/Provider-/Render-Scratch-Budget** und keinen erfolgreichen Renderer-Benchmark. Erneute System-/Anwendungskontrolle und Budgetberechnung stehen aus. **Issue #27 offen, PR #28 Draft; kein Merge/Abnahme ohne Betreiberfreigabe.**
