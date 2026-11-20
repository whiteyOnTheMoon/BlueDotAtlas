#!/usr/bin/env python3
"""042: bounded, real local speech QA. Never authorizes a full P60 film.

Only two pinned Apache-licensed weights/voice pack are downloaded on an
isolated runner, SHA-verified, used to speak the seven existing 037 paragraphs
and deleted at job end. Does not accept credentials or provider URLs.
"""

import hashlib
import json
import os
from pathlib import Path
import sys
import urllib.parse
import urllib.request
import wave

ROOT = Path(__file__).resolve().parent.parent
PRIVATE = ROOT / ".tmp-tts-042"
MODEL_DIR = PRIVATE / "model"
OUTPUT = PRIVATE / "audio" / "pilot-narration.wav"
REPORT = PRIVATE / "audio" / "pilot-narration-qa.json"
BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
ASSETS = {
    "kokoro-v1.0.onnx": (
        "7d5df8ecf7d4b1878015a32686053fd0eebe2bc377234608764cc0ef3636a6c5",
        350_000_000,
    ),
    "voices-v1.0.bin": (
        "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
        35_000_000,
    ),
}


def fail(message: str) -> None:
    raise RuntimeError("042 AUDIO GATE: " + message)


def download_pinned(name: str) -> Path:
    """Never download unpinned model bytes; don't follow to arbitrary HTTP hosts."""
    allowed = {"github.com", "objects.githubusercontent.com", "release-assets.githubusercontent.com"}
    expected, limit = ASSETS[name]
    target = MODEL_DIR / name
    url = BASE + name
    request = urllib.request.Request(url, headers={"User-Agent": "BlueDotAtlas-042-Model-QA"})
    with urllib.request.urlopen(request, timeout=90) as stream:
        location = urllib.parse.urlparse(stream.geturl())
        if location.scheme != "https" or location.hostname not in allowed:
            fail("model download redirected outside trusted GitHub asset hosts")
        claimed = stream.headers.get("Content-Length")
        if claimed and (not claimed.isdecimal() or int(claimed) > limit):
            fail("model download too large before streaming")
        digest = hashlib.sha256()
        count = 0
        with target.open("xb") as out:
            while True:
                chunk = stream.read(256 * 1024)
                if not chunk:
                    break
                count += len(chunk)
                if count > limit:
                    fail("model download exceeds hard byte cap")
                digest.update(chunk)
                out.write(chunk)
    if digest.hexdigest() != expected:
        fail("model checksum mismatch for " + name)
    print("042 MODEL SHA-256 VERIFIED: " + name + " (" + str(count) + " bytes)")
    return target


def load_plan() -> dict:
    if os.environ.get("CI") != "true" or os.environ.get("BDA_TTS_042_PRIVATE_TEST") != "TRUE":
        fail("explicit isolated CI opt-in is required")
    path = PRIVATE / "plan.json"
    plan = json.loads(path.read_text(encoding="utf-8"))
    if (
        plan.get("scope") != "042_PRIVATE_AUDIO_QA_ONLY"
        or plan.get("published") is not False
        or plan.get("authorizedForFilm") is not False
        or plan.get("provider") != "kokoro-onnx-local"
        or plan.get("voice") != "bm_george"
        or plan.get("language") != "en-gb"
        or plan.get("speed") != 1.0
        or plan.get("outputRate") != 48_000
        or plan.get("channels") != 2
        or plan.get("segmentGapSeconds") != 0.28
        or [s.get("id") for s in plan.get("segments", [])]
        != ["S01", "S02", "S03", "S04", "S05", "S06", "S07"]
    ):
        fail("unapproved or malformed TTS plan")
    source = (ROOT / "docs/pilot/60s-script.json").read_bytes()
    if hashlib.sha256(source).hexdigest() != plan.get("sourceSha256"):
        fail("source script changed after plan gate")
    return plan


def generate() -> None:
    plan = load_plan()
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    model = download_pinned("kokoro-v1.0.onnx")
    voices = download_pinned("voices-v1.0.bin")

    import numpy as np
    from scipy.signal import resample_poly
    from kokoro_onnx import Kokoro

    synth = Kokoro(str(model), str(voices))
    sample_rate = 48_000
    # Safe audible lead-in, so the first syllable never starts at sample zero.
    lead_samples = round(sample_rate * 0.12)
    utterances = [np.zeros(lead_samples, dtype=np.float32)]
    segments = []
    cursor = lead_samples
    gap_frames = round(plan["segmentGapSeconds"] * sample_rate)
    for item in plan["segments"]:
        audio, rate = synth.create(
            item["text"], voice=plan["voice"], speed=plan["speed"], lang=plan["language"]
        )
        mono = np.asarray(audio, dtype=np.float32).reshape(-1)
        if not np.isfinite(mono).all() or mono.size < int(rate * 1.0):
            fail("invalid synthesized voice segment: " + item["id"])
        # Kokoro default is 24kHz; resample with polyphase anti-aliasing.
        if rate != sample_rate:
            from math import gcd
            factor = gcd(int(rate), sample_rate)
            mono = resample_poly(mono, sample_rate // factor, int(rate) // factor)
        if mono.size > sample_rate * 20:
            fail("unexpectedly long narration segment")
        peak = float(np.max(np.abs(mono)))
        if peak < 0.004:
            fail("silent narration segment")
        # A global-safe peak ceiling prevents PCM16 overload; no lossy output.
        mono = np.clip(mono * min(1.0, 0.92 / peak), -0.92, 0.92)
        utterances.append(mono)
        segments.append({
            "id": item["id"],
            "startSeconds": round(cursor / sample_rate, 3),
            "speechSeconds": round(len(mono) / sample_rate, 3),
            "speechSamples": len(mono),
        })
        cursor += len(mono)
        if item["id"] != "S07":
            utterances.append(np.zeros(gap_frames, dtype=np.float32))
            cursor += gap_frames

    utterances.append(np.zeros(round(sample_rate * 0.35), dtype=np.float32))
    joined = np.concatenate(utterances)
    duration = len(joined) / sample_rate
    if duration < 32 or duration > 105:
        fail("narration duration implausible; inspect voice timing")
    pcm16 = np.asarray(np.round(joined * 32767), dtype="<i2")
    stereo = np.repeat(pcm16[:, None], 2, axis=1)
    with wave.open(str(OUTPUT), "wb") as wav:
        wav.setnchannels(2)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(stereo.tobytes())
    report = {
        "scope": "042_PRIVATE_AUDIO_QA_ONLY",
        "commercialFilmAuthorized": False,
        "voice": plan["voice"],
        "provider": plan["provider"],
        "sourceSha256": plan["sourceSha256"],
        "wavSha256": hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
        "sampleRate": sample_rate,
        "channels": 2,
        "durationSeconds": round(duration, 3),
        "segments": segments,
        "ownerAuditoryReviewRequired": True,
    }
    REPORT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("042 REAL KOKORO AUDIO CREATED: 7 segments / " + str(round(duration, 2)) + "s / 48k stereo")
    print("042 No external speech service, subscription, voice cloning or publication performed")


if __name__ == "__main__":
    try:
        generate()
    except Exception as exc:
        # Don't print raw HTTP headers or foreign API error objects.
        print("042 LOCAL TTS FAILED: " + type(exc).__name__ + ": " + str(exc)[:190], file=sys.stderr)
        sys.exit(1)
