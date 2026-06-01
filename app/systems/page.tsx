'use client';

import { useFilters } from '@/components/FiltersContext';
import Link from 'next/link';

const TYPE_ORDER = ['home console', 'handheld', 'arcade', 'computer', 'other'];

const TYPE_LABELS: Record<string, string> = {
  'home console': 'Home Consoles',
  'handheld':     'Handhelds',
  'arcade':       'Arcade',
  'computer':     'Computers',
  'other':        'Other',
};

export default function SystemsPage() {
  const { filters, loading } = useFilters();

  const grouped: Record<string, NonNullable<typeof filters>['systems']> = {};
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Systems</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-10">
        Browse the directory by the system being emulated.
      </p>

      {loading ? (
        <div className="space-y-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-5 w-32 rounded bg-[var(--color-surface)] animate-pulse mb-4" />
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }).map((_, j) => (
                  <div key={j} className="h-8 w-28 rounded-full bg-[var(--color-surface)] animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : orderedGroups.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">
          No systems found. The database may still need seeding.
        </p>
      ) : (
        <div className="space-y-10">
          {orderedGroups.map((type) => (
            <section key={type}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                {TYPE_LABELS[type] ?? type}
              </h2>
              <div className="flex flex-wrap gap-2">
                {(grouped[type] ?? []).map((system) => (
                  <Link
                    key={system.id}
                    href={`/browse?system=${system.id}`}
                    className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {system.name}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
