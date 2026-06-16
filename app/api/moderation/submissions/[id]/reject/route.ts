import { forbidden, requireModerator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, profile, error } = await requireModerator();
  if (error) return error;

  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { id: true, status: true, submittedBy: true },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  if (submission.status !== "PENDING") {
    return NextResponse.json({ error: "Submission is not pending" }, { status: 409 });
  }
  if (submission.submittedBy === user!.id && !profile?.isSuperAdmin) {
    return forbidden();
  }

  await prisma.submission.update({
    where: { id },
    data: { status: "REJECTED", reviewedBy: user!.id, reviewedAt: new Date() },
  });

  return NextResponse.json({ ok: true });
}
