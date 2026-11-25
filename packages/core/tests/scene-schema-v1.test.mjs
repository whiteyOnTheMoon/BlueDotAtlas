import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import {
  SCENE_SCHEMA_VERSION,
  sceneDocumentJsonSchema,
  validateSceneDocument,
} from '../dist/scene-schema/v1.js';

const read = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const example = () => read('../scene-schema/v1/examples/pilot-v2-structure.json');
const errorsOf = (doc) => {
  const result = validateSceneDocument(doc);
  assert.equal(result.ok, false, 'expected validation to fail');
  return result.errors.join('\n');
};

test('049 V2 structure example validates: 10 beats, 1800 frames, 1080p30, not publishable', () => {
  const result = validateSceneDocument(example());
  assert.equal(result.ok, true, result.ok ? '' : result.errors.join('\n'));
  const doc = result.document;
  assert.equal(SCENE_SCHEMA_VERSION, 1);
  assert.equal(doc.durationFrames, 1800);
  assert.deepEqual(
    doc.scenes.map((s) => s.beat),
    ['intro', 'arrival', 'context', 'pause', 'news', 'meaning', 'future', 'pause', 'takeaway', 'outro'],
  );
  assert.equal(doc.publicationAuthorized, false);
  // Defaults are applied: shots without explicit animation get "none".
  assert.equal(doc.scenes[3].shots[0].animation.type, 'none');
});

test('049 missing required values produce path-specific, readable errors', () => {
  const doc = example();
  delete doc.title;
  delete doc.scenes[1].shots[0].duration;
  doc.scenes[2].beat = 'cliffhanger';
  const errors = errorsOf(doc);
  assert.match(errors, /^title: /m);
  assert.match(errors, /^scenes\.1\.shots\.0\.duration: /m);
  assert.match(errors, /^scenes\.2\.beat: /m);
});

test('049 references must resolve; blocked assets and unknown sources are refused', () => {
  const doc = example();
  doc.scenes[1].shots[0].assetIds = ['P60-VID-999'];
  doc.scenes[2].shots[0].overlays[0].sourceIds = ['made-up-source'];
  doc.assets[4].rightsStatus = 'blocked';
  const errors = errorsOf(doc);
  assert.match(errors, /scenes\.1\.shots\.0\.assetIds\.0: unknown asset "P60-VID-999"/);
  assert.match(errors, /scenes\.2\.shots\.0\.overlays\.0\.sourceIds\.0: unknown source "made-up-source"/);
  assert.match(errors, /asset "P60-VID-003" is blocked and cannot be used/);
});

test('049 timing contract: sum of shots, transitions, overlays and narration bounds', () => {
  const doc = example();
  doc.durationFrames = 1799;
  doc.scenes[3].shots[0].transitionIn = { type: 'cut', frames: 12 };
  doc.scenes[4].shots[0].transitionIn = { type: 'crossfade', frames: 0 };
  doc.scenes[2].shots[0].overlays[0].endFrame = 400;
  doc.scenes[5].narration = [
    { id: 'n1', text: 'First line.', startFrame: 0, endFrame: 120 },
    { id: 'n2', text: 'Overlapping line.', startFrame: 100, endFrame: 200 },
    { id: 'n3', text: 'Too long.', startFrame: 200, endFrame: 999 },
  ];
  const errors = errorsOf(doc);
  assert.match(errors, /durationFrames: shots add up to 1800 frames but durationFrames is 1799/);
  assert.match(errors, /scenes\.3\.shots\.0\.transitionIn\.frames: a cut has 0 frames/);
  assert.match(errors, /scenes\.4\.shots\.0\.transitionIn\.frames: a cut has 0 frames/);
  assert.match(errors, /overlays\.0\.endFrame: overlay ends after its shot/);
  assert.match(errors, /narration "n2" overlaps "n1"/);
  assert.match(errors, /scenes\.5\.narration\.2\.endFrame: narration runs past the end of its scene/);
});

test('049 story rules encoded in the contract: pauses are silent, breathing video has no overlay', () => {
  const doc = example();
  doc.scenes[3].narration = [{ id: 'talk', text: 'No.', startFrame: 0, endFrame: 30 }];
  doc.scenes[3].shots[0].overlays = [{ style: 'info_box', text: 'x', startFrame: 0, endFrame: 10 }];
  doc.scenes[0].shots[0].transitionIn = { type: 'crossfade', frames: 10 };
  doc.scenes[1].shots[0].assetIds = [];
  const errors = errorsOf(doc);
  assert.match(errors, /a pause scene has no narration/);
  assert.match(errors, /a breathing_video shot is video only: no overlays/);
  assert.match(errors, /the first shot cannot transition in from nothing/);
  assert.match(errors, /a footage_fullscreen shot needs an asset/);
});

test('049 hostile input: unknown keys, absolute/.. paths, non-https sources, publication flag', () => {
  const doc = example();
  doc.renderCommand = 'rm -rf /';
  doc.assets[2].path = '../../etc/passwd';
  doc.sources[0].url = 'http://example.com/insecure';
  doc.publicationAuthorized = true;
  doc.fps = 25;
  const errors = errorsOf(doc);
  assert.match(errors, /renderCommand/);
  assert.match(errors, /assets\.2\.path: asset paths must be relative/);
  assert.match(errors, /sources\.0\.url: /);
  assert.match(errors, /^publicationAuthorized: /m);
  assert.match(errors, /^fps: /m);
});

test('049 committed JSON Schema matches the Zod contract (no drift)', () => {
  const committed = read('../scene-schema/v1/scene-schema.v1.json');
  assert.deepEqual(committed, JSON.parse(JSON.stringify(sceneDocumentJsonSchema())));
  assert.equal(committed.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.equal(committed.additionalProperties, false);
});
