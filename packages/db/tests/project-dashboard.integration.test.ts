import assert from 'node:assert/strict';
import { test } from 'node:test';
import { eq } from 'drizzle-orm';
import {
  archiveProject,
  auditEvents,
  createProject,
  getProject,
  listProjects,
  migrateDatabase,
  openDatabase,
  projectVersions,
  renderJobs,
  renameProject,
  stepProgress,
} from '../src/index.js';

if (process.env.BDA_DB_TEST !== '1') throw new Error('Refusing non-isolated database');
const url = new URL(process.env.DATABASE_URL ?? '');
if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname !== '/bda_test') {
  throw new Error('Only local bda_test is allowed');
}

test('one project = one version + seven steps + zero jobs; rename/archive persist with audit', async () => {
  const conn = openDatabase();
  await migrateDatabase(conn);
  const created = await createProject(conn, { title: 'Pacific currents' });
  const id = created.project.id;
  try {
    const versions = await conn.db
      .select()
      .from(projectVersions)
      .where(eq(projectVersions.projectId, id));
    const steps = await conn.db
      .select()
      .from(stepProgress)
      .where(eq(stepProgress.projectVersionId, created.version.id));
    const jobs = await conn.db
      .select()
      .from(renderJobs)
      .where(eq(renderJobs.projectVersionId, created.version.id));
    assert.equal(versions.length, 1);
    assert.equal(steps.length, 7);
    assert.equal(jobs.length, 0);

    const renamed = await renameProject(conn, id, '  Pacific Oceans  ');
    assert.equal(renamed.title, 'Pacific Oceans');
    assert.equal(renamed.currentVersion, 1);
    await renameProject(conn, id, 'Pacific Oceans');
    const archived = await archiveProject(conn, id);
    assert.equal(archived.status, 'archived');
    assert.equal((await getProject(conn, id))?.status, 'archived');
    assert.ok(
      (await listProjects(conn, { limit: 20, offset: 0, status: 'archived' })).some(
        (p) => p.id === id,
      ),
    );

    const audits = await conn.db.select().from(auditEvents).where(eq(auditEvents.projectId, id));
    assert.deepEqual(audits.map((entry) => entry.eventType).sort(), [
      'project.archived',
      'project.created',
      'project.renamed',
    ]);
    await assert.rejects(renameProject(conn, id, 'No longer editable'), /cannot be modified/);
    await assert.rejects(archiveProject(conn, id), /cannot be modified/);
    assert.equal(
      (
        await conn.db
          .select()
          .from(renderJobs)
          .where(eq(renderJobs.projectVersionId, created.version.id))
      ).length,
      0,
    );
  } finally {
    await conn.pool.end();
  }
});

test('queued jobs block archiving without canceling the queue or changing project status', async () => {
  const conn = openDatabase();
  const created = await createProject(conn, { title: 'Long future film' });
  try {
    const [job] = await conn.db
      .insert(renderJobs)
      .values({ projectVersionId: created.version.id })
      .returning();
    await assert.rejects(archiveProject(conn, created.project.id), /cannot be modified/);
    assert.equal((await getProject(conn, created.project.id))?.status, 'draft');
    const [storedJob] = await conn.db.select().from(renderJobs).where(eq(renderJobs.id, job!.id));
    assert.equal(storedJob?.status, 'queued');
    const audit = await conn.db
      .select()
      .from(auditEvents)
      .where(eq(auditEvents.projectId, created.project.id));
    assert.deepEqual(
      audit.map((x) => x.eventType),
      ['project.created'],
    );
  } finally {
    await conn.pool.end();
  }
});
