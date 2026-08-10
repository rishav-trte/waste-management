import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PaymentStatus, PaymentMethod } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'COLLECTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId, latitude, longitude, notes, paymentMethod, customAmount } = await req.json();

    if (!propertyId) {
      return NextResponse.json({ error: 'Property selection is required' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { propertyType: true },
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Find active pricing configuration for this property type
    const activePricing = await prisma.pricingConfig.findFirst({
      where: {
        propertyTypeId: property.propertyTypeId,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activePricing) {
      return NextResponse.json({ error: 'No active pricing config found for this property type' }, { status: 400 });
    }

    const amount = customAmount ? parseFloat(customAmount) : Number(activePricing.price);
    const pMethod = (paymentMethod as PaymentMethod) || PaymentMethod.CASH;

    const newCollection = await prisma.collection.create({
      data: {
        propertyId: property.id,
        collectorId: session.user.id,
        pricingConfigId: activePricing.id,
        amountCharged: amount,
        paymentStatus: pMethod === PaymentMethod.CASH ? PaymentStatus.PAID : PaymentStatus.PENDING,
        paymentMethod: pMethod,
        paymentReference: pMethod === PaymentMethod.CASH ? `CASH_${Date.now()}` : null,
        notes: notes || null,
        latitude: parseFloat(latitude || property.latitude.toString()),
        longitude: parseFloat(longitude || property.longitude.toString()),
      },
      include: {
        property: { include: { propertyType: true } },
        pricingConfig: true,
      },
    });

    return NextResponse.json({ collection: newCollection }, { status: 201 });
  } catch (error: any) {
    console.error('Error logging collection:', error);
    return NextResponse.json({ error: 'Failed to record collection' }, { status: 500 });
  }
}
