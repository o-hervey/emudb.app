import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hardware Devices — EmuDB',
  description:
    'Browse the hardware devices indexed in EmuDB — consoles, handhelds, PCs, and single-board computers — with emulation compatibility data and community performance ratings.',
  openGraph: {
    title: 'Hardware Devices — EmuDB',
    description:
      'Consoles, handhelds, PCs, and single-board computers with emulation compatibility data across 171+ devices.',
    url: 'https://emudb.app/hardware',
    siteName: 'EmuDB',
  },
};

export default function HardwareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
