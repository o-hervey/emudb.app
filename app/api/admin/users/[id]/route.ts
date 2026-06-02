import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  const target = await prisma.profile.findUnique({
    where: { id },
    select: { isSuperAdmin: true },
  });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.isSuperAdmin) return NextResponse.json({ error: "Cannot moderate a superadmin" }, { status: 403 });

  const body = await req.json();
  const data: { isModerator?: boolean; isActive?: boolean } = {};
  if (typeof body.isModerator === "boolean") data.isModerator = body.isModerator;
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  await prisma.profile.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  const target = await prisma.profile.findUnique({
    where: { id },
    select: { isSuperAdmin: true },
  });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.isSuperAdmin) return NextResponse.json({ error: "Cannot ban a superadmin" }, { status: 403 });

  await prisma.profile.update({
    where: { id },
    data: { isActive: false, username: null },
  });

  return NextResponse.json({ ok: true });
}
