import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Browse Emulation Software — EmuDB',
  description:
    'Search and filter the full EmuDB catalogue of emulators, frontends, compatibility layers, ROM managers, media scrapers, and more. Filter by category, platform, system, and status.',
  openGraph: {
    title: 'Browse Emulation Software — EmuDB',
    description:
      'Search and filter hundreds of emulation tools across 13 categories, 89+ systems, and all major platforms.',
    url: 'https://emudb.app/browse',
    siteName: 'EmuDB',
  },
};

export default function BrowseLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
