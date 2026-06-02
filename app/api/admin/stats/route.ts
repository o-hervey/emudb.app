import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const now = new Date();
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    newUsersLast30,
    newUsersLast7,
    totalApprovedListings,
    newListingsLast7,
    totalRatings,
    ratingsLast7,
    pendingModerationCount,
    pendingTagCount,
  ] = await Promise.all([
    prisma.profile.count(),
    prisma.profile.count({ where: { createdAt: { gte: last30 } } }),
    prisma.profile.count({ where: { createdAt: { gte: last7 } } }),
    prisma.software.count({ where: { approved: true } }),
    prisma.submission.count({ where: { type: "NEW_LISTING", createdAt: { gte: last7 } } }),
    prisma.rating.count(),
    prisma.rating.count({ where: { createdAt: { gte: last7 } } }),
    prisma.submission.count({ where: { status: "PENDING" } }),
    prisma.tag.count({ where: { approved: false } }),
  ]);

  return NextResponse.json({
    totalUsers,
    newUsersLast30,
    newUsersLast7,
    totalApprovedListings,
    newListingsLast7,
    totalRatings,
    ratingsLast7,
    pendingModerationCount,
    pendingTagCount,
  });
}
