import assert from 'node:assert/strict';
import { test } from 'node:test';
import { eq } from 'drizzle-orm';
import {
  approvals,
  archiveProject,
  auditEvents,
  changeWizardStep,
  createProject,
  migrateDatabase,
  openDatabase,
  projectVersions,
  readWizard,
  renderJobs,
  stepProgress,
} from '../src/index.js';

if (process.env.BDA_DB_TEST !== '1') throw new Error('Must use isolated CI test database');
const dbUrl = new URL(process.env.DATABASE_URL ?? '');
if (!['127.0.0.1', 'localhost'].includes(dbUrl.hostname) || dbUrl.pathname !== '/bda_test') {
  throw new Error('Refusing non-test database');
}

test('seven step drafts persist across pool restart, with independent CAS revisions and safe audit', async () => {
  let connection = openDatabase();
  await migrateDatabase(connection);
  const project = await createProject(connection, { title: 'Glaciers and ocean currents' });
  const id = project.project.id;
  const initial = await readWizard(connection, id);
  assert.equal(initial.steps.length, 7);
  assert.deepEqual(
    initial.steps.map((s) => s.editRevision),
    [0, 0, 0, 0, 0, 0, 0],
  );
  assert.ok(initial.steps.every((s) => s.reviewState === 'draft'));
  const saved = await changeWizardStep(connection, id, 2, {
    expectedRevision: 0,
    notes: 'Private climate research note',
  });
  assert.equal(saved.editRevision, 1);
  assert.equal(saved.notes, 'Private climate research note');
  await assert.rejects(
    changeWizardStep(connection, id, 2, { expectedRevision: 0, notes: 'Overwrites later save' }),
    /cannot be modified/,
  );
  const unchanged = await readWizard(connection, id);
  assert.equal(unchanged.steps[1]?.notes, saved.notes);
  assert.equal(unchanged.steps[0]?.notes, '');
  assert.equal(unchanged.steps[2]?.editRevision, 0);

  const submitted = await changeWizardStep(connection, id, 2, {
    expectedRevision: 1,
    action: 'submit',
  });
  assert.equal(submitted.reviewState, 'submitted');
  assert.equal(submitted.editRevision, 2);
  const editedAfterSubmit = await changeWizardStep(connection, id, 2, {
    expectedRevision: 2,
    notes: 'Updated editorial direction',
  });
  assert.equal(editedAfterSubmit.reviewState, 'draft');
  assert.equal(editedAfterSubmit.editRevision, 3);
  await assert.rejects(
    changeWizardStep(connection, id, 3, { expectedRevision: 0, action: 'submit' }),
    /cannot be modified/,
  );
  const redundant = await changeWizardStep(connection, id, 2, {
    expectedRevision: 3,
    notes: editedAfterSubmit.notes,
  });
  assert.equal(redundant.editRevision, 3, 'unchanged saves do not make a revision or audit');

  const version = await connection.db
    .select()
    .from(projectVersions)
    .where(eq(projectVersions.projectId, id));
  assert.equal(version.length, 1, 'Autosave must not create new project snapshots');
  const jobs = await connection.db
    .select()
    .from(renderJobs)
    .where(eq(renderJobs.projectVersionId, project.version.id));
  assert.equal(jobs.length, 0);
  const authorizations = await connection.db
    .select()
    .from(approvals)
    .where(eq(approvals.projectVersionId, project.version.id));
  assert.equal(
    authorizations.length,
    0,
    'Review request must not count as rights/render/publish approval',
  );
  const audit = await connection.db.select().from(auditEvents).where(eq(auditEvents.projectId, id));
  assert.deepEqual(audit.map((event) => event.eventType).sort(), [
    'project.created',
    'step.draft_saved',
    'step.draft_saved',
    'step.review_requested',
  ]);
  assert.doesNotMatch(
    JSON.stringify(audit),
    /Private climate research note|Updated editorial direction/,
  );
  await connection.pool.end();

  connection = openDatabase();
  try {
    const restored = await readWizard(connection, id);
    assert.equal(restored.steps[1]?.notes, 'Updated editorial direction');
    assert.equal(restored.steps[1]?.editRevision, 3);
    assert.equal(restored.steps[1]?.reviewState, 'draft');
    const originalSteps = await connection.db
      .select()
      .from(stepProgress)
      .where(eq(stepProgress.projectVersionId, project.version.id));
    assert.equal(originalSteps.length, 7);
    await archiveProject(connection, id);
    await assert.rejects(
      changeWizardStep(connection, id, 2, {
        expectedRevision: 3,
        notes: 'Forbidden after archive',
      }),
      /cannot be modified/,
    );
  } finally {
    await connection.pool.end();
  }
});

test('simultaneous stale saves serialize and exactly one writer wins', async () => {
  const a = openDatabase();
  const b = openDatabase();
  const created = await createProject(a, { title: 'Two editor tabs' });
  try {
    const attempts = await Promise.allSettled([
      changeWizardStep(a, created.project.id, 1, { expectedRevision: 0, notes: 'Tab A' }),
      changeWizardStep(b, created.project.id, 1, { expectedRevision: 0, notes: 'Tab B' }),
    ]);
    assert.equal(attempts.filter((x) => x.status === 'fulfilled').length, 1);
    assert.equal(attempts.filter((x) => x.status === 'rejected').length, 1);
    const after = await readWizard(a, created.project.id);
    assert.equal(after.steps[0]?.editRevision, 1);
    assert.ok(['Tab A', 'Tab B'].includes(after.steps[0]?.notes ?? ''));
  } finally {
    await Promise.all([a.pool.end(), b.pool.end()]);
  }
});
