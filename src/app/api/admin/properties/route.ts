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

    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        propertyType: {
          include: {
            pricingConfigs: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        _count: { select: { collections: true } },
      },
    });

    const formattedProperties = properties.map((p) => {
      const activePricing = p.propertyType?.pricingConfigs?.[0];
      return {
        ...p,
        propertyType: {
          ...p.propertyType,
          activePrice: activePricing?.price ? Number(activePricing.price) : 0,
          activeUnit: activePricing?.unit || 'per_collection',
        },
      };
    });

    return NextResponse.json({ properties: formattedProperties });
  } catch (error) {
    console.error('Failed to fetch properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ownerName, address, propertyTypeId, phone, latitude, longitude } = await req.json();

    if (!ownerName || !address || !propertyTypeId) {
      return NextResponse.json({ error: 'Owner name, address, and property type are required' }, { status: 400 });
    }

    const property = await prisma.property.create({
      data: {
        ownerName,
        address,
        propertyTypeId,
        phone,
        latitude: parseFloat(latitude || '28.6139'),
        longitude: parseFloat(longitude || '77.2090'),
      },
      include: {
        propertyType: {
          include: {
            pricingConfigs: {
              where: { isActive: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    // Log Audit Trail
    await logAuditAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      role: session.user.role,
      action: 'CREATE_PROPERTY',
      entity: 'Property',
      entityId: property.id,
      details: `Created Property for '${ownerName}' at '${address}'`,
    });

    const activePricing = property.propertyType?.pricingConfigs?.[0];

    return NextResponse.json(
      {
        property: {
          ...property,
          propertyType: {
            ...property.propertyType,
            activePrice: activePricing?.price ? Number(activePricing.price) : 0,
            activeUnit: activePricing?.unit || 'per_collection',
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
