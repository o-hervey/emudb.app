const COLORS: Record<string, string> = {
  EMULATOR:            'bg-blue-500/15 text-blue-400',
  FRONTEND:            'bg-violet-500/15 text-violet-400',
  OPERATING_SYSTEM:    'bg-orange-500/15 text-orange-400',
  COMPATIBILITY_LAYER: 'bg-green-500/15 text-green-400',
  UTILITY:             'bg-yellow-500/15 text-yellow-400',
  SCRAPER:             'bg-pink-500/15 text-pink-400',
  SHADER:              'bg-cyan-500/15 text-cyan-400',
  COMPANION_APP:       'bg-red-500/15 text-red-400',
  INPUT_CONTROLLERS:   'bg-teal-500/15 text-teal-400',
  STREAMING:           'bg-purple-500/15 text-purple-400',
};

const LABELS: Record<string, string> = {
  EMULATOR:            'Emulator',
  FRONTEND:            'Frontend',
  OPERATING_SYSTEM:    'OS',
  COMPATIBILITY_LAYER: 'Compat Layer',
  UTILITY:             'Utility',
  SCRAPER:             'Scraper',
  SHADER:              'Shader',
  COMPANION_APP:       'Companion',
  INPUT_CONTROLLERS:   'Input',
  STREAMING:           'Streaming',
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${COLORS[category] ?? 'bg-zinc-700 text-zinc-400'}`}>
      {LABELS[category] ?? category}
    </span>
  );
}
