-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Thesis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "addedBy" INTEGER,
    "requestedBy" INTEGER,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Thesis_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Thesis_requestedBy_fkey" FOREIGN KEY ("requestedBy") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Thesis" ("addedBy", "approved", "date", "description", "id", "requestedBy", "title") SELECT "addedBy", "approved", "date", "description", "id", "requestedBy", "title" FROM "Thesis";
DROP TABLE "Thesis";
ALTER TABLE "new_Thesis" RENAME TO "Thesis";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
