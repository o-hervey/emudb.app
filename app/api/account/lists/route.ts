import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const lists = await prisma.userList.findMany({
    where: { ownerId: user.id },
    select: {
      id: true,
      name: true,
      description: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { entries: true, saves: true, clones: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    lists.map(({ _count, ...list }) => ({
      ...list,
      entryCount: _count.entries,
      saveCount: _count.saves,
      cloneCount: _count.clones,
    }))
  );
}
