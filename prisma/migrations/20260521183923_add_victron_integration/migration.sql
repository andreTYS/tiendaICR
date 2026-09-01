-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'CLIENT';

-- CreateTable
CREATE TABLE "VictronConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "encryptedToken" TEXT NOT NULL DEFAULT '',
    "tokenIv" TEXT NOT NULL DEFAULT '',
    "tokenTag" TEXT NOT NULL DEFAULT '',
    "victronUserId" INTEGER,
    "victronUserName" TEXT,
    "victronEmail" TEXT,
    "lastTestedAt" TIMESTAMP(3),
    "lastTestOk" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VictronConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VictronSite" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "idSite" INTEGER NOT NULL,
    "displayName" TEXT,
    "isPublicMetrics" BOOLEAN NOT NULL DEFAULT false,
    "showPv" BOOLEAN NOT NULL DEFAULT true,
    "showBattery" BOOLEAN NOT NULL DEFAULT true,
    "showLoad" BOOLEAN NOT NULL DEFAULT true,
    "showGrid" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncAt" TIMESTAMP(3),
    "lastSnapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VictronSite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VictronSite_projectId_key" ON "VictronSite"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "VictronSite_idSite_key" ON "VictronSite"("idSite");

-- CreateIndex
CREATE INDEX "ClientAccess_userId_idx" ON "ClientAccess"("userId");

-- CreateIndex
CREATE INDEX "ClientAccess_projectId_idx" ON "ClientAccess"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ClientAccess_userId_projectId_key" ON "ClientAccess"("userId", "projectId");

-- AddForeignKey
ALTER TABLE "VictronSite" ADD CONSTRAINT "VictronSite_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAccess" ADD CONSTRAINT "ClientAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientAccess" ADD CONSTRAINT "ClientAccess_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
