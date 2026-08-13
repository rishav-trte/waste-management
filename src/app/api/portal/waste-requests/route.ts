import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WasteRequestStatus } from '@prisma/client';
import { logAuditAction } from '@/lib/auditLogger';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, id: userId } = session.user;
    const isStaff = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN', 'COLLECTOR'].includes(role);

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

    const { address, phone, latitude, longitude, propertyTypeId, wasteType, preferredDate, notes } = await req.json();

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
        phone: phone || null,
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

    // Audit Log Entry
    await logAuditAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      role: session.user.role,
      action: 'CREATE_WASTE_REQUEST',
      entity: 'WasteRequest',
      entityId: newRequest.id,
      details: `Scheduled ${wasteType} pickup request at '${address}' for ${new Date(preferredDate).toLocaleDateString()}`,
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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, collectorId } = await req.json();
    const { role, id: userId } = session.user;
    const isStaff = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN', 'COLLECTOR'].includes(role);

    if (!isStaff) {
      if (status !== 'CANCELLED' || collectorId !== undefined) {
        return NextResponse.json({ error: 'Unauthorized action' }, { status: 403 });
      }
      const existingRequest = await prisma.wasteRequest.findUnique({ where: { id } });
      if (!existingRequest || existingRequest.userId !== userId) {
        return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
      }
      if (existingRequest.status !== 'PENDING') {
        return NextResponse.json({ error: 'Only pending requests can be cancelled' }, { status: 400 });
      }
    }

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

    // Audit Log Entry
    await logAuditAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      role: session.user.role,
      action: isStaff ? 'UPDATE_WASTE_REQUEST' : 'CANCEL_WASTE_REQUEST',
      entity: 'WasteRequest',
      entityId: updated.id,
      details: isStaff ? `Updated Waste Pickup Request status to '${status}'` : `Cancelled pending Waste Pickup Request`,
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error('Error updating waste request:', error);
    return NextResponse.json({ error: 'Failed to update waste request' }, { status: 500 });
  }
}
