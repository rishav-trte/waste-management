import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { TicketCategory, TicketStatus } from '@prisma/client';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { name, email, phone, category, subject, description } = await req.json();

    if (!name || !email || !subject || !description) {
      return NextResponse.json({ error: 'Name, email, subject, and description are required' }, { status: 400 });
    }

    let freshdeskTicketId = null;

    // Optional integration with Freshdesk / Zoho Desk API if configured in environment
    const freshdeskDomain = process.env.FRESHDESK_DOMAIN; // e.g. "mycitymuni.freshdesk.com"
    const freshdeskApiKey = process.env.FRESHDESK_API_KEY;

    if (freshdeskDomain && freshdeskApiKey) {
      try {
        const authStr = Buffer.from(`${freshdeskApiKey}:X`).toString('base64');
        const fdRes = await fetch(`https://${freshdeskDomain}/api/v2/tickets`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${authStr}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name,
            email,
            subject,
            description,
            status: 2, // Open
            priority: 1, // Low/Normal
          }),
        });

        const fdData = await fdRes.json();
        if (fdData.id) {
          freshdeskTicketId = fdData.id.toString();
        }
      } catch (err) {
        console.warn('Freshdesk API relay warning:', err);
      }
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: session?.user?.id || null,
        name,
        email,
        phone: phone || null,
        category: (category as TicketCategory) || TicketCategory.GENERAL_INQUIRY,
        subject,
        description,
        status: TicketStatus.OPEN,
        freshdeskTicketId,
      },
    });

    return NextResponse.json({ ticket, message: 'Support ticket submitted successfully!' }, { status: 201 });
  } catch (error) {
    console.error('Error submitting support ticket:', error);
    return NextResponse.json({ error: 'Failed to submit support ticket' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status, adminNotes } = await req.json();

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        ...(status && { status: status as TicketStatus }),
        ...(adminNotes !== undefined && { adminNotes }),
      },
    });

    return NextResponse.json({ ticket: updated });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    return NextResponse.json({ error: 'Failed to update support ticket' }, { status: 500 });
  }
}
