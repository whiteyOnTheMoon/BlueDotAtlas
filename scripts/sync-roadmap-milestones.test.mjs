import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateManifest, indexRoadmapIssues } from './sync-roadmap-milestones.mjs';

const manifest = JSON.parse(readFileSync('docs/project/roadmap-milestones-v01.json', 'utf8'));

test('source milestone manifest contains contiguous M00–M13 and 158 task slots', () => {
  assert.deepEqual(validateManifest(manifest), []);
});

test('detects a missing milestone', () => {
  const broken = { ...manifest, milestones: manifest.milestones.slice(0, -1) };
  assert.match(validateManifest(broken).join(' '), /exactly 14/);
});

test('detects gaps or overlap', () => {
  const broken = structuredClone(manifest);
  broken.milestones[3].start += 1;
  assert.match(validateManifest(broken).join(' '), /Gap\/overlap/);
});

test('detects changed total or wrong milestone ID', () => {
  const broken = structuredClone(manifest);
  broken.milestones[13].id = 'M99';
  assert.match(validateManifest(broken).join(' '), /Unexpected milestone ID/);
});

test('Issue lookup excludes PRs and detects duplicate roadmap IDs', () => {
  const { result, duplicates } = indexRoadmapIssues([
    { number: 1, title: '[001] Sample' },
    { number: 2, title: '[001] Another sample' },
    { number: 3, title: '[002] PR', pull_request: { url: 'example' } },
    { number: 4, title: '[003] Sample' },
  ]);
  assert.deepEqual(duplicates, ['001']);
  assert.equal(result.size, 2);
  assert.equal(result.get('003').number, 4);
});

test('all 158 task IDs appear in the human-readable index exactly once', () => {
  const content = readFileSync('docs/project/roadmap-backlog-m00-m13.md', 'utf8');
  const listed = [...content.matchAll(/^\| \*\*(\d{3})\*\* \|/gm)].map(x => x[1]);
  assert.equal(listed.length, 158);
  assert.deepEqual(listed, Array.from({ length: 158 }, (_, i) => String(i + 1).padStart(3, '0')));
});
