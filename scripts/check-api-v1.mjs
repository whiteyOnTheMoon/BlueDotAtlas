import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import {
  artifacts,
  openDatabase,
  renderJobs,
  stepProgress,
  videos,
} from '../packages/db/dist/index.js';

const origin = 'http://127.0.0.1:3117';
const email = process.env.BDA_ADMIN_EMAIL;
const password = process.env.BDA_TEST_ADMIN_PASSWORD;
if (
  process.env.BDA_DB_TEST !== '1' ||
  !email?.endsWith('.invalid') ||
  !password?.startsWith('SYNTHETIC-') ||
  !process.env.BDA_ADMIN_PASSWORD_HASH
) {
  throw new Error('Isolated CI test database and synthetic credentials are required');
}
const database = new URL(process.env.DATABASE_URL ?? '');
if (
  !['localhost', '127.0.0.1'].includes(database.hostname) ||
  database.pathname !== '/bda_test'
) {
  throw new Error('Refusing to run against non-test database');
}

const server = spawn(
  'pnpm',
  ['--filter', '@bluedotatlas/web', 'start', '--hostname', '127.0.0.1', '--port', '3117'],
  { cwd: process.cwd(), env: { ...process.env, NODE_ENV: 'production' }, stdio: ['ignore', 'pipe', 'pipe'] },
);
let output = '';
server.stdout.on('data', (data) => { output = (output + String(data)).slice(-3000); });
server.stderr.on('data', (data) => { output = (output + String(data)).slice(-3000); });

async function request(path, options = {}) {
  const response = await fetch(origin + path, { redirect: 'manual', ...options });
  const body = await response.text();
  assert.match(response.headers.get('cache-control') ?? '', /no-store/);
  return { response, body, data: body ? JSON.parse(body) : null };
}

async function expectProblem(path, options, status, code) {
  const { response, data, body } = await request(path, options);
  assert.equal(response.status, status, path + ': ' + body);
  assert.equal(data?.error?.code, code, path + ': ' + body);
  assert.equal(typeof data?.error?.message, 'string');
  assert.doesNotMatch(body, /(?:stack|postgresql:\/\/|node_modules|SQLSTATE|private-secret|Bearer )/i);
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    if (server.exitCode !== null) throw new Error('Next exited: ' + output);
    try {
      const ping = await fetch(origin + '/admin/login');
      if (ping.status === 200) {
        ready = true;
        break;
      }
    } catch { /* starting */ }
    await delay(500);
  }
  if (!ready) throw new Error('Next startup failed: ' + output);

  const resources = ['projects', 'videos', 'jobs', 'media'];
  for (const resource of resources) {
    await expectProblem('/api/v1/' + resource, {}, 401, 'unauthorized');
    await expectProblem('/api/v1/' + resource + '/' + randomUUID(), {}, 401, 'unauthorized');
    await expectProblem('/api/v1/' + resource + '?limit=bad', {}, 401, 'unauthorized');
  }
  await expectProblem('/api/v1/projects', { method: 'OPTIONS' }, 401, 'unauthorized');
  await expectProblem('/api/v1/projects', {
    method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: '{"title":"no"}',
  }, 401, 'unauthorized');
  await expectProblem('/api/v1/projects', {
    headers: { Cookie: '__Host-bda-session=' + 'a'.repeat(43) },
  }, 401, 'unauthorized');

  const login = await fetch(origin + '/api/auth/login', {
    method: 'POST',
    redirect: 'manual',
    headers: { origin, 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ email, password }),
  });
  assert.equal(login.status, 303);
  const cookie = (login.headers.get('set-cookie') ?? '').split(';')[0];
  assert.match(cookie, /^__Host-bda-session=/);
  const auth = { Cookie: cookie };
  const jsonHeaders = { ...auth, origin, 'content-type': 'application/json' };

  const empty = await request('/api/v1/projects?limit=2', { headers: auth });
  assert.equal(empty.response.status, 200);
  assert.equal(empty.data.limit, 2);
  assert.equal(empty.data.offset, 0);
  assert.ok(Array.isArray(empty.data.items));

  for (const path of [
    '/api/v1/projects?limit=0',
    '/api/v1/projects?limit=51',
    '/api/v1/projects?offset=-1',
    '/api/v1/projects?limit=2&limit=3',
    '/api/v1/projects?status=published',
    '/api/v1/projects?unexpected=value',
    '/api/v1/videos?kind=image',
    '/api/v1/jobs?status=not_a_status',
    '/api/v1/media?projectVersionId=not-a-uuid',
    '/api/v1/media?status=draft',
    '/api/v1/projects/not-a-uuid',
    '/api/v1/videos/not-a-uuid',
    '/api/v1/jobs/not-a-uuid',
    '/api/v1/media/not-a-uuid',
    '/api/v1/projects/' + randomUUID() + '?unknown=1',
  ]) {
    await expectProblem(path, { headers: auth }, 400, 'invalid_input');
  }
  for (const resource of resources) {
    await expectProblem('/api/v1/' + resource + '/' + randomUUID(), { headers: auth }, 404, 'not_found');
    await expectProblem('/api/v1/' + resource, {
      method: resource === 'projects' ? 'DELETE' : 'POST', headers: auth,
    }, 405, 'method_not_allowed');
  }
  await expectProblem('/api/v1/projects', {
    method: 'POST', headers: { ...auth, origin: 'https://cross-origin.invalid', 'content-type': 'application/json' },
    body: '{"title":"blocked"}',
  }, 403, 'forbidden_origin');
  await expectProblem('/api/v1/projects', {
    method: 'POST', headers: { ...auth, origin, 'content-type': 'text/plain' }, body: 'x',
  }, 415, 'unsupported_media_type');
  await expectProblem('/api/v1/projects', {
    method: 'POST', headers: jsonHeaders, body: '{bad json',
  }, 400, 'invalid_json');
  await expectProblem('/api/v1/projects', {
    method: 'POST', headers: jsonHeaders, body: '{"title":"ok","snapshot":{"secret":"private-secret"}}',
  }, 400, 'invalid_input');
  await expectProblem('/api/v1/projects', {
    method: 'POST', headers: jsonHeaders, body: '{"title":"  "}',
  }, 400, 'invalid_input');
  await expectProblem('/api/v1/projects', {
    method: 'POST', headers: jsonHeaders, body: JSON.stringify({ title: 'x'.repeat(8200) }),
  }, 413, 'body_too_large');

  const created = await request('/api/v1/projects', {
    method: 'POST', headers: jsonHeaders, body: '{"title":"   Arctic sea ice   "}',
  });
  assert.equal(created.response.status, 201, created.body);
  assert.equal(created.data.title, 'Arctic sea ice');
  assert.equal(created.data.status, 'draft');
  assert.equal(created.data.currentVersion, 1);
  assert.equal(created.response.headers.get('location'), '/api/v1/projects/' + created.data.id);

  const project = await request('/api/v1/projects/' + created.data.id, { headers: auth });
  assert.equal(project.response.status, 200);
  assert.equal(project.data.id, created.data.id);
  assert.equal(Object.hasOwn(project.data, 'deletedAt'), false);

  const connection = openDatabase();
  let video;
  let job;
  let media;
  let versionId;
  try {
    const versions = await connection.pool.query(
      'SELECT id FROM project_versions WHERE project_id = $1',
      [created.data.id],
    );
    assert.equal(versions.rows.length, 1);
    versionId = versions.rows[0].id;
    const steps = await connection.db.select().from(stepProgress);
    assert.equal(steps.filter((step) => step.projectVersionId === versionId).length, 7);
    [video] = await connection.db.insert(videos).values({
      projectId: created.data.id,
      projectVersionId: versionId,
      title: 'Arctic draft',
    }).returning();
    [job] = await connection.db.insert(renderJobs).values({
      projectVersionId: versionId,
      videoId: video.id,
      manifest: { privateSecret: 'private-secret-manifest' },
    }).returning();
    [media] = await connection.db.insert(artifacts).values({
      projectVersionId: versionId,
      kind: 'footage',
      storageKey: 'private-secret-storage-key',
      sourceUri: 'https://example.invalid/private-secret-source',
      licenseEvidence: 'private-secret-license',
    }).returning();
  } finally {
    await connection.pool.end();
  }

  for (const [resource, item] of [['videos', video], ['jobs', job], ['media', media]]) {
    const list = await request('/api/v1/' + resource + '?limit=2', { headers: auth });
    assert.equal(list.response.status, 200, list.body);
    assert.ok(list.data.items.some((entry) => entry.id === item.id));
    const detail = await request('/api/v1/' + resource + '/' + item.id, { headers: auth });
    assert.equal(detail.response.status, 200, detail.body);
    assert.equal(detail.data.id, item.id);
    assert.doesNotMatch(detail.body + list.body, /private-secret/);
    assert.equal(Object.hasOwn(detail.data, 'manifest'), false);
    assert.equal(Object.hasOwn(detail.data, 'storageKey'), false);
    assert.equal(Object.hasOwn(detail.data, 'sourceUri'), false);
  }
  for (const path of [
    '/api/v1/projects?status=draft',
    '/api/v1/videos?status=draft&projectId=' + created.data.id,
    '/api/v1/jobs?status=queued&projectVersionId=' + versionId,
    '/api/v1/media?kind=footage&projectVersionId=' + versionId,
  ]) {
    const list = await request(path, { headers: auth });
    assert.equal(list.response.status, 200, list.body);
    assert.ok(list.data.items.length > 0, 'filter returned nothing: ' + path);
  }
  const noResults = await request('/api/v1/videos?status=ready', { headers: auth });
  assert.equal(noResults.response.status, 200);
  assert.deepEqual(noResults.data.items, []);

  // Parent soft deletion hides every child response, not only the project row itself.
  const cleanup = openDatabase();
  try {
    await cleanup.pool.query('UPDATE video_projects SET deleted_at = NOW() WHERE id = $1', [created.data.id]);
  } finally {
    await cleanup.pool.end();
  }
  for (const [resource, id] of [
    ['projects', created.data.id], ['videos', video.id], ['jobs', job.id], ['media', media.id],
  ]) {
    await expectProblem('/api/v1/' + resource + '/' + id, { headers: auth }, 404, 'not_found');
  }

  const logout = await fetch(origin + '/api/auth/logout', {
    method: 'POST', headers: { ...auth, origin }, redirect: 'manual',
  });
  assert.equal(logout.status, 303);
  await expectProblem('/api/v1/projects', { headers: auth }, 401, 'unauthorized');
  process.stdout.write(
    'API v1 HTTP PASS: authorization, JSON/UUID/query/body/CSRF errors, persisted project, safe job/media DTOs, soft-delete isolation, revocation.\n',
  );
} finally {
  server.kill('SIGTERM');
}
