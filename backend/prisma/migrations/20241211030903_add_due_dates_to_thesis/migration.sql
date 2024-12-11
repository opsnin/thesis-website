/*
  Warnings:

  - You are about to drop the column `date` on the `Thesis` table. All the data in the column will be lost.
  - Added the required column `requestDueDate` to the `Thesis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thesisDueDate` to the `Thesis` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Thesis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "requestDueDate" TEXT NOT NULL DEFAULT '1970-01-01', -- Default value for existing rows
    "thesisDueDate" TEXT NOT NULL DEFAULT '1970-01-01', -- Default value for existing rows
    "description" TEXT NOT NULL,
    "addedBy" INTEGER,
    "requestedBy" INTEGER,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT,
    "lastUpdate" DATETIME,
    CONSTRAINT "Thesis_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Thesis_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "new_Thesis" ("addedBy", "approved", "description", "fileName", "id", "lastUpdate", "requestedBy", "submitted", "title", "requestDueDate", "thesisDueDate")
SELECT "addedBy", "approved", "description", "fileName", "id", "lastUpdate", "requestedBy", "submitted", "title", '1970-01-01', '1970-01-01' 
FROM "Thesis";

DROP TABLE "Thesis";

ALTER TABLE "new_Thesis" RENAME TO "Thesis";

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
