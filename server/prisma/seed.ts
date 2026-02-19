import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with encrypted passwords...');

  const hashedPassword = await Bun.password.hash('password123');

  // Create Admin User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mindora.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'admin@mindora.com',
      name: 'Admin Mindora',
      role: 'admin',
      password: hashedPassword,
    },
  });

  // Create Patient User
  const patient = await prisma.user.upsert({
    where: { email: 'patient@mindora.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'patient@mindora.com',
      name: 'Patient Test',
      role: 'patient',
      password: hashedPassword,
    },
  });

  // Create Professional User
  console.log('Seeding professional user...');
  const professional = await prisma.user.upsert({
    where: { email: 'professional@mindora.com' },
    update: {
      password: hashedPassword,
      isProfessionalActive: true,
      role: 'professional',
      onboardingStep: 3,
      specialty: 'Psicología Clínica',
      licenseNumber: 'MN-2024-1234',
      bio: 'Especialista en terapia cognitivo-conductual con más de 12 años de experiencia. Mi enfoque combina técnicas basadas en evidencia con prácticas de mindfulness para ayudarte a construir resiliencia y encontrar equilibrio. Creo en crear un espacio seguro y sin juicios para la sanación.',
      languages: ['Español', 'Inglés'],
      sessionPrice: 180.0,
      isProfilePublic: true,
      isProfileEnabled: true,
      minAnticipationHours: 1,
      workingHours: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '14:00' },
      }
    },
    create: {
      email: 'professional@mindora.com',
      name: 'Dr. Mindora Pro',
      role: 'professional',
      password: hashedPassword,
      isProfessionalActive: true,
      onboardingStep: 3,
      specialty: 'Psicología Clínica',
      licenseNumber: 'MN-2024-1234',
      bio: 'Especialista en terapia cognitivo-conductual con más de 12 años de experiencia. Mi enfoque combina técnicas basadas en evidencia con prácticas de mindfulness para ayudarte a construir resiliencia y encontrar equilibrio. Creo en crear un espacio seguro y sin juicios para la sanación.',
      languages: ['Español', 'Inglés'],
      sessionPrice: 180.0,
      isProfilePublic: true,
      isProfileEnabled: true,
      minAnticipationHours: 1,
      workingHours: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '14:00' },
      }
    },
  });

  // Create Transactions for Professional
  console.log('Seeding transactions...');
  const txs = [
    {
      userId: professional.id,
      amount: 290.00,
      concept: 'Plan Premium Anual',
      plan: 'professional_yearly',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    },
    {
      userId: professional.id,
      amount: 29.00,
      concept: 'Renovación Mensual Extra',
      plan: 'professional_monthly',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    }
  ];

  for (const t of txs) {
    await prisma.transaction.create({ data: t });
  }

  // Create Promo Keys
  console.log('Seeding promo keys...');
  const keys = [
    {
      key: 'WELCOME15',
      type: 'FREE_15_DAYS',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      uses: 100,
    },
    {
      key: 'MINDORA20',
      type: 'DISCOUNT_20',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      uses: 50,
    },
    {
      key: 'TEST_REDEEMED',
      type: 'FREE_MONTH',
      startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      uses: 1,
      used: 1
    }
  ];

  for (const k of keys) {
    // @ts-ignore
    const pk = await prisma.promoKey.upsert({
      where: { key: k.key },
      update: {},
      create: k,
    });

    if (k.key === 'TEST_REDEEMED') {
      await prisma.promoKeyRedemption.upsert({
        where: { userId_promoKeyId: { userId: professional.id, promoKeyId: pk.id } },
        update: {},
        create: { userId: professional.id, promoKeyId: pk.id, redeemedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) }
      });
    }
  }

  // Create Appointments
  console.log('Seeding appointments...');
  const appointments = [
    {
      patientId: patient.id,
      professionalId: professional.id,
      dateTime: new Date(new Date().getFullYear(), new Date().getMonth(), 24, 14, 0), // Today (or 24th) at 14:00
      status: 'confirmed',
      type: 'VIRTUAL',
      notes: 'Sesión de seguimiento mensual',
    },
    {
      patientId: patient.id,
      professionalId: professional.id,
      dateTime: new Date(new Date().getFullYear(), new Date().getMonth(), 25, 10, 0), // Tomorrow at 10:00
      status: 'confirmed',
      type: 'FACE_TO_FACE',
      notes: 'Control general',
    },
    {
      patientId: patient.id,
      professionalId: professional.id,
      dateTime: new Date(new Date().getFullYear(), new Date().getMonth(), 26, 16, 30), // Day after tomorrow at 16:30
      status: 'confirmed',
      type: 'VIRTUAL',
      notes: 'Terapia cognitivo-conductual',
    },
    {
      patientId: patient.id,
      professionalId: professional.id,
      dateTime: new Date(new Date().getFullYear(), new Date().getMonth(), 3, 14, 0), // 3rd at 14:00
      status: 'confirmed',
      type: 'VIRTUAL',
      notes: 'Sesión inicial',
    }
  ];

  for (const a of appointments) {
    await prisma.appointment.upsert({
      where: {
        professionalId_dateTime: {
          professionalId: a.professionalId,
          dateTime: a.dateTime,
        }
      },
      update: {
        type: a.type as any,
      },
      create: a as any,
    });
  }

  console.log({
    admin: { ...admin, password: '[PROTECTED]' },
    patient: { ...patient, password: '[PROTECTED]' },
    professional: { ...professional, password: '[PROTECTED]' },
    promoKeys: keys.map(k => k.key),
    appointmentsCount: appointments.length
  });
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
