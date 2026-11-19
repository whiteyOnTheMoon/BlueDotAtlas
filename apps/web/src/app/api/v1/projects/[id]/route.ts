import type { NextRequest } from 'next/server';
import { readDetail, rejectReadOnly } from '../../../../../lib/api-v1';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = (request: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  readDetail(request, params, 'projects');
export const POST = rejectReadOnly;
export const PUT = rejectReadOnly;
export const PATCH = rejectReadOnly;
export const DELETE = rejectReadOnly;
export const OPTIONS = rejectReadOnly;
