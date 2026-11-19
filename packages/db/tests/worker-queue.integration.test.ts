import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { createProject, migrateDatabase, openDatabase } from '../src/index.js';
import {
  assertSyntheticTestDatabase,
  cancelJob,
  claimNextJob,
  enqueueSyntheticJob,
  failJob,
  heartbeatJob,
  recoverExpiredJobs,
  requeueDueJobs,
  succeedJob,
} from '../src/queue-service.js';

assertSyntheticTestDatabase();

async function inspect(pool: ReturnType<typeof openDatabase>['pool'], id: string) {
  const result = await pool.query<{
    status: string;
    attempt: number;
    max_attempts: number;
    progress_pct: number;
    error_code: string | null;
    lease_token: string | null;
    heartbeat_at: Date | null;
  }>(
    'SELECT status, attempt, max_attempts, progress_pct, error_code, lease_token, heartbeat_at FROM render_jobs WHERE id = $1::uuid',
    [id],
  );
  assert.ok(result.rows[0], 'expected test job');
  return result.rows[0];
}

test('migration 0003, exclusive concurrent SKIP LOCKED claim, heartbeat and success', async () => {
  const a = openDatabase();
  const b = openDatabase();
  try {
    await migrateDatabase(a);
    await migrateDatabase(a);
    const created = await createProject(a, { title: 'Synthetic 027 queue race' });
    const id = await enqueueSyntheticJob(a, created.version.id, { durationMs: 400 });
    const claims = await Promise.all([claimNextJob(a), claimNextJob(b)]);
    assert.equal(claims.filter(Boolean).length, 1, 'one job cannot be owned twice');
    const owner = claims.find((claim) => claim !== null);
    assert.ok(owner);
    assert.equal(owner.attempt, 1);
    assert.equal(owner.maxAttempts, 3);
    assert.ok(await heartbeatJob(a, owner, 2000, 40));
    assert.equal((await inspect(a.pool, id)).progress_pct, 40);
    assert.ok((await inspect(a.pool, id)).heartbeat_at instanceof Date);
    assert.equal(
      await succeedJob(b, { id, leaseToken: '00000000-0000-4000-8000-000000000001' }),
      false,
    );
    assert.ok(await succeedJob(a, owner));
    assert.equal((await inspect(a.pool, id)).status, 'succeeded');
    assert.equal((await inspect(a.pool, id)).progress_pct, 100);
    assert.equal((await inspect(a.pool, id)).lease_token, null);
    assert.equal(await succeedJob(a, owner), false, 'completed job cannot finish twice');
  } finally {
    await Promise.all([a.pool.end(), b.pool.end()]);
  }
});

test('expired claim cannot heartbeat or finish; recovery fences old token and retries once', async () => {
  const a = openDatabase();
  try {
    const created = await createProject(a, { title: 'Synthetic 027 crash recovery' });
    const id = await enqueueSyntheticJob(a, created.version.id, { durationMs: 300 });
    const first = await claimNextJob(a, 500);
    assert.ok(first);
    await delay(670);
    assert.equal(await heartbeatJob(a, first, 500), false);
    assert.equal(await succeedJob(a, first), false, 'expired token must never commit success');
    assert.equal(await recoverExpiredJobs(a), 1);
    assert.equal((await inspect(a.pool, id)).status, 'failed');
    assert.equal((await inspect(a.pool, id)).error_code, 'lease_expired');
    assert.equal(await requeueDueJobs(a), 0, 'backoff must prevent busy-loop retries');
    await delay(380);
    assert.equal(await requeueDueJobs(a), 1);
    const second = await claimNextJob(a);
    assert.ok(second);
    assert.equal(second.id, id);
    assert.notEqual(first.leaseToken, second.leaseToken);
    assert.equal(second.attempt, 2);
    assert.equal(await succeedJob(a, first), false);
    assert.equal(await heartbeatJob(a, first), false);
    assert.equal(await succeedJob(a, second), true);
    assert.equal((await inspect(a.pool, id)).status, 'succeeded');
  } finally {
    await a.pool.end();
  }
});

test('failed→queued backoff, max-attempt cap and cancellation protect against late writes', async () => {
  const a = openDatabase();
  try {
    const created = await createProject(a, { title: 'Synthetic 027 retry and cancel' });
    const failId = await enqueueSyntheticJob(a, created.version.id, {
      durationMs: 200,
      maxAttempts: 1,
    });
    const failed = await claimNextJob(a);
    assert.ok(failed);
    assert.equal(await failJob(a, failed, 'synthetic_failure'), true);
    assert.equal((await inspect(a.pool, failId)).status, 'failed');
    await delay(360);
    assert.equal(await requeueDueJobs(a), 0, 'attempt=1/maxAttempts=1 is terminal');
    assert.equal((await inspect(a.pool, failId)).status, 'failed');

    const beforeId = await enqueueSyntheticJob(a, created.version.id, { durationMs: 200 });
    assert.ok(await cancelJob(a, beforeId));
    assert.equal((await inspect(a.pool, beforeId)).status, 'cancelled');
    assert.equal(await cancelJob(a, beforeId), false);

    const runningId = await enqueueSyntheticJob(a, created.version.id, { durationMs: 300 });
    const claim = await claimNextJob(a);
    assert.ok(claim);
    assert.equal(claim.id, runningId);
    assert.ok(await cancelJob(a, runningId));
    assert.equal(await heartbeatJob(a, claim), false);
    assert.equal(await succeedJob(a, claim), false);
    assert.equal(await failJob(a, claim, 'worker_stopped'), false);
    assert.equal((await inspect(a.pool, runningId)).status, 'cancelled');
  } finally {
    await a.pool.end();
  }
});

test('only synthetic jobs under active parents are reservable, invalid flags cannot seed', async () => {
  const a = openDatabase();
  try {
    const created = await createProject(a, { title: 'Synthetic 027 active parent required' });
    const unrelated = await a.pool.query<{ id: string }>(
      'INSERT INTO render_jobs (project_version_id, manifest) VALUES ($1::uuid, $2::jsonb) RETURNING id',
      [created.version.id, JSON.stringify({ kind: 'unreviewed_render', arbitrary: 'payload' })],
    );
    assert.ok(unrelated.rows[0]);
    assert.equal(await cancelJob(a, unrelated.rows[0].id), false, 'test-only cancel cannot touch other jobs');
    assert.equal(await claimNextJob(a), null, 'unreviewed manifest cannot execute');
    const id = await enqueueSyntheticJob(a, created.version.id, { durationMs: 200 });
    await a.pool.query('UPDATE video_projects SET deleted_at = NOW() WHERE id = $1::uuid', [
      created.project.id,
    ]);
    assert.equal(await claimNextJob(a), null, 'soft-deleted project cannot run a job');
    assert.equal((await inspect(a.pool, id)).status, 'queued');
    await assert.rejects(
      enqueueSyntheticJob(a, created.version.id, { durationMs: 99999 }),
      /Invalid bounded synthetic queue input/,
    );
    const flag = process.env.BDA_WORKER_SYNTHETIC_TEST;
    delete process.env.BDA_WORKER_SYNTHETIC_TEST;
    try {
      await assert.rejects(enqueueSyntheticJob(a, created.version.id, { durationMs: 200 }));
    } finally {
      process.env.BDA_WORKER_SYNTHETIC_TEST = flag;
    }
    const url = process.env.DATABASE_URL;
    assert.ok(url);
    process.env.DATABASE_URL = url + '?host=untrusted.invalid';
    try {
      assert.throws(assertSyntheticTestDatabase, /non-isolated database/);
    } finally {
      process.env.DATABASE_URL = url;
    }
  } finally {
    await a.pool.end();
  }
});
