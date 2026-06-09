import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getSessionUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { isActive: true },
  });
  if (profile && !profile.isActive) return null;

  return user;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Requires the user to have at least one approved submission (contributor gate for tag review).
export async function requireContributor() {
  const user = await getSessionUser();
  if (!user) return { user: null, error: unauthorized() };

  const approvedCount = await prisma.submission.count({
    where: { submittedBy: user.id, status: "APPROVED" },
  });

  if (approvedCount === 0) return { user, error: forbidden() };

  return { user, error: null };
}

export function profileMissing() {
  return NextResponse.json({ error: "Profile not found" }, { status: 500 });
}

export async function requireModerator() {
  const user = await getSessionUser();
  if (!user) return { user: null, profile: null, error: unauthorized() };

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, isModerator: true, isSuperAdmin: true },
  });

  if (!profile) return { user, profile: null, error: profileMissing() };
  if (!profile.isModerator && !profile.isSuperAdmin) return { user, profile, error: forbidden() };

  return { user, profile, error: null };
}

export async function requireSuperAdmin() {
  const user = await getSessionUser();
  if (!user) return { user: null, profile: null, error: unauthorized() };

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { id: true, isSuperAdmin: true },
  });

  if (!profile) return { user, profile: null, error: profileMissing() };
  if (!profile.isSuperAdmin) return { user, profile, error: forbidden() };

  return { user, profile, error: null };
}
