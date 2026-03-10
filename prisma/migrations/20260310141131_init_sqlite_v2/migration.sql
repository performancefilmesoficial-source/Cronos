-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "whatsapp" TEXT,
    "role" TEXT NOT NULL DEFAULT 'SOCIAL_MEDIA',
    "active" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "handle" TEXT,
    "logo" TEXT,
    "accentColor" TEXT,
    "primaryColor" TEXT,
    "secondaryColor" TEXT,
    "industry" TEXT,
    "activeContract" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'Ativo',
    "managerId" TEXT,
    "driveUrl" TEXT,
    "branding" JSONB,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Demand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "theme" TEXT,
    "briefing" TEXT,
    "caption" TEXT,
    "mediaUrl" TEXT,
    "date" DATETIME NOT NULL,
    "clientId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Demand_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Demand_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "demandId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Comment_demandId_fkey" FOREIGN KEY ("demandId") REFERENCES "Demand" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "date" DATETIME NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PREVISTO',
    "isRecurrent" BOOLEAN NOT NULL DEFAULT false,
    "clientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "whatsappEngine" TEXT NOT NULL DEFAULT 'META',
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "baseFolderPath" TEXT,
    "metaToken" TEXT,
    "metaPhoneId" TEXT,
    "metaRecipientId" TEXT,
    "evolutionToken" TEXT,
    "evolutionUrl" TEXT,
    "evolutionGroupId" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Demand_clientId_idx" ON "Demand"("clientId");

-- CreateIndex
CREATE INDEX "Demand_assignedToId_idx" ON "Demand"("assignedToId");
