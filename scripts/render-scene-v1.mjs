#!/usr/bin/env node
// Scene-Director V1 renderer (Roadmap 057/058 + 055 infographic build).
// Renders a validated scene document with bounded, sequential, single-thread
// FFmpeg steps: per-shot render (camera move + fading overlays) -> exact
// body/blend parts (crossfade, dip) -> copy-concat with exact timestamps ->
// one AAC mix (narration + brand intro sound). Private output only.
//
// Usage:
//   node scripts/render-scene-v1.mjs --scene S.json --assets A.json --narration N.wav --out DIR
//   node scripts/render-scene-v1.mjs --synthetic           (CI: generated media only)
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmodSync, closeSync, existsSync, lstatSync, mkdirSync, mkdtempSync, openSync, readdirSync, readFileSync, readSync, renameSync, rmSync,
  statSync, writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSceneDocument } from '../packages/core/dist/scene-schema/v1.js';
import { JOIN_TIMESTAMPS046 } from './pilot-ffmpeg-046-plan.mjs';
import { FPS, H, W, blendExpr, cameraFilter, infographicSvg, overlayFade, overlaySvg, segments, shotsStillNeeded, timeline } from './scene-render-v1-plan.mjs';

const common = ['-nostdin', '-hide_banner', '-loglevel', 'error', '-threads', '1', '-filter_threads', '1', '-filter_complex_threads', '1'];
const lossless = ['-c:v', 'libx264', '-preset', 'ultrafast', '-qp', '0', '-threads:v', '1', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-an'];
// No B-frames: the exact-timestamp join sets PTS = DTS = frame index (JOIN_TIMESTAMPS046).
const delivery = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-bf', '0', '-threads:v', '1', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', '-an'];
const sec = (frames) => (frames / FPS).toFixed(6);

function run(bin, args, ms = 900_000) {
  const p = spawnSync(bin, args, { encoding: 'utf8', timeout: ms, maxBuffer: 1 << 20, env: { PATH: process.env.PATH ?? '/usr/bin:/bin' } });
  if (p.error || p.status !== 0) throw new Error(`${bin} failed (${p.status}): ${(p.stderr ?? '').slice(-900)}`);
  return p.stdout ?? '';
}
const probe = (file) => JSON.parse(run('ffprobe', ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file], 60_000));
const videoFrames = (file) => Number(probe(file).streams.find((s) => s.codec_type === 'video').nb_frames);

/** Streaming SHA-256 (films can exceed the container's memory cap). */
export function sha256File(path) {
  const hash = createHash('sha256');
  const buffer = Buffer.alloc(1 << 20);
  const fd = openSync(path, 'r');
  try {
    for (let n; (n = readSync(fd, buffer, 0, buffer.length, null)) > 0;) hash.update(buffer.subarray(0, n));
  } finally {
    closeSync(fd);
  }
  return hash.digest('hex');
}

/**
 * Fingerprint of everything a render depends on. A resumed render must match
 * it exactly; otherwise the stale work folder is refused (never silently mixed).
 */
export function renderFingerprint({ doc, assets, narration, introAudio, profile }) {
  const fileId = (f) => (f ? `${f}:${statSync(f).size}:${Math.floor(statSync(f).mtimeMs)}` : null);
  return createHash('sha256').update(JSON.stringify({
    renderer: RENDERER_VERSION, doc, profile,
    assets: Object.fromEntries(Object.entries(assets).sort().map(([id, a]) => [id, fileId(a.file)])),
    narration: fileId(narration), introAudio: fileId(introAudio),
  })).digest('hex');
}

const RENDERER_VERSION = 'scene-v1.1-streaming';

/**
 * Render a scene document (057/058/055) with bounded disk use and resume (062):
 * shots are rendered one after another, each shot's lossless intermediate is
 * deleted as soon as its parts exist, finished parts are kept (atomic rename)
 * in `out/.work-scene-v1/`, and a rerun with identical inputs continues at the
 * first missing part. The work folder is removed only after a passing film.
 */
export function renderScene({ doc, assets, narration, introAudio, out, delivery: profile = delivery, onProgress = () => {} }) {
  const valid = validateSceneDocument(doc);
  assert.ok(valid.ok, valid.ok ? '' : valid.errors.join('\n'));
  const shots = timeline(valid.document);
  const parts = segments(shots);
  const dataRefs = new Map(valid.document.dataRefs.map((d) => [d.id, d]));
  const total = valid.document.durationFrames;
  const final = join(out, 'scene-v1.mp4');
  assert.ok(!existsSync(final), 'refusing to overwrite ' + final);

  const work = join(out, '.work-scene-v1');
  const fingerprint = renderFingerprint({ doc: valid.document, assets, narration, introAudio, profile });
  const stampFile = join(work, 'fingerprint.txt');
  if (existsSync(work)) {
    const st = lstatSync(work);
    assert.ok(st.isDirectory() && !st.isSymbolicLink(), 'work folder must be a real directory');
    const previous = existsSync(stampFile) ? readFileSync(stampFile, 'utf8').trim() : '';
    assert.equal(previous, fingerprint, 'work folder belongs to a different render (inputs changed); refusing to resume');
    for (const name of readdirSync(work)) if (name.includes('.tmp')) rmSync(join(work, name), { recursive: true, force: true });
  } else {
    mkdirSync(work, { mode: 0o700 });
    writeFileSync(stampFile, fingerprint + '\n', { mode: 0o600 });
  }
  const partFile = (k) => join(work, `part-${String(k).padStart(4, '0')}.mp4`);
  const shotFile = (i) => join(work, `shot-${String(i).padStart(4, '0')}.mp4`);
  const done = new Set(parts.map((_, k) => k).filter((k) => existsSync(partFile(k))));
  const resumed = done.size;
  if (resumed) console.log(`SCENE V1 RESUME: ${resumed}/${parts.length} parts already finished`);
  const need = shotsStillNeeded(parts, done);

  // Atomic output: write to a .tmp name, check frames, then rename.
  const produce = (file, frames, args, label) => {
    const tmp = file.replace(/\.mp4$/, '.tmp.mp4');
    rmSync(tmp, { force: true });
    run('ffmpeg', [...args, '-n', tmp], Math.max(900_000, frames * 2_000));
    assert.equal(videoFrames(tmp), frames, `${label}: expected ${frames} frames (source too short?)`);
    renameSync(tmp, file);
  };

  const renderShot = (i) => {
    const shot = shots[i];
    const n = shot.renderFrames;
    const inputs = [];
    let chain;
    const scratch = join(work, `shot-${i}.tmp`);
    rmSync(scratch, { recursive: true, force: true });
    mkdirSync(scratch, { mode: 0o700 });
    try {
      if (shot.kind === 'infographic' || (shot.kind === 'text_card' && shot.assetIds.length === 0)) {
        const svg = join(scratch, 'f.svg');
        for (let f = 0; f < n; f++) {
          writeFileSync(svg, shot.kind === 'infographic'
            ? infographicSvg(shot, dataRefs, Math.min(f, shot.frames - 1))
            : `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#071522"/></svg>`);
          run('rsvg-convert', ['--width', String(W), '--height', String(H), '--output', join(scratch, `f-${String(f).padStart(5, '0')}.png`), svg], 30_000);
        }
        inputs.push('-framerate', String(FPS), '-i', join(scratch, 'f-%05d.png'));
        chain = `[0:v]format=yuv420p,setsar=1[base]`;
      } else {
        const asset = assets[shot.assetIds[0]];
        assert.ok(asset && existsSync(asset.file), `missing staged asset ${shot.assetIds[0]}`);
        inputs.push('-ss', sec(shot.assetInFrame ?? 0), '-i', asset.file);
        const fit = `fps=${FPS},scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},setsar=1`;
        const camera = shot.kind.startsWith('brand_') ? '' : ',' + cameraFilter(shot.animation, n);
        // The brand intro is exactly its own length (V14); its outgoing blend
        // frames hold the final logo frame instead of needing extra source.
        const hold = shot.kind === 'brand_intro' && shot.tail ? `,tpad=stop_mode=clone:stop=${shot.tail}` : '';
        chain = `[0:v]${fit}${hold}${camera},format=yuv420p[base]`;
      }
      let last = 'base';
      (shot.overlays ?? []).forEach((overlay, oi) => {
        const png = join(scratch, `ov-${oi}.png`);
        const svg = png.replace(/\.png$/, '.svg');
        writeFileSync(svg, overlaySvg(overlay));
        run('rsvg-convert', ['--width', String(W), '--height', String(H), '--output', png, svg], 30_000);
        inputs.push('-loop', '1', '-framerate', String(FPS), '-i', png);
        const f = overlayFade(overlay);
        chain += `;[${oi + 1}:v]${f.filter}[o${oi}];[${last}][o${oi}]overlay=0:0:shortest=1:enable='${f.enable}'[v${oi}]`;
        last = `v${oi}`;
      });
      produce(shotFile(i), n, [...common, ...inputs, '-filter_complex', chain + `;[${last}]format=yuv420p[out]`, '-map', '[out]',
        '-frames:v', String(n), ...lossless], `shot ${shot.id}`);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
    console.log(`SCENE V1 SHOT ${i + 1}/${shots.length} ${shot.id} ${shot.kind}: ${n}f`);
  };

  const renderPart = (k) => {
    const part = parts[k];
    if (part.kind === 'body') {
      const a = part.offset;
      produce(partFile(k), part.frames, [...common, '-i', shotFile(part.shot), '-vf', `trim=start_frame=${a}:end_frame=${a + part.frames},setpts=PTS-STARTPTS`,
        '-frames:v', String(part.frames), ...profile], `part ${k}`);
    } else {
      const fa = part.fromOffset;
      produce(partFile(k), part.frames, [...common, '-i', shotFile(part.from), '-i', shotFile(part.to), '-filter_complex',
        `[0:v]trim=start_frame=${fa}:end_frame=${fa + part.frames},setpts=PTS-STARTPTS,format=gbrp[a];` +
        `[1:v]trim=start_frame=0:end_frame=${part.frames},setpts=PTS-STARTPTS,format=gbrp[b];` +
        `[a][b]blend=all_expr='${blendExpr(part.type, part.frames)}',format=yuv420p[v]`,
        '-map', '[v]', '-frames:v', String(part.frames), ...profile], `part ${k}`);
    }
    done.add(k);
    onProgress(done.size, parts.length);
    console.log(`SCENE V1 PART ${done.size}/${parts.length}`);
  };

  // 1+2) Stream shot by shot: at most two lossless shots on disk at a time.
  shots.forEach((_, i) => {
    if (need.has(i) && !existsSync(shotFile(i))) renderShot(i);
    parts.forEach((part, k) => {
      const last = part.kind === 'body' ? part.shot : part.to;
      if (last === i && !done.has(k)) renderPart(k);
    });
    if (i > 0) rmSync(shotFile(i - 1), { force: true });
  });
  rmSync(shotFile(shots.length - 1), { force: true });
  assert.equal(done.size, parts.length, 'every part rendered');

  // 3) Copy-concat with exact 30 fps timestamps (bookworm FFmpeg 5.1 safe).
  const list = join(work, 'parts.ffconcat');
  writeFileSync(list, 'ffconcat version 1.0\n' + parts.map((_, k) => `file '${partFile(k)}'`).join('\n') + '\n');
  const joined = join(work, 'joined.mp4');
  rmSync(joined, { force: true });
  run('ffmpeg', [...common, '-f', 'concat', '-safe', '0', '-i', list, '-map', '0:v:0', '-an', '-c:v', 'copy',
    ...JOIN_TIMESTAMPS046, '-movflags', '+faststart', '-n', joined]);
  const jv = probe(joined).streams.find((s) => s.codec_type === 'video');
  assert.equal(Number(jv.nb_frames), total);
  assert.equal(jv.avg_frame_rate, '30/1');

  // 4) One AAC mix: narration (0.78) + brand intro sound faded over the intro's last 9 frames.
  const intro = shots[0];
  const fadeStart = sec(intro.frames - 9);
  const audioInputs = ['-i', narration];
  let mix = `[1:a]volume=0.78,apad=whole_dur=${sec(total)},atrim=duration=${sec(total)},asetpts=PTS-STARTPTS[voice]`;
  if (introAudio) {
    audioInputs.push('-i', introAudio);
    mix += `;[2:a]atrim=duration=${sec(intro.frames)},asetpts=PTS-STARTPTS,afade=t=out:st=${fadeStart}:d=${sec(9)},apad=pad_dur=${sec(total)}[intro];` +
      `[voice][intro]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,aresample=48000[a]`;
  } else {
    mix += ';[voice]aresample=48000[a]';
  }
  const mixed = join(work, 'final.tmp.mp4');
  rmSync(mixed, { force: true });
  run('ffmpeg', [...common, '-i', joined, ...audioInputs, '-filter_complex', mix, '-map', '0:v:0', '-map', '[a]',
    '-t', sec(total), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', '-n', mixed],
  Math.max(900_000, total * 200));

  // 5) Independent gates.
  const info = probe(mixed);
  const v = info.streams.filter((s) => s.codec_type === 'video');
  const a = info.streams.filter((s) => s.codec_type === 'audio');
  assert.equal(v.length, 1);
  assert.equal(a.length, 1);
  assert.deepEqual([v[0].width, v[0].height, Number(v[0].nb_frames), v[0].avg_frame_rate], [W, H, total, '30/1']);
  assert.ok(Math.abs(Number(a[0].duration) - total / FPS) < 0.15, 'audio spans the film');
  const decode = spawnSync('ffmpeg', ['-v', 'error', '-threads', '1', '-i', mixed, '-f', 'null', '-'],
    { encoding: 'utf8', timeout: Math.max(1_200_000, total * 400) });
  assert.ok(decode.status === 0 && decode.stderr.trim() === '', 'full decode clean: ' + (decode.stderr ?? '').slice(-400));
  chmodSync(mixed, 0o600);
  renameSync(mixed, final);
  const sha256 = sha256File(final);
  const receipt = { schema: 1, renderer: 'scene-v1', rendererVersion: RENDERER_VERSION, sceneId: valid.document.id, frames: total, sha256,
    bytes: statSync(final).size, parts: parts.length, resumedParts: resumed,
    shots: shots.map((s) => ({ id: s.id, kind: s.kind, start: s.start, frames: s.frames, transitionIn: s.transitionIn })),
    publicationAuthorized: false };
  writeFileSync(final + '.receipt.json', JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  rmSync(work, { recursive: true, force: true });
  console.log(`SCENE V1 FILM PASS: ${total} frames, 30/1, ${parts.length} parts, sha256 ${sha256.slice(0, 12)}…`);
  return { final, receipt };
}

// ---- CI synthetic proof: generated media only, full 1920x1080 pipeline ----
export function syntheticScene() {
  const src = [{ id: 'syn', kind: 'web', publisher: 'BlueDotAtlas CI', title: 'Synthetic', url: 'https://example.org/synthetic', checkedAt: '2026-11-25' }];
  const assets = ['brand-intro', 'clip-a', 'clip-b', 'brand-outro'].map((id) => ({ id, kind: id.startsWith('brand') ? 'brand' : 'footage', rightsStatus: 'cleared' }));
  const shot = (id, kind, frames, assetIds, tr, extra = {}) => ({ id, kind, duration: { frames }, assetIds, transitionIn: tr, ...extra });
  const cut = { type: 'cut', frames: 0 };
  return {
    schemaVersion: 1, id: 'synthetic-scene-v1', title: 'Synthetic scene renderer proof', language: 'en', fps: 30, width: 1920, height: 1080,
    durationFrames: 240, sources: src, assets,
    dataRefs: [{ id: 'd1', sourceId: 'syn', description: 'Synthetic metric for CI', value: 90, unit: 'kt' }],
    scenes: [
      { id: 'intro', beat: 'intro', title: 'Intro', shots: [shot('S0', 'brand_intro', 30, ['brand-intro'], cut)] },
      { id: 'arrival', beat: 'arrival', title: 'Arrival', shots: [shot('S1', 'footage_fullscreen', 30, ['clip-a'], { type: 'crossfade', frames: 9 }, { animation: { type: 'push_in', fromScale: 1, toScale: 1.08, easing: 'ease_in_out' } })] },
      { id: 'context', beat: 'context', title: 'Context', shots: [shot('S2', 'footage_with_overlay', 45, ['clip-a'], cut, {
        assetInFrame: 30, overlays: [{ style: 'info_box', text: 'Synthetic info box', startFrame: 5, endFrame: 40, sourceIds: ['syn'] }] })] },
      { id: 'pause', beat: 'pause', title: 'Pause', shots: [shot('S3', 'breathing_video', 30, ['clip-b'], { type: 'crossfade', frames: 12 }, { animation: { type: 'pan_right', fromScale: 1.05, toScale: 1.05, easing: 'ease_in_out' } })] },
      { id: 'meaning', beat: 'meaning', title: 'Meaning', shots: [shot('S4', 'infographic', 45, [], { type: 'dip_to_black', frames: 10 }, {
        animation: { type: 'diagram_build', fromScale: 1, toScale: 1, easing: 'ease_out' },
        overlays: [{ style: 'info_box', text: '+90 knots in 24 hours', startFrame: 5, endFrame: 40, sourceIds: ['syn'], dataRefIds: ['d1'] }] })] },
      { id: 'takeaway', beat: 'takeaway', title: 'Takeaway', shots: [shot('S5', 'footage_with_overlay', 30, ['clip-b'], { type: 'crossfade', frames: 9 }, {
        assetInFrame: 40, overlays: [{ style: 'title', text: 'The ocean powers the storm.', startFrame: 3, endFrame: 28 }] })] },
      { id: 'outro', beat: 'outro', title: 'Outro', shots: [shot('S6', 'brand_outro', 30, ['brand-outro'], { type: 'crossfade', frames: 9 })] },
    ],
    publicationAuthorized: false,
  };
}

function syntheticMedia(dir) {
  const make = (name, filter, seconds, withAudio = false) => {
    const file = join(dir, name);
    const args = [...common, '-f', 'lavfi', '-i', `${filter}${filter.includes('=') ? ':' : '='}size=${W}x${H}:rate=30000/1001:duration=${seconds}`];
    if (withAudio) args.push('-f', 'lavfi', '-i', `sine=frequency=330:sample_rate=48000:duration=${seconds}`);
    run('ffmpeg', [...args, '-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p', ...(withAudio ? ['-c:a', 'aac'] : ['-an']), '-n', file]);
    return file;
  };
  const files = {
    'brand-intro': { file: make('intro.mp4', 'color=c=0x021934', 1, true) },
    'clip-a': { file: make('a.mp4', 'testsrc2', 4) },
    'clip-b': { file: make('b.mp4', 'smptehdbars', 4) },
    'brand-outro': { file: make('outro.mp4', 'color=c=0x10aaec', 2) },
  };
  const narration = join(dir, 'narration.wav');
  run('ffmpeg', [...common, '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000:duration=8', '-ac', '2', '-c:a', 'pcm_s16le', '-n', narration]);
  return { files, narration, intro: files['brand-intro'].file };
}

function pixel(file, frame, x, y) {
  const p = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `select=eq(n\\,${frame}),crop=8:8:${x}:${y},format=rgb24`, '-frames:v', '1', '-f', 'rawvideo', 'pipe:1'],
    { encoding: null, timeout: 60_000, maxBuffer: 1 << 20 });
  assert.equal(p.status, 0);
  const b = p.stdout;
  let r = 0, g = 0, bl = 0;
  for (let i = 0; i < b.length; i += 3) { r += b[i]; g += b[i + 1]; bl += b[i + 2]; }
  const n = b.length / 3;
  return [r / n, g / n, bl / n];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  try {
    if (args[0] === '--synthetic') {
      const dir = mkdtempSync(join(tmpdir(), 'scene-v1-synthetic-'));
      try {
        const media = syntheticMedia(dir);
        const base = { assets: media.files, narration: media.narration, introAudio: media.intro };
        // 062: interrupt after 5 parts; never more than two lossless shots on disk.
        const out = join(dir, 'resume');
        mkdirSync(out, { mode: 0o700 });
        let maxShots = 0;
        const watch = (k) => {
          const shotsOnDisk = readdirSync(join(out, '.work-scene-v1')).filter((f) => /^shot-\d+\.mp4$/.test(f)).length;
          maxShots = Math.max(maxShots, shotsOnDisk);
          if (k === 5) throw new Error('INJECTED STOP');
        };
        assert.throws(() => renderScene({ ...base, doc: syntheticScene(), out, onProgress: watch }), /INJECTED STOP/);
        // Changed inputs must never reuse the old parts.
        assert.throws(() => renderScene({ ...base, doc: { ...syntheticScene(), title: 'Changed' }, out }), /different render/);
        const { final, receipt } = renderScene({ ...base, doc: syntheticScene(), out, onProgress: () => {
          maxShots = Math.max(maxShots, readdirSync(join(out, '.work-scene-v1')).filter((f) => /^shot-\d+\.mp4$/.test(f)).length);
        } });
        assert.equal(receipt.resumedParts, 5, 'resumed after the 5 finished parts');
        assert.ok(maxShots <= 2, 'at most two lossless shots on disk, saw ' + maxShots);
        assert.ok(!existsSync(join(out, '.work-scene-v1')), 'work folder removed after success');
        // A resumed film is bit-identical to an uninterrupted render.
        const clean = join(dir, 'clean');
        mkdirSync(clean, { mode: 0o700 });
        assert.equal(renderScene({ ...base, doc: syntheticScene(), out: clean }).receipt.sha256, receipt.sha256, 'resume is bit-identical');
        console.log('SCENE V1 RESUME PASS: interrupted at part 5, refused changed inputs, resumed bit-identically, <= 2 shots on disk');
        // Dip to black: middle of the 10-frame dip into S4 (S4 starts at frame 135) is black.
        const dip = pixel(final, 139, 900, 500);
        assert.ok(dip.every((c) => c < 40), 'dip_to_black midpoint is dark: ' + dip.map(Math.round));
        // Info box visible inside S2 (S2 = frames 60..104, box 65..100 with fades).
        // The semi-transparent dark box (82 %) must darken the bright test pattern beneath it.
        const before = pixel(final, 62, 110, 800), box = pixel(final, 80, 110, 800);
        assert.ok(Math.max(...box) < 90 && Math.max(...before) > 150, 'info box drawn: ' + before.map(Math.round) + ' -> ' + box.map(Math.round));
        // Push-in (1.00 -> 1.08) over S1 moves testsrc2's red/green bar edge (x=320 at
        // zoom 1) outwards past x=296..304: red at frame 39, green at frame 58.
        const a = pixel(final, 39, 296, 500), b = pixel(final, 58, 296, 500);
        assert.ok(a[0] > a[1] && b[1] > b[0], 'camera push-in visible: ' + a.map(Math.round) + ' -> ' + b.map(Math.round));
        // Infographic bar grows towards its end (x=1320 reached only late in the build).
        const g1 = pixel(final, 146, 1320, 445), g2 = pixel(final, 172, 1320, 445);
        assert.ok(g2[0] > g1[0] + 40, 'infographic bar builds: ' + g1.map(Math.round) + ' -> ' + g2.map(Math.round));
        console.log('SCENE V1 SYNTHETIC PASS: transitions, dip, overlay, camera move, infographic build, AAC');
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
    } else {
      const get = (flag) => { const i = args.indexOf(flag); assert.ok(i >= 0 && args[i + 1], 'missing ' + flag); return resolve(args[i + 1]); };
      const doc = JSON.parse(readFileSync(get('--scene'), 'utf8'));
      const assets = JSON.parse(readFileSync(get('--assets'), 'utf8'));
      const out = get('--out');
      assert.ok(lstatSync(out).isDirectory() && (lstatSync(out).mode & 0o077) === 0, '--out must be a private 0700 directory');
      for (const [id, entry] of Object.entries(assets)) {
        const want = doc.assets.find((a) => a.id === id)?.sha256;
        if (want) assert.equal(sha256File(entry.file), want, `${id} SHA-256 mismatch`);
      }
      const introId = doc.scenes[0].shots[0].assetIds[0];
      renderScene({ doc, assets, narration: get('--narration'), introAudio: assets[introId]?.file, out });
    }
  } catch (error) {
    console.error('SCENE V1 FAILED: ' + String(error?.message ?? error).slice(0, 900));
    process.exitCode = 1;
  }
}
