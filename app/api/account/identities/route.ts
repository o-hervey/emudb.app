import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? 'Not authenticated' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    identities: data.user.identities ?? [],
  });
}