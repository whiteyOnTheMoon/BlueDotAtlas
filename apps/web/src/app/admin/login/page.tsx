import Link from 'next/link';
import { BrandMark } from '../../../components/brand-mark';

export const metadata = { title: 'Admin sign-in — BlueDotAtlas' };

export default function Login() {
  return (
    <main className="login-screen">
      <div className="login-panel">
        <BrandMark />
        <p className="eyebrow">Private studio</p>
        <h1>Admin sign-in</h1>
        <p className="muted">
          Authentication is not active yet. Sign-in will be implemented in Roadmap task 025.
          No credentials are accepted or stored here.
        </p>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="username" disabled placeholder="Not available yet" />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" disabled placeholder="Not available yet" />
        </div>
        <button className="button button-primary full-width" type="button" disabled>Sign-in unavailable</button>
        <p className="secondary-note"><Link href="/">Back to the public library</Link></p>
      </div>
    </main>
  );
}
