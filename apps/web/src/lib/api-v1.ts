import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import {
  ApiValidationError,
  createProject,
  getMediaArtifact,
  getProject,
  getRenderJob,
  getVideo,
  hasAdminSession,
  listMediaArtifacts,
  listProjects,
  listRenderJobs,
  listVideos,
  openDatabase,
  parseApiCreateProject,
  parseApiListQuery,
  parseApiUuid,
  type ApiCollection,
} from '@bluedotatlas/db';
import { adminCookieName, sameOrigin } from './admin-auth';

const headers = {
  'Cache-Control': 'private, no-store',
  Vary: 'Cookie',
  'X-Content-Type-Options': 'nosniff',
};
const MAX_BODY_BYTES = 8192;

function result(data: unknown, status = 200, extraHeaders: Record<string, string> = {}) {
  return NextResponse.json(data, { status, headers: { ...headers, ...extraHeaders } });
}

function problem(
  status: number,
  code: string,
  message: string,
  field?: string,
  extraHeaders: Record<string, string> = {},
) {
  return result(
    { error: { code, message, ...(field ? { details: { field } } : {}) } },
    status,
    extraHeaders,
  );
}

async function adminGate() {
  const token = (await cookies()).get(adminCookieName())?.value;
  if (!token) return problem(401, 'unauthorized', 'Administrator session required');
  try {
    if (await hasAdminSession(token)) return null;
    return problem(401, 'unauthorized', 'Administrator session required');
  } catch {
    return problem(503, 'service_unavailable', 'Authentication temporarily unavailable');
  }
}

async function databaseAction(
  action: (connection: ReturnType<typeof openDatabase>) => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    const connection = openDatabase();
    try {
      return await action(connection);
    } finally {
      await connection.pool.end();
    }
  } catch {
    return problem(503, 'service_unavailable', 'Data service temporarily unavailable');
  }
}

export async function readCollection(request: NextRequest, collection: ApiCollection) {
  const denied = await adminGate();
  if (denied) return denied;

  let query: ReturnType<typeof parseApiListQuery>;
  try {
    query = parseApiListQuery(collection, Array.from(request.nextUrl.searchParams.entries()));
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return problem(400, 'invalid_input', 'Invalid query parameter', error.field);
    }
    return problem(400, 'invalid_input', 'Invalid query parameter');
  }

  return databaseAction(async (connection) => {
    switch (collection) {
      case 'projects':
        return result({
          items: await listProjects(connection, query),
          limit: query.limit,
          offset: query.offset,
        });
      case 'videos':
        return result({
          items: await listVideos(connection, query),
          limit: query.limit,
          offset: query.offset,
        });
      case 'jobs':
        return result({
          items: await listRenderJobs(connection, query),
          limit: query.limit,
          offset: query.offset,
        });
      case 'media':
        return result({
          items: await listMediaArtifacts(connection, query),
          limit: query.limit,
          offset: query.offset,
        });
    }
  });
}

export async function readDetail(
  request: NextRequest,
  params: Promise<{ id: string }>,
  collection: ApiCollection,
) {
  const denied = await adminGate();
  if (denied) return denied;

  if (request.nextUrl.searchParams.size) {
    return problem(400, 'invalid_input', 'Detail route does not accept query parameters', 'query');
  }
  let id: string;
  try {
    id = parseApiUuid((await params).id);
  } catch {
    return problem(400, 'invalid_input', 'Invalid resource identifier', 'id');
  }

  return databaseAction(async (connection) => {
    switch (collection) {
      case 'projects': {
        const row = await getProject(connection, id);
        if (!row) return problem(404, 'not_found', 'Resource not found');
        const { id: projectId, title, status, currentVersion, createdAt, updatedAt } = row;
        return result({ id: projectId, title, status, currentVersion, createdAt, updatedAt });
      }
      case 'videos': {
        const row = await getVideo(connection, id);
        return row ? result(row) : problem(404, 'not_found', 'Resource not found');
      }
      case 'jobs': {
        const row = await getRenderJob(connection, id);
        return row ? result(row) : problem(404, 'not_found', 'Resource not found');
      }
      case 'media': {
        const row = await getMediaArtifact(connection, id);
        return row ? result(row) : problem(404, 'not_found', 'Resource not found');
      }
    }
  });
}

async function boundedBody(request: NextRequest): Promise<string | null> {
  const length = request.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > MAX_BODY_BYTES)) {
    return null;
  }
  if (!request.body) return '';
  const reader = request.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let size = 0;
  let body = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
    body += decoder.decode();
    return body;
  } finally {
    reader.releaseLock();
  }
}

export async function createProjectRoute(request: NextRequest) {
  const denied = await adminGate();
  if (denied) return denied;

  if (!sameOrigin(request)) return problem(403, 'forbidden_origin', 'Same-origin request required');
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
    return problem(415, 'unsupported_media_type', 'Content-Type application/json required');
  }

  let body: string | null;
  try {
    body = await boundedBody(request);
  } catch {
    return problem(400, 'invalid_json', 'Invalid JSON body');
  }
  if (body === null) return problem(413, 'body_too_large', 'Request body exceeds 8192 bytes');

  let input: { title: string };
  try {
    input = parseApiCreateProject(JSON.parse(body));
  } catch (error) {
    if (error instanceof ApiValidationError) {
      return problem(400, 'invalid_input', 'Invalid project input', error.field);
    }
    return problem(400, 'invalid_json', 'Invalid JSON body');
  }

  return databaseAction(async (connection) => {
    const { project } = await createProject(connection, input);
    return result(
      {
        id: project.id,
        title: project.title,
        status: project.status,
        currentVersion: project.currentVersion,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      },
      201,
      { Location: '/api/v1/projects/' + project.id },
    );
  });
}

async function methodDenied(request: NextRequest, allow: string) {
  const denied = await adminGate();
  if (denied) return denied;
  return problem(405, 'method_not_allowed', 'Method not allowed', undefined, { Allow: allow });
}

/** Route exports opt out of framework-generated unauthenticated OPTIONS/405 responses. */
export function rejectReadOnly(request: NextRequest) {
  return methodDenied(request, 'GET, HEAD');
}

export function rejectProjectCollectionMethod(request: NextRequest) {
  return methodDenied(request, 'GET, HEAD, POST');
}
