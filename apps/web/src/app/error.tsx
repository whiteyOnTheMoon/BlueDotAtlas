'use client';

export default function ErrorState({ reset }: { reset: () => void }) {
  return (
    <main className="container status-screen" role="alert">
      <h1>Something went wrong</h1>
      <p>The page could not be loaded.</p>
      <button className="button button-primary" type="button" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
