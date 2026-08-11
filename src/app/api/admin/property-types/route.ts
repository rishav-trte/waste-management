import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAuditAction } from '@/lib/auditLogger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const types = await prisma.propertyType.findMany({
      orderBy: { name: 'asc' },
      include: {
        pricingConfigs: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: { select: { properties: true, pricingConfigs: true } },
      },
    });

    const formattedTypes = types.map((t) => ({
      ...t,
      activePrice: t.pricingConfigs[0]?.price ? Number(t.pricingConfigs[0].price) : 0,
      activeUnit: t.pricingConfigs[0]?.unit || 'per_collection',
    }));

    return NextResponse.json({ propertyTypes: formattedTypes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch property types' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, price, unit } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Property type name is required' }, { status: 400 });
    }

    const newType = await prisma.propertyType.create({
      data: {
        name,
        description,
      },
    });

    const parsedPrice = parseFloat(price || '100');
    const newPricingConfig = await prisma.pricingConfig.create({
      data: {
        propertyTypeId: newType.id,
        price: parsedPrice,
        unit: unit || 'per_collection',
        isActive: true,
      },
    });

    // Log Audit Trail
    await logAuditAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      role: session.user.role,
      action: 'CREATE_PROPERTY_TYPE',
      entity: 'PropertyType',
      entityId: newType.id,
      details: `Created Property Category '${name}' with tariff ₹${parsedPrice}/${unit || 'per_collection'}`,
    });

    return NextResponse.json(
      {
        propertyType: {
          ...newType,
          activePrice: Number(newPricingConfig.price),
          activeUnit: newPricingConfig.unit,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A property type with this name already exists' }, { status: 400 });
    }
    console.error('Error creating property type:', error);
    return NextResponse.json({ error: 'Failed to create property type' }, { status: 500 });
  }
}
