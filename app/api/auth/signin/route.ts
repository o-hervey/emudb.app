import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, { key: "auth:signin", max: 10, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const profile = await prisma.profile.findUnique({
    where: { id: data.user.id },
    select: { isActive: true },
  });
  if (profile && !profile.isActive) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: "Account is inactive" }, { status: 403 });
  }

  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } });
}
