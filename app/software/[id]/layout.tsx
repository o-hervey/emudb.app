import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

const BASE_URL = 'https://emudb.app';

const CATEGORY_LABELS: Record<string, string> = {
  COMPANION_APP: 'Companion App',
  COMPATIBILITY_LAYER: 'Compatibility Layer',
  EMULATOR: 'Emulator',
  FRONTEND: 'Frontend',
  GAME_STATE_TOOL: 'Game State Tool',
  INPUT_CONTROLLERS: 'Input & Controllers',
  MEDIA_SCRAPER: 'Media Scraper',
  NETPLAY: 'Netplay',
  OPERATING_SYSTEM: 'OS & CFW',
  ROM_MANAGER: 'ROM Manager',
  SHADER: 'Shader',
  STREAMING: 'Streaming',
  UTILITY: 'Utility',
};

async function getSoftwareMeta(id: string) {
  return prisma.software.findUnique({
    where: { id, approved: true },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      websiteUrl: true,
      sourceUrl: true,
      avgQuality: true,
      platforms: { select: { platform: { select: { name: true } } } },
      qualityRatings: { select: { id: true } },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sw = await getSoftwareMeta(id);
  if (!sw) return { title: 'Software not found — EmuDB' };

  const category = CATEGORY_LABELS[sw.category] ?? sw.category;
  const description = sw.description
    ? sw.description.slice(0, 160)
    : `${sw.name} is a ${category} in the EmuDB emulation software directory.`;

  return {
    title: `${sw.name} — ${category} | EmuDB`,
    description,
    openGraph: {
      title: `${sw.name} — EmuDB`,
      description,
      url: `${BASE_URL}/software/${sw.id}`,
      siteName: 'EmuDB',
      type: 'website',
    },
  };
}

export default async function SoftwareLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const sw = await getSoftwareMeta(id);

  if (!sw) {
    return <>{children}</>;
  }

  const category = CATEGORY_LABELS[sw.category] ?? sw.category;
  const platformNames = sw.platforms.map((p) => p.platform.name);
  const ratingCount = sw.qualityRatings.length;
  const sameAs = [sw.websiteUrl, sw.sourceUrl].filter(Boolean) as string[];

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: sw.name,
    applicationCategory: category,
    url: `${BASE_URL}/software/${sw.id}`,
    ...(sw.description && { description: sw.description }),
    ...(platformNames.length > 0 && { operatingSystem: platformNames.join(', ') }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(ratingCount > 0 &&
      sw.avgQuality !== null && {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Math.round(sw.avgQuality * 10) / 10,
          ratingCount,
          bestRating: 5,
          worstRating: 1,
        },
      }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e') }}
      />
      {children}
    </>
  );
}
