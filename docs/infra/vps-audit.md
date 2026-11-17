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

