import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

function isValidScore(val: unknown): val is number {
  return typeof val === "number" && Number.isInteger(val) && val >= 1 && val <= 5;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = rateLimit(req, { key: "ratings:create", max: 60, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: softwareId } = await params;

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { qualityScore, performanceScore, hardwareId, comment } = body as Record<string, unknown>;

  const hasQuality = qualityScore !== undefined && qualityScore !== null;
  const hasPerformance = performanceScore !== undefined && performanceScore !== null;

  if (!hasQuality && !hasPerformance) {
    return NextResponse.json(
      { error: "At least one of qualityScore or performanceScore is required" },
      { status: 400 }
    );
  }
  if (hasQuality && !isValidScore(qualityScore)) {
    return NextResponse.json(
      { error: "qualityScore must be an integer between 1 and 5" },
      { status: 400 }
    );
  }
  if (hasPerformance && !isValidScore(performanceScore)) {
    return NextResponse.json(
      { error: "performanceScore must be an integer between 1 and 5" },
      { status: 400 }
    );
  }
  if (hasPerformance && !hardwareId) {
    return NextResponse.json(
      { error: "hardwareId is required when providing performanceScore" },
      { status: 400 }
    );
  }
  if (hardwareId && typeof hardwareId !== "string") {
    return NextResponse.json({ error: "hardwareId must be a string" }, { status: 400 });
  }
  const normalizedHardwareId = typeof hardwareId === "string" && hardwareId ? hardwareId : null;

  const software = await prisma.software.findUnique({
    where: { id: softwareId, approved: true },
    select: { id: true },
  });
  if (!software) {
    return NextResponse.json({ error: "Software listing not found" }, { status: 404 });
  }

  if (normalizedHardwareId) {
    const supportedHardware = await prisma.softwareHardware.findUnique({
      where: {
        softwareId_hardwareId: {
          softwareId,
          hardwareId: normalizedHardwareId,
        },
      },
      select: { hardwareId: true },
    });
    if (!supportedHardware) {
      return NextResponse.json(
        { error: "Hardware is not associated with this software listing" },
        { status: 400 }
      );
    }
  }

  const data = {
    qualityScore: hasQuality ? (qualityScore as number) : null,
    performanceScore: hasPerformance ? (performanceScore as number) : null,
    hardwareId: normalizedHardwareId,
    comment: typeof comment === "string" ? comment.trim() || null : null,
  };

  const select = {
    id: true,
    qualityScore: true,
    performanceScore: true,
    hardwareId: true,
    comment: true,
    createdAt: true,
  };

  const existing = await prisma.rating.findFirst({
    where: { softwareId, userId: user.id },
    select: { id: true },
  });

  const rating = existing
    ? await prisma.rating.update({ where: { id: existing.id }, data, select })
    : await prisma.rating.create({ data: { softwareId, userId: user.id, ...data }, select });

  return NextResponse.json(rating);
}
