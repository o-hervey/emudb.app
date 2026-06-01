import Link from 'next/link';

const CATEGORIES = [
  {
    value: 'EMULATOR',
    label: 'Emulators',
    description: 'Software that mimics another system\'s hardware to run its software.',
    color: '#8868F0',
  },
  {
    value: 'FRONTEND',
    label: 'Frontends & Launchers',
    description: 'Unified interfaces for managing and launching emulators and ROMs.',
    color: '#8868F0',
  },
  {
    value: 'OPERATING_SYSTEM',
    label: 'Operating Systems',
    description: 'Full OS distributions built around emulation, often for handhelds.',
    color: '#F5822A',
  },
  {
    value: 'COMPATIBILITY_LAYER',
    label: 'Compatibility Layers',
    description: 'Tools that translate one platform\'s instructions for another (e.g. Wine).',
    color: '#C4A200',
  },
  {
    value: 'UTILITY',
    label: 'Utilities',
    description: 'Supporting tools — ROM managers, patchers, save editors, and more.',
    color: '#C4A200',
  },
  {
    value: 'SCRAPER',
    label: 'Scrapers',
    description: 'Tools that fetch artwork, metadata, and game info for your library.',
    color: '#1A7A40',
  },
  {
    value: 'SHADER',
    label: 'Shaders & Filters',
    description: 'GPU shaders and CRT filter packs to enhance the visual output.',
    color: '#3A3AB0',
  },
  {
    value: 'COMPANION_APP',
    label: 'Companion Apps',
    description: 'Apps that extend or complement an emulator\'s functionality.',
    color: '#AA2050',
  },
  {
    value: 'INPUT_CONTROLLERS',
    label: 'Input & Controllers',
    description: 'Drivers, mappers, and tools for controller support.',
    color: '#1A5580',
  },
  {
    value: 'STREAMING',
    label: 'Streaming',
    description: 'Stream games from one device to another over a network.',
    color: '#6030A0',
  },
];

export default function CategoriesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Categories</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-10">
        Browse the directory by software type.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={`/browse?category=${cat.value}`}
            className="group flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:border-[var(--color-accent)] hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
                style={{ backgroundColor: `${cat.color}22` }}
                aria-hidden="true"
              >
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: cat.color }} />
              </div>
              <h2 className="text-sm font-semibold text-[var(--color-text)] group-hover:text-[var(--color-accent)] transition-colors">
                {cat.label}
              </h2>
            </div>
            <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
              {cat.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
