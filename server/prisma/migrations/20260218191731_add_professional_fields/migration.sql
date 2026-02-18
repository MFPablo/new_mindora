-- CreateEnum
CREATE TYPE "PromoKeyType" AS ENUM ('FREE_15_DAYS', 'DISCOUNT_20', 'DISCOUNT_50', 'FREE_MONTH');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "address" TEXT,
ADD COLUMN     "isProfessionalActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "specialty" TEXT,
ADD COLUMN     "workingHours" JSONB;

-- CreateTable
CREATE TABLE "PromoKey" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "type" "PromoKeyType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "uses" INTEGER NOT NULL,
    "used" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoKeyRedemption" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promoKeyId" TEXT NOT NULL,
    "redeemedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromoKeyRedemption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoKey_key_key" ON "PromoKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "PromoKeyRedemption_userId_promoKeyId_key" ON "PromoKeyRedemption"("userId", "promoKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_email_token_key" ON "PasswordResetToken"("email", "token");

-- AddForeignKey
ALTER TABLE "PromoKeyRedemption" ADD CONSTRAINT "PromoKeyRedemption_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoKeyRedemption" ADD CONSTRAINT "PromoKeyRedemption_promoKeyId_fkey" FOREIGN KEY ("promoKeyId") REFERENCES "PromoKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
