import { requireContributor } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const { error } = await requireContributor();
  if (error) return error;

  const tags = await prisma.tag.findMany({
    where: { approved: false },
    select: {
      id: true,
      name: true,
      createdAt: true,
      submittedByProfile: { select: { id: true, username: true } },
      software: {
        where: { approved: false },
        select: {
          software: { select: { id: true, name: true, category: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const data = tags.map((t) => ({
    ...t,
    software: t.software.map((s) => s.software),
  }));

  return NextResponse.json({ data });
}
