// Server-side only. No database credentials or endpoints are exported to a browser bundle.
export * from './schema.js';
export { databaseUrl, openDatabase } from './client.js';
export { migrateDatabase } from './migrations.js';
export { seedDatabase } from './seed-data.js';
export {
  createProject,
  getProject,
  transitionProjectStatus,
  ProjectNotFound,
} from './project-service.js';

export {
  ADMIN_SESSION_SECONDS,
  AdminAuthUnavailable,
  loginAdmin,
  hasAdminSession,
  revokeAdminSession,
} from './auth-service.js';
export { generatePasswordHash, verifyPassword } from './password.js';

export {
  listProjects,
  listVideos,
  getVideo,
  listRenderJobs,
  getRenderJob,
  listMediaArtifacts,
  getMediaArtifact,
} from './api-read-service.js';
export {
  ApiValidationError,
  parseApiUuid,
  parseApiListQuery,
  parseApiCreateProject,
} from '@bluedotatlas/core';
export type { ApiCollection, ApiListQuery } from '@bluedotatlas/core';
