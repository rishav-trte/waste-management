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

    const configs = await prisma.pricingConfig.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        propertyType: true,
      },
    });

    return NextResponse.json({ pricingConfigs: configs });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pricing configurations' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyTypeId, price, unit, effectiveFrom } = await req.json();

    if (!propertyTypeId || !price) {
      return NextResponse.json({ error: 'Property type and price are required' }, { status: 400 });
    }

    // Deactivate existing active configs for this property type
    await prisma.pricingConfig.updateMany({
      where: { propertyTypeId, isActive: true },
      data: { isActive: false, effectiveTo: new Date() },
    });

    const newConfig = await prisma.pricingConfig.create({
      data: {
        propertyTypeId,
        price: parseFloat(price),
        unit: unit || 'per_collection',
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        isActive: true,
      },
      include: { propertyType: true },
    });

    return NextResponse.json({ pricingConfig: newConfig }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create pricing configuration' }, { status: 500 });
  }
}
