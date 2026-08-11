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

export async function ensureAuditLogTableExists() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "AuditLog" (
        "id" TEXT NOT NULL,
        "userId" TEXT,
        "userEmail" TEXT,
        "userName" TEXT,
        "role" "Role",
        "action" TEXT NOT NULL,
        "entity" TEXT NOT NULL,
        "entityId" TEXT,
        "details" TEXT NOT NULL,
        "ipAddress" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AuditLog_action_idx" ON "AuditLog"("action");`);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "AuditLog_entity_idx" ON "AuditLog"("entity");`);
  } catch (err) {
    console.error('Error ensuring AuditLog table exists:', err);
  }
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
  } catch (error: any) {
    // Self-healing: If table missing, create table and retry once
    if (error?.code === 'P2021') {
      await ensureAuditLogTableExists();
      try {
        return await prisma.auditLog.create({
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
      } catch (retryErr) {
        console.error('Failed to write audit log after table creation:', retryErr);
      }
    } else {
      console.error('Failed to write audit log:', error);
    }
    return null;
  }
}
