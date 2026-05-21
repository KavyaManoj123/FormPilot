/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `options` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `placeholder` on the `Field` table. All the data in the column will be lost.
  - You are about to drop the column `isPublished` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Form` table. All the data in the column will be lost.
  - You are about to drop the column `submittedAt` on the `Response` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Field` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Field" DROP COLUMN "createdAt",
DROP COLUMN "options",
DROP COLUMN "order",
DROP COLUMN "placeholder",
DROP COLUMN "type",
ADD COLUMN     "type" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Form" DROP COLUMN "isPublished",
DROP COLUMN "updatedAt",
ADD COLUMN     "published" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Response" DROP COLUMN "submittedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
