import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const allowedRoles = ['COMMISSIONER', 'SUB_ADMIN', 'ADMIN'];
    if (!session || !allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    let createdPropertiesCount = 0;
    let createdUsersCount = 0;
    let createdTypesCount = 0;

    // 1. Process Property Types & Properties (First sheet or 'Properties')
    const sheetName = workbook.SheetNames[0];
    const sheetData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    for (const row of sheetData) {
      const ownerName = row['Owner Name'] || row['ownerName'] || row['Owner'] || row['Name'];
      const address = row['Address'] || row['address'] || row['Location'];
      const typeName = row['Property Type'] || row['propertyType'] || row['Category'] || 'Residential';
      const phone = row['Phone'] || row['phone'] || row['Mobile'] || '';
      const price = row['Price'] || row['price'] || row['Fee'] || '150';
      const lat = parseFloat(row['Latitude'] || row['lat'] || '28.6139');
      const lng = parseFloat(row['Longitude'] || row['lng'] || row['long'] || '77.2090');

      if (!ownerName || !address) continue;

      let pType = await prisma.propertyType.findFirst({
        where: { name: { equals: typeName, mode: 'insensitive' } },
        include: { pricingConfigs: { where: { isActive: true } } },
      });

      if (!pType) {
        pType = await prisma.propertyType.create({
          data: {
            name: typeName,
            description: `Auto-created from Excel import`,
          },
          include: { pricingConfigs: { where: { isActive: true } } },
        });
        createdTypesCount++;
      }

      if (!pType.pricingConfigs || pType.pricingConfigs.length === 0) {
        await prisma.pricingConfig.create({
          data: {
            propertyTypeId: pType.id,
            price: parseFloat(price.toString()),
            unit: 'per_collection',
            isActive: true,
          },
        });
      }

      await prisma.property.create({
        data: {
          ownerName: ownerName.toString(),
          address: address.toString(),
          phone: phone ? phone.toString() : null,
          propertyTypeId: pType.id,
          latitude: isNaN(lat) ? 28.6139 : lat,
          longitude: isNaN(lng) ? 77.2090 : lng,
        },
      });

      createdPropertiesCount++;
    }

    // 2. Process Users if 'Users' or second sheet exists
    if (workbook.SheetNames.length > 1) {
      const userSheetName = workbook.SheetNames.find((s) => s.toLowerCase().includes('user')) || workbook.SheetNames[1];
      if (userSheetName) {
        const userData: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[userSheetName]);
        for (const uRow of userData) {
          const uName = uRow['Name'] || uRow['name'];
          const uEmail = uRow['Email'] || uRow['email'];
          const uPassword = uRow['Password'] || uRow['password'] || 'Pass@123456';
          const uRoleRaw = (uRow['Role'] || uRow['role'] || 'COLLECTOR').toString().toUpperCase();

          if (!uName || !uEmail) continue;

          let role: Role = Role.COLLECTOR;
          if (uRoleRaw.includes('COMMISSIONER')) role = Role.COMMISSIONER;
          else if (uRoleRaw.includes('SUB')) role = Role.SUB_ADMIN;
          else if (uRoleRaw.includes('ADMIN')) role = Role.ADMIN;
          else if (uRoleRaw.includes('CITIZEN') || uRoleRaw.includes('USER')) role = Role.USER;

          const existing = await prisma.user.findUnique({ where: { email: uEmail.toString() } });
          if (!existing) {
            const passwordHash = await bcrypt.hash(uPassword.toString(), 10);
            await prisma.user.create({
              data: {
                name: uName.toString(),
                email: uEmail.toString(),
                passwordHash,
                role,
              },
            });
            createdUsersCount++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        propertiesCreated: createdPropertiesCount,
        usersCreated: createdUsersCount,
        propertyTypesCreated: createdTypesCount,
      },
    });
  } catch (error: any) {
    console.error('Error processing Excel upload:', error);
    return NextResponse.json({ error: 'Failed to process Excel file: ' + error.message }, { status: 500 });
  }
}
