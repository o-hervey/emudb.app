import { requireModerator } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SubmissionType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const PAGE_SIZE = 50;

export async function GET(req: NextRequest) {
  const { error } = await requireModerator();
  if (error) return error;

  const params = req.nextUrl.searchParams;
  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10));
  const typeParam = params.get("type");

  if (typeParam && !Object.values(SubmissionType).includes(typeParam as SubmissionType)) {
    return NextResponse.json({ error: "Invalid type filter" }, { status: 400 });
  }

  const where = {
    status: "PENDING" as const,
    ...(typeParam && { type: typeParam as SubmissionType }),
  };

  const [total, submissions] = await Promise.all([
    prisma.submission.count({ where }),
    prisma.submission.findMany({
      where,
      select: {
        id: true,
        type: true,
        status: true,
        payload: true,
        targetId: true,
        createdAt: true,
        submitter: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return NextResponse.json({
    data: submissions,
    meta: { page, pageSize: PAGE_SIZE, total, totalPages: Math.ceil(total / PAGE_SIZE) },
  });
}
