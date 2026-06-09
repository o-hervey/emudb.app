import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { key: "auth:signup", max: 5, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

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

  const trimmedUsername = typeof username === "string" ? username.trim() : null;

  if (trimmedUsername) {
    if (!/^[a-zA-Z0-9_-]{3,30}$/.test(trimmedUsername)) {
      return NextResponse.json(
        { error: "Username must be 3–30 characters: letters, numbers, _ or -" },
        { status: 400 }
      );
    }

    try {
      const existing = await prisma.profile.findUnique({ where: { username: trimmedUsername } });
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
        update: trimmedUsername ? { username: trimmedUsername } : {},
        create: { id: data.user.id, ...(trimmedUsername ? { username: trimmedUsername } : {}) },
      });
    } catch (err: unknown) {
      if ((err as { code?: string }).code === "P2002") {
        return NextResponse.json({ error: "Username already taken" }, { status: 409 });
      }
      console.error("[signup] prisma profile upsert failed:", err);
      return NextResponse.json({ error: "Account created but profile setup failed. Please contact support." }, { status: 500 });
    }
  }

  return NextResponse.json({ user: { id: data.user?.id, email: data.user?.email } });
}
