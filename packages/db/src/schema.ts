import { sql } from 'drizzle-orm';
import {
  check, foreignKey, index, integer, jsonb, pgEnum, pgTable,
  text, timestamp, uniqueIndex, uuid,
} from 'drizzle-orm/pg-core';
import {
  projectStatuses, videoStatuses, renderJobStatuses, stepStatuses,
  approvalStatuses, approvalScopes, artifactKinds, assetRightsStatuses, auditTargetKinds,
} from '@bluedotatlas/core';

/** M02/023 technical baseline: unchanged, preserving the existing first migration. */
export const appMetadata = pgTable(
  'app_metadata',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    key: text('key').notNull(),
    value: text('value').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [uniqueIndex('app_metadata_key_unique').on(table.key)],
);

export const projectStatusEnum = pgEnum('bda_project_status', projectStatuses);
export const stepStatusEnum = pgEnum('bda_step_status', stepStatuses);
export const videoStatusEnum = pgEnum('bda_video_status', videoStatuses);
export const renderJobStatusEnum = pgEnum('bda_render_job_status', renderJobStatuses);
export const approvalStatusEnum = pgEnum('bda_approval_status', approvalStatuses);
export const approvalScopeEnum = pgEnum('bda_approval_scope', approvalScopes);
export const artifactKindEnum = pgEnum('bda_artifact_kind', artifactKinds);
export const artifactRightsStatusEnum = pgEnum('bda_artifact_rights', assetRightsStatuses);
export const auditTargetKindEnum = pgEnum('bda_audit_target', auditTargetKinds);

/** Operational entities use timestamptz and explicit, nullable soft deletion. */
function timestamps() {
  return {
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  };
}

export const videoProjects = pgTable(
  'video_projects',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    status: projectStatusEnum('status').default('draft').notNull(),
    currentVersion: integer('current_version').default(1).notNull(),
    ...timestamps(),
  },
  (table) => [
    check('video_projects_title_not_blank', sql`length(btrim(${table.title})) > 0`),
    check('video_projects_version_positive', sql`${table.currentVersion} > 0`),
    index('video_projects_status_idx').on(table.status),
  ],
);

export const projectVersions = pgTable(
  'project_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').notNull().references(() => videoProjects.id, { onDelete: 'restrict' }),
    revision: integer('revision').notNull(),
    snapshot: jsonb('snapshot').$type<Record<string, unknown>>().default({}).notNull(),
    ...timestamps(),
  },
  (table) => [
    check('project_versions_revision_positive', sql`${table.revision} > 0`),
    uniqueIndex('project_versions_project_revision_unique').on(table.projectId, table.revision),
    uniqueIndex('project_versions_project_id_unique').on(table.projectId, table.id),
  ],
);

export const stepProgress = pgTable(
  'step_progress',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectVersionId: uuid('project_version_id').notNull().references(() => projectVersions.id, { onDelete: 'restrict' }),
    stepNumber: integer('step_number').notNull(),
    status: stepStatusEnum('status').default('pending').notNull(),
    draft: jsonb('draft').$type<Record<string, unknown>>().default({}).notNull(),
    ...timestamps(),
  },
  (table) => [
    check('step_progress_step_valid', sql`${table.stepNumber} BETWEEN 1 AND 7`),
    uniqueIndex('step_progress_version_step_unique').on(table.projectVersionId, table.stepNumber),
  ],
);

export const artifacts = pgTable(
  'artifacts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectVersionId: uuid('project_version_id').notNull().references(() => projectVersions.id, { onDelete: 'restrict' }),
    kind: artifactKindEnum('kind').notNull(),
    rightsStatus: artifactRightsStatusEnum('rights_status').default('unreviewed').notNull(),
    storageKey: text('storage_key'),
    sourceUri: text('source_uri'),
    licenseEvidence: text('license_evidence'),
    checksumSha256: text('checksum_sha256'),
    ...timestamps(),
  },
  (table) => [
    check('artifacts_require_location', sql`${table.storageKey} IS NOT NULL OR ${table.sourceUri} IS NOT NULL`),
    uniqueIndex('artifacts_storage_key_unique').on(table.storageKey),
    index('artifacts_version_idx').on(table.projectVersionId),
  ],
);

export const videos = pgTable(
  'videos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').notNull().references(() => videoProjects.id, { onDelete: 'restrict' }),
    projectVersionId: uuid('project_version_id').notNull(),
    title: text('title').notNull(),
    slug: text('slug'),
    status: videoStatusEnum('status').default('draft').notNull(),
    durationMs: integer('duration_ms'),
    finalArtifactId: uuid('final_artifact_id').references(() => artifacts.id, { onDelete: 'restrict' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    foreignKey({
      name: 'videos_project_version_fk',
      columns: [table.projectId, table.projectVersionId],
      foreignColumns: [projectVersions.projectId, projectVersions.id],
    }),
    check('videos_title_not_blank', sql`length(btrim(${table.title})) > 0`),
    check('videos_duration_valid', sql`${table.durationMs} IS NULL OR ${table.durationMs} >= 0`),
    check('videos_published_require_artifact', sql`${table.status} <> 'published' OR (${table.finalArtifactId} IS NOT NULL AND ${table.publishedAt} IS NOT NULL)`),
    uniqueIndex('videos_slug_unique').on(table.slug),
    index('videos_project_status_idx').on(table.projectId, table.status),
  ],
);

export const renderJobs = pgTable(
  'render_jobs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectVersionId: uuid('project_version_id').notNull().references(() => projectVersions.id, { onDelete: 'restrict' }),
    videoId: uuid('video_id').references(() => videos.id, { onDelete: 'restrict' }),
    status: renderJobStatusEnum('status').default('queued').notNull(),
    progressPct: integer('progress_pct').default(0).notNull(),
    attempt: integer('attempt').default(0).notNull(),
    maxAttempts: integer('max_attempts').default(3).notNull(),
    manifest: jsonb('manifest').$type<Record<string, unknown>>().default({}).notNull(),
    leaseExpiresAt: timestamp('lease_expires_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    finishedAt: timestamp('finished_at', { withTimezone: true }),
    errorCode: text('error_code'),
    ...timestamps(),
  },
  (table) => [
    check('render_jobs_progress_valid', sql`${table.progressPct} BETWEEN 0 AND 100`),
    check('render_jobs_attempt_valid', sql`${table.attempt} >= 0 AND ${table.maxAttempts} > 0`),
    index('render_jobs_status_idx').on(table.status, table.createdAt),
    index('render_jobs_version_idx').on(table.projectVersionId),
  ],
);

export const approvals = pgTable(
  'approvals',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectVersionId: uuid('project_version_id').notNull().references(() => projectVersions.id, { onDelete: 'restrict' }),
    videoId: uuid('video_id').references(() => videos.id, { onDelete: 'restrict' }),
    scope: approvalScopeEnum('scope').notNull(),
    status: approvalStatusEnum('status').default('pending').notNull(),
    decisionNote: text('decision_note'),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    ...timestamps(),
  },
  (table) => [
    check('approvals_decision_time_valid', sql`(${table.status} = 'pending' AND ${table.decidedAt} IS NULL) OR (${table.status} <> 'pending' AND ${table.decidedAt} IS NOT NULL)`),
    index('approvals_version_scope_idx').on(table.projectVersionId, table.scope),
  ],
);

/** Append-only audit ledger: deliberately no deleted_at or update operation. */
export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    projectId: uuid('project_id').notNull().references(() => videoProjects.id, { onDelete: 'restrict' }),
    targetKind: auditTargetKindEnum('target_kind').notNull(),
    targetId: uuid('target_id').notNull(),
    eventType: text('event_type').notNull(),
    details: jsonb('details').$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    check('audit_events_type_not_blank', sql`length(btrim(${table.eventType})) > 0`),
    index('audit_events_project_created_idx').on(table.projectId, table.createdAt),
  ],
);
