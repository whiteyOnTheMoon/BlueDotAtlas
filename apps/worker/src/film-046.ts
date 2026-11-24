import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, lstatSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
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
  type Render046FilmErrorCode,
} from '@bluedotatlas/db/queue-046';
import { LocalStorage, StorageError } from '@bluedotatlas/storage';

/**
 * 046 private 60s pilot film through the PostgreSQL queue: the admin button
 * enqueues, this worker claims ONE job, runs the bounded sequential FFmpeg/SVG
 * renderer as a child process, verifies the MP4, stores it privately and
 * commits artifact + video + job atomically. Never publishes; rights stay
 * `unreviewed`; one attempt per job (no automatic retry).
 */
const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const KIND = 'pilot_film' as const;
const MAX_FILM_BYTES = 400_000_000;
const JOB_TIMEOUT_MS = 90 * 60_000;
// Container cap (768 MiB) + 2048 MiB host reserve + 256 MiB margin.
export const FILM_046_ADMISSION_MIB = 3072;
// Stop the own render (never anything else) below this host headroom.
export const FILM_046_WATCHDOG_MIB = 2048;
const UUID = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/;

export function memAvailableMiB(meminfo = readFileSync('/proc/meminfo', 'utf8')): number {
  const kib = Number(/^MemAvailable:\s+(\d+)\s+kB$/m.exec(meminfo)?.[1]);
  return Number.isFinite(kib) ? Math.floor(kib / 1024) : 0;
}

/** Renderer progress lines `046 FFMPEG PART i/n: …` map to 5–95 %. */
export function progressFromLine(line: string): number | null {
  const match = /^046 FFMPEG PART (\d+)\/(\d+):/.exec(line);
  if (!match) return null;
  const done = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isInteger(done) || !Number.isInteger(total) || total < 1 || done > total) return null;
  return Math.min(95, 5 + Math.floor((90 * done) / total));
}

type Mode = { vps: boolean; scratch: string; storage: LocalStorage };

async function openMode(): Promise<Mode> {
  assertRender046ExecutionEnvironment(KIND);
  const vps = process.env.BDA_RENDER_046_VPS_PILOT_FILM === 'TRUE';
  if (vps) {
    return {
      vps,
      scratch: '/work',
      storage: await LocalStorage.openRender046VpsRoot('/bda-media'),
    };
  }
  const storageRoot = process.env.BDA_046_TEST_STORAGE_ROOT;
  const scratch = process.env.BDA_046_FILM_TEST_SCRATCH;
  if (!storageRoot || !scratch || !scratch.startsWith('/')) {
    throw new Error('046 film test storage/scratch missing');
  }
  return { vps, scratch, storage: await LocalStorage.openIsolatedTestRoot(storageRoot) };
}

function privateDir(path: string) {
  mkdirSync(path, { recursive: true, mode: 0o700 });
  const st = lstatSync(path);
  if (!st.isDirectory() || st.isSymbolicLink() || (st.mode & 0o077) !== 0) {
    throw new Error('046 film scratch must be a private directory');
  }
}

function runRenderer(
  mode: Mode,
  claim: Render046Claim,
  outDir: string,
  signal: AbortSignal,
  onProgress: (pct: number) => void,
) {
  return new Promise<void>((resolvePromise, reject) => {
    if (signal.aborted) {
      reject(new Error('046 film stopped'));
      return;
    }
    const child = spawn(
      process.execPath,
      [
        'scripts/render-pilot-ffmpeg-046.mjs',
        mode.vps ? '--queue-job' : '--queue-job-synthetic',
        claim.id,
      ],
      {
        cwd: ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          PATH: process.env.PATH ?? '/usr/bin:/bin',
          HOME: process.env.HOME ?? '/home/node',
          BDA_PILOT_046_FILM_QUEUE: 'TRUE',
          BDA_PILOT_046_MEDIA_ROOT: mode.vps ? '/source' : '',
          BDA_PILOT_046_OUTPUT_ROOT: outDir,
        },
      },
    );
    let pending = '';
    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      pending += chunk;
      const lines = pending.split('\n');
      pending = lines.pop() ?? '';
      for (const line of lines) {
        const pct = progressFromLine(line);
        if (pct !== null) onProgress(pct);
        if (line.startsWith('046 FFMPEG')) process.stdout.write(line + '\n');
      }
    });
    let tail = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => {
      tail = (tail + chunk).slice(-2000);
    });
    const abort = () => child.kill('SIGTERM');
    const timeout = setTimeout(abort, JOB_TIMEOUT_MS);
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
      else {
        if (tail) process.stderr.write('046 FILM RENDERER STDERR (tail): ' + tail + '\n');
        reject(new Error('046 film renderer failed'));
      }
    });
  });
}

/** Independent ffprobe QA; private real film must match the strict 046 contract. */
export function verifyFilm046(file: string, vps: boolean): { durationMs: number } {
  const probe = spawnSync(
    'ffprobe',
    ['-v', 'error', '-show_streams', '-show_format', '-of', 'json', file],
    { encoding: 'utf8', timeout: 60_000, maxBuffer: 1 << 20 },
  );
  if (probe.status !== 0) throw new Error('046 film ffprobe failed');
  if (vps) {
    const gate = spawnSync('python3', ['scripts/check-pilot-film-046-probe.py'], {
      cwd: ROOT,
      input: probe.stdout,
      encoding: 'utf8',
      timeout: 30_000,
    });
    if (gate.status !== 0) throw new Error('046 film metadata gate failed');
  }
  const data = JSON.parse(probe.stdout) as {
    streams: {
      codec_type: string;
      codec_name: string;
      avg_frame_rate: string;
      nb_frames: string;
    }[];
    format: { duration: string };
  };
  const video = data.streams.filter((s) => s.codec_type === 'video');
  const audio = data.streams.filter((s) => s.codec_type === 'audio');
  if (
    video.length !== 1 ||
    audio.length !== 1 ||
    video[0]?.codec_name !== 'h264' ||
    audio[0]?.codec_name !== 'aac' ||
    video[0]?.avg_frame_rate !== '30/1'
  ) {
    throw new Error('046 film stream contract failed');
  }
  const decode = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'null', '-'], {
    encoding: 'utf8',
    timeout: 20 * 60_000,
    maxBuffer: 1 << 20,
  });
  if (decode.status !== 0 || decode.stderr.trim() !== '')
    throw new Error('046 film full decode failed');
  const durationMs = Math.round(Number(data.format.duration) * 1000);
  if (!Number.isSafeInteger(durationMs)) throw new Error('046 film duration invalid');
  return { durationMs };
}

/** Exactly one private pilot film job per call. Returns the completed job id or null. */
export async function runPilotFilm046Once(externalSignal?: AbortSignal) {
  const mode = await openMode();
  const connection = openDatabase();
  try {
    await recoverRender046(connection, KIND);
    await requeueRender046(connection, KIND);
    // Admission before claiming: an under-provisioned host leaves the job queued.
    if (memAvailableMiB() < FILM_046_ADMISSION_MIB) {
      process.stdout.write('046 FILM WAIT: host MemAvailable below admission; job stays queued\n');
      return null;
    }
    const claim = await claimRender046(connection, KIND);
    if (!claim) return null;
    if (!UUID.test(claim.id)) throw new Error('046 invalid job id');
    process.stdout.write('046 FILM CLAIMED ' + claim.id + '\n');

    const controller = new AbortController();
    const abort = () => controller.abort();
    externalSignal?.addEventListener('abort', abort, { once: true });
    if (externalSignal?.aborted) controller.abort();
    let ownershipLost = false;
    let pressure = false;
    let busy = false;
    let progress = 1;
    const ticker = setInterval(() => {
      if (memAvailableMiB() < FILM_046_WATCHDOG_MIB) {
        pressure = true;
        controller.abort();
      }
      if (busy || controller.signal.aborted) return;
      busy = true;
      void heartbeatJob(connection, claim, 30_000, Math.min(98, progress))
        .then((owned) => {
          if (!owned) {
            ownershipLost = true;
            controller.abort();
          }
        })
        .catch(() => {
          ownershipLost = true;
          controller.abort();
        })
        .finally(() => {
          busy = false;
        });
    }, 2_000);

    const outDir = join(mode.scratch, 'jobs', claim.id);
    let failure: Render046FilmErrorCode = 'pilot_film_render_failed';
    try {
      privateDir(join(mode.scratch, 'jobs'));
      if (existsSync(outDir)) throw new Error('046 film job directory already exists');
      mkdirSync(outDir, { mode: 0o700 });
      await runRenderer(mode, claim, outDir, controller.signal, (pct) => {
        progress = Math.max(progress, pct);
      });
      if (controller.signal.aborted) throw new Error('046 film aborted');
      failure = 'pilot_film_qa_failed';
      const file = resolve(outDir, '046-private-film-' + claim.id + '.mp4');
      const receipt = JSON.parse(readFileSync(file + '.receipt.json', 'utf8')) as {
        sha256: string;
      };
      const { durationMs } = verifyFilm046(file, mode.vps);
      const bytes = readFileSync(file);
      if (bytes.byteLength > MAX_FILM_BYTES) throw new Error('046 film too large');
      const sha256 = createHash('sha256').update(bytes).digest('hex');
      if (sha256 !== receipt.sha256) throw new Error('046 film receipt SHA mismatch');
      const storageKey = `rendered/jobs/${claim.id}.mp4`;
      let stored;
      try {
        stored = await mode.storage.put('rendered', `jobs/${claim.id}.mp4`, bytes, {
          maxBytes: MAX_FILM_BYTES,
        });
      } catch (error) {
        if (!(error instanceof StorageError) || error.code !== 'file_exists') throw error;
        const previous = await mode.storage.read(storageKey, MAX_FILM_BYTES);
        if (createHash('sha256').update(previous).digest('hex') !== sha256) {
          throw new Error('046 conflicting immutable film artifact');
        }
        stored = { storageKey, sha256, sizeBytes: bytes.byteLength };
      }
      if (controller.signal.aborted || ownershipLost) throw new Error('046 film lost lease');
      if (!(await finishRender046(connection, claim, { ...stored, durationMs }, KIND))) {
        throw new Error('046 film stale lease cannot finalize');
      }
      // Committed copy lives in private storage; drop the scratch duplicate.
      rmSync(outDir, { recursive: true, force: true });
      process.stdout.write('046 FILM SUCCEEDED ' + claim.id + ' ' + sha256 + '\n');
      return claim.id;
    } catch (error) {
      if (pressure) failure = 'host_memory_pressure';
      else if (controller.signal.aborted && !externalSignal?.aborted && !ownershipLost) {
        failure = 'pilot_film_timeout';
      }
      process.stderr.write(
        '046 FILM FAILED ' + claim.id + ' ' + failure + ': ' + String(error) + '\n',
      );
      // Scratch output is preserved for diagnosis; the job is not retried.
      if (!ownershipLost) await failRender046(connection, claim, KIND, failure);
      return null;
    } finally {
      clearInterval(ticker);
      externalSignal?.removeEventListener('abort', abort);
    }
  } finally {
    await connection.pool.end();
  }
}
