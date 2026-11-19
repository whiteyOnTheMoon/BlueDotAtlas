import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runContractCheck, validateWorkingAgreement } from './check-working-agreement.mjs';

const agreement = readFileSync('docs/project/working-agreement.md', 'utf8');
const pr = readFileSync('.github/pull_request_template.md', 'utf8');
const template = readFileSync('docs/architecture/adr/000-template.md', 'utf8');
const adr = readFileSync('docs/architecture/adr/001-modular-monolith.md', 'utf8');

test('Real working agreement, PR template and approved architecture ADR are consistent', () => {
  assert.deepEqual(runContractCheck(), []);
});

test('Missing license rules block completion', () => {
  const withoutLicense = agreement.replace(/\*\*Fakten-\/Medienrechte:\*\*/g, '**Rechte fehlen:**');
  assert.match(validateWorkingAgreement(withoutLicense, pr, template, adr).join('\n'), /license review/);
});

test('Missing explicit operator approval is detected', () => {
  const withoutApproval = agreement.replaceAll('ausdrückliche Betreiberabnahme', 'ungeprüfte Freigabe');
  assert.match(validateWorkingAgreement(withoutApproval, pr, template, adr).join('\n'), /explicit operator approval/);
});

test('ADR template must not default to accepted', () => {
  const invalid = template.replace('**Status:** Proposed', '**Status:** Accepted');
  assert.match(validateWorkingAgreement(agreement, pr, invalid, adr).join('\n'), /start as Proposed/);
});

test('Existing architecture ADR must cite actual approved decision', () => {
  const invalid = adr.replaceAll('DEC-033', 'DEC-XXX');
  assert.match(validateWorkingAgreement(agreement, pr, template, invalid).join('\n'), /DEC-033/);
});

test('New 020 decision cannot be described as approved before user review', () => {
  const invalid = agreement + '\nDEC-036 abgenommen';
  assert.match(validateWorkingAgreement(invalid, pr, template, adr).join('\n'), /before the PR is approved/);
});
