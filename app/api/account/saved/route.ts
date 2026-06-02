import { getSessionUser, unauthorized } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const saves = await prisma.userListSave.findMany({
    where: { userId: user.id },
    select: {
      savedAt: true,
      list: {
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          _count: { select: { entries: true, saves: true, clones: true } },
        },
      },
    },
    orderBy: { savedAt: "desc" },
  });

  return NextResponse.json(
    saves.map(({ list, savedAt }) => {
      const { _count, ...rest } = list;
      return {
        ...rest,
        savedAt,
        entryCount: _count.entries,
        saveCount: _count.saves,
        cloneCount: _count.clones,
      };
    })
  );
}
