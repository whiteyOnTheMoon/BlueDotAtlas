#!/usr/bin/env python3
"""045: strict, independently decoded 8s/1080p MP4 export quality gate.

Only the synthetic original testsrc2+sine QA export is accepted.
Never report a product-film export, license clearance or human playback review.
"""
import hashlib
import json
from pathlib import Path
import re
import subprocess
import struct
import sys

ROOT=Path(__file__).resolve().parent.parent
PRESET=ROOT/"render"/"preset-1080p.json"
OUTPUT=ROOT/".tmp-export-045"/"045-original-synthetic-1080p.mp4"
REPORT=ROOT/".tmp-export-045"/"045-export-qa.json"

class CheckFailed(ValueError):
    pass

def require(cond,reason):
    if not cond:
        raise CheckFailed("045 EXPORT QA: "+reason)

def mp4_top_boxes(filename):
    """Parse ISO base-media top-level atoms with seek, not naive substring search."""
    size=filename.stat().st_size
    require(100_000<size<85_000_000, "missing, empty or unbounded MP4")
    boxes=[]
    with filename.open("rb") as stream:
        pos=0
        while pos<size:
            require(size-pos>=8, "trailing damaged MP4 atom header")
            stream.seek(pos)
            header=stream.read(8)
            length,name=struct.unpack(">I4s",header)
            atom=name.decode("ascii",errors="replace")
            header_size=8
            if length==1:
                require(size-pos>=16, "truncated 64-bit MP4 atom header")
                length=struct.unpack(">Q",stream.read(8))[0]
                header_size=16
            elif length==0:
                length=size-pos
            require(length>=header_size and pos+length<=size, "invalid MP4 atom size")
            boxes.append(atom)
            pos+=length
    require(len(boxes)>=3 and boxes[0]=="ftyp", "not a valid ftyp-prefixed MP4")
    require(boxes.count("moov")==1 and boxes.count("mdat")==1, "missing or multiple moov/mdat atoms")
    require(boxes.index("moov")<boxes.index("mdat"), "faststart missing: moov is after mdat")
    require("moof" not in boxes, "fragmented MP4 not authorized by 045 preset")
    return boxes

def validate_probe_data(data,preset):
    """Pure metadata gate usable by tests without creating synthetic files."""
    require(preset.get("status")=="SYNTHETIC_EXPORT_QA_ONLY" and
            preset.get("filmExportAuthorized") is False and
            preset.get("publishAuthorized") is False and
            preset.get("sourcePolicy",{}).get("thirdPartyFootageAllowed") is False and
            preset.get("sourcePolicy",{}).get("realPilotTimelineUsed") is False,
            "preset rights flags switched on")
    streams=data.get("streams",[])
    video=[x for x in streams if x.get("codec_type")=="video"]
    audio=[x for x in streams if x.get("codec_type")=="audio"]
    require(len(streams)==2 and len(video)==1 and len(audio)==1, "exactly one video + one audio stream required")
    v=video[0]
    a=audio[0]
    require(v.get("codec_name")=="h264" and v.get("profile")=="High", "H264 High codec/profile missing")
    require(int(v.get("width",0))==1920 and int(v.get("height",0))==1080, "not full 1920x1080")
    require(v.get("pix_fmt")=="yuv420p", "8-bit 4:2:0 yuv420p required")
    require(v.get("avg_frame_rate")=="30/1" and v.get("r_frame_rate")=="30/1",
            "not constant 30/1 fps")
    require(int(v.get("nb_read_frames",0))==240, "not exactly 240 fully decoded video frames")
    require(v.get("sample_aspect_ratio")=="1:1", "pixel aspect ratio is not 1:1")
    require(all(v.get(k)=="bt709" for k in ("color_primaries","color_transfer","color_space")) and
            v.get("color_range")=="tv", "BT709 limited-range SDR color tags not explicit")
    require(a.get("codec_name")=="aac" and a.get("profile")=="LC", "not AAC-LC")
    require(int(a.get("sample_rate",0))==48000 and int(a.get("channels",0))==2 and
            a.get("channel_layout")=="stereo", "not 48kHz 2ch stereo")
    require(abs(float(data.get("format",{}).get("duration",0))-8.0)<=0.08,
            "movie duration is not exactly 8s (±80ms)")
    require(abs(float(a.get("duration",0))-8.0)<=0.08,
            "AAC does not end with 8-second picture")
    require(abs(float(v.get("duration",0))-8.0)<=0.08,
            "H264 video duration not 8s")
    require("mp4" in data.get("format",{}).get("format_name",""),
            "MP4 container not identified")
    return v,a

def run_checked(args,timeout=100):
    return subprocess.run(args,capture_output=True,text=True,timeout=timeout,check=True)

def inspect():
    preset=json.loads(PRESET.read_text(encoding="utf8"))
    require(OUTPUT.is_file(), "export proof missing")
    atoms=mp4_top_boxes(OUTPUT)
    ff=run_checked([
        "ffprobe","-v","error","-count_frames",
        "-show_entries",
        "format=format_name,duration,size:stream=codec_type,codec_name,profile,width,height,pix_fmt,"
        "sample_aspect_ratio,avg_frame_rate,r_frame_rate,nb_read_frames,nb_frames,field_order,"
        "color_primaries,color_transfer,color_space,color_range,sample_rate,channels,"
        "channel_layout,duration",
        "-of","json",str(OUTPUT),
    ],timeout=100)
    data=json.loads(ff.stdout)
    video,audio=validate_probe_data(data,preset)
    # Not merely a container header: every video and audio packet must decode.
    for mapped in ("0:v:0","0:a:0"):
        run_checked(["ffmpeg","-nostdin","-hide_banner","-loglevel","error",
            "-xerror","-err_detect","explode","-i",str(OUTPUT),
            "-map",mapped,"-f","null","-"],timeout=130)
    volume=run_checked(["ffmpeg","-nostdin","-hide_banner","-i",str(OUTPUT),
        "-map","0:a:0","-af","volumedetect","-f","null","-"],timeout=65)
    mean=re.search(r"mean_volume:\s*(-?[0-9.]+) dB",volume.stderr)
    maximum=re.search(r"max_volume:\s*(-?[0-9.]+) dB",volume.stderr)
    require(mean is not None and maximum is not None,"audio loudness couldn't be measured")
    mean_db=float(mean.group(1))
    max_db=float(maximum.group(1))
    require(-55<mean_db<-10 and -45<max_db<=0,"audible sample missing or audio clipped")
    report={
        "scope":"SYNTHETIC_EXPORT_QA_ONLY",
        "profileId":preset["id"],
        "originalSyntheticTestOnly":True,
        "realFilmRenderAuthorized":False,
        "publicationAuthorized":False,
        "thirdPartyMediaUsed":False,
        "brandOriginalsUsed":False,
        "newPaidServicesUsed":False,
        "fileSha256":hashlib.sha256(OUTPUT.read_bytes()).hexdigest(),
        "bytes":OUTPUT.stat().st_size,
        "format":data["format"]["format_name"],
        "durationSeconds":round(float(data["format"]["duration"]),3),
        "picture":{"codec":video["codec_name"],"profile":video["profile"],
            "width":1920,"height":1080,"frames":240,"fps":"30/1",
            "pixFmt":video["pix_fmt"],"colorPrimaries":video["color_primaries"],
            "transfer":video["color_transfer"],"matrix":video["color_space"]},
        "sound":{"codec":audio["codec_name"],"profile":audio["profile"],
            "hz":48000,"channels":2,"meanDb":mean_db,"maxDb":max_db},
        "mp4TopLevelAtoms":atoms,
        "faststart":True,
        "allVideoAndAudioDecoded":True,
        "ownerVisualReviewRequired":True
    }
    REPORT.write_text(json.dumps(report,indent=2)+"\n")
    print("045 REAL 1080p EXPORT PASS: 1920x1080 / 30fps / 240 frames / H264 High yuv420p BT709")
    print("045 AAC-LC 48kHz stereo / 8s / non-fragmented MP4 faststart / full video+audio decode")
    print("045 Rights scope: 8s original synthetic signal only. No actual P60 film exported.")
    return report

if __name__=="__main__":
    try:
        inspect()
    except (CheckFailed,KeyError,ValueError,subprocess.CalledProcessError,subprocess.TimeoutExpired,OSError) as e:
        print("045 QA FAILED: "+type(e).__name__+" "+str(e)[:260],file=sys.stderr)
        raise SystemExit(1)
