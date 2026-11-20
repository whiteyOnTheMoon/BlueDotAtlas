import { randomUUID } from 'node:crypto';
import type { ReturnTypeOfOpenDatabase } from './types.js';
import { assertSyntheticTestDatabase } from './queue-service.js';

export const RENDER_046_KIND = 'original_synthetic_046';
export const RENDER_046_MANIFEST = Object.freeze({
  kind: RENDER_046_KIND,
  profile: '1080p30-h264-aac-faststart',
  scope: 'SYNTHETIC_EXPORT_QA_ONLY',
});

export type Render046Claim = {
  id: string;
  videoId: string;
  leaseToken: string;
  attempt: number;
};

export function assertRender046TestEnvironment(): void {
  assertSyntheticTestDatabase();
  if (
    process.env.CI !== 'true' ||
    process.env.BDA_RENDER_046_SYNTHETIC_PROOF !== 'TRUE' ||
    process.env.BDA_STORAGE_TEST !== '1'
  ) {
    throw new Error('046 requires a disposable CI, isolated DB and synthetic storage only');
  }
}

/** Concurrent submit of the same revision is idempotent, even after a completed test. */
export async function enqueueRender046(
  { pool }: ReturnTypeOfOpenDatabase,
  projectVersionId: string,
): Promise<{ jobId: string; videoId: string }> {
  assertRender046TestEnvironment();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1::text, 46))', [
      projectVersionId,
    ]);
    const project = await client.query<{ project_id: string }>(
      `SELECT v.project_id FROM project_versions v
       JOIN video_projects p ON p.id = v.project_id
       WHERE v.id = $1::uuid AND v.deleted_at IS NULL
         AND p.deleted_at IS NULL AND p.status <> 'archived'`,
      [projectVersionId],
    );
    if (!project.rows[0]) throw new Error('046 project revision unavailable');
    const prior = await client.query<{ id: string; video_id: string }>(
      `SELECT id, video_id FROM render_jobs
       WHERE project_version_id = $1::uuid AND manifest = $2::jsonb
         AND deleted_at IS NULL AND status <> 'cancelled'
       ORDER BY created_at ASC, id ASC LIMIT 1`,
      [projectVersionId, JSON.stringify(RENDER_046_MANIFEST)],
    );
    if (prior.rows[0]?.video_id) {
      await client.query('COMMIT');
      return { jobId: prior.rows[0].id, videoId: prior.rows[0].video_id };
    }
    const video = await client.query<{ id: string }>(
      `INSERT INTO videos (project_id, project_version_id, title, status)
       VALUES ($1::uuid, $2::uuid, '046 original synthetic 8s QA only', 'draft')
       RETURNING id`,
      [project.rows[0].project_id, projectVersionId],
    );
    if (!video.rows[0]) throw new Error('046 video row not created');
    const job = await client.query<{ id: string }>(
      `INSERT INTO render_jobs (project_version_id, video_id, manifest, max_attempts)
       VALUES ($1::uuid, $2::uuid, $3::jsonb, 2) RETURNING id`,
      [projectVersionId, video.rows[0].id, JSON.stringify(RENDER_046_MANIFEST)],
    );
    if (!job.rows[0]) throw new Error('046 job row not created');
    await client.query('COMMIT');
    return { jobId: job.rows[0].id, videoId: video.rows[0].id };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/** Separate queue from 027: its old synthetic executor never claims 046 jobs. */
export async function claimRender046({
  pool,
}: ReturnTypeOfOpenDatabase): Promise<Render046Claim | null> {
  assertRender046TestEnvironment();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const rows = await client.query<{ id: string; video_id: string }>(
      `SELECT r.id, r.video_id FROM render_jobs r
       JOIN project_versions v ON v.id = r.project_version_id
       JOIN video_projects p ON p.id = v.project_id
       WHERE r.status = 'queued' AND r.manifest = $1::jsonb
         AND r.video_id IS NOT NULL AND r.attempt < r.max_attempts AND r.available_at <= NOW()
         AND r.deleted_at IS NULL AND v.deleted_at IS NULL AND p.deleted_at IS NULL
       ORDER BY r.created_at ASC, r.id ASC
       FOR UPDATE OF r SKIP LOCKED LIMIT 1`,
      [JSON.stringify(RENDER_046_MANIFEST)],
    );
    if (!rows.rows[0]) {
      await client.query('COMMIT');
      return null;
    }
    const leaseToken = randomUUID();
    const updated = await client.query<{ attempt: number }>(
      `UPDATE render_jobs
       SET status = 'running', attempt = attempt + 1,
           lease_token = $2::uuid, lease_expires_at = NOW() + INTERVAL '30 seconds',
           heartbeat_at = NOW(), started_at = NOW(), finished_at = NULL,
           error_code = NULL, progress_pct = 0, updated_at = NOW()
       WHERE id = $1::uuid AND status = 'queued'
       RETURNING attempt`,
      [rows.rows[0].id, leaseToken],
    );
    if (!updated.rows[0]) throw new Error('046 claim lost');
    await client.query('COMMIT');
    return {
      id: rows.rows[0].id,
      videoId: rows.rows[0].video_id,
      leaseToken,
      attempt: updated.rows[0].attempt,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/** Expired owners cannot commit an artifact; retry may reuse an identical immutable file. */
export async function recoverRender046({ pool }: ReturnTypeOfOpenDatabase): Promise<number> {
  assertRender046TestEnvironment();
  const result = await pool.query(
    `UPDATE render_jobs
     SET status = 'failed', error_code = 'lease_expired',
         lease_token = NULL, lease_expires_at = NULL,
         finished_at = NOW(), available_at = NOW() + INTERVAL '300 milliseconds',
         updated_at = NOW()
     WHERE status = 'running' AND lease_expires_at <= NOW()
       AND manifest = $1::jsonb RETURNING id`,
    [JSON.stringify(RENDER_046_MANIFEST)],
  );
  return result.rowCount ?? 0;
}

export async function requeueRender046({ pool }: ReturnTypeOfOpenDatabase): Promise<number> {
  assertRender046TestEnvironment();
  const result = await pool.query(
    `UPDATE render_jobs SET status = 'queued', finished_at = NULL, updated_at = NOW()
     WHERE status = 'failed' AND attempt < max_attempts
       AND manifest = $1::jsonb AND available_at <= NOW() AND deleted_at IS NULL
       AND EXISTS (
         SELECT 1 FROM project_versions v JOIN video_projects p ON p.id = v.project_id
         WHERE v.id = render_jobs.project_version_id
           AND v.deleted_at IS NULL AND p.deleted_at IS NULL
       ) RETURNING id`,
    [JSON.stringify(RENDER_046_MANIFEST)],
  );
  return result.rowCount ?? 0;
}

export async function failRender046(
  { pool }: ReturnTypeOfOpenDatabase,
  claim: Render046Claim,
): Promise<boolean> {
  assertRender046TestEnvironment();
  const result = await pool.query(
    `UPDATE render_jobs
     SET status = 'failed', error_code = 'synthetic_render_failed',
         lease_token = NULL, lease_expires_at = NULL, finished_at = NOW(),
         available_at = NOW() + INTERVAL '300 milliseconds', updated_at = NOW()
     WHERE id = $1::uuid AND lease_token = $2::uuid
       AND status = 'running' AND lease_expires_at > NOW()
       AND manifest = $3::jsonb RETURNING id`,
    [claim.id, claim.leaseToken, JSON.stringify(RENDER_046_MANIFEST)],
  );
  return result.rowCount === 1;
}

export async function cancelRender046(
  { pool }: ReturnTypeOfOpenDatabase,
  id: string,
): Promise<boolean> {
  assertRender046TestEnvironment();
  const result = await pool.query(
    `UPDATE render_jobs SET status = 'cancelled', lease_token = NULL,
       lease_expires_at = NULL, finished_at = NOW(), updated_at = NOW()
     WHERE id = $1::uuid AND status IN ('queued', 'running', 'failed')
       AND manifest = $2::jsonb RETURNING id`,
    [id, JSON.stringify(RENDER_046_MANIFEST)],
  );
  return result.rowCount === 1;
}

/** Artifact + video status + job success commit atomically after the real media QA. */
export async function finishRender046(
  { pool }: ReturnTypeOfOpenDatabase,
  claim: Render046Claim,
  file: { storageKey: string; sha256: string; sizeBytes: number },
): Promise<boolean> {
  assertRender046TestEnvironment();
  if (
    file.storageKey !== `rendered/jobs/${claim.id}.mp4` ||
    !/^[a-f0-9]{64}$/.test(file.sha256) ||
    !Number.isSafeInteger(file.sizeBytes) ||
    file.sizeBytes < 100_000 ||
    file.sizeBytes > 8_000_000
  ) {
    throw new Error('046 invalid committed output');
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const current = await client.query<{ project_version_id: string; video_id: string }>(
      `SELECT project_version_id, video_id FROM render_jobs
       WHERE id = $1::uuid AND lease_token = $2::uuid
         AND status = 'running' AND lease_expires_at > NOW()
         AND manifest = $3::jsonb FOR UPDATE`,
      [claim.id, claim.leaseToken, JSON.stringify(RENDER_046_MANIFEST)],
    );
    if (!current.rows[0] || current.rows[0].video_id !== claim.videoId) {
      await client.query('ROLLBACK');
      return false;
    }
    const artifact = await client.query<{ id: string }>(
      `INSERT INTO artifacts (project_version_id, kind, rights_status, storage_key, checksum_sha256)
       VALUES ($1::uuid, 'render', 'unreviewed', $2, $3) RETURNING id`,
      [current.rows[0].project_version_id, file.storageKey, file.sha256],
    );
    if (!artifact.rows[0]) throw new Error('046 artifact not inserted');
    const video = await client.query(
      `UPDATE videos SET status = 'rendered', final_artifact_id = $2::uuid,
         duration_ms = 8000, updated_at = NOW()
       WHERE id = $1::uuid AND status = 'draft' AND final_artifact_id IS NULL
       RETURNING id`,
      [claim.videoId, artifact.rows[0].id],
    );
    if (video.rowCount !== 1) throw new Error('046 video already finalized');
    const job = await client.query(
      `UPDATE render_jobs SET status = 'succeeded', progress_pct = 100,
         finished_at = NOW(), updated_at = NOW(), lease_token = NULL,
         lease_expires_at = NULL, heartbeat_at = NOW(), error_code = NULL
       WHERE id = $1::uuid AND lease_token = $2::uuid
         AND status = 'running' AND lease_expires_at > NOW()
       RETURNING id`,
      [claim.id, claim.leaseToken],
    );
    if (job.rowCount !== 1) throw new Error('046 lost ownership before commit');
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
