'use client';

import { useFilters } from '@/components/FiltersContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const TYPE_ORDER = ['home console', 'handheld', 'arcade', 'computer', 'other'];

const TYPE_LABELS: Record<string, string> = {
  'home console': 'Home Consoles',
  'handheld':     'Handhelds',
  'arcade':       'Arcade',
  'computer':     'Computers',
  'other':        'Other',
};

interface SystemItem {
  id: string;
  name: string;
  type: string;
}

function SystemCard({ system, logoUrl }: { system: SystemItem; logoUrl?: string }) {
  return (
    <Link
      href={`/browse?system=${system.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-accent)] transition-colors"
    >
      <div className="flex items-center justify-center min-h-[72px] px-4 py-4">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={system.name}
            className="max-h-14 w-full object-contain"
          />
        ) : (
          <span className="text-sm font-semibold text-center leading-snug text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors px-1">
            {system.name}
          </span>
        )}
      </div>
      {logoUrl && (
        <div className="border-t border-[var(--color-border)] px-3 py-2">
          <span className="block text-xs font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors truncate">
            {system.name}
          </span>
        </div>
      )}
    </Link>
  );
}

export default function SystemsPage() {
  const { filters, loading: filtersLoading } = useFilters();
  const [logos, setLogos] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/systems/images')
      .then((r) => r.ok ? r.json() : {})
      .then((data: Record<string, string>) => setLogos(data))
      .catch(() => {});
  }, []);

  const grouped: Record<string, SystemItem[]> = {};
  for (const system of filters?.systems ?? []) {
    const key = system.type.toLowerCase();
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(system);
  }

  const orderedGroups = [
    ...TYPE_ORDER.filter((t) => grouped[t]),
    ...Object.keys(grouped).filter((k) => !TYPE_ORDER.includes(k)),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Systems</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-10">
        Browse the directory by the system being emulated.
      </p>

      {filtersLoading ? (
        <div className="space-y-10">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-32 rounded bg-[var(--color-surface)] animate-pulse mb-5" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className="h-24 rounded-xl bg-[var(--color-surface)] animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : orderedGroups.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No systems found.</p>
      ) : (
        <div className="space-y-12">
          {orderedGroups.map((type) => (
            <section key={type}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                {TYPE_LABELS[type] ?? type}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {(grouped[type] ?? []).map((system) => (
                  <SystemCard key={system.id} system={system} logoUrl={logos[system.id]} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
