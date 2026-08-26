-- AlterTable
ALTER TABLE "Trip" DROP COLUMN "country",
DROP COLUMN "countryCode",
ADD COLUMN     "countryCodes" TEXT[];
