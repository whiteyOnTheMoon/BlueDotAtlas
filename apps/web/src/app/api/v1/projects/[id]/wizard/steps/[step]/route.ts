import type { NextRequest } from 'next/server';
import {
  patchWizardStepRoute,
  rejectWizardStepOtherMethod,
} from '../../../../../../../../lib/wizard-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const PATCH = (
  request: NextRequest,
  { params }: { params: Promise<{ id: string; step: string }> },
) => patchWizardStepRoute(request, params);
export const GET = rejectWizardStepOtherMethod;
export const POST = rejectWizardStepOtherMethod;
export const PUT = rejectWizardStepOtherMethod;
export const DELETE = rejectWizardStepOtherMethod;
export const OPTIONS = rejectWizardStepOtherMethod;
