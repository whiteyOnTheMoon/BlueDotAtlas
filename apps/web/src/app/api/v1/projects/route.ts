import type { NextRequest } from 'next/server';
import {
  createProjectRoute,
  readCollection,
  rejectProjectCollectionMethod,
} from '../../../../lib/api-v1';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = (request: NextRequest) => readCollection(request, 'projects');
export const POST = createProjectRoute;
export const PUT = rejectProjectCollectionMethod;
export const PATCH = rejectProjectCollectionMethod;
export const DELETE = rejectProjectCollectionMethod;
export const OPTIONS = rejectProjectCollectionMethod;
