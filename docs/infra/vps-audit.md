# BlueDotAtlas — VPS-Inventur und Ressourcenbudget (M01 / 012)

**Status: ERSTER VPS-BETREIBER-SNAPSHOT + PROTOKOLLIERTE BEREINIGUNG VORHANDEN; tatsächlicher Freiraum nach Bereinigung, Providerwerte und Ressourcenbudget OFFEN. Aufgabe 012 ist noch NICHT abgenommen.**  
**Roadmap-Ergebnis:** `docs/infra/vps-audit.md` · [Issue #27](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/27) · Branch `infra/012-vps-audit`.  
**Roadmap-Quelle:** `BlueDotAtlas_Roadmap.pdf`, M01, Aufgabe 012, Seite 5: CPU-Kerne, RAM, SSD-Freiraum, I/O, OS, Docker-Version, Netzwerk, Bandbreite, vorhandene Dienste und Ressourcenpuffer dokumentieren. **Abnahme:** Messwerte sowie nutzbare Ressourcen für **Web, DB und Renderer** müssen nachvollziehbar sein. **Vorher: 010** (erfüllt, PRD DEC-026).

## 1. Was wir wissen und was wir noch nicht wissen

**Bereits bekannt (nur Projektvorgabe):** BlueDotAtlas V0.1 soll auf **einem eigenen VPS** betrieben werden; eine öffentliche Videothek, ein geschützter Einzeladmin, eine Datenbank und ein separater Renderworker sind geplant. Die Render-Zielausgabe ist zunächst Full HD 1920×1080/H.264; ein echter VPS-Render-Test ist erst **Aufgabe 013**. Diese Projektvorgaben sind **kein gemessener VPS-Nachweis**.

**Tatsächlich über den VPS bekannt:** Der Betreiber hat am **17.11.2026 um 18:40:28 UTC** die **bereinigte Ausgabe des read-only Skripts vom vorgesehenen Linux-VPS** im Projektchat bereitgestellt. Das sind **vom Betreiber mitgeteilte Host-Snapshot-Werte**, keine von dieser GitHub-Verbindung selbst verifizierten VPS-Metriken und kein Render-Benchmark. Die **gezielte Betreiber-Bereinigung von VideoNewsStudio und GoldenOracle** ist anhand von Terminal-Rückmeldungen protokolliert; der **tatsächliche Gewinn an VPS-Kapazität muss noch nachgemessen werden**. Provider- und Busy-Hour-Angaben stehen aus. GitHub Actions laufen in gehosteten Test-Runnern und dürfen **niemals** als VPS-Messung ausgegeben werden.

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
| Tatsächlich gewonnener SSD-Freiraum und entlasteter RAM nach Bereinigung | **Noch keine zweite Messung**; aus früheren `du`-Werten und gelöschten Volumes lässt sich die reale Ersparnis nicht zuverlässig ableiten | **OFFEN: zwingend nachmessen** |

**Sicherheitsgrenze:** Kein globales `docker system prune`, `docker volume prune` oder gemeinsames `cloudflared`-Compose-Down als Teil dieser Aufgabe. Die aktuelle Bereinigung stammt ausschließlich aus vom Betreiber im Chat geteilten Terminalresultaten; **dieses GitHub-Tool hat keinen Zugriff auf den Host**.

**Für die nächste nachvollziehbare Messung:** Das bereits lokal gespeicherte `audit-vps.sh` erneut **auf dem VPS** ausführen und die Ausgabe vor dem Teilen prüfen. Zusätzlich die verbliebenen Docker-Container/-Volumes nur **auflisten**, nicht pauschal bereinigen. Vergleiche mit dem UTC-Snapshot **2026-11-17T18:40:28Z**: **7,02 GiB** Speicher verfügbar, **2409 MiB RAM verfügbar**, **51 aktive Container**.

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

**Erster Snapshot:** 4 derzeit verfügbare logische CPUs, 7964 MiB RAM gesamt / 2409 MiB verfügbar, 115,20 GiB ext4 gesamt / 7,02 GiB frei, **51 Container**. **Noch kein verwendbares Ressourcenbudget.**

**Regel:** Reserven für bereits laufende Systeme/OS und temporäre Medien werden **vor** der Renderer-Kapazität abgezogen. Erst auf Basis realer Zahlen dürfen ein zulässiger Renderjob, Parallelität oder ein Render-Go/No-Go vorgeschlagen werden. **Es gibt noch keine freigegebenen MB-, CPU- oder SSD-Zuteilungen.**

| Dimension | Tatsächlich nutzbare VPS-Ressource (nach Limits) | Bestehender Betrieb / OS-Puffer | Reserviert Web/API | Reserviert PostgreSQL/DB | Render-Worker + temporäre Medien | Freie Reserve | Bewertung |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **vCPU / CPU-Zeit** | **4 derzeit für Prozess verfügbar; Tarif-/Quotenlimit OFFEN** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: keine CPU-Basiswerte** |
| **RAM / MiB** | **7964 MiB gesamt, 2409 MiB Snapshot verfügbar; effektive Limits OFFEN** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: keine RAM-/Peak-Werte** |
| **SSD / GiB (dauerhaft)** | **115,20 GiB gesamt, 7,02 GiB frei; Medium nicht bestätigt** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: keine SSD-Freiraum-/Wachstumsdaten** |
| **Render-Scratch / GiB (temporär)** | **OFFEN – Root-Dateisystem nur 7,02 GiB frei** | OFFEN | n/a | n/a | OFFEN | OFFEN | **BLOCKED: Temp-Verzeichnis/Spitzen noch unbekannt** |
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
- [x] **Shell-Syntax und Inventurvorlage mit 24/24 statischen Prüfungen bestanden** ([GitHub Actions Run #44144004990](https://github.com/whiteyOnTheMoon/BlueDotAtlas/actions/runs/44144004990)); **kein echter VPS wurde dabei kontaktiert**. [Draft PR #28](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/28) dokumentiert den Zwischenstand.
- [x] **Erster vom VPS-Betreiber übermittelter Messlauf** mit UTC-Zeitpunkt (17.11.2026, 18:40:28Z) dokumentiert; unabhängiger Direktzugriff/Vertragsabgleich nicht verfügbar.
- [ ] **Nachmessung nach gezielter VideoNewsStudio-Deinstallation**, Bestandslast/Bandbreitentrafik, Providervertrag und Render-Scratch-Kapazität nachgewiesen.
- [ ] **CPU/RAM/Dateisystem/OS/Docker/Containerzahl und I/O-Basiswerte im ersten Snapshot erfasst**, aber **SSD-Typ, tatsächliche I/O-/Netzbandbreite, Provider-Tarif, laufende Dienste-Lastspitzen und Ressourcenlimits** noch unvollständig.
- [ ] **Ressourcen für Web, DB, Renderer plus OS-/Betriebspuffer** anhand dieser Zahlen nachvollziehbar zugeteilt.
- [ ] **Nutzer hat die ausgefüllte 012-Inventur und das Budget ausdrücklich freigegeben.**
- [ ] Erst dann PR mergen, Issue #27 schließen und die reale 1080p/H.264-Render-Erprobung in **013** starten.

**Status: BLOCKED bis zur Nachmessung nach der vom Betreiber ausgeführten Bereinigung von VideoNewsStudio und GoldenOracle, Providerdaten und belastbarem Web/DB/Renderer-Budget.** Der Entwurf darf nicht als bestandenes M01-Architektur- oder Render-Go/No-Go-Gate missverstanden werden. Das **Monatskosten-/API-Freigabebudget** ist eine separate Entscheidung in **016**, kein Bestandteil dieser Hardware-Kapazitätsaufnahme.
