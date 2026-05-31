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
          user: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!software) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const qualityRatings = software.ratings.filter((r) => r.qualityScore !== null);
  const perfRatings = software.ratings.filter((r) => r.performanceScore !== null);

  return NextResponse.json({
    ...software,
    platforms: software.platforms.map((p) => p.platform),
    systems: software.systems.map((p) => p.system),
    hardware: software.hardware.map((p) => p.hardware),
    tags: software.tags.map((p) => p.tag),
    avgQuality: qualityRatings.length > 0
      ? qualityRatings.reduce((s, r) => s + r.qualityScore!, 0) / qualityRatings.length
      : null,
    avgPerformance: perfRatings.length > 0
      ? perfRatings.reduce((s, r) => s + r.performanceScore!, 0) / perfRatings.length
      : null,
    ratingCount: software.ratings.length,
  });
}
