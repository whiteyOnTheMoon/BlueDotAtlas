import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { blendExpr, cameraFilter, overlayFade, overlaySvg, segments, timeline } from './scene-render-v1-plan.mjs';

const v2 = JSON.parse(readFileSync(new URL('../docs/pilot/60s-script-v2.scene.json', import.meta.url), 'utf8'));

test('scene V1 plan tiles the Script V2 film exactly: 1800 frames, tails = incoming transitions', () => {
  const shots = timeline(v2);
  const parts = segments(shots);
  assert.equal(parts.reduce((s, p) => s + p.frames, 0), 1800);
  shots.forEach((shot, i) => {
    const next = shots[i + 1];
    assert.equal(shot.tail, next && next.transitionIn.type !== 'cut' ? next.transitionIn.frames : 0);
  });
  // Brand frame: 9-frame crossfades in and out (V14/V15).
  const blends = parts.filter((p) => p.kind === 'blend');
  assert.deepEqual([blends[0].frames, blends.at(-1).frames], [9, 9]);
  assert.ok(blends.some((b) => b.type === 'dip_to_black'));
  // Parts are contiguous in film order.
  let cursor = 0;
  for (const p of parts) {
    const start = p.kind === 'body' ? shots[p.shot].start + p.offset : shots[p.to].start;
    assert.equal(start, cursor);
    cursor += p.frames;
  }
});

test('scene V1 camera, overlay fades and blend expressions are bounded', () => {
  assert.match(cameraFilter({ type: 'push_in', fromScale: 1, toScale: 1.08 }, 120), /zoompan=z='1\+\(0\.08\)/);
  assert.match(cameraFilter({ type: 'pan_right', fromScale: 1.05, toScale: 1.05 }, 90), /x='\(iw-iw\/zoom\)\*\(0\.5-0\.5\*cos/);
  assert.match(cameraFilter({ type: 'none', fromScale: 1, toScale: 1 }, 60), /z='1'/);
  const fade = overlayFade({ startFrame: 30, endFrame: 170 });
  assert.equal(fade.fadeFrames, 10);
  assert.equal(fade.enable, 'between(n,30,169)');
  assert.equal(blendExpr('crossfade', 12), 'A*(1-((N+1)/12))+B*((N+1)/12)');
  assert.match(blendExpr('dip_to_black', 10), /^if\(lt\(/);
  for (const style of ['info_box', 'lower_third', 'source_credit', 'title']) {
    const svg = overlaySvg({ style, text: 'A & B <test>' });
    assert.match(svg, /A &amp; B &lt;test&gt;/);
    assert.doesNotMatch(svg, /<test>/);
  }
  assert.throws(() => overlaySvg({ style: 'marquee', text: 'x' }));
});
