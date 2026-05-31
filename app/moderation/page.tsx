'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const TABS = [
  { value: '', label: 'All' },
  { value: 'NEW_LISTING', label: 'New Listing' },
  { value: 'EDIT', label: 'Edit' },
  { value: 'NEW_HARDWARE', label: 'Hardware' },
  { value: 'NEW_TAG', label: 'Tag' },
];

const TYPE_COLORS: Record<string, string> = {
  NEW_LISTING:  'bg-blue-500/15 text-blue-400',
  EDIT:         'bg-yellow-500/15 text-yellow-400',
  NEW_HARDWARE: 'bg-teal-500/15 text-teal-400',
  NEW_TAG:      'bg-purple-500/15 text-purple-400',
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
          <p className="font-medium text-zinc-200">{String(payload.name)}</p>
          <p className="text-xs text-zinc-500">{String(payload.category)}</p>
          {typeof payload.description === 'string' && <p className="text-xs text-zinc-400 line-clamp-2">{payload.description}</p>}
          {typeof payload.websiteUrl === 'string' && <p className="text-xs text-zinc-500 truncate">{payload.websiteUrl}</p>}
        </div>
      );
    case 'EDIT':
      return (
        <div className="space-y-1">
          <p className="text-xs text-zinc-500">Changes:</p>
          {Object.entries(payload).map(([k, v]) => (
            <div key={k} className="text-xs">
              <span className="text-zinc-500">{k}:</span>{' '}
              <span className="text-zinc-300">{String(v)}</span>
            </div>
          ))}
        </div>
      );
    case 'NEW_HARDWARE':
      return (
        <div className="space-y-1">
          <p className="font-medium text-zinc-200">{String(payload.name)}</p>
          <p className="text-xs text-zinc-500">{String(payload.hardwareType)}{payload.manufacturer ? ` · ${payload.manufacturer}` : ''}</p>
        </div>
      );
    case 'NEW_TAG':
      return <p className="text-zinc-200">Tag: <strong>{String(payload.name)}</strong></p>;
    default:
      return <pre className="text-xs text-zinc-400 whitespace-pre-wrap">{JSON.stringify(payload, null, 2)}</pre>;
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
    if (!authLoading && (!user || !user.isModerator)) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  const fetchSubmissions = () => {
    setLoading(true);
    setError('');
    const p = new URLSearchParams({ page: String(page) });
    if (activeTab) p.set('type', activeTab);
    fetch(`/api/moderation/submissions?${p}`)
      .then((r) => r.json())
      .then((json: SubmissionsResponse) => {
        setSubmissions(json.data ?? []);
        setMeta(json.meta);
      })
      .catch(() => setError('Failed to load submissions.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.isModerator) fetchSubmissions();
  }, [user, activeTab, page]);

  async function action(id: string, verb: 'approve' | 'reject') {
    setActioning(id);
    try {
      const res = await fetch(`/api/moderation/submissions/${id}/${verb}`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? 'Action failed');
        return;
      }
      fetchSubmissions();
    } finally {
      setActioning(null);
    }
  }

  if (authLoading || !user) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-zinc-400 text-sm">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold text-zinc-100 mb-6">Moderation Queue</h1>

      <div className="flex gap-1 mb-6 border-b border-zinc-800">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setActiveTab(t.value); setPage(1); }}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              activeTab === t.value
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : submissions.length === 0 ? (
        <p className="text-sm text-zinc-500 py-12 text-center">Queue is empty.</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((s) => (
            <div key={s.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${TYPE_COLORS[s.type] ?? 'bg-zinc-700 text-zinc-400'}`}>
                      {s.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-zinc-500">
                      by {s.submitter.username ?? 'anon'} · {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <PayloadSummary type={s.type} payload={s.payload} />
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => action(s.id, 'approve')}
                    disabled={actioning === s.id}
                    className="px-3 py-1.5 rounded bg-green-700 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => action(s.id, 'reject')}
                    disabled={actioning === s.id}
                    className="px-3 py-1.5 rounded bg-zinc-700 text-xs font-medium text-zinc-200 hover:bg-zinc-600 disabled:opacity-50 transition-colors"
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
            className="px-4 py-2 rounded border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 disabled:opacity-40 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-400">Page {page} of {meta.totalPages}</span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page >= meta.totalPages}
            className="px-4 py-2 rounded border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 disabled:opacity-40 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
