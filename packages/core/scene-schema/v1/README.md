# Scene-Director-Vertrag V1 (Roadmap 049)

**BlueDotAtlas · [Issue #73](https://github.com/whiteyOnTheMoon/BlueDotAtlas/issues/73) · Stand 25.11.2026**

Formaler, prüfbarer Vertrag, der einen BlueDotAtlas-Film beschreibt, bevor gerendert wird. Er ist reine Beschreibung und Validierung: Er rendert nichts und erteilt weder Rechte noch eine Veröffentlichung (`publicationAuthorized` ist immer `false`).

- **Quelle der Wahrheit:** Zod-Schema in [`packages/core/src/scene-schema/v1.ts`](../../src/scene-schema/v1.ts), importierbar als `@bluedotatlas/core/scene-schema/v1`.
- **JSON Schema (Draft 2020-12)** für Editoren und andere Werkzeuge: [`scene-schema.v1.json`](scene-schema.v1.json). Ein Test prüft, dass es exakt dem Zod-Schema entspricht.
- **Beispiel:** [`examples/pilot-v2-structure.json`](examples/pilot-v2-structure.json) bildet die Ziel-Dramaturgie V2 aus der [048-Abnahme](../../../../docs/pilot/60s-review.md) ab: 10 Szenen, 1800 Frames. Die Sprechtexte folgen mit Skript V2.

## Bausteine

| Typ | Inhalt |
| --- | --- |
| `SceneDocument` | Film: `schemaVersion: 1`, `id`, `title`, `language: en`, fest **30 fps / 1920×1080**, `durationFrames`, `sources`, `assets`, `dataRefs`, `scenes`, `publicationAuthorized: false` |
| `Scene` | Story-Beat (`intro`, `arrival`, `context`, `news`, `meaning`, `future`, `takeaway`, `pause`, `outro`), Titel, ≥ 1 `Shot`, `NarrationSegment[]` |
| `Shot` | Art (`brand_intro`, `brand_outro`, `footage_fullscreen`, `footage_with_overlay`, `breathing_video`, `infographic`, `map`, `text_card`), `duration`, `assetIds`, `assetInFrame`, `overlays`, `animation`, `transitionIn` |
| `NarrationSegment` | Text (≤ 400 Zeichen), Start/Ende in Frames relativ zur Szene, Quellen |
| `AssetRef` | Asset-ID, Art, optional relativer Pfad und SHA-256, `rightsStatus` (`unreviewed`/`cleared`/`blocked`/`rejected`), Credit, Quellen |
| `DataRef` | Belegter Datenpunkt (Beschreibung, optional Wert und Einheit) mit Pflichtquelle |
| `SourceRef` | Quelle mit Herausgeber, Titel, **https**-URL und Prüfdatum |
| `Transition` | `cut` (0 Frames) oder `crossfade`/`dip_to_black`/`dip_to_white` (1–60 Frames) |
| `AnimationInstruction` | `none`, `push_in`, `pull_out`, `pan_left`, `pan_right`, `ken_burns`, `diagram_build`, Skalierung 1–1,5, Easing |
| `Overlay` | `info_box`, `lower_third`, `source_credit`, `title`; ≤ 140 Zeichen; Zeitfenster innerhalb des Shots; Quellen/Daten |

## Was die Validierung erzwingt

- **Pflichtfelder und Typen.** Unbekannte Felder werden abgelehnt (`strict`). Jeder Fehler kommt als Zeile `pfad: meldung`, z. B. `scenes.1.shots.0.duration: …`.
- **Eindeutige IDs.** Alle Asset-, Quellen- und Daten-Verweise müssen auflösen; Assets mit `blocked`/`rejected` sind verboten.
- **Zeitvertrag.** Die Summe aller Shot-Dauern ist gleich `durationFrames`. Übergänge sind kürzer als ihr Shot; ein Übergang liegt am Anfang des eintretenden Shots und verlängert den Film nicht. Der erste Shot beginnt mit einem Schnitt. Overlays enden innerhalb ihres Shots. Sprechsegmente liegen innerhalb ihrer Szene und überlappen sich nicht.
- **Story-Regeln aus 048:** Eine `pause`-Szene ist ohne Sprache; `breathing_video` hat kein Overlay; Infoboxen gehören zu `footage_with_overlay`; Footage-Shots brauchen ein Asset.
- **Sicherheit.** Asset-Pfade sind relativ und ohne `..`, Quellen sind nur https; `publicationAuthorized` ist immer `false`.

Weiterführende Regeln zu Abwechslung, Blocklängen und Sprechpausen-Mindestwerten folgen als Story-Regeln (050), im Shot-Planner (052) und im QA-Linter (059); sie bauen auf diesem Vertrag auf.

```js
import { validateSceneDocument } from '@bluedotatlas/core/scene-schema/v1';
const result = validateSceneDocument(json);
if (!result.ok) console.error(result.errors.join('\n'));
```
