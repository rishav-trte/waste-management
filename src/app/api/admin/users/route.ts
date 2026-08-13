import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { logAuditAction } from '@/lib/auditLogger';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const allowedAdminRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        vehicleType: true,
        vehicleNumber: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users', users: [] }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedAdminRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, password, role, vehicleType, vehicleNumber } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userRole = (role as Role) || Role.COLLECTOR;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: userRole,
        vehicleType: userRole === 'COLLECTOR' ? vehicleType : null,
        vehicleNumber: userRole === 'COLLECTOR' ? vehicleNumber : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        vehicleType: true,
        vehicleNumber: true,
        createdAt: true,
      },
    });

    // Log Audit Trail
    await logAuditAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      role: session.user.role,
      action: 'CREATE_USER',
      entity: 'User',
      entityId: newUser.id,
      details: `Created new municipal user account '${name}' (${email}) with role ${userRole}`,
    });

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedAdminRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedAdminRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, role, password, vehicleType, vehicleNumber } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (role) updateData.role = role as Role;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 10);
    if (vehicleType !== undefined) updateData.vehicleType = role === 'COLLECTOR' || (!role && updateData.role === 'COLLECTOR') ? vehicleType : null;
    if (vehicleNumber !== undefined) updateData.vehicleNumber = role === 'COLLECTOR' || (!role && updateData.role === 'COLLECTOR') ? vehicleNumber : null;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        vehicleType: true,
        vehicleNumber: true,
        createdAt: true,
      },
    });

    // Log Audit Trail
    await logAuditAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userName: session.user.name,
      role: session.user.role,
      action: 'UPDATE_USER',
      entity: 'User',
      entityId: updatedUser.id,
      details: `Updated user account '${updatedUser.name}' (${updatedUser.email}) role to ${updatedUser.role}`,
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
