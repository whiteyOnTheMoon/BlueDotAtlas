import {
  artifactKinds,
  projectStatuses,
  renderJobStatuses,
  videoStatuses,
  type ProjectStatus,
  type RenderJobStatus,
  type VideoStatus,
} from './status.js';

export type ApiCollection = 'projects' | 'videos' | 'jobs' | 'media';
export type ApiListQuery = {
  limit: number;
  offset: number;
  status?: ProjectStatus | VideoStatus | RenderJobStatus;
  kind?: (typeof artifactKinds)[number];
  projectId?: string;
  projectVersionId?: string;
};

export class ApiValidationError extends Error {
  constructor(readonly field: string) {
    super('Invalid request input');
    this.name = 'ApiValidationError';
  }
}

const uuidPattern = /^[\da-f]{8}-[\da-f]{4}-[1-8][\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i;

export function parseApiUuid(value: string): string {
  if (!uuidPattern.test(value)) throw new ApiValidationError('id');
  return value.toLowerCase();
}

function boundedInteger(value: string, field: string, minimum: number, maximum: number) {
  if (!/^(0|[1-9]\d*)$/.test(value)) throw new ApiValidationError(field);
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < minimum || number > maximum) {
    throw new ApiValidationError(field);
  }
  return number;
}

/** No URL/Next.js dependency: caller supplies query tuples, preserving duplicate keys. */
export function parseApiListQuery(
  collection: ApiCollection,
  entries: ReadonlyArray<readonly [string, string]>,
): ApiListQuery {
  const query: ApiListQuery = { limit: 20, offset: 0 };
  const allowed = new Set(['limit', 'offset']);
  if (collection !== 'media') allowed.add('status');
  if (collection === 'media') allowed.add('kind');
  if (collection === 'videos') allowed.add('projectId');
  if (collection === 'jobs' || collection === 'media') allowed.add('projectVersionId');

  const seen = new Set<string>();
  for (const [field, value] of entries) {
    if (!allowed.has(field) || seen.has(field)) throw new ApiValidationError('query');
    seen.add(field);
    switch (field) {
      case 'limit':
        query.limit = boundedInteger(value, 'limit', 1, 50);
        break;
      case 'offset':
        query.offset = boundedInteger(value, 'offset', 0, 10000);
        break;
      case 'status': {
        const options =
          collection === 'projects'
            ? projectStatuses
            : collection === 'videos'
              ? videoStatuses
              : renderJobStatuses;
        if (!(options as readonly string[]).includes(value)) throw new ApiValidationError('status');
        query.status = value as ProjectStatus | VideoStatus | RenderJobStatus;
        break;
      }
      case 'kind':
        if (!(artifactKinds as readonly string[]).includes(value)) {
          throw new ApiValidationError('kind');
        }
        query.kind = value as (typeof artifactKinds)[number];
        break;
      case 'projectId':
        try {
          query.projectId = parseApiUuid(value);
        } catch {
          throw new ApiValidationError('projectId');
        }
        break;
      case 'projectVersionId':
        try {
          query.projectVersionId = parseApiUuid(value);
        } catch {
          throw new ApiValidationError('projectVersionId');
        }
        break;
    }
  }
  return query;
}

export function parseApiCreateProject(value: unknown): { title: string } {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiValidationError('body');
  }
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== 1 || !Object.hasOwn(record, 'title')) {
    throw new ApiValidationError('body');
  }
  if (typeof record.title !== 'string') throw new ApiValidationError('title');
  const title = record.title.trim();
  if (!title || title.length > 160 || /[\u0000-\u001f\u007f]/.test(title)) {
    throw new ApiValidationError('title');
  }
  return { title };
}


export type ApiProjectPatch = { title: string } | { action: 'archive' };

/** PATCH must express exactly one vetted change; never accept status or raw snapshots. */
export function parseApiProjectPatch(value: unknown): ApiProjectPatch {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiValidationError('body');
  }
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== 1) throw new ApiValidationError('body');
  if (Object.hasOwn(record, 'title')) return parseApiCreateProject(value);
  if (record.action === 'archive') return { action: 'archive' };
  throw new ApiValidationError('body');
}
