import type { NextRequest } from 'next/server';
import { getProjectRender046, statusOnlyRender046 } from '../../../../../../lib/render-046';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = (request: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  getProjectRender046(request, params);
export const POST = statusOnlyRender046;
export const PUT = statusOnlyRender046;
export const PATCH = statusOnlyRender046;
export const DELETE = statusOnlyRender046;
export const OPTIONS = statusOnlyRender046;
