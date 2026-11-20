import { and, eq, inArray, isNull } from 'drizzle-orm';
import { assertProjectTransition, wizardSteps, type ProjectStatus } from '@bluedotatlas/core';
import { auditEvents, projectVersions, renderJobs, stepProgress, videoProjects } from './schema.js';
import type { ReturnTypeOfOpenDatabase } from './types.js';

/** Pure transaction service: external HTTP access is guarded by the separate 026 API layer. */
export class ProjectNotFound extends Error {
  constructor(id: string) {
    super('Project not found: ' + id);
    this.name = 'ProjectNotFound';
  }
}

/** Conflict conditions are not reported with potentially sensitive database details. */
export class ProjectConflict extends Error {
  constructor() {
    super('Project cannot be modified in its current state');
    this.name = 'ProjectConflict';
  }
}

/** Atomic first version + all seven steps + event, with no implicit render or publish. */
export async function createProject(
  { db }: ReturnTypeOfOpenDatabase,
  input: { title: string; snapshot?: Record<string, unknown> },
) {
  const title = input.title.trim();
  if (!title) throw new Error('Project title is required');

  return db.transaction(async (tx) => {
    const [project] = await tx.insert(videoProjects).values({ title }).returning();
    if (!project) throw new Error('Unable to create project');

    const [version] = await tx
      .insert(projectVersions)
      .values({ projectId: project.id, revision: 1, snapshot: input.snapshot ?? {} })
      .returning();
    if (!version) throw new Error('Unable to create initial revision');

    await tx.insert(stepProgress).values(
      wizardSteps.map((_, index) => ({
        projectVersionId: version.id,
        stepNumber: index + 1,
        status: index === 0 ? ('active' as const) : ('pending' as const),
      })),
    );
    await tx.insert(auditEvents).values({
      projectId: project.id,
      targetKind: 'project',
      targetId: project.id,
      eventType: 'project.created',
      details: { revision: 1 },
    });
    return { project, version };
  });
}

/** Deleted projects never appear in ordinary project reads. */
export async function getProject({ db }: ReturnTypeOfOpenDatabase, id: string) {
  const [project] = await db
    .select()
    .from(videoProjects)
    .where(and(eq(videoProjects.id, id), isNull(videoProjects.deletedAt)));
  return project ?? null;
}

/** Serializes concurrent transitions and writes the audit entry in the *same* transaction. */
export async function transitionProjectStatus(
  { db }: ReturnTypeOfOpenDatabase,
  id: string,
  nextStatus: ProjectStatus,
) {
  return db.transaction(async (tx) => {
    const [before] = await tx
      .select()
      .from(videoProjects)
      .where(and(eq(videoProjects.id, id), isNull(videoProjects.deletedAt)))
      .for('update');
    if (!before) throw new ProjectNotFound(id);

    assertProjectTransition(before.status, nextStatus);

    const [after] = await tx
      .update(videoProjects)
      .set({ status: nextStatus, updatedAt: new Date() })
      .where(eq(videoProjects.id, id))
      .returning();
    if (!after) throw new ProjectNotFound(id);

    await tx.insert(auditEvents).values({
      projectId: id,
      targetKind: 'project',
      targetId: id,
      eventType: 'project.status_changed',
      details: { from: before.status, to: nextStatus },
    });
    return after;
  });
}


/** Rename under a row lock; keep the revision and its seven steps unchanged. */
export async function renameProject(
  { db }: ReturnTypeOfOpenDatabase,
  id: string,
  titleInput: string,
) {
  const title = titleInput.trim();
  if (!title || title.length > 160 || /[\u0000-\u001f\u007f]/.test(title)) {
    throw new Error('Invalid project title');
  }
  return db.transaction(async (tx) => {
    const [before] = await tx
      .select()
      .from(videoProjects)
      .where(and(eq(videoProjects.id, id), isNull(videoProjects.deletedAt)))
      .for('update');
    if (!before) throw new ProjectNotFound(id);
    if (before.status === 'archived') throw new ProjectConflict();
    if (before.title === title) return before; // No redundant audit or version.
    const [after] = await tx
      .update(videoProjects)
      .set({ title, updatedAt: new Date() })
      .where(eq(videoProjects.id, id))
      .returning();
    if (!after) throw new ProjectNotFound(id);
    await tx.insert(auditEvents).values({
      projectId: id,
      targetKind: 'project',
      targetId: id,
      eventType: 'project.renamed',
      details: { from: before.title, to: title },
    });
    return after;
  });
}

/** Terminal archive, never a deletion, queue cancellation or automatic publish. */
export async function archiveProject({ db }: ReturnTypeOfOpenDatabase, id: string) {
  return db.transaction(async (tx) => {
    const [before] = await tx
      .select()
      .from(videoProjects)
      .where(and(eq(videoProjects.id, id), isNull(videoProjects.deletedAt)))
      .for('update');
    if (!before) throw new ProjectNotFound(id);
    if (before.status === 'archived') throw new ProjectConflict();
    assertProjectTransition(before.status, 'archived');

    // Never archive a project with dispatchable/running jobs, or implicitly cancel work.
    const activeJobs = await tx
      .select({ id: renderJobs.id })
      .from(renderJobs)
      .innerJoin(projectVersions, eq(renderJobs.projectVersionId, projectVersions.id))
      .where(
        and(
          eq(projectVersions.projectId, id),
          isNull(projectVersions.deletedAt),
          isNull(renderJobs.deletedAt),
          inArray(renderJobs.status, ['queued', 'running']),
        ),
      )
      .limit(1);
    if (activeJobs.length) throw new ProjectConflict();

    const [after] = await tx
      .update(videoProjects)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(videoProjects.id, id))
      .returning();
    if (!after) throw new ProjectNotFound(id);
    await tx.insert(auditEvents).values({
      projectId: id,
      targetKind: 'project',
      targetId: id,
      eventType: 'project.archived',
      details: { from: before.status },
    });
    return after;
  });
}
