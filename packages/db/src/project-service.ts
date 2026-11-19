import { and, eq, isNull } from 'drizzle-orm';
import { assertProjectTransition, wizardSteps, type ProjectStatus } from '@bluedotatlas/core';
import { auditEvents, projectVersions, stepProgress, videoProjects } from './schema.js';
import type { ReturnTypeOfOpenDatabase } from './types.js';

/** No network service or HTTP endpoint is exposed. API validation/auth will follow in 025/026. */
export class ProjectNotFound extends Error {
  constructor(id: string) {
    super('Project not found: ' + id);
    this.name = 'ProjectNotFound';
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
        status: index === 0 ? 'active' as const : 'pending' as const,
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
