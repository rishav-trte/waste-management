import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logAuditAction } from '@/lib/auditLogger';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'COLLECTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ownerName, address, phone, propertyTypeId, latitude, longitude } = await req.json();

    if (!ownerName || !address || !propertyTypeId || latitude === undefined || longitude === undefined) {
      return NextResponse.json({ error: 'Missing required property details' }, { status: 400 });
    }

    // Check if the property type exists
    const propertyType = await prisma.propertyType.findUnique({
      where: { id: propertyTypeId },
    });

    if (!propertyType) {
      return NextResponse.json({ error: 'Invalid building type selected' }, { status: 400 });
    }

    const newProperty = await prisma.property.create({
      data: {
        ownerName,
        address,
        phone: phone || null,
        propertyTypeId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      include: {
        propertyType: true,
      },
    });

    // Log Audit Trail
    await logAuditAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      role: session.user.role,
      action: 'REGISTER_NEW_PROPERTY',
      entity: 'Property',
      entityId: newProperty.id,
      details: `Collector registered new property '${ownerName}' during field collection.`,
    });

    return NextResponse.json({ property: newProperty }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating property:', error);
    return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
  }
}
