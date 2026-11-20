#!/usr/bin/env python3
"""044 internal 60s synthetic storyboard with the ACTUAL re-generated 042 speech.
Never uses/stages NASA/NOAA footage, original brand clips or commercial music.
All output stays under the gitignored temporary QA directory.
"""
import hashlib
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import wave

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
ROOT_OUT = ROOT / ".tmp-timeline-044"
PLAN_PATH = ROOT / "docs" / "pilot" / "pilot-timeline.json"
VOICE_PATH = ROOT / ".tmp-tts-042" / "audio" / "pilot-narration.wav"
VOICE_REPORT = ROOT / ".tmp-tts-042" / "audio" / "pilot-narration-qa.json"
QA_AUDIO = ROOT_OUT / "044-voice-music-60s.wav"
QA_VIDEO = ROOT_OUT / "044-internal-storyboard-60s.mp4"
SAMPLE_RATE = 48000
TOTAL_SAMPLES = 60 * SAMPLE_RATE
FPS = 30
SPF = SAMPLE_RATE // FPS
SIZE = (960, 540)


def reject(reason):
    raise ValueError("044 INTERNAL TIMELINE GATE: " + reason)


def source_guards(plan, report):
    if os.environ.get("CI") != "true" or os.environ.get("BDA_TIMELINE_044_PROOF") != "TRUE":
        reject("explicit isolated GitHub-runner opt-in required")
    if plan.get("status") != "SYNTHETIC_INTERNAL_PROOF_ONLY":
        reject("not a private synthetic-only timeline")
    rights = plan.get("release", {})
    if any(rights.get(x) is not False for x in (
        "renderAuthorized", "publishAuthorized", "productionRenderAuthorized",
        "privateObservationFootageUsed", "originalBrandMediaUsed", "thirdPartyMusicUsed"
    )) or rights.get("planningOnly") is not True:
        reject("real film or media rights gate bypass")
    if plan.get("master", {}).get("frames") != 1800 or plan["master"].get("fps") != FPS:
        reject("60-second film profile changed")
    if plan.get("music", {}).get("kind") != "GENERATED_ORIGINAL_QA_TONE_ONLY":
        reject("unapproved external music")
    if report.get("scope") != "042_PRIVATE_AUDIO_QA_ONLY" or report.get("commercialFilmAuthorized") is not False:
        reject("042 voice upgraded without consent")
    if report.get("sourceSha256") != plan["speechEvidence"]["sourceSha256"] or (
        report.get("voice") != "bm_george" or report.get("sampleRate") != SAMPLE_RATE or
        report.get("channels") != 2):
        reject("incorrect 042 spoken voice/source")
    shots = plan.get("shots")
    if not isinstance(shots, list) or len(shots) != 9:
        reject("invalid nine-shot plan")
    if [s.get("id") for s in shots] != [f"S{i:02d}" for i in range(9)]:
        reject("shot sequence modified")
    for s in shots:
        if s.get("sourceStaged") is not False or s.get("sourceIncludedInProof") is not False:
            reject("private third-party or original brand content inside proxy")
    for index, shot in enumerate(shots[1:8]):
        real = report["segments"][index]
        slot = shot["narration"]
        if slot["id"] != real["id"] or slot["speechSamples"] != real["speechSamples"]:
            reject("re-generated 042 timing drift; re-approve before making movie")
        if slot["endFrame"] - slot["startFrame"] != math.ceil(real["speechSamples"] / SPF):
            reject("voice sample frame coverage mismatch")
        if slot["endFrame"] > shot["endFrame"]:
            reject("speech cut by a scene boundary")
    if shots[7]["narration"]["endFrame"] > shots[8]["startFrame"]:
        reject("narration running into silent outro")


def generate_sound(plan, voice_report):
    with wave.open(str(VOICE_PATH), "rb") as w:
        if (w.getframerate(), w.getnchannels(), w.getsampwidth(), w.getcomptype()) != (
            SAMPLE_RATE, 2, 2, "NONE"
        ):
            reject("042 source PCM profile mismatch")
        recorded = np.frombuffer(w.readframes(w.getnframes()), dtype="<i2").reshape(-1, 2)
    if hashlib.sha256(VOICE_PATH.read_bytes()).hexdigest() != voice_report.get("wavSha256"):
        reject("042 WAV differs from attached real 042 generation report")
    if recorded.shape[0] != plan["speechEvidence"]["samples"]:
        reject("synthesized 042 WAV differs in length from measured timing evidence")

    voice = np.zeros(TOTAL_SAMPLES, dtype=np.float32)
    for shot in plan["shots"][1:8]:
        slot = shot["narration"]
        source_start = slot["sourceStartSample"]
        source_end = slot["sourceEndSample"]
        target_start = slot["startFrame"] * SPF
        target_end = target_start + (source_end - source_start)
        if source_start < 0 or source_end > len(recorded) or target_end > 1620 * SPF:
            reject("voice source/target range is out of bounds")
        if np.any(voice[target_start:target_end]):
            reject("voice clips overlap")
        voice[target_start:target_end] = recorded[source_start:source_end, 0] / 32768.0

    # The 043 gain idea: lower a self-generated original sound-bed during
    # each genuine speech window, lift it again for the entire silent outro.
    positions = np.arange(TOTAL_SAMPLES, dtype=np.float64)
    sec = positions / SAMPLE_RATE
    depth = float(plan["music"]["duckDepth"])
    music_env = np.ones(TOTAL_SAMPLES, dtype=np.float32)
    for shot in plan["shots"][1:8]:
        v = shot["narration"]
        start = v["startFrame"] / FPS
        end = (v["startFrame"] * SPF + v["speechSamples"]) / SAMPLE_RATE
        local = np.maximum(0, np.minimum((sec - start + 0.35) / 0.35, 1))
        release = np.maximum(0, np.minimum((end + 0.45 - sec) / 0.45, 1))
        music_env *= (1 - depth * local * release).astype(np.float32)
    music_env *= np.minimum(sec / 0.5, 1).astype(np.float32)
    music_env *= np.maximum(0, np.minimum((60-sec) / 0.8, 1)).astype(np.float32)
    original_tone = (0.045 * np.sin(2 * np.pi * 176 * sec)
                    + 0.008 * np.sin(2 * np.pi * 92 * sec))
    merged = voice * 0.78 + original_tone * music_env
    peak = float(np.max(np.abs(merged)))
    if peak < 0.025 or peak > 0.88:
        reject("unsafe/silent 044 mixed narration peak")
    stereo = np.repeat(np.asarray(np.round(merged*32767), dtype="<i2")[:, None], 2, axis=1)
    with wave.open(str(QA_AUDIO), "wb") as w:
        w.setnchannels(2)
        w.setframerate(SAMPLE_RATE)
        w.setsampwidth(2)
        w.writeframes(stereo.tobytes())
    return {
        "actualVoiceWavSha256": voice_report["wavSha256"],
        "acceptedTimingEvidenceSha256": plan["speechEvidence"]["wavSha256"],
        "sourceSamples": len(recorded),
        "renderedSamples": len(merged),
        "voiceFirstFrame": plan["shots"][1]["narration"]["startFrame"],
        "voiceLastFrame": plan["shots"][7]["narration"]["endFrame"],
        "musicEndFrame": 1800,
        "samplePeak": round(peak, 6),
        "voiceProvider": "kokoro-onnx-local",
        "musicSource": "GENERATED_ORIGINAL_TEST_TONES_ONLY",
    }


def font(size):
    path = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
    if not Path(path).exists():
        return ImageFont.load_default()
    return ImageFont.truetype(path, size=size)


BIG = font(42)
MED = font(23)
SMALL = font(16)


def make_card(shot, n):
    ix = int(shot["id"][1:])
    palette = ["#0a344b", "#104458", "#0d3a49", "#104657", "#123e56",
               "#0e3d58", "#103b4d", "#0f4355", "#082b44"]
    im = Image.new("RGB", SIZE, palette[ix])
    draw = ImageDraw.Draw(im)
    t = n / FPS
    # Animate original vector rings/wave bars; NOT observational images.
    for k in range(6):
        x = int(300 + 195*math.sin(t * 0.2 + k*1.23))
        y = int(230 + 140*math.cos(t * 0.17 + k*.8))
        radius = 46 + (k % 3) * 23
        draw.ellipse((x-radius,y-radius,x+radius,y+radius), outline="#287891", width=3)
    for x in range(0,960,26):
        y = int(403+11*math.sin(t*0.8+x/50))
        draw.line((x,y,x+30,y+4),fill="#2e7888",width=3)
    draw.rounded_rectangle((46,72,914,390),radius=26,fill="#071a2d",
                           outline="#4bbfae",width=3)
    if ix in (0,8):
        kind = "BRAND CLIP REFERENCE - NOT INCLUDED"
        detail = "Original BlueDotAtlas media kept unchanged"
    elif shot["kind"] == "observational_video_reference":
        kind = "OFFICIAL FOOTAGE REFERENCE - NOT STAGED"
        detail = "Synthetic placeholder; NO NASA / NOAA frames"
    else:
        kind = "SCIENCE SCHEMATIC - PROXY VISUAL ONLY"
        detail = "Original placeholder; not an observed storm"
    draw.text((76,107),f"SHOT {shot['id']}",font=BIG,fill="#f2f9ff")
    draw.text((76,187),kind,font=MED,fill="#63d4c5")
    draw.text((76,231),detail,font=SMALL,fill="#d3e7ee")
    draw.text((76,294),f"Scene frames: {shot['startFrame']} - {shot['endFrame']}",font=SMALL,fill="#d3e7ee")
    draw.rounded_rectangle((48,440,912,491),radius=11,fill="#061929")
    draw.text((67,455),"INTERNAL 044 SYNTHETIC STORYBOARD - NOT THE PILOT FILM",
              font=SMALL,fill="#f9d89a")
    draw.rectangle((0,528,int(960*(n+1)/1800),540),fill="#4acbbb")
    return im


def draw_storyboard(plan):
    cmd = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-y",
           "-f", "rawvideo", "-pix_fmt", "rgb24", "-s:v", "960x540",
           "-r", "30", "-i", "pipe:0",
           "-i", str(QA_AUDIO), "-map", "0:v", "-map", "1:a",
           "-c:v", "libx264", "-preset", "ultrafast", "-crf", "27",
           "-pix_fmt", "yuv420p", "-r", "30", "-frames:v", "1800",
           "-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2",
           "-movflags", "+faststart", str(QA_VIDEO)]
    proc = subprocess.Popen(cmd, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL,
                            stderr=subprocess.PIPE)
    try:
        for frame in range(1800):
            active = [s for s in plan["shots"] if s["startFrame"] <= frame < s["endFrame"]]
            if not (1 <= len(active) <= 2):
                reject("visual gap/extra overlap at frame " + str(frame))
            image = make_card(active[0], frame)
            if len(active) == 2:
                nxt = active[1]
                progress = (frame - nxt["startFrame"] + 1) / 10
                if not 0 < progress < 1:
                    reject("unexpected crossfade progression")
                image = Image.blend(image, make_card(nxt, frame), progress)
            proc.stdin.write(image.tobytes())
        proc.stdin.close()
        if proc.wait(timeout=240) != 0:
            reject("FFmpeg 044 proxy failed: " + proc.stderr.read().decode(errors="replace")[-300:])
    except Exception:
        proc.kill()
        raise
    finally:
        if proc.poll() is None:
            proc.kill()
    print("044 SYNTHETIC STORYBOARD COMPLETE: 1800 frames / 30fps / 960x540 / AAC 48k stereo")


def main():
    plan = json.loads(PLAN_PATH.read_text(encoding="utf-8"))
    report = json.loads(VOICE_REPORT.read_text(encoding="utf-8"))
    source_guards(plan, report)
    ROOT_OUT.mkdir(parents=True, exist_ok=True)
    qa = generate_sound(plan, report)
    draw_storyboard(plan)
    qa.update({
        "scope": "SYNTHETIC_INTERNAL_PROOF_ONLY",
        "ownerReviewRequired": True,
        "commercialMusicApproved": False,
        "realFootageUsed": False,
        "realBrandMediaUsed": False,
        "publicationAuthorized": False,
        "totalFrames": 1800,
        "frameRate": 30,
        "previewSize": [960,540],
        "audioWavSha256": hashlib.sha256(QA_AUDIO.read_bytes()).hexdigest(),
        "videoMp4Sha256": hashlib.sha256(QA_VIDEO.read_bytes()).hexdigest(),
    })
    (ROOT_OUT/"044-render-evidence.json").write_text(json.dumps(qa,indent=2)+"\n")
    print("044 ACTUAL VOICE ALIGNED: 7 real measured 042 Kokoro excerpts, no segment cut")
    print("044 NO rights elevation, commercial soundtrack, actual source footage or brand files used.")


if __name__=="__main__":
    try:
        main()
    except Exception as exc:
        print("044 QA FAILED: "+type(exc).__name__+": "+str(exc)[:250],file=sys.stderr)
        raise SystemExit(1)
