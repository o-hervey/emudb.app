import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlatformGroup } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const data: { name?: string; group?: PlatformGroup } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    data.name = name;
  }
  if ("group" in body) {
    if (!Object.values(PlatformGroup).includes(body.group)) {
      return NextResponse.json({ error: "invalid group" }, { status: 400 });
    }
    data.group = body.group;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const platform = await prisma.platform.update({ where: { id }, data });
  return NextResponse.json(platform);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  const [softwareCount, hardwareCount] = await Promise.all([
    prisma.softwarePlatform.count({ where: { platformId: id } }),
    prisma.hardware.count({ where: { primaryPlatformId: id } }),
  ]);

  if (softwareCount > 0 || hardwareCount > 0) {
    const parts: string[] = [];
    if (softwareCount > 0) parts.push(`${softwareCount} software listing(s)`);
    if (hardwareCount > 0) parts.push(`${hardwareCount} hardware entry/entries`);
    return NextResponse.json(
      { error: `Cannot delete: referenced by ${parts.join(" and ")}` },
      { status: 409 }
    );
  }

  await prisma.platform.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
