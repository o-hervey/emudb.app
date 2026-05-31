'use client';

import { useAuth } from '@/components/AuthContext';
import { CategoryBadge } from '@/components/CategoryBadge';
import { StarInput, StarRating } from '@/components/StarRating';
import type { Rating, SoftwareDetail } from '@/types';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  ABANDONED: 'Abandoned',
  DEPRECATED: 'Deprecated',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-500/15 text-green-400',
  ABANDONED: 'bg-zinc-700 text-zinc-400',
  DEPRECATED: 'bg-red-500/15 text-red-400',
};

function TagChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded border border-zinc-700 px-2 py-0.5 text-xs text-zinc-400">
      {label}
    </span>
  );
}

function PerformanceBreakdown({ ratings }: { ratings: Rating[] }) {
  const byHardware = ratings
    .filter((r) => r.performanceScore !== null && r.hardware)
    .reduce<Record<string, { name: string; scores: number[] }>>((acc, r) => {
      const hw = r.hardware!;
      if (!acc[hw.id]) acc[hw.id] = { name: hw.name, scores: [] };
      acc[hw.id].scores.push(r.performanceScore!);
      return acc;
    }, {});

  const entries = Object.values(byHardware);
  if (entries.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Performance by Hardware</h4>
      <div className="space-y-2">
        {entries.map((e) => {
          const avg = e.scores.reduce((s, n) => s + n, 0) / e.scores.length;
          return (
            <div key={e.name} className="flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-300 truncate">{e.name}</span>
              <StarRating score={avg} count={e.scores.length} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RatingForm({
  softwareId,
  hardwareOptions,
  existingRating,
  onSubmitted,
}: {
  softwareId: string;
  hardwareOptions: { id: string; name: string }[];
  existingRating: Rating | null;
  onSubmitted: () => void;
}) {
  const [qualityScore, setQualityScore] = useState<number | null>(existingRating?.qualityScore ?? null);
  const [performanceScore, setPerformanceScore] = useState<number | null>(existingRating?.performanceScore ?? null);
  const [hardwareId, setHardwareId] = useState(existingRating?.hardware?.id ?? '');
  const [comment, setComment] = useState(existingRating?.comment ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/software/${softwareId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qualityScore: qualityScore ?? undefined,
          performanceScore: performanceScore ?? undefined,
          hardwareId: hardwareId || undefined,
          comment: comment.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to submit rating'); return; }
      setSuccess(true);
      onSubmitted();
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="rounded border border-green-800 bg-green-900/20 px-4 py-3 text-sm text-green-400">
        Rating submitted. Thanks!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
      <h4 className="text-sm font-semibold text-zinc-200">
        {existingRating ? 'Update your rating' : 'Rate this software'}
      </h4>
      {error && (
        <div className="rounded border border-red-800 bg-red-900/20 px-3 py-2 text-xs text-red-400">{error}</div>
      )}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Quality score</label>
        <StarInput value={qualityScore} onChange={setQualityScore} />
      </div>
      {hardwareOptions.length > 0 && (
        <div className="space-y-3 border-t border-zinc-800 pt-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Device (for performance score)</label>
            <select
              value={hardwareId}
              onChange={(e) => setHardwareId(e.target.value)}
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none"
            >
              <option value="">Select a device…</option>
              {hardwareOptions.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          {hardwareId && (
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Performance on this device</label>
              <StarInput value={performanceScore} onChange={setPerformanceScore} />
            </div>
          )}
        </div>
      )}
      <div>
        <label className="block text-xs text-zinc-500 mb-1.5">Comment <span className="text-zinc-600">(optional)</span></label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Brief notes on your experience…"
          className="w-full rounded border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={loading || (!qualityScore && !performanceScore)}
        className="px-4 py-2 rounded bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
      >
        {loading ? 'Submitting…' : existingRating ? 'Update rating' : 'Submit rating'}
      </button>
    </form>
  );
}

export default function SoftwareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [software, setSoftware] = useState<SoftwareDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSoftware = () => {
    setLoading(true);
    fetch(`/api/software/${id}`)
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then(setSoftware)
      .catch((status) => setError(status === 404 ? 'Listing not found.' : 'Failed to load.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchSoftware(); }, [id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`h-6 rounded bg-zinc-800 animate-pulse ${i === 0 ? 'w-1/3' : i === 1 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    );
  }

  if (error || !software) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <p className="text-zinc-400">{error || 'Listing not found.'}</p>
        <Link href="/browse" className="mt-4 inline-block text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to browse
        </Link>
      </div>
    );
  }

  const qualityRatings = software.ratings.filter((r) => r.qualityScore !== null);
  const avgQuality = qualityRatings.length > 0
    ? qualityRatings.reduce((s, r) => s + r.qualityScore!, 0) / qualityRatings.length
    : null;

  const existingRating = user ? software.ratings.find((r) => r.user.id === user.id) ?? null : null;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-8">
      <div>
        <Link href="/browse" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Browse
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-zinc-100">{software.name}</h1>
          <CategoryBadge category={software.category} />
          <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${STATUS_COLORS[software.status] ?? 'bg-zinc-700 text-zinc-400'}`}>
            {STATUS_LABELS[software.status] ?? software.status}
          </span>
        </div>
        {software.description && (
          <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">{software.description}</p>
        )}
        <div className="flex flex-wrap gap-3">
          {software.websiteUrl && (
            <a href={software.websiteUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Website ↗
            </a>
          )}
          {software.downloadUrl && (
            <a href={software.downloadUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Download ↗
            </a>
          )}
          {software.sourceUrl && (
            <a href={software.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Source ↗
            </a>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="grid sm:grid-cols-3 gap-6 border-t border-zinc-800 pt-6">
        {software.systems.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Systems</h3>
            <div className="flex flex-wrap gap-1.5">
              {software.systems.map((s) => <TagChip key={s.id} label={s.name} />)}
            </div>
          </div>
        )}
        {software.platforms.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Platforms</h3>
            <div className="flex flex-wrap gap-1.5">
              {software.platforms.map((p) => <TagChip key={p.id} label={p.name} />)}
            </div>
          </div>
        )}
        {software.hardware.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Hardware</h3>
            <div className="flex flex-wrap gap-1.5">
              {software.hardware.map((h) => <TagChip key={h.id} label={h.name} />)}
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      {software.tags.length > 0 && (
        <div className="border-t border-zinc-800 pt-6">
          <h3 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Tags</h3>
          <div className="flex flex-wrap gap-1.5">
            {software.tags.map((t) => <TagChip key={t.id} label={t.name} />)}
          </div>
        </div>
      )}

      {/* Ratings */}
      <div className="border-t border-zinc-800 pt-6 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200">Ratings</h3>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Overall Quality</p>
          <StarRating score={avgQuality} count={qualityRatings.length} />
        </div>
        <PerformanceBreakdown ratings={software.ratings} />

        {software.ratings.filter((r) => r.comment).length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Comments</h4>
            {software.ratings
              .filter((r) => r.comment)
              .slice(0, 10)
              .map((r) => (
                <div key={r.id} className="rounded border border-zinc-800 px-3 py-2.5">
                  <p className="text-sm text-zinc-300">{r.comment}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    {r.user.username ?? 'anon'} · {r.hardware?.name ?? 'no device'}
                  </p>
                </div>
              ))}
          </div>
        )}

        {user ? (
          <RatingForm
            softwareId={software.id}
            hardwareOptions={software.hardware}
            existingRating={existingRating}
            onSubmitted={fetchSoftware}
          />
        ) : (
          <p className="text-sm text-zinc-500">
            <Link href={`/auth/signin?next=/software/${software.id}`} className="text-indigo-400 hover:text-indigo-300">
              Sign in
            </Link>{' '}to rate this software.
          </p>
        )}
      </div>
    </div>
  );
}
