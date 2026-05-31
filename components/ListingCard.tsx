import Link from 'next/link';
import type { SoftwareListing } from '@/types';
import { CategoryBadge } from './CategoryBadge';
import { StarRating } from './StarRating';

export function ListingCard({ software }: { software: SoftwareListing }) {
  return (
    <Link
      href={`/software/${software.id}`}
      className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-zinc-600 hover:bg-zinc-800/60 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="font-semibold text-zinc-100 text-sm leading-snug line-clamp-1">{software.name}</span>
        <CategoryBadge category={software.category} />
      </div>
      {software.description && (
        <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">{software.description}</p>
      )}
      <div className="flex flex-wrap gap-1 mb-3">
        {software.platforms.slice(0, 4).map((p) => (
          <span key={p.id} className="text-xs bg-zinc-800 text-zinc-400 rounded px-1.5 py-0.5">
            {p.name}
          </span>
        ))}
        {software.platforms.length > 4 && (
          <span className="text-xs text-zinc-600">+{software.platforms.length - 4}</span>
        )}
      </div>
      <StarRating score={software.avgQuality} count={software.ratingCount} />
    </Link>
  );
}
