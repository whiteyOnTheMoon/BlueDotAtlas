#!/usr/bin/env python3
"""046 FFmpeg/SVG prototype: measured 1080p peak-RSS guard for the 512 MiB cap.

Synthetic only (lavfi testsrc2, generated SVG overlay); no private media.
Runs the heaviest per-part operations of render-pilot-ffmpeg-046.mjs at full
1920x1080 with the same single-thread options and asserts each child's peak
RSS stays well below the container cap (512 MiB) - leaving room for the
node parent (~40 MiB) and page cache.
"""
import os
import shutil
import subprocess
import sys
import tempfile

CAP_MIB = 512
LIMIT_MIB = 320  # each child must stay below this (cap minus parent + headroom)
COMMON = ["-nostdin", "-hide_banner", "-loglevel", "error", "-threads", "1",
          "-filter_threads", "1", "-filter_complex_threads", "1"]
VIDOPTS = ["-c:v", "libx264", "-preset", "ultrafast", "-crf", "28", "-threads:v", "1",
           "-pix_fmt", "yuv420p", "-an"]
OVERLAY_SVG = (
    '<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">'
    '<rect x="155" y="814" width="1555" height="135" rx="9" fill="#021934" opacity="0.90"/>'
    '<text x="180" y="866" font-size="34" fill="#f2f9ff" font-family="DejaVu Sans">Synthetic caption</text>'
    '<rect x="1250" y="32" width="620" height="54" fill="#021934" opacity="0.87"/></svg>')


MEASURE = (
    "import resource,subprocess,sys\n"
    "r=subprocess.run(sys.argv[1:],stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)\n"
    "sys.stderr.write(r.stderr.decode()[-500:])\n"
    "print(resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss)\n"
    "sys.exit(r.returncode)\n")


def peak(label, args, work):
    # Fresh interpreter per command: RUSAGE_CHILDREN is a running maximum,
    # so measuring in-process would attribute earlier (setup) peaks.
    proc = subprocess.run([sys.executable, "-I", "-c", MEASURE, *args], cwd=work,
                          capture_output=True, text=True, timeout=300, check=False)
    if proc.returncode != 0:
        sys.exit(f"046 FFMPEG MEMORY: {label} failed: {proc.stderr[-500:]}")
    mib = int(proc.stdout.strip()) / 1024
    print(f"046 FFMPEG MEMORY {label}: peak RSS {mib:.0f} MiB")
    if mib >= LIMIT_MIB:
        sys.exit(f"046 FFMPEG MEMORY FAIL: {label} {mib:.0f} MiB >= {LIMIT_MIB} MiB "
                 f"(container cap {CAP_MIB} MiB)")
    return mib


def main():
    work = tempfile.mkdtemp(prefix="ff046-mem-")
    try:
        os.chmod(work, 0o700)
        subprocess.run(["ffmpeg", *COMMON, "-f", "lavfi", "-i",
                        "testsrc2=size=1920x1080:rate=30:duration=4", "-c:v", "libx264",
                        "-preset", "veryfast", "-pix_fmt", "yuv420p", "src.mp4"],
                       cwd=work, check=True, timeout=300)
        with open(os.path.join(work, "ov.svg"), "w", encoding="utf-8") as handle:
            handle.write(OVERLAY_SVG)
        peaks = [
            peak("rsvg 1080p", ["rsvg-convert", "--width", "1920", "--height", "1080",
                                "--output", "ov.png", "ov.svg"], work),
            peak("footage 1080p seek+lanczos+overlay",
                 ["ffmpeg", *COMMON, "-ss", "1", "-i", "src.mp4", "-loop", "1", "-framerate", "30",
                  "-i", "ov.png", "-filter_complex",
                  "[0:v]fps=30,scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,"
                  "crop=1920:1080,setsar=1,format=yuv420p[base];"
                  "[base][1:v]overlay=0:0:shortest=1,format=yuv420p[out]",
                  "-map", "[out]", "-frames:v", "60", *VIDOPTS, "part.mp4"], work),
            peak("blend 1080p", ["ffmpeg", *COMMON, "-i", "part.mp4", "-i", "part.mp4",
                                 "-filter_complex",
                                 "[0:v][1:v]blend=all_expr='A*0.5+B*0.5',format=yuv420p[v]",
                                 "-map", "[v]", "-frames:v", "9", *VIDOPTS, "blend.mp4"], work),
        ]
        print(f"046 FFMPEG MEMORY PASS: max child peak {max(peaks):.0f} MiB < {LIMIT_MIB} MiB "
              f"(512 MiB container cap)")
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()
