import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await rateLimit(req, { key: "lists:clone", max: 10, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: listId } = await params;

  const list = await prisma.userList.findFirst({
    where: { id: listId, isPublic: true },
    select: {
      ownerId: true,
      name: true,
      description: true,
      entries: {
        where: { software: { approved: true } },
        select: { softwareId: true, hardwareId: true, notes: true, sortOrder: true },
      },
    },
  });

  if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });
  if (list.ownerId === user.id) {
    return NextResponse.json({ error: "Cannot clone your own list" }, { status: 400 });
  }

  const cloned = await prisma.userList.create({
    data: {
      ownerId: user.id,
      name: list.name,
      description: list.description,
      isPublic: false,
      clonedFrom: listId,
      entries: {
        create: list.entries.map((e) => ({
          softwareId: e.softwareId,
          hardwareId: e.hardwareId,
          notes: e.notes,
          sortOrder: e.sortOrder,
        })),
      },
    },
    select: { id: true, name: true, description: true, isPublic: true, createdAt: true },
  });

  return NextResponse.json(cloned, { status: 201 });
}
