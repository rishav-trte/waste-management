import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Total Metrics
    const totalCollections = await prisma.collection.count();
    const paidCollections = await prisma.collection.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { amountCharged: true },
      _count: { id: true },
    });

    const activeProperties = await prisma.property.count();
    const totalCollectors = await prisma.user.count({ where: { role: 'COLLECTOR' } });

    // 2. Collections by Property Type (Pie Chart)
    const collectionsByType = await prisma.collection.groupBy({
      by: ['pricingConfigId'],
      _count: { id: true },
      _sum: { amountCharged: true },
    });

    // Populate property type names for chart
    const pricingConfigs = await prisma.pricingConfig.findMany({
      include: { propertyType: true },
    });

    const pieChartData = collectionsByType.map((item) => {
      const config = pricingConfigs.find((c) => c.id === item.pricingConfigId);
      return {
        name: config?.propertyType.name || 'Unknown',
        count: item._count.id,
        revenue: Number(item._sum.amountCharged || 0),
      };
    });

    // 3. Collections trend (Recent 7 days)
    const recentCollections = await prisma.collection.findMany({
      orderBy: { collectedAt: 'desc' },
      take: 10,
      include: {
        property: { include: { propertyType: true } },
        collector: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      metrics: {
        totalCollections,
        totalRevenue: Number(paidCollections._sum.amountCharged || 0),
        paidCount: paidCollections._count.id,
        activeProperties,
        totalCollectors,
      },
      pieChartData,
      recentCollections,
    });
  } catch (error: any) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
