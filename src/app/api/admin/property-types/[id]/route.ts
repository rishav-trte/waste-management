import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { name, description, price, unit } = await req.json();

    const updatedType = await prisma.propertyType.update({
      where: { id },
      data: {
        name,
        description,
      },
    });

    let updatedPricing;
    if (price !== undefined) {
      // Deactivate previous pricing configs
      await prisma.pricingConfig.updateMany({
        where: { propertyTypeId: id, isActive: true },
        data: { isActive: false },
      });

      updatedPricing = await prisma.pricingConfig.create({
        data: {
          propertyTypeId: id,
          price: parseFloat(price),
          unit: unit || 'per_collection',
          isActive: true,
        },
      });
    }

    return NextResponse.json({
      propertyType: {
        ...updatedType,
        activePrice: updatedPricing ? Number(updatedPricing.price) : undefined,
        activeUnit: updatedPricing ? updatedPricing.unit : undefined,
      },
    });
  } catch (error) {
    console.error('Error updating property type:', error);
    return NextResponse.json({ error: 'Failed to update property type' }, { status: 500 });
  }
}
