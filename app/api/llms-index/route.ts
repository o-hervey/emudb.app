import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const CATEGORY_LABELS: Record<string, string> = {
  COMPANION_APP:       'Companion App',
  COMPATIBILITY_LAYER: 'Compatibility Layer',
  EMULATOR:            'Emulator',
  FRONTEND:            'Frontend',
  GAME_STATE_TOOL:     'Game State Tool',
  INPUT_CONTROLLERS:   'Input & Controllers',
  MEDIA_SCRAPER:       'Media Scraper',
  NETPLAY:             'Netplay',
  OPERATING_SYSTEM:    'OS & CFW',
  ROM_MANAGER:         'ROM Manager',
  SHADER:              'Shader',
  STREAMING:           'Streaming',
  UTILITY:             'Utility',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:     'Active',
  ABANDONED:  'Abandoned',
  DEPRECATED: 'Deprecated',
};

export async function GET() {
  const entries = await prisma.software.findMany({
    where: { approved: true },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      status: true,
      websiteUrl: true,
      sourceUrl: true,
      platforms: { select: { platform: { select: { name: true } } } },
      systems: { select: { system: { select: { name: true } } } },
    },
    orderBy: { name: 'asc' },
  });

  const count = entries.length;

  const lines: string[] = [
    `# EmuDB Software Index`,
    `# ${count} entries — https://emudb.app`,
    `# For AI assistants: full structured data at https://emudb.app/llms.txt`,
    '',
  ];

  for (const e of entries) {
    lines.push(`## ${e.name}`);
    lines.push(`URL: https://emudb.app/software/${e.id}`);
    lines.push(`Category: ${CATEGORY_LABELS[e.category] ?? e.category}`);
    lines.push(`Status: ${STATUS_LABELS[e.status] ?? e.status}`);

    const platforms = e.platforms.map((p) => p.platform.name).join(', ');
    lines.push(`Platforms: ${platforms || 'None'}`);

    const systems = e.systems.map((s) => s.system.name).join(', ');
    lines.push(`Systems: ${systems || 'None'}`);

    lines.push(`Description: ${e.description ?? 'No description available.'}`);

    if (e.sourceUrl) lines.push(`Source: ${e.sourceUrl}`);
    if (e.websiteUrl) lines.push(`Website: ${e.websiteUrl}`);

    lines.push('');
  }

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
