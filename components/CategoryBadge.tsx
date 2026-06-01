const STYLES: Record<string, { bg: string; text: string }> = {
  EMULATOR:            { bg: 'bg-[var(--color-accent-surface)]', text: 'text-[var(--color-accent)]' },
  FRONTEND:            { bg: 'bg-[var(--color-accent-surface)]', text: 'text-[var(--color-accent)]' },
  OPERATING_SYSTEM:    { bg: 'bg-[#FFF3E8] dark:bg-[#4A2810]',  text: 'text-[#C05A00] dark:text-[var(--color-apricot)]' },
  COMPATIBILITY_LAYER: { bg: 'bg-[var(--color-oat)]',            text: 'text-[#5A4A00] dark:text-[#D4B84A]' },
  UTILITY:             { bg: 'bg-[var(--color-oat)]',            text: 'text-[#5A4A00] dark:text-[#D4B84A]' },
  SCRAPER:             { bg: 'bg-[#E8F8EE] dark:bg-[#0A3A1A]',  text: 'text-[#1A7A40] dark:text-[#5ECC8A]' },
  SHADER:              { bg: 'bg-[#EEF0FF] dark:bg-[#1A1A4A]',  text: 'text-[#3A3AB0] dark:text-[#8888DD]' },
  COMPANION_APP:       { bg: 'bg-[#FFF0F5] dark:bg-[#3A0A20]',  text: 'text-[#AA2050] dark:text-[#DD7799]' },
  INPUT_CONTROLLERS:   { bg: 'bg-[#F0F8FF] dark:bg-[#0A2030]',  text: 'text-[#1A5580] dark:text-[#66AADD]' },
  STREAMING:           { bg: 'bg-[#F5F0FF] dark:bg-[#250A3A]',  text: 'text-[#6030A0] dark:text-[#AA77DD]' },
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

const FALLBACK = { bg: 'bg-[var(--color-surface-raised)]', text: 'text-[var(--color-text-muted)]' };

export function CategoryBadge({ category }: { category: string }) {
  const { bg, text } = STYLES[category] ?? FALLBACK;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${bg} ${text}`}>
      {LABELS[category] ?? category}
    </span>
  );
}

/** Map from category key to a hex colour used for placeholder icons */
export const CATEGORY_ICON_COLORS: Record<string, string> = {
  EMULATOR:            '#8868F0',
  FRONTEND:            '#8868F0',
  OPERATING_SYSTEM:    '#F5822A',
  COMPATIBILITY_LAYER: '#C4A200',
  UTILITY:             '#C4A200',
  SCRAPER:             '#1A7A40',
  SHADER:              '#3A3AB0',
  COMPANION_APP:       '#AA2050',
  INPUT_CONTROLLERS:   '#1A5580',
  STREAMING:           '#6030A0',
};
