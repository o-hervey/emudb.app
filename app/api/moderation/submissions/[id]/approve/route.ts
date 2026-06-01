import { requireModerator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Category, HardwareType, Prisma, SoftwareStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type ParsedIds = { ids: string[]; error?: never } | { error: NextResponse; ids?: never };
type ParsedString = { value: string | null; error?: never } | { error: NextResponse; value?: never };

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function isUuid(val: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

function isAllowedUrl(val: string | null) {
  if (val === null) return true;
  try {
    const { protocol } = new URL(val);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function parseOptionalString(payload: Record<string, unknown>, field: string): ParsedString {
  const value = payload[field];
  if (value === undefined || value === null || value === "") return { value: null };
  if (typeof value !== "string") return { error: badRequest(`${field} must be a string`) };
  return { value: value.trim() || null };
}

function parsePayloadIds(payload: Record<string, unknown>, field: string): ParsedIds {
  const value = payload[field];
  if (value === undefined || value === null) return { ids: [] as string[] };
  if (!Array.isArray(value)) return { error: badRequest(`${field} must be an array`) };

  const ids = value.map((id) => typeof id === "string" ? id.trim() : "");
  if (ids.some((id) => !isUuid(id))) {
    return { error: badRequest(`${field} must only contain UUID strings`) };
  }

  return { ids: [...new Set(ids)] };
}

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
  let listingStatus: SoftwareStatus = "ACTIVE";
  let listingSystemIds: string[] = [];
  let listingPlatformIds: string[] = [];
  let listingHardwareIds: string[] = [];
  let listingDescription: string | null = null;
  let listingWebsiteUrl: string | null = null;
  let listingDownloadUrl: string | null = null;
  let listingSourceUrl: string | null = null;
  let hardwarePrimaryPlatformId: string | null = null;
  let hardwareManufacturer: string | null = null;
  let tagSoftwareId: string | null = null;
  let tagId: string | null = null;

  if (submission.type === "NEW_LISTING") {
    if (typeof payload.name !== "string" || !payload.name.trim()) {
      return badRequest("Submission payload has an invalid name");
    }
    if (!Object.values(Category).includes(payload.category as Category)) {
      return badRequest("Submission payload has an invalid category");
    }

    const status = payload.status ?? "ACTIVE";
    if (!Object.values(SoftwareStatus).includes(status as SoftwareStatus)) {
      return badRequest("Submission payload has an invalid status");
    }
    listingStatus = status as SoftwareStatus;

    const description = parseOptionalString(payload, "description");
    if (description.error) return description.error;
    const websiteUrl = parseOptionalString(payload, "websiteUrl");
    if (websiteUrl.error) return websiteUrl.error;
    const downloadUrl = parseOptionalString(payload, "downloadUrl");
    if (downloadUrl.error) return downloadUrl.error;
    const sourceUrl = parseOptionalString(payload, "sourceUrl");
    if (sourceUrl.error) return sourceUrl.error;

    if (!isAllowedUrl(websiteUrl.value)) return badRequest("websiteUrl must be an http/https URL");
    if (!isAllowedUrl(downloadUrl.value)) return badRequest("downloadUrl must be an http/https URL");
    if (!isAllowedUrl(sourceUrl.value)) return badRequest("sourceUrl must be an http/https URL");

    listingDescription = description.value;
    listingWebsiteUrl = websiteUrl.value;
    listingDownloadUrl = downloadUrl.value;
    listingSourceUrl = sourceUrl.value;

    const parsedSystemIds = parsePayloadIds(payload, "systemIds");
    if (parsedSystemIds.error) return parsedSystemIds.error;
    const parsedPlatformIds = parsePayloadIds(payload, "platformIds");
    if (parsedPlatformIds.error) return parsedPlatformIds.error;
    const parsedHardwareIds = parsePayloadIds(payload, "hardwareIds");
    if (parsedHardwareIds.error) return parsedHardwareIds.error;

    listingSystemIds = parsedSystemIds.ids;
    listingPlatformIds = parsedPlatformIds.ids;
    listingHardwareIds = parsedHardwareIds.ids;

    const [systemCount, platformCount, hardwareCount] = await Promise.all([
      listingSystemIds.length === 0
        ? 0
        : prisma.system.count({ where: { id: { in: listingSystemIds } } }),
      listingPlatformIds.length === 0
        ? 0
        : prisma.platform.count({ where: { id: { in: listingPlatformIds } } }),
      listingHardwareIds.length === 0
        ? 0
        : prisma.hardware.count({ where: { id: { in: listingHardwareIds } } }),
    ]);

    if (systemCount !== listingSystemIds.length) return badRequest("One or more systems were not found");
    if (platformCount !== listingPlatformIds.length) return badRequest("One or more platforms were not found");
    if (hardwareCount !== listingHardwareIds.length) return badRequest("One or more hardware entries were not found");
  }

  if (submission.type === "NEW_HARDWARE") {
    if (typeof payload.name !== "string" || !payload.name.trim()) {
      return badRequest("Submission payload has an invalid hardware name");
    }
    if (!Object.values(HardwareType).includes(payload.hardwareType as HardwareType)) {
      return badRequest("Submission payload has an invalid hardware type");
    }
    if (payload.manufacturer !== undefined && payload.manufacturer !== null && payload.manufacturer !== "") {
      if (typeof payload.manufacturer !== "string") {
        return badRequest("Submission payload has an invalid manufacturer");
      }
      hardwareManufacturer = payload.manufacturer.trim() || null;
    }
    if (payload.primaryPlatformId !== undefined && payload.primaryPlatformId !== null && payload.primaryPlatformId !== "") {
      if (typeof payload.primaryPlatformId !== "string" || !isUuid(payload.primaryPlatformId)) {
        return badRequest("Submission payload has an invalid primaryPlatformId");
      }
      hardwarePrimaryPlatformId = payload.primaryPlatformId;
    }
  }

  if (hardwarePrimaryPlatformId) {
    const platform = await prisma.platform.findUnique({
      where: { id: hardwarePrimaryPlatformId },
      select: { id: true },
    });
    if (!platform) {
      return badRequest("Submission payload has an invalid primaryPlatformId");
    }
  }

  if (submission.type === "NEW_TAG") {
    tagId = typeof payload.tagId === "string" ? payload.tagId : null;
    tagSoftwareId = typeof payload.softwareId === "string" ? payload.softwareId : submission.targetId;

    if (!tagId || !tagSoftwareId) {
      return badRequest("Submission payload has invalid tag data");
    }

    const junction = await prisma.softwareTag.findUnique({
      where: { softwareId_tagId: { softwareId: tagSoftwareId, tagId } },
      select: { softwareId: true },
    });
    if (!junction) return badRequest("Submission payload references a tag application that was not found");
  }

  await prisma.$transaction(async (tx) => {
    switch (submission.type) {
      case "NEW_LISTING": {
        const software = await tx.software.create({
          data: {
            name: (payload.name as string).trim(),
            description: listingDescription,
            category: payload.category as Category,
            websiteUrl: listingWebsiteUrl,
            downloadUrl: listingDownloadUrl,
            sourceUrl: listingSourceUrl,
            status: listingStatus,
            approved: true,
            submittedBy: submission.submittedBy,
          },
        });

        if (listingSystemIds.length > 0) {
          await tx.softwareSystem.createMany({
            data: listingSystemIds.map((systemId) => ({ softwareId: software.id, systemId })),
            skipDuplicates: true,
          });
        }
        if (listingPlatformIds.length > 0) {
          await tx.softwarePlatform.createMany({
            data: listingPlatformIds.map((platformId) => ({ softwareId: software.id, platformId })),
            skipDuplicates: true,
          });
        }
        if (listingHardwareIds.length > 0) {
          await tx.softwareHardware.createMany({
            data: listingHardwareIds.map((hardwareId) => ({ softwareId: software.id, hardwareId })),
            skipDuplicates: true,
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
            name: (payload.name as string).trim(),
            manufacturer: hardwareManufacturer,
            type: payload.hardwareType as HardwareType,
            primaryPlatformId: hardwarePrimaryPlatformId,
          },
        });
        break;
      }

      case "NEW_TAG": {
        await tx.tag.update({
          where: { id: tagId! },
          data: { approved: true, reviewedBy: user!.id },
        });
        await tx.softwareTag.update({
          where: {
            softwareId_tagId: {
              softwareId: tagSoftwareId!,
              tagId: tagId!,
            },
          },
          data: { approved: true },
        });
        await tx.submission.updateMany({
          where: {
            type: "NEW_TAG",
            status: "PENDING",
            targetId: tagSoftwareId!,
            payload: { path: ["tagId"], equals: tagId! },
          },
          data: { status: "APPROVED", reviewedBy: user!.id, reviewedAt: new Date() },
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
