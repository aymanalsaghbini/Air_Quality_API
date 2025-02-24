/*
  Warnings:

  - You are about to drop the `AirQualityData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "air_quality"."AirQualityData";

-- CreateTable
CREATE TABLE "air_quality"."air_quality.air_quality_data" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "CO(GT)" DOUBLE PRECISION,
    "PT08.S1(CO)" DOUBLE PRECISION,
    "NMHC(GT)" DOUBLE PRECISION,
    "C6H6(GT)" DOUBLE PRECISION,
    "PT08.S2(NMHC)" DOUBLE PRECISION,
    "NOx(GT)" DOUBLE PRECISION,
    "PT08.S3(NOx)" DOUBLE PRECISION,
    "NO2(GT)" DOUBLE PRECISION,
    "PT08.S4(NO2)" DOUBLE PRECISION,
    "PT08.S5(O3)" DOUBLE PRECISION,
    "t" DOUBLE PRECISION,
    "rh" DOUBLE PRECISION,
    "ah" DOUBLE PRECISION,

    CONSTRAINT "air_quality.air_quality_data_pkey" PRIMARY KEY ("id")
);
