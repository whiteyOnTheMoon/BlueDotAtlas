# Roadmap 028 – isolierter lokaler Dateispeicher und Lebenszyklus

**Status:** Umsetzung im Featurebranch `feat/028-local-storage`, [Issue #45](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/45). **PR und Betreiberabnahme 028 stehen aus**. Kein Deployment, keine Änderung am VPS, keine neuen Docker-Volumes oder Mounts, keine echten Medien oder veröffentlichbaren MP4s.

## Ziel / Projektgrenzen

Gemäß [M02-Architektur](../architecture/overview.md) bleiben Videodateien **auf einem getrennten lokalen Dateispeicher**. PostgreSQL hält referenzierbare Metadaten, u. a. `artifacts.storage_key`, `artifacts.checksum_sha256`, `videos.final_artifact_id`, Rechte-/Freigabestatus und Projektversionen. Es werden keine Videobytes im Datenbankschema abgelegt. Dieser Stand **verwendet die existierenden Tabellen aus 024**, ohne neue Drizzle-Migration. Die seit 027 eingeführte PostgreSQL-Queue bleibt ausschließlich synthetisch; es wird **keine** Dateischreibfunktion in die freie Client-API und **keine** Render-/Provider-Automation aufgenommen.

Der spätere Zielverzeichnisname ist **`/srv/blueDotAtlas`**, *noch nicht angelegt oder als Live-Root geöffnet*. Der Ordnerplan:

| Bereich | Zweck | Autocleanup in 028 |
| --- | --- | --- |
| `uploads/` | geprüfte künftige lokale Media-Uploads | **niemals** |
| `cache/` | ableitbare Zwischenergebnisse | **nur** explizit begrenzt, altersgeprüft |
| `temp/` | Scratch-/Teilergebnisse | **nur** explizit begrenzt, altersgeprüft |
| `rendered/` | künftige dauerhaft referenzierte MP4-Ausgaben | **niemals** |
| `backups/` | spätere Backup-Ausgaben (034) | **nicht** durch API schreib-/löschbar |
| `logs/` | spätere Wartungs-/Audit-Ausgaben | **nicht** durch API schreib-/löschbar |

`packages/storage` exportiert den Plan und eine **nur für Aufgabe 028** nutzbare, explizite Klasse `LocalStorage.openIsolatedTestRoot(path)`. Der Konstruktor verlangt `BDA_STORAGE_TEST=1`, Linux, eine zuvor durch `mkdtemp(join(tmpdir(), 'bda-storage-028-'))` angelegte **private Root** direkt im realen Betriebssystem-Testtempverzeichnis; Root muss dem aktuellen Prozessbenutzer gehören, Mode `0700` haben und darf kein Symlink sein. `/srv/blueDotAtlas`, Home-Verzeichnisse und fremde Projektordner werden damit bewusst verweigert. **Erst eine gesonderte Freigabe in 029/030 darf eine produktive Root-/Volume-Konfiguration hinzufügen**; ein Merge von 028 allein startet keinen Dienst.

## API- und Pfadkontrakt

- Schreibbar sind **nur** `uploads`, `cache`, `temp`, `rendered`; `backups`/`logs` werden für die spätere Betriebsplanung als private Verzeichnisse angelegt, aber von `put`/`read`/`cleanup` nicht freigegeben.
- Öffentliche Dateischlüssel sind immer **relativ zum Storage-Root**, z. B. `rendered/example.mp4` oder `uploads/project-uuid/media-001.bin` (keine Hostpfade). Pro Objekt höchstens vier nichtleere Pfadsegmente, maximal 240 Zeichen, begrenztes ASCII-Alphabet `A–Z a–z 0–9 . _ -` mit alphanumerischem Anfang. **Absolut-/Drive-/UNC-Pfade, `..`, Punkt-/Hidden-Segmente, `%`-Encoding, Unicode-Konfusionszeichen, NUL/Steuerzeichen, Backslashes und unbekannte Extensionen** sind ungültig.
- Vorerst ausschließlich `.mp4` in `rendered`; in anderen Bereichen eine kleine positive Formatliste. Vor späterem echten Medienimport bleibt die **MIME-/Magics-/Rechteprüfung** ein eigenes, noch offenes Gate. Ein in CI synthetisch als `*.mp4` benanntes Byteobjekt **ist kein valider MP4-Stream** und kein freigegebener Film.
- `put(area, key, input, {maxBytes})` akzeptiert `Uint8Array` oder einen `AsyncIterable<Uint8Array>` **streamend**. Pro Datei maximal 512 MiB als 028-Prototyp-API-Grenze; ausgabe: `{storageKey,sizeBytes,sha256}`. Dateien: Mode `0600`; Verzeichnisse `0700`. Unbekannte/unberechtigte Pfade werden vor dem Öffnen gesperrt; `lstat`/`realpath` kontrollieren private Elternverzeichnisse, `O_NOFOLLOW` die Datei.
- **Atomarer No-Replace-Commit:** temporäre, zufällig benannte `.bda-stage-<uuid>`-Datei im **selben Zielverzeichnis** mit exklusivem `O_EXCL|O_NOFOLLOW` schreiben, SHA-256 laufend berechnen, File fsync, Budget prüfen, mittels atomarem `link(stage,target)` veröffentlichen (bestehende Zieldatei darf **nie überschrieben** werden), Stage entfernen und Verzeichnis fsync. Bei regulärem Input-/Limit-/I/O-Fehler wird Stage im `finally` entfernt. Nach einem harten Prozesskill können unvollständige Stage-Dateien zurückbleiben; für `temp`/`cache` sind diese nur über den **expliziten altersgeprüften** Cleanup erreichbar, für `uploads`/`rendered` erst durch eine spätere **eigens freizugebende** Orphan-Staging-Wartung. **Keine** automatische Massenlöschung in `rendered`.
- `read(storageKey, maxBytes)` verweigert ungeprüfte/symbolische/hardlink-basierte Dateien und begrenzt den lokalen Readback auf standardmäßig 32 MiB (maximal 512 MiB). Große reale Medien sollen später **nicht** vollständig in einen Next.js-API-Response geladen werden, sondern einen separaten kontrollierten Streaming-Pfad bekommen.
- Es werden keine ungeprüften Benutzereingaben zu Shell-Kommandos verarbeitet, keine Clients bekommen interne Hostpfade und es wird kein HTTP-Upload-/Download-Endpunkt eingerichtet.

## Budgets und Bereinigung

Gemäß [M01-VPS-Ressourcenaudit](../infra/vps-audit.md) sind die **Planungsobergrenzen** 20 GiB für `uploads + rendered` sowie 12 GiB für `temp + cache`. Weitere Planungsreserve: 4 GiB Datenbank/WAL/Backups, 1 GiB Web, 40 GiB für bestehende Services/OS und 12 GiB Sicherheitsreserve. `usage()` scannt die eigenen Bereiche ohne Symlink-Follow; ein unbekannter oder nichtprivater Eintrag führt zu einer **fail-closed Schreibsperre**, statt dessen Bytes zu ignorieren. `put` prüft vor und nach Schreiben die aktuelle Bereichsnutzung. Tests dürfen kleinere Budgetwerte injizieren. **Diese Prüfung ist advisory**, kein atomar zwischen beliebigen Prozessen reserviertes Volume-Quota und **kein** Docker-/OS-/cgroup-Limit. In 029/030 muss eine echte Quoten-/Last-/Filesystem-Kontrolle mit Betriebsfreigabe folgen; der Prototyp verspricht keine hardwareseitige Plattenreserve.

`cleanup('temp'|'cache', {olderThanMs,maxDeleteBytes,maxFiles,dryRun})` ist **ohne `dryRun: false` ausschließlich eine Vorschau**. Das positive Alter, eine positive maximale Gesamtbytezahl und eine Dateianzahl 1–1000 müssen explizit übergeben werden; die Gesamtbytezahl darf den Scratch-Planungsrahmen nicht übersteigen. Es werden ausschließlich verifizierte private reguläre Dateien mit **genau einem Hardlink** ausgewählt. Symlinks/Hardlinks/ungeprüfte Pfade und fremde/inaktive Verzeichnisse werden nicht traversiert oder gelöscht. Vor jeder tatsächlichen `unlink`-Operation werden Parent und Inode, Größe, Mtime, Mode, Linkcount und Alter erneut geprüft; abweichende Dateien werden übersprungen und im Ergebnis gezählt. `rm -rf` und rekursive Verzeichnislöschungen existieren in der Bibliothek **nicht**.

**Retention-Garantie im 028-Umfang:** `rendered/`, `uploads/`, `backups/` und `logs/` sind **kein Cleanup-Ziel**. Referenzierte, nur künstlich angelegte MP4s überstehen Temp-/Cache-Aufräumung und DB-/Storage-Reconnect, unabhängig davon, ob `artifacts.rights_status` noch `unreviewed` ist. **Dateiexistenz, SHA-256 oder ein Worker-Status ändern weder Rechte noch Publishing-Status.** Spätere Löschung außerhalb Temp/Cache muss vorab sämtliche DB-Referenzen, Rechts- und Backupgates prüfen.

## Isolierte Nachweise / Grenzen

Der CI-Workflow [`storage-check.yml`](../../.github/workflows/storage-check.yml) verwendet Ubuntu mit Node 22, **wegwerfbaren mkdtemp-Verzeichnissen** und eine ausschließlich synthetische PostgreSQL-16-Testdatenbank. Tests belegen den sechsfachen Ordnerplan, Mode 0700/0600, SHA-256, Restart, Stream-Abbruch/Limit, No-Replace auch bei parallelen Writes, relative Pfade inklusive Encodings/Unicode/Windows, Symlink-/Hardlink-Schutz, Budgetfehler, vorschaupflichtige und begrenzte Temp-/Cache-Bereinigung und erhaltene Referenzen über `artifacts`/`videos`. Bestehende 023–027-Regressionen laufen separat erneut für den finalen PR-Head. Keine neuen Migrationsdateien, keine Providerkosten, keine realen Medien, kein VPS-Zugriff und keine neue UI.

**Nicht bewiesen:** bösartige lokale Prozesse mit **derselben Unix-UID**, die Verzeichnisse in exakten `lstat`-/`link`-Zeitfenstern austauschen, können unter Node.js-Pfad-APIs nicht vollständig mit `openat2(RESOLVE_BENEATH)`-Garantien ausgeschlossen werden. Auf produktiven Hosts brauchen die Bereiche exklusive OS-Berechtigungen, kontrollierte Prozessrollen sowie eine gesonderte Race-/Quota-/Mount- und Restore-Prüfung in 029/030/034. 028 behauptet **nicht**, dass die vorläufige Anwendung Root-Rechte benötigen oder einen sicheren Multiuser-Fileserver ersetzen darf.

**Offene Gates:** Ein eigenständiger PR 028 muss nach [DEC-036](../project/working-agreement.md) einschließlich CI-/Sicherheitsbelegen **ausdrücklich vom Betreiber genehmigt** werden, bevor er in `main` integriert wird. Selbst danach ist `/srv/blueDotAtlas` ohne die Betriebsaufgaben 029/030 **nicht** freigegeben.
