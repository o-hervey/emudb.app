import { requireContributor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await rateLimit(req, { key: "tags:review", max: 60, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const { user, profile, error } = await requireContributor();
  if (error) return error;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const submissionId = body && typeof body.submissionId === "string"
    ? body.submissionId
    : null;

  if (!submissionId) {
    return NextResponse.json({ error: "submissionId is required" }, { status: 400 });
  }

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, type: "NEW_TAG", status: "PENDING" },
    select: { id: true, payload: true, targetId: true, submittedBy: true },
  });

  if (!submission) {
    return NextResponse.json({ error: "Pending tag submission not found" }, { status: 404 });
  }

  const payload = submission.payload as Record<string, unknown>;
  const payloadTagId = typeof payload.tagId === "string" ? payload.tagId : null;
  const softwareId = typeof payload.softwareId === "string" ? payload.softwareId : submission.targetId;

  if (payloadTagId !== id || !softwareId) {
    return NextResponse.json({ error: "Submission does not match this tag" }, { status: 400 });
  }

  if (submission.submittedBy === user!.id && !profile?.isSuperAdmin) {
    return NextResponse.json({ error: "You cannot review your own submitted tag" }, { status: 403 });
  }

  const tag = await prisma.tag.findUnique({
    where: { id },
    select: { id: true, approved: true },
  });
  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.softwareTag.deleteMany({
      where: { softwareId, tagId: id, approved: false },
    });
    await tx.submission.updateMany({
      where: {
        type: "NEW_TAG",
        status: "PENDING",
        targetId: softwareId,
        payload: { path: ["tagId"], equals: id },
      },
      data: { status: "REJECTED", reviewedBy: user!.id, reviewedAt: new Date() },
    });

    const remainingJunctions = await tx.softwareTag.count({ where: { tagId: id } });

    if (!tag.approved && remainingJunctions === 0) {
      await tx.tag.delete({ where: { id } });
    }
  });

  return NextResponse.json({ ok: true });
}
