import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Returns all platforms, systems, hardware, and approved tags for building filter UIs.
// Cached at the edge — this data changes infrequently.
export const revalidate = 3600;

export async function GET() {
  const [platforms, systems, hardware, tags] = await Promise.all([
    prisma.platform.findMany({
      select: { id: true, name: true, group: true },
      orderBy: [{ group: "asc" }, { name: "asc" }],
    }),
    prisma.system.findMany({
      select: { id: true, name: true, manufacturer: true, type: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
    }),
    prisma.hardware.findMany({
      select: { id: true, name: true, manufacturer: true, type: true },
      orderBy: [{ manufacturer: "asc" }, { name: "asc" }],
    }),
    prisma.tag.findMany({
      where: { approved: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return NextResponse.json({ platforms, systems, hardware, tags });
}
