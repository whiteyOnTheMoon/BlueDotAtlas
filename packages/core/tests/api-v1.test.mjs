import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ApiValidationError,
  parseApiCreateProject,
  parseApiListQuery,
  parseApiUuid,
} from '../dist/api-v1.js';

test('query schema bounds limits, enum filters, UUIDs and duplicate/unknown keys', () => {
  assert.deepEqual(parseApiListQuery('projects', []), { limit: 20, offset: 0 });
  assert.deepEqual(parseApiListQuery('projects', [['limit', '50'], ['status', 'draft']]), {
    limit: 50,
    offset: 0,
    status: 'draft',
  });
  assert.deepEqual(parseApiListQuery('jobs', [['status', 'queued'], ['offset', '10000']]), {
    limit: 20,
    offset: 10000,
    status: 'queued',
  });
  assert.equal(parseApiListQuery('media', [['kind', 'footage']]).kind, 'footage');
  assert.equal(
    parseApiListQuery('videos', [
      ['projectId', '32a38dca-9c2a-4ddf-9db2-9d6248fa5139'],
    ]).projectId,
    '32a38dca-9c2a-4ddf-9db2-9d6248fa5139',
  );
  for (const values of [
    [['limit', '0']],
    [['limit', '51']],
    [['limit', '-1']],
    [['limit', '1.2']],
    [['limit', '01']],
    [['limit', '999999999999999999999999999']],
    [['offset', '10001']],
    [['offset', '-1']],
    [['status', 'published']],
    [['limit', '1'], ['limit', '2']],
    [['unexpected', 'abc']],
  ]) {
    assert.throws(() => parseApiListQuery('projects', values), ApiValidationError);
  }
  assert.throws(() => parseApiListQuery('media', [['status', 'draft']]), ApiValidationError);
  assert.throws(() => parseApiListQuery('videos', [['kind', 'image']]), ApiValidationError);
  assert.throws(() => parseApiListQuery('jobs', [['projectId', 'bad']]), ApiValidationError);
  assert.throws(() => parseApiListQuery('media', [['projectVersionId', 'bad']]), ApiValidationError);
});

test('UUID schema accepts canonical versions and rejects injection or malformed identifiers', () => {
  assert.equal(
    parseApiUuid('32A38DCA-9C2A-4DDF-9DB2-9D6248FA5139'),
    '32a38dca-9c2a-4ddf-9db2-9d6248fa5139',
  );
  for (const value of [
    '',
    '1',
    '00000000-0000-0000-0000-000000000000',
    '32a38dca-9c2a-4ddf-9db2-9d6248fa5139%27',
  ]) {
    assert.throws(() => parseApiUuid(value), ApiValidationError);
  }
});

test('project creation accepts only a bounded title; ignores no unknown fields', () => {
  assert.deepEqual(parseApiCreateProject({ title: '  Blue planet  ' }), { title: 'Blue planet' });
  for (const input of [
    null,
    [],
    'x',
    {},
    { title: 5 },
    { title: '' },
    { title: ' '.repeat(5) },
    { title: 'x'.repeat(161) },
    { title: 'bad\ninjection' },
    { title: 'good', status: 'published' },
    { title: 'good', snapshot: { providerSecret: 'sensitive' } },
    { title: 'good', __proto__: null, hidden: true },
  ]) {
    assert.throws(() => parseApiCreateProject(input), ApiValidationError);
  }
});
