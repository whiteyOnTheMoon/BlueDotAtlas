#!/usr/bin/env python3
"""Create a private 60s PCM WAV from the already SHA-verified 042 voice."""
from __future__ import annotations

from copy import deepcopy
from hashlib import sha256
import json
import math
import os
from pathlib import Path
import stat
import sys
import tempfile
import wave

ROOT = Path(__file__).resolve().parent.parent
SRC_DIR = Path.home() / ".bda-pilot-voice-source-046"
SRC_WAV = SRC_DIR / "pilot-narration.wav"
STAGE = Path.home() / ".bda-pilot-stage-046"
AUDIO_DIR = STAGE / "audio"
OUTPUT = AUDIO_DIR / "pilot-narration-aligned.wav"
RATE, FPS, CHANNEL_BYTES = 48000, 30, 4
TOTAL = RATE * 60
END_VOICE = 1620 * (RATE // FPS)


def gate(ok, message):
    if not ok:
        raise ValueError("046 PRIVATE VOICE: " + message)


def contracts():
    plan = json.loads((ROOT / "docs/pilot/pilot-timeline.json").read_text())
    timing = json.loads((ROOT / "docs/pilot/tts-timing-evidence-042.json").read_text())
    script = json.loads((ROOT / "docs/pilot/60s-script.json").read_text())
    gate(script.get("render_authorized") is False and
         script.get("publish_authorized") is False, "script release gates changed")
    rights = plan.get("release", {})
    gate(plan.get("status") == "SYNTHETIC_INTERNAL_PROOF_ONLY" and
         rights.get("planningOnly") is True and
         all(rights.get(name) is False for name in
             ("renderAuthorized", "publishAuthorized", "productionRenderAuthorized",
              "thirdPartyMusicUsed")), "044 release gates changed")
    master = plan.get("master", {})
    gate((master.get("frames"), master.get("fps"), master.get("audioSampleRate"),
          master.get("audioChannels")) == (1800, FPS, RATE, 2), "film master changed")
    voice = plan.get("speechEvidence", {})
    gate(voice.get("wavSha256") == timing.get("wavSha256") and
         voice.get("sourceSha256") == timing.get("sourceSha256") and
         voice.get("voice") == timing.get("voice") == "bm_george" and
         voice.get("samples") == 2_332_448 and voice.get("narrationSegments") == 7,
         "042 WAV identity, source or sample count changed")
    gate(timing.get("status") == "PRIVATE_AUDIO_QA_TIMING_ONLY" and
         timing.get("mediaRights") == "PRIVATE_INTERNAL_TEST_ONLY" and
         timing.get("filmAuthorized") is False and
         timing.get("publishAuthorized") is False and
         timing.get("sampleRate") == RATE and timing.get("channels") == 2,
         "042 scope or PCM format changed")
    return plan, timing


def slots_for(plan, timing):
    shots, segments = plan.get("shots"), timing.get("segments")
    gate(isinstance(shots, list) and len(shots) == 9 and
         isinstance(segments, list) and len(segments) == 7,
         "nine shots / seven real voice segments required")
    gate([x.get("id") for x in shots] == [f"S{i:02}" for i in range(9)] and
         [x.get("id") for x in segments] == [f"S{i:02}" for i in range(1, 8)],
         "shot or narration order changed")
    gate(shots[0].get("endFrame") == 75 and
         (shots[-1].get("startFrame"), shots[-1].get("endFrame")) == (1620, 1800),
         "intro/outro frames changed")
    output = []
    expected_src = timing["leadSamples"]
    last_target_end = 0
    for index, segment in enumerate(segments):
        shot = shots[index + 1]
        cue = shot["narration"]
        begin, finish, n = cue["sourceStartSample"], cue["sourceEndSample"], segment["speechSamples"]
        start_frame, end_frame = cue["startFrame"], cue["endFrame"]
        gate(all(type(x) is int for x in (begin, finish, n, start_frame, end_frame)),
             "frame/sample coordinates must be integer")
        gate(cue["id"] == segment["id"] and cue["voice"] == "bm_george" and
             cue["playbackRate"] == 1 and begin == expected_src and
             finish - begin == n == cue["speechSamples"],
             "source sample slices differ from 042 voice")
        gate(start_frame >= shot["startFrame"] and
             end_frame <= shot["endFrame"] and
             end_frame - start_frame == math.ceil(n / (RATE // FPS)) ==
             cue["speechFrames"], "narration overflows scene")
        target = start_frame * (RATE // FPS)
        gate(target >= max(last_target_end, 75 * (RATE // FPS)) and
             target + n <= END_VOICE and end_frame <= 1620,
             "speech enters intro, outro, or previous sentence")
        output.append((begin, finish, target))
        last_target_end = target + n
        expected_src = finish + (timing["gapSamples"] if index < 6 else 0)
    gate(expected_src + timing["tailSamples"] == plan["speechEvidence"]["samples"],
         "voice source tail mismatches measured 042 WAV")
    return output


def align(source, source_frames, slots):
    gate(len(source) == source_frames * CHANNEL_BYTES, "source PCM frame mismatch")
    out = bytearray(TOTAL * CHANNEL_BYTES)
    for begin, finish, target in slots:
        gate(0 <= begin < finish <= source_frames and
             75 * (RATE // FPS) <= target and
             target + finish - begin <= END_VOICE,
             "PCM copy crosses private content boundaries")
        out[target * CHANNEL_BYTES:(target + finish - begin) * CHANNEL_BYTES] = (
            source[begin * CHANNEL_BYTES:finish * CHANNEL_BYTES]
        )
    gate(not any(out[:75 * (RATE // FPS) * CHANNEL_BYTES]) and
         not any(out[END_VOICE * CHANNEL_BYTES:]),
         "intro and outro overdub must be silent")
    return out


def private_dir(path):
    value = path.lstat()
    gate(stat.S_ISDIR(value.st_mode) and value.st_uid == os.getuid() and
         not value.st_mode & 0o077 and path.resolve() == path,
         "directory must be private, regular and owner-controlled")


def stage():
    gate(os.environ.get("BDA_PILOT_046_PRIVATE_VOICE_STAGE") == "TRUE",
         "explicit private voice flag required")
    plan, timing = contracts()
    slots = slots_for(plan, timing)
    private_dir(SRC_DIR)
    private_dir(STAGE)
    info = SRC_WAV.lstat()
    gate(stat.S_ISREG(info.st_mode) and info.st_uid == os.getuid() and
         not info.st_mode & 0o077 and 500_000 < info.st_size < 11_000_000,
         "source WAV must be private, regular and bounded")
    gate(sha256(SRC_WAV.read_bytes()).hexdigest() == timing["wavSha256"],
         "source WAV SHA-256 does not match original 042")
    with wave.open(str(SRC_WAV), "rb") as reader:
        gate((reader.getframerate(), reader.getnchannels(), reader.getsampwidth(),
              reader.getcomptype()) == (RATE, 2, 2, "NONE"), "source PCM16 profile changed")
        frames = reader.getnframes()
        gate(frames == plan["speechEvidence"]["samples"], "source sample count changed")
        raw = reader.readframes(frames)
    result = align(raw, frames, slots)
    if not AUDIO_DIR.exists() and not AUDIO_DIR.is_symlink():
        AUDIO_DIR.mkdir(mode=0o700)
    private_dir(AUDIO_DIR)
    gate(not OUTPUT.exists() and not OUTPUT.is_symlink(),
         "aligned WAV already exists; never overwrite original private stage")
    fd, name = tempfile.mkstemp(prefix=".046-voice-", suffix=".wav", dir=AUDIO_DIR)
    tmp = Path(name)
    try:
        os.chmod(tmp, 0o600)
        with os.fdopen(fd, "wb") as file:
            with wave.open(file, "wb") as writer:
                writer.setnchannels(2)
                writer.setsampwidth(2)
                writer.setframerate(RATE)
                writer.writeframes(result)
        with wave.open(str(tmp), "rb") as reader:
            gate((reader.getnframes(), reader.getframerate(), reader.getnchannels(),
                  reader.getsampwidth()) == (TOTAL, RATE, 2, 2),
                 "aligned WAV duration/profile incorrect")
        os.link(tmp, OUTPUT)  # Exclusive creation: no overwrite or partial output
    finally:
        tmp.unlink(missing_ok=True)
    print("046 PRIVATE VOICE STAGE: PASS / 7 exact passages / 60s WAV / 48k stereo")
    print("046 NARRATION: original intro/outro unaffected; NOAA source audio excluded")


def self_test():
    plan, timing = contracts()
    slots = slots_for(plan, timing)
    gate(len(slots) == 7 and slots[0][2] == 75 * 1600 and
         slots[-1][2] == 1436 * 1600, "source timing test failed")
    test_source = bytearray(plan["speechEvidence"]["samples"] * CHANNEL_BYTES)
    for begin, finish, _ in slots:
        test_source[begin * 4:begin * 4 + 4] = b"\x01\x02\x01\x02"
        test_source[(finish - 1) * 4:finish * 4] = b"\x03\x04\x03\x04"
    actual = align(test_source, plan["speechEvidence"]["samples"], slots)
    gate(len(actual) == TOTAL * 4, "60s output size changed")
    for begin, finish, target in slots:
        gate(actual[target * 4:target * 4 + 4] == b"\x01\x02\x01\x02" and
             actual[(target + finish - begin - 1) * 4:(target + finish - begin) * 4] ==
             b"\x03\x04\x03\x04", "PCM sample identity/alignment changed")
    broken = deepcopy(plan)
    broken["shots"][7]["narration"]["endFrame"] += 1
    try:
        slots_for(broken, timing)
    except ValueError:
        pass
    else:
        raise AssertionError("outro intrusion negative test failed")
    try:
        align(test_source, len(test_source) // 4, [(0, 50, 0)])
    except ValueError:
        pass
    else:
        raise AssertionError("intro intrusion negative test failed")
    print("046 VOICE SELF-TEST PASS: exact 7 ranges, 60s PCM, no intro/outro overlap")


if __name__ == "__main__":
    try:
        if sys.argv[1:] == ["--self-test"]:
            self_test()
        elif sys.argv[1:] == ["--stage"]:
            stage()
        else:
            raise ValueError("Use --stage with explicit flag or --self-test")
    except (OSError, ValueError, AssertionError, wave.Error) as error:
        print("046 PRIVATE VOICE FAILED: " + type(error).__name__ + ": " +
              str(error)[:200], file=sys.stderr)
        sys.exit(1)
