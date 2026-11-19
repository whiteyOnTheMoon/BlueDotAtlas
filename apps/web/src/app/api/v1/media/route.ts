import type { NextRequest } from 'next/server';
import { readCollection, rejectReadOnly } from '../../../../lib/api-v1';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = (request: NextRequest) => readCollection(request, 'media');
export const POST = rejectReadOnly;
export const PUT = rejectReadOnly;
export const PATCH = rejectReadOnly;
export const DELETE = rejectReadOnly;
export const OPTIONS = rejectReadOnly;
