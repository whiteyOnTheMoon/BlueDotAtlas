# Roadmap 029 – Bereits angelegten Cloudflare-Tunnel anbinden (Handover)

**Status 19.11.2026:** Der vom Betreiber angelegte Cloudflare-Tunnel ist nun **Healthy** und die öffentliche Website unter `studio.ap-pixels.com` **nach Betreiber-Browser-Test erreichbar**. Die zwischenzeitliche Fehlermeldung **1033 / HTTP 530** lag an einem DNS-CNAME mit der **falschen Tunnel-ID**; der Betreiber hat die Zuordnung selbst berichtigt. **Keinen zweiten Tunnel anlegen.** [Issue #46](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/46), [Draft-PR #194](https://github.com/whiteyOnTheMoon/BlueDotAtlas/pull/194), [Deploy-Runbook](deployment.md).

## Was wir derzeit wissen – und was nicht

| Prüfpunkt | Stand |
| --- | --- |
| Domain-Verwaltung | Betreiber: bereits bei Cloudflare |
| Tunnelobjekt für BlueDotAtlas | Betreiber: **angelegt** |
| Tunnelverwaltung | **Noch nicht bestätigt**: Dashboard/remote-managed oder lokal verwaltet |
| `cloudflared`-Connector auf dem VPS | **`bluedotatlas-cloudflared-1` gestartet und Healthy**, vier registrierte Cloudflare-Edge-Verbindungen; vier ältere fremde Tunnelcontainer bleiben unberührt |
| Published-application-Hostname | **`studio.ap-pixels.com`**, vom Betreiber per Cloudflare-**Routes**-Screenshot belegt |
| Origin-/Service-URL in der Cloudflare-Route | **`http://web:3000`**, als **konfiguriert** belegt; tatsächliche Docker-Erreichbarkeit nicht geprüft |
| Cloudflare Access für Admin | **Nicht bestätigt**, vor externer Adminfreigabe prüfen |
| Öffentliches TLS/HTTPS + App-Cookie/CSRF | **Öffentliche Website laut Betreiber via HTTPS erreichbar**; Admin-Cookie/CSRF/Anmeldetests **noch nicht abgenommen** |
| Speicher-/Secrets-/Restore-Gates 030/034 | **Ausstehend** |

## Dashboard-Prüfung: bitte nur unsensible Angaben teilen

1. Cloudflare-Dashboard → **Networking → Tunnels** → den *bereits existierenden* BlueDotAtlas-Tunnel öffnen. Auf **Overview** prüfen, ob er als verbunden/healthy erscheint und ob eine Replica/Connector verfügbar ist. **Nicht** „Create tunnel“ erneut ausführen; das Vorhandensein des Objekts beweist keine Verbindung.
2. Unter **Routes** liegt gemäß Betreiber-Screenshot bereits eine **Published application** vor: **Destination `studio.ap-pixels.com`, Service `http://web:3000`**. **Nicht neu erstellen oder verändern**, bevor Connector-Netzwerk, Admin-Access und Betreiber-Betriebsgate geprüft sind. Der öffentliche Hostname ist zur Projektabstimmung ausreichend; **niemals** Tunnel-Token, komplette Docker-Run-/Installationskommandos, Credential-JSON, Zertifikate, Tunnel-/Account-IDs oder private Netzwerkinformationen übermitteln.
3. Vor Nutzung des vorhandenen `compose.cloudflare.yml` bestätigen, dass es ein **remote-managed** Tunnel ist. Laut [Cloudflare Run Parameters](https://developers.cloudflare.com/tunnel/reference/run-parameters/) funktioniert `tunnel run --token-file <PFAD>` **nur mit remote-managed** Tunneln und cloudflared **2025.4.0 oder neuer**. Ein **locally-managed** Tunnel benötigt ein anderes Konzept mit Credentials-JSON und eigener Ingress-Konfiguration; unser optionales Overlay darf dafür nicht unverändert eingesetzt werden.
4. Für die **später separat freigegebene Compose-Anbindung** soll die im Cloudflare-Dashboard konfigurierte Service URL **`http://web:3000`** lauten, **wenn** der neue `cloudflared`-Connector als Dienst im **selben BlueDotAtlas-`edge`-Docker-Netz** läuft. `localhost:3000` bezeichnet innerhalb eines `cloudflared`-Containers **den Tunnelcontainer selbst**, nicht automatisch die Next.js-App. Falls der Betreiber bereits einen Connector außerhalb dieses Netzes installiert hat, ist die Netzwerk-/Origin-Architektur **vor einer Routenänderung** neu zu prüfen; bestehende produktive Tunnel dürfen nicht für BlueDotAtlas umkonfiguriert werden.
5. Auf dem VPS bleibt der **reine Basis-Compose-Modus portlos**, die Tunnelvariante **deaktiviert**, der synthetische Renderworker **deaktiviert**. Keine öffentliche DB-Portfreigabe, kein Redis, kein `cloudflared`-Start, keine Migrationsausführung und kein DNS-Wechsel durch diesen Dokumentationsstand.


## Sichtnachweis der Cloudflare-Route – 19.11.2026

Auf dem vom Betreiber bereitgestellten Screenshot im Reiter **Routes** ist eine Route mit **Order 1**, **Destination `studio.ap-pixels.com`**, **Type `Published application`** und **Service `http://web:3000`** ablesbar. Dies ist ein **Nachweis für die Dashboard-Konfiguration**, **kein** Beweis für einen aktuell verbundenen `cloudflared`-Connector, DNS-Auflösung, funktionierende interne Docker-Erreichbarkeit oder erfolgreiche Anmeldung via HTTPS. Ein zusätzlicher externer HTTPS-Aufruf konnte in der aktuellen Prüfungsumgebung **nicht erfolgreich abgerufen** werden; daraus folgt weder sicher ein Ausfall noch ein erfolgreicher Verbindungsaufbau.

Die übergeordnete Zone `ap-pixels.com` beherbergt laut früherem VPS-Audit bereits andere AP-Pixels-Dienste. **Keine** alten Tunnel/DNS-/Compose-Projekte oder deren Inhalte überschreiben. Der neue `studio`-Hostname wird ausdrücklich nur für die gewünschte BlueDotAtlas-Instanz behandelt. Falls der Tunnel bereits einen fremden Connector verwendet, darf `http://web:3000` keinesfalls ungeprüft auf eine fremde `web`-Instanz zeigen; zuerst den Connector-Netzwerknamensraum und die beabsichtigte BlueDotAtlas-`edge`-Netzanbindung feststellen.

## Öffentlicher Vorschau-Modus (Betreiberentscheidung DEC-042)

Die öffentliche Startseite unter `studio.ap-pixels.com` soll **ohne Cloudflare Access Policy** sichtbar werden. Das ist **nicht** die Freigabe für einen funktionierenden Admin-Login: vorerst keine Administrator-Identität/Passwort-Hash in der Runtime, keine produktiven Migrationen oder Medien. Der Admin bleibt serverseitig mangels Konfiguration **fail-closed**, die Login-Seite selbst kann als UI trotzdem sichtbar sein. Die spätere öffentliche Authentifizierung erfordert separat geprüfte Sicherheitsmaßnahmen gegen Missbrauch. `cloudflared` für das bestehende remotely-managed Tunnelobjekt wird als **einziger eigener BlueDotAtlas-Connector** im vorhandenen Compose-Projekt mit dem Nonroot-UID:GID des Besitzers der privaten `0600`-Token-Datei betrieben (Docker-Compose File-Secret auf Linux). Bestehende vier andere Tunnelcontainer unberührt lassen; keine weitere Route/kein DNS-Eingriff. Eine öffentliche Route garantiert nicht den Tunnelstatus, den erst ein Betreiber-Live-Test belegt.

## Zugriff und Secrets vor Aktivierung

Die BlueDotAtlas-Admin-Oberfläche benötigt zusätzlich zur eigenen serverseitigen Passwort-/Sessionprüfung **Cloudflare Access oder eine gleichwertig abgesicherte Zugangsbeschränkung**, damit ein öffentlich erreichbarer Login nicht allein durch die persistente Kontosperre gegen Missbrauch geschützt werden muss. Rechte, konkrete erlaubte Adminidentität, eventuelle künftige öffentliche Videoseiten und Nutzungskosten sind getrennt zu entscheiden (030). Die freizugebende **exakte** öffentliche `https://...`-Origin muss mit `APP_ORIGIN`, Browser-Origin, Request-Host, Weiterleitungen und `__Host-bda-session` (Secure/HttpOnly/SameSite=Strict) abgeglichen werden. Keine TLS-Garantie aus einem erfolgreichen HTTP-Smoke im CI ableiten.

Das Tunnel-Token ist bei einem remote-managed Tunnel ein **vollwertiges Verbindungsgeheimnis**: Wer es kennt, kann einen Connector für diesen Tunnel starten. Es bleibt ausschließlich beim Betreiber in einer privat zugriffsbeschränkten Datei **außerhalb des öffentlichen Repos** und darf **nie** in Chat, GitHub Issue/PR/Action-Logs, Screenshots oder Beispielkommandos mit Klartext-Token auftauchen. `BDA_TUNNEL_TOKEN_FILE` bezeichnet im späteren Compose-Overlay **nur den Pfad der privaten Datei**, nicht den Tokeninhalt. Das richtige Secret-Handling muss in Aufgabe 030 getrennt getestet und genehmigt werden.

## Nachweise für den erfolgten öffentlichen Vorschau-Start und noch offene Betriebs-Gates

- [x] Betreiber zeigt den konfigurierten öffentlichen Hostnamen **`studio.ap-pixels.com`** samt Origin **`http://web:3000`** im Cloudflare-Routenscreenshot.
- [x] Betreiber meldet Tunnel **Healthy** und vier registrierte Edge-Verbindungen des neuen BlueDotAtlas-Connectors.
- [x] Bestehenden Cloudflare-Tunnel über den eigenen BlueDotAtlas-Compose-Connector verbunden; **kein neuer Tunnel** und keine Änderungen der vier alten Connectoren.
- [x] Betreiber entscheidet: **öffentliche Startseite ohne Cloudflare Access**, Admin vorerst nicht aktiviert (DEC-042).
- [ ] Exakte, konkrete Betriebsänderung und Rollback/Restore/Secrets 030/034 sind freigegeben.
- [x] **Betreiber** bestätigt erfolgreiche öffentliche Browsererreichbarkeit per HTTPS, nachdem er den falschen `studio`-DNS-Tunnel-CNAME korrigiert hat.
- [x] Betreiber führt den korrigierten realen 029-Read-only-Verifikator mit **PASS** aus: private Docker-DB/Queue-Isolation, keine veröffentlichten Hostports, eigene DB-Volume, healthy Web/DB, Cloudflared-Netz, HTTPS-Homepage mit erwartetem BlueDotAtlas-Text und anonymer Admin-API HTTP 401.
- [ ] Zusätzlich **unabhängiger externer DB-/Queue-Port-Test** gegen die richtige Betreiber-Hostadresse (nicht bloß Cloudflare-Edge-IP), projektbezogener kontrollierter Wiederanlauf/Recovery, Admin-/Secret-/Restore-Gates und die Unversehrtheit der Altprojekte vollständig abnehmen. Erst danach kann 029 abgeschlossen werden.

**Quellen:** [Cloudflare Tunnel Setup](https://developers.cloudflare.com/tunnel/get-started/), [Tunnel Run Parameters](https://developers.cloudflare.com/tunnel/reference/run-parameters/), [Tunnel Tokens](https://developers.cloudflare.com/tunnel/reference/tunnel-tokens/), [Cloudflare Access für Self-Hosted Apps](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/self-hosted-public-app/). Die Quellen beschreiben Cloudflare-Funktionen, **nicht** den tatsächlichen Zustand dieses Betreiberkontos.
