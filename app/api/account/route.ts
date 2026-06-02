import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  await prisma.profile.update({
    where: { id: user.id },
    data: { isActive: false, username: null },
  });

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();

  return new NextResponse(null, { status: 204 });
}
