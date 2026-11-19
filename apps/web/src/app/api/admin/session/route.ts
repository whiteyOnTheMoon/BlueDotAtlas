import { NextResponse } from 'next/server';
import { signedInAdmin } from '../../../../lib/admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Sentinel for API authorization. Future CRUD routes must validate sessions too. */
export async function GET() {
  const valid = await signedInAdmin();
  return NextResponse.json(
    valid ? { authenticated: true } : { error: 'unauthorized' },
    { status: valid ? 200 : 401, headers: { 'Cache-Control': 'no-store', Vary: 'Cookie' } },
  );
}
