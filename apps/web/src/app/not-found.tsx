import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="container status-screen">
      <h1>Page not found</h1>
      <p>That route is not available.</p>
      <Link href="/">Return to the library</Link>
    </main>
  );
}
