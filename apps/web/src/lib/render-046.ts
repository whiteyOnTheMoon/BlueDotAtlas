import type { NextRequest } from 'next/server';
import {
  assertRender046ExecutionEnvironment,
  enqueueRender046,
  RENDER_046_MANIFEST,
} from '@bluedotatlas/db/queue-046';
import { parseApiUuid } from '@bluedotatlas/db/api';
import { sameOrigin } from './admin-auth';
import { adminGate, boundedBody, databaseAction, methodDenied, problem, result } from './api-v1';

function syntheticTestGate() {
  try {
    assertRender046ExecutionEnvironment();
    return true;
  } catch {
    return false;
  }
}

export async function postSynthetic046(request: NextRequest) {
  const denied = await adminGate();
  if (denied) return denied;
  if (!sameOrigin(request)) return problem(403, 'forbidden_origin', 'Same-origin request required');
  if (!syntheticTestGate()) {
    return problem(
      403,
      'render_not_authorized',
      'Real and synthetic render endpoints are disabled',
    );
  }
  if (request.nextUrl.searchParams.size !== 0) {
    return problem(400, 'invalid_input', 'Render request does not accept query parameters');
  }
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
    return problem(415, 'unsupported_media_type', 'Content-Type application/json required');
  }
  let json: unknown;
  try {
    const body = await boundedBody(request);
    if (body === null) return problem(413, 'body_too_large', 'Render request body too large');
    json = JSON.parse(body);
  } catch {
    return problem(400, 'invalid_json', 'Malformed JSON');
  }
  if (
    typeof json !== 'object' ||
    json === null ||
    Array.isArray(json) ||
    Object.keys(json).length !== 1 ||
    !('projectId' in json)
  ) {
    return problem(400, 'invalid_input', 'Exactly one projectId is required');
  }
  let projectId: string;
  try {
    const inputProjectId = (json as { projectId: unknown }).projectId;
    if (typeof inputProjectId !== 'string') {
      return problem(400, 'invalid_input', 'Invalid project identifier');
    }
    projectId = parseApiUuid(inputProjectId);
  } catch {
    return problem(400, 'invalid_input', 'Invalid project identifier');
  }

  return databaseAction(async (connection) => {
    const found = await connection.pool.query<{ id: string }>(
      `SELECT v.id FROM video_projects p
       JOIN project_versions v ON v.project_id = p.id AND v.revision = p.current_version
       WHERE p.id = $1::uuid AND p.deleted_at IS NULL
         AND v.deleted_at IS NULL AND p.status <> 'archived'
       LIMIT 1`,
      [projectId],
    );
    if (!found.rows[0]) return problem(404, 'not_found', 'Project revision not found');
    const { jobId, videoId } = await enqueueRender046(connection, found.rows[0].id);
    return result({ jobId, videoId, syntheticOnly: true }, 202, {
      Location: '/api/v1/jobs/' + jobId,
    });
  });
}

export async function getProjectRender046(request: NextRequest, params: Promise<{ id: string }>) {
  const denied = await adminGate();
  if (denied) return denied;
  if (!syntheticTestGate()) {
    return problem(403, 'render_not_authorized', 'Synthetic job review is disabled');
  }
  if (request.nextUrl.searchParams.size) {
    return problem(400, 'invalid_input', 'Unexpected query parameters');
  }
  let projectId: string;
  try {
    projectId = parseApiUuid((await params).id);
  } catch {
    return problem(400, 'invalid_input', 'Invalid project identifier');
  }
  return databaseAction(async (connection) => {
    const rows = await connection.pool.query<{
      id: string;
      status: string;
      progressPct: number;
      attempt: number;
      maxAttempts: number;
      errorCode: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>(
      `SELECT r.id, r.status, r.progress_pct AS "progressPct",
              r.attempt, r.max_attempts AS "maxAttempts", r.error_code AS "errorCode",
              r.created_at AS "createdAt", r.updated_at AS "updatedAt"
       FROM render_jobs r
       JOIN project_versions v ON v.id = r.project_version_id
       JOIN video_projects p ON p.id = v.project_id
       WHERE p.id = $1::uuid AND r.manifest = $2::jsonb
         AND r.deleted_at IS NULL AND v.deleted_at IS NULL AND p.deleted_at IS NULL
       ORDER BY r.created_at DESC, r.id DESC LIMIT 5`,
      [projectId, JSON.stringify(RENDER_046_MANIFEST)],
    );
    return result({ items: rows.rows });
  });
}

export function readOnlyRender046(request: NextRequest) {
  return methodDenied(request, 'POST');
}

export function statusOnlyRender046(request: NextRequest) {
  return methodDenied(request, 'GET, HEAD');
}
