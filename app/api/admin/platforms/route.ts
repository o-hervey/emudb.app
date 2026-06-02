import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PlatformGroup } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const platforms = await prisma.platform.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(platforms);
}

export async function POST(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const body = await req.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const group = body.group;

  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });
  if (!Object.values(PlatformGroup).includes(group)) {
    return NextResponse.json({ error: "invalid group" }, { status: 400 });
  }

  const platform = await prisma.platform.create({ data: { name, group } });
  return NextResponse.json(platform, { status: 201 });
}
