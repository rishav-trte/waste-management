import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collectionId } = await req.json();

    if (!collectionId) {
      return NextResponse.json({ error: 'Collection ID is required' }, { status: 400 });
    }

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      include: { property: true },
    });

    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Generate standard order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    return NextResponse.json({
      orderId,
      amount: Number(collection.amountCharged),
      currency: 'INR',
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo_key',
      collectionId: collection.id,
      ownerName: collection.property.ownerName,
      address: collection.property.address,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}
