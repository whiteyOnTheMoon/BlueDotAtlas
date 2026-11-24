'use client';

import { useEffect, useState } from 'react';

type RenderJob = {
  id: string;
  kind: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  progressPct: number;
  attempt: number;
  maxAttempts: number;
  errorCode: string | null;
  updatedAt: string;
};

const KIND_LABEL: Record<string, string> = {
  original_synthetic_046: 'Synthetic 8s QA',
  private_pilot_film_046: 'Private 60s pilot film',
};

export function RenderQueuePanel({
  projectId,
  syntheticEnabled = true,
  pilotFilmEnabled = false,
}: {
  projectId: string;
  syntheticEnabled?: boolean;
  pilotFilmEnabled?: boolean;
}) {
  const [jobs, setJobs] = useState<RenderJob[]>([]);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch(
          '/api/v1/projects/' + encodeURIComponent(projectId) + '/render-046',
          { credentials: 'same-origin', cache: 'no-store', signal: controller.signal },
        );
        if (!response.ok) throw new Error('Unable to read the render queue');
        const data = (await response.json()) as { items: RenderJob[] };
        if (!controller.signal.aborted) {
          setJobs(data.items);
          setError('');
        }
      } catch {
        if (!controller.signal.aborted) setError('Render queue status temporarily unavailable');
      }
    }
    void refresh();
    const interval = setInterval(() => void refresh(), 3000);
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [projectId, revision]);

  async function queue(path: string, success: string, failure: string) {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ projectId }),
      });
      if (!response.ok) throw new Error('Render request was rejected');
      setNotice(success);
      setRevision((n) => n + 1);
    } catch {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="project-wizard-note" aria-label="Render queue">
      <h3>Render queue</h3>
      <p className="muted">
        Jobs run in a separate worker; this page only queues them and shows the persisted status.
        Output stays private. Publication remains disabled.
      </p>
      {syntheticEnabled ? (
        <p className="muted">
          Synthetic 8-second video and tone QA runs in CI or on an explicitly enabled VPS.
        </p>
      ) : null}
      {pilotFilmEnabled ? (
        <p className="muted">
          The private 60-second pilot film uses only the SHA-verified private sources on this
          server. It is for internal review only and is never published automatically.
        </p>
      ) : null}
      {syntheticEnabled ? (
        <button
          className="button button-secondary"
          type="button"
          onClick={() =>
            void queue(
              '/api/v1/render-046',
              'Synthetic 8-second render queued; no real pilot footage will be used.',
              'Unable to queue synthetic test. No film or publication was started.',
            )
          }
          disabled={busy}
        >
          {busy ? 'Queueing…' : 'Queue synthetic 1080p test'}
        </button>
      ) : null}{' '}
      {pilotFilmEnabled ? (
        <button
          className="button button-primary"
          type="button"
          onClick={() =>
            void queue(
              '/api/v1/render-046/pilot-film',
              'Private 60-second pilot film queued. The worker renders it in the background (about 15–40 minutes); you can leave or reload this page.',
              'Unable to queue the private pilot film. Nothing was rendered or published.',
            )
          }
          disabled={busy}
        >
          {busy ? 'Queueing…' : 'Render private 60s pilot film'}
        </button>
      ) : null}
      {notice ? <p role="status">{notice}</p> : null}
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}
      <h4>Persistent render jobs</h4>
      {jobs.length === 0 ? <p className="muted">No render jobs yet.</p> : null}
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <span>{KIND_LABEL[job.kind] ?? job.kind}</span> · <span>{job.status}</span>{' '}
            <progress value={job.progressPct} max={100} aria-label="Render progress" />{' '}
            {job.progressPct}% · attempt {job.attempt}/{job.maxAttempts}
            {job.errorCode ? <span> · {job.errorCode}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
