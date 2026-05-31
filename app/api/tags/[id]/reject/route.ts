import { requireContributor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireContributor();
  if (error) return error;

  const { id } = await params;

  const tag = await prisma.tag.findUnique({
    where: { id },
    select: {
      id: true,
      approved: true,
      submittedBy: true,
      software: { select: { softwareId: true, approved: true } },
    },
  });

  if (!tag) {
    return NextResponse.json({ error: "Tag not found" }, { status: 404 });
  }
  if (tag.approved) {
    return NextResponse.json({ error: "Tag is already approved" }, { status: 409 });
  }
  if (tag.submittedBy === user!.id) {
    return NextResponse.json({ error: "You cannot review your own submitted tag" }, { status: 403 });
  }

  const approvedJunctions = tag.software.filter((s) => s.approved);

  await prisma.$transaction(async (tx) => {
    // Remove all pending junction rows for this tag.
    await tx.softwareTag.deleteMany({ where: { tagId: id, approved: false } });

    if (approvedJunctions.length === 0) {
      // No approved usages remain — delete the tag entirely.
      await tx.tag.delete({ where: { id } });
    } else {
      // The tag has approved usages on other listings; just mark reviewed.
      await tx.tag.update({
        where: { id },
        data: { reviewedBy: user!.id },
      });
    }
  });

  return NextResponse.json({ ok: true });
}
