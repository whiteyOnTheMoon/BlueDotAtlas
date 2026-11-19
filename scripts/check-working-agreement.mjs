// Roadmap 020: static contract checks for the project's DoR, DoD and ADR records.
// No network access, dependencies, VPS commands or publication side effects.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function validateWorkingAgreement(agreement, prTemplate, adrTemplate, acceptedAdr, decisionLog = '') {
  const errors = [];
  const requirements = [
    ['Definition of Ready', /Definition of Ready \(DoR\)/i],
    ['Definition of Done', /Definition of Done \(DoD\)/i],
    ['inputs', /Eingangsdaten\s*\/\s*Inputs/i],
    ['outputs', /Ergebnis\s*\/\s*Outputs/i],
    ['automated CI', /CI grün/i],
    ['UI screenshots', /Screenshots/i],
    ['license review', /Fakten-\/Medienrechte/i],
    ['data migrations', /Datenmodell\/Schema/i],
    ['human review', /Manuelle Prüfung\s*\/\s*Review/i],
    ['explicit operator approval', /ausdrückliche Betreiberabnahme/i],
    ['ADR rules', /ADR-Regeln/i],
    ['README gate', /README\.md/i],
    ['Decision Log gate', /decision-log\.md/i],
    ['VPS protection', /Nebenwirkungen auf andere VPS-Projekte/i],
  ];
  for (const [label, pattern] of requirements) {
    if (!pattern.test(agreement)) errors.push('Missing agreement rule: ' + label);
  }
  for (const [label, pattern] of [
    ['Ready checkbox', /\[ \]\s*\*\*Ready:/],
    ['Done checkbox', /\[ \]\s*\*\*Done/],
    ['UI applicability', /n\/a – keine UI-Änderung/],
    ['migrations', /Datenmigrationen/],
    ['ADR', /Architektur.*ADR/],
    ['operator gate', /Betreiberentscheidung/],
  ]) {
    if (!pattern.test(prTemplate)) errors.push('Missing PR template checklist: ' + label);
  }
  for (const heading of ['Kontext / Problem', 'Entscheidung', 'Erwogene Alternativen',
    'Folgen und Risiken', 'Nachweise / Verifikation']) {
    if (!adrTemplate.includes('## ' + heading)) errors.push('Missing ADR template field: ' + heading);
    if (!acceptedAdr.includes('## ' + heading)) errors.push('Missing ADR-001 field: ' + heading);
  }
  if (!/\*\*Status:\*\* Proposed/.test(adrTemplate)) errors.push('ADR template must start as Proposed');
  if (!/\*\*Status:\*\* Accepted/.test(acceptedAdr)) errors.push('Existing approved ADR must say Accepted');
  if (!/DEC-033/.test(acceptedAdr)) errors.push('ADR-001 must link the actual existing decision DEC-033');
  if (/DEC-036.*(?:abgenommen|Accepted)/i.test(agreement) &&
      !/^\| DEC-036 \|.*(?:Betreiber|Genehmigung)/m.test(decisionLog))
    errors.push('Do not claim a new user decision without a recorded operator approval');
  return errors;
}

export function runContractCheck(paths = {}) {
  const text = path => readFileSync(path, 'utf8');
  return validateWorkingAgreement(
    text(paths.agreement ?? 'docs/project/working-agreement.md'),
    text(paths.pr ?? '.github/pull_request_template.md'),
    text(paths.adrTemplate ?? 'docs/architecture/adr/000-template.md'),
    text(paths.adr ?? 'docs/architecture/adr/001-modular-monolith.md'),
    text(paths.decisions ?? 'docs/project/decision-log.md'),
  );
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const errors = runContractCheck();
  if (errors.length) {
    errors.forEach(error => console.error('FAIL:', error));
    process.exitCode = 1;
  } else {
    console.log('PASS: Roadmap 020 DoR/DoD, applicability, operator review and ADR contracts.');
  }
}
