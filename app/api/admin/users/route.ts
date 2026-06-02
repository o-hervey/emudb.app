import { requireSuperAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

type UserRow = {
  id: string;
  username: string | null;
  email: string;
  created_at: Date;
  is_moderator: boolean;
  is_super_admin: boolean;
  complaint_score: number;
  is_active: boolean;
};

type CountRow = { count: bigint };

export async function GET(req: NextRequest) {
  const { error } = await requireSuperAdmin();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const search = (searchParams.get("search") ?? "").trim();
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const searchLike = `%${search}%`;

  const [users, countResult] = await Promise.all([
    prisma.$queryRaw<UserRow[]>(
      Prisma.sql`
        SELECT p.id, p.username, u.email, p.created_at,
               p.is_moderator, p.is_super_admin, p.complaint_score, p.is_active
        FROM profiles p
        JOIN auth.users u ON u.id = p.id
        WHERE (${search} = '' OR p.username ILIKE ${searchLike} OR u.email ILIKE ${searchLike})
        ORDER BY p.created_at DESC
        LIMIT ${pageSize} OFFSET ${offset}
      `
    ),
    prisma.$queryRaw<CountRow[]>(
      Prisma.sql`
        SELECT COUNT(*) AS count
        FROM profiles p
        JOIN auth.users u ON u.id = p.id
        WHERE (${search} = '' OR p.username ILIKE ${searchLike} OR u.email ILIKE ${searchLike})
      `
    ),
  ]);

  const total = Number(countResult[0].count);

  return NextResponse.json({
    data: users.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      createdAt: u.created_at,
      isModerator: u.is_moderator,
      isSuperAdmin: u.is_super_admin,
      complaintScore: Number(u.complaint_score),
      isActive: u.is_active,
    })),
    meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) || 1 },
  });
}
