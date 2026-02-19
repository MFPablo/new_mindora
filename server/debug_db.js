
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
  const professional = await prisma.user.findFirst({
    where: { email: 'professional@mindora.com' }
  });

  if (!professional) {
    console.log("Professional user not found in DB");
    return;
  }

  console.log("Found professional:", {
    id: professional.id,
    role: professional.role,
    isProfilePublic: professional.isProfilePublic,
    isProfileEnabled: professional.isProfileEnabled,
    isProfessionalActive: professional.isProfessionalActive
  });
}

debug().catch(console.error).finally(() => prisma.$disconnect());
