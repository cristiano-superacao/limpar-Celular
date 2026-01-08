-- Create Enums
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "CleaningStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SCANNED', 'COMPLETED');
CREATE TYPE "CloudProvider" AS ENUM ('NONE', 'AZURE_BLOB', 'AWS_S3', 'GOOGLE_DRIVE', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CleaningRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CleaningStatus" NOT NULL DEFAULT 'PENDING',
    "deviceInfo" TEXT,
    "scanResultJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CleaningRequest_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "CleaningRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CloudConfig" (
    "id" TEXT NOT NULL,
    "provider" "CloudProvider" NOT NULL DEFAULT 'NONE',
    "enabled" BOOLEAN NOT NULL DEFAULT FALSE,
    "bucketOrContainer" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CloudConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User" ("email");

-- CreateIndex
CREATE INDEX "CleaningRequest_userId_idx" ON "CleaningRequest" ("userId");

-- CreateIndex
CREATE INDEX "CleaningRequest_status_idx" ON "CleaningRequest" ("status");
