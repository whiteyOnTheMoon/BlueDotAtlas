// BlueDotAtlas: tiny PR identity gate; intentionally dependency-free.
// Verifies metadata, not technical correctness, license approval or branch protection.
import { readFileSync } from 'node:fs';

export function validateRoadmapPr(pr) {
  const errors = [];
  const title = typeof pr?.title === 'string' ? pr.title : '';
  const body = typeof pr?.body === 'string' ? pr.body : '';
  const titleId = title.match(/^\[(\d{3})\]\s+\S/);
  const declaredId = body.match(/(?:^|\n)\s*(?:[-*]\s*)?Roadmap-Nummer:\s*`?(\d{3})`?/i);
  const linkedIssue = body.match(/\b(?:GitHub-Issue:\s*#|(?:Refs|Closes|Fixes|Resolves)\s+#)(\d+)\b/i);
  if (!titleId) errors.push('PR title must begin with [NNN] followed by a description (e.g. [018] GitHub workflow).');
  if (!declaredId) errors.push('PR body must contain Roadmap-Nummer: NNN.');
  if (titleId && declaredId && titleId[1] !== declaredId[1]) {
    errors.push('Roadmap ID in title must match Roadmap-Nummer in PR body.');
  }
  if (!linkedIssue) errors.push('PR body must link a real issue using GitHub-Issue: #NUMBER or Refs #NUMBER.');
  return { errors, roadmapId: titleId?.[1] ?? null, issueNumber: linkedIssue ? Number(linkedIssue[1]) : null };
}

if (process.argv[1] && import.meta.url === new URL('file://' + process.argv[1]).href) {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path) {
    console.error('GITHUB_EVENT_PATH must point to the pull_request event JSON.');
    process.exitCode = 1;
  } else {
    const event = JSON.parse(readFileSync(path, 'utf8'));
    if (!event.pull_request) {
      console.error('Expected a pull_request event.');
      process.exitCode = 1;
    } else {
      const result = validateRoadmapPr(event.pull_request);
      if (result.errors.length) {
        result.errors.forEach(e => console.error('ERROR:', e));
        process.exitCode = 1;
      } else {
        console.log('Roadmap metadata OK:', result.roadmapId, '→ GitHub issue #' + result.issueNumber);
      }
    }
  }
}
