-- CreateTable
CREATE TABLE "Thesis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "addedBy" INTEGER NOT NULL,
    CONSTRAINT "Thesis_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
