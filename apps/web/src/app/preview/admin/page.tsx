import { notFound } from 'next/navigation';
import { AdminShell } from '../../../components/admin-shell';

// Static, data-free component preview, only available with next dev.
export default function AdminPreview() {
  if (process.env.NODE_ENV !== 'development') notFound();
  return <AdminShell preview />;
}
