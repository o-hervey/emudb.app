'use client';

import { ListingCard } from '@/components/ListingCard';
import { MultiSelect } from '@/components/MultiSelect';
import { useFilters } from '@/components/FiltersContext';
import type { PaginatedResponse, SoftwareListing } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const CATEGORIES = [
  { value: 'EMULATOR',            label: 'Emulator' },
  { value: 'FRONTEND',            label: 'Frontend' },
  { value: 'OPERATING_SYSTEM',    label: 'OS & CFW' },
  { value: 'COMPATIBILITY_LAYER', label: 'Compatibility Layer' },
  { value: 'UTILITY',             label: 'Utility' },
  { value: 'SCRAPER',             label: 'Scraper' },
  { value: 'SHADER',              label: 'Shader' },
  { value: 'COMPANION_APP',       label: 'Companion App' },
  { value: 'INPUT_CONTROLLERS',   label: 'Input & Controllers' },
  { value: 'STREAMING',           label: 'Streaming' },
];

const SORT_OPTIONS = [
  { value: 'az',         label: 'A–Z' },
  { value: 'za',         label: 'Z–A' },
  { value: 'newest',     label: 'Newest' },
  { value: 'oldest',     label: 'Oldest' },
  { value: 'top_rated',  label: 'Top rated' },
  { value: 'most_rated', label: 'Most rated' },
];

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = `filter-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { filters } = useFilters();

  const [results, setResults] = useState<SoftwareListing[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const q         = searchParams.get('q') ?? '';
  const category  = searchParams.get('category') ?? '';
  const sort      = searchParams.get('sort') ?? '';
  const platforms = searchParams.getAll('platform');
  const hardware  = searchParams.getAll('hardware');
  const systems   = searchParams.getAll('system');
  const tags      = searchParams.getAll('tag');
  const page      = parseInt(searchParams.get('page') ?? '1', 10);

  function set(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) { p.set(key, value); } else { p.delete(key); }
    p.delete('page');
    router.push(`/browse?${p.toString()}`);
  }

  function setMulti(key: string, values: string[]) {
    const p = new URLSearchParams(searchParams.toString());
    p.delete(key);
    for (const v of values) p.append(key, v);
    p.delete('page');
    router.push(`/browse?${p.toString()}`);
  }

  function setPage(n: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set('page', String(n));
    router.push(`/browse?${p.toString()}`);
  }

  useEffect(() => {
    setLoading(true);
    setError('');
    const p = new URLSearchParams();
    if (q)       p.set('q', q);
    if (category) p.set('category', category);
    if (sort)    p.set('sort', sort);
    for (const id of platforms) p.append('platform', id);
    for (const id of hardware)  p.append('hardware', id);
    for (const id of systems)   p.append('system', id);
    for (const id of tags)      p.append('tag', id);
    p.set('page', String(page));

    fetch(`/api/software?${p.toString()}`)
      .then((r) => r.json())
      .then((json: PaginatedResponse<SoftwareListing>) => {
        setResults(json.data ?? []);
        setMeta(json.meta);
      })
      .catch(() => setError('Failed to load results.'))
      .finally(() => setLoading(false));
  }, [q, category, sort, platforms.join(','), hardware.join(','), systems.join(','), tags.join(','), page]);

  const platformOptions = (filters?.platforms ?? []).map((p) => ({ id: p.id, name: p.name }));
  const hardwareOptions = (filters?.hardware ?? []).map((h) => ({ id: h.id, name: h.name }));
  const systemOptions   = (filters?.systems ?? []).map((s) => ({ id: s.id, name: s.name }));
  const tagOptions      = (filters?.tags ?? []).map((t) => ({ id: t.id, name: t.name }));
  const hasFilters      = q || category || sort || platforms.length || hardware.length || systems.length || tags.length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-8">Browse software</h1>

      <div className="flex gap-8 items-start">
        {/* ── Sidebar filters ── */}
        <aside className="hidden lg:flex flex-col gap-5 w-56 shrink-0 sticky top-24">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Search</label>
            <input
              type="search"
              value={q}
              onChange={(e) => set('q', e.target.value)}
              placeholder="Name or description…"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            />
          </div>
          <FilterSelect label="Sort by"  value={sort}     onChange={(v) => set('sort', v)}     options={SORT_OPTIONS} />
          <FilterSelect label="Category" value={category} onChange={(v) => set('category', v)} options={CATEGORIES} />
          <MultiSelect label="Platform" options={platformOptions} selected={platforms} onChange={(v) => setMulti('platform', v)} />
          <MultiSelect label="System"   options={systemOptions}   selected={systems}   onChange={(v) => setMulti('system', v)} />
          <MultiSelect label="Hardware" options={hardwareOptions} selected={hardware}  onChange={(v) => setMulti('hardware', v)} />
          {tagOptions.length > 0 && (
            <MultiSelect label="Tag" options={tagOptions} selected={tags} onChange={(v) => setMulti('tag', v)} />
          )}
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.push('/browse')}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] underline underline-offset-2 transition-colors text-left"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* ── Mobile filters ── */}
        <div className="lg:hidden w-full mb-4 flex flex-col gap-3">
          <input
            type="search"
            value={q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Search…"
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
          />
          <div className="grid grid-cols-2 gap-3">
            <FilterSelect label="Sort by"  value={sort}     onChange={(v) => set('sort', v)}     options={SORT_OPTIONS} />
            <FilterSelect label="Category" value={category} onChange={(v) => set('category', v)} options={CATEGORIES} />
          </div>
          <MultiSelect label="Platform" options={platformOptions} selected={platforms} onChange={(v) => setMulti('platform', v)} />
          <MultiSelect label="System"   options={systemOptions}   selected={systems}   onChange={(v) => setMulti('system', v)} />
        </div>

        {/* ── Results ── */}
        <div className="flex-1 min-w-0">
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-44 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[var(--color-text-muted)] text-sm">No results found.</p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => router.push('/browse')}
                  className="mt-3 text-sm text-[var(--color-accent)] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                {meta.total} result{meta.total !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((s) => <ListingCard key={s.id} software={s} />)}
              </div>
              {meta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-10">
                  <button
                    type="button"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    Page {page} of {meta.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= meta.totalPages}
                    className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-sm text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-[var(--color-text-muted)]">Loading…</div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
