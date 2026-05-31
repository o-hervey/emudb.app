import { prisma } from "@/lib/prisma";
import { Category, Prisma, SoftwareStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 24;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const sort = params.get("sort");
  const category = params.get("category");
  const status = params.get("status");
  const platformId = params.get("platform");
  const hardwareId = params.get("hardware");
  const systemId = params.get("system");
  const tagId = params.get("tag");
  const search = params.get("q")?.trim();

  if (category && !Object.values(Category).includes(category as Category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  if (status && !Object.values(SoftwareStatus).includes(status as SoftwareStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const where: Prisma.SoftwareWhereInput = {
    approved: true,
    ...(category && { category: category as Category }),
    ...(status && { status: status as SoftwareStatus }),
    ...(platformId && { platforms: { some: { platformId } } }),
    ...(hardwareId && { hardware: { some: { hardwareId } } }),
    ...(systemId && { systems: { some: { systemId } } }),
    ...(tagId && { tags: { some: { tagId, approved: true } } }),
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const [total, items] = await Promise.all([
    prisma.software.count({ where }),
    prisma.software.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        status: true,
        websiteUrl: true,
        platforms: { select: { platform: { select: { id: true, name: true, group: true } } } },
        systems: { select: { system: { select: { id: true, name: true, type: true } } } },
        hardware: { select: { hardware: { select: { id: true, name: true, type: true } } } },
        tags: {
          where: { approved: true },
          select: { tag: { select: { id: true, name: true } } },
        },
        ratings: {
          select: { qualityScore: true, performanceScore: true },
        },
      },
      orderBy: sort === "recent"
        ? { createdAt: "desc" as const }
        : sort === "top_rated"
        ? { ratings: { _count: "desc" as const } }
        : { name: "asc" as const },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const software = items.map((s) => ({
    ...s,
    platforms: s.platforms.map((p) => p.platform),
    systems: s.systems.map((p) => p.system),
    hardware: s.hardware.map((p) => p.hardware),
    tags: s.tags.map((p) => p.tag),
    avgQuality: (() => {
      const rated = s.ratings.filter((r) => r.qualityScore !== null);
      return rated.length > 0 ? rated.reduce((sum, r) => sum + r.qualityScore!, 0) / rated.length : null;
    })(),
    avgPerformance: (() => {
      const rated = s.ratings.filter((r) => r.performanceScore !== null);
      return rated.length > 0 ? rated.reduce((sum, r) => sum + r.performanceScore!, 0) / rated.length : null;
    })(),
    ratingCount: s.ratings.length,
    ratings: undefined,
  }));

  return NextResponse.json({
    data: software,
    meta: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE),
    },
  });
}
