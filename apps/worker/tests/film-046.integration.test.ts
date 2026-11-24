import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { createProject, migrateDatabase, openDatabase } from '@bluedotatlas/db';
import {
  assertRender046ExecutionEnvironment,
  claimRender046,
  enqueueRender046,
  failRender046,
  requeueRender046,
  RENDER_046_FILM_MANIFEST,
} from '@bluedotatlas/db/queue-046';
import { LocalStorage } from '@bluedotatlas/storage';
import {
  FILM_046_ADMISSION_MIB,
  memAvailableMiB,
  progressFromLine,
  runPilotFilm046Once,
} from '../src/film-046.js';

assertRender046ExecutionEnvironment('pilot_film');
const storageRoot = await mkdtemp(join(tmpdir(), 'bda-storage-028-046-film-'));
const scratch = await mkdtemp(join(tmpdir(), 'bda-046-film-scratch-'));
process.env.BDA_046_TEST_STORAGE_ROOT = storageRoot;
process.env.BDA_046_FILM_TEST_SCRATCH = scratch;
after(async () => {
  await rm(storageRoot, { recursive: true, force: true });
  await rm(scratch, { recursive: true, force: true });
});

test('046 film progress parsing and host-memory admission helpers', () => {
  assert.equal(progressFromLine('046 FFMPEG PART 1/11: 66f PASS'), 13);
  assert.equal(progressFromLine('046 FFMPEG PART 11/11: 171f PASS'), 95);
  assert.equal(progressFromLine('046 FFMPEG VECTOR S03: 223 frames'), null);
  assert.equal(progressFromLine('046 FFMPEG PART 12/11: x'), null);
  assert.equal(memAvailableMiB('MemTotal: 1 kB\nMemAvailable:    3145728 kB\n'), 3072);
  assert.equal(memAvailableMiB('garbage'), 0);
  assert.equal(FILM_046_ADMISSION_MIB, 768 + 2048 + 256);
});

test('046 admin-queued private film: separate manifest, worker render, atomic commit, no retry', async () => {
  const connection = openDatabase();
  try {
    await migrateDatabase(connection);
    const created = await createProject(connection, { title: '046 private pilot film queue' });
    const [a, b] = await Promise.all([
      enqueueRender046(connection, created.version.id, 'pilot_film'),
      enqueueRender046(connection, created.version.id, 'pilot_film'),
    ]);
    assert.deepEqual(a, b, 'double click must give one film job');
    const synthetic = await enqueueRender046(connection, created.version.id, 'synthetic');
    assert.notEqual(synthetic.jobId, a.jobId, 'film and synthetic jobs are independent');
    const row = await connection.pool.query<{
      manifest: unknown;
      max_attempts: number;
      title: string;
    }>(
      `SELECT r.manifest, r.max_attempts, v.title FROM render_jobs r
       JOIN videos v ON v.id = r.video_id WHERE r.id = $1::uuid`,
      [a.jobId],
    );
    assert.deepEqual(row.rows[0]?.manifest, RENDER_046_FILM_MANIFEST);
    assert.equal(row.rows[0]?.max_attempts, 1);
    assert.match(row.rows[0]?.title ?? '', /not for publication/);

    assert.equal(await runPilotFilm046Once(), a.jobId);
    const done = await connection.pool.query<{
      status: string;
      progress_pct: number;
      error_code: string | null;
      video_status: string;
      duration_ms: number;
      rights_status: string;
      storage_key: string;
      checksum_sha256: string;
    }>(
      `SELECT r.status, r.progress_pct, r.error_code, v.status AS video_status, v.duration_ms,
              a.rights_status, a.storage_key, a.checksum_sha256
       FROM render_jobs r JOIN videos v ON v.id = r.video_id
       JOIN artifacts a ON a.id = v.final_artifact_id WHERE r.id = $1::uuid`,
      [a.jobId],
    );
    const film = done.rows[0];
    assert.ok(film);
    assert.equal(film.status, 'succeeded');
    assert.equal(film.progress_pct, 100);
    assert.equal(film.error_code, null);
    assert.equal(film.video_status, 'rendered');
    assert.equal(film.rights_status, 'unreviewed');
    assert.equal(film.duration_ms, 1400, 'synthetic CI film is 42 frames at 30fps');
    assert.equal(film.storage_key, `rendered/jobs/${a.jobId}.mp4`);
    const storage = await LocalStorage.openIsolatedTestRoot(storageRoot);
    const bytes = await storage.read(film.storage_key, 32_000_000);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), film.checksum_sha256);
    assert.equal(existsSync(join(scratch, 'jobs', a.jobId)), false, 'scratch copy removed');
    const published = await connection.pool.query<{ n: number }>(
      "SELECT count(*)::int AS n FROM videos WHERE status = 'published'",
    );
    assert.equal(published.rows[0]?.n, 0);

    // Synthetic job untouched by the film worker; the film is not rendered twice.
    const syntheticState = await connection.pool.query<{ status: string }>(
      'SELECT status FROM render_jobs WHERE id = $1::uuid',
      [synthetic.jobId],
    );
    assert.equal(syntheticState.rows[0]?.status, 'queued');
    assert.equal(await runPilotFilm046Once(), null);
    assert.deepEqual(await enqueueRender046(connection, created.version.id, 'pilot_film'), a);
  } finally {
    await connection.pool.end();
  }
});

test('046 failed film job is never auto-retried and only allowed error codes persist', async () => {
  const connection = openDatabase();
  try {
    const created = await createProject(connection, { title: '046 film failure path' });
    const job = await enqueueRender046(connection, created.version.id, 'pilot_film');
    assert.equal(
      await claimRender046(connection, 'synthetic').then((c) => c?.id === job.jobId),
      false,
    );
    const claim = await claimRender046(connection, 'pilot_film');
    assert.ok(claim);
    assert.equal(claim.id, job.jobId);
    await assert.rejects(
      // @ts-expect-error runtime guard against arbitrary error text
      failRender046(connection, claim, 'pilot_film', 'rm -rf /'),
      /invalid error code/,
    );
    assert.equal(
      await failRender046(connection, claim, 'pilot_film', 'host_memory_pressure'),
      true,
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(await requeueRender046(connection, 'pilot_film'), 0, 'max_attempts=1: no retry');
    const state = await connection.pool.query<{ status: string; error_code: string }>(
      'SELECT status, error_code FROM render_jobs WHERE id = $1::uuid',
      [job.jobId],
    );
    assert.deepEqual(state.rows[0], { status: 'failed', error_code: 'host_memory_pressure' });
    assert.equal(await claimRender046(connection, 'pilot_film'), null);
  } finally {
    await connection.pool.end();
  }
});

test('046 film VPS gate refuses CI, test databases and missing production identity', () => {
  const saved = { ...process.env };
  try {
    process.env.BDA_RENDER_046_VPS_PILOT_FILM = 'TRUE';
    assert.throws(() => assertRender046ExecutionEnvironment('pilot_film'), /synthetic-only/);
    delete process.env.BDA_RENDER_046_VPS_PILOT_FILM;
    delete process.env.BDA_RENDER_046_SYNTHETIC_PROOF;
    assert.throws(() => assertRender046ExecutionEnvironment('pilot_film'), /disposable CI/);
  } finally {
    process.env = saved;
  }
});
