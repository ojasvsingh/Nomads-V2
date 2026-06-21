-- CreateTable
CREATE TABLE "ExploreSession" (
    "id" SERIAL NOT NULL,
    "prompt" TEXT NOT NULL,
    "reply" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ExploreSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExploreSession" ADD CONSTRAINT "ExploreSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
