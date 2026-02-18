import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const redemptions = await prisma.promoKeyRedemption.findMany({
      include: {
        promoKey: true,
        user: { select: { email: true, name: true } }
      }
    });

    const transactions = await prisma.transaction.findMany({
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    console.log("--- All Transactions ---");
    console.log(JSON.stringify(transactions, null, 2));

    console.log("--- All Redemptions ---");
    console.log(JSON.stringify(redemptions, null, 2));

    console.log(`Summary: ${transactions.length} transactions, ${redemptions.length} redemptions.`);

  } catch (error) {
    console.error("Error diagnostic:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
