import Link from 'next/link';
import { redirect } from 'next/navigation';
import { BrandMark } from '../../../components/brand-mark';
import { signedInAdmin } from '../../../lib/admin-auth';

export const metadata = { title: 'Admin sign-in — BlueDotAtlas' };
export const dynamic = 'force-dynamic';

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await signedInAdmin()) redirect('/admin');
  const params = await searchParams;
  const error = params.error === 'invalid';

  return (
    <main className="login-screen">
      <div className="login-panel">
        <BrandMark />
        <p className="eyebrow">Private studio</p>
        <h1>Admin sign-in</h1>
        <p className="muted">
          Sign in with your configured BlueDotAtlas administrator credentials.
        </p>
        {error ? (
          <p className="auth-error" role="alert">
            Sign-in failed. Check your details or try again later.
          </p>
        ) : null}
        <form method="post" action="/api/auth/login">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" autoComplete="username" required maxLength={254} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required minLength={12} maxLength={256} />
          </div>
          <button className="button button-primary full-width" type="submit">
            Sign in
          </button>
        </form>
        <p className="secondary-note">
          <Link href="/">Back to the public library</Link>
        </p>
      </div>
    </main>
  );
}
