'use client';

import { useFilters } from '@/components/FiltersContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const CATEGORIES = [
  { value: 'COMPANION_APP',       label: 'Companion App' },
  { value: 'COMPATIBILITY_LAYER', label: 'Compatibility Layer' },
  { value: 'EMULATOR',            label: 'Emulator' },
  { value: 'FRONTEND',            label: 'Frontend' },
  { value: 'GAME_STATE_TOOL',     label: 'Game State Tool' },
  { value: 'INPUT_CONTROLLERS',   label: 'Input & Controllers' },
  { value: 'MEDIA_SCRAPER',       label: 'Media Scraper' },
  { value: 'NETPLAY',             label: 'Netplay' },
  { value: 'OPERATING_SYSTEM',    label: 'OS & CFW' },
  { value: 'ROM_MANAGER',         label: 'ROM Manager' },
  { value: 'SHADER',              label: 'Shader' },
  { value: 'STREAMING',           label: 'Streaming' },
  { value: 'UTILITY',             label: 'Utility' },
];

const SORT_OPTIONS = [
  { value: 'saved',   label: 'Most saved' },
  { value: 'cloned',  label: 'Most cloned' },
  { value: 'newest',  label: 'Newest' },
];

interface ListSummary {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  entryCount: number;
  saveCount: number;
  cloneCount: number;
}

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
  return (
    <div>
      <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">{label}</label>
      <select
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

function ListCard({ list }: { list: ListSummary }) {
  return (
    <Link
      href={`/lists/${list.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)] transition-colors"
    >
      <h2 className="font-semibold text-sm text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors leading-snug line-clamp-2">
        {list.name}
      </h2>
      {list.description && (
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-3 flex-1">
          {list.description}
        </p>
      )}
      <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] mt-auto pt-1">
        <span>{list.entryCount} item{list.entryCount !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{list.saveCount} save{list.saveCount !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{list.cloneCount} clone{list.cloneCount !== 1 ? 's' : ''}</span>
      </div>
    </Link>
  );
}

function ListsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { filters } = useFilters();

  const [results, setResults] = useState<ListSummary[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const q        = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const platform = searchParams.get('platform') ?? '';
  const hardware = searchParams.get('hardware') ?? '';
  const system   = searchParams.get('system') ?? '';
  const sort     = searchParams.get('sort') ?? '';
  const page     = parseInt(searchParams.get('page') ?? '1', 10);

  function update(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) { p.set(key, value); } else { p.delete(key); }
    p.delete('page');
    router.push(`/lists?${p.toString()}`);
  }

  function setPage(n: number) {
    const p = new URLSearchParams(searchParams.toString());
    p.set('page', String(n));
    router.push(`/lists?${p.toString()}`);
  }

  useEffect(() => {
    setLoading(true);
    setError('');
    const p = new URLSearchParams();
    if (q)        p.set('q', q);
    if (category) p.set('category', category);
    if (platform) p.set('platform', platform);
    if (hardware) p.set('hardware', hardware);
    if (system)   p.set('system', system);
    if (sort)     p.set('sort', sort);
    p.set('page', String(page));

    fetch(`/api/lists?${p.toString()}`)
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? 'Failed to load lists.');
        return json;
      })
      .then((json) => {
        setResults(json.data ?? []);
        setMeta(json.meta ?? { page: 1, totalPages: 1, total: 0 });
      })
      .catch((err: Error) => setError(err.message || 'Failed to load lists.'))
      .finally(() => setLoading(false));
  }, [q, category, platform, hardware, system, sort, page]);

  const platformOptions = (filters?.platforms ?? []).map((p) => ({ value: p.id, label: p.name }));
  const hardwareOptions = (filters?.hardware ?? []).map((h) => ({ value: h.id, label: h.name }));
  const systemOptions   = (filters?.systems ?? []).map((s) => ({ value: s.id, label: s.name }));
  const hasFilters      = q || category || platform || hardware || system || sort;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-8">Browse lists</h1>

      <div className="flex gap-8 items-start">
        {/* Sidebar filters */}
        <aside className="hidden lg:flex flex-col gap-5 w-56 shrink-0 sticky top-24">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5">Search</label>
            <input
              type="search"
              value={q}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Name or description…"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            />
          </div>
          <FilterSelect label="Sort by"   value={sort}     onChange={(v) => update('sort', v)}     options={SORT_OPTIONS} />
          <FilterSelect label="Category"  value={category} onChange={(v) => update('category', v)} options={CATEGORIES} />
          <FilterSelect label="Platform"  value={platform} onChange={(v) => update('platform', v)} options={platformOptions} />
          <FilterSelect label="System"    value={system}   onChange={(v) => update('system', v)}   options={systemOptions} />
          <FilterSelect label="Hardware"  value={hardware} onChange={(v) => update('hardware', v)} options={hardwareOptions} />
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.push('/lists')}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] underline underline-offset-2 transition-colors text-left"
            >
              Clear all filters
            </button>
          )}
        </aside>

        {/* Mobile filters */}
        <div className="lg:hidden w-full mb-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="col-span-2 sm:col-span-3">
            <input
              type="search"
              value={q}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Search lists…"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
            />
          </div>
          <FilterSelect label="Sort by"  value={sort}     onChange={(v) => update('sort', v)}     options={SORT_OPTIONS} />
          <FilterSelect label="Category" value={category} onChange={(v) => update('category', v)} options={CATEGORIES} />
          <FilterSelect label="Platform" value={platform} onChange={(v) => update('platform', v)} options={platformOptions} />
          <FilterSelect label="System"   value={system}   onChange={(v) => update('system', v)}   options={systemOptions} />
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          {error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-36 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-[var(--color-text-muted)] text-sm">No lists found.</p>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => router.push('/lists')}
                  className="mt-3 text-sm text-[var(--color-accent)] hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                {meta.total} list{meta.total !== 1 ? 's' : ''}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((list) => <ListCard key={list.id} list={list} />)}
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

export default function ListsPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-[var(--color-text-muted)]">Loading…</div>
    }>
      <ListsContent />
    </Suspense>
  );
}
