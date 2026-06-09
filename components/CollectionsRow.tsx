'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ListSummary {
  id: string;
  name: string;
  description: string | null;
  entryCount: number;
  saveCount: number;
  cloneCount: number;
}

function CollectionCard({ list }: { list: ListSummary }) {
  return (
    <Link
      href={`/lists/${list.id}`}
      className="group flex flex-col gap-2 min-w-56 max-w-56 shrink-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-accent)] transition-colors"
    >
      <span className="font-semibold text-sm text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors leading-snug line-clamp-2">
        {list.name}
      </span>
      {list.description && (
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2 flex-1">
          {list.description}
        </p>
      )}
      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mt-auto pt-1">
        <span>{list.entryCount} item{list.entryCount !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{list.saveCount} save{list.saveCount !== 1 ? 's' : ''}</span>
      </div>
    </Link>
  );
}

export function CollectionsRow() {
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/lists?sort=saved&page=1')
      .then(async (r) => {
        const json = await r.json();
        if (!r.ok) throw new Error(json.error ?? 'Failed to load lists.');
        return json;
      })
      .then((json) => setLists((json.data ?? []).slice(0, 4)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && lists.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-semibold text-[var(--color-text)]">Top community lists</h2>
        <Link href="/lists" className="text-sm text-[var(--color-accent)] hover:underline">
          See all
        </Link>
      </div>
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="min-w-56 h-28 shrink-0 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
          {lists.map((list) => <CollectionCard key={list.id} list={list} />)}
        </div>
      )}
    </section>
  );
}
