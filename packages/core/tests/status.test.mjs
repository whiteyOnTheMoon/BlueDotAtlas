import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  wizardSteps, projectStatuses, videoStatuses,
  canTransitionProject, assertProjectTransition, canTransitionVideo,
  assertVideoTransition, canTransitionRenderJob, InvalidStatusTransition,
} from '../dist/index.js';

test('the canonical wizard has seven unique and ordered steps', () => {
  assert.equal(wizardSteps.length, 7);
  assert.equal(new Set(wizardSteps).size, 7);
  assert.equal(wizardSteps[0], 'New Video');
  assert.equal(wizardSteps[6], 'Video Production');
});
test('project transitions cannot skip review or reopen an archive', () => {
  assert.deepEqual(projectStatuses, ['draft', 'in_progress', 'in_review', 'approved', 'archived']);
  assert.equal(canTransitionProject('draft', 'in_review'), false);
  assert.equal(canTransitionProject('in_review', 'approved'), true);
  assert.equal(canTransitionProject('archived', 'draft'), false);
  assert.throws(() => assertProjectTransition('draft', 'approved'), InvalidStatusTransition);
});
test('render jobs cannot skip execution or reset terminal success', () => {
  assert.equal(canTransitionRenderJob('queued', 'succeeded'), false);
  assert.equal(canTransitionRenderJob('running', 'succeeded'), true);
  assert.equal(canTransitionRenderJob('succeeded', 'queued'), false);
});
test('rendering cannot trigger automatic publication', () => {
  assert.ok(videoStatuses.includes('published'));
  assert.equal(canTransitionVideo('ready', 'published'), false);
  assert.equal(canTransitionVideo('rendered', 'in_review'), true);
  assert.throws(() => assertVideoTransition('ready', 'published'), InvalidStatusTransition);
});
