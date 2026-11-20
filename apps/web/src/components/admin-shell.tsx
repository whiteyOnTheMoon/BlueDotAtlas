import { BrandMark } from './brand-mark';

const steps = [
  'New Video',
  'News Sources',
  'Discover Topics',
  'Media Library',
  'Script Studio',
  'Voice Studio',
  'Video Production',
] as const;

export function AdminShell({ preview = false }: { preview?: boolean }) {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <BrandMark />
          <span className="studio-tag">
            {preview ? 'Admin studio · UI preview' : 'Admin studio'}
          </span>
        </div>
      </header>
      <main className="container admin-view">
        <p className="eyebrow">Production workspace</p>
        <h1>Studio overview</h1>
        <p className="muted">
          The project workspace and production actions will be added in the next milestones.
        </p>
        {!preview ? (
          <form method="post" action="/api/auth/logout" className="signout-form">
            <button className="button button-secondary" type="submit">
              Sign out
            </button>
          </form>
        ) : null}
        <div className="admin-panel">
          <aside className="admin-side" aria-label="Studio navigation">
            <p className="side-caption">Workspace</p>
            <p className="side-link active">Dashboard</p>
            {preview ? (
              <p className="side-link">Projects</p>
            ) : (
              <a className="side-link" href="/admin/projects">Projects</a>
            )}
            <p className="side-link">Sources</p>
          </aside>
          <div className="admin-main">
            <h2>New Video workflow</h2>
            <p className="muted">Seven future steps. They do not save or run work yet.</p>
            <ol className="stepper">
              {steps.map((step, index) => (
                <li key={step}>
                  <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <div className="panel-card">
              <h3>Project management is coming soon</h3>
              <p>Database project models exist. Open Projects to create, rename, archive and review your drafts.</p>
              {preview ? (
                <button className="button button-secondary" type="button" disabled>
                  Create New Video · coming soon
                </button>
              ) : (
                <a className="button button-primary" href="/admin/projects">
                  Create New Video
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
