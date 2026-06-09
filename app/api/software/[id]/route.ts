import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const software = await prisma.software.findUnique({
    where: { id, approved: true },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      status: true,
      websiteUrl: true,
      downloadUrl: true,
      sourceUrl: true,
      createdAt: true,
      updatedAt: true,
      platforms: {
        select: { platform: { select: { id: true, name: true, group: true } } },
      },
      systems: {
        select: { system: { select: { id: true, name: true, manufacturer: true, type: true } } },
      },
      hardware: {
        select: { hardware: { select: { id: true, name: true, manufacturer: true, type: true } } },
      },
      tags: {
        where: { approved: true },
        select: { tag: { select: { id: true, name: true } } },
      },
      ratings: {
        select: {
          id: true,
          qualityScore: true,
          performanceScore: true,
          comment: true,
          createdAt: true,
          hardware: { select: { id: true, name: true } },
          user: { select: { username: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!software) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const similar = await prisma.software.findMany({
    where: { approved: true, category: software.category, id: { not: id } },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      status: true,
      websiteUrl: true,
      downloadUrl: true,
      sourceUrl: true,
      avgQuality: true,
      createdAt: true,
      updatedAt: true,
      platforms: { select: { platform: { select: { id: true, name: true, group: true } } } },
      systems: { select: { system: { select: { id: true, name: true, manufacturer: true, type: true } } } },
      hardware: { select: { hardware: { select: { id: true, name: true, manufacturer: true, type: true } } } },
      tags: { where: { approved: true }, select: { tag: { select: { id: true, name: true } } } },
      _count: { select: { ratings: true } },
    },
    take: 4,
    orderBy: { avgQuality: { sort: "desc", nulls: "last" } },
  });

  const [qualityAggregate, performanceAggregate, ratingCount] = await Promise.all([
    prisma.rating.aggregate({
      where: { softwareId: id, qualityScore: { not: null } },
      _avg: { qualityScore: true },
    }),
    prisma.rating.aggregate({
      where: { softwareId: id, performanceScore: { not: null } },
      _avg: { performanceScore: true },
    }),
    prisma.rating.count({ where: { softwareId: id } }),
  ]);

  return NextResponse.json({
    ...software,
    platforms: software.platforms.map((p) => p.platform),
    systems: software.systems.map((p) => p.system),
    hardware: software.hardware.map((p) => p.hardware),
    tags: software.tags.map((p) => p.tag),
    avgQuality: qualityAggregate._avg.qualityScore,
    avgPerformance: performanceAggregate._avg.performanceScore,
    ratingCount,
    similar: similar.map(({ _count, ...s }) => ({
      ...s,
      platforms: s.platforms.map((p) => p.platform),
      systems: s.systems.map((p) => p.system),
      hardware: s.hardware.map((p) => p.hardware),
      tags: s.tags.map((p) => p.tag),
      avgPerformance: null,
      ratingCount: _count.ratings,
    })),
  });
}
