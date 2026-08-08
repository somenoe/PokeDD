-- CreateTable
CREATE TABLE "ShortLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Pokemon" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "dexNo" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "nameI18n" TEXT NOT NULL DEFAULT '{}',
    "type1" TEXT NOT NULL,
    "type2" TEXT,
    "hp" INTEGER NOT NULL,
    "atk" INTEGER NOT NULL,
    "def" INTEGER NOT NULL,
    "spa" INTEGER NOT NULL,
    "spd" INTEGER NOT NULL,
    "spe" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,
    "abilities" TEXT NOT NULL,
    "hiddenAbility" TEXT,
    "spriteUrl" TEXT NOT NULL,
    "games" TEXT NOT NULL DEFAULT '[]',
    "learnableMoves" TEXT NOT NULL DEFAULT '[]',
    "usageStats" TEXT NOT NULL DEFAULT '{}',
    "usagePct" REAL NOT NULL DEFAULT 0,
    "rank" INTEGER,
    "regulations" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Move" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameI18n" TEXT NOT NULL DEFAULT '{}',
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "power" INTEGER,
    "accuracy" INTEGER,
    "pp" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "targetShape" TEXT NOT NULL,
    "makesContact" BOOLEAN NOT NULL DEFAULT false,
    "effectText" TEXT NOT NULL,
    "effectI18n" TEXT NOT NULL DEFAULT '{}',
    "effectLongI18n" TEXT NOT NULL DEFAULT '{}',
    "effectChance" INTEGER,
    "usagePct" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Ability" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameI18n" TEXT NOT NULL DEFAULT '{}',
    "shortDesc" TEXT NOT NULL,
    "shortDescI18n" TEXT NOT NULL DEFAULT '{}',
    "longDesc" TEXT NOT NULL,
    "longDescI18n" TEXT NOT NULL DEFAULT '{}',
    "usagePct" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameI18n" TEXT NOT NULL DEFAULT '{}',
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descI18n" TEXT NOT NULL DEFAULT '{}',
    "descLongI18n" TEXT NOT NULL DEFAULT '{}',
    "games" TEXT NOT NULL DEFAULT '[]',
    "usagePct" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Regulation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "maxVp" INTEGER NOT NULL,
    "allowTera" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" DATETIME NOT NULL,
    "validTo" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "ShortLink_hash_key" ON "ShortLink"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "Pokemon_slug_key" ON "Pokemon"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Move_slug_key" ON "Move"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Ability_slug_key" ON "Ability"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Item_slug_key" ON "Item"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Regulation_slug_key" ON "Regulation"("slug");
