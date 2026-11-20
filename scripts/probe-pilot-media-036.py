#!/usr/bin/env python3
"""036: bounded ephemeral evidence only, never authorizes publishing, production, or timeline use.

The only two allowable downloads are exactly the original NOAA MP4 URLs recorded
in the approved source catalogue. No redirects, artifacts, VPS, keys, or uploads.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
from urllib.parse import urlsplit

MAX_BYTES = 100_000_000
CHUNK_BYTES = 1024 * 1024
SOURCE_URLS = {
    "P60-VID-002": "https://nesdis-prod.s3.amazonaws.com/2024-08/2024_08_22_Hurricane-Ernesto-NO_TEXT.mp4",
    "P60-VID-003": "https://www.omao.noaa.gov/sites/default/files/2024-09/09252024%20N43%20Eye%20of%20Helene%20Credit%20Nick%20Underwood.mp4",
}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # A redirect could silently leave the verified official host.


def validate_url(asset_id: str, url: str) -> None:
    if asset_id not in SOURCE_URLS or url != SOURCE_URLS[asset_id]:
        raise ValueError("Only exactly catalogued NOAA source URLs are permitted")
    parts = urlsplit(url)
    if parts.scheme != "https" or parts.username or parts.password or parts.fragment:
        raise ValueError("Source must be credential-free HTTPS")
    if parts.hostname not in ("nesdis-prod.s3.amazonaws.com", "www.omao.noaa.gov"):
        raise ValueError("Source host is not whitelisted")


def run_probe(asset_id: str, url: str, folder: Path) -> dict:
    result: dict = {
        "asset_id": asset_id,
        "url": url,
        "result": "NO_BYTE_PROOF",
        "max_bytes": MAX_BYTES,
        "sha256": None,
        "streams": None,
        "human_visual_rights_review": False,
        "approved_for_timeline": False,
    }
    destination = folder / (asset_id + ".mp4")
    try:
        validate_url(asset_id, url)
        request = urllib.request.Request(
            url,
            headers={"User-Agent": "BlueDotAtlas-M03-036-ephemeral-metadata-audit/1.0"},
        )
        opener = urllib.request.build_opener(NoRedirect())
        sha = hashlib.sha256()
        size = 0
        with opener.open(request, timeout=45) as source, destination.open("wb") as target:
            if source.status != 200:
                raise ValueError("Unexpected HTTP status " + str(source.status))
            declared = source.headers.get("Content-Length")
            if declared:
                result["remote_declared_bytes"] = int(declared)
            if declared and int(declared) > MAX_BYTES:
                raise ValueError("REMOTE_TOO_LARGE: declared size exceeds bounded probe")
            content_type = source.headers.get("Content-Type", "")
            result["http_content_type"] = content_type.split(";")[0].strip()
            if result["http_content_type"].lower() not in (
                "video/mp4", "application/octet-stream", "binary/octet-stream"
            ):
                raise ValueError("Source did not return an MP4-compatible media type")
            while True:
                chunk = source.read(CHUNK_BYTES)
                if not chunk:
                    break
                size += len(chunk)
                if size > MAX_BYTES:
                    raise ValueError("REMOTE_TOO_LARGE: streamed size exceeds bounded probe")
                sha.update(chunk)
                target.write(chunk)
        if not size:
            raise ValueError("EMPTY_MEDIA_FILE")
        probe = subprocess.run(
            [
                "ffprobe", "-v", "error",
                "-show_entries",
                "format=duration,size,format_name:stream=index,codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,sample_rate,channels",
                "-of", "json", str(destination),
            ],
            capture_output=True, text=True, timeout=50, check=True,
        )
        metadata = json.loads(probe.stdout)
        streams = metadata.get("streams", [])
        if not any(stream.get("codec_type") == "video" for stream in streams):
            raise ValueError("NO_VIDEO_STREAM")
        result.update({
            "result": "BYTE_PROOF_OK_NOT_RIGHTS_APPROVED",
            "byte_count": size,
            "sha256": sha.hexdigest(),
            "ffprobe": metadata,
            "streams": len(streams),
        })
        # A one-second sample is only a technical check, not visual review of the film.
        decoded = subprocess.run(
            ["ffmpeg", "-hide_banner", "-nostdin", "-v", "error", "-xerror",
             "-i", str(destination), "-t", "1", "-an", "-f", "null", "-"],
            capture_output=True, text=True, timeout=60, check=False,
        )
        result["one_second_decode_ok"] = decoded.returncode == 0
        if decoded.returncode != 0:
            result["result"] = "SAMPLE_DECODE_FAILED"
        return result
    except Exception as exc:
        # No secrets in these two fixed public URLs; never emit a response body or media.
        result["error_type"] = type(exc).__name__
        result["error"] = str(exc)[:240]
        return result
    finally:
        destination.unlink(missing_ok=True)


def self_test() -> None:
    assert len(SOURCE_URLS) == 2
    assert MAX_BYTES == 100_000_000
    for asset_id, url in SOURCE_URLS.items():
        validate_url(asset_id, url)
        for bad in (
            url.replace("https://", "http://", 1),
            "https://evil.invalid/video.mp4",
            url.replace("https://", "https://a:b@", 1),
            url + "#unreviewed",
        ):
            try:
                validate_url(asset_id, bad)
            except ValueError:
                pass
            else:
                raise AssertionError("Unsafe media URL was not rejected")
    assert NoRedirect().redirect_request(None, None, 302, "Moved", {}, "https://evil.invalid/") is None
    print("PASS 036: two fixed NOAA URLs; 8 invalid URL variants; redirects blocked; cap 100 MB")


def main() -> int:
    if len(sys.argv) == 2 and sys.argv[1] == "--self-test":
        self_test()
        return 0
    if len(sys.argv) != 2 or sys.argv[1] != "--probe":
        print("Use --self-test or --probe", file=sys.stderr)
        return 2
    if os.environ.get("BDA_036_EPHEMERAL_PROBE") != "TRUE":
        print("Refusing network access without explicit ephemeral CI gate", file=sys.stderr)
        return 2
    with tempfile.TemporaryDirectory(prefix="bda036-ephemeral-") as tmp:
        for asset_id, url in SOURCE_URLS.items():
            evidence = run_probe(asset_id, url, Path(tmp))
            print("BDA-036-PROBE-RESULT " + json.dumps(evidence, sort_keys=True), flush=True)
    print("BDA-036-PROBE-COMPLETE: files deleted; no media artifact uploaded; NO timeline approval")
    return 0  # Missing evidence is reported, never misrepresented as license approval.


if __name__ == "__main__":
    raise SystemExit(main())
