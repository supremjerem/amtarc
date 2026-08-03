-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "stages" INTEGER,
    "rounds" INTEGER,
    "feeCents" INTEGER NOT NULL DEFAULT 0,
    "registrationDeadline" TIMESTAMP(3),
    "published" BOOLEAN NOT NULL DEFAULT false,
    "paymentIban" TEXT,
    "paymentPayee" TEXT,
    "paymentInstructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Squad" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "day" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "targetSize" INTEGER NOT NULL DEFAULT 12,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Squad_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Squad" ADD CONSTRAINT "Squad_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
