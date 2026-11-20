# M03 / Roadmap 043 — Musik, Ambience und Stimmen-Ducking

**Issue:** [#67](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/67) · **Status:** Feature-PR im Review, Betreiber-Mergefreigabe ausstehend.

## Schlanker Audiomix (nur synthetischer technischer Nachweis)

Die 042-Narration ist vorläufig mit Kokoro `bm_george` akzeptiert. Ihr **echter** 48,593s-Sprecher-Test existierte ausschließlich als kurzlebiges GitHub-Actions-Artefakt, nicht als öffentlich lizenziertes Git-Asset. 043 nimmt **keine** vorweggenommene Synchronisierung von 042-Sprachabschnitten in die noch gesperrte 60s-Filmtimeline vor; diese Schnitt-/Audiointegration gehört zu 044.

Die folgende Signallogik ist in `packages/video/audio-mix/plan.mjs` implementiert und durch `scripts/render-audio-043.mjs` tatsächlich mit FFmpeg erprobt:

| Getrennte Spur | Regie- und Mixregel | 043-Nachweis |
| --- | --- | --- |
| `voice` | Verständlichkeit geht vor; Headroom für Sprache, Pegel 0,82 relativ zur **synthetischen** Fixture | Test-Marker, **keine behauptete echte Sprache** |
| `music` | Durchgehend vom Anfang bis **über das gesamte stumme 6s-Outro**. Während Sprechfenster sanft auf ca. 28 % des Testbettpegels absenken; anschließend abseits der Stimme wieder anheben. Musik-Fade-Out **erst in den letzten 0,8s des Outras** | Selbst generierter isolierter 176-Hz-Testton; 16s-Simulation, Outro von 10–16s |
| `ambience` | Dezentes, separates Atmosphärensignal, das Sprache nicht maskiert; Schlussfade | Selbst generiertes Pink-Noise-Testsignal |
| `introAudio` | Eigenen Original-Introton bei späterer Filmverwendung als separate Audioquelle respektieren, nur am Übergang kontrolliert ausblenden (0,3s Testfades), die zwei Original-Brand-MP4s **niemals** ändern | Selbst generiertes 440-Hz-Intro-Signal statt Original-Intro-MP4; kein Originalaudio-Test |

**Filmregel DEC-023:** Die beiden **Video**-Cross-Dissolves bleiben exakt 9 Frames / 0,3s, brandinterne Original-Audiostreams unverändert. Diese Zahl legt **nicht automatisch** die endgültige kreative Audio-Mischkurve im späteren 60s-Film fest. 043 verwendet 0,3s nur für den **synthetischen** Intro-Übergang; echter Tonmix bleibt gesondert zu testen.

FFmpeg-Aufbau: `aresample`/Stereo-Layout → dynamisch **zeitfensterbasierte `volume:eval=frame`-Gain-Kurve** für Musik-Ducking (0,35s Absenken, 0,45s Wiederanheben), `afade` für Musikstart und Schluss → `amix=normalize=0` über vier getrennte Tracks → `alimiter=limit=0.90` mit Latenzkompensation → PCM16/48kHz/Stereo-WAV. Die Mixkurve ist **kein signalabhängiger Kompressor**, keine automatische Sprecher-Erkennung und kein wissenschaftlicher Pegelwert. Die Zeitfenster müssen in 044 anhand der **wirklichen** Sprechersegmente eingestellt werden. Filterparameter stützen sich auf [FFmpeg-offizielle Audiofilterdokumentation](https://ffmpeg.org/ffmpeg-filters.html).

## Lizenz- und Kosten-Gate: kein ungeprüfter Musiktitel

**Es gibt in 043 noch keine für Veröffentlichung freigegebene Musikaufnahme.** Folglich darf ein Drittanbieter-Titel nicht stillschweigend als `LICENSED` deklariert, heruntergeladen, kopiert oder in den öffentlichen Repo-Dateibaum aufgenommen werden. `validateMusicRights()` akzeptiert für den ausführbaren 043-Proof **nur selbst generierte Original-Testtöne** mit `licenseStatus=SYNTHETIC_QA_ONLY` und `releaseAuthorized=false`; die Produktionsvariante ist **immer gesperrt**, bis später ein konkretes Rechte- und Betreiber-Gate erfüllt wurde.

Für einen **späteren** echten Musik-/Ambience-Titel sind je Aufnahme mindestens Titel, Interpret/Produzent, Urheber, Original-URL, Lizenzart/Text/Version, Abruf-/Prüfdatum, kommerzielle Online-/YouTube-Nutzung, Bearbeitungs-/Mischberechtigung, Credits, Archivbeleg und ausdrückliche Betreiberfreigabe nötig. „Royalty-free“ allein reicht nicht. Ebenso darf die vom Betreiber akzeptierte 042-Stimme später ausgetauscht werden; ein einmaliger Test sperrt keine künftige Qualitätsverbesserung.

**Kosten:** 0 € neue Pläne, Musiklizenzen oder externe APIs; keine API-Schlüssel, fremde Videos, persönlichen Audio- oder Modelldateien, keine neuen JS/Python-Abhängigkeiten, kein VPS/Worker/DB/Docker/Cloudflare. Bestehendes Gesamtlimit 25 €/Monat KI+TTS und die 007-Rechtegrenzen bleiben unverändert.

## Tatsächlicher reproduzierbarer Test

Auf dem 043-PR führt [`.github/workflows/pilot-audio-043-check.yml`](../../.github/workflows/pilot-audio-043-check.yml) in einem kurzlebigen Ubuntu-Runner ausschließlich Folgendes aus:

```sh
node --test scripts/check-audio-043.test.mjs
CI=true BDA_AUDIO_043_SYNTHETIC_PROOF=TRUE node scripts/render-audio-043.mjs
python3 scripts/check-audio-043.py \
  .tmp-audio-043/043-audio-mix-review.wav \
  .tmp-audio-043/043-ducked-bed-review.wav \
  .tmp-audio-043/043-audio-mix-plan.json
```

Das Skript generiert **vier neue synthetische Mono-/Stereo-Fixtures** selbst und mischt sie tatsächlich per FFmpeg. Der unabhängige Python-`wave`/FFprobe-Checker bestätigt **exakt 16s, PCM16, 48kHz, Stereo** sowie Safe-Peak-Grenze, deutlich leisere Musik während Sprachmarker, Erholung **vor Sekunde 10**, durchgehendes Musikbett während der simulierten Outrophase und den Fade in den letzten 0,8 Sekunden. Das QA-Ergebnis enthält echte RMS-Zahlen je Fenster und SHAs. GitHub lädt **nur** die synthetischen gemischten WAVs und den QA-Report als 5-Tage-Review-Artefakt hoch; alle Eingaben, Outputs und temporären Stems werden danach gelöscht und liegen unter `.tmp-audio-043/` außerhalb von Git.

**Die echte 042-Stimme wird in dieser Fixture nicht hörbar gemischt.** Die synthetische Tonprobe beweist den Algorithmus, **nicht** subjektive Verständlichkeit realen englischen Sprechers vor Musik. Diese Abnahme folgt in 044/048 mit passendem Rechte- und vollständigem Film-Scope. Wer die originale 043-Testprobe hört, hört ausdrücklich **keine finale Filmsoundtrack-Komposition**.

**Merge-Bedingungen:** 043-Audio-QA und 033 Required CI auf dem genauen finalen PR-Head grün; echte Review-WAV und Messwerte geprüft, keine übersteuernden Peaks, keine Verletzung der 007-Musikkontinuität; Rechte/Kosten/Scope gesichert; Betreiber gibt **konkreten** Squash-Merge frei. PR/Issue bis dahin offen. `docs/pilot/60s-script.json` bleibt `planning_only=true`, `render_authorized=false`, `publish_authorized=false`.
