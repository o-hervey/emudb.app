'use client';

import { useId, useState } from 'react';

function Star({ filled, half }: { filled: boolean; half?: boolean }) {
  const gradientId = useId();

  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill={filled ? 'var(--color-accent)' : 'none'}
      stroke="var(--color-accent)"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {half ? (
        <>
          <defs>
            <linearGradient id={gradientId}>
              <stop offset="50%" stopColor="var(--color-accent)" />
              <stop offset="50%" stopColor="transparent" />
            </linearGradient>
          </defs>
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={`url(#${gradientId})`}
            stroke="var(--color-accent)"
          />
        </>
      ) : (
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      )}
    </svg>
  );
}

export function StarRating({ score, count }: { score: number | null; count?: number }) {
  if (score === null) {
    return <span className="text-xs text-[var(--color-text-muted)]">Be the first to rate</span>;
  }
  const rounded = Math.round(score * 2) / 2;
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} filled={i <= Math.floor(rounded)} half={i - 0.5 === rounded} />
        ))}
      </span>
      <span className="text-xs text-[var(--color-text-muted)]">
        {score.toFixed(1)}{count !== undefined ? ` (${count})` : ''}
      </span>
    </span>
  );
}

export function StarInput({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value ?? 0;

  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          onMouseEnter={() => setHovered(i)}
          aria-label={`Rate ${i} star${i !== 1 ? 's' : ''}`}
          className="p-0.5 rounded transition-transform hover:scale-110"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={display >= i ? 'var(--color-accent)' : 'none'}
            stroke="var(--color-accent)"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
          </svg>
        </button>
      ))}
    </div>
  );
}

export function StarBreakdown({
  ratings,
}: {
  ratings: { qualityScore: number | null }[];
}) {
  const scored = ratings.filter((r) => r.qualityScore !== null);
  const total = scored.length;
  if (total === 0) return null;

  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: scored.filter((r) => r.qualityScore === star).length,
  }));

  return (
    <div className="space-y-1.5">
      {counts.map(({ star, count }) => {
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-text-muted)] w-4 text-right">{star}</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="var(--color-accent)" aria-hidden="true">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
            <div className="flex-1 h-1.5 rounded-full bg-[var(--color-surface-raised)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-xs text-[var(--color-text-muted)] w-5">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
