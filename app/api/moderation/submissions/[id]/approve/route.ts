import { requireModerator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Category, HardwareType, Prisma, SoftwareStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, error } = await requireModerator();
  if (error) return error;

  const { id } = await params;

  const submission = await prisma.submission.findUnique({
    where: { id },
    select: { id: true, type: true, status: true, payload: true, targetId: true, submittedBy: true },
  });

  if (!submission) {
    return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  }
  if (submission.status !== "PENDING") {
    return NextResponse.json({ error: "Submission is not pending" }, { status: 409 });
  }

  const payload = submission.payload as Record<string, unknown>;

  await prisma.$transaction(async (tx) => {
    switch (submission.type) {
      case "NEW_LISTING": {
        const software = await tx.software.create({
          data: {
            name: payload.name as string,
            description: (payload.description as string | null) ?? null,
            category: payload.category as Category,
            websiteUrl: (payload.websiteUrl as string | null) ?? null,
            downloadUrl: (payload.downloadUrl as string | null) ?? null,
            sourceUrl: (payload.sourceUrl as string | null) ?? null,
            approved: true,
            submittedBy: submission.submittedBy,
          },
        });

        const systemIds = (payload.systemIds as string[]) ?? [];
        const platformIds = (payload.platformIds as string[]) ?? [];
        const hardwareIds = (payload.hardwareIds as string[]) ?? [];

        if (systemIds.length > 0) {
          await tx.softwareSystem.createMany({
            data: systemIds.map((systemId) => ({ softwareId: software.id, systemId })),
          });
        }
        if (platformIds.length > 0) {
          await tx.softwarePlatform.createMany({
            data: platformIds.map((platformId) => ({ softwareId: software.id, platformId })),
          });
        }
        if (hardwareIds.length > 0) {
          await tx.softwareHardware.createMany({
            data: hardwareIds.map((hardwareId) => ({ softwareId: software.id, hardwareId })),
          });
        }
        break;
      }

      case "EDIT": {
        const fields: Prisma.SoftwareUpdateInput = {};
        if (payload.name)        fields.name = payload.name as string;
        if (payload.description !== undefined) fields.description = payload.description as string | null;
        if (payload.category)    fields.category = payload.category as Category;
        if (payload.status)      fields.status = payload.status as SoftwareStatus;
        if (payload.websiteUrl !== undefined)  fields.websiteUrl = payload.websiteUrl as string | null;
        if (payload.downloadUrl !== undefined) fields.downloadUrl = payload.downloadUrl as string | null;
        if (payload.sourceUrl !== undefined)   fields.sourceUrl = payload.sourceUrl as string | null;
        fields.updatedAt = new Date();

        await tx.software.update({ where: { id: submission.targetId! }, data: fields });
        break;
      }

      case "NEW_HARDWARE": {
        await tx.hardware.create({
          data: {
            name: payload.name as string,
            manufacturer: (payload.manufacturer as string | null) ?? null,
            type: payload.hardwareType as HardwareType,
            primaryPlatformId: (payload.primaryPlatformId as string | null) ?? null,
          },
        });
        break;
      }

      case "NEW_TAG": {
        // Approve the tag itself and the junction row.
        await tx.tag.update({
          where: { id: payload.tagId as string },
          data: { approved: true, reviewedBy: user!.id },
        });
        await tx.softwareTag.update({
          where: {
            softwareId_tagId: {
              softwareId: payload.softwareId as string,
              tagId: payload.tagId as string,
            },
          },
          data: { approved: true },
        });
        break;
      }
    }

    await tx.submission.update({
      where: { id },
      data: { status: "APPROVED", reviewedBy: user!.id, reviewedAt: new Date() },
    });
  });

  return NextResponse.json({ ok: true });
}
