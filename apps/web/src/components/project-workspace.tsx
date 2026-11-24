'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { BrandMark } from './brand-mark';
import { RenderQueuePanel } from './render-queue-panel';

type Project = {
  id: string;
  title: string;
  status: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
};
type ProjectListResponse = { items: Project[]; limit: number; offset: number };

const statuses = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'in_review', label: 'In review' },
  { value: 'approved', label: 'Approved' },
  { value: 'archived', label: 'Archived' },
] as const;
const PAGE_SIZE = 20;

function statusLabel(value: string) {
  return statuses.find((entry) => entry.value === value)?.label ?? 'Unknown';
}

function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString('en-GB');
}

async function requestJson(path: string, options?: RequestInit) {
  const response = await fetch(path, {
    cache: 'no-store',
    credentials: 'same-origin',
    ...options,
  });
  if (!response.ok) {
    if (response.status === 401)
      throw new Error('Your administrator session is unavailable. Sign in again.');
    if (response.status === 409)
      throw new Error('This project cannot be changed in its current state.');
    if (response.status === 404) throw new Error('Project not found.');
    if (response.status === 400) throw new Error('Check the title and try again.');
    throw new Error('The project service is temporarily unavailable.');
  }
  return response.json() as Promise<unknown>;
}

export function ProjectWorkspace({
  projectId,
  syntheticRenderEnabled = false,
  pilotFilmEnabled = false,
}: {
  projectId?: string;
  syntheticRenderEnabled?: boolean;
  pilotFilmEnabled?: boolean;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState('');
  const [offset, setOffset] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [items, setItems] = useState<Project[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const endpoint = projectId
      ? '/api/v1/projects/' + encodeURIComponent(projectId)
      : '/api/v1/projects?limit=' +
        PAGE_SIZE +
        '&offset=' +
        offset +
        (filter ? '&status=' + encodeURIComponent(filter) : '');
    setLoading(true);
    setError('');
    requestJson(endpoint, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (projectId) {
          const found = data as Project;
          setProject(found);
          setTitle(found.title);
        } else {
          setItems((data as ProjectListResponse).items);
        }
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setError(reason instanceof Error ? reason.message : 'The project service is unavailable.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [filter, offset, projectId, refresh]);

  async function createVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setNotice('');
    setError('');
    try {
      const created = (await requestJson('/api/v1/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle }),
      })) as Project;
      setNewTitle('');
      router.push('/admin/projects/' + created.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create the project.');
    } finally {
      setBusy(false);
    }
  }

  async function rename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!project || busy) return;
    setBusy(true);
    setNotice('');
    setError('');
    try {
      const updated = (await requestJson('/api/v1/projects/' + project.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })) as Project;
      setProject(updated);
      setTitle(updated.title);
      setNotice('Project renamed.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to rename this project.');
    } finally {
      setBusy(false);
    }
  }

  async function archive() {
    if (!project || busy || project.status === 'archived') return;
    if (!window.confirm('Archive this project? It cannot be reopened in this version.')) return;
    setBusy(true);
    setNotice('');
    setError('');
    try {
      const updated = (await requestJson('/api/v1/projects/' + project.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'archive' }),
      })) as Project;
      setProject(updated);
      setNotice('Project archived. No render was started.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to archive this project.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <BrandMark />
          <span className="studio-tag">Admin studio · Project workspace</span>
        </div>
      </header>
      <main className="container admin-view project-workspace">
        <p className="eyebrow">Production workspace</p>
        <h1>{projectId ? 'Project details' : 'Projects'}</h1>
        <p className="muted">
          Manage project drafts. An enabled synthetic QA button can start a test render; real film
          production and publication stay disabled.
        </p>
        <div className="project-navigation">
          <nav aria-label="Studio navigation">
            <Link href="/admin">Dashboard</Link>
            <Link href="/admin/projects" aria-current={!projectId ? 'page' : undefined}>
              Projects
            </Link>
          </nav>
          <form method="post" action="/api/auth/logout">
            <button className="button button-secondary" type="submit">
              Sign out
            </button>
          </form>
        </div>

        {error ? (
          <p className="auth-error" role="alert">
            {error} {error.includes('session') ? <Link href="/admin/login">Sign in</Link> : null}
          </p>
        ) : null}
        {notice ? (
          <p className="project-notice" role="status">
            {notice}
          </p>
        ) : null}

        {projectId ? (
          <section className="panel-card project-detail" aria-label="Project details">
            <Link href="/admin/projects">Back to all projects</Link>
            {loading ? <p role="status">Loading project…</p> : null}
            {!loading && project ? (
              <>
                <div className="project-detail-heading">
                  <h2>{project.title}</h2>
                  <span className="project-status">{statusLabel(project.status)}</span>
                </div>
                <dl className="project-metadata">
                  <div>
                    <dt>Revision</dt>
                    <dd>{project.currentVersion}</dd>
                  </div>
                  <div>
                    <dt>Created</dt>
                    <dd>{dateLabel(project.createdAt)}</dd>
                  </div>
                  <div>
                    <dt>Updated</dt>
                    <dd>{dateLabel(project.updatedAt)}</dd>
                  </div>
                </dl>
                <form onSubmit={rename} className="project-form">
                  <label htmlFor="project-edit-title">Project title</label>
                  <input
                    id="project-edit-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    minLength={1}
                    maxLength={160}
                    required
                    disabled={busy || project.status === 'archived'}
                  />
                  <button
                    type="submit"
                    className="button button-primary"
                    disabled={
                      busy || project.status === 'archived' || title.trim() === project.title
                    }
                  >
                    Save title
                  </button>
                </form>
                {project.status === 'archived' ? (
                  <p className="muted">Archived projects are read-only. History is preserved.</p>
                ) : (
                  <div className="project-archive">
                    <p className="muted">
                      Archiving preserves this project and its history. This action is not
                      reversible here.
                    </p>
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={archive}
                      disabled={busy}
                    >
                      Archive project
                    </button>
                  </div>
                )}
                <div className="project-wizard-note">
                  <Link
                    href={'/admin/projects/' + project.id + '/wizard'}
                    className="button button-primary"
                  >
                    Open seven-step wizard
                  </Link>
                  <p className="muted">
                    Editorial step notes autosave in your private project. No render job is started.
                  </p>
                </div>
                {syntheticRenderEnabled || pilotFilmEnabled ? (
                  <RenderQueuePanel
                    projectId={project.id}
                    syntheticEnabled={syntheticRenderEnabled}
                    pilotFilmEnabled={pilotFilmEnabled}
                  />
                ) : null}
              </>
            ) : null}
          </section>
        ) : (
          <>
            <section className="panel-card project-create" aria-labelledby="create-video-heading">
              <div>
                <p className="eyebrow">Step 01 · New Video</p>
                <h2 id="create-video-heading">Create New Video</h2>
                <p className="muted">
                  Create a project draft; no rendering or provider calls start.
                </p>
              </div>
              <form onSubmit={createVideo} className="project-form">
                <label htmlFor="project-new-title">Project title</label>
                <input
                  id="project-new-title"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  minLength={1}
                  maxLength={160}
                  placeholder="e.g. The Arctic Ocean"
                  required
                  disabled={busy}
                />
                <button
                  className="button button-primary"
                  type="submit"
                  disabled={busy || !newTitle.trim()}
                >
                  {busy ? 'Creating…' : 'Create New Video'}
                </button>
              </form>
            </section>

            <section className="project-results" aria-labelledby="project-list-heading">
              <div className="project-results-heading">
                <h2 id="project-list-heading">Your projects</h2>
                <div className="project-filter">
                  <label htmlFor="project-status-filter">Status</label>
                  <select
                    id="project-status-filter"
                    value={filter}
                    onChange={(event) => {
                      setFilter(event.target.value);
                      setOffset(0);
                    }}
                  >
                    {statuses.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {loading ? <p role="status">Loading projects…</p> : null}
              {!loading && items.length === 0 && !error ? (
                <div className="empty-state">
                  <h3>No projects found</h3>
                  <p>Start a new video draft or choose another status.</p>
                </div>
              ) : null}
              {!loading && items.length > 0 ? (
                <ul className="project-list">
                  {items.map((item) => (
                    <li className="project-list-card" key={item.id}>
                      <div>
                        <h3>
                          <Link href={'/admin/projects/' + item.id}>{item.title}</Link>
                        </h3>
                        <p className="muted">
                          Updated {dateLabel(item.updatedAt)} · Revision {item.currentVersion}
                        </p>
                      </div>
                      <div className="project-list-actions">
                        <span className="project-status">{statusLabel(item.status)}</span>
                        <Link
                          href={'/admin/projects/' + item.id}
                          className="button button-secondary"
                        >
                          Open
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="project-pagination">
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={loading || offset === 0}
                  onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                >
                  Previous
                </button>
                <span>Page {Math.floor(offset / PAGE_SIZE) + 1}</span>
                <button
                  className="button button-secondary"
                  type="button"
                  disabled={loading || items.length < PAGE_SIZE || offset + PAGE_SIZE > 10000}
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                >
                  Next
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => setRefresh((n) => n + 1)}
                >
                  Refresh
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  );
}
