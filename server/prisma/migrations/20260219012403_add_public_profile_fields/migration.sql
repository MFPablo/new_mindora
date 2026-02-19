-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "isProfileEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isProfilePublic" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "licenseNumber" TEXT,
ADD COLUMN     "sessionPrice" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PatientProfessionalRelation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientProfessionalRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientProfessionalRelation_patientId_professionalId_key" ON "PatientProfessionalRelation"("patientId", "professionalId");

-- AddForeignKey
ALTER TABLE "PatientProfessionalRelation" ADD CONSTRAINT "PatientProfessionalRelation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientProfessionalRelation" ADD CONSTRAINT "PatientProfessionalRelation_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
