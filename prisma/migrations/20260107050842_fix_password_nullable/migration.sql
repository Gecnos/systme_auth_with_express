-- AlterTable
ALTER TABLE "LoginHistory" ADD COLUMN "loginMethod" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "emailVerifiedAt" DATETIME,
    "twoFactorSecret" TEXT,
    "twoFactorEnabledAt" DATETIME,
    "disabledAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "disabledAt", "email", "emailVerifiedAt", "firstName", "id", "lastName", "password", "twoFactorEnabledAt", "twoFactorSecret", "updatedAt") SELECT "createdAt", "disabledAt", "email", "emailVerifiedAt", "firstName", "id", "lastName", "password", "twoFactorEnabledAt", "twoFactorSecret", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
