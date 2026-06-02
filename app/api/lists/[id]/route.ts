import { forbidden, getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const list = await prisma.userList.findFirst({
    where: { id, isPublic: true },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { saves: true, clones: true } },
      entries: {
        select: {
          id: true,
          notes: true,
          sortOrder: true,
          software: { select: { id: true, name: true, category: true, status: true } },
          hardware: { select: { id: true, name: true, type: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });

  const { _count, ...rest } = list;
  return NextResponse.json({ ...rest, saveCount: _count.saves, cloneCount: _count.clones });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await params;

  const list = await prisma.userList.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });
  if (list.ownerId !== user.id) return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { name, description, isPublic } = body as Record<string, unknown>;

  const data: Record<string, unknown> = {};
  if (typeof name === "string" && name.trim()) data.name = name.trim();
  if (description !== undefined) {
    data.description = typeof description === "string" ? description.trim() || null : null;
  }
  if (typeof isPublic === "boolean") data.isPublic = isPublic;

  const updated = await prisma.userList.update({
    where: { id },
    data,
    select: { id: true, name: true, description: true, isPublic: true, updatedAt: true },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id } = await params;

  const list = await prisma.userList.findUnique({
    where: { id },
    select: { ownerId: true },
  });

  if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });
  if (list.ownerId !== user.id) return forbidden();

  await prisma.userList.delete({ where: { id } });

  return new NextResponse(null, { status: 204 });
}
