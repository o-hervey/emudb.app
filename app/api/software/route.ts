import { prisma } from "@/lib/prisma";
import { Category, Prisma, SoftwareStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 24;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const sort = params.get("sort");
  const category = params.get("category");
  const status = params.get("status");
  const platformIds = params.getAll("platform");
  const hardwareIds = params.getAll("hardware");
  const systemIds = params.getAll("system");
  const tagIds = params.getAll("tag");
  const search = params.get("q")?.trim();

  if (category && !Object.values(Category).includes(category as Category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  if (status && !Object.values(SoftwareStatus).includes(status as SoftwareStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const and: Prisma.SoftwareWhereInput[] = [{ approved: true }];

  if (category) and.push({ category: category as Category });
  if (status)   and.push({ status: status as SoftwareStatus });

  for (const platformId of platformIds) {
    and.push({ platforms: { some: { platformId } } });
  }
  for (const hardwareId of hardwareIds) {
    and.push({ hardware: { some: { hardwareId } } });
  }
  for (const systemId of systemIds) {
    and.push({ systems: { some: { systemId } } });
  }
  for (const tagId of tagIds) {
    and.push({ tags: { some: { tagId, approved: true } } });
  }
  if (search) {
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.SoftwareWhereInput = { AND: and };

  const softwareSelect = {
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
  } satisfies Prisma.SoftwareSelect;
  type SoftwareRow = Prisma.SoftwareGetPayload<{ select: typeof softwareSelect }>;

  const orderBy: Prisma.SoftwareOrderByWithRelationInput =
    sort === "top_rated"                   ? { avgQuality: { sort: "desc", nulls: "last" } } :
    sort === "newest" || sort === "recent" ? { createdAt: "desc" } :
    sort === "oldest"                      ? { createdAt: "asc" } :
    sort === "most_rated"                  ? { ratings: { _count: "desc" } } :
    sort === "za"                          ? { name: "desc" } :
                                             { name: "asc" };

  const [total, items] = await Promise.all([
    prisma.software.count({ where }),
    prisma.software.findMany({
      where,
      select: softwareSelect,
      orderBy,
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
