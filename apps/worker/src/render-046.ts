import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  assertRender046ExecutionEnvironment,
  claimRender046,
  failRender046,
  finishRender046,
  heartbeatJob,
  openDatabase,
  recoverRender046,
  requeueRender046,
  type Render046Claim,
} from '@bluedotatlas/db/queue-046';
import { LocalStorage, StorageError } from '@bluedotatlas/storage';

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const TEMP = resolve(ROOT, '.tmp-render-046');
const STATIC_045_OUTPUT = resolve(ROOT, '.tmp-export-045/045-original-synthetic-1080p.mp4');
const MAX_MP4_BYTES = 8_000_000;

function checkedOutput(jobId: string) {
  if (!/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(jobId)) {
    throw new Error('046 invalid job id');
  }
  return resolve(TEMP, jobId + '.mp4');
}

function processCommand(command: string, args: string[], signal: AbortSignal) {
  return new Promise<void>((resolvePromise, reject) => {
    if (signal.aborted) {
      reject(new Error('046 worker stopped'));
      return;
    }
    const child = spawn(command, args, { cwd: ROOT, stdio: 'ignore' });
    const abort = () => child.kill('SIGTERM');
    const timeout = setTimeout(abort, 240_000);
    signal.addEventListener('abort', abort, { once: true });
    child.once('error', (error) => {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
      reject(error);
    });
    child.once('close', (code) => {
      clearTimeout(timeout);
      signal.removeEventListener('abort', abort);
      if (code === 0 && !signal.aborted) resolvePromise();
      else reject(new Error('046 bounded media process failed'));
    });
  });
}

/** Exactly one 046 job on a disposable test runner. No VPS, URLs, third-party assets or publish. */
export async function runRender046Once(externalSignal?: AbortSignal) {
  assertRender046ExecutionEnvironment();
  const storageRoot = process.env.BDA_046_TEST_STORAGE_ROOT;
  const isVps = process.env.BDA_RENDER_046_VPS_SYNTHETIC === 'TRUE';
  const root = isVps ? process.env.BDA_046_VPS_STORAGE_ROOT : storageRoot;
  if (!root) throw new Error('046 private storage root missing');
  const storage = isVps
    ? await LocalStorage.openRender046VpsRoot(root)
    : await LocalStorage.openIsolatedTestRoot(root);
  const connection = openDatabase();
  try {
    await recoverRender046(connection);
    await requeueRender046(connection);
    const claim = await claimRender046(connection);
    if (!claim) return null;

    const controller = new AbortController();
    const abort = () => controller.abort();
    externalSignal?.addEventListener('abort', abort, { once: true });
    if (externalSignal?.aborted) controller.abort();
    let ownershipLost = false;
    let busy = false;
    let progress = 1;
    const ticker = setInterval(() => {
      if (busy || controller.signal.aborted) return;
      busy = true;
      void heartbeatJob(connection, claim, 30_000, Math.min(98, progress))
        .then((owned) => {
          if (!owned) {
            ownershipLost = true;
            controller.abort();
          }
          progress = Math.min(progress + 3, 95);
        })
        .catch(() => {
          ownershipLost = true;
          controller.abort();
        })
        .finally(() => {
          busy = false;
        });
    }, 2_000);

    try {
      const output = checkedOutput(claim.id);
      mkdirSync(TEMP, { recursive: true, mode: 0o700 });
      await exportAndCheckOriginalSynthetic046(claim, output, controller.signal);
      if (controller.signal.aborted) throw new Error('046 cancelled');
      const file = readFileSync(output);
      if (file.byteLength < 100_000 || file.byteLength > MAX_MP4_BYTES) {
        throw new Error('046 media size outside budget');
      }
      const sha256 = createHash('sha256').update(file).digest('hex');
      const storageKey = `rendered/jobs/${claim.id}.mp4`;
      let stored;
      try {
        stored = await storage.put('rendered', `jobs/${claim.id}.mp4`, file, {
          maxBytes: MAX_MP4_BYTES,
        });
      } catch (error) {
        if (!(error instanceof StorageError) || error.code !== 'file_exists') throw error;
        const previous = await storage.read(storageKey, MAX_MP4_BYTES);
        if (
          previous.byteLength !== file.byteLength ||
          createHash('sha256').update(previous).digest('hex') !== sha256
        ) {
          throw new Error('046 conflicting immutable artifact');
        }
        stored = { storageKey, sha256, sizeBytes: file.byteLength };
      }
      if (controller.signal.aborted || ownershipLost) throw new Error('046 lost lease');
      if (!(await finishRender046(connection, claim, stored))) {
        throw new Error('046 stale lease cannot finalize');
      }
      return claim.id;
    } catch {
      if (!ownershipLost) await failRender046(connection, claim);
      return null;
    } finally {
      clearInterval(ticker);
      externalSignal?.removeEventListener('abort', abort);
      // Actual encoded MP4/QA report remain only in ignored disposable CI workspace.
    }
  } finally {
    await connection.pool.end();
  }
}

/** Build the locked 045 synthetic argv, changing only its per-job *private* output path. */
async function exportAndCheckOriginalSynthetic046(
  claim: Render046Claim,
  output: string,
  signal: AbortSignal,
) {
  if (!existsSync(resolve(ROOT, 'render/preset-1080p.json'))) {
    throw new Error('046 locked 045 preset unavailable');
  }
  const lockedModule = '../../../render/preset-1080p.mjs';
  const { readAndCheckInputs, syntheticFfmpegArgs } = (await import(lockedModule)) as {
    readAndCheckInputs: () => unknown;
    syntheticFfmpegArgs: (preset: unknown, output: string) => string[];
  };
  const argv = syntheticFfmpegArgs(readAndCheckInputs(), STATIC_045_OUTPUT);
  argv[argv.length - 1] = output; // Fixed generated UUID output; no manifest path or URL.
  await processCommand('ffmpeg', argv, signal);
  await processCommand('python3', ['scripts/check-render-046.py', claim.id], signal);
}
