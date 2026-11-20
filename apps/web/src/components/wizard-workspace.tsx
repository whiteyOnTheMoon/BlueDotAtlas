'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BrandMark } from './brand-mark';

type Step = {
  number: number;
  label: string;
  status: string;
  notes: string;
  editRevision: number;
  reviewState: 'draft' | 'submitted';
  updatedAt: string;
};
type Wizard = {
  project: {
    id: string;
    title: string;
    status: string;
    currentVersion: number;
  };
  steps: Step[];
};

class WizardError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function fetchWizard(path: string, init?: RequestInit): Promise<unknown> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    cache: 'no-store',
    ...init,
  });
  if (!response.ok) {
    if (response.status === 409) {
      throw new WizardError('This step was changed in another tab or is no longer editable.', 409);
    }
    if (response.status === 401) {
      throw new WizardError('Your admin session expired. Please sign in again.', 401);
    }
    if (response.status === 404) throw new WizardError('Project not found.', 404);
    if (response.status === 400) throw new WizardError('Invalid wizard request.', 400);
    throw new WizardError('The wizard service is temporarily unavailable.', response.status);
  }
  return response.json() as Promise<unknown>;
}

function StepEditor({
  projectId,
  step,
  readonly,
  onSaved,
  onBusy,
  onReload,
}: {
  projectId: string;
  step: Step;
  readonly: boolean;
  onSaved: (next: Step) => void;
  onBusy: (pending: boolean) => void;
  onReload: () => Promise<void>;
}) {
  const [notes, setNotes] = useState(step.notes);
  const [savedNotes, setSavedNotes] = useState(step.notes);
  const [revision, setRevision] = useState(step.editRevision);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<WizardError | null>(null);
  const [conflict, setConflict] = useState(false);
  const [lastSaved, setLastSaved] = useState(step.updatedAt);
  const [reviewState, setReviewState] = useState(step.reviewState);
  const dirty = notes !== savedNotes;

  useEffect(() => {
    onBusy(dirty || saving || error !== null);
  }, [dirty, saving, error, onBusy]);
  const path = '/api/v1/projects/' + projectId + '/wizard/steps/' + step.number;

  useEffect(() => {
    if (!dirty && !saving) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty, saving]);

  const patch = useCallback(
    async (payload: Record<string, string | number>) => {
      const updated = (await fetchWizard(path, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })) as Step;
      setRevision(updated.editRevision);
      setLastSaved(updated.updatedAt);
      setReviewState(updated.reviewState);
      setSavedNotes(updated.notes);
      onSaved(updated);
    },
    [path, onSaved],
  );

  useEffect(() => {
    if (readonly || !dirty || saving || error || conflict) return;
    const handle = window.setTimeout(() => {
      const capturedNotes = notes;
      const capturedRevision = revision;
      setSaving(true);
      void patch({ expectedRevision: capturedRevision, notes: capturedNotes })
        .catch((reason: unknown) => {
          const failure = reason instanceof WizardError ? reason : new WizardError('Autosave failed.', 503);
          setError(failure);
          if (failure.status === 409) setConflict(true);
        })
        .finally(() => setSaving(false));
    }, 800);
    return () => window.clearTimeout(handle);
  }, [readonly, dirty, saving, error, conflict, notes, revision, patch]);

  async function submitForReview() {
    if (readonly || dirty || saving || error || conflict || !notes.trim() || reviewState === 'submitted') return;
    setSaving(true);
    try {
      await patch({ expectedRevision: revision, action: 'submit' });
    } catch (reason) {
      const failure = reason instanceof WizardError ? reason : new WizardError('Unable to submit for review.', 503);
      setError(failure);
      if (failure.status === 409) setConflict(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel-card wizard-editor" aria-labelledby="wizard-step-heading">
      <p className="eyebrow">Step {String(step.number).padStart(2, '0')}</p>
      <h2 id="wizard-step-heading">{step.label}</h2>
      <p className="muted">
        Editorial notes are saved to this project only. This does not run a production step.
      </p>
      <div className="wizard-editor-meta">
        <span className="project-status">{step.status}</span>
        <span className="project-status">
          {reviewState === 'submitted' ? 'Submitted · not approved' : 'Editorial draft'}
        </span>
        <span>Draft revision {revision}</span>
      </div>
      <label htmlFor="wizard-editor-notes">Editorial notes for {step.label}</label>
      <textarea
        id="wizard-editor-notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        maxLength={4000}
        rows={9}
        disabled={readonly}
        placeholder="Research questions, editorial direction or next steps…"
      />
      <div className="wizard-save-state" role="status" aria-live="polite">
        {readonly
          ? 'Read-only project'
          : conflict
            ? 'Save conflict — your local notes have NOT overwritten the stored version.'
            : error
              ? 'Changes not saved.'
              : saving
                ? 'Saving changes…'
                : dirty
                  ? 'Unsaved changes — autosave starts shortly.'
                  : 'Saved to database · ' + new Date(lastSaved).toLocaleTimeString('en-GB')}
      </div>
      {error ? (
        <div className="auth-error" role="alert">
          <p>{error.message}</p>
          {conflict ? (
            <p>Copy your local notes first if needed. Reloading will replace them with the stored version.</p>
          ) : null}
          {error.status === 401 ? <Link href="/admin/login">Sign in</Link> : null}
          {!conflict && error.status !== 401 ? (
            <button className="button button-secondary" type="button" onClick={() => setError(null)}>
              Retry autosave
            </button>
          ) : null}
        </div>
      ) : null}
      {error || conflict ? (
        <button
          className="button button-secondary"
          type="button"
          onClick={() => {
            if (dirty && !window.confirm('Discard your unsaved local notes and reload the latest saved version?')) return;
            void onReload();
          }}
        >
          Discard and reload stored version
        </button>
      ) : null}
      <div className="wizard-editor-actions">
        <button
          className="button button-secondary"
          type="button"
          disabled={readonly || dirty || saving || !!error || conflict || !notes.trim() || reviewState === 'submitted'}
          onClick={() => void submitForReview()}
        >
          Submit for editorial review
        </button>
        <p className="muted">
          Submission records a review request, not a content, rights, render or publish approval.
        </p>
      </div>
    </section>
  );
}

export function WizardWorkspace({ projectId }: { projectId: string }) {
  const [wizard, setWizard] = useState<Wizard | null>(null);
  const [current, setCurrent] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editorKey, setEditorKey] = useState(0);
  const [pendingChanges, setPendingChanges] = useState(false);
  const selected = wizard?.steps.find((step) => step.number === current);
  const readonly = wizard?.project.status === 'archived' || wizard?.project.status === 'approved' || wizard?.project.status === 'in_review';

  useEffect(() => {
    const controller = new AbortController();
    void fetchWizard('/api/v1/projects/' + projectId + '/wizard', { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) setWizard(data as Wizard);
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Wizard unavailable.');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [projectId]);

  const handleSaved = useCallback((next: Step) => {
    setWizard((prior) =>
      prior
        ? { ...prior, steps: prior.steps.map((step) => (step.number === next.number ? next : step)) }
        : prior,
    );
  }, []);

  const handleBusy = useCallback((pending: boolean) => setPendingChanges(pending), []);

  async function reloadStep() {
    try {
      setError('');
      const refreshed = (await fetchWizard('/api/v1/projects/' + projectId + '/wizard')) as Wizard;
      setWizard(refreshed);
      setEditorKey((value) => value + 1);
      setPendingChanges(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to reload wizard.');
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <BrandMark />
          <span className="studio-tag">Admin studio · Seven-step wizard</span>
        </div>
      </header>
      <main className="container admin-view project-workspace">
        <p className="eyebrow">Production workspace · Roadmap 032</p>
        <h1>Video wizard</h1>
        <p className="muted">Drafts are private and never trigger video generation or publishing.</p>
        <div className="project-navigation">
          <nav aria-label="Studio navigation">
            <Link href="/admin" onClick={(event) => { if (pendingChanges && !window.confirm('You have unsaved notes. Leave this page?')) event.preventDefault(); }}>Dashboard</Link>
            <Link href="/admin/projects" onClick={(event) => { if (pendingChanges && !window.confirm('You have unsaved notes. Leave this page?')) event.preventDefault(); }}>Projects</Link>
            <Link href={'/admin/projects/' + projectId} onClick={(event) => { if (pendingChanges && !window.confirm('You have unsaved notes. Leave this page?')) event.preventDefault(); }}>Project details</Link>
          </nav>
          <form action="/api/auth/logout" method="post">
            <button className="button button-secondary" type="submit">Sign out</button>
          </form>
        </div>
        {loading ? <p role="status">Loading saved wizard…</p> : null}
        {error ? <p className="auth-error" role="alert">{error}</p> : null}
        {!loading && wizard ? (
          <>
            <div className="wizard-title">
              <h2>{wizard.project.title}</h2>
              <span className="project-status">Project revision {wizard.project.currentVersion}</span>
            </div>
            <div className="wizard-content">
              <nav aria-label="Wizard steps" className="wizard-steps">
                {wizard.steps.map((step) => (
                  <button
                    type="button"
                    key={step.number}
                    className={'wizard-step-button' + (step.number === current ? ' selected' : '')}
                    aria-current={step.number === current ? 'step' : undefined}
                    onClick={() => setCurrent(step.number)}
                    disabled={step.number === current || pendingChanges}
                  >
                    <span className="wizard-step-numeral">{String(step.number).padStart(2, '0')}</span>
                    <span>
                      <strong>{step.label}</strong>
                      <small>{step.reviewState === 'submitted' ? 'Review requested' : step.status}</small>
                    </span>
                  </button>
                ))}
              </nav>
              {selected ? (
                <div>
                  <StepEditor
                    key={selected.number + ':' + editorKey}
                    step={selected}
                    projectId={projectId}
                    readonly={!!readonly}
                    onSaved={handleSaved}
                    onBusy={handleBusy}
                    onReload={reloadStep}
                  />
                  <div className="wizard-reload">
                    <button
                      className="button button-secondary"
                      type="button"
                      onClick={() => {
                        if (pendingChanges && !window.confirm('Discard unsaved notes and reload the saved wizard?')) return;
                        void reloadStep();
                      }}
                    >
                      Reload latest saved wizard
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </main>
    </>
  );
}
