import Link from 'next/link';
import type { SoftwareListing } from '@/types';
import { CATEGORY_ICON_COLORS } from './CategoryBadge';
import { StarRating } from './StarRating';

export function TrendingCard({ software }: { software: SoftwareListing }) {
  const color = CATEGORY_ICON_COLORS[software.category] ?? '#8868F0';
  const initials = software.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <Link
      href={`/software/${software.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 w-44 shrink-0 hover:border-[var(--color-accent)] hover:shadow-md transition-all"
    >
      <div
        className="flex items-center justify-center rounded-xl text-white text-xl font-bold"
        style={{ height: 72, backgroundColor: color }}
        aria-hidden="true"
      >
        {initials}
      </div>
      <div>
        <p className="font-semibold text-sm text-[var(--color-text)] line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
          {software.name}
        </p>
        <div className="mt-1">
          <StarRating score={software.avgQuality} count={software.ratingCount} />
        </div>
      </div>
    </Link>
  );
}
