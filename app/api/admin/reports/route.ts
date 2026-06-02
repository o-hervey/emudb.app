import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma, ReportStatus, ReportTargetType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 20;
  const statusParam = searchParams.get("status") ?? "";
  const targetTypeParam = searchParams.get("targetType") ?? "";

  const where: Prisma.ReportWhereInput = {};
  if (statusParam && Object.values(ReportStatus).includes(statusParam as ReportStatus)) {
    where.status = statusParam as ReportStatus;
  }
  if (targetTypeParam && Object.values(ReportTargetType).includes(targetTypeParam as ReportTargetType)) {
    where.targetType = targetTypeParam as ReportTargetType;
  }

  const [total, reports] = await Promise.all([
    prisma.report.count({ where }),
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        targetType: true,
        targetId: true,
        credibilityWeight: true,
        comment: true,
        status: true,
        upheldAt: true,
        reviewedAt: true,
        createdAt: true,
        reporter: { select: { id: true, username: true } },
        targetUser: { select: { id: true, username: true } },
      },
    }),
  ]);

  return NextResponse.json({
    data: reports,
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  });
}
