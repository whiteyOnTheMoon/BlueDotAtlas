import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  ApiValidationError,
  parseApiWizardChange,
  parseApiWizardStep,
} from '../dist/api-v1.js';

test('wizard step must be exactly an integer string 1..7', () => {
  for (const valid of ['1', '2', '3', '4', '5', '6', '7']) {
    assert.equal(parseApiWizardStep(valid), Number(valid));
  }
  for (const invalid of ['0', '8', '01', '+1', '-1', '2.0', '1e0', '', '../1', '1?step=2']) {
    assert.throws(() => parseApiWizardStep(invalid), ApiValidationError);
  }
});

test('step edits accept only bounded notes or explicit review submission with CAS revision', () => {
  assert.deepEqual(parseApiWizardChange({ expectedRevision: 0, notes: '  notes  ' }), {
    expectedRevision: 0,
    notes: '  notes  ',
  });
  assert.deepEqual(parseApiWizardChange({ expectedRevision: 3, action: 'submit' }), {
    expectedRevision: 3,
    action: 'submit',
  });
  for (const bad of [
    null,
    [],
    {},
    'notes',
    { expectedRevision: -1, notes: 'hello' },
    { expectedRevision: 1.5, notes: 'hello' },
    { expectedRevision: Number.MAX_SAFE_INTEGER, notes: 'hello' },
    { expectedRevision: '1', notes: 'hello' },
    { expectedRevision: 0, notes: 'x'.repeat(4001) },
    { expectedRevision: 0, notes: 'bad\u0000data' },
    { expectedRevision: 0, notes: 3 },
    { expectedRevision: 0, action: 'approve' },
    { expectedRevision: 0, action: 'submit', published: true },
    { expectedRevision: 0, notes: 'hello', status: 'complete' },
    { expectedRevision: 0, snapshot: {} },
    { expectedRevision: 0, notes: 'nice', token: 'private' },
    { notes: 'missing revision' },
  ]) {
    assert.throws(() => parseApiWizardChange(bad), ApiValidationError);
  }
});
