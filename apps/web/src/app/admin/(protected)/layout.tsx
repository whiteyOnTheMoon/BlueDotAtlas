import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

// Server-side denial until task 025 adds validated sessions.
// Proxy redirects early; protected components must not rely on Proxy alone.
export default function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  void children;
  redirect('/admin/login');
}
