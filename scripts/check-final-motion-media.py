#!/usr/bin/env python3
"""Roadmap 007: verify ACTUAL owner-uploaded intro/outro, unmodified.
This tests media properties only. Crossfades and music continuity are applied
later when composing the documentary, not baked into these original MP4 files.
"""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / "assets/brand/motion/final"
ITEMS = [
    {
        "name": "Intro",
        "file": "BlueDotAtlas Intro.mp4",
        "expected_bytes": 4745495,
        "expected_git_blob": "06db66c147c06fc729b8a50917882ba3cb09e26f",
        "duration": 2.5,
        "audio": True,
    },
    {
        "name": "Outro",
        "file": "BlueDotAtlas_Outro.mp4",
        "expected_bytes": 471807,
        "expected_git_blob": "b6f980d8a114c25803aeeef4dbe852c6ecbde38f",
        "duration": 6.0,
        "audio": False,
    },
]

def command(args):
    return subprocess.run(args, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout

def check(item):
    file = MEDIA / item["file"]
    assert file.is_file(), f"{item['name']} original MP4 missing: {file}"
    data = file.read_bytes()
    sha256 = hashlib.sha256(data).hexdigest()
    blob = hashlib.sha1(b"blob " + str(len(data)).encode() + b"\x00" + data).hexdigest()
    assert len(data) == item["expected_bytes"], f"{item['name']} size mismatch"
    assert blob == item["expected_git_blob"], f"{item['name']} Git blob SHA mismatch"
    meta = json.loads(command(["ffprobe", "-v", "error", "-show_entries",
        "format=duration,size:stream=index,codec_type,codec_name,width,height,r_frame_rate,sample_rate,channels",
        "-of", "json", str(file)]))
    videos = [s for s in meta["streams"] if s["codec_type"] == "video"]
    audios = [s for s in meta["streams"] if s["codec_type"] == "audio"]
    assert len(videos) == 1, f"{item['name']}: expected one video stream"
    video = videos[0]
    assert video["width"] == 1920 and video["height"] == 1080, f"{item['name']}: expected 1080p"
    assert video["codec_name"] == "h264", f"{item['name']}: expected H264"
    assert video["r_frame_rate"] in ("30/1", "30000/1001"), f"{item['name']}: expected ~30 fps"
    assert abs(float(meta["format"]["duration"]) - item["duration"]) <= 0.08, \
        f"{item['name']}: unexpected duration: {meta['format']['duration']}"
    assert len(audios) == int(item["audio"]), f"{item['name']}: expected audio={item['audio']} got {len(audios)} streams"
    if item["audio"]:
        assert audios[0]["codec_name"] == "aac", "Intro audio codec should be AAC"
        assert audios[0]["sample_rate"] == "48000", "Intro audio sample rate should be 48kHz"
    # Decode every real source frame; don't silently trust headers alone.
    subprocess.run(["ffmpeg", "-nostdin", "-hide_banner", "-v", "error", "-xerror",
                    "-i", str(file), "-f", "null", "-"], check=True, capture_output=True)
    result = {
        "name": item["name"], "filename": item["file"], "bytes": len(data),
        "sha256": sha256, "git_blob": blob, "duration": float(meta["format"]["duration"]),
        "video": video, "audio": audios, "decode": "PASS",
    }
    print(f"PASS: {item['name']} {result['duration']}s, {video['width']}x{video['height']}, "
          f"{video['codec_name']}, {video['r_frame_rate']} fps; "
          f"{'NO audio stream' if not audios else 'AAC 48kHz audio'}; "
          f"bytes {len(data)}; sha256 {sha256}")
    return result

if __name__ == "__main__":
    report = {"task": "007", "check": "original user-uploaded media",
        "composition": "CROSSFADE VIDEO + PRESERVE CONTINUOUS BGM (future film renderer)",
        "policy": "Never modify original MP4 assets; transitions only at film assembly.",
        "results": [check(x) for x in ITEMS]}
    print("PASS: two original user uploads verified and fully decoded.")
    print("JSON_REPORT=" + json.dumps(report, sort_keys=True))
