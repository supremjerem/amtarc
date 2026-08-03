-- CreateEnum
CREATE TYPE "Division" AS ENUM ('OPEN', 'STANDARD', 'PRODUCTION', 'REVOLVER', 'CLASSIC', 'PRODUCTION_OPTICS', 'OPTICS', 'PCC');

-- CreateEnum
CREATE TYPE "ShooterCategory" AS ENUM ('OVERALL', 'JUNIOR', 'LADY', 'SENIOR', 'SUPER_SENIOR');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('AWAITING_PAYMENT', 'CONFIRMED', 'WAITLISTED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Registration" (
    "id" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "squadId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "licenceNumber" TEXT NOT NULL,
    "club" TEXT,
    "region" TEXT,
    "division" "Division" NOT NULL,
    "category" "ShooterCategory" NOT NULL DEFAULT 'OVERALL',
    "status" "RegistrationStatus" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SquadRequest" (
    "id" TEXT NOT NULL,
    "registrationId" TEXT NOT NULL,
    "requestedName" TEXT NOT NULL,

    CONSTRAINT "SquadRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Registration_reference_key" ON "Registration"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_matchId_email_key" ON "Registration"("matchId", "email");

-- AddForeignKey
ALTER TABLE "Registration" ADD CONSTRAINT "Registration_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SquadRequest" ADD CONSTRAINT "SquadRequest_registrationId_fkey" FOREIGN KEY ("registrationId") REFERENCES "Registration"("id") ON DELETE CASCADE ON UPDATE CASCADE;
