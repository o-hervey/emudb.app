import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Returns all platforms, systems, hardware, and approved tags for building filter UIs.
// Cached at the edge — this data changes infrequently.
export const revalidate = 3600;

export async function GET() {
  const [platformsRaw, systemsRaw, hardwareRaw, tags] = await Promise.all([
    prisma.platform.findMany({
      select: { id: true, name: true, group: true },
      orderBy: { name: "asc" },
    }),
    prisma.system.findMany({
      select: { id: true, name: true, manufacturer: true, type: true },
      orderBy: { name: "asc" },
    }),
    prisma.hardware.findMany({
      select: {
        id: true,
        name: true,
        manufacturer: true,
        type: true,
        primaryPlatform: { select: { group: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      where: { approved: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const hardware = hardwareRaw.map(({ primaryPlatform, ...h }) => ({
    ...h,
    platformGroup: primaryPlatform?.group ?? null,
  }));

  return NextResponse.json({ platforms: platformsRaw, systems: systemsRaw, hardware, tags });
}
