import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ensureAuditLogTableExists } from '@/lib/auditLogger';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedAdminRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const entity = searchParams.get('entity');

    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;

    try {
      const auditLogs = await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return NextResponse.json({ auditLogs });
    } catch (dbError: any) {
      if (dbError?.code === 'P2021') {
        // Self-heal table if missing
        await ensureAuditLogTableExists();
        const auditLogs = await prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        return NextResponse.json({ auditLogs });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ auditLogs: [] });
  }
}
