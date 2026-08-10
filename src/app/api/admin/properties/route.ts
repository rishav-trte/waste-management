import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
        propertyType: true,
        _count: { select: { collections: true } },
      },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
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
      include: { propertyType: true },
    });

    return NextResponse.json({ property }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
