import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const redemptions = await prisma.promoKeyRedemption.findMany({
      include: {
        promoKey: true,
        user: {
          select: {
            email: true,
            name: true
          }
        }
      }
    });

    console.log("--- Current Redemptions ---");
    console.log(JSON.stringify(redemptions, null, 2));
    console.log(`Total redemptions: ${redemptions.length}`);

    const keys = await prisma.promoKey.findMany();
    console.log("--- Current Promo Keys ---");
    console.log(JSON.stringify(keys.map((k: any) => ({ key: k.key, used: k.used, uses: k.uses })), null, 2));

  } catch (error) {
    console.error("Error diagnostic:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
