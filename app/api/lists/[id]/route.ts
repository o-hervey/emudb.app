import { forbidden, getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [{ id }, sessionUser] = await Promise.all([params, getSessionUser()]);

  const list = await prisma.userList.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      isPublic: true,
      ownerId: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { saves: true, clones: true } },
      entries: {
        where: { software: { approved: true } },
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
  // Private lists are visible only to their owner
  if (!list.isPublic && list.ownerId !== sessionUser?.id) {
    return NextResponse.json({ error: "List not found" }, { status: 404 });
  }

  const viewerSave = sessionUser && list.ownerId !== sessionUser.id
    ? await prisma.userListSave.findUnique({
        where: { userId_listId: { userId: sessionUser.id, listId: id } },
        select: { listId: true },
      })
    : null;

  return NextResponse.json({
    id: list.id,
    name: list.name,
    description: list.description,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
    entries: list.entries,
    saveCount: list._count.saves,
    cloneCount: list._count.clones,
    viewerHasSaved: Boolean(viewerSave),
  });
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
  if (typeof name === "string" && name.trim()) {
    if (name.trim().length > 100) {
      return NextResponse.json({ error: "name must be 100 characters or fewer" }, { status: 400 });
    }
    data.name = name.trim();
  }
  if (description !== undefined) {
    const trimmedDesc = typeof description === "string" ? description.trim() || null : null;
    if (trimmedDesc && trimmedDesc.length > 2000) {
      return NextResponse.json({ error: "description must be 2000 characters or fewer" }, { status: 400 });
    }
    data.description = trimmedDesc;
  }
  if (typeof isPublic === "boolean") data.isPublic = isPublic;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No updatable fields provided" }, { status: 400 });
  }

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
