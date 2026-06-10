import { getSessionUser, unauthorized } from '@/lib/auth';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_PROVIDERS = new Set(['github', 'discord']);

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const provider = body?.provider;

  if (typeof provider !== 'string' || !ALLOWED_PROVIDERS.has(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent('/account/settings')}`;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.linkIdentity({
    provider: provider as 'github' | 'discord',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (!data?.url) {
    return NextResponse.json({ error: 'No authorization URL returned.' }, { status: 500 });
  }

  return NextResponse.json({ url: data.url });
}