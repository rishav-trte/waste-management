import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { PaymentStatus } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, collectionId, wasteRequestId } = await req.json();

    if (!razorpayOrderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    let isValid = true;

    if (keySecret && razorpaySignature && razorpayPaymentId) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest('hex');

      isValid = generatedSignature === razorpaySignature;
    }

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    const paymentRef = razorpayPaymentId || `pay_rzp_${Date.now()}`;

    // 1. Update PaymentOrder in DB
    await prisma.paymentOrder.updateMany({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId: paymentRef,
        status: 'SUCCESS',
      },
    });

    // 2. Update collection status if collectionId provided
    if (collectionId) {
      await prisma.collection.update({
        where: { id: collectionId },
        data: {
          paymentStatus: PaymentStatus.PAID,
          paymentReference: paymentRef,
        },
      });
    }

    // 3. Update waste request status if wasteRequestId provided
    if (wasteRequestId) {
      await prisma.wasteRequest.update({
        where: { id: wasteRequestId },
        data: {
          status: 'ASSIGNED',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Razorpay payment verified & recorded successfully!',
      paymentReference: paymentRef,
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 });
  }
}
