import type { NextRequest } from 'next/server';
import {
  patchProjectRoute,
  readDetail,
  rejectProjectDetailMethod,
} from '../../../../../lib/api-v1';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = (request: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  readDetail(request, params, 'projects');
export const PATCH = (request: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  patchProjectRoute(request, params);
export const POST = rejectProjectDetailMethod;
export const PUT = rejectProjectDetailMethod;
export const DELETE = rejectProjectDetailMethod;
export const OPTIONS = rejectProjectDetailMethod;
