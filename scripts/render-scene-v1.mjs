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
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSceneDocument } from '../packages/core/dist/scene-schema/v1.js';
import { JOIN_TIMESTAMPS046 } from './pilot-ffmpeg-046-plan.mjs';
import { FPS, H, W, blendExpr, cameraFilter, infographicSvg, overlayFade, overlaySvg, segments, timeline } from './scene-render-v1-plan.mjs';

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

export function renderScene({ doc, assets, narration, introAudio, out, delivery: profile = delivery }) {
  const valid = validateSceneDocument(doc);
  assert.ok(valid.ok, valid.ok ? '' : valid.errors.join('\n'));
  const shots = timeline(valid.document);
  const parts = segments(shots);
  const dataRefs = new Map(valid.document.dataRefs.map((d) => [d.id, d]));
  const work = mkdtempSync(join(out, '.work-scene-v1-'));
  try {
    // 1) One intermediate per shot: duration + tail frames, camera move, overlays.
    const shotFiles = shots.map((shot, i) => {
      const file = join(work, `shot-${String(i).padStart(2, '0')}.mp4`);
      const n = shot.renderFrames;
      const inputs = [];
      let chain;
      if (shot.kind === 'infographic' || (shot.kind === 'text_card' && shot.assetIds.length === 0)) {
        const dir = join(work, `frames-${i}`);
        mkdirSync(dir);
        for (let f = 0; f < n; f++) {
          const svg = join(dir, 'f.svg');
          writeFileSync(svg, shot.kind === 'infographic'
            ? infographicSvg(shot, dataRefs, Math.min(f, shot.frames - 1))
            : `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#071522"/></svg>`);
          run('rsvg-convert', ['--width', String(W), '--height', String(H), '--output', join(dir, `f-${String(f).padStart(5, '0')}.png`), svg], 30_000);
        }
        inputs.push('-framerate', String(FPS), '-i', join(dir, 'f-%05d.png'));
        chain = `[0:v]format=yuv420p,setsar=1[base]`;
      } else {
        const asset = assets[shot.assetIds[0]];
        assert.ok(asset && existsSync(asset.file), `missing staged asset ${shot.assetIds[0]}`);
        inputs.push('-ss', sec(shot.assetInFrame ?? 0), '-i', asset.file);
        const fit = `fps=${FPS},scale=${W}:${H}:force_original_aspect_ratio=increase:flags=lanczos,crop=${W}:${H},setsar=1`;
        const camera = shot.kind.startsWith('brand_') ? '' : ',' + cameraFilter(shot.animation, n);
        chain = `[0:v]${fit}${camera},format=yuv420p[base]`;
      }
      let last = 'base';
      (shot.overlays ?? []).forEach((overlay, oi) => {
        const png = join(work, `ov-${i}-${oi}.png`);
        const svg = png.replace(/\.png$/, '.svg');
        writeFileSync(svg, overlaySvg(overlay));
        run('rsvg-convert', ['--width', String(W), '--height', String(H), '--output', png, svg], 30_000);
        inputs.push('-loop', '1', '-framerate', String(FPS), '-i', png);
        const f = overlayFade(overlay);
        chain += `;[${oi + 1}:v]${f.filter}[o${oi}];[${last}][o${oi}]overlay=0:0:shortest=1:enable='${f.enable}'[v${oi}]`;
        last = `v${oi}`;
      });
      run('ffmpeg', [...common, ...inputs, '-filter_complex', chain + `;[${last}]format=yuv420p[out]`, '-map', '[out]',
        '-frames:v', String(n), ...lossless, '-n', file]);
      assert.equal(videoFrames(file), n, `shot ${shot.id}: expected ${n} frames (source too short?)`);
      console.log(`SCENE V1 SHOT ${i + 1}/${shots.length} ${shot.id} ${shot.kind}: ${n}f`);
      return file;
    });

    // 2) Exact parts: bodies and blends (crossfade / dip).
    const partFiles = parts.map((part, i) => {
      const file = join(work, `part-${String(i).padStart(3, '0')}.mp4`);
      if (part.kind === 'body') {
        const a = part.offset;
        run('ffmpeg', [...common, '-i', shotFiles[part.shot], '-vf', `trim=start_frame=${a}:end_frame=${a + part.frames},setpts=PTS-STARTPTS`,
          '-frames:v', String(part.frames), ...profile, '-n', file]);
      } else {
        const fa = part.fromOffset;
        run('ffmpeg', [...common, '-i', shotFiles[part.from], '-i', shotFiles[part.to], '-filter_complex',
          `[0:v]trim=start_frame=${fa}:end_frame=${fa + part.frames},setpts=PTS-STARTPTS,format=gbrp[a];` +
          `[1:v]trim=start_frame=0:end_frame=${part.frames},setpts=PTS-STARTPTS,format=gbrp[b];` +
          `[a][b]blend=all_expr='${blendExpr(part.type, part.frames)}',format=yuv420p[v]`,
          '-map', '[v]', '-frames:v', String(part.frames), ...profile, '-n', file]);
      }
      assert.equal(videoFrames(file), part.frames, `part ${i} frames`);
      return file;
    });

    // 3) Copy-concat with exact 30 fps timestamps (bookworm FFmpeg 5.1 safe).
    const list = join(work, 'parts.ffconcat');
    writeFileSync(list, 'ffconcat version 1.0\n' + partFiles.map((f) => `file '${f}'`).join('\n') + '\n');
    const joined = join(work, 'joined.mp4');
    run('ffmpeg', [...common, '-f', 'concat', '-safe', '0', '-i', list, '-map', '0:v:0', '-an', '-c:v', 'copy',
      ...JOIN_TIMESTAMPS046, '-movflags', '+faststart', '-n', joined]);
    const total = valid.document.durationFrames;
    const jv = probe(joined).streams.find((s) => s.codec_type === 'video');
    assert.equal(Number(jv.nb_frames), total);
    assert.equal(jv.avg_frame_rate, '30/1');

    // 4) One AAC mix: narration (0.78) + brand intro sound faded over the intro's last 9 frames.
    const intro = shots[0];
    const fadeStart = sec(intro.frames - 9);
    const final = join(out, 'scene-v1.mp4');
    assert.ok(!existsSync(final), 'refusing to overwrite ' + final);
    const audioInputs = ['-i', narration];
    let mix = `[1:a]volume=0.78,apad=whole_dur=${sec(total)},atrim=duration=${sec(total)},asetpts=PTS-STARTPTS[voice]`;
    if (introAudio) {
      audioInputs.push('-i', introAudio);
      mix += `;[2:a]atrim=duration=${sec(intro.frames)},asetpts=PTS-STARTPTS,afade=t=out:st=${fadeStart}:d=${sec(9)},apad=pad_dur=${sec(total)}[intro];` +
        `[voice][intro]amix=inputs=2:duration=first:dropout_transition=0:normalize=0,aresample=48000[a]`;
    } else {
      mix += ';[voice]aresample=48000[a]';
    }
    run('ffmpeg', [...common, '-i', joined, ...audioInputs, '-filter_complex', mix, '-map', '0:v:0', '-map', '[a]',
      '-t', sec(total), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', '-movflags', '+faststart', '-n', final]);

    // 5) Independent gates.
    const info = probe(final);
    const v = info.streams.filter((s) => s.codec_type === 'video');
    const a = info.streams.filter((s) => s.codec_type === 'audio');
    assert.equal(v.length, 1);
    assert.equal(a.length, 1);
    assert.deepEqual([v[0].width, v[0].height, Number(v[0].nb_frames), v[0].avg_frame_rate], [W, H, total, '30/1']);
    assert.ok(Math.abs(Number(a[0].duration) - total / FPS) < 0.15, 'audio spans the film');
    const decode = spawnSync('ffmpeg', ['-v', 'error', '-i', final, '-f', 'null', '-'], { encoding: 'utf8', timeout: 1_200_000 });
    assert.ok(decode.status === 0 && decode.stderr.trim() === '', 'full decode clean: ' + decode.stderr.slice(-400));
    const sha256 = createHash('sha256').update(readFileSync(final)).digest('hex');
    const receipt = { schema: 1, renderer: 'scene-v1', sceneId: valid.document.id, frames: total, sha256, bytes: statSync(final).size,
      shots: shots.map((s) => ({ id: s.id, kind: s.kind, start: s.start, frames: s.frames, transitionIn: s.transitionIn })),
      publicationAuthorized: false };
    writeFileSync(final + '.receipt.json', JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    console.log(`SCENE V1 FILM PASS: ${total} frames, 30/1, ${parts.length} parts, sha256 ${sha256.slice(0, 12)}…`);
    return { final, receipt };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
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
    'brand-intro': { file: make('intro.mp4', 'color=c=0x021934', 2, true) },
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
        const { final } = renderScene({ doc: syntheticScene(), assets: media.files, narration: media.narration, introAudio: media.intro, out: dir });
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
        if (want) assert.equal(createHash('sha256').update(readFileSync(entry.file)).digest('hex'), want, `${id} SHA-256 mismatch`);
      }
      const introId = doc.scenes[0].shots[0].assetIds[0];
      renderScene({ doc, assets, narration: get('--narration'), introAudio: assets[introId]?.file, out });
    }
  } catch (error) {
    console.error('SCENE V1 FAILED: ' + String(error?.message ?? error).slice(0, 900));
    process.exitCode = 1;
  }
}
