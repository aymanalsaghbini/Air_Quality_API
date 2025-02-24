-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AirQualityData" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "co" DOUBLE PRECISION NOT NULL,
    "nmhc" DOUBLE PRECISION NOT NULL,
    "benzene" DOUBLE PRECISION NOT NULL,
    "nox" DOUBLE PRECISION NOT NULL,
    "no2" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "AirQualityData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
