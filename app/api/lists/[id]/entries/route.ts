import { forbidden, getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: listId } = await params;

  const list = await prisma.userList.findUnique({
    where: { id: listId },
    select: { ownerId: true },
  });

  if (!list) return NextResponse.json({ error: "List not found" }, { status: 404 });
  if (list.ownerId !== user.id) return forbidden();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { softwareId, hardwareId, notes, sortOrder } = body as Record<string, unknown>;

  if (!softwareId || typeof softwareId !== "string") {
    return NextResponse.json({ error: "softwareId is required" }, { status: 400 });
  }

  const software = await prisma.software.findUnique({
    where: { id: softwareId, approved: true },
    select: { id: true },
  });
  if (!software) return NextResponse.json({ error: "Software not found" }, { status: 404 });

  const normalizedHardwareId = typeof hardwareId === "string" && hardwareId ? hardwareId : null;

  if (normalizedHardwareId) {
    const supportedHardware = await prisma.softwareHardware.findUnique({
      where: {
        softwareId_hardwareId: {
          softwareId,
          hardwareId: normalizedHardwareId,
        },
      },
      select: { hardwareId: true },
    });
    if (!supportedHardware) {
      return NextResponse.json(
        { error: "Hardware is not associated with this software listing" },
        { status: 400 }
      );
    }
  }

  const trimmedNotes = typeof notes === "string" ? notes.trim() || null : null;
  if (trimmedNotes && trimmedNotes.length > 1000) {
    return NextResponse.json({ error: "notes must be 1000 characters or fewer" }, { status: 400 });
  }

  let entry;
  try {
    entry = await prisma.userListEntry.create({
      data: {
        listId,
        softwareId,
        hardwareId: normalizedHardwareId,
        notes: trimmedNotes,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
      select: {
        id: true,
        notes: true,
        sortOrder: true,
        software: { select: { id: true, name: true, category: true, status: true } },
        hardware: { select: { id: true, name: true, type: true } },
      },
    });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "P2002") {
      return NextResponse.json({ error: "This item is already in the list." }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json(entry, { status: 201 });
}
