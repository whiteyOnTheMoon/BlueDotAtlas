import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { constants } from 'node:fs';
import {
  access,
  chmod,
  link,
  lstat,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  utimes,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, test } from 'node:test';
import {
  FOLDER_PLAN,
  LocalStorage,
  parseStorageKey,
  STORAGE_BUDGETS,
  StorageError,
  validateObjectKey,
} from '../dist/index.js';

process.env.BDA_STORAGE_TEST = '1';
const roots = [];

async function fixture(overrides) {
  const root = await mkdtemp(join(tmpdir(), 'bda-storage-028-'));
  roots.push(root);
  return { root, storage: await LocalStorage.openIsolatedTestRoot(root, overrides) };
}
async function outsideFixture() {
  const path = await mkdtemp(join(tmpdir(), 'bda-outside-028-'));
  roots.push(path);
  return path;
}
afterEach(async () => {
  for (const root of roots.splice(0)) {
    assert.ok(root.startsWith(join(tmpdir(), 'bda-')), 'CI test teardown is scoped to its own fixture');
    await rm(root, { force: true, recursive: true });
  }
});
function denied(code) {
  return (error) => error instanceof StorageError && error.code === code;
}

test('exact six private areas; restart/reopen preserves bytes, relative key, hash and POSIX modes', async () => {
  const { root, storage } = await fixture();
  assert.deepEqual(FOLDER_PLAN, ['uploads', 'cache', 'temp', 'rendered', 'backups', 'logs']);
  for (const name of FOLDER_PLAN) {
    const stat = await lstat(join(root, name));
    assert.equal(stat.isDirectory(), true);
    assert.equal(stat.mode & 0o777, 0o700);
  }
  const bytes = Buffer.from('Synthetic 028 media bytes; never real footage');
  const written = await storage.put('uploads', '2026/asset-001.bin', bytes);
  assert.deepEqual(written, {
    storageKey: 'uploads/2026/asset-001.bin',
    sizeBytes: bytes.byteLength,
    sha256: createHash('sha256').update(bytes).digest('hex'),
  });
  const file = await lstat(join(root, written.storageKey));
  assert.equal(file.mode & 0o777, 0o600);
  assert.equal(file.nlink, 1);
  const restarted = await LocalStorage.openIsolatedTestRoot(root);
  assert.deepEqual(await restarted.read(written.storageKey), bytes);
  assert.deepEqual(await restarted.usage(), { mediaBytes: bytes.byteLength, scratchBytes: 0 });
  assert.deepEqual(await readdir(join(root, 'uploads', '2026')), ['asset-001.bin']);
  assert.equal(STORAGE_BUDGETS.mediaBytes, 20 * 1024 ** 3);
  assert.equal(STORAGE_BUDGETS.scratchBytes, 12 * 1024 ** 3);
});

test('strict keys deny traversal, dotfiles, host paths, encoded/Unicode/Windows tricks, unsafe extensions and areas', async () => {
  const { root, storage } = await fixture();
  const invalid = [
    '', 'a', 'a.bin/', '/etc/passwd', '../escape.bin', 'ok/../escape.mp4',
    'valid//item.mp4', './file.mp4', '.hidden.mp4', 'ok/.hidden.mp4',
    'foo..mp4', 'trailing./test.mp4', 'trailing..mp4', 'foo.mp4.',
    'x%2fetc.mp4', '%252e%252e/file.mp4', 'foo%5cbar.mp4',
    'C:\Windows\temp.mp4', 'C:/test.mp4', 'back\\slash.mp4',
    'evil\u0000.mp4', 'newline\n.mp4', 'unicode-\u202e.mp4',
    'café.mp4', 'file.exe', 'clip.mov', 'spaces in name.mp4', 'a/'.repeat(5) + 'file.mp4',
    'A'.repeat(241) + '.mp4',
  ];
  for (const key of invalid) {
    assert.throws(() => validateObjectKey('rendered', key), denied('invalid_key'), key);
  }
  assert.throws(() => parseStorageKey('/srv/blueDotAtlas/rendered/file.mp4'));
  assert.throws(() => parseStorageKey('backups/db.sql'), denied('invalid_area'));
  assert.throws(() => parseStorageKey('logs/output.txt'), denied('invalid_area'));
  await assert.rejects(storage.put('backups', 'secret.bin', new Uint8Array([1])), denied('invalid_area'));
  await assert.rejects(storage.put('rendered', 'video.bin', new Uint8Array([1])), denied('invalid_key'));
  assert.deepEqual(await readdir(join(root, 'rendered')), []);
});

test('root is fail-closed: no /srv, relative, symlink, non-private, or disabled test flag', async () => {
  const { root } = await fixture();
  await assert.rejects(LocalStorage.openIsolatedTestRoot('/srv/blueDotAtlas'), denied('invalid_root'));
  await assert.rejects(LocalStorage.openIsolatedTestRoot('relative-root'), denied('invalid_root'));
  const external = await outsideFixture();
  const rootSymlink = join(tmpdir(), 'bda-storage-028-symlink');
  try {
    await symlink(root, rootSymlink);
    await assert.rejects(LocalStorage.openIsolatedTestRoot(rootSymlink), denied('unsafe_path'));
  } finally {
    await rm(rootSymlink, { force: true });
  }
  await chmod(root, 0o755);
  await assert.rejects(LocalStorage.openIsolatedTestRoot(root), denied('unsafe_path'));
  await chmod(root, 0o700);
  const previous = process.env.BDA_STORAGE_TEST;
  delete process.env.BDA_STORAGE_TEST;
  try {
    await assert.rejects(LocalStorage.openIsolatedTestRoot(root), denied('invalid_root'));
  } finally {
    process.env.BDA_STORAGE_TEST = previous;
  }
  assert.ok((await lstat(external)).isDirectory());
});

test('atomic no-replace publish: concurrent duplicate keys, existing file and staged garbage never overwrite', async () => {
  const { root, storage } = await fixture();
  const choices = [Buffer.from('first-file'), Buffer.from('second-file')];
  const results = await Promise.allSettled([
    storage.put('uploads', 'parallel/item.bin', choices[0]),
    storage.put('uploads', 'parallel/item.bin', choices[1]),
  ]);
  assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
  assert.equal(results.filter((r) => r.status === 'rejected').length, 1);
  const file = await storage.read('uploads/parallel/item.bin');
  assert.ok(choices.some((x) => x.equals(file)));
  await assert.rejects(
    storage.put('uploads', 'parallel/item.bin', Buffer.from('replace-attempt')),
    denied('file_exists'),
  );
  assert.deepEqual(await storage.read('uploads/parallel/item.bin'), file);
  assert.deepEqual(await readdir(join(root, 'uploads', 'parallel')), ['item.bin']);
});

test('bounded streaming: truncated/throwing/oversized writes clean stage and do not publish partial files', async () => {
  const { root, storage } = await fixture();
  const long = async function* () {
    yield Buffer.from('1234567');
    yield Buffer.from('89012');
  };
  await assert.rejects(
    storage.put('temp', 'too-big.bin', long(), { maxBytes: 10 }),
    denied('file_too_large'),
  );
  assert.deepEqual(await readdir(join(root, 'temp')), []);
  const broken = async function* () {
    yield Buffer.from('data');
    throw new Error('simulated read failure');
  };
  await assert.rejects(
    storage.put('uploads', 'partial.bin', broken(), { maxBytes: 10 }),
    /simulated read failure/,
  );
  assert.deepEqual(await readdir(join(root, 'uploads')), []);
  await assert.rejects(storage.put('cache', 'empty.dat', new Uint8Array()), denied('invalid_key'));
  await assert.rejects(storage.put('temp', 'small.bin', new Uint8Array([1]), { maxBytes: 0 }), denied('invalid_limit'));
});

test('shared advisory media/scratch budgets refuse overcommit, clean stage, retain committed file', async () => {
  const { root, storage } = await fixture({ mediaBytes: 9, scratchBytes: 6 });
  await storage.put('uploads', 'source.bin', Buffer.from('1234'));
  await storage.put('rendered', 'short.mp4', Buffer.from('12345'));
  await assert.rejects(
    storage.put('rendered', 'excess.mp4', Buffer.from('1')),
    denied('storage_budget'),
  );
  assert.deepEqual((await readdir(join(root, 'rendered'))).sort(), ['short.mp4']);
  await storage.put('temp', 'one.dat', Buffer.from('1234'));
  await assert.rejects(storage.put('cache', 'two.bin', Buffer.from('789')), denied('storage_budget'));
  assert.deepEqual(await readdir(join(root, 'cache')), []);
  assert.deepEqual(await storage.usage(), { mediaBytes: 9, scratchBytes: 4 });
  await assert.rejects(LocalStorage.openIsolatedTestRoot(root, { mediaBytes: 21 * 1024 ** 3 }), denied('invalid_limit'));
});

test('symlink directories/files and hardlinked inode are never traversed, read or removed', async () => {
  const { root, storage } = await fixture();
  const external = await outsideFixture();
  const secret = join(external, 'secret.bin');
  await writeFile(secret, Buffer.from('must-survive'));
  await symlink(external, join(root, 'uploads', 'escape'));
  await assert.rejects(storage.put('uploads', 'escape/missing.bin', Buffer.from('x')), denied('unsafe_path'));
  await symlink(secret, join(root, 'temp', 'fake.bin'));
  await assert.rejects(storage.read('temp/fake.bin'));
  await link(secret, join(root, 'temp', 'linked.bin'));
  await assert.rejects(storage.read('temp/linked.bin'), denied('unsafe_path'));
  const old = new Date(Date.now() - 60_000);
  await utimes(join(root, 'temp', 'linked.bin'), old, old);
  const report = await storage.cleanup('temp', {
    olderThanMs: 1000, maxDeleteBytes: 1024, maxFiles: 10, dryRun: false,
    referenceCheck: async () => false,
  });
  assert.equal(report.skippedUnsafe, 2);
  assert.deepEqual(report.removed, []);
  assert.deepEqual(await readFile(secret), Buffer.from('must-survive'));
  assert.equal((await lstat(join(root, 'temp', 'linked.bin'))).nlink, 2);
  await assert.rejects(storage.usage(), denied('unsafe_path'));
});

test('age- and size-bounded dry run; only aged temp/cache deleted; rendered MP4, uploads, backup, logs stay', async () => {
  const { root, storage } = await fixture();
  await storage.put('rendered', 'final-001.mp4', Buffer.from('synthetic mp4 placeholder'));
  await storage.put('uploads', 'source-001.bin', Buffer.from('rights-unreviewed'));
  await storage.put('temp', 'project/expired.bin', Buffer.from('old-temp'));
  await storage.put('temp', 'new.bin', Buffer.from('fresh'));
  await storage.put('cache', 'expired.bin', Buffer.from('old-cache'));
  await writeFile(join(root, 'backups', 'keep.bin'), Buffer.from('backup'), { mode: 0o600 });
  await writeFile(join(root, 'logs', 'keep.txt'), Buffer.from('log'), { mode: 0o600 });
  const old = new Date(Date.now() - 120_000);
  await utimes(join(root, 'temp', 'project', 'expired.bin'), old, old);
  await utimes(join(root, 'cache', 'expired.bin'), old, old);
  const options = { olderThanMs: 1000, maxDeleteBytes: 1024, maxFiles: 1 };
  const planned = await storage.cleanup('temp', options);
  assert.equal(planned.dryRun, true);
  assert.equal(planned.planned.length, 1);
  assert.deepEqual(planned.removed, []);
  assert.equal((await storage.read('temp/project/expired.bin')).toString(), 'old-temp');
  const dry = await storage.cleanup('cache', { ...options, maxDeleteBytes: 1 });
  assert.deepEqual(dry.planned, [], 'max bytes must be honored');
  const temp = await storage.cleanup('temp', { ...options, dryRun: false, referenceCheck: async () => false });
  const cache = await storage.cleanup('cache', { ...options, dryRun: false, referenceCheck: async () => false });
  assert.deepEqual(temp.removed, ['temp/project/expired.bin']);
  assert.deepEqual(cache.removed, ['cache/expired.bin']);
  await assert.rejects(storage.read('temp/project/expired.bin'));
  await assert.rejects(storage.read('cache/expired.bin'));
  assert.equal((await storage.read('temp/new.bin')).toString(), 'fresh');
  assert.equal((await storage.read('rendered/final-001.mp4')).toString(), 'synthetic mp4 placeholder');
  assert.equal((await storage.read('uploads/source-001.bin')).toString(), 'rights-unreviewed');
  assert.equal((await readFile(join(root, 'backups', 'keep.bin'))).toString(), 'backup');
  assert.equal((await readFile(join(root, 'logs', 'keep.txt'))).toString(), 'log');
  await assert.rejects(storage.cleanup('rendered', options), denied('invalid_area'));
  await assert.rejects(storage.cleanup('uploads', options), denied('invalid_area'));
  await assert.rejects(storage.cleanup('temp', { ...options, olderThanMs: 0 }), denied('invalid_limit'));
  await assert.rejects(storage.cleanup('cache', { ...options, maxFiles: 0 }), denied('invalid_limit'));
});

test('destructive cleanup refuses absent/failing DB check and retains referenced files and all MP4s', async () => {
  const { root, storage } = await fixture();
  await storage.put('temp', 'referenced.bin', Buffer.from('DB-protected'));
  await storage.put('temp', 'expired.mp4', Buffer.from('unreviewed-mp4-bytes'));
  await storage.put('cache', 'orphan.dat', Buffer.from('truly-expired'));
  const old = new Date(Date.now() - 100_000);
  for (const [area, name] of [
    ['temp', 'referenced.bin'],
    ['temp', 'expired.mp4'],
    ['cache', 'orphan.dat'],
  ]) {
    await utimes(join(root, area, name), old, old);
  }
  const opts = { olderThanMs: 1000, maxDeleteBytes: 1000, maxFiles: 5 };
  await assert.rejects(storage.cleanup('temp', { ...opts, dryRun: false }), denied('reference_check_required'));
  await assert.rejects(
    storage.cleanup('cache', { ...opts, dryRun: false, referenceCheck: async () => undefined }),
    denied('reference_check_required'),
  );
  await assert.rejects(
    storage.cleanup('cache', { ...opts, dryRun: false, referenceCheck: async () => { throw new Error('DB offline'); } }),
    /DB offline/,
  );
  assert.equal((await storage.read('cache/orphan.dat')).toString(), 'truly-expired');
  const visited = [];
  const temp = await storage.cleanup('temp', {
    ...opts, dryRun: false,
    referenceCheck: async (key) => { visited.push(key); return key === 'temp/referenced.bin'; },
  });
  assert.deepEqual(visited, ['temp/referenced.bin']);
  assert.deepEqual(temp.removed, []);
  assert.equal(temp.skippedProtected, 2, 'referenced .bin and all MP4 must be retained');
  assert.equal((await storage.read('temp/referenced.bin')).toString(), 'DB-protected');
  assert.equal((await storage.read('temp/expired.mp4')).toString(), 'unreviewed-mp4-bytes');
  const cache = await storage.cleanup('cache', { ...opts, dryRun: false, referenceCheck: async () => false });
  assert.deepEqual(cache.removed, ['cache/orphan.dat']);
  await assert.rejects(storage.read('cache/orphan.dat'));
});

test('existing symlink destination never clobbered and no external source is modified', async () => {
  const { root, storage } = await fixture();
  const outside = await outsideFixture();
  const ext = join(outside, 'important.bin');
  await writeFile(ext, 'external-before');
  await symlink(ext, join(root, 'uploads', 'existing.bin'));
  await assert.rejects(
    storage.put('uploads', 'existing.bin', Buffer.from('attempt')),
    denied('unsafe_path'),
  );
  assert.equal((await readFile(ext)).toString(), 'external-before');
});

test('047 bounded range streaming of a private stored file; refuses bad ranges and reuse', async () => {
  const { storage } = await fixture();
  const bytes = Buffer.from(Array.from({ length: 1000 }, (_, i) => i % 251));
  const stored = await storage.put('rendered', 'jobs/a.mp4', bytes);
  const opened = await storage.openForStreaming(stored.storageKey);
  assert.equal(opened.size, 1000);
  const chunks = [];
  for await (const chunk of opened.stream(100, 199)) chunks.push(chunk);
  assert.deepEqual(Buffer.concat(chunks), bytes.subarray(100, 200));
  assert.throws(() => opened.stream(0, 1), StorageError, 'one stream per open');
  const bad = await storage.openForStreaming(stored.storageKey);
  assert.throws(() => bad.stream(10, 1000), StorageError);
  assert.throws(() => bad.stream(-1, 5), StorageError);
  await bad.close();
  await assert.rejects(storage.openForStreaming('rendered/../etc/passwd'), StorageError);
  await assert.rejects(storage.openForStreaming('rendered/jobs/missing.mp4'));
});

test('047 VPS read-only media root is refused outside the explicit production gate', async () => {
  await assert.rejects(LocalStorage.openRender046VpsReadRoot('/bda-media'), StorageError);
});
