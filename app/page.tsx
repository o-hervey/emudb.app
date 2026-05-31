'use client';

import { ListingCard } from '@/components/ListingCard';
import type { PaginatedResponse, SoftwareListing } from '@/types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function useListings(sort: string) {
  const [data, setData] = useState<SoftwareListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/software?sort=${sort}&page=1`)
      .then((r) => r.json())
      .then((json: PaginatedResponse<SoftwareListing>) => setData(json.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sort]);

  return { data, loading };
}

function HorizontalRow({ title, sort }: { title: string; sort: string }) {
  const { data, loading } = useListings(sort);

  return (
    <section>
      <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">{title}</h2>
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-56 h-36 rounded-lg bg-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-zinc-500 py-4">No listings yet.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {data.map((s) => (
            <div key={s.id} className="min-w-56 max-w-56">
              <ListingCard software={s} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/browse?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-10">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">Emulation Software Directory</h1>
        <p className="text-sm text-zinc-400 mb-6">
          A community-maintained index of emulators, frontends, operating systems, and tools. No guides, no ROMs — just software.
        </p>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search software…"
            className="flex-1 rounded border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            className="px-5 py-2.5 rounded bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      <HorizontalRow title="Recently Added" sort="recent" />
      <HorizontalRow title="Top Rated" sort="top_rated" />
    </div>
  );
}
