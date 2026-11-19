import assert from 'node:assert/strict';
import { test } from 'node:test';
import { and, eq, isNull } from 'drizzle-orm';
import {
  approvals,
  artifacts,
  auditEvents,
  createProject,
  getProject,
  migrateDatabase,
  openDatabase,
  projectVersions,
  renderJobs,
  stepProgress,
  transitionProjectStatus,
  videoProjects,
  videos,
} from '../src/index.js';

if (process.env.BDA_DB_TEST !== '1') throw new Error('BDA_DB_TEST=1 is mandatory');
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required');
const url = new URL(databaseUrl);
if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname !== '/bda_test') {
  throw new Error('Refusing to connect to non-test database');
}

test('project, first revision and seven steps survive disconnect/reconnect; forbidden jumps do not persist', async () => {
  let connection = openDatabase(databaseUrl);
  await migrateDatabase(connection);
  const created = await createProject(connection, {
    title: '  Ocean currents  ',
    snapshot: { language: 'en' },
  });
  const id = created.project.id;
  assert.equal(created.project.status, 'draft');
  assert.equal(created.project.title, 'Ocean currents');
  assert.equal(created.project.currentVersion, 1);
  assert.equal(created.version.revision, 1);
  const steps = await connection.db
    .select()
    .from(stepProgress)
    .where(eq(stepProgress.projectVersionId, created.version.id));
  assert.equal(steps.length, 7);
  assert.equal(steps.filter((s) => s.status === 'active').length, 1);
  assert.equal(steps.find((s) => s.status === 'active')?.stepNumber, 1);
  await connection.pool.end();

  // A brand-new PostgreSQL connection simulates a process restart.
  connection = openDatabase(databaseUrl);
  try {
    const recovered = await getProject(connection, id);
    assert.equal(recovered?.status, 'draft');
    assert.ok(recovered?.updatedAt instanceof Date);
    const versions = await connection.db
      .select()
      .from(projectVersions)
      .where(eq(projectVersions.projectId, id));
    assert.equal(versions.length, 1);
    assert.deepEqual(versions[0]?.snapshot, { language: 'en' });

    await assert.rejects(
      transitionProjectStatus(connection, id, 'approved'),
      /Invalid project status transition/,
    );
    assert.equal((await getProject(connection, id))?.status, 'draft');
    await transitionProjectStatus(connection, id, 'in_progress');
    await transitionProjectStatus(connection, id, 'in_review');
    await transitionProjectStatus(connection, id, 'approved');
    assert.equal((await getProject(connection, id))?.status, 'approved');
    await assert.rejects(
      transitionProjectStatus(connection, id, 'in_review'),
      /Invalid project status transition/,
    );
    assert.equal((await getProject(connection, id))?.status, 'approved');

    const audits = await connection.db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.projectId, id));
    assert.equal(audits.length, 4, 'only creation + 3 allowed transitions are audited');
    assert.equal(audits.filter((a) => a.eventType === 'project.status_changed').length, 3);
    await transitionProjectStatus(connection, id, 'archived');
    await assert.rejects(
      transitionProjectStatus(connection, id, 'draft'),
      /Invalid project status transition/,
    );

    await connection.db
      .update(videoProjects)
      .set({ deletedAt: new Date() })
      .where(eq(videoProjects.id, id));
    assert.equal(await getProject(connection, id), null, 'soft deleted rows are hidden');
    assert.equal(
      (await connection.db.select().from(videoProjects).where(eq(videoProjects.id, id))).length,
      1,
      'soft delete retains data',
    );
  } finally {
    await connection.pool.end();
  }
});

test('FK, unique, enum and range checks protect every video/step/job/approval contract', async () => {
  const connection = openDatabase(databaseUrl);
  try {
    const a = await createProject(connection, { title: 'Greenland ice' });
    const b = await createProject(connection, { title: 'Deep sea' });
    const versionId = a.version.id;

    // Database constraints, not a browser-only check.
    await assert.rejects(
      connection.db.insert(projectVersions).values({ projectId: a.project.id, revision: 1 }),
      /duplicate key value/,
    );
    await assert.rejects(
      connection.db.insert(stepProgress).values({ projectVersionId: versionId, stepNumber: 8 }),
      /step_progress_step_valid/,
    );
    await assert.rejects(
      connection.db.insert(stepProgress).values({ projectVersionId: versionId, stepNumber: 1 }),
      /duplicate key value/,
    );
    await assert.rejects(
      connection.db.insert(stepProgress).values({
        projectVersionId: '00000000-0000-0000-0000-000000000002',
        stepNumber: 4,
      }),
      /foreign key constraint/,
    );
    await assert.rejects(
      connection.db.insert(renderJobs).values({ projectVersionId: versionId, progressPct: 101 }),
      /render_jobs_progress_valid/,
    );
    await assert.rejects(
      connection.db.insert(approvals).values({
        projectVersionId: versionId,
        scope: 'publish',
        status: 'approved',
      }),
      /approvals_decision_time_valid/,
    );
    await assert.rejects(
      connection.db.insert(artifacts).values({
        projectVersionId: versionId,
        kind: 'footage',
      }),
      /artifacts_require_location/,
    );

    const [asset] = await connection.db
      .insert(artifacts)
      .values({
        projectVersionId: versionId,
        kind: 'footage',
        sourceUri: 'https://example.org/footage',
      })
      .returning();
    assert.equal(asset?.rightsStatus, 'unreviewed', 'uncleared media is never implicitly cleared');

    const [video] = await connection.db
      .insert(videos)
      .values({ projectId: a.project.id, projectVersionId: versionId, title: 'Glacier draft' })
      .returning();
    assert.equal(video?.status, 'draft');
    await assert.rejects(
      connection.db
        .insert(videos)
        .values({ projectId: b.project.id, projectVersionId: versionId, title: 'Cross-project' }),
      /videos_project_version_fk/,
    );
    await assert.rejects(
      connection.db
        .update(videos)
        .set({ status: 'published', publishedAt: new Date() })
        .where(eq(videos.id, video!.id)),
      /videos_published_require_artifact/,
    );
    assert.equal(
      (await connection.db.select().from(videos).where(eq(videos.id, video!.id)))[0]?.status,
      'draft',
    );

    const [job] = await connection.db
      .insert(renderJobs)
      .values({ projectVersionId: versionId, videoId: video!.id })
      .returning();
    assert.equal(job?.status, 'queued');
    assert.equal(job?.progressPct, 0);
    assert.equal(
      (
        await connection.db
          .select()
          .from(artifacts)
          .where(and(eq(artifacts.id, asset!.id), isNull(artifacts.deletedAt)))
      ).length,
      1,
    );
  } finally {
    await connection.pool.end();
  }
});
