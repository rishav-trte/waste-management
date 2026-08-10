import { PrismaClient, Role, PaymentStatus, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed operation...');

  // 1. Clean existing records
  await prisma.collection.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.pricingConfig.deleteMany({});
  await prisma.propertyType.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const collectorHash = await bcrypt.hash('Collector@123456', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@wastemgmt.gov.in',
      passwordHash: passwordHash,
      role: Role.ADMIN,
    },
  });

  const collector = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar (Field Officer)',
      email: 'collector1@wastemgmt.gov.in',
      passwordHash: collectorHash,
      role: Role.COLLECTOR,
    },
  });

  console.log(`✅ Users created: Admin (${admin.email}), Collector (${collector.email})`);

  // 3. Create Property Types
  const residential = await prisma.propertyType.create({
    data: {
      name: 'Residential',
      description: 'Single and multi-family household dwellings',
    },
  });

  const commercial = await prisma.propertyType.create({
    data: {
      name: 'Commercial',
      description: 'Shops, retail markets, offices, and restaurants',
    },
  });

  const industrial = await prisma.propertyType.create({
    data: {
      name: 'Industrial',
      description: 'Factories, processing plants, and warehouses',
    },
  });

  const institutional = await prisma.propertyType.create({
    data: {
      name: 'Institutional',
      description: 'Hospitals, schools, government offices, and places of worship',
    },
  });

  console.log('✅ Property Types created');

  // 4. Create Pricing Configurations
  const priceRes = await prisma.pricingConfig.create({
    data: {
      propertyTypeId: residential.id,
      price: 150.00,
      unit: 'per_month',
      effectiveFrom: new Date('2026-01-01'),
    },
  });

  const priceCom = await prisma.pricingConfig.create({
    data: {
      propertyTypeId: commercial.id,
      price: 500.00,
      unit: 'per_month',
      effectiveFrom: new Date('2026-01-01'),
    },
  });

  const priceInd = await prisma.pricingConfig.create({
    data: {
      propertyTypeId: industrial.id,
      price: 1200.00,
      unit: 'per_collection',
      effectiveFrom: new Date('2026-01-01'),
    },
  });

  const priceInst = await prisma.pricingConfig.create({
    data: {
      propertyTypeId: institutional.id,
      price: 400.00,
      unit: 'per_month',
      effectiveFrom: new Date('2026-01-01'),
    },
  });

  console.log('✅ Pricing Configs created');

  // 5. Create Sample Properties
  const prop1 = await prisma.property.create({
    data: {
      ownerName: 'Sunita Sharma',
      address: 'House #42, Sector 15, Connaught Place',
      phone: '+91 9876543210',
      propertyTypeId: residential.id,
      latitude: 28.6315,
      longitude: 77.2167,
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      ownerName: 'Green Leaf Cafe',
      address: 'Shop 12, Market Square, Janpath',
      phone: '+91 9876543211',
      propertyTypeId: commercial.id,
      latitude: 28.6250,
      longitude: 77.2180,
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      ownerName: 'Apex Steel Fabrication',
      address: 'Plot 88, Okhla Industrial Area Ph-III',
      phone: '+91 9876543212',
      propertyTypeId: industrial.id,
      latitude: 28.5355,
      longitude: 77.2650,
    },
  });

  const prop4 = await prisma.property.create({
    data: {
      ownerName: 'St. Mary Community Hospital',
      address: 'Block B, Ring Road, Lajpat Nagar',
      phone: '+91 9876543213',
      propertyTypeId: institutional.id,
      latitude: 28.5678,
      longitude: 77.2433,
    },
  });

  console.log('✅ Sample Properties created');

  // 6. Create Sample Collections
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  await prisma.collection.createMany({
    data: [
      {
        propertyId: prop1.id,
        collectorId: collector.id,
        pricingConfigId: priceRes.id,
        amountCharged: 150.00,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.CASH,
        paymentReference: 'CASH_REC_8912',
        notes: 'Monthly residential pickup completed',
        latitude: 28.6315,
        longitude: 77.2167,
        collectedAt: today,
      },
      {
        propertyId: prop2.id,
        collectorId: collector.id,
        pricingConfigId: priceCom.id,
        amountCharged: 500.00,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.ONLINE,
        paymentReference: 'pay_online_99012',
        notes: 'Commercial food waste segregated',
        latitude: 28.6250,
        longitude: 77.2180,
        collectedAt: today,
      },
      {
        propertyId: prop3.id,
        collectorId: collector.id,
        pricingConfigId: priceInd.id,
        amountCharged: 1200.00,
        paymentStatus: PaymentStatus.PENDING,
        paymentMethod: PaymentMethod.ONLINE,
        notes: 'Hazardous metal scraps handled',
        latitude: 28.5355,
        longitude: 77.2650,
        collectedAt: yesterday,
      },
      {
        propertyId: prop4.id,
        collectorId: collector.id,
        pricingConfigId: priceInst.id,
        amountCharged: 400.00,
        paymentStatus: PaymentStatus.PAID,
        paymentMethod: PaymentMethod.ONLINE,
        paymentReference: 'pay_inst_11029',
        notes: 'Bio-medical waste disposal protocols followed',
        latitude: 28.5678,
        longitude: 77.2433,
        collectedAt: threeDaysAgo,
      },
    ],
  });

  console.log('✅ Sample Collections created');
  console.log('🚀 Seed process completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
