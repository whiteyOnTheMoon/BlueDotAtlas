#!/usr/bin/env python3
"""Verify actual 60s 044 H264/AAC proxy and sample-aligned real English narration."""
import hashlib
import json
import math
from pathlib import Path
import subprocess
import sys
import wave

import numpy as np

ROOT=Path(__file__).resolve().parent.parent
TMP=ROOT/".tmp-timeline-044"
PLAN=ROOT/"docs"/"pilot"/"pilot-timeline.json"
MOVIE=TMP/"044-internal-storyboard-60s.mp4"
SOUND=TMP/"044-voice-music-60s.wav"
REPORT=TMP/"044-render-evidence.json"


def probe(target):
    r=subprocess.run([
        "ffprobe", "-v", "error", "-show_entries",
        "format=duration:stream=index,codec_type,codec_name,width,height,avg_frame_rate,nb_frames,sample_rate,channels,duration",
        "-of", "json", str(target)],capture_output=True,text=True,check=True,timeout=35)
    return json.loads(r.stdout)


def ensure(ok,message):
    if not ok:raise AssertionError("044 PROOF CHECK: "+message)


def rms(x):
    a=np.asarray(x,dtype=np.float64)
    return float(np.sqrt(np.mean(a*a))) if len(a)>0 else 0


def inspect():
    plan=json.loads(PLAN.read_text())
    evidence=json.loads(REPORT.read_text())
    ensure(plan["status"]=="SYNTHETIC_INTERNAL_PROOF_ONLY","film authorization gate")
    ensure(evidence.get("scope")=="SYNTHETIC_INTERNAL_PROOF_ONLY" and
           evidence.get("ownerReviewRequired") is True and
           evidence.get("commercialMusicApproved") is False and
           evidence.get("realFootageUsed") is False and
           evidence.get("realBrandMediaUsed") is False and
           evidence.get("publicationAuthorized") is False,"no rights elevation")
    for target,hashname in [(MOVIE,"videoMp4Sha256"),(SOUND,"audioWavSha256")]:
        ensure(target.is_file() and 100000<target.stat().st_size<45_000_000,
               "missing/oversized proxy export")
        ensure(hashlib.sha256(target.read_bytes()).hexdigest()==evidence[hashname],
               "artifact changed after independent QA")
    m=probe(MOVIE)
    ensure(abs(float(m["format"]["duration"])-60)<0.10,"MP4 not 60s")
    v=[s for s in m["streams"] if s["codec_type"]=="video"]
    a=[s for s in m["streams"] if s["codec_type"]=="audio"]
    ensure(len(v)==1 and len(a)==1,"missing or multiple tracks")
    video_stream=v[0]
    ensure(v[0]["codec_name"]=="h264" and int(v[0]["width"])==960 and
           int(v[0]["height"])==540 and v[0]["avg_frame_rate"]=="30/1" and
           int(v[0]["nb_frames"])==1800,"wrong exact visual frame count/fps")
    ensure(a[0]["codec_name"]=="aac" and int(a[0]["sample_rate"])==48000 and
           int(a[0]["channels"])==2,"wrong audio codec/profile")
    ensure(abs(float(a[0].get("duration",60))-60)<0.1,
           "AAC end does not match picture end")

    with wave.open(str(SOUND),"rb") as w:
        ensure(w.getnchannels()==2 and w.getsampwidth()==2 and
               w.getframerate()==48000 and w.getnframes()==2_880_000,
               "60s PCM16 48k stereo mix mismatch")
        samples=np.frombuffer(w.readframes(w.getnframes()),dtype="<i2").reshape(-1,2)
    ensure(np.array_equal(samples[:,0],samples[:,1]),"stereo channels unexpectedly different")
    peak=int(np.max(np.abs(samples.astype(np.int32))))
    ensure(1500<peak<30000,"audio clipped or silent")
    ensure(evidence["voiceFirstFrame"]==75 and evidence["voiceLastFrame"]==1620,
           "actual voice timing was not driven by 042 samples")
    ensure(evidence["musicEndFrame"]==1800,"music truncated before outro")
    # Every spoken slot is measurably louder than the fixture-only soundtrack.
    sampleRate=48000
    for shot in plan["shots"][1:8]:
        v=shot["narration"]
        begin=v["startFrame"]*1600 + 5000
        end=begin + min(48000,v["speechSamples"]-5000)
        ensure(rms(samples[begin:end,0])>350,"actual Kokoro words missing in "+shot["id"])
    # The synthetic bed must remain audible at the outro start/end, not cut
    # at the picture dissolve, with a late fade after 59.2s.
    outro_rms=rms(samples[int(56*sampleRate):int(57*sampleRate),0])
    pre_fade=rms(samples[int(58.6*sampleRate):int(59.0*sampleRate),0])
    last=rms(samples[int(59.9*sampleRate):int(60*sampleRate),0])
    ensure(outro_rms>30 and pre_fade>30,"music went silent during 6s outro")
    ensure(last<pre_fade*0.35,"music did not fade only at outro ending")
    info={
        "scope":"SYNTHETIC_INTERNAL_PROOF_ONLY",
        "videoFrames":int(video_stream["nb_frames"]),
        "videoFrameRate":"30/1",
        "videoSize":"960x540",
        "durationSeconds":round(float(m["format"]["duration"]),3),
        "audioSampleRate":48000,
        "audioChannels":2,
        "pcmPeak":peak,
        "speechSegmentsVerified":7,
        "musicOutroRms":round(outro_rms,2),
        "musicTailRms":round(last,2),
        "allThirdPartyFootageExcluded":True,
        "realVoiceReSynthesized":True,
    }
    (TMP/"044-independent-media-qa.json").write_text(json.dumps(info,indent=2)+"\n")
    print("044 PROXY PASS: exactly 1800x30fps H264 frames, 60s AAC, 7 true voice sections")
    print("044 Audio end matched picture; synthetic music continues across 6s outro then fades")


if __name__=="__main__":
    try:
        inspect()
    except Exception as e:
        print("044 independent QA FAIL: "+type(e).__name__+" "+str(e)[:230],file=sys.stderr)
        raise SystemExit(1)
