import { createHash, randomUUID } from 'node:crypto';
import {
  constants,
  type Stats,
  createReadStream,
} from 'node:fs';
import {
  link,
  lstat,
  mkdir,
  open,
  readdir,
  realpath,
  unlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, isAbsolute, join, resolve, sep } from 'node:path';
import {
  assertCleanupArea,
  assertWritableArea,
  FOLDER_PLAN,
  MAX_READ_BYTES,
  MAX_SINGLE_WRITE_BYTES,
  parseStorageKey,
  STORAGE_BUDGETS,
  StorageError,
  validateLimits,
  validateObjectKey,
  type CleanupArea,
  type StorageArea,
  type WritableArea,
} from './policy.js';

export type StorageLimits = {
  mediaBytes: number;
  scratchBytes: number;
};

export type StoredFile = {
  storageKey: string;
  sizeBytes: number;
  sha256: string;
};

export type CleanupOptions = {
  olderThanMs: number;
  maxDeleteBytes: number;
  maxFiles: number;
  dryRun?: boolean;
};

export type CleanupReport = {
  area: CleanupArea;
  dryRun: boolean;
  scannedFiles: number;
  skippedUnsafe: number;
  skippedChanged: number;
  planned: Array<{ storageKey: string; sizeBytes: number }>;
  removed: string[];
};

type FileEntry = {
  area: WritableArea;
  parts: string[];
  absolute: string;
  stat: Stats;
};

type Walk = { files: FileEntry[]; unsafe: number };

function isNodeError(error: unknown, code: string): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === code;
}

function assertPrivateDirectory(stat: Stats) {
  if (
    !stat.isDirectory() ||
    stat.isSymbolicLink() ||
    (typeof process.getuid === 'function' && stat.uid !== process.getuid()) ||
    (stat.mode & 0o077) !== 0
  ) {
    throw new StorageError('unsafe_path');
  }
}

function assertPrivateFile(stat: Stats) {
  if (
    !stat.isFile() ||
    stat.nlink !== 1 ||
    (typeof process.getuid === 'function' && stat.uid !== process.getuid()) ||
    (stat.mode & 0o077) !== 0
  ) {
    throw new StorageError('unsafe_path');
  }
}

function validateBound(value: number, max: number) {
  if (!Number.isSafeInteger(value) || value < 1 || value > max) {
    throw new StorageError('invalid_limit');
  }
}

function safeStageName(name: string) {
  return /^\.bda-stage-[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/.test(name);
}

function isInside(root: string, path: string) {
  return path.startsWith(root + sep);
}

/**
 * Roadmap 028 deliberately offers only an isolated test-root constructor.
 * No production mount or /srv directory may be modified until tasks 029/030.
 *
 * Directory ownership/permissions and O_NOFOLLOW defend against symlink escapes.
 * POSIX Node does not expose openat2(RESOLVE_BENEATH): same-UID hostile filesystem
 * races and OS-enforced disk quotas are explicitly out of scope before deployment.
 */
export class LocalStorage {
  private constructor(
    private readonly root: string,
    private readonly rootDev: number,
    private readonly rootIno: number,
    private readonly limits: StorageLimits,
  ) {}

  static async openIsolatedTestRoot(
    path: string,
    overrides: Partial<StorageLimits> = {},
  ): Promise<LocalStorage> {
    if (
      process.env.BDA_STORAGE_TEST !== '1' ||
      process.platform !== 'linux' ||
      typeof path !== 'string' ||
      !isAbsolute(path)
    ) {
      throw new StorageError('invalid_root');
    }
    const root = resolve(path);
    const temp = await realpath(tmpdir());
    if (
      dirname(root) !== temp ||
      !basename(root).startsWith('bda-storage-028-') ||
      !/^bda-storage-028-[A-Za-z0-9_-]+$/.test(basename(root))
    ) {
      throw new StorageError('invalid_root');
    }
    const rootStat = await lstat(root);
    assertPrivateDirectory(rootStat);
    if ((await realpath(root)) !== root) throw new StorageError('invalid_root');

    const limits = { ...STORAGE_BUDGETS, ...overrides };
    validateLimits(limits);
    const storage = new LocalStorage(root, rootStat.dev, rootStat.ino, limits);
    await storage.checkRoot();
    for (const area of FOLDER_PLAN) {
      const target = join(root, area);
      try {
        await mkdir(target, { mode: 0o700 });
      } catch (error) {
        if (!isNodeError(error, 'EEXIST')) throw error;
      }
      await storage.checkPrivateDirectory(target);
    }
    return storage;
  }

  private async checkRoot() {
    const stat = await lstat(this.root);
    assertPrivateDirectory(stat);
    if (
      stat.dev !== this.rootDev ||
      stat.ino !== this.rootIno ||
      (await realpath(this.root)) !== this.root
    ) {
      throw new StorageError('invalid_root');
    }
  }

  private async checkPrivateDirectory(path: string) {
    const stat = await lstat(path);
    assertPrivateDirectory(stat);
    if (!isInside(this.root, path) || (await realpath(path)) !== path) {
      throw new StorageError('unsafe_path');
    }
    return stat;
  }

  private async parentFor(area: StorageArea, dirs: string[], create: boolean) {
    await this.checkRoot();
    let parent = this.root;
    for (const piece of [area, ...dirs]) {
      const next = join(parent, piece);
      if (create) {
        try {
          await mkdir(next, { mode: 0o700 });
        } catch (error) {
          if (!isNodeError(error, 'EEXIST')) throw error;
        }
      }
      await this.checkPrivateDirectory(next);
      parent = next;
    }
    return parent;
  }

  private async walkArea(area: WritableArea): Promise<Walk> {
    await this.checkRoot();
    const directory = await this.parentFor(area, [], false);
    const files: FileEntry[] = [];
    let unsafe = 0;
    const recurse = async (current: string, prefix: string[]): Promise<void> => {
      for (const entry of await readdir(current, { withFileTypes: true })) {
        const absolute = join(current, entry.name);
        const parts = [...prefix, entry.name];
        if (!isInside(this.root, absolute)) throw new StorageError('unsafe_path');
        // lstat is mandatory: a symlink MUST NOT be traversed during cleanup or quota scans.
        const stat = await lstat(absolute);
        if (stat.isSymbolicLink()) {
          unsafe++;
          continue;
        }
        if (stat.isDirectory()) {
          if (parts.length >= 4) {
            unsafe++;
            continue;
          }
          try {
            await this.checkPrivateDirectory(absolute);
            await recurse(absolute, parts);
          } catch {
            unsafe++;
          }
          continue;
        }
        if (!stat.isFile() || stat.nlink !== 1 || (stat.mode & 0o077) !== 0) {
          unsafe++;
          continue;
        }
        // Hidden stage files may result from a hard crash; never exposed as public keys.
        if (!safeStageName(entry.name)) {
          try {
            validateObjectKey(area, parts.join('/'));
          } catch {
            unsafe++;
            continue;
          }
        }
        files.push({ area, parts, absolute, stat });
      }
    };
    await recurse(directory, []);
    return { files, unsafe };
  }

  /** An advisory filesystem usage check, NOT an OS quota/cgroup reservation. */
  async usage() {
    const [uploads, rendered, temp, cache] = await Promise.all([
      this.walkArea('uploads'),
      this.walkArea('rendered'),
      this.walkArea('temp'),
      this.walkArea('cache'),
    ]);
    if ([uploads, rendered, temp, cache].some((entry) => entry.unsafe !== 0)) {
      throw new StorageError('unsafe_path');
    }
    const sum = (entries: Walk[]) =>
      entries.reduce((size, area) => size + area.files.reduce((s, f) => s + f.stat.size, 0), 0);
    return {
      mediaBytes: sum([uploads, rendered]),
      scratchBytes: sum([temp, cache]),
    };
  }

  async put(
    area: WritableArea,
    key: string,
    input: Uint8Array | AsyncIterable<Uint8Array>,
    options: { maxBytes?: number } = {},
  ): Promise<StoredFile> {
    assertWritableArea(area);
    const parts = validateObjectKey(area, key);
    const maxBytes = options.maxBytes ?? MAX_SINGLE_WRITE_BYTES;
    validateBound(maxBytes, MAX_SINGLE_WRITE_BYTES);
    const folder = await this.parentFor(area, parts.slice(0, -1), true);
    const target = join(folder, parts[parts.length - 1] ?? '');
    const stage = join(folder, '.bda-stage-' + randomUUID());
    // Invalid/unsafe entries cause a fail-closed refusal before allocating more disk.
    await this.usage();

    let file: Awaited<ReturnType<typeof open>> | undefined;
    let stageCreated = false;
    let committed = false;
    let bytes = 0;
    const hash = createHash('sha256');
    try {
      file = await open(
        stage,
        constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | constants.O_NOFOLLOW,
        0o600,
      );
      stageCreated = true;
      const iterable: AsyncIterable<Uint8Array> =
        input instanceof Uint8Array
          ? (async function* () {
              yield input;
            })()
          : input;
      for await (const part of iterable) {
        if (!(part instanceof Uint8Array)) throw new StorageError('invalid_key');
        // A bounded source may be a stream: no large MP4 is buffered in memory.
        bytes += part.byteLength;
        if (bytes > maxBytes) throw new StorageError('file_too_large');
        const chunk = Buffer.from(part);
        hash.update(chunk);
        let cursor = 0;
        while (cursor < chunk.byteLength) {
          const { bytesWritten } = await file.write(
            chunk,
            cursor,
            chunk.byteLength - cursor,
            null,
          );
          if (bytesWritten === 0) throw new StorageError('file_changed');
          cursor += bytesWritten;
        }
      }
      if (bytes === 0) throw new StorageError('invalid_key');
      await file.sync();
      await file.close();
      file = undefined;

      // The stage counts towards the pool budget before it can be committed.
      const used = await this.usage();
      if (used.mediaBytes > this.limits.mediaBytes || used.scratchBytes > this.limits.scratchBytes) {
        throw new StorageError('storage_budget');
      }
      await this.parentFor(area, parts.slice(0, -1), false);
      try {
        // link() is an atomic NO-REPLACE publish, unlike rename() which overwrites.
        await link(stage, target);
        committed = true;
      } catch (error) {
        if (isNodeError(error, 'EEXIST')) throw new StorageError('file_exists');
        throw error;
      }
      await unlink(stage);
      stageCreated = false;
      const handle = await open(folder, constants.O_RDONLY | constants.O_DIRECTORY | constants.O_NOFOLLOW);
      try {
        await handle.sync();
      } finally {
        await handle.close();
      }
      return { storageKey: area + '/' + parts.join('/'), sizeBytes: bytes, sha256: hash.digest('hex') };
    } finally {
      if (file) await file.close();
      if (stageCreated) {
        try {
          await unlink(stage);
        } catch (error) {
          if (!isNodeError(error, 'ENOENT')) throw error;
        }
      }
      // A successful publish is never rolled back after a subsequent fsync error.
      void committed;
    }
  }

  /** Read verifies inode type/owner/mode/link count after O_NOFOLLOW open. */
  async read(storageKey: string, maxBytes = MAX_READ_BYTES): Promise<Buffer> {
    validateBound(maxBytes, MAX_SINGLE_WRITE_BYTES);
    const { area, parts } = parseStorageKey(storageKey);
    const folder = await this.parentFor(area, parts.slice(0, -1), false);
    const filePath = join(folder, parts[parts.length - 1] ?? '');
    const handle = await open(filePath, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
    try {
      const stat = await handle.stat();
      assertPrivateFile(stat);
      if (stat.size > maxBytes) throw new StorageError('file_too_large');
      const contents = await handle.readFile();
      if (contents.byteLength > maxBytes) throw new StorageError('file_too_large');
      return contents;
    } finally {
      await handle.close();
    }
  }

  /**
   * Only temp/cache contents can be age-cleaned. Every deletion rechecks inode,
   * size, age and parent; no recursive rm or directory deletion exists here.
   * Default is dry-run. O_NOFOLLOW is used for opening, never following links.
   */
  async cleanup(area: CleanupArea, options: CleanupOptions): Promise<CleanupReport> {
    assertCleanupArea(area);
    validateBound(options.olderThanMs, 365 * 24 * 3600 * 1000);
    validateBound(options.maxFiles, 1000);
    validateBound(options.maxDeleteBytes, this.limits.scratchBytes);
    const dryRun = options.dryRun !== false;
    const now = Date.now();
    const scanned = await this.walkArea(area);
    const eligible = scanned.files
      .filter((file) => now - file.stat.mtimeMs >= options.olderThanMs)
      .sort((a, b) => a.stat.mtimeMs - b.stat.mtimeMs || a.absolute.localeCompare(b.absolute));
    const planned: CleanupReport['planned'] = [];
    const selected: FileEntry[] = [];
    let bytes = 0;
    for (const file of eligible) {
      if (selected.length >= options.maxFiles || bytes + file.stat.size > options.maxDeleteBytes) {
        continue;
      }
      selected.push(file);
      bytes += file.stat.size;
      planned.push({ storageKey: area + '/' + file.parts.join('/'), sizeBytes: file.stat.size });
    }
    const removed: string[] = [];
    let skippedChanged = 0;
    if (!dryRun) {
      for (const file of selected) {
        await this.parentFor(area, file.parts.slice(0, -1), false);
        let current: Stats;
        try {
          current = await lstat(file.absolute);
        } catch (error) {
          if (isNodeError(error, 'ENOENT')) {
            skippedChanged++;
            continue;
          }
          throw error;
        }
        if (
          !current.isFile() ||
          current.nlink !== 1 ||
          current.dev !== file.stat.dev ||
          current.ino !== file.stat.ino ||
          current.size !== file.stat.size ||
          current.mtimeMs !== file.stat.mtimeMs ||
          (current.mode & 0o077) !== 0 ||
          now - current.mtimeMs < options.olderThanMs
        ) {
          skippedChanged++;
          continue;
        }
        await unlink(file.absolute);
        removed.push(area + '/' + file.parts.join('/'));
      }
    }
    return {
      area,
      dryRun,
      scannedFiles: scanned.files.length,
      skippedUnsafe: scanned.unsafe,
      skippedChanged,
      planned,
      removed,
    };
  }
}
