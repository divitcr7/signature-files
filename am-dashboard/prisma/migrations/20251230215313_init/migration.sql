-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('AM', 'MANAGEMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AM',
    "amName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricMonthly" (
    "id" TEXT NOT NULL,
    "amName" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "netRetention" DOUBLE PRECISION NOT NULL,
    "grossRetention" DOUBLE PRECISION NOT NULL,
    "renewalPremium" DOUBLE PRECISION NOT NULL,
    "lostPremium" DOUBLE PRECISION NOT NULL,
    "newBizPremium" DOUBLE PRECISION NOT NULL,
    "policyCountStart" INTEGER NOT NULL,
    "policyCountEnd" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricMonthly_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "MetricMonthly_amName_month_idx" ON "MetricMonthly"("amName", "month");

-- CreateIndex
CREATE UNIQUE INDEX "MetricMonthly_amName_month_key" ON "MetricMonthly"("amName", "month");
