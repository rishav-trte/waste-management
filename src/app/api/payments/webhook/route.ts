import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const { collectionId, paymentReference, status } = await req.json();

    if (!collectionId) {
      return NextResponse.json({ error: 'Missing collectionId' }, { status: 400 });
    }

    const updatedCollection = await prisma.collection.update({
      where: { id: collectionId },
      data: {
        paymentStatus: status === 'SUCCESS' ? PaymentStatus.PAID : PaymentStatus.FAILED,
        paymentReference: paymentReference || `PAY_CONFIRMED_${Date.now()}`,
      },
    });

    return NextResponse.json({
      success: true,
      collection: updatedCollection,
    });
  } catch (error) {
    console.error('Webhook confirmation error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
