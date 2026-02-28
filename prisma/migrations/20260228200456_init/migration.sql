-- CreateTable
CREATE TABLE "Player" (
    "id" UUID NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoundResult" (
    "id" UUID NOT NULL,
    "roundId" INTEGER NOT NULL,
    "playerId" UUID NOT NULL,
    "wpm" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "correctChars" INTEGER NOT NULL,
    "totalChars" INTEGER NOT NULL,
    "finalText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoundResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoundResult_roundId_idx" ON "RoundResult"("roundId");

-- CreateIndex
CREATE INDEX "RoundResult_playerId_idx" ON "RoundResult"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "RoundResult_roundId_playerId_key" ON "RoundResult"("roundId", "playerId");

-- AddForeignKey
ALTER TABLE "RoundResult" ADD CONSTRAINT "RoundResult_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
