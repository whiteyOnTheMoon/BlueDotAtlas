import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, rm, utimes } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  artifacts,
  createProject,
  migrateDatabase,
  openDatabase,
  videos,
} from '../packages/db/dist/index.js';
import { LocalStorage } from '../packages/storage/dist/index.js';

const url = process.env.DATABASE_URL ? new URL(process.env.DATABASE_URL) : null;
if (
  process.env.BDA_DB_TEST !== '1' ||
  process.env.BDA_STORAGE_TEST !== '1' ||
  !url ||
  url.protocol !== 'postgresql:' ||
  url.username !== 'bda_test' ||
  !['localhost', '127.0.0.1'].includes(url.hostname) ||
  url.pathname !== '/bda_test' ||
  url.search
) {
  throw new Error('Refusing non-isolated PostgreSQL/FS integration');
}

const root = await mkdtemp(join(tmpdir(), 'bda-storage-028-'));
const db = openDatabase();
let originalDbClosed = false;
try {
  await migrateDatabase(db);
  const storage = await LocalStorage.openIsolatedTestRoot(root);
  const payload = Buffer.from('SYNTHETIC-028-MP4-METADATA-NOT-REAL-VIDEO');
  const uploaded = await storage.put('rendered', 'synthetic-final.mp4', payload);
  await storage.put('temp', 'stale-028.bin', Buffer.from('temporary-render-chunk'));
  await storage.put('cache', 'stale-028.bin', Buffer.from('cached-analysis'));
  const old = new Date(Date.now() - 120_000);
  await utimes(join(root, 'temp', 'stale-028.bin'), old, old);
  await utimes(join(root, 'cache', 'stale-028.bin'), old, old);

  const project = await createProject(db, { title: 'Synthetic 028 storage reference test' });
  const [artifact] = await db.db
    .insert(artifacts)
    .values({
      projectVersionId: project.version.id,
      kind: 'render',
      rightsStatus: 'unreviewed',
      storageKey: uploaded.storageKey,
      checksumSha256: uploaded.sha256,
    })
    .returning();
  assert.ok(artifact?.id);

  const [video] = await db.db
    .insert(videos)
    .values({
      projectId: project.project.id,
      projectVersionId: project.version.id,
      title: 'Synthetic 028 unreviewed video – not publishable',
      status: 'draft',
      finalArtifactId: artifact.id,
    })
    .returning();
  assert.ok(video?.id);
  assert.equal(video.status, 'draft');
  assert.equal(video.publishedAt, null);
  assert.equal(artifact.rightsStatus, 'unreviewed');

  const tempCleanup = await storage.cleanup('temp', {
    olderThanMs: 1000, maxDeleteBytes: 1024, maxFiles: 5, dryRun: false,
  });
  const cacheCleanup = await storage.cleanup('cache', {
    olderThanMs: 1000, maxDeleteBytes: 1024, maxFiles: 5, dryRun: false,
  });
  assert.deepEqual(tempCleanup.removed, ['temp/stale-028.bin']);
  assert.deepEqual(cacheCleanup.removed, ['cache/stale-028.bin']);

  // DB survives independent pool reconnect; referenced file survives independent storage reopen.
  await db.pool.end();
  originalDbClosed = true;
  const reopenedDb = openDatabase();
  try {
    const [artifactResult, videoResult] = await Promise.all([
      reopenedDb.pool.query(
        'SELECT id, storage_key, checksum_sha256, rights_status FROM artifacts WHERE id = $1::uuid',
        [artifact.id],
      ),
      reopenedDb.pool.query(
        'SELECT final_artifact_id, status, published_at FROM videos WHERE id = $1::uuid',
        [video.id],
      ),
    ]);
    const persistedArtifact = artifactResult.rows[0];
    const persistedVideo = videoResult.rows[0];
    assert.ok(persistedArtifact);
    assert.ok(persistedVideo);
    assert.equal(persistedVideo.final_artifact_id, persistedArtifact.id);
    assert.equal(persistedArtifact.storage_key, 'rendered/synthetic-final.mp4');
    assert.equal(persistedVideo.status, 'draft', 'No implicit publishing from file presence');
    assert.equal(persistedVideo.published_at, null);
    assert.equal(persistedArtifact.rights_status, 'unreviewed', 'No implicit rights clearance');
    const reopenedStorage = await LocalStorage.openIsolatedTestRoot(root);
    const contents = await reopenedStorage.read(persistedArtifact.storage_key);
    assert.deepEqual(contents, payload);
    assert.equal(
      createHash('sha256').update(contents).digest('hex'),
      persistedArtifact.checksum_sha256,
    );
    assert.equal((await reopenedStorage.usage()).scratchBytes, 0);
    assert.equal((await reopenedStorage.usage()).mediaBytes, payload.byteLength);
    process.stdout.write(
      'M02 028 PASS: private FS storage key, SHA-256, PostgreSQL artifact/video relation, ' +
        'reopened DB and FS, bounded temp/cache cleanup, no publishing or rights escalation.\n',
    );
  } finally {
    await reopenedDb.pool.end();
  }
} finally {
  if (!originalDbClosed) await db.pool.end();
  // Only the CI-created isolated test root is removable. The library NEVER recursively removes roots.
  await rm(root, { recursive: true, force: true });
}
