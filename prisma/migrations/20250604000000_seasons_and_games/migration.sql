-- CreateEnum
CREATE TYPE "SeasonStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('SCHEDULED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Season" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "status" "SeasonStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- Backfill: one active season per team
INSERT INTO "Season" ("id", "teamId", "label", "status", "startedAt")
SELECT
    'season_' || "id",
    "id",
    'Current season',
    'ACTIVE',
    CURRENT_TIMESTAMP
FROM "Team";

-- Add seasonId to TrainingSession
ALTER TABLE "TrainingSession" ADD COLUMN "seasonId" TEXT;

UPDATE "TrainingSession" ts
SET "seasonId" = 'season_' || ts."teamId";

ALTER TABLE "TrainingSession" ALTER COLUMN "seasonId" SET NOT NULL;

-- CreateTable Game
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "seasonId" TEXT NOT NULL,
    "gameDate" DATE NOT NULL,
    "gameTime" TEXT,
    "opponent" TEXT NOT NULL,
    "teamNotes" TEXT,
    "opponentNotes" TEXT,
    "status" "GameStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable GameAppearance
CREATE TABLE "GameAppearance" (
    "id" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "isPlaying" BOOLEAN NOT NULL DEFAULT false,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameAppearance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Season_teamId_status_idx" ON "Season"("teamId", "status");

-- CreateIndex
CREATE INDEX "TrainingSession_teamId_seasonId_kind_status_idx" ON "TrainingSession"("teamId", "seasonId", "kind", "status");

-- CreateIndex
CREATE INDEX "TrainingSession_teamId_seasonId_sessionDate_idx" ON "TrainingSession"("teamId", "seasonId", "sessionDate");

-- Drop old indexes if they exist (init migration names)
DROP INDEX IF EXISTS "TrainingSession_teamId_kind_status_idx";
DROP INDEX IF EXISTS "TrainingSession_teamId_sessionDate_idx";

-- CreateIndex
CREATE INDEX "Game_teamId_seasonId_gameDate_idx" ON "Game"("teamId", "seasonId", "gameDate");

-- CreateIndex
CREATE UNIQUE INDEX "GameAppearance_gameId_playerId_key" ON "GameAppearance"("gameId", "playerId");

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Game" ADD CONSTRAINT "Game_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Game" ADD CONSTRAINT "Game_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GameAppearance" ADD CONSTRAINT "GameAppearance_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "GameAppearance" ADD CONSTRAINT "GameAppearance_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
