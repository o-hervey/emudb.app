const STYLES: Record<string, { bg: string; text: string }> = {
  COMPANION_APP:       { bg: 'bg-[#FFF0F5] dark:bg-[#3A0A20]',  text: 'text-[#AA2050] dark:text-[#DD7799]' },
  COMPATIBILITY_LAYER: { bg: 'bg-[var(--color-oat)]',            text: 'text-[#5A4A00] dark:text-[#D4B84A]' },
  EMULATOR:            { bg: 'bg-[var(--color-accent-surface)]', text: 'text-[var(--color-accent)]' },
  FRONTEND:            { bg: 'bg-[var(--color-accent-surface)]', text: 'text-[var(--color-accent)]' },
  GAME_STATE_TOOL:     { bg: 'bg-[#E8F8EE] dark:bg-[#0A3A1A]',  text: 'text-[#1A7A40] dark:text-[#5ECC8A]' },
  INPUT_CONTROLLERS:   { bg: 'bg-[#F0F8FF] dark:bg-[#0A2030]',  text: 'text-[#1A5580] dark:text-[#66AADD]' },
  MEDIA_SCRAPER:       { bg: 'bg-[#E8F8EE] dark:bg-[#0A3A1A]',  text: 'text-[#1A7A40] dark:text-[#5ECC8A]' },
  NETPLAY:             { bg: 'bg-[#F5F0FF] dark:bg-[#250A3A]',  text: 'text-[#6030A0] dark:text-[#AA77DD]' },
  OPERATING_SYSTEM:    { bg: 'bg-[#FFF3E8] dark:bg-[#4A2810]',  text: 'text-[#C05A00] dark:text-[var(--color-apricot)]' },
  ROM_MANAGER:         { bg: 'bg-[var(--color-oat)]',            text: 'text-[#5A4A00] dark:text-[#D4B84A]' },
  SHADER:              { bg: 'bg-[#EEF0FF] dark:bg-[#1A1A4A]',  text: 'text-[#3A3AB0] dark:text-[#8888DD]' },
  STREAMING:           { bg: 'bg-[#F5F0FF] dark:bg-[#250A3A]',  text: 'text-[#6030A0] dark:text-[#AA77DD]' },
  UTILITY:             { bg: 'bg-[var(--color-oat)]',            text: 'text-[#5A4A00] dark:text-[#D4B84A]' },
};

const LABELS: Record<string, string> = {
  COMPANION_APP:       'Companion',
  COMPATIBILITY_LAYER: 'Compat Layer',
  EMULATOR:            'Emulator',
  FRONTEND:            'Frontend',
  GAME_STATE_TOOL:     'Game State',
  INPUT_CONTROLLERS:   'Input',
  MEDIA_SCRAPER:       'Media Scraper',
  NETPLAY:             'Netplay',
  OPERATING_SYSTEM:    'OS & CFW',
  ROM_MANAGER:         'ROM Manager',
  SHADER:              'Shader',
  STREAMING:           'Streaming',
  UTILITY:             'Utility',
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
  COMPANION_APP:       '#AA2050',
  COMPATIBILITY_LAYER: '#C4A200',
  EMULATOR:            '#8868F0',
  FRONTEND:            '#8868F0',
  GAME_STATE_TOOL:     '#1A7A40',
  INPUT_CONTROLLERS:   '#1A5580',
  MEDIA_SCRAPER:       '#1A7A40',
  NETPLAY:             '#6030A0',
  OPERATING_SYSTEM:    '#F5822A',
  ROM_MANAGER:         '#C4A200',
  SHADER:              '#3A3AB0',
  STREAMING:           '#6030A0',
  UTILITY:             '#C4A200',
};
