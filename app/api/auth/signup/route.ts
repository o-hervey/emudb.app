import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { email, password, username } = body as {
    email?: string;
    password?: string;
    username?: string;
  };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  if (username !== undefined && username !== null) {
    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      return NextResponse.json(
        { error: "Username must be 3–30 characters, letters/numbers/underscores only" },
        { status: 400 }
      );
    }

    const existing = await prisma.profile.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // If a username was provided, set it on the profile the trigger just created.
  // The trigger runs synchronously inside the same transaction as the INSERT on
  // auth.users, so the profile row should exist by the time we get here.
  if (username && data.user) {
    await prisma.profile.update({
      where: { id: data.user.id },
      data: { username },
    });
  }

  return NextResponse.json({ user: { id: data.user?.id, email: data.user?.email } });
}
