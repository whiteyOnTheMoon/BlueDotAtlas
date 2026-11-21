#!/usr/bin/env python3
"""Verify bounded private 046 HD reference transcode and emit local SHA evidence.

Input: ffprobe JSON on stdin. Only source/media hashes (no private bytes) in output.
"""
import json
import re
import sys


def verify(probe, proxy_sha, original_sha):
    if not re.fullmatch(r"[0-9a-f]{64}", proxy_sha):
        raise ValueError("invalid proxy SHA256")
    if not re.fullmatch(r"[0-9a-f]{64}", original_sha):
        raise ValueError("invalid original SHA256")
    streams = probe.get("streams")
    if not isinstance(streams, list):
        raise ValueError("missing streams")
    videos = [s for s in streams if s.get("codec_type") == "video"]
    audios = [s for s in streams if s.get("codec_type") == "audio"]
    if len(videos) != 1 or audios or len(streams) != 1:
        raise ValueError("proxy must have exactly one video stream and no audio")
    video = videos[0]
    if (video.get("codec_name") != "h264" or
            video.get("width") != 1920 or video.get("height") != 1080 or
            video.get("pix_fmt") != "yuv420p"):
        raise ValueError("proxy is not H.264 1920x1080 yuv420p")
    duration = float(probe.get("format", {}).get("duration", 0))
    if not 34 <= duration <= 36:
        raise ValueError("proxy duration differs from original 34.8348s")
    return {
        "schema": 1,
        "assetId": "P60-VID-003",
        "originalSha256": original_sha,
        "proxySha256": proxy_sha,
        "codec": "h264",
        "width": 1920,
        "height": 1080,
        "pixFmt": "yuv420p",
        "videoStreams": 1,
        "audioStreams": 0,
        "durationSeconds": duration,
    }


if __name__ == "__main__":
    try:
        if len(sys.argv) != 3:
            raise ValueError("expected proxy and original SHA256 arguments")
        print(json.dumps(verify(json.load(sys.stdin), sys.argv[1], sys.argv[2]),
                         sort_keys=True, indent=2))
    except (ValueError, TypeError, KeyError, json.JSONDecodeError) as exc:
        print("046 PRIVATE HD PROXY NO-GO: " + str(exc), file=sys.stderr)
        sys.exit(1)
