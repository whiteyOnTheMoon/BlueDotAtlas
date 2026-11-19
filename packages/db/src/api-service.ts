/** Narrow, server-only API imports. Do not import migration scripts into Next.js route bundles. */
export { openDatabase } from './client.js';
export { createProject, getProject } from './project-service.js';
export {
  listProjects,
  listVideos,
  getVideo,
  listRenderJobs,
  getRenderJob,
  listMediaArtifacts,
  getMediaArtifact,
} from './api-read-service.js';
export { hasAdminSession } from './auth-service.js';
export {
  ApiValidationError,
  parseApiUuid,
  parseApiListQuery,
  parseApiCreateProject,
} from '@bluedotatlas/core';
export type { ApiCollection, ApiListQuery } from '@bluedotatlas/core';
