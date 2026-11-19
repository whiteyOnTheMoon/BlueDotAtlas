/** Workflow vocabulary. Published videos require a separate manual publishing operation (M12). */
export const projectStatuses = [
  'draft',
  'in_progress',
  'in_review',
  'approved',
  'archived',
] as const;
export const videoStatuses = ['draft', 'rendered', 'in_review', 'ready', 'published'] as const;
export const renderJobStatuses = ['queued', 'running', 'succeeded', 'failed', 'cancelled'] as const;
export const stepStatuses = ['pending', 'active', 'complete', 'blocked'] as const;
export const approvalStatuses = ['pending', 'approved', 'rejected'] as const;
export const approvalScopes = ['script', 'rights', 'render', 'publish'] as const;
export const artifactKinds = [
  'source',
  'image',
  'footage',
  'audio',
  'thumbnail',
  'render',
  'subtitle',
  'other',
] as const;
export const assetRightsStatuses = ['unreviewed', 'cleared', 'blocked', 'rejected'] as const;
export const auditTargetKinds = [
  'project',
  'project_version',
  'step',
  'video',
  'render_job',
  'approval',
  'artifact',
] as const;
export const wizardSteps = [
  'New Video',
  'News Sources',
  'Discover Topics',
  'Media Library',
  'Script Studio',
  'Voice Studio',
  'Video Production',
] as const;

export type ProjectStatus = (typeof projectStatuses)[number];
export type VideoStatus = (typeof videoStatuses)[number];
export type RenderJobStatus = (typeof renderJobStatuses)[number];
export type StepStatus = (typeof stepStatuses)[number];
export type ApprovalStatus = (typeof approvalStatuses)[number];
export type ArtifactRightsStatus = (typeof assetRightsStatuses)[number];

const projectMoves: Record<ProjectStatus, readonly ProjectStatus[]> = {
  draft: ['in_progress', 'archived'],
  in_progress: ['in_review', 'archived'],
  in_review: ['in_progress', 'approved', 'archived'],
  approved: ['in_progress', 'archived'],
  archived: [],
};
const renderMoves: Record<RenderJobStatus, readonly RenderJobStatus[]> = {
  queued: ['running', 'cancelled'],
  running: ['succeeded', 'failed', 'cancelled'],
  succeeded: [],
  failed: ['queued', 'cancelled'],
  cancelled: [],
};
// No generic transition into published. Only an explicit, reviewed M12 publish command may do so.
const videoMoves: Record<VideoStatus, readonly VideoStatus[]> = {
  draft: ['rendered'],
  rendered: ['in_review'],
  in_review: ['draft', 'ready'],
  ready: ['in_review'],
  published: [],
};

export class InvalidStatusTransition extends Error {
  constructor(
    readonly entity: 'project' | 'render_job' | 'video',
    readonly from: string,
    readonly to: string,
  ) {
    super('Invalid ' + entity + ' status transition: ' + from + ' -> ' + to);
    this.name = 'InvalidStatusTransition';
  }
}
export function canTransitionProject(from: ProjectStatus, to: ProjectStatus): boolean {
  return projectMoves[from].includes(to);
}
export function assertProjectTransition(from: ProjectStatus, to: ProjectStatus): void {
  if (!canTransitionProject(from, to)) throw new InvalidStatusTransition('project', from, to);
}
export function canTransitionRenderJob(from: RenderJobStatus, to: RenderJobStatus): boolean {
  return renderMoves[from].includes(to);
}
export function assertRenderJobTransition(from: RenderJobStatus, to: RenderJobStatus): void {
  if (!canTransitionRenderJob(from, to)) throw new InvalidStatusTransition('render_job', from, to);
}
export function canTransitionVideo(from: VideoStatus, to: VideoStatus): boolean {
  return videoMoves[from].includes(to);
}
export function assertVideoTransition(from: VideoStatus, to: VideoStatus): void {
  if (!canTransitionVideo(from, to)) throw new InvalidStatusTransition('video', from, to);
}
