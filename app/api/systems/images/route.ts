import { queryIGDB } from '@/lib/igdb';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const revalidate = 86400; // re-fetch from IGDB once per day

interface IGDBPlatform {
  id: number;
  name: string;
  platform_logo?: { url: string };
}

// Maps EmuDB system names (lowercase) to IGDB platform names (lowercase).
// Only needed when names differ — exact matches are found automatically.
const ALIASES: Record<string, string> = {
  'nes':                                    'nintendo entertainment system',
  'famicom':                                'nintendo entertainment system',
  'snes':                                   'super nintendo entertainment system',
  'super famicom':                          'super nintendo entertainment system',
  'n64':                                    'nintendo 64',
  'nintendo 64':                            'nintendo 64',
  'gb':                                     'game boy',
  'game boy':                               'game boy',
  'gbc':                                    'game boy color',
  'game boy color':                         'game boy color',
  'gba':                                    'game boy advance',
  'game boy advance':                       'game boy advance',
  'nds':                                    'nintendo ds',
  'ds':                                     'nintendo ds',
  'nintendo ds':                            'nintendo ds',
  '3ds':                                    'nintendo 3ds',
  'nintendo 3ds':                           'nintendo 3ds',
  'gamecube':                               'nintendo gamecube',
  'game cube':                              'nintendo gamecube',
  'wii':                                    'wii',
  'wii u':                                  'wii u',
  'switch':                                 'nintendo switch',
  'nintendo switch':                        'nintendo switch',
  'ps1':                                    'playstation',
  'psx':                                    'playstation',
  'playstation 1':                          'playstation',
  'ps2':                                    'playstation 2',
  'ps3':                                    'playstation 3',
  'ps4':                                    'playstation 4',
  'ps5':                                    'playstation 5',
  'psp':                                    'playstation portable',
  'ps vita':                                'playstation vita',
  'vita':                                   'playstation vita',
  'xbox':                                   'xbox',
  'xbox 360':                               'xbox 360',
  'xbox one':                               'xbox one',
  'mega drive':                             'sega mega drive/genesis',
  'genesis':                                'sega mega drive/genesis',
  'sega genesis':                           'sega mega drive/genesis',
  'sega mega drive':                        'sega mega drive/genesis',
  'game gear':                              'sega game gear',
  'sega game gear':                         'sega game gear',
  'saturn':                                 'sega saturn',
  'sega saturn':                            'sega saturn',
  'dreamcast':                              'dreamcast',
  'sega dreamcast':                         'dreamcast',
  'master system':                          'sega master system/mark iii',
  'sega master system':                     'sega master system/mark iii',
  'atari 2600':                             'atari 2600',
  'atari 5200':                             'atari 5200',
  'atari 7800':                             'atari 7800',
  'atari jaguar':                           'atari jaguar',
  'turbografx-16':                          'turbografx-16/pc engine',
  'pc engine':                              'turbografx-16/pc engine',
  'neo geo':                                'neo geo aes',
  'neo geo pocket':                         'neo geo pocket',
  'neo geo pocket color':                   'neo geo pocket color',
  'virtual boy':                            'virtual boy',
  'wonderswan':                             'wonderswan',
  'wonderswan color':                       'wonderswan color',
  'gizmondo':                               'gizmondo',
  'ngage':                                  'n-gage',
  'n-gage':                                 'n-gage',
  'philips cd-i':                           'philips cd-i',
  '3do':                                    '3do interactive multiplayer',
  'jaguar':                                 'atari jaguar',
};

function igdbLogoUrl(rawUrl: string): string {
  // rawUrl is like //images.igdb.com/igdb/image/upload/t_thumb/co1234.png
  // Upgrade to t_logo_med (284×284) and add https:
  return 'https:' + rawUrl.replace('/t_thumb/', '/t_logo_med/');
}

export async function GET() {
  if (!process.env.IGDB_CLIENT_ID || !process.env.IGDB_CLIENT_SECRET) {
    return NextResponse.json({});
  }

  try {
    const [systems, page1, page2] = await Promise.all([
      prisma.system.findMany({ select: { id: true, name: true } }),
      // IGDB max limit is 500; fetch two pages to cover the full catalogue
      queryIGDB<IGDBPlatform[]>(
        'platforms',
        'fields id, name, platform_logo.url; limit 500; where platform_logo != null; offset 0;'
      ),
      queryIGDB<IGDBPlatform[]>(
        'platforms',
        'fields id, name, platform_logo.url; limit 500; where platform_logo != null; offset 500;'
      ),
    ]);

    // Build name → logo URL lookup from IGDB data
    const byName = new Map<string, string>();
    for (const p of [...page1, ...page2]) {
      if (p.platform_logo?.url) {
        byName.set(p.name.toLowerCase(), igdbLogoUrl(p.platform_logo.url));
      }
    }

    const result: Record<string, string> = {};
    for (const system of systems) {
      const lower = system.name.toLowerCase();
      const aliasKey = ALIASES[lower];

      // 1. Try exact match
      let url = byName.get(lower);
      // 2. Try alias
      if (!url && aliasKey) url = byName.get(aliasKey);
      // 3. Try partial: IGDB name contains ours, or ours contains IGDB name
      if (!url) {
        for (const [igdbName, logoUrl] of byName) {
          if (igdbName.includes(lower) || lower.includes(igdbName)) {
            url = logoUrl;
            break;
          }
        }
      }

      if (url) result[system.id] = url;
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[systems/images]', err);
    return NextResponse.json({});
  }
}
