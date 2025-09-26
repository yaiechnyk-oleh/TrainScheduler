/*
  Warnings:

  - The `status` column on the `Schedule` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `trainType` on the `Schedule` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."TrainType" AS ENUM ('INTERCITY', 'REGIONAL', 'NIGHT');

-- CreateEnum
CREATE TYPE "public"."ScheduleStatus" AS ENUM ('ON_TIME', 'DELAYED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."Schedule" DROP COLUMN "trainType",
ADD COLUMN     "trainType" "public"."TrainType" NOT NULL,
ALTER COLUMN "departAt" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "arriveAt" SET DATA TYPE TIMESTAMPTZ(6),
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ScheduleStatus" NOT NULL DEFAULT 'ON_TIME';

-- CreateTable
CREATE TABLE "public"."RefreshToken" (
    "id" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "replacedByToken" TEXT,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_jti_key" ON "public"."RefreshToken"("jti");

-- CreateIndex
CREATE INDEX "RefreshToken_userId_revoked_expiresAt_idx" ON "public"."RefreshToken"("userId", "revoked", "expiresAt");

-- CreateIndex
CREATE INDEX "Schedule_trainType_departAt_idx" ON "public"."Schedule"("trainType", "departAt");

-- AddForeignKey
ALTER TABLE "public"."RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
