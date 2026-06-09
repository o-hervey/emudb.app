import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      username: true,
      isActive: true,
      isModerator: true,
      isSuperAdmin: true,
      createdAt: true,
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  return NextResponse.json({ email: user.email, ...profile });
}
