'use client';

import { ListingCard } from '@/components/ListingCard';
import { useFilters } from '@/components/FiltersContext';
import type { PaginatedResponse, SoftwareListing } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const CATEGORIES = [
  { value: 'EMULATOR', label: 'Emulator' },
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'OPERATING_SYSTEM', label: 'Operating System' },
  { value: 'COMPATIBILITY_LAYER', label: 'Compatibility Layer' },
  { value: 'UTILITY', label: 'Utility' },
  { value: 'SCRAPER', label: 'Scraper' },
  { value: 'SHADER', label: 'Shader' },
  { value: 'COMPANION_APP', label: 'Companion App' },
  { value: 'INPUT_CONTROLLERS', label: 'Input Controllers' },
  { value: 'STREAMING', label: 'Streaming' },
];

function Select({
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
      <label className="block text-xs text-zinc-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-indigo-500 focus:outline-none transition-colors"
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

  const q        = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const platform = searchParams.get('platform') ?? '';
  const hardware = searchParams.get('hardware') ?? '';
  const system   = searchParams.get('system') ?? '';
  const tag      = searchParams.get('tag') ?? '';
  const page     = parseInt(searchParams.get('page') ?? '1', 10);

  function update(key: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    if (value) { p.set(key, value); } else { p.delete(key); }
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
    if (q)        p.set('q', q);
    if (category) p.set('category', category);
    if (platform) p.set('platform', platform);
    if (hardware) p.set('hardware', hardware);
    if (system)   p.set('system', system);
    if (tag)      p.set('tag', tag);
    p.set('page', String(page));

    fetch(`/api/software?${p.toString()}`)
      .then((r) => r.json())
      .then((json: PaginatedResponse<SoftwareListing>) => {
        setResults(json.data ?? []);
        setMeta(json.meta);
      })
      .catch(() => setError('Failed to load results.'))
      .finally(() => setLoading(false));
  }, [q, category, platform, hardware, system, tag, page]);

  const platformOptions  = (filters?.platforms ?? []).map((p) => ({ value: p.id, label: p.name }));
  const hardwareOptions  = (filters?.hardware ?? []).map((h) => ({ value: h.id, label: h.name }));
  const systemOptions    = (filters?.systems ?? []).map((s) => ({ value: s.id, label: s.name }));
  const tagOptions       = (filters?.tags ?? []).map((t) => ({ value: t.id, label: t.name }));

  const hasFilters = q || category || platform || hardware || system || tag;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-100 mb-4">Browse Software</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="col-span-2 sm:col-span-3 lg:col-span-2">
            <label className="block text-xs text-zinc-500 mb-1">Search</label>
            <input
              type="search"
              value={q}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Name or description…"
              className="w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none transition-colors"
            />
          </div>
          <Select label="Category" value={category} onChange={(v) => update('category', v)} options={CATEGORIES} />
          <Select label="Platform" value={platform} onChange={(v) => update('platform', v)} options={platformOptions} />
          <Select label="Hardware" value={hardware} onChange={(v) => update('hardware', v)} options={hardwareOptions} />
          <Select label="System" value={system} onChange={(v) => update('system', v)} options={systemOptions} />
        </div>
        {tagOptions.length > 0 && (
          <div className="mt-3 max-w-xs">
            <Select label="Tag" value={tag} onChange={(v) => update('tag', v)} options={tagOptions} />
          </div>
        )}
        {hasFilters && (
          <button
            onClick={() => router.push('/browse')}
            className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-400">{error}</p>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-36 rounded-lg bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-zinc-400 text-sm">No results found.</p>
          {hasFilters && (
            <button onClick={() => router.push('/browse')} className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 underline">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-zinc-500 mb-4">{meta.total} result{meta.total !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((s) => <ListingCard key={s.id} software={s} />)}
          </div>
          {meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 rounded border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-zinc-400">Page {page} of {meta.totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= meta.totalPages}
                className="px-4 py-2 rounded border border-zinc-700 text-sm text-zinc-300 hover:border-zinc-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8 text-zinc-400 text-sm">Loading…</div>}>
      <BrowseContent />
    </Suspense>
  );
}
