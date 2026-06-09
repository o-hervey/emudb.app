import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gaming Systems — EmuDB',
  description:
    'Browse the gaming systems indexed in EmuDB — home consoles, handhelds, arcade boards, and home computers — with links to compatible emulators for each.',
  openGraph: {
    title: 'Gaming Systems — EmuDB',
    description:
      'Home consoles, handhelds, arcade boards, and home computers — browse 89+ systems with compatible emulator listings.',
    url: 'https://emudb.app/systems',
    siteName: 'EmuDB',
  },
};

export default function SystemsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
