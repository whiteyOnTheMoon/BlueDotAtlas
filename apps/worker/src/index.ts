import { setTimeout as delay } from 'node:timers/promises';
import {
  assertSyntheticTestDatabase,
  claimNextJob,
  failJob,
  heartbeatJob,
  openDatabase,
  recoverExpiredJobs,
  requeueDueJobs,
  succeedJob,
  type QueueClaim,
} from '@bluedotatlas/db/queue';

const LEASE_MS = 2_000;
const POLL_MS = 150;
const HEARTBEAT_MS = 100;

type SyntheticManifest = {
  kind: 'synthetic_027';
  durationMs: number;
  failUntilAttempt: number;
};

function validatedManifest(value: unknown): SyntheticManifest | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (
    Object.keys(record).length !== 3 ||
    record.kind !== 'synthetic_027' ||
    typeof record.durationMs !== 'number' ||
    !Number.isInteger(record.durationMs) ||
    record.durationMs < 200 ||
    record.durationMs > 5_000 ||
    typeof record.failUntilAttempt !== 'number' ||
    !Number.isInteger(record.failUntilAttempt) ||
    record.failUntilAttempt < 0 ||
    record.failUntilAttempt > 2
  ) {
    return null;
  }
  return {
    kind: 'synthetic_027',
    durationMs: record.durationMs,
    failUntilAttempt: record.failUntilAttempt,
  };
}

/**
 * The only executor in Roadmap 027 is bounded, deterministic and synthetic.
 * The worker intentionally fails closed outside the isolated CI test DB.
 * A real FFmpeg/Remotion executor requires a separate later review/gate.
 */
export async function runSyntheticWorker(options: { once?: boolean; signal?: AbortSignal } = {}) {
  assertSyntheticTestDatabase();
  const connection = openDatabase();
  let active: QueueClaim | null = null;
  let handled = 0;
  try {
    while (!options.signal?.aborted) {
      await recoverExpiredJobs(connection);
      await requeueDueJobs(connection);
      const claim = await claimNextJob(connection, LEASE_MS);
      if (!claim) {
        if (options.once) break;
        await delay(POLL_MS);
        continue;
      }
      active = claim;
      const manifest = validatedManifest(claim.manifest);
      if (!manifest) {
        await failJob(connection, claim, 'invalid_synthetic_manifest');
      } else {
        const started = Date.now();
        let ownsLease = true;
        while (Date.now() - started < manifest.durationMs) {
          if (options.signal?.aborted) break;
          await delay(Math.min(HEARTBEAT_MS, manifest.durationMs - (Date.now() - started)));
          if (options.signal?.aborted) break;
          const progress = Math.min(99, Math.floor(((Date.now() - started) * 100) / manifest.durationMs));
          ownsLease = await heartbeatJob(connection, claim, LEASE_MS, progress);
          if (!ownsLease) break; // Cancel, expiration or takeover means no more writes.
        }
        if (options.signal?.aborted) {
          await failJob(connection, claim, 'worker_stopped');
        } else if (!ownsLease) {
          // Stale owner cannot finish or fail a job, even if its work was completed.
        } else if (claim.attempt <= manifest.failUntilAttempt) {
          await failJob(connection, claim, 'synthetic_failure');
        } else {
          await succeedJob(connection, claim);
        }
      }
      active = null;
      handled++;
      if (options.once) break;
    }
    return handled;
  } finally {
    if (active) {
      try {
        await failJob(connection, active, 'worker_stopped');
      } catch {
        // A crashed/unreachable DB is recovered by lease expiry on next worker startup.
      }
    }
    await connection.pool.end();
  }
}
