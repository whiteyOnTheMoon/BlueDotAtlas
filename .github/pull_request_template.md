## Zugehörige Roadmap-Aufgabe
- Roadmap-Nummer: `0XX` (vor dem PR durch die echte dreistellige ID ersetzen)
- GitHub-Issue: #… (vor dem PR durch die bestehende Issue-Nummer ersetzen; Issue wurde **vor dem ersten Commit** angelegt)
- Branch: `feat/NNN-kurzthema`, `fix/NNN-kurzthema`, `docs/NNN-kurzthema` oder `chore/NNN-kurzthema`

## Änderung
Beschreibe kurz, was geändert wurde, warum und welche früheren Entscheidungen dadurch ersetzt werden.

## Verbindliche Dokumentationsprüfung (DEC-022)
- [ ] **Zentrale `README.md` im selben PR aktualisiert**: aktuelle verbindliche Entscheidungen, Artefakte/Links, Aufgaben- und Freigabestatus.
- [ ] **`docs/project/decision-log.md` geprüft/aktualisiert**, wenn eine neue Entscheidung getroffen oder ein früherer Beschluss ersetzt wurde.
- [ ] Fachspezifische Dokumentation (z. B. `docs/brand/`, `assets/brand/`) auf den **aktuellen verbindlichen Stand** gebracht.
- [ ] Historische Entwürfe klar als solche gekennzeichnet; **nichts Ungemergtes als bereits auf `main`** dargestellt.
- [ ] Links auf tatsächliche GitHub-Dateien und verfügbare Testnachweise geprüft.

## GitHub-Workflow (Roadmap 018)
- [ ] Das Issue wurde **vor dem ersten Commit** angelegt und beginnt im Titel mit derselben `[NNN]`-Kennung.
- [ ] PR-Titel beginnt mit `[NNN]` und die vorstehenden ID-/Issue-Platzhalter sind ausgefüllt; GitHub Actions `Roadmap PR identity gate` ist grün.
- [ ] Medien-/Faktenrechte und Anbieterfreigaben eingehalten; keine kostenpflichtigen Dienste ohne konkreten Betreiberentscheid aktiviert.
- [ ] Bestehende VPS-Services und persistente Volumes nicht ohne Auftrag verändert.

## Tests und Abnahme
- [ ] Automatisierte Tests mit Link zum Run dokumentiert.
- [ ] Erforderliche manuelle Kontrolle / Medien- oder Lizenzprüfung durchgeführt und belegt.
- [ ] Nur **explizit vom Auftraggeber freigegebene** Ergebnisse als angenommen markiert.
- [ ] Abnahme-Tor (Roadmap-Gate) eingehalten. Erst danach PR mergen / Issue schließen.

### Nachweise
- Tests / Screenshots / Clips:
- Nutzerentscheidung / Review:
- Offene Punkte:

**Hinweis:** Falls ein PR keinerlei öffentlich erkennbare Änderung bewirkt, darf der README-Punkt nur mit einer kurzen Begründung als „keine README-Änderung erforderlich“ markiert werden. Standard bei Nutzerbeschlüssen ist aber **immer eine aktualisierte zentrale README**.
