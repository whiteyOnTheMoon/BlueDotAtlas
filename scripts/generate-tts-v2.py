#!/usr/bin/env python3
"""048 Script V2 narration (Roadmap 053: real audio duration as master timeline).

Speaks the six narration segments of docs/pilot/60s-script-v2.scene.json with the
same pinned, local Kokoro model/voice as 042 (bm_george, no subscription, no cloud
speech service). Each segment is placed at its scene-absolute start frame inside
an exact 60 s / 1800-frame 48 kHz stereo PCM16 timeline, with silence elsewhere.
Fails if any real utterance does not fit its planned window. Writes a timing
report with the measured frame windows; never publishes.

Usage: BDA_TTS_V2_PRIVATE=TRUE python3 scripts/generate-tts-v2.py OUTPUT_DIR
"""

import hashlib
import json
import math
import os
from pathlib import Path
import sys
import wave

sys.path.insert(0, str(Path(__file__).resolve().parent))
ROOT = Path(__file__).resolve().parent.parent
SCENE = ROOT / "docs/pilot/60s-script-v2.scene.json"
FPS = 30
RATE = 48_000
SAMPLES_PER_FRAME = RATE // FPS  # 1600
VOICE = "bm_george"
LANG = "en-gb"
SPEED = float(os.environ.get("BDA_TTS_V2_SPEED", "1.0"))
if not 0.8 <= SPEED <= 1.1:
    raise SystemExit("V2 TTS GATE: BDA_TTS_V2_SPEED must be between 0.8 and 1.1")


def fail(message: str) -> None:
    raise RuntimeError("V2 TTS GATE: " + message)


def plan_from_scene(scene: dict) -> list:
    """Scene-absolute frame windows for every narration segment."""
    if scene.get("publicationAuthorized") is not False or scene.get("fps") != FPS:
        fail("scene must be private and 30 fps")
    segments, offset = [], 0
    for sc in scene["scenes"]:
        length = sum(shot["duration"]["frames"] for shot in sc["shots"])
        for n in sc.get("narration", []):
            text = n["text"]
            if not (10 <= len(text) <= 400) or any(c in text for c in "\r\n<>"):
                fail("unsafe narration text " + n["id"])
            segments.append({
                "id": n["id"], "scene": sc["id"], "text": text,
                "startFrame": offset + n["startFrame"], "plannedEndFrame": offset + n["endFrame"],
                "sceneStartFrame": offset, "sceneEndFrame": offset + length,
            })
        offset += length
    # 053: real audio is master. A segment may outgrow its planned window but must
    # keep >= 0.6 s (18 frames) before the next sentence of the same scene and end
    # inside its scene (the 050 >= 1.0 s beat gap is checked on the final document).
    for i, seg in enumerate(segments):
        nxt = segments[i + 1] if i + 1 < len(segments) else None
        same = nxt is not None and nxt["scene"] == seg["scene"]
        seg["limitFrame"] = nxt["startFrame"] - 18 if same else seg["sceneEndFrame"]
    if offset != scene["durationFrames"] or offset != 1800:
        fail("scene must be exactly 1800 frames")
    return segments


def generate(out_dir: Path) -> dict:
    if os.environ.get("BDA_TTS_V2_PRIVATE") != "TRUE":
        fail("explicit BDA_TTS_V2_PRIVATE=TRUE opt-in required")
    scene_bytes = SCENE.read_bytes()
    segments = plan_from_scene(json.loads(scene_bytes))

    import importlib.util
    spec = importlib.util.spec_from_file_location("tts042", ROOT / "scripts/generate-tts-042.py")
    tts042 = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(tts042)
    model_dir = out_dir / "model"
    model_dir.mkdir(parents=True, exist_ok=True)
    tts042.MODEL_DIR = model_dir
    model = model_dir / "kokoro-v1.0.onnx"
    voices = model_dir / "voices-v1.0.bin"
    for name, path in (("kokoro-v1.0.onnx", model), ("voices-v1.0.bin", voices)):
        if path.exists():
            if hashlib.sha256(path.read_bytes()).hexdigest() != tts042.ASSETS[name][0]:
                fail("cached model checksum mismatch " + name)
        else:
            tts042.download_pinned(name)

    import numpy as np
    from scipy.signal import resample_poly
    from kokoro_onnx import Kokoro

    synth = Kokoro(str(model), str(voices))
    timeline = np.zeros(1800 * SAMPLES_PER_FRAME, dtype=np.float32)
    report_segments = []
    for item in segments:
        audio, rate = synth.create(item["text"], voice=VOICE, speed=SPEED, lang=LANG)
        mono = np.asarray(audio, dtype=np.float32).reshape(-1)
        if not np.isfinite(mono).all() or mono.size < int(rate * 0.8):
            fail("invalid synthesized segment " + item["id"])
        if rate != RATE:
            g = math.gcd(int(rate), RATE)
            mono = resample_poly(mono, RATE // g, int(rate) // g).astype(np.float32)
        # Trim leading/trailing near-silence so the window reflects real speech.
        loud = np.flatnonzero(np.abs(mono) > 0.004)
        if loud.size == 0:
            fail("silent segment " + item["id"])
        mono = mono[max(0, loud[0] - 480): min(mono.size, loud[-1] + 2400)]
        peak = float(np.max(np.abs(mono)))
        mono = np.clip(mono * min(1.0, 0.92 / peak), -0.92, 0.92)
        start = item["startFrame"] * SAMPLES_PER_FRAME
        end_frame = item["startFrame"] + math.ceil(mono.size / SAMPLES_PER_FRAME)
        if end_frame > item["limitFrame"]:
            fail(f"{item['id']} speech needs {end_frame - item['startFrame']} frames but only "
                 f"{item['limitFrame'] - item['startFrame']} fit before the next sentence/scene end")
        timeline[start:start + mono.size] = mono
        words = len(item["text"].replace("–", " ").split())
        seconds = mono.size / RATE
        report_segments.append({
            "id": item["id"], "scene": item["scene"], "text": item["text"],
            "startFrame": item["startFrame"], "endFrame": end_frame,
            "sceneStartFrame": item["sceneStartFrame"],
            "plannedEndFrame": item["plannedEndFrame"],
            "speechSeconds": round(seconds, 3), "words": words,
            "wordsPerSecond": round(words / seconds, 2),
        })
        print(f"V2 TTS {item['id']}: {seconds:.2f}s, {words / seconds:.2f} words/s, "
              f"frames {item['startFrame']}-{end_frame} (window to {item['plannedEndFrame']})")

    out_dir.mkdir(parents=True, exist_ok=True)
    wav_path = out_dir / "pilot-v2-narration-60s.wav"
    pcm16 = np.asarray(np.round(timeline * 32767), dtype="<i2")
    stereo = np.repeat(pcm16[:, None], 2, axis=1)
    with wave.open(str(wav_path), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(RATE)
        wav.writeframes(stereo.tobytes())
    report = {
        "scope": "048_V2_PRIVATE_NARRATION",
        "published": False,
        "provider": "kokoro-onnx-local", "model": "kokoro-v1.0", "voice": VOICE, "language": LANG, "speed": SPEED,
        "sceneSha256": hashlib.sha256(scene_bytes).hexdigest(),
        "wavSha256": hashlib.sha256(wav_path.read_bytes()).hexdigest(),
        "sampleRate": RATE, "channels": 2, "frames": 1800, "durationSeconds": 60.0,
        "segments": report_segments,
        "ownerAuditoryReviewRequired": True,
    }
    (out_dir / "pilot-v2-narration-timing.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("V2 TTS PASS: 6 segments placed in exact 60 s timeline; owner listening review required")
    return report


if __name__ == "__main__":
    try:
        if len(sys.argv) != 2:
            fail("usage: generate-tts-v2.py OUTPUT_DIR")
        generate(Path(sys.argv[1]).resolve())
    except Exception as exc:
        print("V2 TTS FAILED: " + type(exc).__name__ + ": " + str(exc)[:240], file=sys.stderr)
        sys.exit(1)
