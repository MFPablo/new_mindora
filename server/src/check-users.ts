import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users in DB:", users);
    console.log("User count:", users.length);
  } catch (error) {
    console.error("Error querying users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
