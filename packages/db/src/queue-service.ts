import { randomUUID } from 'node:crypto';
import type { ReturnTypeOfOpenDatabase } from './types.js';

export type QueueClaim = {
  id: string;
  leaseToken: string;
  attempt: number;
  maxAttempts: number;
  manifest: unknown;
};
export type QueueFailureCode =
  | 'synthetic_failure'
  | 'worker_stopped'
  | 'invalid_synthetic_manifest'
  | 'lease_expired';

function validLeaseMs(ms: number) {
  if (!Number.isInteger(ms) || ms < 500 || ms > 30_000) {
    throw new RangeError('Lease duration must be 500–30000ms');
  }
  return ms;
}

/** Hard-stop synthetic seeding: never operate on a live database or remote DB. */
export function assertSyntheticTestDatabase() {
  const raw = process.env.DATABASE_URL;
  if (process.env.BDA_DB_TEST !== '1' || process.env.BDA_WORKER_SYNTHETIC_TEST !== '1' || !raw) {
    throw new Error('Synthetic queue tests require explicit test-only environment flags');
  }
  const parsed = new URL(raw);
  if (
    !['localhost', '127.0.0.1'].includes(parsed.hostname) ||
    parsed.pathname !== '/bda_test'
  ) {
    throw new Error('Refusing synthetic worker operation on a non-isolated database');
  }
}

export async function enqueueSyntheticJob(
  { pool }: ReturnTypeOfOpenDatabase,
  projectVersionId: string,
  options: { durationMs: number; failUntilAttempt?: number; maxAttempts?: number },
) {
  assertSyntheticTestDatabase();
  const { durationMs, failUntilAttempt = 0, maxAttempts = 3 } = options;
  if (
    !Number.isInteger(durationMs) ||
    durationMs < 200 ||
    durationMs > 5_000 ||
    !Number.isInteger(maxAttempts) ||
    maxAttempts < 1 ||
    maxAttempts > 3 ||
    !Number.isInteger(failUntilAttempt) ||
    failUntilAttempt < 0 ||
    failUntilAttempt >= maxAttempts
  ) {
    throw new RangeError('Invalid bounded synthetic queue input');
  }
  const manifest = { kind: 'synthetic_027', durationMs, failUntilAttempt };
  const result = await pool.query<{ id: string }>(
    \`INSERT INTO render_jobs (project_version_id, manifest, max_attempts)
     VALUES ($1::uuid, $2::jsonb, $3::integer) RETURNING id\`,
    [projectVersionId, JSON.stringify(manifest), maxAttempts],
  );
  if (!result.rows[0]) throw new Error('Unable to create synthetic queue job');
  return result.rows[0].id;
}

/** The row lock is held only while claiming, NEVER during synthetic work. */
export async function claimNextJob(
  { pool }: ReturnTypeOfOpenDatabase,
  leaseMs = 2_000,
): Promise<QueueClaim | null> {
  validLeaseMs(leaseMs);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const selected = await client.query<{ id: string }>(
      \`SELECT r.id
       FROM render_jobs AS r
       JOIN project_versions AS v ON v.id = r.project_version_id
       JOIN video_projects AS p ON p.id = v.project_id
       WHERE r.status = 'queued'
         AND r.available_at <= NOW()
         AND r.attempt < r.max_attempts
         AND r.deleted_at IS NULL AND v.deleted_at IS NULL AND p.deleted_at IS NULL
       ORDER BY r.created_at ASC, r.id ASC
       FOR UPDATE OF r SKIP LOCKED
       LIMIT 1\`,
    );
    if (!selected.rows[0]) {
      await client.query('COMMIT');
      return null;
    }
    const leaseToken = randomUUID();
    const updated = await client.query<{
      id: string;
      attempt: number;
      max_attempts: number;
      manifest: unknown;
    }>(
      \`UPDATE render_jobs
       SET status = 'running', attempt = attempt + 1,
           lease_token = $2::uuid,
           lease_expires_at = NOW() + ($3::integer * INTERVAL '1 millisecond'),
           heartbeat_at = NOW(), started_at = NOW(), finished_at = NULL,
           error_code = NULL, progress_pct = 0, updated_at = NOW()
       WHERE id = $1::uuid AND status = 'queued'
       RETURNING id, attempt, max_attempts, manifest\`,
      [selected.rows[0].id, leaseToken, leaseMs],
    );
    if (!updated.rows[0]) throw new Error('Reserved job was not claimable');
    await client.query('COMMIT');
    return {
      id: updated.rows[0].id,
      leaseToken,
      attempt: updated.rows[0].attempt,
      maxAttempts: updated.rows[0].max_attempts,
      manifest: updated.rows[0].manifest,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/** Every write is fenced by BOTH the current lease UUID and its unexpired deadline. */
export async function heartbeatJob(
  { pool }: ReturnTypeOfOpenDatabase,
  claim: Pick<QueueClaim, 'id' | 'leaseToken'>,
  leaseMs = 2_000,
  progressPct = 0,
): Promise<boolean> {
  validLeaseMs(leaseMs);
  if (!Number.isInteger(progressPct) || progressPct < 0 || progressPct > 99) {
    throw new RangeError('Progress must be an integer 0–99');
  }
  const result = await pool.query(
    \`UPDATE render_jobs
     SET heartbeat_at = NOW(), updated_at = NOW(),
         lease_expires_at = NOW() + ($3::integer * INTERVAL '1 millisecond'),
         progress_pct = GREATEST(progress_pct, $4::integer)
     WHERE id = $1::uuid AND lease_token = $2::uuid
       AND status = 'running' AND lease_expires_at > NOW()
     RETURNING id\`,
    [claim.id, claim.leaseToken, leaseMs, progressPct],
  );
  return result.rowCount === 1;
}

export async function succeedJob(
  { pool }: ReturnTypeOfOpenDatabase,
  claim: Pick<QueueClaim, 'id' | 'leaseToken'>,
): Promise<boolean> {
  const result = await pool.query(
    \`UPDATE render_jobs
     SET status = 'succeeded', progress_pct = 100,
         finished_at = NOW(), updated_at = NOW(),
         lease_token = NULL, lease_expires_at = NULL, heartbeat_at = NOW(),
         error_code = NULL
     WHERE id = $1::uuid AND lease_token = $2::uuid
       AND status = 'running' AND lease_expires_at > NOW()
     RETURNING id\`,
    [claim.id, claim.leaseToken],
  );
  return result.rowCount === 1;
}

export async function failJob(
  { pool }: ReturnTypeOfOpenDatabase,
  claim: Pick<QueueClaim, 'id' | 'leaseToken'>,
  reason: QueueFailureCode,
): Promise<boolean> {
  const allowed: readonly QueueFailureCode[] = [
    'synthetic_failure',
    'worker_stopped',
    'invalid_synthetic_manifest',
    'lease_expired',
  ];
  if (!allowed.includes(reason)) throw new RangeError('Unknown job error code');
  const result = await pool.query(
    \`UPDATE render_jobs
     SET status = 'failed', error_code = $3,
         lease_token = NULL, lease_expires_at = NULL, finished_at = NOW(),
         available_at = NOW() + (POWER(2, LEAST(attempt - 1, 5)) * INTERVAL '250 milliseconds'),
         updated_at = NOW()
     WHERE id = $1::uuid AND lease_token = $2::uuid
       AND status = 'running' AND lease_expires_at > NOW()
     RETURNING id\`,
    [claim.id, claim.leaseToken, reason],
  );
  return result.rowCount === 1;
}

/** Crash recovery never grants ownership to an expired worker. */
export async function recoverExpiredJobs({ pool }: ReturnTypeOfOpenDatabase): Promise<number> {
  const result = await pool.query(
    \`UPDATE render_jobs
     SET status = 'failed', error_code = 'lease_expired',
         lease_token = NULL, lease_expires_at = NULL,
         finished_at = NOW(),
         available_at = NOW() + (POWER(2, LEAST(attempt - 1, 5)) * INTERVAL '250 milliseconds'),
         updated_at = NOW()
     WHERE status = 'running' AND lease_expires_at <= NOW()
     RETURNING id\`,
  );
  return result.rowCount ?? 0;
}

/** Explicit failed → queued transition, only after backoff and below attempt ceiling. */
export async function requeueDueJobs({ pool }: ReturnTypeOfOpenDatabase): Promise<number> {
  const result = await pool.query(
    \`UPDATE render_jobs
     SET status = 'queued', finished_at = NULL, updated_at = NOW()
     WHERE status = 'failed' AND attempt < max_attempts
       AND available_at <= NOW() AND deleted_at IS NULL
       AND EXISTS (
         SELECT 1 FROM project_versions AS v
         JOIN video_projects AS p ON p.id = v.project_id
         WHERE v.id = render_jobs.project_version_id
           AND v.deleted_at IS NULL AND p.deleted_at IS NULL
       )
     RETURNING id\`,
  );
  return result.rowCount ?? 0;
}

/** Cancel revokes the owner immediately; late success/failure must not overwrite it. */
export async function cancelJob(
  { pool }: ReturnTypeOfOpenDatabase,
  id: string,
): Promise<boolean> {
  const result = await pool.query(
    \`UPDATE render_jobs
     SET status = 'cancelled', lease_token = NULL, lease_expires_at = NULL,
         finished_at = NOW(), updated_at = NOW(), error_code = NULL
     WHERE id = $1::uuid AND status IN ('queued', 'running', 'failed')
     RETURNING id\`,
    [id],
  );
  return result.rowCount === 1;
}
