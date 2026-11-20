import { and, asc, eq, isNull } from 'drizzle-orm';
import { wizardSteps, type ApiWizardChange } from '@bluedotatlas/core';
import { auditEvents, projectVersions, stepProgress, videoProjects } from './schema.js';
import { ProjectConflict, ProjectNotFound } from './project-service.js';
import type { ReturnTypeOfOpenDatabase } from './types.js';

type StoredDraft = Record<string, unknown>;
type ReviewState = 'draft' | 'submitted';

/** Safe public-to-admin DTO: never return future raw draft keys or audit details. */
function fromRow(row: {
  id: string;
  stepNumber: number;
  status: string;
  draft: StoredDraft;
  updatedAt: Date;
}) {
  const raw = row.draft;
  const revision = raw.editRevision ?? 0;
  if (!Number.isSafeInteger(revision) || (revision as number) < 0) {
    throw new ProjectConflict();
  }
  const review = raw.reviewState ?? 'draft';
  if (review !== 'draft' && review !== 'submitted') throw new ProjectConflict();
  const notes = raw.editorNotes ?? '';
  if (typeof notes !== 'string' || notes.length > 4000) throw new ProjectConflict();
  return {
    number: row.stepNumber,
    label: wizardSteps[row.stepNumber - 1],
    status: row.status,
    notes,
    editRevision: revision as number,
    reviewState: review as ReviewState,
    updatedAt: row.updatedAt,
  };
}

/** Reads the current project version and its seven independent draft slots. */
export async function readWizard({ db }: ReturnTypeOfOpenDatabase, id: string) {
  const [project] = await db
    .select({
      id: videoProjects.id,
      title: videoProjects.title,
      status: videoProjects.status,
      currentVersion: videoProjects.currentVersion,
    })
    .from(videoProjects)
    .where(and(eq(videoProjects.id, id), isNull(videoProjects.deletedAt)));
  if (!project) throw new ProjectNotFound(id);

  const [version] = await db
    .select({ id: projectVersions.id })
    .from(projectVersions)
    .where(
      and(
        eq(projectVersions.projectId, id),
        eq(projectVersions.revision, project.currentVersion),
        isNull(projectVersions.deletedAt),
      ),
    );
  if (!version) throw new ProjectNotFound(id);
  const steps = await db
    .select({
      id: stepProgress.id,
      stepNumber: stepProgress.stepNumber,
      status: stepProgress.status,
      draft: stepProgress.draft,
      updatedAt: stepProgress.updatedAt,
    })
    .from(stepProgress)
    .where(
      and(
        eq(stepProgress.projectVersionId, version.id),
        isNull(stepProgress.deletedAt),
      ),
    )
    .orderBy(asc(stepProgress.stepNumber));
  if (steps.length !== wizardSteps.length || steps.some((item, n) => item.stepNumber !== n + 1)) {
    throw new ProjectConflict();
  }
  return { project, steps: steps.map(fromRow) };
}

/**
 * Serialized by project row then step row, respecting 031 archive locking order.
 * Compare-and-swap editRevision lives in existing JSONB, so no migration or
 * timestamp precision ambiguity. No editorial approval is set here.
 */
export async function changeWizardStep(
  { db }: ReturnTypeOfOpenDatabase,
  id: string,
  stepNumber: number,
  change: ApiWizardChange,
) {
  return db.transaction(async (tx) => {
    const [project] = await tx
      .select({ id: videoProjects.id, status: videoProjects.status, version: videoProjects.currentVersion })
      .from(videoProjects)
      .where(and(eq(videoProjects.id, id), isNull(videoProjects.deletedAt)))
      .for('update');
    if (!project) throw new ProjectNotFound(id);
    if (project.status === 'archived' || project.status === 'approved' || project.status === 'in_review') {
      throw new ProjectConflict();
    }
    const [version] = await tx
      .select({ id: projectVersions.id })
      .from(projectVersions)
      .where(
        and(
          eq(projectVersions.projectId, id),
          eq(projectVersions.revision, project.version),
          isNull(projectVersions.deletedAt),
        ),
      );
    if (!version) throw new ProjectNotFound(id);
    const [step] = await tx
      .select()
      .from(stepProgress)
      .where(
        and(
          eq(stepProgress.projectVersionId, version.id),
          eq(stepProgress.stepNumber, stepNumber),
          isNull(stepProgress.deletedAt),
        ),
      )
      .for('update');
    if (!step) throw new ProjectNotFound(id);

    const before = fromRow(step);
    if (before.editRevision !== change.expectedRevision) throw new ProjectConflict();

    let notes = before.notes;
    let reviewState: ReviewState = before.reviewState;
    let eventType = 'step.draft_saved';
    if ('notes' in change) {
      notes = change.notes;
      if (notes !== before.notes) reviewState = 'draft';
    } else {
      if (!before.notes.trim()) throw new ProjectConflict();
      reviewState = 'submitted';
      eventType = 'step.review_requested';
    }
    // Repeated idempotent request is harmless; stale versions still fail above.
    if (notes === before.notes && reviewState === before.reviewState) return before;
    const nextRevision = before.editRevision + 1;
    const [updated] = await tx
      .update(stepProgress)
      .set({
        draft: {
          ...step.draft,
          editorNotes: notes,
          editRevision: nextRevision,
          reviewState,
        },
        updatedAt: new Date(),
      })
      .where(eq(stepProgress.id, step.id))
      .returning();
    if (!updated) throw new ProjectNotFound(id);
    await tx.insert(auditEvents).values({
      projectId: project.id,
      targetKind: 'step',
      targetId: step.id,
      eventType,
      details: { stepNumber, editRevision: nextRevision, reviewState },
    });
    return fromRow(updated);
  });
}
