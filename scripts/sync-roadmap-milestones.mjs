// BlueDotAtlas Roadmap 019. Native GitHub milestone sync, idempotent by M00–M13.
// Never run write mode outside the approved default branch.
// No third-party dependencies; requires Actions GITHUB_TOKEN with issues:write.
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function validateManifest(obj) {
  const problems = [];
  if (obj?.schema_version !== 1) problems.push('Expected schema_version: 1');
  if (!Array.isArray(obj?.milestones) || obj.milestones.length !== 14) {
    problems.push('Expected exactly 14 milestones M00–M13');
    return problems;
  }
  let expectedNextId = 1;
  let total = 0;
  for (let k = 0; k < obj.milestones.length; k += 1) {
    const m = obj.milestones[k];
    const expectedId = 'M' + String(k).padStart(2, '0');
    if (m.id !== expectedId) problems.push('Unexpected milestone ID ' + m.id + ' (expected ' + expectedId + ')');
    if (!m.title || !m.acceptance_gate || typeof m.title !== 'string') {
      problems.push('Missing title or acceptance gate for ' + expectedId);
    }
    if (!Number.isInteger(m.start) || !Number.isInteger(m.end) || !Number.isInteger(m.task_count)) {
      problems.push('Invalid task bounds/count for ' + expectedId);
      continue;
    }
    if (m.start !== expectedNextId || m.end < m.start || (m.end - m.start + 1) !== m.task_count) {
      problems.push('Gap/overlap or bad count in ' + expectedId);
    }
    expectedNextId = m.end + 1;
    total += m.task_count;
  }
  if (expectedNextId !== 159 || total !== 158) problems.push('Expected a continuous 001–158 task range');
  return problems;
}

export function indexRoadmapIssues(issues) {
  const result = new Map();
  const duplicates = [];
  for (const issue of issues) {
    if (issue.pull_request) continue; // GitHub Issues REST also returns PR objects
    const id = issue.title?.match(/^\[(\d{3})\]\s/)?.[1];
    if (!id) continue;
    if (result.has(id)) duplicates.push(id);
    result.set(id, issue);
  }
  return { result, duplicates };
}

function expectedIds(manifest) {
  return manifest.milestones.flatMap(m =>
    Array.from({ length: m.task_count }, (_, k) => String(m.start + k).padStart(3, '0')));
}

function apiClient(repository, token) {
  const base = 'https://api.github.com/repos/' + repository + '/';
  return async (method, route, payload) => {
    const response = await fetch(base + route, {
      method,
      headers: {
        'Authorization': 'Bearer ' + token,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'BlueDotAtlas-roadmap-019',
        ...(payload ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(method + ' ' + route + ' HTTP ' + response.status +
      ': ' + JSON.stringify(data).slice(0, 700));
    return data;
  };
}

async function allPages(api, route) {
  const all = [];
  for (let page = 1; page <= 10; page += 1) {
    const separator = route.includes('?') ? '&' : '?';
    const items = await api('GET', route + separator + 'per_page=100&page=' + page);
    if (!Array.isArray(items)) throw new Error('Expected list from ' + route);
    all.push(...items);
    if (items.length < 100) return all;
  }
  throw new Error('Pagination unexpectedly exceeded 1,000 items; review before continuing');
}

async function main() {
  const manifestPath = resolve('docs/project/roadmap-milestones-v01.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  const problems = validateManifest(manifest);
  if (problems.length) throw new Error('Manifest invalid: ' + problems.join('; '));
  if (process.argv.includes('--check')) {
    console.log('PASS: 14 milestones, 158 continuous unique task slots; source gates present.');
    return;
  }
  if (!process.argv.includes('--apply')) {
    throw new Error('No mutation selected. Use --check; --apply is restricted to a main-branch GitHub Action.');
  }
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  if (repository !== 'whiteyOnTheMoon/BlueDotAtlas' ||
      process.env.GITHUB_REF !== 'refs/heads/main' ||
      !['push', 'workflow_dispatch'].includes(process.env.GITHUB_EVENT_NAME) ||
      !token) {
    throw new Error('Refusing write: require approved BlueDotAtlas main-branch GitHub Action and GITHUB_TOKEN.');
  }
  const api = apiClient(repository, token);
  // Complete non-mutating preflight. No partial creation if any roadmap ID is absent/duplicated.
  const issues = (await allPages(api, 'issues?state=all')).filter(x => !x.pull_request);
  const { result: byId, duplicates } = indexRoadmapIssues(issues);
  const ids = expectedIds(manifest);
  const missing = ids.filter(id => !byId.has(id));
  const outside = [...byId.keys()].filter(id => Number(id) < 1 || Number(id) > 158);
  if (duplicates.length || missing.length || outside.length || byId.size !== 158) {
    throw new Error('Issue preflight blocked: ' + JSON.stringify({ duplicates, missing, outside, count: byId.size }));
  }
  console.log('Issue preflight PASS: 158 unique GitHub Issues match roadmap IDs 001–158.');
  const prior = await allPages(api, 'milestones?state=all');
  const byMilestoneId = new Map();
  for (const m of manifest.milestones) {
    const matches = prior.filter(x => x.title === m.id + ' – ' + m.title || x.title.startsWith(m.id + ' – '));
    if (matches.length > 1) throw new Error('Multiple milestones match ' + m.id);
    if (matches.length === 1 && matches[0].title !== m.id + ' – ' + m.title) {
      throw new Error('Existing milestone name differs for ' + m.id + ': ' + matches[0].title);
    }
    byMilestoneId.set(m.id, matches[0] ?? null);
  }
  // Prevent overwriting a preexisting, different milestone assignment.
  for (const m of manifest.milestones) {
    const current = byMilestoneId.get(m.id);
    for (let num = m.start; num <= m.end; num += 1) {
      const issue = byId.get(String(num).padStart(3, '0'));
      if (issue.milestone && (!current || issue.milestone.number !== current.number)) {
        throw new Error('Issue #' + issue.number + ' has an unexpected native milestone. Resolve manually.');
      }
    }
  }
  for (const m of manifest.milestones) {
    let native = byMilestoneId.get(m.id);
    if (!native) {
      native = await api('POST', 'milestones', {
        title: m.id + ' – ' + m.title,
        description: 'BlueDotAtlas Master Roadmap V0.1 (13.11.2026) · Aufgaben ' +
          String(m.start).padStart(3, '0') + '–' + String(m.end).padStart(3, '0') +
          ' · Gate: ' + m.acceptance_gate,
        state: 'open',
      });
      console.log('Created native milestone ' + m.id + ': #' + native.number);
    }
    for (let num = m.start; num <= m.end; num += 1) {
      const issue = byId.get(String(num).padStart(3, '0'));
      if (issue.milestone?.number === native.number) continue;
      await api('PATCH', 'issues/' + issue.number, { milestone: native.number });
    }
    console.log('Assigned / confirmed ' + m.id + ': ' + m.task_count + ' issues.');
  }
  // Read-back confirms every mapping, rather than trusting PATCH responses.
  const verify = indexRoadmapIssues((await allPages(api, 'issues?state=all')).filter(x => !x.pull_request));
  let verified = 0;
  const afterMilestones = await allPages(api, 'milestones?state=all');
  for (const m of manifest.milestones) {
    const native = afterMilestones.find(x => x.title === m.id + ' – ' + m.title);
    if (!native) throw new Error('Milestone missing after sync: ' + m.id);
    for (let num = m.start; num <= m.end; num += 1) {
      const issue = verify.result.get(String(num).padStart(3, '0'));
      if (!issue || issue.milestone?.number !== native.number) {
        throw new Error('Verification failed on roadmap ID ' + num);
      }
      verified += 1;
    }
  }
  console.log('PASS: 14 native GitHub milestones exist, all ' + verified + '/158 Issues assigned.');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error('Roadmap sync failed:', err.message); process.exitCode = 1; });
}
