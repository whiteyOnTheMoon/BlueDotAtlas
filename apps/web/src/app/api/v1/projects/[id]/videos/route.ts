import type { NextRequest } from 'next/server';
import { getProjectVideos, readOnlyVideo047 } from '../../../../../../lib/video-047';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = (request: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  getProjectVideos(request, params);
export const POST = readOnlyVideo047;
export const PUT = readOnlyVideo047;
export const PATCH = readOnlyVideo047;
export const DELETE = readOnlyVideo047;
export const OPTIONS = readOnlyVideo047;
