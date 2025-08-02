import { PrismaClient } from '../src/generated/prisma';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@athleteanalytics.com' },
    update: {},
    create: {
      email: 'admin@athleteanalytics.com',
      password: adminPasswordHash,
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      tenantUniqueId: 'admin_user_001',
    },
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create sample tenants
  const tenants = [
    {
      name: 'Elite Sports Academy',
      city: 'New York',
      state: 'New York',
      country: 'USA',
      description: 'Premier sports training facility',
      isActive: true,
    },
    {
      name: 'Champions Fitness Center',
      city: 'Los Angeles',
      state: 'California',
      country: 'USA',
      description: 'Comprehensive fitness and athletic development',
      isActive: true,
    },
    {
      name: 'Athletic Performance Institute',
      city: 'Chicago',
      state: 'Illinois',
      country: 'USA',
      description: 'Professional athlete training and analytics',
      isActive: true,
    },
  ];

  for (const tenantData of tenants) {
    const tenant = await prisma.tenant.upsert({
      where: { id: tenants.indexOf(tenantData) + 1 },
      update: {},
      create: tenantData,
    });
    console.log('✅ Created tenant:', tenant.name);
  }

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });