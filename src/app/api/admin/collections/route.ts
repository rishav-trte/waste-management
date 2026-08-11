import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedAdminRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const cursor = searchParams.get('cursor');
    const status = searchParams.get('status');
    const propertyTypeId = searchParams.get('propertyTypeId');

    const where: any = {};
    if (status) where.paymentStatus = status;
    if (propertyTypeId) where.property = { propertyTypeId };

    const collections = await prisma.collection.findMany({
      take: limit + 1,
      cursor: cursor ? { id: cursor } : undefined,
      where,
      orderBy: { collectedAt: 'desc' },
      include: {
        property: { include: { propertyType: true } },
        collector: { select: { name: true, email: true } },
        pricingConfig: true,
      },
    });

    let nextCursor: string | undefined = undefined;
    if (collections.length > limit) {
      const nextItem = collections.pop();
      nextCursor = nextItem?.id;
    }

    return NextResponse.json({
      collections,
      nextCursor,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
