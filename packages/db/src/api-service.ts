/** Narrow, server-only API imports. Do not import migration scripts into Next.js route bundles. */
export { openDatabase } from './client.js';
export {
  createProject,
  getProject,
  renameProject,
  archiveProject,
  ProjectNotFound,
  ProjectConflict,
} from './project-service.js';
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
export { readWizard, changeWizardStep } from './step-progress-service.js';
export {
  ApiValidationError,
  parseApiUuid,
  parseApiListQuery,
  parseApiCreateProject,
  parseApiProjectPatch,
  parseApiWizardStep,
  parseApiWizardChange,
} from '@bluedotatlas/core';
export type { ApiCollection, ApiListQuery, ApiWizardChange } from '@bluedotatlas/core';
