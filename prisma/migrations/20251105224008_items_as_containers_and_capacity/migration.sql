/*
  Warnings:

  - A unique constraint covering the columns `[currentSlotId]` on the table `items` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "container_types" ADD COLUMN     "capacity" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "currentSlotId" TEXT,
ADD COLUMN     "isContainer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "volume" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "items_currentSlotId_key" ON "items"("currentSlotId");

-- CreateIndex
CREATE INDEX "items_currentSlotId_idx" ON "items"("currentSlotId");

-- CreateIndex
CREATE INDEX "items_isContainer_idx" ON "items"("isContainer");

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_currentSlotId_fkey" FOREIGN KEY ("currentSlotId") REFERENCES "slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
