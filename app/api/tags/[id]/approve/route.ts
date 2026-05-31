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
    select: { id: true, approved: true, submittedBy: true },
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

  await prisma.$transaction([
    prisma.tag.update({
      where: { id },
      data: { approved: true, reviewedBy: user!.id },
    }),
    prisma.softwareTag.updateMany({
      where: { tagId: id, approved: false },
      data: { approved: true },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
