import Link from 'next/link';
import type { SoftwareListing } from '@/types';
import { CategoryBadge, CATEGORY_ICON_COLORS } from './CategoryBadge';
import { StarRating } from './StarRating';

function SoftwareIcon({ name, category }: { name: string; category: string }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  const color = CATEGORY_ICON_COLORS[category] ?? '#8868F0';

  return (
    <div
      className="flex items-center justify-center rounded-lg text-white text-sm font-bold shrink-0"
      style={{ width: 40, height: 40, backgroundColor: color }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}

export function ListingCard({ software }: { software: SoftwareListing }) {
  return (
    <Link
      href={`/software/${software.id}`}
      className="group flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm hover:border-[var(--color-accent)] hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        <SoftwareIcon name={software.name} category={software.category} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--color-text)] text-sm leading-snug line-clamp-1 group-hover:text-[var(--color-accent)] transition-colors">
            {software.name}
          </p>
          <div className="mt-0.5">
            <CategoryBadge category={software.category} />
          </div>
        </div>
      </div>

      {software.description && (
        <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
          {software.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1">
        {software.platforms.slice(0, 3).map((p) => (
          <span
            key={p.id}
            className="text-xs bg-[var(--color-surface-raised)] text-[var(--color-text-muted)] rounded-full px-2 py-0.5"
          >
            {p.name}
          </span>
        ))}
        {software.platforms.length > 3 && (
          <span className="text-xs text-[var(--color-text-muted)]">
            +{software.platforms.length - 3}
          </span>
        )}
      </div>

      <StarRating score={software.avgQuality} count={software.ratingCount} />
    </Link>
  );
}
