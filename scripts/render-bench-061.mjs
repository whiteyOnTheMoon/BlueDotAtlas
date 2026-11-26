#!/usr/bin/env node
// Roadmap 061: ~9.5-minute VPS benchmark of the Scene-Director renderer with
// streaming + resume (062). Runs INSIDE the offline pilot046ffmpeg container:
//   /source  read-only private stage (.private-046/stage)
//   /review  private benchmark folder (0700); rerunning resumes after a stop
// Modes:
//   --preflight  check assets (V2 SHA/size, source lengths) and the plan; no writes
//   --render     render + benchmark report (needs BDA_BENCH_061_PRIVATE=TRUE)
// Technical load test only: clips repeat, silent soundtrack, never published.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { benchScene061 } from './bench-061-plan.mjs';
import { checkAssets } from './render-pilot-v2.mjs';
import { segments, timeline } from './scene-render-v1-plan.mjs';

const memMiB = () => Number(readFileSync('/proc/meminfo', 'utf8').match(/^MemAvailable:\s+(\d+)/m)?.[1] ?? 0) / 1024;

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2];
  try {
    assert.ok(process.argv.length === 3 && ['--preflight', '--render'].includes(mode), 'use --preflight or --render');
    const stageRoot = process.env.BDA_BENCH_061_STAGE_ROOT ?? '/source';
    const out = process.env.BDA_BENCH_061_OUTPUT_ROOT ?? '/review';
    const doc = benchScene061();
    const shots = timeline(doc);
    const parts = segments(shots);
    console.log(`061 BENCH PLAN: ${doc.durationFrames} frames (${(doc.durationFrames / 1800).toFixed(2)} min), ${shots.length} shots, ${parts.length} parts`);
    const assets = checkAssets(doc, stageRoot, '061 BENCH');
    if (mode === '--preflight') {
      console.log('061 BENCH PREFLIGHT PASS: no rendering, no writes');
    } else {
      assert.equal(process.env.BDA_BENCH_061_PRIVATE, 'TRUE', 'explicit BDA_BENCH_061_PRIVATE=TRUE required');
      const st = statSync(out);
      assert.ok(st.isDirectory() && (st.mode & 0o077) === 0, 'output must be a private 0700 directory');
      // Silent soundtrack of the exact film length; created once so a resume keeps the same input.
      const silence = join(out, 'bench-061-silence.wav');
      if (!existsSync(silence)) {
        const p = spawnSync('ffmpeg', ['-nostdin', '-v', 'error', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo',
          '-t', (doc.durationFrames / 30).toFixed(6), '-c:a', 'pcm_s16le', '-n', silence], { encoding: 'utf8', timeout: 120_000 });
        assert.equal(p.status, 0, 'silent track: ' + (p.stderr ?? '').slice(-300));
      }
      const { renderScene } = await import('./render-scene-v1.mjs');
      const started = Date.now();
      let minMem = memMiB();
      const timeline061 = [];
      const { final, receipt } = renderScene({
        doc, assets, narration: silence, introAudio: assets['brand-intro'].file, out,
        onProgress: (k, n) => {
          minMem = Math.min(minMem, memMiB());
          const elapsed = (Date.now() - started) / 1000;
          timeline061.push({ part: k, seconds: Math.round(elapsed) });
          if (k % 5 === 0 || k === n) console.log(`061 BENCH PROGRESS ${k}/${n} parts after ${Math.round(elapsed / 60)} min`);
        },
      });
      const seconds = (Date.now() - started) / 1000;
      const report = {
        roadmap: '061', sceneId: doc.id, filmSeconds: doc.durationFrames / 30, shots: shots.length, parts: parts.length,
        resumedParts: receipt.resumedParts, wallSeconds: Math.round(seconds),
        secondsPerFilmMinute: Math.round(seconds / (doc.durationFrames / 1800)),
        minMemAvailableMiBSeenInContainer: Math.round(minMem), bytes: statSync(final).size, sha256: receipt.sha256,
        progress: timeline061, publicationAuthorized: false,
      };
      writeFileSync(join(out, 'bench-061-report.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
      console.log(`061 BENCH PASS: ${(doc.durationFrames / 1800).toFixed(2)} min film in ${Math.round(seconds / 60)} min wall time; report bench-061-report.json`);
    }
  } catch (error) {
    console.error('061 BENCH NO-GO: ' + String(error?.message ?? error).slice(0, 600));
    process.exitCode = 1;
  }
}
