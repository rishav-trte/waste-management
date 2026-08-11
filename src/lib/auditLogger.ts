import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export interface AuditLogOptions {
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  role?: Role | null;
  action: string;
  entity: string;
  entityId?: string | null;
  details: string;
  ipAddress?: string | null;
}

export async function logAuditAction(options: AuditLogOptions) {
  try {
    const log = await prisma.auditLog.create({
      data: {
        userId: options.userId || null,
        userEmail: options.userEmail || null,
        userName: options.userName || null,
        role: options.role || null,
        action: options.action,
        entity: options.entity,
        entityId: options.entityId || null,
        details: options.details,
        ipAddress: options.ipAddress || null,
      },
    });
    return log;
  } catch (error) {
    console.error('Failed to write audit log:', error);
    return null;
  }
}
