'use client';

import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PendingTag {
  id: string;
  tagId: string;
  softwareId: string;
  name: string;
  createdAt: string;
  submittedByProfile: { id: string; username: string | null } | null;
  software: { id: string; name: string; category: string }[];
}

interface TagsResponse {
  data: PendingTag[];
}

export default function TagReviewPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [tags, setTags] = useState<PendingTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/signin?next=/tags/review');
  }, [authLoading, user, router]);

  const fetchTags = () => {
    setLoading(true);
    setError('');
    fetch('/api/tags/pending')
      .then((r) => {
        if (r.status === 403) throw new Error('forbidden');
        if (!r.ok) throw new Error('error');
        return r.json();
      })
      .then((json: TagsResponse) => setTags(json.data ?? []))
      .catch((e) => {
        setError(
          e.message === 'forbidden'
            ? 'Tag review requires at least one approved submission.'
            : 'Failed to load pending tags.'
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) fetchTags(); }, [user]);

  async function action(tag: PendingTag, verb: 'approve' | 'reject') {
    setActioning(tag.id);
    try {
      const res = await fetch(`/api/tags/${tag.tagId}/${verb}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: tag.id }),
      });
      if (!res.ok) { const data = await res.json(); alert(data.error ?? 'Action failed'); return; }
      fetchTags();
    } finally {
      setActioning(null);
    }
  }

  if (authLoading || !user) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-[var(--color-text-muted)]">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Tag Review</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-8 leading-relaxed">
        Review community-submitted tags. Approving a tag makes it visible on all attached listings.
        You cannot review tags you submitted yourself.
      </p>

      {error ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6 text-sm text-[var(--color-text-muted)]">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-16 text-center">No pending tags.</p>
      ) : (
        <div className="space-y-3">
          {tags.map((tag) => {
            const isOwn = tag.submittedByProfile?.id === user.id && !user.isSuperAdmin;
            return (
              <div key={tag.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[var(--color-text)]">{tag.name}</span>
                      <span className="text-xs text-[var(--color-text-muted)]">
                        {new Date(tag.createdAt).toLocaleDateString()}
                      </span>
                      {isOwn && (
                        <span className="inline-flex rounded-full bg-[var(--color-surface-raised)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                          your submission
                        </span>
                      )}
                    </div>
                    {tag.software.length > 0 && (
                      <div>
                        <p className="text-xs text-[var(--color-text-muted)] mb-1.5">Attached to:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tag.software.map((s) => (
                            <a
                              key={s.id}
                              href={`/software/${s.id}`}
                              className="text-xs rounded-full border border-[var(--color-border)] px-2.5 py-0.5 text-[var(--color-text-muted)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)] transition-colors"
                            >
                              {s.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => action(tag, 'approve')}
                      disabled={actioning === tag.id || isOwn}
                      title={isOwn ? "Can't review your own submission" : undefined}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => action(tag, 'reject')}
                      disabled={actioning === tag.id || isOwn}
                      title={isOwn ? "Can't review your own submission" : undefined}
                      className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-muted)] hover:border-red-400 hover:text-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
