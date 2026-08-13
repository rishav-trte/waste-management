import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { logAuditAction } from '@/lib/auditLogger';

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Full name, email address, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 400 }
      );
    }

    // Limit check: Maximum 5 Citizen accounts during beta
    const citizenCount = await prisma.user.count({
      where: { role: Role.USER },
    });

    if (citizenCount >= 5) {
      return NextResponse.json(
        {
          error:
            'Registration limit reached (maximum 5 citizen accounts allowed during beta). Please contact municipal support.',
        },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create Citizen user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: Role.USER,
      },
    });

    // Write audit log
    await logAuditAction({
      userId: newUser.id,
      userEmail: newUser.email,
      userName: newUser.name,
      role: Role.USER,
      action: 'CITIZEN_SIGNUP',
      entity: 'User',
      entityId: newUser.id,
      details: `Registered new Citizen account (${newUser.email}) with phone ${phone || 'N/A'} (Citizen #${citizenCount + 1}/5)`,
    });

    return NextResponse.json(
      {
        message: 'Citizen registration successful',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error during citizen signup:', error);
    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}
