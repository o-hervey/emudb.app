import { requireContributor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type PendingTagApplication = {
  id: string;
  tagId: string;
  softwareId: string;
  name: string;
  createdAt: Date;
  submittedByProfile: { id: string; username: string | null };
};

export async function GET() {
  const { error } = await requireContributor();
  if (error) return error;

  const submissions = await prisma.submission.findMany({
    where: { type: "NEW_TAG", status: "PENDING" },
    select: {
      id: true,
      payload: true,
      targetId: true,
      createdAt: true,
      submitter: { select: { id: true, username: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const pending = submissions
    .map((submission) => {
      const payload = submission.payload as Record<string, unknown>;
      const tagId = typeof payload.tagId === "string" ? payload.tagId : null;
      const softwareId = typeof payload.softwareId === "string"
        ? payload.softwareId
        : submission.targetId;
      const name = typeof payload.name === "string" ? payload.name : null;

      if (!tagId || !softwareId || !name) return null;

      return {
        id: submission.id,
        tagId,
        softwareId,
        name,
        createdAt: submission.createdAt,
        submittedByProfile: submission.submitter,
      };
    })
    .filter((item): item is PendingTagApplication => item !== null);

  const deduped = [...new Map(
    pending.map((item) => [`${item.tagId}:${item.softwareId}`, item])
  ).values()];

  const software = await prisma.software.findMany({
    where: { id: { in: deduped.map((item) => item.softwareId) }, approved: true },
    select: { id: true, name: true, category: true },
  });
  const softwareById = new Map(software.map((item) => [item.id, item]));

  const data = deduped.map((item) => ({
    ...item,
    software: softwareById.get(item.softwareId) ? [softwareById.get(item.softwareId)!] : [],
  }));

  return NextResponse.json({ data });
}
