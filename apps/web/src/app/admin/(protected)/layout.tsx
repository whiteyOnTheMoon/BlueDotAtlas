import { redirect } from 'next/navigation';
import { signedInAdmin } from '../../../lib/admin-auth';
import type { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

/** A forged cookie bypassing Proxy still cannot access protected components. */
export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  if (!(await signedInAdmin())) redirect('/admin/login');
  return <>{children}</>;
}
