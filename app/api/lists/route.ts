import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { Category, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 24;

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;

  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
  const sort = params.get("sort");
  const category = params.get("category");
  const platformId = params.get("platform");
  const hardwareId = params.get("hardware");
  const systemId = params.get("system");
  const search = params.get("q")?.trim();

  if (category && !Object.values(Category).includes(category as Category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const and: Prisma.UserListWhereInput[] = [{ isPublic: true }];

  if (category) {
    and.push({ entries: { some: { software: { category: category as Category, approved: true } } } });
  }
  if (platformId) {
    and.push({ entries: { some: { software: { approved: true, platforms: { some: { platformId } } } } } });
  }
  if (hardwareId) {
    and.push({ entries: { some: { hardwareId, software: { approved: true } } } });
  }
  if (systemId) {
    and.push({ entries: { some: { software: { approved: true, systems: { some: { systemId } } } } } });
  }
  if (search) {
    and.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ],
    });
  }

  const where: Prisma.UserListWhereInput = { AND: and };

  const orderBy: Prisma.UserListOrderByWithRelationInput =
    sort === "cloned"
      ? { clones: { _count: "desc" } }
      : sort === "newest"
      ? { createdAt: "desc" }
      : { saves: { _count: "desc" } };

  const [total, items] = await Promise.all([
    prisma.userList.count({ where }),
    prisma.userList.findMany({
      where,
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        _count: {
          select: {
            entries: { where: { software: { approved: true } } },
            saves: true,
            clones: true,
          },
        },
      },
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const lists = items.map(({ _count, ...list }) => ({
    ...list,
    entryCount: _count.entries,
    saveCount: _count.saves,
    cloneCount: _count.clones,
  }));

  return NextResponse.json({
    data: lists,
    meta: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
  });
}

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, { key: "lists:create", max: 30, windowMs: 60 * 60 * 1000 });
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });

  const { name, description, isPublic } = body as Record<string, unknown>;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (name.trim().length > 100) {
    return NextResponse.json({ error: "name must be 100 characters or fewer" }, { status: 400 });
  }
  const trimmedDescription = typeof description === "string" ? description.trim() || null : null;
  if (trimmedDescription && trimmedDescription.length > 2000) {
    return NextResponse.json({ error: "description must be 2000 characters or fewer" }, { status: 400 });
  }

  const list = await prisma.userList.create({
    data: {
      ownerId: user.id,
      name: name.trim(),
      description: trimmedDescription,
      isPublic: typeof isPublic === "boolean" ? isPublic : false,
    },
    select: { id: true, name: true, description: true, isPublic: true, createdAt: true },
  });

  return NextResponse.json(list, { status: 201 });
}
