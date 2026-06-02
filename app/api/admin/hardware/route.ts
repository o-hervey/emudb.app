import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HardwareType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const hardware = await prisma.hardware.findMany({
    orderBy: { name: "asc" },
    include: { primaryPlatform: { select: { id: true, name: true } } },
  });

  return NextResponse.json(hardware);
}

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const manufacturer = typeof body.manufacturer === "string" ? body.manufacturer.trim() || null : null;
  const type = body.type;
  const primaryPlatformId =
    typeof body.primaryPlatformId === "string" && body.primaryPlatformId ? body.primaryPlatformId : null;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!Object.values(HardwareType).includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  if (primaryPlatformId) {
    const platform = await prisma.platform.findUnique({
      where: { id: primaryPlatformId },
      select: { id: true },
    });
    if (!platform) return NextResponse.json({ error: "platform not found" }, { status: 400 });
  }

  const hardware = await prisma.hardware.create({
    data: { name, manufacturer, type, primaryPlatformId },
    include: { primaryPlatform: { select: { id: true, name: true } } },
  });

  return NextResponse.json(hardware, { status: 201 });
}
