
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debug() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, name: true }
  });

  console.log("Database Users:");
  users.forEach(u => {
    console.log(`- ID: ${u.id}, Email: ${u.email}, Name: ${u.name}, Role: ${u.role}`);
  });
}

debug().catch(console.error).finally(() => prisma.$disconnect());
