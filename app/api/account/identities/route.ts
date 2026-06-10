import { getSessionUser, unauthorized } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  return NextResponse.json({
    identities: user.identities ?? [],
  });
}
