-- AlterTable
ALTER TABLE "containers" ADD COLUMN     "parentContainerId" TEXT;

-- CreateIndex
CREATE INDEX "containers_parentContainerId_idx" ON "containers"("parentContainerId");

-- AddForeignKey
ALTER TABLE "containers" ADD CONSTRAINT "containers_parentContainerId_fkey" FOREIGN KEY ("parentContainerId") REFERENCES "containers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
