import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiValidationError, parseApiProjectPatch } from '../dist/api-v1.js';

test('project PATCH accepts only rename or the explicit archive operation', () => {
  assert.deepEqual(parseApiProjectPatch({ title: '  Atlantic currents  ' }), {
    title: 'Atlantic currents',
  });
  assert.deepEqual(parseApiProjectPatch({ action: 'archive' }), { action: 'archive' });
  for (const value of [
    undefined,
    null,
    '',
    [],
    {},
    { action: 'delete' },
    { action: 'archive', title: 'Both' },
    { status: 'archived' },
    { title: '' },
    { title: 'x'.repeat(161) },
    { title: 'bad\nnewline' },
    { title: 7 },
    { title: 'Valid', private: 'unsafe' },
    { title: 'Valid', currentVersion: 4 },
    { action: 'archive', manifest: {} },
  ]) {
    assert.throws(() => parseApiProjectPatch(value), ApiValidationError);
  }
});
