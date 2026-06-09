import { prisma } from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function safeNextPath(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/';

  try {
    const url = new URL(next, 'https://emudb.local');
    if (url.origin !== 'https://emudb.local') return '/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

function usernameFromUser(user: {
  email?: string;
  user_metadata?: Record<string, unknown>;
}) {
  const metadata = user.user_metadata ?? {};

  const candidates = [
    metadata.user_name,
    metadata.preferred_username,
    metadata.full_name,
    metadata.name,
    user.email?.split('@')[0],
  ];

  const raw = candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0);

  if (!raw) return null;

  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 30);

  if (cleaned.length < 3) return null;

  return cleaned;
}

async function getAvailableUsername(baseUsername: string | null) {
  if (!baseUsername) return null;

  const base = baseUsername.slice(0, 24);

  for (let i = 0; i < 10; i += 1) {
    const username = i === 0 ? base : `${base}_${i}`;

    const existing = await prisma.profile.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!existing) return username;
  }

  return null;
}

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const next = safeNextPath(requestUrl.searchParams.get('next'));

  if (!code) {
    return NextResponse.redirect(new URL('/auth/signin?error=missing_code', requestUrl.origin));
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(new URL('/auth/signin?error=oauth_failed', requestUrl.origin));
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { id: data.user.id },
    select: { id: true },
  });

  if (!existingProfile) {
    const username = await getAvailableUsername(usernameFromUser(data.user));

    await prisma.profile.create({
      data: {
        id: data.user.id,
        username,
      },
    });
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}