import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { username } = body as Record<string, unknown>;

  if (typeof username !== "string" || !username.trim()) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  const trimmed = username.trim();

  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(trimmed)) {
    return NextResponse.json(
      { error: "Username must be 3–30 characters: letters, numbers, _ or -" },
      { status: 400 }
    );
  }

  try {
    const profile = await prisma.profile.update({
      where: { id: user.id },
      data: { username: trimmed },
      select: { id: true, username: true },
    });
    return NextResponse.json(profile);
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "Username already taken" }, { status: 409 });
    }
    throw err;
  }
}
