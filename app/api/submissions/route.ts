import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Category, HardwareType, Prisma, SoftwareStatus, SubmissionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

function isAllowedUrl(val: unknown): boolean {
  if (typeof val !== "string" || !val) return true; // optional fields — blank is OK
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
  const { name, description, category, websiteUrl, downloadUrl, sourceUrl,
          systemIds, platformIds, hardwareIds } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!category || !Object.values(Category).includes(category as Category)) {
    return NextResponse.json({ error: "Valid category is required" }, { status: 400 });
  }
  if (!isAllowedUrl(websiteUrl))  return NextResponse.json({ error: "websiteUrl must be an http/https URL" }, { status: 400 });
  if (!isAllowedUrl(downloadUrl)) return NextResponse.json({ error: "downloadUrl must be an http/https URL" }, { status: 400 });
  if (!isAllowedUrl(sourceUrl))   return NextResponse.json({ error: "sourceUrl must be an http/https URL" }, { status: 400 });

  const submission = await prisma.submission.create({
    data: {
      type: "NEW_LISTING",
      submittedBy: userId,
      status: "PENDING",
      payload: {
        name: (name as string).trim(),
        description: description ?? null,
        category,
        websiteUrl: websiteUrl ?? null,
        downloadUrl: downloadUrl ?? null,
        sourceUrl: sourceUrl ?? null,
        systemIds: Array.isArray(systemIds) ? systemIds : [],
        platformIds: Array.isArray(platformIds) ? platformIds : [],
        hardwareIds: Array.isArray(hardwareIds) ? hardwareIds : [],
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
  const fields = Object.fromEntries(
    Object.entries(payload as Record<string, unknown>).filter(([k]) => EDITABLE_FIELDS.includes(k))
  );

  if (Object.keys(fields).length === 0) {
    return NextResponse.json({ error: "No editable fields provided" }, { status: 400 });
  }
  if (fields.category && !Object.values(Category).includes(fields.category as Category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }
  if (fields.status && !Object.values(SoftwareStatus).includes(fields.status as SoftwareStatus)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  if ("websiteUrl" in fields  && !isAllowedUrl(fields.websiteUrl))  return NextResponse.json({ error: "websiteUrl must be an http/https URL" }, { status: 400 });
  if ("downloadUrl" in fields && !isAllowedUrl(fields.downloadUrl)) return NextResponse.json({ error: "downloadUrl must be an http/https URL" }, { status: 400 });
  if ("sourceUrl" in fields   && !isAllowedUrl(fields.sourceUrl))   return NextResponse.json({ error: "sourceUrl must be an http/https URL" }, { status: 400 });

  const submission = await prisma.submission.create({
    data: {
      type: "EDIT",
      submittedBy: userId,
      status: "PENDING",
      targetId,
      payload: fields as Prisma.InputJsonValue,
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

  const submission = await prisma.submission.create({
    data: {
      type: "NEW_HARDWARE",
      submittedBy: userId,
      status: "PENDING",
      payload: {
        name: (name as string).trim(),
        manufacturer: manufacturer ?? null,
        hardwareType,
        primaryPlatformId: primaryPlatformId ?? null,
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
