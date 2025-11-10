/*
  Warnings:

  - Added the required column `description` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'new';

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'new';
