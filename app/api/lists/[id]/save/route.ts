import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await rateLimit(req, { key: "lists:save", max: 60, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: listId } = await params;

  const list = await prisma.userList.findFirst({
    where: { id: listId, isPublic: true },
    select: { ownerId: true },
  });

  if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });
  if (list.ownerId === user.id) {
    return NextResponse.json({ error: "Cannot save your own list" }, { status: 400 });
  }

  await prisma.userListSave.upsert({
    where: { userId_listId: { userId: user.id, listId } },
    create: { userId: user.id, listId },
    update: {},
  });

  return new NextResponse(null, { status: 204 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await rateLimit(req, { key: "lists:save", max: 60, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: listId } = await params;

  await prisma.userListSave.deleteMany({
    where: { userId: user.id, listId },
  });

  return new NextResponse(null, { status: 204 });
}
