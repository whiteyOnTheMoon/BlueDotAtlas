# Roadmap 029 – Bereits angelegten Cloudflare-Tunnel anbinden (Handover)

**Status 19.11.2026:** Der Betreiber hat **einen Cloudflare-Tunnel bereits im Cloudflare-Dashboard erstellt**. Das ist ein **externer Betreiberhinweis**, keine durch GitHub verifizierte Online-Verbindung. **Keinen zweiten Tunnel anlegen.** [Issue #46](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/46), [Draft-PR #194](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/194), [Deploy-Runbook](deployment.md).

## Was wir derzeit wissen – und was nicht

| Prüfpunkt | Stand |
| --- | --- |
| Domain-Verwaltung | Betreiber: bereits bei Cloudflare |
| Tunnelobjekt für BlueDotAtlas | Betreiber: **angelegt** |
| Tunnelverwaltung | **Noch nicht bestätigt**: Dashboard/remote-managed oder lokal verwaltet |
| `cloudflared`-Connector auf dem VPS | **Nicht bestätigt**; vier bereits zuvor laufende Tunnelcontainer gehören nicht automatisch zu BlueDotAtlas |
| Published-application-Hostname | **Noch nicht genannt oder verifiziert** |
| Aktuelle Origin-/Service-URL | **Nicht verifiziert** |
| Cloudflare Access für Admin | **Nicht bestätigt**, vor externer Adminfreigabe prüfen |
| Öffentliches TLS/HTTPS + App-Cookie/CSRF | **Noch nicht abgenommen** |
| Speicher-/Secrets-/Restore-Gates 030/034 | **Ausstehend** |

## Dashboard-Prüfung: bitte nur unsensible Angaben teilen

1. Cloudflare-Dashboard → **Networking → Tunnels** → den *bereits existierenden* BlueDotAtlas-Tunnel öffnen. Auf **Overview** prüfen, ob er als verbunden/healthy erscheint und ob eine Replica/Connector verfügbar ist. **Nicht** „Create tunnel“ erneut ausführen; das Vorhandensein des Objekts beweist keine Verbindung.
2. Unter **Routes** prüfen, ob bereits eine **Published application** für einen gewünschten (Sub-)Domain-Hostnamen hinterlegt ist. Falls nicht, ist das zunächst ein offener Konfigurationsschritt. Der öffentliche Hostname ist zur Projektabstimmung ausreichend; **niemals** Tunnel-Token, komplette Docker-Run-/Installationskommandos, Credential-JSON, Zertifikate, Tunnel-/Account-IDs oder private Netzwerkinformationen übermitteln.
3. Vor Nutzung des vorhandenen `compose.029.cloudflare.yml` bestätigen, dass es ein **remote-managed** Tunnel ist. Laut [Cloudflare Run Parameters](https://developers.cloudflare.com/tunnel/reference/run-parameters/) funktioniert `tunnel run --token-file <PFAD>` **nur mit remote-managed** Tunneln und cloudflared **2025.4.0 oder neuer**. Ein **locally-managed** Tunnel benötigt ein anderes Konzept mit Credentials-JSON und eigener Ingress-Konfiguration; unser optionales Overlay darf dafür nicht unverändert eingesetzt werden.
4. Für die **später separat freigegebene Compose-Anbindung** soll die im Cloudflare-Dashboard konfigurierte Service URL **`http://web:3000`** lauten, **wenn** der neue `cloudflared`-Connector als Dienst im **selben BlueDotAtlas-`edge`-Docker-Netz** läuft. `localhost:3000` bezeichnet innerhalb eines `cloudflared`-Containers **den Tunnelcontainer selbst**, nicht automatisch die Next.js-App. Falls der Betreiber bereits einen Connector außerhalb dieses Netzes installiert hat, ist die Netzwerk-/Origin-Architektur **vor einer Routenänderung** neu zu prüfen; bestehende produktive Tunnel dürfen nicht für BlueDotAtlas umkonfiguriert werden.
5. Auf dem VPS bleibt der **reine Basis-Compose-Modus portlos**, die Tunnelvariante **deaktiviert**, der synthetische Renderworker **deaktiviert**. Keine öffentliche DB-Portfreigabe, kein Redis, kein `cloudflared`-Start, keine Migrationsausführung und kein DNS-Wechsel durch diesen Dokumentationsstand.

## Zugriff und Secrets vor Aktivierung

Die BlueDotAtlas-Admin-Oberfläche benötigt zusätzlich zur eigenen serverseitigen Passwort-/Sessionprüfung **Cloudflare Access oder eine gleichwertig abgesicherte Zugangsbeschränkung**, damit ein öffentlich erreichbarer Login nicht allein durch die persistente Kontosperre gegen Missbrauch geschützt werden muss. Rechte, konkrete erlaubte Adminidentität, eventuelle künftige öffentliche Videoseiten und Nutzungskosten sind getrennt zu entscheiden (030). Die freizugebende **exakte** öffentliche `https://...`-Origin muss mit `APP_ORIGIN`, Browser-Origin, Request-Host, Weiterleitungen und `__Host-bda-session` (Secure/HttpOnly/SameSite=Strict) abgeglichen werden. Keine TLS-Garantie aus einem erfolgreichen HTTP-Smoke im CI ableiten.

Das Tunnel-Token ist bei einem remote-managed Tunnel ein **vollwertiges Verbindungsgeheimnis**: Wer es kennt, kann einen Connector für diesen Tunnel starten. Es bleibt ausschließlich beim Betreiber in einer privat zugriffsbeschränkten Datei **außerhalb des öffentlichen Repos** und darf **nie** in Chat, GitHub Issue/PR/Action-Logs, Screenshots oder Beispielkommandos mit Klartext-Token auftauchen. `BDA_TUNNEL_TOKEN_FILE` bezeichnet im späteren Compose-Overlay **nur den Pfad der privaten Datei**, nicht den Tokeninhalt. Das richtige Secret-Handling muss in Aufgabe 030 getrennt getestet und genehmigt werden.

## Nächste Nachweise vor irgendeinem VPS-Deploy

- [ ] Betreiber meldet **nur** den vorgesehenen öffentlichen Hostnamen und ob der Dashboard-Tunnel derzeit *Connected* ist (oder noch ohne Connector).
- [ ] Verwaltungstyp und Anschluss des künftigen Connectors sind geklärt; **kein neuer Tunnel nötig**.
- [ ] Cloudflare-Access-Policy/Hostname und öffentlich-vs-privat-Struktur sind vereinbart.
- [ ] Exakte, konkrete Betriebsänderung und Rollback/Restore/Secrets 030/034 sind freigegeben.
- [ ] Live-Web über den bestätigten Hostnamen via **echtem HTTPS** getestet; DB/Queue nicht extern erreichbar, Web/DB/Connector-Recovery und Altprojekte ungestört. Erst danach kann 029 als abgeschlossen markiert werden.

**Quellen:** [Cloudflare Tunnel Setup](https://developers.cloudflare.com/tunnel/get-started/), [Tunnel Run Parameters](https://developers.cloudflare.com/tunnel/reference/run-parameters/), [Tunnel Tokens](https://developers.cloudflare.com/tunnel/reference/tunnel-tokens/), [Cloudflare Access für Self-Hosted Apps](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/). Die Quellen beschreiben Cloudflare-Funktionen, **nicht** den tatsächlichen Zustand dieses Betreiberkontos.
