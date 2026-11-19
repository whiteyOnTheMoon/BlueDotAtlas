import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRoadmapPr } from './check-roadmap-pr.mjs';

test('valid PR with roadmap ID and issue', () => {
  assert.deepEqual(validateRoadmapPr({
    title: '[018] GitHub-Repository und Arbeitsregeln',
    body: 'Roadmap-Nummer: `018`\nGitHub-Issue: #35',
  }), { errors: [], roadmapId: '018', issueNumber: 35 });
});

test('Refs syntax also identifies linked issue', () => {
  assert.deepEqual(validateRoadmapPr({
    title: '[021] Monorepo',
    body: 'Roadmap-Nummer: 021\nRefs #38',
  }).errors, []);
});

test('rejects mismatching roadmap numbers', () => {
  assert.match(validateRoadmapPr({
    title: '[018] GitHub workflow',
    body: 'Roadmap-Nummer: 017\nRefs #35',
  }).errors.join(' '), /must match/);
});

test('rejects missing issue reference', () => {
  assert.match(validateRoadmapPr({
    title: '[018] GitHub workflow',
    body: 'Roadmap-Nummer: 018',
  }).errors.join(' '), /issue/);
});

test('rejects placeholder title and body', () => {
  assert.ok(validateRoadmapPr({
    title: '[0XX] Placeholder',
    body: 'Roadmap-Nummer: `0XX`\nGitHub-Issue: #…',
  }).errors.length >= 2);
});

test('rejects empty metadata', () => {
  assert.equal(validateRoadmapPr({}).errors.length, 3);
});
