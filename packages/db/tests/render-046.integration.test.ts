import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { createProject, migrateDatabase, openDatabase } from '../src/index.js';
import {
  assertRender046TestEnvironment,
  cancelRender046,
  claimRender046,
  enqueueRender046,
  finishRender046,
  recoverRender046,
  requeueRender046,
} from '../src/render-046.js';
import { runRender046Once } from '../../../apps/worker/src/render-046.js';
import { LocalStorage } from '@bluedotatlas/storage';

assertRender046TestEnvironment();
const testRoot = await mkdtemp(join(tmpdir(), 'bda-storage-028-046-'));
process.env.BDA_046_TEST_STORAGE_ROOT = testRoot;
after(async () => {
  await rm(testRoot, { recursive: true, force: true });
});

test('046 real queued synthetic H264/AAC export, singleton artifact, reload and same-version submit', async () => {
  const first = openDatabase();
  try {
    await migrateDatabase(first);
    await migrateDatabase(first);
    const created = await createProject(first, { title: '046 synthetic original QA' });
    const [queuedA, queuedB] = await Promise.all([
      enqueueRender046(first, created.version.id),
      enqueueRender046(first, created.version.id),
    ]);
    assert.deepEqual(queuedA, queuedB, 'concurrent button presses must be idempotent');
    const before = await first.pool.query<{ status: string; progress_pct: number }>(
      'SELECT status, progress_pct FROM render_jobs WHERE id=$1::uuid',
      [queuedA.jobId],
    );
    assert.equal(before.rows[0]?.status, 'queued');
    assert.equal(before.rows[0]?.progress_pct, 0);

    assert.equal(await runRender046Once(), queuedA.jobId);
    const second = openDatabase();
    try {
      const output = await second.pool.query<{
        status: string;
        progress_pct: number;
        error_code: string | null;
        storage_key: string;
        checksum_sha256: string;
        rights_status: string;
        video_status: string;
        artifact_count: string;
      }>(
        `SELECT r.status, r.progress_pct, r.error_code,
                a.storage_key, a.checksum_sha256, a.rights_status,
                v.status AS video_status,
                (SELECT count(*)::text FROM artifacts WHERE storage_key=a.storage_key) AS artifact_count
         FROM render_jobs r
         JOIN videos v ON v.id=r.video_id
         JOIN artifacts a ON a.id=v.final_artifact_id
         WHERE r.id=$1::uuid`,
        [queuedA.jobId],
      );
      const row = output.rows[0];
      assert.ok(row, 'actual media must be committed with video and job');
      assert.equal(row.status, 'succeeded');
      assert.equal(row.progress_pct, 100);
      assert.equal(row.error_code, null);
      assert.equal(row.rights_status, 'unreviewed');
      assert.equal(row.video_status, 'rendered');
      assert.equal(row.artifact_count, '1');
      assert.equal(row.storage_key, `rendered/jobs/${queuedA.jobId}.mp4`);
      const storage = await LocalStorage.openIsolatedTestRoot(testRoot);
      const bytes = await storage.read(row.storage_key, 8_000_000);
      assert.ok(bytes.byteLength > 100_000 && bytes.byteLength < 8_000_000);
      assert.equal(createHash('sha256').update(bytes).digest('hex'), row.checksum_sha256);
      const qa = JSON.parse(
        await readFile(join(process.cwd(), '.tmp-render-046', queuedA.jobId + '.json'), 'utf8'),
      ) as { fileSha256: string; allVideoAndAudioDecoded: boolean; faststart: boolean };
      assert.equal(qa.fileSha256, row.checksum_sha256);
      assert.equal(qa.allVideoAndAudioDecoded, true);
      assert.equal(qa.faststart, true);
      assert.deepEqual(await enqueueRender046(second, created.version.id), queuedA);
      assert.equal(await runRender046Once(), null, 'completed job cannot render a second file');
    } finally {
      await second.pool.end();
    }
  } finally {
    await first.pool.end();
  }
});

test('046 concurrent claims, cancellation, stale token and recovery fail closed', async () => {
  const connection = openDatabase();
  try {
    const created = await createProject(connection, { title: '046 fenced negative paths' });
    const submitted = await enqueueRender046(connection, created.version.id);
    const [a, b] = await Promise.all([claimRender046(connection), claimRender046(connection)]);
    const owner = a ?? b;
    assert.ok(owner);
    assert.equal([a, b].filter(Boolean).length, 1);
    assert.equal(owner.id, submitted.jobId);
    assert.equal(await cancelRender046(connection, submitted.jobId), true);
    assert.equal(
      await finishRender046(connection, owner, {
        storageKey: `rendered/jobs/${owner.id}.mp4`,
        sha256: 'a'.repeat(64),
        sizeBytes: 5_000_000,
      }),
      false,
      'cancelled owner cannot insert final artifacts',
    );
    const cancelled = await connection.pool.query<{ status: string }>(
      'SELECT status FROM render_jobs WHERE id=$1::uuid',
      [owner.id],
    );
    assert.equal(cancelled.rows[0]?.status, 'cancelled');

    const another = await createProject(connection, { title: '046 recovery' });
    const next = await enqueueRender046(connection, another.version.id);
    const first = await claimRender046(connection);
    assert.ok(first);
    assert.equal(first.id, next.jobId);
    await connection.pool.query(
      "UPDATE render_jobs SET lease_expires_at = NOW() - INTERVAL '1 second' WHERE id=$1::uuid",
      [next.jobId],
    );
    assert.equal(await recoverRender046(connection), 1);
    assert.equal(await requeueRender046(connection), 0);
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(await requeueRender046(connection), 1);
    const retry = await claimRender046(connection);
    assert.ok(retry);
    assert.notEqual(first.leaseToken, retry.leaseToken);
    assert.equal(retry.attempt, 2);
    assert.equal(
      await finishRender046(connection, first, {
        storageKey: `rendered/jobs/${first.id}.mp4`,
        sha256: 'b'.repeat(64),
        sizeBytes: 5_000_000,
      }),
      false,
    );
    assert.ok(await cancelRender046(connection, next.jobId));
    assert.equal(await claimRender046(connection), null);
  } finally {
    await connection.pool.end();
  }
});

test('046 refuses non-CI, remote database and arbitrary project/manifests', async () => {
  const current = process.env.BDA_RENDER_046_SYNTHETIC_PROOF;
  delete process.env.BDA_RENDER_046_SYNTHETIC_PROOF;
  assert.throws(assertRender046TestEnvironment, /disposable CI/);
  process.env.BDA_RENDER_046_SYNTHETIC_PROOF = current;

  const url = process.env.DATABASE_URL;
  assert.ok(url);
  process.env.DATABASE_URL = url.replace('localhost', 'remote.invalid');
  assert.throws(assertRender046TestEnvironment, /non-isolated database/);
  process.env.DATABASE_URL = url;

  const connection = openDatabase();
  try {
    await assert.rejects(
      enqueueRender046(connection, '00000000-0000-4000-8000-000000000000'),
      /revision unavailable/,
    );
    const created = await createProject(connection, { title: '046 foreign manifest ignored' });
    await connection.pool.query(
      `INSERT INTO render_jobs (project_version_id, manifest)
       VALUES ($1::uuid, '{"kind":"arbitrary_remote_render","path":"/etc/passwd"}'::jsonb)`,
      [created.version.id],
    );
    assert.equal(await claimRender046(connection), null);
  } finally {
    await connection.pool.end();
  }
});
