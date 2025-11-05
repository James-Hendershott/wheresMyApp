-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "PendingUserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ContainerStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'MISSING');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('IN_STORAGE', 'CHECKED_OUT', 'DISCARDED');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('UNOPENED', 'OPENED_COMPLETE', 'OPENED_MISSING', 'USED', 'DAMAGED');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('BOOKS', 'GAMES_HOBBIES', 'CAMPING_OUTDOORS', 'TOOLS_GEAR', 'COOKING', 'CLEANING', 'ELECTRONICS', 'LIGHTS', 'FIRST_AID', 'EMERGENCY', 'CLOTHES', 'CORDAGE', 'TECH_MEDIA', 'MISC', 'BOOKS_MEDIA', 'ENTERTAINMENT', 'HOBBIES', 'OUTDOOR', 'TOOLS_HARDWARE', 'KITCHEN', 'HOUSEHOLD', 'LIGHTING', 'SAFETY', 'APPAREL', 'ROPES', 'COMPUTING', 'AUDIO', 'SPORTS_FITNESS', 'OFFICE', 'SEASONAL', 'AUTOMOTIVE', 'GARDEN', 'TOYS', 'HOME_GOODS', 'MISCELLANEOUS');

-- CreateEnum
CREATE TYPE "ItemSubcategory" AS ENUM ('BOOKS_NOVELS', 'BOOKS_REFERENCE', 'MEDIA_DVDS', 'MEDIA_MUSIC', 'GAMES_BOARD', 'GAMES_VIDEO', 'HOBBIES_CRAFTS', 'CAMPING_TENTS', 'CAMPING_SLEEPING', 'CAMPING_COOKING', 'TOOLS_HAND', 'TOOLS_POWER', 'TOOLS_FASTENERS', 'KITCHEN_APPLIANCES', 'KITCHEN_UTENSILS', 'CLEANING_SUPPLIES', 'HOUSEHOLD_CONSUMABLES', 'ELECTRONICS_COMPUTING', 'ELECTRONICS_AUDIO', 'ELECTRONICS_ACCESSORIES', 'LIGHTING_FLASHLIGHTS', 'LIGHTING_LAMPS', 'MEDICAL_FIRST_AID', 'SAFETY_EMERGENCY', 'CLOTHING_MENS', 'CLOTHING_WOMENS', 'CLOTHING_KIDS', 'CORDAGE_ROPE', 'CORDAGE_CARABINER', 'SPORTS_BALLS', 'SPORTS_FITNESS_EQUIPMENT', 'OFFICE_PAPER', 'OFFICE_EQUIPMENT', 'SEASONAL_DECORATIONS', 'AUTOMOTIVE_PARTS', 'GARDEN_TOOLS', 'TOYS_CHILDRENS', 'MISC_OTHER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "pending_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "reason" TEXT,
    "status" "PendingUserStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "racks" (
    "id" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rows" INTEGER NOT NULL DEFAULT 1,
    "cols" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "racks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slots" (
    "id" TEXT NOT NULL,
    "rackId" TEXT NOT NULL,
    "row" INTEGER NOT NULL,
    "col" INTEGER NOT NULL,
    "containerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "containers" (
    "id" TEXT NOT NULL,
    "type" TEXT,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "locationName" TEXT,
    "status" "ContainerStatus" NOT NULL DEFAULT 'ACTIVE',
    "containerTypeId" TEXT,
    "number" INTEGER,
    "currentSlotId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "containers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ItemStatus" NOT NULL DEFAULT 'IN_STORAGE',
    "condition" "ItemCondition",
    "category" "ItemCategory",
    "subcategory" "ItemSubcategory",
    "isbn" TEXT,
    "notes" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "expirationDate" TIMESTAMP(3),
    "containerId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "item_photos" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movements" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "itemId" TEXT,
    "action" TEXT NOT NULL,
    "fromContainerId" TEXT,
    "toContainerId" TEXT,
    "fromSlotId" TEXT,
    "toSlotId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "container_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "codePrefix" TEXT NOT NULL,
    "iconKey" TEXT,
    "length" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "topLength" INTEGER,
    "topWidth" INTEGER,
    "bottomLength" INTEGER,
    "bottomWidth" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "container_types_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "pending_users_email_key" ON "pending_users"("email");

-- CreateIndex
CREATE INDEX "racks_locationId_idx" ON "racks"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "slots_containerId_key" ON "slots"("containerId");

-- CreateIndex
CREATE INDEX "slots_rackId_idx" ON "slots"("rackId");

-- CreateIndex
CREATE INDEX "slots_containerId_idx" ON "slots"("containerId");

-- CreateIndex
CREATE UNIQUE INDEX "slots_rackId_row_col_key" ON "slots"("rackId", "row", "col");

-- CreateIndex
CREATE UNIQUE INDEX "containers_code_key" ON "containers"("code");

-- CreateIndex
CREATE UNIQUE INDEX "containers_currentSlotId_key" ON "containers"("currentSlotId");

-- CreateIndex
CREATE INDEX "containers_status_idx" ON "containers"("status");

-- CreateIndex
CREATE INDEX "containers_code_idx" ON "containers"("code");

-- CreateIndex
CREATE INDEX "containers_containerTypeId_idx" ON "containers"("containerTypeId");

-- CreateIndex
CREATE INDEX "items_containerId_idx" ON "items"("containerId");

-- CreateIndex
CREATE INDEX "items_status_idx" ON "items"("status");

-- CreateIndex
CREATE INDEX "items_category_idx" ON "items"("category");

-- CreateIndex
CREATE INDEX "item_photos_itemId_idx" ON "item_photos"("itemId");

-- CreateIndex
CREATE INDEX "movements_actorId_idx" ON "movements"("actorId");

-- CreateIndex
CREATE INDEX "movements_itemId_idx" ON "movements"("itemId");

-- CreateIndex
CREATE INDEX "movements_createdAt_idx" ON "movements"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "container_types_name_key" ON "container_types"("name");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "racks" ADD CONSTRAINT "racks_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "locations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_rackId_fkey" FOREIGN KEY ("rackId") REFERENCES "racks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slots" ADD CONSTRAINT "slots_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_containerTypeId_fkey" FOREIGN KEY ("containerTypeId") REFERENCES "container_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "containers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "item_photos" ADD CONSTRAINT "item_photos_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_fromContainerId_fkey" FOREIGN KEY ("fromContainerId") REFERENCES "containers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_toContainerId_fkey" FOREIGN KEY ("toContainerId") REFERENCES "containers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movements" ADD CONSTRAINT "movements_fromSlotId_fkey" FOREIGN KEY ("fromSlotId") REFERENCES "slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
