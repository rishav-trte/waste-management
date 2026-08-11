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

    const { amount, collectionId, wasteRequestId } = await req.json();

    const numericAmount = parseFloat(amount || '150');
    const orderId = `rzp_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_mockKey123';

    // If Razorpay API Secret is set, create order via Razorpay API
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (keySecret) {
      try {
        const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: Math.round(numericAmount * 100), // in paise
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
          }),
        });

        const rzpData = await rzpResponse.json();
        if (rzpData.id) {
          await prisma.paymentOrder.create({
            data: {
              razorpayOrderId: rzpData.id,
              amount: numericAmount,
              currency: 'INR',
              status: 'CREATED',
              userId: session.user.id,
              collectionId,
              wasteRequestId,
            },
          });

          return NextResponse.json({
            orderId: rzpData.id,
            key: keyId,
            amount: rzpData.amount,
            currency: 'INR',
          });
        }
      } catch (err) {
        console.warn('Razorpay API fallback to simulated mode:', err);
      }
    }

    // Default / Mock Order creation for development and testing
    await prisma.paymentOrder.create({
      data: {
        razorpayOrderId: orderId,
        amount: numericAmount,
        currency: 'INR',
        status: 'CREATED',
        userId: session.user.id,
        collectionId,
        wasteRequestId,
      },
    });

    return NextResponse.json({
      orderId,
      key: keyId,
      amount: Math.round(numericAmount * 100),
      currency: 'INR',
      isSimulation: !keySecret,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ error: 'Failed to create Razorpay order' }, { status: 500 });
  }
}
