'use client';

import { AnonymousCTA } from '@/components/AnonymousCTA';
import { useAuth } from '@/components/AuthContext';
import { CategoryBadge, CATEGORY_ICON_COLORS } from '@/components/CategoryBadge';
import { SidebarSection } from '@/components/SidebarSection';
import { StarBreakdown, StarInput, StarRating } from '@/components/StarRating';
import type { Rating, SoftwareDetail, SoftwareListing } from '@/types';
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  ABANDONED: 'Abandoned',
  DEPRECATED: 'Deprecated',
};

const STATUS_CLASSES: Record<string, string> = {
  ACTIVE:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ABANDONED:  'bg-[var(--color-surface-raised)] text-[var(--color-text-muted)]',
  DEPRECATED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

type TabKey = 'overview' | 'platforms' | 'systems';

function SoftwareIcon({ name, category, size = 56 }: { name: string; category: string; size?: number }) {
  const initials = name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  const color = CATEGORY_ICON_COLORS[category] ?? '#8868F0';
  return (
    <div
      className="flex items-center justify-center rounded-2xl text-white font-bold shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.3 }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
    >
      <span>{label}</span>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15,3 21,3 21,9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </svg>
    </a>
  );
}

function SimilarItem({ software }: { software: SoftwareListing }) {
  const color = CATEGORY_ICON_COLORS[software.category] ?? '#8868F0';
  const initials = software.name.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
  return (
    <Link
      href={`/software/${software.id}`}
      className="flex items-center gap-3 rounded-lg p-2 -mx-2 hover:bg-[var(--color-surface-raised)] transition-colors"
    >
      <div
        className="flex items-center justify-center rounded-lg text-white text-xs font-bold shrink-0"
        style={{ width: 32, height: 32, backgroundColor: color }}
        aria-hidden="true"
      >
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)] line-clamp-1">{software.name}</p>
        <CategoryBadge category={software.category} />
      </div>
    </Link>
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
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
        Rating submitted — thanks!
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      <h4 className="font-semibold text-[var(--color-text)]">
        {existingRating ? 'Update your rating' : 'Rate this software'}
      </h4>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Quality score</label>
        <StarInput value={qualityScore} onChange={setQualityScore} />
      </div>
      {hardwareOptions.length > 0 && (
        <div className="space-y-4 border-t border-[var(--color-border)] pt-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Device (for performance score)</label>
            <select
              value={hardwareId}
              onChange={(e) => setHardwareId(e.target.value)}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            >
              <option value="">Select a device…</option>
              {hardwareOptions.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          {hardwareId && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">Performance on this device</label>
              <StarInput value={performanceScore} onChange={setPerformanceScore} />
            </div>
          )}
        </div>
      )}
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-2">
          Comment <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={2}
          placeholder="Brief notes on your experience…"
          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none resize-none transition-colors"
        />
      </div>
      <button
        type="submit"
        disabled={loading || (!qualityScore && !performanceScore)}
        className="px-5 py-2.5 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] disabled:opacity-40 transition-colors"
      >
        {loading ? 'Submitting…' : existingRating ? 'Update rating' : 'Submit rating'}
      </button>
    </form>
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
    <div className="mt-6 border-t border-[var(--color-border)] pt-6">
      <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Performance by hardware</h4>
      <div className="space-y-2">
        {entries.map((e) => {
          const avg = e.scores.reduce((s, n) => s + n, 0) / e.scores.length;
          return (
            <div key={e.name} className="flex items-center justify-between gap-4">
              <span className="text-sm text-[var(--color-text)] truncate">{e.name}</span>
              <StarRating score={avg} count={e.scores.length} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SoftwareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [software, setSoftware] = useState<SoftwareDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

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
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-1/3 rounded-lg bg-[var(--color-surface)]" />
          <div className="h-4 w-2/3 rounded-lg bg-[var(--color-surface)]" />
          <div className="h-4 w-1/2 rounded-lg bg-[var(--color-surface)]" />
        </div>
      </div>
    );
  }

  if (error || !software) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <p className="text-[var(--color-text-muted)]">{error || 'Listing not found.'}</p>
        <Link href="/browse" className="mt-4 inline-block text-sm text-[var(--color-accent)] hover:underline">
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

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'overview',  label: 'Overview' },
    { key: 'platforms', label: 'Platforms' },
    { key: 'systems',   label: 'Systems' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <Link href="/browse" className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors inline-flex items-center gap-1 mb-6">
        ← Browse
      </Link>

      <div className="flex gap-8 items-start">
        {/* ── Main column ── */}
        <div className="flex-1 min-w-0 space-y-0">

          {/* Software header */}
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 mb-6">
            <div className="flex items-start gap-5">
              <SoftwareIcon name={software.name} category={software.category} size={64} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-[var(--color-text)]">{software.name}</h1>
                  <CategoryBadge category={software.category} />
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[software.status] ?? STATUS_CLASSES.ABANDONED}`}>
                    {STATUS_LABELS[software.status] ?? software.status}
                  </span>
                </div>
                {software.description && (
                  <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-2xl">{software.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex border-b border-[var(--color-border)] mb-6 -mt-2">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === key
                    ? 'border-[var(--color-accent)] text-[var(--color-accent)]'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                {label}
              </button>
            ))}
            <button
              className="px-4 py-2.5 text-sm font-medium border-b-2 border-transparent text-[var(--color-text-muted)] opacity-50 cursor-not-allowed"
              title="Coming soon"
              disabled
            >
              Screenshots
            </button>
          </div>

          {/* Tab: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Ratings */}
              <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <h2 className="text-base font-semibold text-[var(--color-text)] mb-4">Ratings &amp; reviews</h2>
                <div className="flex items-start gap-8 mb-6">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-bold text-[var(--color-text)]">
                      {avgQuality !== null ? avgQuality.toFixed(1) : '—'}
                    </p>
                    <div className="mt-1">
                      <StarRating score={avgQuality} count={qualityRatings.length} />
                    </div>
                  </div>
                  {qualityRatings.length > 0 && (
                    <div className="flex-1">
                      <StarBreakdown ratings={software.ratings} />
                    </div>
                  )}
                </div>
                <PerformanceBreakdown ratings={software.ratings} />

                {/* Comments */}
                {software.ratings.filter((r) => r.comment).length > 0 && (
                  <div className="mt-6 border-t border-[var(--color-border)] pt-6 space-y-3">
                    <h3 className="text-sm font-semibold text-[var(--color-text)]">Comments</h3>
                    {software.ratings.filter((r) => r.comment).slice(0, 10).map((r) => (
                      <div key={r.id} className="rounded-lg bg-[var(--color-surface-raised)] px-4 py-3">
                        <p className="text-sm text-[var(--color-text)]">{r.comment}</p>
                        <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
                          {r.hardware?.name ?? 'no device'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Rating form */}
              {user ? (
                <RatingForm
                  softwareId={software.id}
                  hardwareOptions={software.hardware}
                  existingRating={existingRating}
                  onSubmitted={fetchSoftware}
                />
              ) : (
                <p className="text-sm text-[var(--color-text-muted)]">
                  <Link href={`/auth/signin?next=/software/${software.id}`} className="text-[var(--color-accent)] hover:underline">
                    Sign in
                  </Link>{' '}to rate this software.
                </p>
              )}
            </div>
          )}

          {/* Tab: Platforms */}
          {activeTab === 'platforms' && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              {software.platforms.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No platform information available.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {software.platforms.map((p) => (
                    <span key={p.id} className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-text)]">
                      {p.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Systems */}
          {activeTab === 'systems' && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              {software.systems.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No systems information available.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {software.systems.map((s) => (
                    <span key={s.id} className="rounded-full border border-[var(--color-border)] px-3 py-1 text-sm text-[var(--color-text)]">
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col gap-4 w-64 shrink-0">
          {/* External links */}
          {(software.websiteUrl || software.downloadUrl || software.sourceUrl) && (
            <SidebarSection title="Links">
              <div className="space-y-2">
                {software.websiteUrl  && <ExternalLink href={software.websiteUrl}  label="Website" />}
                {software.downloadUrl && <ExternalLink href={software.downloadUrl} label="Download" />}
                {software.sourceUrl   && <ExternalLink href={software.sourceUrl}   label="Source code" />}
              </div>
            </SidebarSection>
          )}

          {/* Tags */}
          {software.tags.length > 0 && (
            <SidebarSection title="Tags">
              <div className="flex flex-wrap gap-1.5">
                {software.tags.map((t) => (
                  <Link
                    key={t.id}
                    href={`/browse?tag=${t.id}`}
                    className="inline-flex rounded-full bg-[var(--color-accent-surface)] px-2.5 py-0.5 text-xs text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
                  >
                    {t.name}
                  </Link>
                ))}
              </div>
            </SidebarSection>
          )}

          {/* Hardware */}
          {software.hardware.length > 0 && (
            <SidebarSection title="Hardware">
              <div className="space-y-1.5">
                {software.hardware.map((h) => (
                  <p key={h.id} className="text-sm text-[var(--color-text)]">{h.name}</p>
                ))}
              </div>
            </SidebarSection>
          )}

          {/* Similar */}
          {software.similar.length > 0 && (
            <SidebarSection title="Similar">
              <div className="space-y-1">
                {software.similar.map((s) => (
                  <SimilarItem key={s.id} software={s} />
                ))}
              </div>
            </SidebarSection>
          )}

          {/* Anonymous CTA */}
          {!user && <AnonymousCTA />}
        </aside>
      </div>
    </div>
  );
}
