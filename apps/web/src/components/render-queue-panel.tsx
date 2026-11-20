'use client';

import { useEffect, useState } from 'react';

type SyntheticJob = {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  progressPct: number;
  attempt: number;
  maxAttempts: number;
  errorCode: string | null;
  updatedAt: string;
};

export function RenderQueuePanel({ projectId }: { projectId: string }) {
  const [jobs, setJobs] = useState<SyntheticJob[]>([]);
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
        if (!response.ok) throw new Error('Unable to read the synthetic render queue');
        const data = (await response.json()) as { items: SyntheticJob[] };
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

  async function startTest() {
    if (busy) return;
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await fetch('/api/v1/render-046', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ projectId }),
      });
      if (!response.ok) throw new Error('Test-only render request was rejected');
      setNotice('Synthetic 8-second render queued; no real pilot footage will be used.');
      setRevision((n) => n + 1);
    } catch {
      setError('Unable to queue synthetic test. No film or publication was started.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="project-wizard-note" aria-label="Isolated render queue proof">
      <h3>1080p synthetic render QA</h3>
      <p className="muted">
        CI test only: original generated 8-second video and tone. Not the pilot film;
        publication and VPS rendering remain disabled.
      </p>
      <button className="button button-secondary" type="button" onClick={startTest} disabled={busy}>
        {busy ? 'Queueing…' : 'Queue synthetic 1080p test'}
      </button>
      {notice ? <p role="status">{notice}</p> : null}
      {error ? <p className="auth-error" role="alert">{error}</p> : null}
      <h4>Persistent render jobs</h4>
      {jobs.length === 0 ? <p className="muted">No synthetic render jobs yet.</p> : null}
      <ul>
        {jobs.map((job) => (
          <li key={job.id}>
            <span>{job.status}</span>{' '}
            <progress value={job.progressPct} max={100} aria-label="Render progress" />{' '}
            {job.progressPct}% · attempt {job.attempt}/{job.maxAttempts}
            {job.errorCode ? <span> · {job.errorCode}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
