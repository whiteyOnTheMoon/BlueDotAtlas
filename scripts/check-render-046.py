#!/usr/bin/env python3
"""046: run the independent 045 MP4/stream/full-decode gate on a fixed UUID-named QA file."""
import importlib.util
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
if len(sys.argv) != 2 or not re.fullmatch(r"[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}", sys.argv[1]):
    raise SystemExit("046 invalid fixed synthetic job id")
identifier = sys.argv[1]
source = ROOT / "scripts" / "check-export-045.py"
spec = importlib.util.spec_from_file_location("synthetic_045_media_checker", source)
if spec is None or spec.loader is None:
    raise SystemExit("046 045 media checker unavailable")
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.OUTPUT = ROOT / ".tmp-render-046" / (identifier + ".mp4")
module.REPORT = ROOT / ".tmp-render-046" / (identifier + ".json")
try:
    result = module.inspect()
    if result["scope"] != "SYNTHETIC_EXPORT_QA_ONLY" or result["publicationAuthorized"] is not False:
        raise ValueError("046 media rights gate changed")
except Exception:
    print("046 fixed synthetic MP4 failed independent QA", file=sys.stderr)
    raise SystemExit(1)
print("046 isolated synthetic 1080p video/audio, faststart, full decode: PASS")
