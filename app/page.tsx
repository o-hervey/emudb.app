'use client';

import { CollectionsRow } from '@/components/CollectionsRow';
import { ListingCard } from '@/components/ListingCard';
import { TrendingCard } from '@/components/TrendingCard';
import type { PaginatedResponse, SoftwareListing } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
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

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="flex items-baseline justify-between mb-4">
      <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
      {href && (
        <Link href={href} className="text-sm text-[var(--color-accent)] hover:underline">
          See all
        </Link>
      )}
    </div>
  );
}

function TrendingRow() {
  const { data, loading } = useListings('recent');
  return (
    <section>
      <SectionHeader title="Trending this week" href="/browse" />
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="w-44 h-40 shrink-0 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-4">No listings yet.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {data.map((s) => <TrendingCard key={s.id} software={s} />)}
        </div>
      )}
    </section>
  );
}

function ListRow({ title, sort, href }: { title: string; sort: string; href: string }) {
  const { data, loading } = useListings(sort);
  return (
    <section>
      <SectionHeader title={title} href={href} />
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="min-w-52 h-44 shrink-0 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] py-4">No listings yet.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {data.map((s) => (
            <div key={s.id} className="min-w-52 max-w-52 shrink-0">
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
    <div>
      {/* Hero */}
      <section className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 flex items-center justify-between gap-8">
          <div className="max-w-xl">
            <h1 className="text-4xl sm:text-5xl font-bold text-[var(--color-text)] leading-tight mb-5">
              Discover the best emulators, frontends, OS and tools.
            </h1>
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search software…"
                className="flex-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-accent)] focus:outline-none transition-colors"
              />
              <Link
                href="/browse"
                className="px-5 py-3 rounded-lg bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors whitespace-nowrap"
              >
                Browse all
              </Link>
            </form>
          </div>
          <div className="hidden md:block shrink-0" aria-hidden="true">
            <Image
              src="/logo.png"
              alt=""
              width={200}
              height={200}
              className="opacity-90 drop-shadow-lg"
              priority
            />
          </div>
        </div>
      </section>

      {/* Content rows */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-12">
        <TrendingRow />
        <ListRow title="Recently added" sort="recent" href="/browse?sort=recent" />
        <ListRow title="Top rated" sort="top_rated" href="/browse?sort=top_rated" />
        <CollectionsRow />
      </div>
    </div>
  );
}
