import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SystemType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const data: { name?: string; manufacturer?: string | null; type?: SystemType } = {};

  if (typeof body.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "name cannot be empty" }, { status: 400 });
    data.name = name;
  }
  if ("manufacturer" in body) {
    data.manufacturer = typeof body.manufacturer === "string" ? body.manufacturer.trim() || null : null;
  }
  if ("type" in body) {
    if (!Object.values(SystemType).includes(body.type)) {
      return NextResponse.json({ error: "invalid type" }, { status: 400 });
    }
    data.type = body.type;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const system = await prisma.system.update({ where: { id }, data });
  return NextResponse.json(system);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { id } = await params;

  const count = await prisma.softwareSystem.count({ where: { systemId: id } });
  if (count > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${count} software listing(s) reference this system` },
      { status: 409 }
    );
  }

  await prisma.system.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
