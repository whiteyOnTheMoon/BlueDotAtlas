import type { NextRequest } from 'next/server';
import { sameOrigin } from './admin-auth';
import {
  ApiValidationError,
  changeWizardStep,
  openDatabase,
  parseApiUuid,
  parseApiWizardChange,
  parseApiWizardStep,
  ProjectConflict,
  ProjectNotFound,
  readWizard,
} from '@bluedotatlas/db/api';
import {
  adminGate,
  boundedBody,
  databaseAction,
  methodDenied,
  problem,
  result,
} from './api-v1';

function paramsInvalid(request: NextRequest) {
  return request.nextUrl.searchParams.size > 0;
}

async function wizardId(params: Promise<{ id: string }>) {
  try {
    return parseApiUuid((await params).id);
  } catch {
    return null;
  }
}

export async function getWizardRoute(
  request: NextRequest,
  params: Promise<{ id: string }>,
) {
  const denied = await adminGate();
  if (denied) return denied;
  if (paramsInvalid(request)) return problem(400, 'invalid_input', 'Query parameters are not allowed', 'query');
  const id = await wizardId(params);
  if (!id) return problem(400, 'invalid_input', 'Invalid project identifier', 'id');
  return databaseAction(async (connection) => {
    try {
      return result(await readWizard(connection, id));
    } catch (error) {
      if (error instanceof ProjectNotFound) return problem(404, 'not_found', 'Resource not found');
      if (error instanceof ProjectConflict) return problem(409, 'project_conflict', 'Project state cannot be read');
      throw error;
    }
  });
}

export async function patchWizardStepRoute(
  request: NextRequest,
  params: Promise<{ id: string; step: string }>,
) {
  const denied = await adminGate();
  if (denied) return denied;
  if (!sameOrigin(request)) return problem(403, 'forbidden_origin', 'Same-origin request required');
  if (paramsInvalid(request)) return problem(400, 'invalid_input', 'Mutation does not accept query parameters', 'query');

  let id: string;
  let step: number;
  try {
    const raw = await params;
    id = parseApiUuid(raw.id);
    step = parseApiWizardStep(raw.step);
  } catch (error) {
    const field = error instanceof ApiValidationError ? error.field : 'id';
    return problem(400, 'invalid_input', 'Invalid project or step identifier', field);
  }
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

  let json: unknown;
  try {
    json = JSON.parse(body);
  } catch {
    return problem(400, 'invalid_json', 'Invalid JSON body');
  }
  let change: ReturnType<typeof parseApiWizardChange>;
  try {
    change = parseApiWizardChange(json);
  } catch (error) {
    const field = error instanceof ApiValidationError ? error.field : 'body';
    return problem(400, 'invalid_input', 'Invalid wizard update', field);
  }
  return databaseAction(async (connection) => {
    try {
      return result(await changeWizardStep(connection, id, step, change));
    } catch (error) {
      if (error instanceof ProjectNotFound) return problem(404, 'not_found', 'Resource not found');
      if (error instanceof ProjectConflict) {
        return problem(409, 'edit_conflict', 'The step changed in another tab or is not editable');
      }
      throw error;
    }
  });
}

export function rejectWizardReadOnly(request: NextRequest) {
  return methodDenied(request, 'GET, HEAD');
}
export function rejectWizardStepOtherMethod(request: NextRequest) {
  return methodDenied(request, 'PATCH');
}
