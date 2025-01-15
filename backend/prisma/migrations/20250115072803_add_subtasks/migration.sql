-- CreateTable
CREATE TABLE "Subtask" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "thesisId" INTEGER NOT NULL,
    CONSTRAINT "Subtask_thesisId_fkey" FOREIGN KEY ("thesisId") REFERENCES "Thesis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
