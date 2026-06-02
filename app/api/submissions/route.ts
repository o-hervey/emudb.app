import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Category, HardwareType, Prisma, SoftwareStatus, SubmissionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type Normalized<T> = { value: T; error?: never } | { error: NextResponse; value?: never };

function badRequest(error: string) {
  return NextResponse.json({ error }, { status: 400 });
}

function isUuid(val: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
}

function normalizeOptionalString(val: unknown, field: string): Normalized<string | null> {
  if (val === undefined || val === null || val === "") return { value: null };
  if (typeof val !== "string") return { error: badRequest(`${field} must be a string`) };
  return { value: val.trim() || null };
}

function normalizeIdList(val: unknown, field: string): Normalized<string[]> {
  if (val === undefined || val === null) return { value: [] };
  if (!Array.isArray(val)) return { error: badRequest(`${field} must be an array`) };

  const ids = val.map((id) => typeof id === "string" ? id.trim() : "");
  if (ids.some((id) => !isUuid(id))) {
    return { error: badRequest(`${field} must only contain UUID strings`) };
  }

  return { value: [...new Set(ids)] };
}

function isAllowedUrl(val: unknown): boolean {
  if (val === null) return true;
  if (typeof val !== "string" || !val) return false;
  try {
    const { protocol } = new URL(val);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { type } = body as { type?: string };
  if (!type || !Object.values(SubmissionType).includes(type as SubmissionType)) {
    return NextResponse.json({ error: "Invalid submission type" }, { status: 400 });
  }

  switch (type as SubmissionType) {
    case "NEW_LISTING":  return handleNewListing(user.id, body);
    case "EDIT":         return handleEdit(user.id, body);
    case "NEW_HARDWARE": return handleNewHardware(user.id, body);
    case "NEW_TAG":      return handleNewTag(user.id, body);
  }
}

// ---------------------------------------------------------------------------

async function handleNewListing(userId: string, body: Record<string, unknown>) {
  const { name, description, category, status, websiteUrl, downloadUrl, sourceUrl,
          systemIds, platformIds, hardwareIds } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!category || !Object.values(Category).includes(category as Category)) {
    return NextResponse.json({ error: "Valid category is required" }, { status: 400 });
  }

  const listingStatus = status === undefined || status === null || status === ""
    ? SoftwareStatus.ACTIVE
    : status;
  if (!Object.values(SoftwareStatus).includes(listingStatus as SoftwareStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  const normalizedStatus = listingStatus as SoftwareStatus;

  const normalizedDescription = normalizeOptionalString(description, "description");
  if (normalizedDescription.error) return normalizedDescription.error;
  const normalizedWebsiteUrl = normalizeOptionalString(websiteUrl, "websiteUrl");
  if (normalizedWebsiteUrl.error) return normalizedWebsiteUrl.error;
  const normalizedDownloadUrl = normalizeOptionalString(downloadUrl, "downloadUrl");
  if (normalizedDownloadUrl.error) return normalizedDownloadUrl.error;
  const normalizedSourceUrl = normalizeOptionalString(sourceUrl, "sourceUrl");
  if (normalizedSourceUrl.error) return normalizedSourceUrl.error;

  if (!isAllowedUrl(normalizedWebsiteUrl.value))  return NextResponse.json({ error: "websiteUrl must be an http/https URL" }, { status: 400 });
  if (!isAllowedUrl(normalizedDownloadUrl.value)) return NextResponse.json({ error: "downloadUrl must be an http/https URL" }, { status: 400 });
  if (!isAllowedUrl(normalizedSourceUrl.value))   return NextResponse.json({ error: "sourceUrl must be an http/https URL" }, { status: 400 });

  const normalizedSystemIds = normalizeIdList(systemIds, "systemIds");
  if (normalizedSystemIds.error) return normalizedSystemIds.error;
  const normalizedPlatformIds = normalizeIdList(platformIds, "platformIds");
  if (normalizedPlatformIds.error) return normalizedPlatformIds.error;
  const normalizedHardwareIds = normalizeIdList(hardwareIds, "hardwareIds");
  if (normalizedHardwareIds.error) return normalizedHardwareIds.error;

  const [systemCount, platformCount, hardwareCount] = await Promise.all([
    normalizedSystemIds.value.length === 0
      ? 0
      : prisma.system.count({ where: { id: { in: normalizedSystemIds.value } } }),
    normalizedPlatformIds.value.length === 0
      ? 0
      : prisma.platform.count({ where: { id: { in: normalizedPlatformIds.value } } }),
    normalizedHardwareIds.value.length === 0
      ? 0
      : prisma.hardware.count({ where: { id: { in: normalizedHardwareIds.value } } }),
  ]);

  if (systemCount !== normalizedSystemIds.value.length) return NextResponse.json({ error: "One or more systems were not found" }, { status: 400 });
  if (platformCount !== normalizedPlatformIds.value.length) return NextResponse.json({ error: "One or more platforms were not found" }, { status: 400 });
  if (hardwareCount !== normalizedHardwareIds.value.length) return NextResponse.json({ error: "One or more hardware entries were not found" }, { status: 400 });

  const submission = await prisma.submission.create({
    data: {
      type: "NEW_LISTING",
      submittedBy: userId,
      status: "PENDING",
      payload: {
        name: (name as string).trim(),
        description: normalizedDescription.value,
        category: category as Category,
        status: normalizedStatus,
        websiteUrl: normalizedWebsiteUrl.value,
        downloadUrl: normalizedDownloadUrl.value,
        sourceUrl: normalizedSourceUrl.value,
        systemIds: normalizedSystemIds.value,
        platformIds: normalizedPlatformIds.value,
        hardwareIds: normalizedHardwareIds.value,
      },
    },
    select: { id: true, type: true, status: true, createdAt: true },
  });

  return NextResponse.json(submission, { status: 201 });
}

// ---------------------------------------------------------------------------

async function handleEdit(userId: string, body: Record<string, unknown>) {
  const { targetId, payload } = body;

  if (!targetId || typeof targetId !== "string") {
    return NextResponse.json({ error: "targetId is required for EDIT submissions" }, { status: 400 });
  }
  if (!isUuid(targetId)) {
    return NextResponse.json({ error: "targetId must be a UUID string" }, { status: 400 });
  }

  const software = await prisma.software.findUnique({
    where: { id: targetId, approved: true },
    select: { id: true },
  });
  if (!software) {
    return NextResponse.json({ error: "Software listing not found" }, { status: 404 });
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return NextResponse.json({ error: "payload object is required" }, { status: 400 });
  }

  const EDITABLE_FIELDS = ["name", "description", "category", "status", "websiteUrl", "downloadUrl", "sourceUrl"];
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload as Record<string, unknown>)) {
    if (!EDITABLE_FIELDS.includes(key)) continue;

    if (key === "name") {
      if (typeof value !== "string" || !value.trim()) return badRequest("name must be a non-empty string");
      fields.name = value.trim();
      continue;
    }
    if (key === "description" || key === "websiteUrl" || key === "downloadUrl" || key === "sourceUrl") {
      const normalized = normalizeOptionalString(value, key);
      if (normalized.error) return normalized.error;
      fields[key] = normalized.value;
      continue;
    }

    fields[key] = value;
  }

  if ("category" in fields && !Object.values(Category).includes(fields.category as Category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if ("status" in fields && !Object.values(SoftwareStatus).includes(fields.status as SoftwareStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if ("websiteUrl" in fields  && !isAllowedUrl(fields.websiteUrl))  return NextResponse.json({ error: "websiteUrl must be an http/https URL" }, { status: 400 });
  if ("downloadUrl" in fields && !isAllowedUrl(fields.downloadUrl)) return NextResponse.json({ error: "downloadUrl must be an http/https URL" }, { status: 400 });
  if ("sourceUrl" in fields   && !isAllowedUrl(fields.sourceUrl))   return NextResponse.json({ error: "sourceUrl must be an http/https URL" }, { status: 400 });

  // Array relation fields — optional, included only when present in payload
  const p = payload as Record<string, unknown>;
  let editPlatformIds: string[] | undefined;
  let editSystemIds: string[] | undefined;
  let editHardwareIds: string[] | undefined;

  if ("platformIds" in p) {
    const r = normalizeIdList(p.platformIds, "platformIds");
    if (r.error) return r.error;
    editPlatformIds = r.value;
  }
  if ("systemIds" in p) {
    const r = normalizeIdList(p.systemIds, "systemIds");
    if (r.error) return r.error;
    editSystemIds = r.value;
  }
  if ("hardwareIds" in p) {
    const r = normalizeIdList(p.hardwareIds, "hardwareIds");
    if (r.error) return r.error;
    editHardwareIds = r.value;
  }

  const hasArrayChanges = editPlatformIds !== undefined || editSystemIds !== undefined || editHardwareIds !== undefined;
  if (Object.keys(fields).length === 0 && !hasArrayChanges) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }

  // Validate that referenced IDs exist
  const [systemCount, platformCount, hardwareCount] = await Promise.all([
    editSystemIds?.length   ? prisma.system.count({ where: { id: { in: editSystemIds } } })   : 0,
    editPlatformIds?.length ? prisma.platform.count({ where: { id: { in: editPlatformIds } } }) : 0,
    editHardwareIds?.length ? prisma.hardware.count({ where: { id: { in: editHardwareIds } } }) : 0,
  ]);
  if (editSystemIds?.length   && systemCount   !== editSystemIds.length)   return NextResponse.json({ error: "One or more systems were not found" }, { status: 400 });
  if (editPlatformIds?.length && platformCount !== editPlatformIds.length) return NextResponse.json({ error: "One or more platforms were not found" }, { status: 400 });
  if (editHardwareIds?.length && hardwareCount !== editHardwareIds.length) return NextResponse.json({ error: "One or more hardware entries were not found" }, { status: 400 });

  const finalPayload: Record<string, unknown> = { ...fields };
  if (editPlatformIds !== undefined) finalPayload.platformIds = editPlatformIds;
  if (editSystemIds   !== undefined) finalPayload.systemIds   = editSystemIds;
  if (editHardwareIds !== undefined) finalPayload.hardwareIds = editHardwareIds;

  const submission = await prisma.submission.create({
    data: {
      type: "EDIT",
      submittedBy: userId,
      status: "PENDING",
      targetId,
      payload: finalPayload as Prisma.InputJsonValue,
    },
    select: { id: true, type: true, status: true, targetId: true, createdAt: true },
  });

  return NextResponse.json(submission, { status: 201 });
}

// ---------------------------------------------------------------------------

async function handleNewHardware(userId: string, body: Record<string, unknown>) {
  const { name, manufacturer, hardwareType, primaryPlatformId } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!hardwareType || !Object.values(HardwareType).includes(hardwareType as HardwareType)) {
    return NextResponse.json({ error: "Valid hardwareType is required" }, { status: 400 });
  }

  const normalizedManufacturer = normalizeOptionalString(manufacturer, "manufacturer");
  if (normalizedManufacturer.error) return normalizedManufacturer.error;

  const platformId = normalizeOptionalString(primaryPlatformId, "primaryPlatformId");
  if (platformId.error) return platformId.error;
  if (platformId.value && !isUuid(platformId.value)) {
    return NextResponse.json({ error: "primaryPlatformId must be a UUID string" }, { status: 400 });
  }
  if (platformId.value) {
    const platform = await prisma.platform.findUnique({
      where: { id: platformId.value },
      select: { id: true },
    });
    if (!platform) return NextResponse.json({ error: "Platform not found" }, { status: 404 });
  }

  const submission = await prisma.submission.create({
    data: {
      type: "NEW_HARDWARE",
      submittedBy: userId,
      status: "PENDING",
      payload: {
        name: (name as string).trim(),
        manufacturer: normalizedManufacturer.value,
        hardwareType: hardwareType as HardwareType,
        primaryPlatformId: platformId.value,
      },
    },
    select: { id: true, type: true, status: true, createdAt: true },
  });

  return NextResponse.json(submission, { status: 201 });
}

// ---------------------------------------------------------------------------

async function handleNewTag(userId: string, body: Record<string, unknown>) {
  const { softwareId, tagName } = body;

  if (!softwareId || typeof softwareId !== "string") {
    return NextResponse.json({ error: "softwareId is required" }, { status: 400 });
  }
  if (!isUuid(softwareId)) {
    return NextResponse.json({ error: "softwareId must be a UUID string" }, { status: 400 });
  }
  if (!tagName || typeof tagName !== "string" || !tagName.trim()) {
    return NextResponse.json({ error: "tagName is required" }, { status: 400 });
  }

  const name = (tagName as string).trim().toLowerCase();

  const software = await prisma.software.findUnique({
    where: { id: softwareId, approved: true },
    select: { id: true },
  });
  if (!software) {
    return NextResponse.json({ error: "Software listing not found" }, { status: 404 });
  }

  const existingTag = await prisma.tag.findUnique({ where: { name } });

  if (existingTag?.approved) {
    // Tag is already approved — wire it up immediately, no moderation needed.
    const alreadyApplied = await prisma.softwareTag.findUnique({
      where: { softwareId_tagId: { softwareId, tagId: existingTag.id } },
    });
    if (alreadyApplied) {
      return NextResponse.json({ error: "Tag already applied to this listing" }, { status: 409 });
    }

    await prisma.softwareTag.create({
      data: { softwareId, tagId: existingTag.id, approved: true },
    });

    return NextResponse.json({ applied: true, tagId: existingTag.id, tagName: existingTag.name });
  }

  // Tag is new or not yet approved — create it pending review.
  const result = await prisma.$transaction(async (tx) => {
    const tag = existingTag ?? await tx.tag.create({
      data: { name, approved: false, submittedBy: userId },
    });

    const existingJunction = await tx.softwareTag.findUnique({
      where: { softwareId_tagId: { softwareId, tagId: tag.id } },
    });
    if (!existingJunction) {
      await tx.softwareTag.create({
        data: { softwareId, tagId: tag.id, approved: false },
      });
    }

    const submission = await tx.submission.create({
      data: {
        type: "NEW_TAG",
        submittedBy: userId,
        status: "PENDING",
        targetId: softwareId,
        payload: { tagId: tag.id, name, softwareId },
      },
      select: { id: true, type: true, status: true, createdAt: true },
    });

    return { submission, tag };
  });

  return NextResponse.json(
    { ...result.submission, tagId: result.tag.id, tagName: result.tag.name },
    { status: 201 }
  );
}
