import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

function isValidScore(val: unknown): val is number {
  return typeof val === "number" && Number.isInteger(val) && val >= 1 && val <= 5;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await rateLimit(req, { key: "ratings:read", max: 120, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: softwareId } = await params;

  const [qualityRating, performanceRatings] = await Promise.all([
    prisma.qualityRating.findUnique({
      where: { softwareId_userId: { softwareId, userId: user.id } },
      select: { id: true, score: true, comment: true, createdAt: true },
    }),
    prisma.performanceRating.findMany({
      where: { softwareId, userId: user.id },
      select: {
        id: true,
        score: true,
        comment: true,
        createdAt: true,
        hardware: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return NextResponse.json({ qualityRating, performanceRatings });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await rateLimit(req, { key: "ratings:create", max: 60, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: softwareId } = await params;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type, score, hardwareId, comment } = body as Record<string, unknown>;

  if (type !== "quality" && type !== "performance") {
    return NextResponse.json({ error: "type must be \"quality\" or \"performance\"" }, { status: 400 });
  }
  if (!isValidScore(score)) {
    return NextResponse.json({ error: "score must be an integer between 1 and 5" }, { status: 400 });
  }
  if (type === "performance" && !hardwareId) {
    return NextResponse.json({ error: "hardwareId is required for performance ratings" }, { status: 400 });
  }
  if (type === "performance" && typeof hardwareId !== "string") {
    return NextResponse.json({ error: "hardwareId must be a string" }, { status: 400 });
  }

  const trimmedComment = typeof comment === "string" ? comment.trim() || null : null;
  if (trimmedComment && trimmedComment.length > 1000) {
    return NextResponse.json({ error: "comment must be 1000 characters or fewer" }, { status: 400 });
  }

  const software = await prisma.software.findUnique({
    where: { id: softwareId, approved: true },
    select: { id: true },
  });
  if (!software) {
    return NextResponse.json({ error: "Software listing not found" }, { status: 404 });
  }

  if (type === "quality") {
    const existing = await prisma.qualityRating.findUnique({
      where: { softwareId_userId: { softwareId, userId: user.id } },
      select: { id: true },
    });

    const rating = await prisma.qualityRating.upsert({
      where: { softwareId_userId: { softwareId, userId: user.id } },
      create: { softwareId, userId: user.id, score, comment: trimmedComment },
      update: { score, comment: trimmedComment },
      select: { id: true, score: true, comment: true, createdAt: true, updatedAt: true },
    });

    const { _avg } = await prisma.qualityRating.aggregate({
      where: { softwareId },
      _avg: { score: true },
    });
    await prisma.software.update({
      where: { id: softwareId },
      data: { avgQuality: _avg.score },
    });

    return NextResponse.json(rating, { status: existing ? 200 : 201 });
  }

  // type === "performance"
  const hwId = hardwareId as string;

  const supportedHardware = await prisma.softwareHardware.findUnique({
    where: { softwareId_hardwareId: { softwareId, hardwareId: hwId } },
    select: { hardwareId: true },
  });
  if (!supportedHardware) {
    return NextResponse.json(
      { error: "Hardware is not associated with this software listing" },
      { status: 400 }
    );
  }

  const existing = await prisma.performanceRating.findUnique({
    where: { softwareId_userId_hardwareId: { softwareId, userId: user.id, hardwareId: hwId } },
    select: { id: true },
  });

  const rating = await prisma.performanceRating.upsert({
    where: { softwareId_userId_hardwareId: { softwareId, userId: user.id, hardwareId: hwId } },
    create: { softwareId, userId: user.id, hardwareId: hwId, score, comment: trimmedComment },
    update: { score, comment: trimmedComment },
    select: {
      id: true,
      score: true,
      comment: true,
      createdAt: true,
      updatedAt: true,
      hardware: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(rating, { status: existing ? 200 : 201 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await rateLimit(req, { key: "ratings:delete", max: 30, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: softwareId } = await params;

  const { searchParams } = new URL(req.url);
  const ratingId = searchParams.get("ratingId");

  if (!ratingId) {
    return NextResponse.json({ error: "ratingId query param is required" }, { status: 400 });
  }

  const existing = await prisma.performanceRating.findFirst({
    where: { id: ratingId, softwareId, userId: user.id },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Rating not found" }, { status: 404 });
  }

  await prisma.performanceRating.delete({ where: { id: ratingId } });

  return new NextResponse(null, { status: 204 });
}
