import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WasteRequestStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id: userId } = session.user;
    const isStaff = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'].includes(role);

    const requests = await prisma.wasteRequest.findMany({
      where: isStaff ? {} : { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        propertyType: true,
        collector: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching waste requests:', error);
    return NextResponse.json({ error: 'Failed to fetch waste requests' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { address, latitude, longitude, propertyTypeId, wasteType, preferredDate, notes } = await req.json();

    if (!address || !propertyTypeId || !preferredDate) {
      return NextResponse.json(
        { error: 'Address, property category, and preferred date are required' },
        { status: 400 }
      );
    }

    const newRequest = await prisma.wasteRequest.create({
      data: {
        userId: session.user.id,
        address,
        latitude: latitude ? parseFloat(latitude.toString()) : null,
        longitude: longitude ? parseFloat(longitude.toString()) : null,
        propertyTypeId,
        wasteType: wasteType || 'General Waste',
        preferredDate: new Date(preferredDate),
        notes: notes || null,
        status: WasteRequestStatus.PENDING,
      },
      include: {
        propertyType: true,
      },
    });

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Error creating waste request:', error);
    return NextResponse.json({ error: 'Failed to submit waste collection request' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, collectorId } = await req.json();

    const updated = await prisma.wasteRequest.update({
      where: { id },
      data: {
        ...(status && { status: status as WasteRequestStatus }),
        ...(collectorId !== undefined && { collectorId }),
      },
      include: {
        user: { select: { name: true, email: true } },
        propertyType: true,
        collector: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error('Error updating waste request:', error);
    return NextResponse.json({ error: 'Failed to update waste request' }, { status: 500 });
  }
}
