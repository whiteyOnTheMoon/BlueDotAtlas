#!/usr/bin/env python3
"""Real PCM quality and ducking gates for the original 16s 043 QA fixture."""
import array
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys
import wave

RATE = 48000
TOTAL = 16.0

def read_wav(path: Path):
    if not path.is_file() or path.stat().st_size > 4_000_500:
        raise AssertionError("043 missing/oversized 16s PCM WAV")
    ff = subprocess.run([
        "ffprobe", "-v", "error", "-select_streams", "a:0",
        "-show_entries", "stream=codec_name,sample_rate,channels:format=duration",
        "-of", "json", str(path),
    ], check=True, capture_output=True, text=True, timeout=40)
    meta = json.loads(ff.stdout)
    stream = meta["streams"][0]
    if (stream["codec_name"] != "pcm_s16le"
        or int(stream["sample_rate"]) != RATE
        or stream["channels"] != 2
        or abs(float(meta["format"]["duration"]) - TOTAL) > 0.025):
        raise AssertionError("043 actual ffprobe profile differs from expected 48k PCM16 stereo 16s")
    with wave.open(str(path), "rb") as w:
        if (w.getnchannels(), w.getframerate(), w.getsampwidth(), w.getcomptype()) != (2, RATE, 2, "NONE"):
            raise AssertionError("043 invalid PCM16 WAV headers")
        if abs(w.getnframes() / RATE - TOTAL) > 0.025:
            raise AssertionError("043 source truncated")
        samples = array.array("h", w.readframes(w.getnframes()))
    if sys.byteorder != "little":
        samples.byteswap()
    if len(samples) % 2:
        raise AssertionError("043 invalid stereo sample count")
    return samples, hashlib.sha256(path.read_bytes()).hexdigest()

def rms(samples, start, stop):
    x = samples[int(start * RATE) * 2:int(stop * RATE) * 2:2]
    if not x:
        raise AssertionError("043 empty sample window")
    return math.sqrt(sum(int(i) * int(i) for i in x) / len(x))

def check_audio(mix_path: Path, bed_path: Path, plan_path: Path):
    plan = json.loads(plan_path.read_text())
    if (plan.get("status") != "SYNTHETIC_QA_ONLY"
        or plan.get("filmAuthorized") is not False
        or plan.get("published") is not False
        or plan.get("musicRights") != "ORIGINAL_SYNTHETIC_QA_ONLY"
        or plan.get("voiceRecorded") is not False
        or plan.get("musicLicenseApproved") is not False
        or plan.get("ownerListeningReviewRequired") is not True
        or plan.get("originalWavAssets") is not False
        or plan.get("originalBrandMediaIncluded") is not False
        or plan.get("seconds") != TOTAL
        or plan.get("outroStartSeconds") != 10):
        raise AssertionError("043 unreviewed rights, real voice or film release flag")
    mixed, mixed_hash = read_wav(mix_path)
    music, music_hash = read_wav(bed_path)
    if mixed_hash == music_hash:
        raise AssertionError("043 render incorrectly omitted narrator/ambience/intro")
    if max(abs(int(i)) for i in mixed) >= 30000:
        raise AssertionError("043 unexpected clipping/headroom: peak exceeds safe bound")
    if max(abs(int(i)) for i in music) >= 30000:
        raise AssertionError("043 music stem unexpectedly clipped")
    quiet_under_speaker = rms(music, 3, 7)
    recovered_before_outro = rms(music, 9.25, 9.75)
    recovered_during_outro = rms(music, 10.5, 11.5)
    tail_before_fade = rms(music, 14, 14.8)
    tail_after_fade = rms(music, 15.82, 15.98)
    if not 0 < quiet_under_speaker < recovered_during_outro * 0.52:
        raise AssertionError("043 missing music duck under spoken window")
    if recovered_during_outro < 60 or recovered_before_outro < 60:
        raise AssertionError("043 music did not recover before or continue through outro")
    if abs(recovered_during_outro - recovered_before_outro) > recovered_during_outro * 0.2:
        raise AssertionError("043 abrupt music drop at content to outro boundary")
    if tail_before_fade < 60 or tail_after_fade > tail_before_fade * 0.3:
        raise AssertionError("043 music fade is missing or begins before final outro")
    if rms(mixed, 3, 7) <= quiet_under_speaker * 2:
        raise AssertionError("043 speaker marker not audible over ducked music")
    if rms(mixed, 0.3, 1.5) <= 20:
        raise AssertionError("043 intro audio proxy unexpectedly absent")
    summary = {
        "scope": "SYNTHETIC_QA_ONLY",
        "realSpeechTested": False,
        "externalMusicLicensed": False,
        "actualProfile": {"sampleRateHz": RATE, "channels": 2, "pcmBits": 16, "seconds": TOTAL},
        "musicStemDuckRms": round(quiet_under_speaker, 2),
        "musicStemOutroRms": round(recovered_during_outro, 2),
        "outroRetainedThroughSeconds": 16,
        "endFadeAfterSeconds": 15.2,
        "peakSafe": True,
        "mixSha256": mixed_hash,
        "bedSha256": music_hash,
        "ownerListeningReviewRequired": True,
        "real042VoiceIntegrationReservedFor": "044",
    }
    return summary

if __name__ == "__main__":
    if len(sys.argv) != 4:
        raise SystemExit("Usage: python3 scripts/check-audio-043.py mix.wav music-stem.wav plan.json")
    result = check_audio(Path(sys.argv[1]), Path(sys.argv[2]), Path(sys.argv[3]))
    path = Path(sys.argv[1]).parent / "043-audio-mix-qa.json"
    path.write_text(json.dumps(result, indent=2) + "\n")
    print("043 REAL AUDIO PASS: 16s PCM16 stereo/48k, safe peak, music ducked and recovered; ")
    print("music continuous into 6s outro and fades only in last 0.8s.")
    print("043 rights: original synthetic tones only; not a commercial music license or real 042 voice.")
