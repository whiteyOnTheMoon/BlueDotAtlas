#!/usr/bin/env python3
"""039: two verified public-agency originals for a PRIVATE, ephemeral CI test.

Never uploads media, writes to Git, changes 036 rights flags, or authorizes P60.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import urllib.request
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "assets/pilot/rights-manifest.json"
PRIVATE = ROOT / "assets/pilot/.private-039"
MAX_BYTES = 60_000_000

# Frozen from the real 036 source download evidence. Never follow redirects.
SOURCES = {
    "P60-VID-001": {
        "url": "https://eol.jsc.nasa.gov/Videos/CrewEarthObservationsVideos/videos/HurricaneOma_ISS058_2019-02/HurricaneOma_ISS058_2019-02.mp4",
        "size": 27140201,
        "sha256": "54ecdba5d5899fc7a2e8ee0f544359f59ddc45c13a26b919c3412b633416802c",
        "width": 1080,
        "height": 720,
    },
    "P60-VID-005": {
        "url": "https://oceanexplorer.noaa.gov/wp-content/uploads/2012/09/072121-highseas-1920x1080-1.mp4",
        "size": 5548939,
        "sha256": "e341bba65deafbf5857f7913af45cef74de2effe0e431323884e88f88574443b",
        "width": 1920,
        "height": 1080,
    },
}


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def validate_manifest(data: dict) -> None:
    if data.get("roadmap_id") != "036":
        raise ValueError("Expected 036 evidence")
    items = {item["asset_id"]: item for item in data["assets"]}
    for asset_id, expected in SOURCES.items():
        item = items.get(asset_id)
        if not item or item.get("download_url") != expected["url"]:
            raise ValueError("Original URL mismatch: " + asset_id)
        if item.get("rights_status") != "APPROVED":
            raise ValueError("Source-level rights not approved")
        if item.get("approval_scope") != "PRIVATE_INTERNAL_TEST_ONLY":
            raise ValueError("Never use this probe outside the private test scope")
        if item.get("source_audio_allowed") is not False:
            raise ValueError("Source soundtrack is not cleared")
        if item.get("approved_for_timeline") is not False or item.get("local_file") is not None:
            raise ValueError("Do not claim full-film/local media approvals from 039")
        if item.get("technical_original_bytes") != expected["size"]:
            raise ValueError("Original byte evidence changed")
        if item.get("technical_original_sha256") != expected["sha256"]:
            raise ValueError("Original SHA-256 evidence changed")
        url = urlsplit(expected["url"])
        if url.scheme != "https" or url.username or url.password or url.query or url.fragment:
            raise ValueError("Unsafe source URL")
        if url.hostname not in {"eol.jsc.nasa.gov", "oceanexplorer.noaa.gov"}:
            raise ValueError("Unapproved source host")


def check_original(path: Path, asset_id: str) -> None:
    expected = SOURCES[asset_id]
    if not path.is_file() or path.is_symlink():
        raise ValueError("Missing original or unsafe file: " + asset_id)
    if path.stat().st_size != expected["size"]:
        raise ValueError("Wrong bytes: " + asset_id)
    digest = hashlib.sha256()
    with path.open("rb") as source:
        while data := source.read(1024 * 1024):
            digest.update(data)
    if digest.hexdigest() != expected["sha256"]:
        raise ValueError("SHA-256 mismatch: " + asset_id)
    result = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=codec_name,width,height", "-of", "json", str(path)],
        check=True, text=True, capture_output=True, timeout=60,
    )
    stream = json.loads(result.stdout)["streams"][0]
    if (stream.get("codec_name"), stream.get("width"), stream.get("height")) != (
        "h264", expected["width"], expected["height"]
    ):
        raise ValueError("Wrong original video stream: " + asset_id)


def download_original(asset_id: str, target: Path) -> None:
    expected = SOURCES[asset_id]
    opener = urllib.request.build_opener(NoRedirect())
    request = urllib.request.Request(
        expected["url"], headers={"User-Agent": "BlueDotAtlas-039-private-probe/1.0"}
    )
    partial = target.with_suffix(".part")
    partial.unlink(missing_ok=True)
    count = 0
    try:
        with opener.open(request, timeout=45) as response, partial.open("xb") as out:
            if response.status != 200:
                raise ValueError("Unexpected HTTP response")
            header = response.headers.get("Content-Length")
            if header and int(header) > MAX_BYTES:
                raise ValueError("Remote declared size too large")
            mime = response.headers.get("Content-Type", "").split(";")[0].strip().lower()
            if mime not in {"video/mp4", "application/octet-stream", "binary/octet-stream"}:
                raise ValueError("Unexpected media type")
            while True:
                chunk = response.read(1024 * 1024)
                if not chunk:
                    break
                count += len(chunk)
                if count > MAX_BYTES:
                    raise ValueError("Source exceeds 60 MB cap")
                out.write(chunk)
        check_original(partial, asset_id)
        os.chmod(partial, 0o600)
        os.replace(partial, target)
        print("039 PRIVATE SOURCE VERIFIED:", asset_id, "bytes", count, flush=True)
    finally:
        partial.unlink(missing_ok=True)


def self_test(data: dict) -> None:
    validate_manifest(data)
    assert set(SOURCES) == {"P60-VID-001", "P60-VID-005"}
    assert NoRedirect().redirect_request(None, None, 302, "Redirect", {}, "https://evil.invalid/") is None
    for mutated in ("approval_scope", "technical_original_sha256", "source_audio_allowed", "approved_for_timeline"):
        clone = json.loads(json.dumps(data))
        asset = next(item for item in clone["assets"] if item["asset_id"] == "P60-VID-001")
        asset[mutated] = "PUBLIC" if mutated == "approval_scope" else True
        try:
            validate_manifest(clone)
        except ValueError:
            pass
        else:
            raise AssertionError("Missing private-test denial: " + mutated)
    print("039 INGEST POLICY PASS: official origins, hashes, private scope, no source audio")


def main() -> int:
    if len(sys.argv) != 2 or sys.argv[1] not in ("--self-test", "--ingest", "--check"):
        raise ValueError("Use --self-test, --ingest or --check")
    manifest = json.loads(MANIFEST.read_text(encoding="utf8"))
    if sys.argv[1] == "--self-test":
        self_test(manifest)
        return 0
    validate_manifest(manifest)
    if PRIVATE.is_symlink():
        raise ValueError("Refusing symlinked private root")
    if sys.argv[1] == "--ingest":
        if os.environ.get("BDA_039_PRIVATE_PROOF") != "TRUE":
            raise ValueError("Private ingest requires explicit isolated-runner opt-in")
        if os.environ.get("CI") != "true":
            raise ValueError("039 ingest is restricted to a disposable GitHub runner")
        PRIVATE.mkdir(mode=0o700, parents=False, exist_ok=True)
        for asset_id in SOURCES:
            download_original(asset_id, PRIVATE / (asset_id + ".mp4"))
    for asset_id in SOURCES:
        check_original(PRIVATE / (asset_id + ".mp4"), asset_id)
    print("039 PRIVATE MEDIA GATE PASS: exactly two verified originals; no media published")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, OSError, KeyError, IndexError, subprocess.CalledProcessError) as exc:
        print("039 PRIVATE MEDIA GATE BLOCKED:", type(exc).__name__, str(exc)[:160], file=sys.stderr)
        raise SystemExit(1)
