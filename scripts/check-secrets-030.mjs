#!/usr/bin/env node
/**
 * 030: conservative tracked-file leak guard. Reports only paths and finding
 * categories, never a matched secret or the offending source line.
 * Pattern checks are defense-in-depth, NOT a comprehensive secret detector.
 */
import { execFileSync } from 'node:child_process';
import { lstatSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const patterns = [
  ['private-key-header', /-----BEGIN\s+(?:[A-Z]+\s+)?PRIVATE\s+KEY-----/],
  ['github-credential', /(?:gh[pousr]_[A-Za-z0-9_]{30,}|github_pat_[A-Za-z0-9_]{20,})/],
  ['provider-credential', /(?:sk-(?:proj-)?[A-Za-z0-9_-]{40,}|xox[baprs]-[A-Za-z0-9-]{20,}|AKIA[0-9A-Z]{16})/],
  ['public-secret-variable', /NEXT_PUBLIC_[A-Z0-9_]*(?:API_KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|DATABASE_URL)\s*[:=]/],
];

export function inspectFile(relativePath, source) {
  const results = [];
  const filename = path.posix.basename(relativePath.replaceAll('\\', '/'));
  if (
    filename === '.env' ||
    (filename.startsWith('.env.') && !filename.endsWith('.example')) ||
    /\.(?:pem|p12|pfx)$/i.test(filename)
  ) {
    results.push('tracked-private-file');
  }

  if (typeof source !== 'string') return results;
  for (const [name, expression] of patterns) {
    if (expression.test(source)) results.push(name);
  }
  if (
    /\.(?:ts|tsx|js|jsx|mjs)$/i.test(filename) &&
    /^\s*(['"])use client\1\s*;?/m.test(source.slice(0, 500)) &&
    /process\.env\.(?:BDA_[A-Z0-9_]+|DATABASE_URL|POSTGRES_PASSWORD|CLOUDFLARE_API_TOKEN)/.test(source)
  ) {
    results.push('client-bundled-server-secret');
  }
  return results;
}

export function inspectIgnoreRules(gitignore, dockerignore) {
  const found = [];
  for (const value of ['.env', '.env.*', '!.env.example']) {
    if (!gitignore.split(/\r?\n/).includes(value)) found.push('gitignore-missing-rule');
  }
  for (const value of ['.env', '.env.*', '**/.env.*']) {
    if (!dockerignore.split(/\r?\n/).includes(value)) found.push('dockerignore-missing-rule');
  }
  return [...new Set(found)];
}

export function scanRepository(directory = root) {
  const tracked = execFileSync('git', ['ls-files', '-z'], { cwd: directory })
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  const findings = [];
  let scannedText = 0;
  for (const relativePath of tracked) {
    const fullPath = path.join(directory, relativePath);
    const stat = lstatSync(fullPath);
    if (stat.isSymbolicLink()) {
      // Do not follow a tracked symlink into a private host file.
      if (path.basename(relativePath).startsWith('.env')) {
        findings.push({ path: relativePath, kind: 'tracked-env-symlink' });
      }
      continue;
    }
    if (!stat.isFile()) continue;
    if (stat.size > 5 * 1024 * 1024) continue; // Large non-source/media files.
    const buffer = readFileSync(fullPath);
    if (buffer.includes(0)) continue; // Binary assets, including original PDF.
    const source = buffer.toString('utf8');
    scannedText += 1;
    for (const kind of inspectFile(relativePath, source)) {
      findings.push({ path: relativePath, kind });
    }
  }
  const gitignore = readFileSync(path.join(directory, '.gitignore'), 'utf8');
  const dockerignore = readFileSync(path.join(directory, '.dockerignore'), 'utf8');
  for (const kind of inspectIgnoreRules(gitignore, dockerignore)) {
    findings.push({ path: 'ignore-rules', kind });
  }
  return { tracked: tracked.length, scannedText, findings };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = scanRepository();
    if (result.findings.length > 0) {
      // No matching values, source lines, or content excerpts in CI logs.
      for (const finding of result.findings) {
        console.error('030 FAIL: ' + finding.kind + ' (' + finding.path + ')');
      }
      process.exitCode = 1;
    } else {
      console.log(
        '030 tracked-file leak scan: PASS (' +
          result.scannedText +
          ' text files; ' +
          result.tracked +
          ' tracked entries).',
      );
    }
  } catch {
    // Avoid echoing thrown error details: they can contain URL credentials.
    console.error('030 FAIL: repository scan unavailable');
    process.exitCode = 1;
  }
}
