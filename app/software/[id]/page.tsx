import { prisma } from '@/lib/prisma';
import type { SoftwareDetail } from '@/types';
import { notFound } from 'next/navigation';
import SoftwareDetailClient from './SoftwareDetailClient';

export const revalidate = 3600;

export async function generateStaticParams() {
  const software = await prisma.software.findMany({
    where: { approved: true },
    select: { id: true },
  });
  return software.map(({ id }) => ({ id }));
}

export default async function SoftwareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const raw = await prisma.software.findUnique({
    where: { id, approved: true },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      status: true,
      websiteUrl: true,
      downloadUrl: true,
      sourceUrl: true,
      createdAt: true,
      updatedAt: true,
      platforms: {
        select: { platform: { select: { id: true, name: true, group: true } } },
      },
      systems: {
        select: { system: { select: { id: true, name: true, manufacturer: true, type: true } } },
      },
      hardware: {
        select: { hardware: { select: { id: true, name: true, manufacturer: true, type: true } } },
      },
      tags: {
        where: { approved: true },
        select: { tag: { select: { id: true, name: true } } },
      },
      qualityRatings: {
        select: {
          id: true,
          score: true,
          comment: true,
          createdAt: true,
          user: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      performanceRatings: {
        select: {
          id: true,
          score: true,
          comment: true,
          createdAt: true,
          hardware: { select: { id: true, name: true } },
          user: { select: { username: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
    },
  });

  if (!raw) {
    notFound();
  }

  const [similar, qualityAggregate, performanceAggregate] = await Promise.all([
    prisma.software.findMany({
      where: { approved: true, category: raw.category, id: { not: id } },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        status: true,
        websiteUrl: true,
        downloadUrl: true,
        sourceUrl: true,
        avgQuality: true,
        createdAt: true,
        updatedAt: true,
        platforms: { select: { platform: { select: { id: true, name: true, group: true } } } },
        systems: { select: { system: { select: { id: true, name: true, manufacturer: true, type: true } } } },
        hardware: { select: { hardware: { select: { id: true, name: true, manufacturer: true, type: true } } } },
        tags: { where: { approved: true }, select: { tag: { select: { id: true, name: true } } } },
        _count: { select: { qualityRatings: true } },
      },
      take: 4,
      orderBy: { avgQuality: { sort: 'desc', nulls: 'last' } },
    }),
    prisma.qualityRating.aggregate({
      where: { softwareId: id },
      _avg: { score: true },
      _count: true,
    }),
    prisma.performanceRating.aggregate({
      where: { softwareId: id },
      _avg: { score: true },
    }),
  ]);

  const data: SoftwareDetail = {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    category: raw.category,
    status: raw.status,
    websiteUrl: raw.websiteUrl,
    downloadUrl: raw.downloadUrl,
    sourceUrl: raw.sourceUrl,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt?.toISOString() ?? null,
    platforms: raw.platforms.map((p) => p.platform),
    systems: raw.systems.map((s) => s.system),
    hardware: raw.hardware.map((h) => h.hardware),
    tags: raw.tags.map((t) => t.tag),
    avgQuality: qualityAggregate._avg.score,
    avgPerformance: performanceAggregate._avg.score,
    ratingCount: qualityAggregate._count,
    qualityRatings: raw.qualityRatings.map((r) => ({
      id: r.id,
      score: r.score,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      user: r.user,
    })),
    performanceRatings: raw.performanceRatings.map((r) => ({
      id: r.id,
      score: r.score,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      hardware: r.hardware,
      user: r.user,
    })),
    similar: similar.map(({ _count, ...s }) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      status: s.status,
      websiteUrl: s.websiteUrl,
      downloadUrl: s.downloadUrl,
      sourceUrl: s.sourceUrl,
      avgQuality: s.avgQuality,
      avgPerformance: null,
      ratingCount: _count.qualityRatings,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt?.toISOString() ?? null,
      platforms: s.platforms.map((p) => p.platform),
      systems: s.systems.map((sv) => sv.system),
      hardware: s.hardware.map((h) => h.hardware),
      tags: s.tags.map((t) => t.tag),
    })),
  };

  return <SoftwareDetailClient initialData={data} />;
}
