import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SystemType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const systems = await prisma.system.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(systems);
}

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const manufacturer = typeof body.manufacturer === "string" ? body.manufacturer.trim() || null : null;
  const type = body.type;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!Object.values(SystemType).includes(type)) {
    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  }

  const system = await prisma.system.create({ data: { name, manufacturer, type } });
  return NextResponse.json(system, { status: 201 });
}
