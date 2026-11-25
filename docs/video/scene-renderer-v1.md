# Scene-Director-Renderer V1

**BlueDotAtlas · Roadmap 057 ([Issue #81](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/81)), mit Teilen von 055 (animierte Infografik) und 058 (Textgrafiken) · Stand 25.11.2026**

Der Renderer erzeugt einen Film direkt aus einem gültigen [Szenendokument V1](../../packages/core/scene-schema/v1/README.md) und setzt die [Story-Regeln (050)](scene-director-rules.md) technisch um. Er löst den fest verdrahteten 9-Shot-Plan des 046-FFmpeg/SVG-Piloten ab und übernimmt dessen bewährte Bauweise: nacheinander, ein Thread, wenig RAM, exakte Zeitstempel.

## Ablauf

1. **Validieren** mit `validateSceneDocument` (049); Shots bekommen absolute Startframes.
2. **Ein Zwischenvideo pro Shot** (verlustfrei, `qp 0`), Länge `Shotdauer + Übergangslänge des nächsten Shots` (Tail):
   - **Video-Shots** (`footage_*`, `breathing_video`, `map` mit Video): Seek auf `assetInFrame`, Umrechnung auf 30 fps, Füllen auf 1920×1080.
   - **Kamera:** `push_in`, `pull_out`, `pan_left`, `pan_right`, `ken_burns` über `zoompan` mit 2-fach Oversampling (glatt, ohne Ruckeln) und Cosinus-Easing. Brand-Clips bleiben unverändert.
   - **`infographic` mit `diagram_build` (055):** animierte Balken für die `DataRef`s, die in den Overlays des Shots referenziert sind. Jede Zahl stammt aus einer belegten Quelle; die Balken wachsen mit Ease-out in 60 % der Shotdauer.
   - **Overlays (058):**
     - Arten: `info_box` (unten links, 40 px), `lower_third`, `source_credit` (unten rechts, 28 px), `title` (Bildmitte, 76 px).
     - Gezeichnet als SVG und mit Alpha-Fade (bis 10 Frames) weich ein- und ausgeblendet.
     - Sichtbar nur in ihrem Frame-Fenster.
3. **Exakte Teile**, die den Film lückenlos genau einmal abdecken:
   - **Body:** Shot ohne seinen Übergangsanfang.
   - **Blend:** Tail des vorigen Shots plus Anfang des nächsten Shots. Der `crossfade` ist linear; `dip_to_black` bzw. `dip_to_white` blendet in der ersten Hälfte aus und in der zweiten Hälfte ein. Gerechnet wird in RGB (`gbrp`), damit Schwarz wirklich schwarz bleibt.
4. **Zusammenfügen per Copy-Concat** mit exakten Zeitstempeln (`JOIN_TIMESTAMPS046`, sicher für FFmpeg 5.1). Das Ausgabeprofil verzichtet bewusst auf B-Frames (`-bf 0`), weil PTS = DTS = Framenummer gilt.
5. **Ein Tonmix:** Sprachspur (0,78) plus Ton des Brand-Intros, im letzten 9-Frame-Teil des Intros ausgeblendet, `amix normalize=0`, AAC 48 kHz Stereo. Das Musikbett folgt später.
6. **Prüfungen:**
   - 1920×1080, exakte Frameanzahl, `30/1`.
   - Die Tonspur deckt den ganzen Film ab.
   - Volldecode ohne Fehlermeldung.
   - Receipt mit SHA-256; `publicationAuthorized: false`.

## Aufruf

```bash
node scripts/render-scene-v1.mjs --scene docs/pilot/60s-script-v2.scene.json \
  --assets <asset-map.json> --narration <60s.wav> --out <privater 0700-Ordner>
```

- **Asset-Zuordnung:** `asset-map.json` ordnet jede `assetId` ihrer privaten Datei zu (`{"ID": {"file": "/abs/pfad.mp4"}}`). Steht im Szenendokument ein SHA-256, prüft der Renderer ihn vor dem Rendern.
- **Ausgabe:** `scene-v1.mp4` und `scene-v1.mp4.receipt.json`. Es wird nichts überschrieben.

## Nachweise

- **Plan-Tests** (`scripts/check-scene-render-v1.test.mjs`, Teil von `pnpm test`): Skript V2 ergibt lückenlos 1800 Frames; die Tails entsprechen den Übergängen; die Brand-Übergänge haben 9 Frames; die Ausdrücke sind begrenzt; Overlay-Text wird escaped.
- **Synthetischer 1080p-Lauf** (`--synthetic`; CI auf Ubuntu **und** bookworm/FFmpeg 5.1). Ein 240-Frame-Film aus generierten Testbildern wird auf Pixelebene geprüft:
  - **Dip:** In der Mitte des Dip-to-Black ist das Bild schwarz.
  - **Infobox:** Sie dunkelt das darunterliegende Bild sichtbar ab.
  - **Push-in:** Er verschiebt eine Farbkante messbar.
  - **Infografik:** Der Balken wächst bis zum Ende.
  - **Ton:** AAC ist vorhanden.
- **Speicher:** Spitze ≈ 246 MiB pro Prozess bei 1080p mit 4K-Oversampling, also innerhalb des 512-MiB-Containerlimits auf dem VPS.

## Noch nicht enthalten

Musikbett (043-Ducking), Farbkorrektur-Angleichung (057, zweiter Teil), Karten aus Rohdaten (056), automatischer Regel-Linter (059) und die Integration in Queue und Worker für den Admin-Button.
