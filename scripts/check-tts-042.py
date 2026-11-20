#!/usr/bin/env python3
"""Validate real 042 WAV independently of synthesizer (not a hearing review)."""
import hashlib
import json
from pathlib import Path
import sys
import wave

import numpy as np


def validate_voice(wav_path: Path, report_path: Path) -> dict:
    report = json.loads(report_path.read_text(encoding="utf-8"))
    if report.get("scope") != "042_PRIVATE_AUDIO_QA_ONLY" or report.get("commercialFilmAuthorized") is not False:
        raise AssertionError("audio cannot be released for P60")
    if report.get("ownerAuditoryReviewRequired") is not True:
        raise AssertionError("manual voice review must not be bypassed")
    if report.get("voice") != "bm_george" or report.get("provider") != "kokoro-onnx-local":
        raise AssertionError("unreviewed voice/provider")
    if not isinstance(report.get("sourceSha256"), str) or len(report["sourceSha256"]) != 64:
        raise AssertionError("missing source hash")
    raw_file = wav_path.read_bytes()
    if hashlib.sha256(raw_file).hexdigest() != report.get("wavSha256"):
        raise AssertionError("audio hash changed")
    if len(raw_file) > 21_000_000:
        raise AssertionError("audio output too big")
    with wave.open(str(wav_path), "rb") as reader:
        if reader.getnchannels() != 2 or reader.getsampwidth() != 2 or reader.getframerate() != 48_000:
            raise AssertionError("must be PCM16 48k stereo")
        if reader.getcomptype() != "NONE":
            raise AssertionError("compressed WAV unsupported")
        nframes = reader.getnframes()
        samples = np.frombuffer(reader.readframes(nframes), dtype="<i2").reshape(-1, 2)
    duration = nframes / 48_000
    if not 32 <= duration <= 105 or abs(duration - report["durationSeconds"]) > 0.002:
        raise AssertionError("improper narration length")
    if not np.array_equal(samples[:, 0], samples[:, 1]):
        raise AssertionError("stereo voice channels unexpectedly different")
    peak = int(np.max(np.abs(samples.astype(np.int32))))
    if not 800 < peak <= 30_200:
        raise AssertionError("silent or overloaded voice")
    if len(report.get("segments", [])) != 7:
        raise AssertionError("missing spoken segment")
    if [x.get("id") for x in report["segments"]] != [
        "S01", "S02", "S03", "S04", "S05", "S06", "S07"
    ]:
        raise AssertionError("shot order changed")
    for part in report["segments"]:
        seconds = part.get("speechSeconds", 0)
        start = part.get("startSeconds", -1)
        if not 1 <= seconds < 20 or not 0 <= start < duration:
            raise AssertionError("speech segment outside bounded timeline")
        offset = round(start * 48_000)
        end = offset + int(part["speechSamples"])
        if end > nframes:
            raise AssertionError("truncated speech samples")
        section = samples[offset:end, 0].astype(np.int32)
        if np.sqrt(np.mean(section.astype(np.float64) ** 2)) < 180:
            raise AssertionError("suspiciously silent spoken paragraph")
    # Distinct 120 ms zero lead-in and 350 ms zero tail, preserving complete syllables.
    if np.max(np.abs(samples[:4800, 0])) > 0:
        raise AssertionError("initial pre-roll missing")
    if np.max(np.abs(samples[-14000:, 0])) > 0:
        raise AssertionError("final tail silence missing")
    # Coarse silence detector; actual pronunciation and phrase completeness need hearing.
    half_seconds = nframes // 24_000
    quiet_in_a_row = 0
    for step in range(half_seconds):
        chunk = samples[step * 24_000:(step + 1) * 24_000, 0].astype(np.float32)
        rms = float(np.sqrt(np.mean(chunk * chunk)))
        quiet_in_a_row = quiet_in_a_row + 1 if rms < 90 else 0
        if quiet_in_a_row >= 6:
            raise AssertionError(">=3s of dead air in narration")
    return {"durationSeconds": round(duration, 3), "peak": peak, "sections": 7}


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: python scripts/check-tts-042.py <wav> <qa-json>")
    outcome = validate_voice(Path(sys.argv[1]), Path(sys.argv[2]))
    print(
        "042 REAL VOICE PASS: PCM16 / 48kHz / stereo / 7 paragraphs / "
        + str(outcome["durationSeconds"]) + " seconds / bounded pauses and safe peak"
    )
    print("042 Audio pronunciation remains subject to explicit operator listening.")
