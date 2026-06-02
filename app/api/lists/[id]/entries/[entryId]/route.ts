import { forbidden, getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: listId, entryId } = await params;

  const entry = await prisma.userListEntry.findFirst({
    where: { id: entryId, listId },
    select: { id: true, list: { select: { ownerId: true } } },
  });

  if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  if (entry.list.ownerId !== user.id) return forbidden();

  await prisma.userListEntry.delete({ where: { id: entryId } });

  return new NextResponse(null, { status: 204 });
}
