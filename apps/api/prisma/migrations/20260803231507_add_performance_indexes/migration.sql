-- CreateIndex
CREATE INDEX "Match_published_startDate_idx" ON "Match"("published", "startDate");

-- CreateIndex
CREATE INDEX "News_published_publishedAt_idx" ON "News"("published", "publishedAt");

-- CreateIndex
CREATE INDEX "Registration_matchId_status_idx" ON "Registration"("matchId", "status");

-- CreateIndex
CREATE INDEX "Registration_matchId_squadId_idx" ON "Registration"("matchId", "squadId");

-- CreateIndex
CREATE INDEX "Squad_matchId_idx" ON "Squad"("matchId");

-- CreateIndex
CREATE INDEX "SquadRequest_registrationId_idx" ON "SquadRequest"("registrationId");
