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

export function AdminShell() {
  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <BrandMark />
          <span className="studio-tag">Admin studio · UI preview</span>
        </div>
      </header>
      <main className="container admin-view">
        <p className="eyebrow">Production workspace</p>
        <h1>Studio overview</h1>
        <p className="muted">Interface skeleton only — no projects, credentials or live jobs.</p>
        <div className="admin-panel">
          <aside className="admin-side" aria-label="Studio navigation">
            <p className="side-caption">Workspace</p>
            <p className="side-link active">Dashboard</p>
            <p className="side-link">Projects</p>
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
              <h3>No active projects</h3>
              <p>Project creation and persistence follow in Roadmap tasks 023–024 and 031.</p>
              <button className="button button-secondary" type="button" disabled>
                Create New Video · coming soon
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
