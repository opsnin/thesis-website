-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subtask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "submitted" BOOLEAN NOT NULL DEFAULT false,
    "fileName" TEXT,
    "thesisId" INTEGER NOT NULL,
    CONSTRAINT "Subtask_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Subtask" ("description", "id", "thesisId", "week") SELECT "description", "id", "thesisId", "week" FROM "Subtask";
DROP TABLE "Subtask";
ALTER TABLE "new_Subtask" RENAME TO "Subtask";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
