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

    try {
      const existing = await prisma.profile.findUnique({ where: { username } });
      if (existing) {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
    } catch (err) {
      console.error("[signup] prisma username check failed:", err);
      return NextResponse.json({ error: "Database error. Please try again." }, { status: 500 });
    }
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user) {
    try {
      await prisma.profile.upsert({
        where: { id: data.user.id },
        update: username ? { username } : {},
        create: { id: data.user.id, ...(username ? { username } : {}) },
      });
    } catch (err) {
      console.error("[signup] prisma profile upsert failed:", err);
    }
  }

  return NextResponse.json({ user: { id: data.user?.id, email: data.user?.email } });
}
