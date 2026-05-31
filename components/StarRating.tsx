export function StarRating({ score, count }: { score: number | null; count?: number }) {
  if (score === null) {
    return <span className="text-xs text-zinc-500">No ratings</span>;
  }
  const filled = Math.round(score);
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-yellow-400 tracking-tight">
        {[1, 2, 3, 4, 5].map((i) => (i <= filled ? '★' : '☆')).join('')}
      </span>
      <span className="text-xs text-zinc-400">
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
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className={`text-2xl transition-colors ${(value ?? 0) >= i ? 'text-yellow-400' : 'text-zinc-600'} hover:text-yellow-300`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
