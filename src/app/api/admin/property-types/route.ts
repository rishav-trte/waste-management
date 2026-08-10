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

    const types = await prisma.propertyType.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { properties: true, pricingConfigs: true } },
      },
    });

    return NextResponse.json({ propertyTypes: types });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch property types' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json({ error: 'Property type name is required' }, { status: 400 });
    }

    const newType = await prisma.propertyType.create({
      data: {
        name,
        description,
      },
    });

    return NextResponse.json({ propertyType: newType }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A property type with this name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create property type' }, { status: 500 });
  }
}
