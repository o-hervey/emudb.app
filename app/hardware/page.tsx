'use client';

import { useFilters } from '@/components/FiltersContext';
import type { Hardware } from '@/types';
import Link from 'next/link';

const GROUP_LABELS: Record<string, string> = {
  CONSOLE: 'Console',
  LINUX:   'Linux',
  MACOS:   'macOS',
  MOBILE:  'Mobile',
  WINDOWS: 'Windows',
  OTHER:   'Other',
};

function groupOrder(group: string): number {
  if (group === 'OTHER') return 999;
  return (GROUP_LABELS[group] ?? group).charCodeAt(0);
}

function HardwareCard({ device }: { device: Hardware }) {
  return (
    <Link
      href={`/browse?hardware=${device.id}`}
      className="group flex flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 hover:border-[var(--color-accent)] transition-colors"
    >
      <p className="text-sm font-medium text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors line-clamp-2">
        {device.name}
      </p>
      {device.manufacturer && (
        <p className="text-xs text-[var(--color-text-muted)]">{device.manufacturer}</p>
      )}
    </Link>
  );
}

export default function HardwarePage() {
  const { filters, loading } = useFilters();

  const grouped: Record<string, Hardware[]> = {};
  for (const device of filters?.hardware ?? []) {
    const g = device.platformGroup ?? 'OTHER';
    if (!grouped[g]) grouped[g] = [];
    grouped[g].push(device);
  }

  const orderedGroups = Object.keys(grouped).sort((a, b) => groupOrder(a) - groupOrder(b));

  for (const g of orderedGroups) {
    grouped[g].sort((a, b) => {
      const mfr = (a.manufacturer ?? '').localeCompare(b.manufacturer ?? '');
      return mfr !== 0 ? mfr : a.name.localeCompare(b.name);
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Hardware</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-10">
        Browse the directory by device. Select a device to see compatible software.
      </p>

      {loading ? (
        <div className="space-y-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-28 rounded bg-[var(--color-surface)] animate-pulse mb-5" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className="h-16 rounded-xl bg-[var(--color-surface)] animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : orderedGroups.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">No hardware found.</p>
      ) : (
        <div className="space-y-12">
          {orderedGroups.map((group) => (
            <section key={group}>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                {GROUP_LABELS[group] ?? group}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {grouped[group].map((device) => (
                  <HardwareCard key={device.id} device={device} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
