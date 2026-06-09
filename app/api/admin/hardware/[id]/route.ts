import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HardwareType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const data: {
    name?: string;
    manufacturer?: string | null;
    type?: HardwareType;
    primaryPlatformId?: string | null;
  } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    data.name = name;
  }
  if ("manufacturer" in body) {
    data.manufacturer = typeof body.manufacturer === "string" ? body.manufacturer.trim() || null : null;
  }
  if ("type" in body) {
    if (!Object.values(HardwareType).includes(body.type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }
    data.type = body.type;
  }
  if ("primaryPlatformId" in body) {
    const pid = typeof body.primaryPlatformId === "string" && body.primaryPlatformId
      ? body.primaryPlatformId
      : null;
    if (pid) {
      const platform = await prisma.platform.findUnique({ where: { id: pid }, select: { id: true } });
      if (!platform) return NextResponse.json({ error: "platform not found" }, { status: 400 });
    }
    data.primaryPlatformId = pid;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const hardware = await prisma.hardware.update({
    where: { id },
    data,
    include: { primaryPlatform: { select: { id: true, name: true } } },
  });

  return NextResponse.json(hardware);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  const [softwareCount, ratingCount, listEntryCount, platformLinkCount] = await Promise.all([
    prisma.softwareHardware.count({ where: { hardwareId: id } }),
    prisma.rating.count({ where: { hardwareId: id } }),
    prisma.userListEntry.count({ where: { hardwareId: id } }),
    prisma.hardwarePlatform.count({ where: { hardwareId: id } }),
  ]);
  if (softwareCount > 0 || ratingCount > 0 || listEntryCount > 0 || platformLinkCount > 0) {
    const parts: string[] = [];
    if (softwareCount > 0) parts.push(`${softwareCount} software listing(s)`);
    if (ratingCount > 0) parts.push(`${ratingCount} rating(s)`);
    if (listEntryCount > 0) parts.push(`${listEntryCount} list entry/entries`);
    if (platformLinkCount > 0) parts.push(`${platformLinkCount} platform link(s)`);
    return NextResponse.json(
      { error: `Cannot delete: referenced by ${parts.join(" and ")}` },
      { status: 409 }
    );
  }

  await prisma.hardware.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
