# BlueDotAtlas — VPS-Inventur und Ressourcenbudget (M01 / 012)

**Status: ERHEBUNG VORBEREITET – echte VPS-Messwerte fehlen. Aufgabe 012 ist noch NICHT abgenommen.**  
**Roadmap-Ergebnis:** `docs/infra/vps-audit.md` · [Issue #27](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/27) · Branch `infra/012-vps-audit`.  
**Roadmap-Quelle:** `BlueDotAtlas_Roadmap.pdf`, M01, Aufgabe 012, Seite 5: CPU-Kerne, RAM, SSD-Freiraum, I/O, OS, Docker-Version, Netzwerk, Bandbreite, vorhandene Dienste und Ressourcenpuffer dokumentieren. **Abnahme:** Messwerte sowie nutzbare Ressourcen für **Web, DB und Renderer** müssen nachvollziehbar sein. **Vorher: 010** (erfüllt, PRD DEC-026).

## 1. Was wir wissen und was wir noch nicht wissen

**Bereits bekannt (nur Projektvorgabe):** BlueDotAtlas V0.1 soll auf **einem eigenen VPS** betrieben werden; eine öffentliche Videothek, ein geschützter Einzeladmin, eine Datenbank und ein separater Renderworker sind geplant. Die Render-Zielausgabe ist zunächst Full HD 1920×1080/H.264; ein echter VPS-Render-Test ist erst **Aufgabe 013**. Diese Projektvorgaben sind **kein gemessener VPS-Nachweis**.

**Tatsächlich über den VPS bekannt:** **Bisher keine Messdaten oder autorisierten SSH-/Monitoring-Zugänge verfügbar.** GitHub Actions laufen in gehosteten Test-Runnern, **nicht** nachweislich auf dem Produktions-VPS. Die Ausstattung dieses Runners darf **niemals als VPS-Inventur** ausgegeben werden.

## 2. Echte Ist-Messwerte (vor Abnahme ausfüllen)

Alle Werte gehören zum **tatsächlichen Ziel-VPS**, nicht zum eigenen Laptop/Cloud-Runner. Die öffentliche Repository-Dokumentation verwendet nur die für Kapazitätsplanung erforderlichen **bereinigten Aggregatwerte**, **keine IPs, Hostnamen, Usernamen, Schlüssel, Tokens, private Ports, Container-/Kundennamen oder Umgebungsvariablen**.

| Merkmal (Roadmap 012) | Ist-Wert | Messmethode / Nachweis | Relevanz |
| --- | --- | --- | --- |
| Messzeitpunkt UTC und VPS-Tarif/Provider (Tarifbezeichnung optional anonymisiert) | **NICHT ERHOBEN** | Ausgabe von `scripts/audit-vps.sh` + Provider-Vertragsdaten | Kontext / Nachprüfbarkeit |
| OS + Kernel, Architektur | **NICHT ERHOBEN** | `/etc/os-release`, `uname` | Laufzeitkompatibilität |
| CPU: verfügbare vCPU/logische CPUs, ggf. Cgroup-Quota und CPU-Typ | **NICHT ERHOBEN** | `nproc`, `lscpu`, `cpu.max`, Providervertrag | Web/DB/Render-Verteilung |
| RAM gesamt und verfügbar, Swap, ggf. Memory-Limit | **NICHT ERHOBEN** | `/proc/meminfo`, `memory.max` | Vermeidung von OOM / Swap-Spitzen |
| SSD-Typ und Gesamt- / belegter / freier Speicher | **NICHT ERHOBEN** | `df`, `lsblk` plus SSD-Nachweis vom Provider | OS, DB, Render-Scratch, MP4s |
| Speicherort/-filesystem für temporäre Renderdateien | **NICHT ERHOBEN** | `df` am vorgesehenen Renderverzeichnis; ohne Pfadoffenlegung | Platz und I/O-Konkurrenz |
| I/O: Basislast, Stalls, verfügbare Durchsatz-/IOPS-/Latenzdaten | **NICHT ERHOBEN** | `/proc/pressure/io`; ggf. `iostat`/Provider-Metriken bei ausdrücklicher Zustimmung | Renderer und DB dürfen einander nicht blockieren |
| Docker CLI + Engine Version, Zugriffsstatus | **NICHT ERHOBEN** | `docker --version`, `docker version` | spätere Laufzeit |
| Vorhandene Dienste und Docker-Auslastung | **NICHT ERHOBEN** | gekürzte Whitelist aus `systemctl`, Anzahl laufender Container; Betreiber prüft weitere Dienste | Reserven für bereits belegte Kapazität |
| Netzwerk: Schnittstellen, Nutzung, realer Durchsatz/Latenz | **NICHT ERHOBEN** | aggregierte RX/TX-Zähler plus später ggf. ausdrücklich genehmigter Bandbreitentest | Medien-Downloads/Player/API |
| Bandbreite/Traffic-Paket: Provider-Limit und egress/Monat | **NICHT ERHOBEN** | **Providerportal/Vertrag**, keine belastbare Aussage durch lokale RX/TX-Zähler | Video-Hosting-/Traffic-Budget |
| Betriebslast zu Hauptnutzungszeiten | **NICHT ERHOBEN** | zumindest zweiter Zeitpunkt und vorhandenes Provider-Monitoring | Einzel-Snapshot ist nicht zuverlässig |

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

**Regel:** Reserven für bereits laufende Systeme/OS und temporäre Medien werden **vor** der Renderer-Kapazität abgezogen. Erst auf Basis realer Zahlen dürfen ein zulässiger Renderjob, Parallelität oder ein Render-Go/No-Go vorgeschlagen werden. **Es gibt noch keine freigegebenen MB-, CPU- oder SSD-Zuteilungen.**

| Dimension | Tatsächlich nutzbare VPS-Ressource (nach Limits) | Bestehender Betrieb / OS-Puffer | Reserviert Web/API | Reserviert PostgreSQL/DB | Render-Worker + temporäre Medien | Freie Reserve | Bewertung |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **vCPU / CPU-Zeit** | **OFFEN** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: keine CPU-Basiswerte** |
| **RAM / MiB** | **OFFEN** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: keine RAM-/Peak-Werte** |
| **SSD / GiB (dauerhaft)** | **OFFEN** | OFFEN | OFFEN | OFFEN | OFFEN | OFFEN | **BLOCKED: keine SSD-Freiraum-/Wachstumsdaten** |
| **Render-Scratch / GiB (temporär)** | **OFFEN** | OFFEN | n/a | n/a | OFFEN | OFFEN | **BLOCKED: Temp-Verzeichnis/Spitzen noch unbekannt** |
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
- [ ] **Messlauf auf dem echten VPS** samt UTC-Zeitpunkt und nachvollziehbarem Bereitsteller-/Systembezug durchgeführt.
- [ ] **CPU, RAM, freier SSD-Platz, I/O-Basisdaten, OS, Docker, Netzwerk/Bandbreite und bestehende Dienste** ausreichend erfasst.
- [ ] **Ressourcen für Web, DB, Renderer plus OS-/Betriebspuffer** anhand dieser Zahlen nachvollziehbar zugeteilt.
- [ ] **Nutzer hat die ausgefüllte 012-Inventur und das Budget ausdrücklich freigegeben.**
- [ ] Erst dann PR mergen, Issue #27 schließen und die reale 1080p/H.264-Render-Erprobung in **013** starten.

**Status: BLOCKED bis echte VPS-Messdaten vorliegen.** Der Entwurf darf nicht als bestandenes M01-Architektur- oder Render-Go/No-Go-Gate missverstanden werden. Das **Monatskosten-/API-Freigabebudget** ist eine separate Entscheidung in **016**, kein Bestandteil dieser Hardware-Kapazitätsaufnahme.
