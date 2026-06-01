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
        if (e.message === 'forbidden') {
          setError('Tag review requires at least one approved submission.');
        } else {
          setError('Failed to load pending tags.');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user) fetchTags();
  }, [user]);

  async function action(tag: PendingTag, verb: 'approve' | 'reject') {
    setActioning(tag.id);
    try {
      const res = await fetch(`/api/tags/${tag.tagId}/${verb}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId: tag.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? 'Action failed');
        return;
      }
      fetchTags();
    } finally {
      setActioning(null);
    }
  }

  if (authLoading || !user) {
    return <div className="mx-auto max-w-3xl px-4 py-10 text-zinc-400 text-sm">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold text-zinc-100 mb-2">Tag Review</h1>
      <p className="text-sm text-zinc-400 mb-8">
        Review community-submitted tags. Approving a tag makes it visible on all attached listings.
        You cannot review tags you submitted.
      </p>

      {error ? (
        <div className="rounded border border-zinc-800 bg-zinc-900 p-6 text-sm text-zinc-400">{error}</div>
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-lg bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : tags.length === 0 ? (
        <p className="text-sm text-zinc-500 py-12 text-center">No pending tags.</p>
      ) : (
        <div className="space-y-3">
          {tags.map((tag) => {
            const isOwn = tag.submittedByProfile?.id === user.id;
            return (
              <div key={tag.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-zinc-100">{tag.name}</span>
                      <span className="text-xs text-zinc-500">
                        by {tag.submittedByProfile?.username ?? 'anon'} · {new Date(tag.createdAt).toLocaleDateString()}
                      </span>
                      {isOwn && (
                        <span className="text-xs bg-zinc-700 text-zinc-400 rounded px-1.5 py-0.5">your submission</span>
                      )}
                    </div>
                    {tag.software.length > 0 && (
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Attached to:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {tag.software.map((s) => (
                            <a
                              key={s.id}
                              href={`/software/${s.id}`}
                              className="text-xs rounded border border-zinc-700 px-2 py-0.5 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition-colors"
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
                      className="px-3 py-1.5 rounded bg-green-700 text-xs font-medium text-white hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => action(tag, 'reject')}
                      disabled={actioning === tag.id || isOwn}
                      title={isOwn ? "Can't review your own submission" : undefined}
                      className="px-3 py-1.5 rounded bg-zinc-700 text-xs font-medium text-zinc-200 hover:bg-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
