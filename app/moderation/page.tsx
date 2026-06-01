'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const TABS = [
  { value: '',             label: 'All' },
  { value: 'NEW_LISTING',  label: 'New Listing' },
  { value: 'EDIT',         label: 'Edit' },
  { value: 'NEW_HARDWARE', label: 'Hardware' },
  { value: 'NEW_TAG',      label: 'Tag' },
];

const TYPE_LABELS: Record<string, string> = {
  NEW_LISTING:  'New Listing',
  EDIT:         'Edit',
  NEW_HARDWARE: 'Hardware',
  NEW_TAG:      'Tag',
};

interface Submission {
  id: string;
  type: string;
  status: string;
  payload: Record<string, unknown>;
  targetId: string | null;
  createdAt: string;
  submitter: { id: string; username: string | null };
}

interface SubmissionsResponse {
  data: Submission[];
  meta: { page: number; totalPages: number; total: number };
}

function PayloadSummary({ type, payload }: { type: string; payload: Record<string, unknown> }) {
  switch (type) {
    case 'NEW_LISTING':
      return (
        <div className="space-y-1">
          <p className="font-medium text-[var(--color-text)]">{String(payload.name)}</p>
          <p className="text-xs text-[var(--color-text-muted)]">{String(payload.category)}</p>
          {typeof payload.description === 'string' && (
            <p className="text-xs text-[var(--color-text-muted)] line-clamp-2">{payload.description}</p>
          )}
          {typeof payload.websiteUrl === 'string' && (
            <p className="text-xs text-[var(--color-text-muted)] truncate">{payload.websiteUrl}</p>
          )}
        </div>
      );
    case 'EDIT':
      return (
        <div className="space-y-1">
          <p className="text-xs text-[var(--color-text-muted)]">Changes:</p>
          {Object.entries(payload).map(([k, v]) => (
            <div key={k} className="text-xs">
              <span className="text-[var(--color-text-muted)]">{k}:</span>{' '}
              <span className="text-[var(--color-text)]">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    case 'NEW_HARDWARE':
      return (
        <div className="space-y-1">
          <p className="font-medium text-[var(--color-text)]">{String(payload.name)}</p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {String(payload.hardwareType)}{payload.manufacturer ? ` · ${payload.manufacturer}` : ''}
          </p>
        </div>
      );
    case 'NEW_TAG':
      return <p className="text-[var(--color-text)]">Tag: <strong>{String(payload.name)}</strong></p>;
    default:
      return <pre className="text-xs text-[var(--color-text-muted)] whitespace-pre-wrap">{JSON.stringify(payload, null, 2)}</pre>;
  }
}

export default function ModerationPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.isModerator)) router.push('/');
  }, [authLoading, user, router]);

  const fetchSubmissions = () => {
    setLoading(true);
    setError('');
    const p = new URLSearchParams({ page: String(page) });
    if (activeTab) p.set('type', activeTab);
    fetch(`/api/moderation/submissions?${p}`)
      .then((r) => r.json())
      .then((json: SubmissionsResponse) => { setSubmissions(json.data ?? []); setMeta(json.meta); })
      .catch(() => setError('Failed to load submissions.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user?.isModerator) fetchSubmissions(); }, [user, activeTab, page]);

  async function action(id: string, verb: 'approve' | 'reject') {
    setActioning(id);
    try {
      const res = await fetch(`/api/moderation/submissions/${id}/${verb}`, { method: 'POST' });
      if (!res.ok) { const data = await res.json(); alert(data.error ?? 'Action failed'); return; }
      fetchSubmissions();
    } finally {
      setActioning(null);
    }
  }

  if (authLoading || !user) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-[var(--color-text-muted)]">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Moderation Queue</h1>

      {/* Tab bar */}
      <div className="flex gap-0 mb-6 border-b border-[var(--color-border)]">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setActiveTab(t.value); setPage(1); }}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === t.value
                ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-16 text-center">Queue is empty.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center rounded-full bg-[var(--color-accent-surface)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-accent)]">
                      {TYPE_LABELS[s.type] ?? s.type}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <PayloadSummary type={s.type} payload={s.payload} />
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => action(s.id, 'approve')}
                    disabled={actioning === s.id}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => action(s.id, 'reject')}
                    disabled={actioning === s.id}
                    className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:border-red-400 hover:text-red-500 disabled:opacity-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--color-text-muted)]">Page {page} of {meta.totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= meta.totalPages}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
