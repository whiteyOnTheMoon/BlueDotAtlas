import { and, desc, eq, isNull } from 'drizzle-orm';
import type { ApiListQuery, ProjectStatus, RenderJobStatus, VideoStatus } from '@bluedotatlas/core';
import { artifacts, projectVersions, renderJobs, videoProjects, videos } from './schema.js';
import type { ReturnTypeOfOpenDatabase } from './types.js';

/** Bounded, server-side read models: never select storage keys, manifests or raw license notes. */
const projectFields = {
  id: videoProjects.id,
  title: videoProjects.title,
  status: videoProjects.status,
  currentVersion: videoProjects.currentVersion,
  createdAt: videoProjects.createdAt,
  updatedAt: videoProjects.updatedAt,
};

const videoFields = {
  id: videos.id,
  projectId: videos.projectId,
  projectVersionId: videos.projectVersionId,
  title: videos.title,
  slug: videos.slug,
  status: videos.status,
  durationMs: videos.durationMs,
  createdAt: videos.createdAt,
  updatedAt: videos.updatedAt,
};

const jobFields = {
  id: renderJobs.id,
  projectVersionId: renderJobs.projectVersionId,
  videoId: renderJobs.videoId,
  status: renderJobs.status,
  progressPct: renderJobs.progressPct,
  attempt: renderJobs.attempt,
  maxAttempts: renderJobs.maxAttempts,
  errorCode: renderJobs.errorCode,
  createdAt: renderJobs.createdAt,
  updatedAt: renderJobs.updatedAt,
};

const mediaFields = {
  id: artifacts.id,
  projectVersionId: artifacts.projectVersionId,
  kind: artifacts.kind,
  rightsStatus: artifacts.rightsStatus,
  createdAt: artifacts.createdAt,
  updatedAt: artifacts.updatedAt,
};

export async function listProjects({ db }: ReturnTypeOfOpenDatabase, options: ApiListQuery) {
  return db
    .select(projectFields)
    .from(videoProjects)
    .where(
      and(
        isNull(videoProjects.deletedAt),
        options.status ? eq(videoProjects.status, options.status as ProjectStatus) : undefined,
      ),
    )
    .orderBy(desc(videoProjects.createdAt), desc(videoProjects.id))
    .limit(options.limit)
    .offset(options.offset);
}

export async function listVideos({ db }: ReturnTypeOfOpenDatabase, options: ApiListQuery) {
  return db
    .select(videoFields)
    .from(videos)
    .innerJoin(projectVersions, eq(videos.projectVersionId, projectVersions.id))
    .innerJoin(videoProjects, eq(videos.projectId, videoProjects.id))
    .where(
      and(
        isNull(videos.deletedAt),
        isNull(projectVersions.deletedAt),
        isNull(videoProjects.deletedAt),
        options.status ? eq(videos.status, options.status as VideoStatus) : undefined,
        options.projectId ? eq(videos.projectId, options.projectId) : undefined,
      ),
    )
    .orderBy(desc(videos.createdAt), desc(videos.id))
    .limit(options.limit)
    .offset(options.offset);
}

export async function getVideo({ db }: ReturnTypeOfOpenDatabase, id: string) {
  const [row] = await db
    .select(videoFields)
    .from(videos)
    .innerJoin(projectVersions, eq(videos.projectVersionId, projectVersions.id))
    .innerJoin(videoProjects, eq(videos.projectId, videoProjects.id))
    .where(
      and(
        eq(videos.id, id),
        isNull(videos.deletedAt),
        isNull(projectVersions.deletedAt),
        isNull(videoProjects.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function listRenderJobs({ db }: ReturnTypeOfOpenDatabase, options: ApiListQuery) {
  return db
    .select(jobFields)
    .from(renderJobs)
    .innerJoin(projectVersions, eq(renderJobs.projectVersionId, projectVersions.id))
    .innerJoin(videoProjects, eq(projectVersions.projectId, videoProjects.id))
    .where(
      and(
        isNull(renderJobs.deletedAt),
        isNull(projectVersions.deletedAt),
        isNull(videoProjects.deletedAt),
        options.status ? eq(renderJobs.status, options.status as RenderJobStatus) : undefined,
        options.projectVersionId
          ? eq(renderJobs.projectVersionId, options.projectVersionId)
          : undefined,
      ),
    )
    .orderBy(desc(renderJobs.createdAt), desc(renderJobs.id))
    .limit(options.limit)
    .offset(options.offset);
}

export async function getRenderJob({ db }: ReturnTypeOfOpenDatabase, id: string) {
  const [row] = await db
    .select(jobFields)
    .from(renderJobs)
    .innerJoin(projectVersions, eq(renderJobs.projectVersionId, projectVersions.id))
    .innerJoin(videoProjects, eq(projectVersions.projectId, videoProjects.id))
    .where(
      and(
        eq(renderJobs.id, id),
        isNull(renderJobs.deletedAt),
        isNull(projectVersions.deletedAt),
        isNull(videoProjects.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}

export async function listMediaArtifacts({ db }: ReturnTypeOfOpenDatabase, options: ApiListQuery) {
  return db
    .select(mediaFields)
    .from(artifacts)
    .innerJoin(projectVersions, eq(artifacts.projectVersionId, projectVersions.id))
    .innerJoin(videoProjects, eq(projectVersions.projectId, videoProjects.id))
    .where(
      and(
        isNull(artifacts.deletedAt),
        isNull(projectVersions.deletedAt),
        isNull(videoProjects.deletedAt),
        options.kind ? eq(artifacts.kind, options.kind) : undefined,
        options.projectVersionId
          ? eq(artifacts.projectVersionId, options.projectVersionId)
          : undefined,
      ),
    )
    .orderBy(desc(artifacts.createdAt), desc(artifacts.id))
    .limit(options.limit)
    .offset(options.offset);
}

export async function getMediaArtifact({ db }: ReturnTypeOfOpenDatabase, id: string) {
  const [row] = await db
    .select(mediaFields)
    .from(artifacts)
    .innerJoin(projectVersions, eq(artifacts.projectVersionId, projectVersions.id))
    .innerJoin(videoProjects, eq(projectVersions.projectId, videoProjects.id))
    .where(
      and(
        eq(artifacts.id, id),
        isNull(artifacts.deletedAt),
        isNull(projectVersions.deletedAt),
        isNull(videoProjects.deletedAt),
      ),
    )
    .limit(1);
  return row ?? null;
}
