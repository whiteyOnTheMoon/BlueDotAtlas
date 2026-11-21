#!/usr/bin/env python3
"""046 private 60s output: FFprobe metadata gate only; never approves publishing."""
import json
import math
import sys


def require(condition, reason):
    if not condition:
        raise ValueError("046 PRIVATE MP4 NO-GO: " + reason)


def validate_probe(data):
    streams = data.get("streams", [])
    videos = [item for item in streams if item.get("codec_type") == "video"]
    audios = [item for item in streams if item.get("codec_type") == "audio"]
    require(len(videos) == 1 and len(audios) == 1, "expected one video and one audio stream")
    video, audio = videos[0], audios[0]
    require(video.get("codec_name") == "h264", "expected H.264")
    require((video.get("width"), video.get("height")) == (1920, 1080), "expected 1920x1080")
    require(video.get("pix_fmt") == "yuv420p", "expected yuv420p")
    require(all(video.get(key) == "bt709" for key in ("color_primaries", "color_transfer", "color_space")), "expected BT.709 primaries/transfer/matrix")
    require(video.get("avg_frame_rate") == "30/1", "expected 30 fps")
    require(video.get("nb_frames") == "1800", "expected 1800 frames")
    require(audio.get("codec_name") == "aac", "expected AAC audio")
    require(audio.get("sample_rate") == "48000", "expected 48kHz")
    require(audio.get("channels") == 2, "expected stereo")
    info = data.get("format", {})
    duration = float(info.get("duration", "nan"))
    size = int(info.get("size", 0))
    require(math.isfinite(duration) and 59.9 <= duration <= 60.3, "expected 60s")
    require(100000 < size < 838860800, "MP4 size out of bounds")


if __name__ == "__main__":
    try:
        validate_probe(json.load(sys.stdin))
        print("046 PRIVATE MP4 FFPROBE PASS: 1800f 1080p30 H.264 + 48kHz stereo AAC")
    except (OSError, ValueError, KeyError, TypeError, json.JSONDecodeError) as exc:
        print("046 PRIVATE MP4 NO-GO: " + str(exc)[:200], file=sys.stderr)
        sys.exit(1)
