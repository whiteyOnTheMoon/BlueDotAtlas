# Kostenbudget und Freigabegrenzen V0.1

**BlueDotAtlas · Roadmap 016 · vom Betreiber freigegeben (DEC-032)**  
**Budgetvorgabe des Betreibers (18.11.2026):** KI und TTS **zusammen bis zu 25 € pro Monat**; zusätzliche APIs vorerst **kostenlos**, RSS bevorzugt. VPS, Domains und bestehende Infrastruktur sind bereits vorhanden.

## 1. Verbindlicher Kostenrahmen

| Kostenart | Monatlicher Zusatzrahmen | Regel |
| --- | ---: | --- |
| **LLM/KI + TTS gemeinsam** | **max. 25,00 € gesamt** | **Ein gemeinsamer Topf**, nicht je 25 € für beide. Enthält nutzungsabhängige Aufrufe, bezahlte Pläne, mögliche Steuern/Gebühren und sonstige Anbieterentgelte. |
| **Externe News-/Medien-/Daten-APIs** | **0,00 €** | Zunächst nur zulässige **kostenlose** Angebote/Quoten und **RSS**. Keine kostenpflichtigen API-Stufen, Zusatzaufrufe oder bezahlten Key-Pakete. |
| **Zusätzlicher Storage, Dienste, SaaS, Lizenzen** | **0,00 €** | Keine neuen Bezahlprodukte, Speicherupgrades oder Cloud-Renderdienste ohne getrennten Beschluss. |
| **Bereits vorhandener VPS, Domains und bestehende Infrastruktur** | **außerhalb dieses Zusatzbudgets** | Bestehende Kosten und Verträge laufen unabhängig; dieser Plan genehmigt **keinen** Kauf, Upgrade oder weiteren laufenden Dienst. |

**Ein Monatsbudget ist keine automatische Ausgabenerlaubnis.** Die 25 € begrenzen die Summe der **vorher einzeln freigegebenen** KI-/TTS-Anbieter. Ohne konkrete Provider-Freigabe bleibt tatsächlicher neuer Zahlungsrahmen zunächst **0 €**.

**Zeitraum:** Kalendermonat (UTC) für das interne Protokoll; kein Übertrag ungenutzter Beträge. Bei Abweichungen zum Abrechnungszeitraum des Providers gilt der **strengere** verfügbare Restbetrag, damit der Deckel auch bei überlappenden Rechnungen nicht überschritten wird.

## 2. Freigabe vor der ersten kostenpflichtigen Nutzung

Bevor ein bezahlter Plan, API-Aufruf oder ein automatisches Guthabenladen aktiviert wird, dokumentiert der Betreiber:

1. **Anbieter und Produkt/Modell** samt Link zu aktuellen Preisen, Lizenz-/Stimmrechten und Datum der Prüfung (siehe [Anbieterregister 015](../providers/vendor-registry.md)).
2. **Zweck**, grobe Kosten je Job, mögliche monatliche Grundgebühr und erwartetes Nutzungsvolumen; vorhandene andere LLM/TTS-Kosten aus **demselben 25-€-Topf** berücksichtigen.
3. **Explizite Ja-/Nein-Freigabe** für diesen konkreten Provider/Plan, Budgetanteil und ggf. Abbuchungsmechanismus; Zeitstempel, Entscheidung und Verantwortliche erfassen.
4. Erst danach **API-Key serverseitig** hinterlegen, an der vorgesehenen Systemgrenze aktivieren und Nutzungsbelege/Kosten protokollieren.

**Nicht erlaubt:** Stillschweigende Einrichtung bezahlter Provider, unbekannte Auto-Renewals, automatische Wechsel von Gratis- auf Bezahlstufe, unkontrollierte Aufladeautomatik, API-Overage oder wiederkehrende kostenpflichtige Jobs ohne genehmigten Rahmen.

**Keine früheren Beschlüsse über Brand-/Filmqualität oder Rechtsprüfung werden dadurch ersetzt.** Auch ein kostenloser API-Zugang benötigt passende Nutzungsbedingungen und geprüfte Medienrechte.

## 3. Warnungen, Vorprüfung und Stopps

Dies sind **vorgeschlagene Regeln für die spätere Implementierung**, **noch keine technisch aktive Kostenkontrolle**.

| Auslöser | Vorgesehene Aktion |
| --- | --- |
| Monatsverbrauch/gebundene Gebühren **≥ 18,75 € (75 %)** | **Gelb:** Betreiber warnen; nur noch gezielte, erforderliche KI-/TTS-Aufträge planen. |
| Monatsverbrauch/gebundene Gebühren **≥ 22,50 € (90 %)** | **Rot:** vor **jedem weiteren kostenpflichtigen Auftrag** ausdrückliche Einzelfreigabe und Restbudgetprüfung. |
| Prognose eines einzelnen Auftrags **≥ 1,00 €** | Vor Start **Kostenwarnung** mit Schätzung und anschließendem tatsächlichem Verbrauch; über dem vorhandenen Restbudget **blockieren**. Eine Warnung ist keine automatische Freigabe. |
| Prognostizierte Gesamtkosten inkl. laufender Verpflichtungen **> 25,00 €** oder keine verlässliche Obergrenze | **Stop/BLOCKED**. Keine weiteren kostenpflichtigen KI-/TTS-Jobs; erst neuer **expliziter** Betreiberbeschluss. |
| Externe API/Storage/Service erwartet **> 0 € Zusatzkosten** | **Stop/BLOCKED**; ein separater Budgetbeschluss ist nötig. |

**Praxis:** Vor Jobstart geschätzten Höchstbetrag gegen den **verbleibenden** Topf prüfen, tatsächliche Kosten nachhalten und nicht nur die Anbieterrechnung am Monatsende betrachten. Bei Abrechnungen in Fremdwährung konservativ in EUR schätzen und Gebühren/Puffer berücksichtigen. Ist die genaue Provider-Kostenobergrenze unbekannt, **nicht** automatisch in einen bezahlten Job laufen lassen.

Provider-seitige Hard-Limits nutzen, wenn verfügbar. **Provider-Dashboards und unsere lokalen Logs garantieren noch keinen harten Echtzeit-Kostenstopp:** Bis eine wirksame Limitierung in den späteren Tasks implementiert und getestet ist, gilt **manuelle Beaufsichtigung und begrenzte Auftragszahl** statt unkontrollierter Automatisierung.

## 4. Kostenprotokoll – minimaler Pflichtumfang

Für jeden kostenpflichtigen Anbieter bzw. Auftrag reichen zunächst diese Felder im Betriebsjournal:

`month_utc | provider | model_or_plan | project/job_id | estimate_eur | actual_eur | recurring_fee_eur | approved_by | approval_date | invoice_or_usage_ref | note`

Die Summenansicht zeigt: **KI+TTS gesamt**, gebundene monatliche Gebühren, bereits ausgelöste aber noch nicht abgerechnete Aufträge, **verfügbaren Rest**, Warnstufe. Secrets, API-Keys oder Zahlungsdetails **nicht** ins Protokoll/Repository aufnehmen.

## 5. Kostenloser Zugang und bereits bezahlte Infrastruktur

- Für News bevorzugt **RSS/Atom** offizieller Quellen; kostenlose APIs nur bei nachprüfbarem Nutzungsrecht, erlaubten Abrufintervallen und innerhalb der Free-Quota.
- Medienquellen wie NASA, NOAA, USGS, Copernicus, Pixabay, Unsplash oder Wikimedia Commons sind **mögliche** Quellen, **keine pauschal freigegebenen API-Accounts oder Assets**. Pexels-API bleibt optional, nicht betriebskritisch.
- Bestehende VPS-/Domain-Verträge werden durch Roadmap 016 **nicht neu genehmigt, geändert oder gekündigt**. Speicherverbrauch wird später überwacht; **zusätzliche** SSD-, Storage- oder Backup-Kosten benötigen eigene Erlaubnis.
- Keine automatischen Rendercloud-Ausgaben: der bestehende VPS ist vorgesehen, aber der synthetische FFmpeg-Nachweis 013 ist noch **kein** vollständiger Produktions-Render-Go.

## 6. Abnahme und Geltungsbereich

- [x] Betreiberbudget: **25,00 €/Monat kombiniert für KI und TTS**, nicht pro Kategorie.
- [x] Andere APIs **0 € Zusatzkosten**, bevorzugt RSS und Free-Tiers.
- [x] Bestehender VPS und Domains **nicht** als neue Zusatzkosten gerechnet.
- [x] Einzelfreigabe für konkrete kostenpflichtige Provider, Vermeidung von Auto-Overages, Warn- und Stoppschwellen beschrieben.
- [x] **Betreiber hat die vollständige Budgetrichtlinie einschließlich Warn- und Stoppschwellen** mit „Ok“ am 19.11.2026 (UTC) ausdrücklich freigegeben (DEC-032). PR-Merge und Issue-Abschluss folgen im selben Abnahmeschritt.

**Abgrenzung:** Dieser Task legt die **Policy** fest, keine Bezahlanbindung, keine Billing-API, keinen Kostenservice und keine automatisch erzwungenen Limits. Technische Umsetzung folgt in späteren Provider-/Worker-/Monitoring-Aufgaben.
