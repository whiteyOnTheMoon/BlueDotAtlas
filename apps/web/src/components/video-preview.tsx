'use client';

import { useEffect, useState } from 'react';

type PreviewVideo = {
  id: string;
  title: string;
  kind: string;
  profile: string;
  status: string;
  published: boolean;
  rightsStatus: string;
  durationMs: number | null;
  sizeBytes: number | null;
  sha256: string;
  renderedAt: string;
  available: boolean;
  mediaUrl: string;
  downloadUrl: string;
};

const KIND_LABEL: Record<string, string> = {
  original_synthetic_046: 'Synthetic 8s QA',
  private_pilot_film_046: 'Private 60s pilot film',
};

function formatBytes(bytes: number | null) {
  if (bytes === null) return 'unavailable';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB (' + bytes.toLocaleString('en-US') + ' bytes)';
}

function formatDuration(ms: number | null) {
  return ms === null ? 'unknown' : (ms / 1000).toFixed(3) + ' s';
}

export function VideoPreview({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<PreviewVideo[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/v1/projects/' + encodeURIComponent(projectId) + '/videos', {
      credentials: 'same-origin',
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('unavailable');
        const data = (await response.json()) as { items: PreviewVideo[] };
        setItems(data.items);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError('Rendered videos are temporarily unavailable.');
      });
    return () => controller.abort();
  }, [projectId]);

  if (error) {
    return (
      <p className="auth-error" role="alert">
        {error}
      </p>
    );
  }
  if (items === null) return <p className="muted">Loading rendered videos…</p>;
  if (items.length === 0) {
    return <p className="muted">No rendered video yet. Queue a render on the project page.</p>;
  }
  return (
    <div>
      {items.map((video) => (
        <section key={video.id} className="project-wizard-note" aria-label={video.title}>
          <h2>{KIND_LABEL[video.kind] ?? video.kind}</h2>
          {video.available ? (
            <video
              controls
              preload="metadata"
              playsInline
              src={video.mediaUrl}
              style={{ width: '100%', maxWidth: 960, background: '#000', borderRadius: 8 }}
            />
          ) : (
            <p className="auth-error">The stored file is currently unavailable.</p>
          )}
          <p>
            {video.available ? (
              <a className="button button-secondary" href={video.downloadUrl} download>
                Download original MP4
              </a>
            ) : null}
          </p>
          <dl className="video-metadata">
            <dt>Status</dt>
            <dd>{video.status} · unpublished</dd>
            <dt>Rights</dt>
            <dd>{video.rightsStatus} (internal review only)</dd>
            <dt>Duration</dt>
            <dd>{formatDuration(video.durationMs)}</dd>
            <dt>File size</dt>
            <dd>{formatBytes(video.sizeBytes)}</dd>
            <dt>Render profile</dt>
            <dd>{video.profile}</dd>
            <dt>SHA-256</dt>
            <dd>
              <code>{video.sha256}</code>
            </dd>
            <dt>Rendered</dt>
            <dd>{new Date(video.renderedAt).toLocaleString('en-GB')}</dd>
          </dl>
        </section>
      ))}
    </div>
  );
}
