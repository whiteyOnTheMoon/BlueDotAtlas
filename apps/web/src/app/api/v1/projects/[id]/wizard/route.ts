import type { NextRequest } from 'next/server';
import { getWizardRoute, rejectWizardReadOnly } from '../../../../../../lib/wizard-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = (request: NextRequest, { params }: { params: Promise<{ id: string }> }) =>
  getWizardRoute(request, params);
export const POST = rejectWizardReadOnly;
export const PUT = rejectWizardReadOnly;
export const PATCH = rejectWizardReadOnly;
export const DELETE = rejectWizardReadOnly;
export const OPTIONS = rejectWizardReadOnly;
